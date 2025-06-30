#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env file
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key]) {
        process.env[key] = value.trim();
      }
    });
  }
} catch (error) {
  // Ignore .env loading errors
}

// Configuration
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const COMPLEXITY_THRESHOLD = 15; // Only explain files with complexity >= 15 / "Good" threshold (85 points) - files below are excellent
const MAX_FILES_TO_EXPLAIN = 3; // Max files per project to avoid API costs
const MAX_FILE_SIZE = 5000; // Max lines to send to Claude

if (!CLAUDE_API_KEY) {
  console.error('❌ CLAUDE_API_KEY environment variable required');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const excludeUtility = args.includes('--exclude-utility');
const projectName = args.find(arg => !arg.startsWith('--'));
const compareMode = args.includes('--compare'); // New flag for dual analysis
const clearCache = args.includes('--clear-cache'); // Force fresh analysis

// Projects to analyze
const PROJECTS = {
  small: [
    { name: 'lodash', repo: 'https://github.com/lodash/lodash.git', stars: '59k' },
    { name: 'chalk', repo: 'https://github.com/chalk/chalk.git', stars: '21k' },
    { name: 'uuid', repo: 'https://github.com/uuidjs/uuid.git', stars: '14k' },
  ],
  medium: [
    { name: 'express', repo: 'https://github.com/expressjs/express.git', stars: '65k' },
    { name: 'vue', repo: 'https://github.com/vuejs/core.git', stars: '46k' },
    { name: 'jest', repo: 'https://github.com/jestjs/jest.git', stars: '44k' },
  ],
  large: [
    { name: 'react', repo: 'https://github.com/facebook/react.git', stars: '227k' },
    { name: 'eslint', repo: 'https://github.com/eslint/eslint.git', stars: '25k' },
    // xlarge !
    { name: 'typescript', repo: 'https://github.com/microsoft/TypeScript.git', stars: '98k' },
  ]
};

// Directories
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');
const TEMP_DIR = path.join(projectRoot, 'temp-analysis');
const RESULTS_DIR = path.join(projectRoot, 'benchmark-results');
const CACHE_DIR = path.join(RESULTS_DIR, '.claude-cache');
const DOCS_BENCHMARKS_DIR = path.join(projectRoot, 'benchmarks');

// Create directories
[RESULTS_DIR, CACHE_DIR, DOCS_BENCHMARKS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function runCommand(command, cwd) {
  try {
    return execSync(command, { 
      cwd, 
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
      maxBuffer: 50 * 1024 * 1024
    });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function generateComplexityCacheKey(filePath, fileContent, complexity, projectContext, isTruncated, analysisContext = '') {
  // Create a unique key based on all parameters that affect the result
  const keyData = {
    filePath,
    fileHash: crypto.createHash('md5').update(fileContent).digest('hex'),
    complexity,
    threshold: COMPLEXITY_THRESHOLD,
    projectName: projectContext.name,
    projectDescription: projectContext.description,
    language: projectContext.language,
    isTruncated,
    analysisContext,
    promptVersion: '2.0' // Updated for architectural insights approach
  };
  
  return crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex');
}

function getCachedComplexityExplanation(cacheKey) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      
      // Check if cache is still valid (max 30 days)
      const cacheAge = Date.now() - cached.timestamp;
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      if (cacheAge < maxAge) {
        return cached.explanation;
      } else {
        // Cache expired, delete it
        fs.unlinkSync(cacheFile);
      }
    }
  } catch (error) {
    // If cache file is corrupted, delete it
    try {
      fs.unlinkSync(cacheFile);
    } catch (e) {
      // Ignore deletion errors
    }
  }
  
  return null;
}

function setCachedComplexityExplanation(cacheKey, explanation) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    const cacheData = {
      explanation,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error(`⚠️  Failed to cache explanation: ${error.message}`);
  }
}

function generateInsightCacheKey(projectName, fullResult, prodResult, delta) {
  // Create a unique key based on the comparison parameters
  const keyData = {
    projectName,
    fullScore: fullResult.analysis.score,
    fullGrade: fullResult.analysis.grade,
    prodScore: prodResult.analysis.score,
    prodGrade: prodResult.analysis.grade,
    delta,
    fullComplexity: fullResult.analysis.avgComplexity,
    prodComplexity: prodResult.analysis.avgComplexity,
    fullFiles: fullResult.analysis.totalFiles,
    prodFiles: prodResult.analysis.totalFiles,
    promptVersion: '2.0' // Updated for enhanced architectural insights prompt
  };
  
  return 'insight_' + crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex');
}

function getCachedInsight(cacheKey) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      
      // Check if cache is still valid (max 30 days)
      const cacheAge = Date.now() - cached.timestamp;
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      if (cacheAge < maxAge) {
        return cached.insight;
      } else {
        // Cache expired, delete it
        fs.unlinkSync(cacheFile);
      }
    }
  } catch (error) {
    // If cache file is corrupted, delete it
    try {
      fs.unlinkSync(cacheFile);
    } catch (e) {
      // Ignore deletion errors
    }
  }
  
  return null;
}

function setCachedInsight(cacheKey, insight) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    const cacheData = {
      insight,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error(`⚠️  Failed to cache insight: ${error.message}`);
  }
}

// Generic cache functions for API responses
function getCachedDuplicationExplanationApiResponse(cacheKey) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      
      // Check if cache is still valid (max 30 days)
      const cacheAge = Date.now() - cached.timestamp;
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      
      if (cacheAge < maxAge) {
        return cached.response;
      } else {
        // Cache expired, delete it
        fs.unlinkSync(cacheFile);
      }
    }
  } catch (error) {
    // If cache file is corrupted, delete it
    try {
      fs.unlinkSync(cacheFile);
    } catch (e) {
      // Ignore deletion errors
    }
  }
  
  return null;
}

function setCachedDuplicationExplanationApiResponse(cacheKey, response) {
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  try {
    const cacheData = {
      response,
      timestamp: Date.now(),
      version: '1.0'
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error(`⚠️  Failed to cache API response: ${error.message}`);
  }
}

// Cache functions for scoring explanations
function getCachedScoringExplanationApiResponse(cacheKey) {
  return getCachedDuplicationExplanationApiResponse(cacheKey);
}

function setCachedScoringExplanationApiResponse(cacheKey, response) {
  setCachedDuplicationExplanationApiResponse(cacheKey, response);
}

async function callClaudeWithRetry(requestBody, filePath, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`    🌐 Calling Claude API for ${filePath}...`);
      console.log(`    🔍 Request size: ${JSON.stringify(requestBody).length} chars`);
      // Rate limiting - wait 2.5 seconds between API calls to stay within 50 requests/minute
      // Add a sleight delay to avoid hitting API rate limits
      console.log(`    ⏳ Waiting before next API call...`);
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 seconds delay
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        return await response.json();
      }

      // Handle rate limit (429) with optimized backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        let delay;
        
        if (retryAfter) {
          // Use retry-after header directly (it's already in seconds according to docs)
          delay = parseInt(retryAfter) * 1000;
        } else {
          // Fallback: progressive delays 5s, 10s, 15s (much better than exponential)
          delay = 5000 * attempt;
        }
        
        // Small jitter to avoid thundering herd (max 2s)
        const jitter = Math.random() * 2000;
        const totalDelay = delay + jitter;
        
        console.log(`    ⏳ Rate limit hit for ${filePath}, retrying in ${(totalDelay/1000).toFixed(1)}s (attempt ${attempt}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, totalDelay));
          continue;
        }
      }

      // For other errors, throw immediately
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      
      // Only retry on rate limit errors
      if (error.message.includes('429') && attempt < maxRetries) {
        const delay = 5000 * attempt; // Progressive delays: 5s, 10s, 15s
        const jitter = Math.random() * 2000; // 0-2s jitter
        const totalDelay = delay + jitter;
        
        console.log(`    ⏳ Rate limit error for ${filePath}, retrying in ${(totalDelay/1000).toFixed(1)}s (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
        continue;
      }
      
      // For non-rate-limit errors, fail immediately
      throw error;
    }
  }
  
  throw lastError;
}

async function explainFileComplexityArchitecture(filePath, fileContent, complexity, projectContext, isTruncated, analysisContext = '') {
  // Check cache first - include analysis context in cache key for comparison mode
  const cacheKey = generateComplexityCacheKey(filePath, fileContent, complexity, projectContext, isTruncated, analysisContext);
  const cachedExplanation = !clearCache ? getCachedComplexityExplanation(cacheKey) : null;
  
  if (cachedExplanation) {
    console.log(`    💾 Using cached complexity explanation for ${filePath}`);
    return { explanation: cachedExplanation, fromCache: true };
  }
  
  const truncationNote = isTruncated ? `\n\nIMPORTANT: This file has been truncated to ${MAX_FILE_SIZE} lines for analysis. Focus on the visible patterns and note if key logic might be missing.` : '';
  const contextNote = analysisContext ? `\n\nANALYSIS CONTEXT: ${analysisContext}` : '';
  
  const prompt = `Analyze this ${projectContext.language} file from **${projectContext.name}** (${projectContext.description}) and provide architectural insights about its complexity.

**Context**: ${projectContext.name} is an industry-leading open-source project used by millions of developers worldwide. This analysis should focus on what teams can learn from their architectural decisions.

**File Details:**
- Path: ${filePath}
- Complexity: ${complexity} (threshold: ${COMPLEXITY_THRESHOLD})
- Project Type: ${getProjectType(projectContext.name.toLowerCase())}${truncationNote}${contextNote}

**File content:**
\`\`\`${projectContext.language}
${fileContent}
\`\`\`

**Analysis Framework:**
Provide a constructive, educational analysis that explains the architectural patterns and design decisions behind this complexity.

**Required Sections:**

1. **Architectural Pattern** (What specific pattern or approach drives the complexity)
2. **Business Purpose** (What this code achieves and why it's important to ${projectContext.name})
3. **Complexity Analysis** (Specific technical patterns: switch logic, conditional flows, state management, parsing, etc.)
4. **Design Trade-offs** (What this complexity enables vs alternatives):
   - **Performance Benefits**: Speed, memory, compatibility gains
   - **Functionality Requirements**: Features that necessitate this approach
   - **Maintainability Considerations**: How the team manages this complexity
5. **Architectural Lessons** (What teams can learn):
   - When similar complexity is warranted in their projects
   - How to structure complex code for maintainability
   - Alternative approaches and their trade-offs

**Summary Format:**
- **Pattern**: [Specific architectural pattern, e.g. "State machine with 50+ transitions", "Recursive descent parser", "Performance-optimized algorithm"]
- **Purpose**: [Core functionality this enables]
- **Complexity Level**: [Algorithmic/Performance/Compatibility/Structural] 
- **Team Lesson**: [Specific actionable insight for development teams]

**Tone**: Analytical and educational. Focus on learning from industry-proven architecture rather than judging complexity as "good" or "bad".

Maximum 450 words. Emphasize architectural insights and practical lessons.`;

  try {
  
    
    const requestBody = {
      model: 'claude-sonnet-4-0',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    const data = await callClaudeWithRetry(requestBody, filePath);

    let explanation = data.content[0].text;
    
    // Appliquer la vérification de cohérence
    explanation = ensureConsistency(explanation);
    
    // Log optionnel pour debug
    if (process.env.DEBUG_CONSISTENCY === 'true') {
      console.log(`    ✅ Consistency check applied for ${filePath}`);
    }
    
    // Cache l'explication cohérente
    setCachedComplexityExplanation(cacheKey, explanation);
    
    return { explanation, fromCache: false };
  } catch (error) {
    console.error(`❌ Failed to explain ${filePath}: ${error.message}`);
    // Don't cache API errors - allow retry on next run
    return { explanation: `Error getting explanation: ${error.message}`, fromCache: false };
  }
}

function ensureConsistency(explanation) {
  // Extraire les sections clés de l'explication
  const sections = {
    mainCauses: extractSection(explanation, 'Main causes', 'Business context'),
    improvements: extractSection(explanation, 'Improvement suggestions', 'Summary'),
    summary: extractSection(explanation, 'Summary', null),
    justification: extractJustificationLevel(explanation)
  };

  // BINARY JUSTIFICATION RULES - Clear, explicit, and extensible
  // Each rule forces either "Yes" (justified) or "No" (not justified)
  // 
  // LOGIC:
  // - If ANY structural pattern is detected → Force "No" (can be refactored)
  // - If ANY algorithmic necessity is detected → Force "Yes" (inherent complexity)
  // - Default fallback: "No" (conservative approach)
  //
  // EXTENSIBILITY: Add new patterns to cover more complexity scenarios
  const consistencyRules = [
    // FORCE "NO" (Not Justified) - Structural/Architectural Issues
    {
      name: 'structural_refactorable',
      description: 'Code complexity that can be resolved with design patterns',
      patterns: [
        // Design pattern indicators (means complexity can be structured)
        /strategy pattern/i, /command pattern/i, /state machine/i, /factory pattern/i,
        /visitor pattern/i, /observer pattern/i, /decorator pattern/i,
        
        // Structural problems (can be decomposed)
        /monolithic/i, /god (function|class)/i, /violates single responsibility/i,
        /too many responsibilities/i, /poor separation of concerns/i,
        
        // Switch/conditional complexity (replaceable with patterns)
        /switch statement.*cases/i, /large switch/i, /nested (if|loop|conditional)/i,
        /deeply nested/i, /multiple branches/i,
        
        // Refactoring suggestions (means it can be improved)
        /extract.*function/i, /break.*down/i, /modularize/i, /split.*into/i,
        /decompose/i, /separate.*concerns/i
      ],
      verdict: 'No',
      reason: 'structural issues resolvable with design patterns'
    },
    
    {
      name: 'artificial_reducible',
      description: 'Complexity that is artificial or easily reducible',
      patterns: [
        /largely artificial/i, /artificially inflates/i, /unnecessary complexity/i,
        /over-engineered/i, /easily reduced/i, /simple refactor/i,
        /trivial to improve/i, /could be reduced by [3-9]\d%/i, // 30-99% reduction
        /replace with lookup table/i, /redundant/i, /repetitive/i
      ],
      verdict: 'No',
      reason: 'artificial complexity easily reducible through refactoring'
    },
    
    // FORCE "YES" (Justified) - Algorithmic Necessity
    {
      name: 'algorithmic_inherent',
      description: 'Complexity inherent to algorithms that cannot be simplified',
      patterns: [
        // Core algorithms (inherently complex)
        /parsing algorithm/i, /compiler logic/i, /lexer/i, /tokenizer/i,
        /interpreter/i, /ast (manipulation|traversal)/i,
        
        // Mathematical/cryptographic (irreducible complexity)
        /cryptographic/i, /mathematical algorithm/i, /graph algorithm/i,
        /optimization algorithm/i, /sorting algorithm/i, /search algorithm/i,
        
        // Language/format processing (inherent complexity)
        /regex engine/i, /finite state machine/i, /automaton/i,
        /protocol implementation/i
      ],
      verdict: 'Yes', 
      reason: 'inherent algorithmic complexity that cannot be simplified'
    },
    
    {
      name: 'performance_constraints', 
      description: 'Performance-critical code where complexity serves optimization',
      patterns: [
        /performance critical/i, /optimization required/i, /hot path/i,
        /performance sensitive/i, /tight loop/i, /high frequency/i,
        /memory optimization/i, /cache optimization/i, /vectorization/i
      ],
      verdict: 'Yes',
      reason: 'performance constraints require complex optimized implementation'
    },
    
    {
      name: 'compatibility_necessity',
      description: 'Complexity required for compatibility or standards compliance',
      patterns: [
        /cross-platform compatibility/i, /backward compatibility/i,
        /legacy support/i, /multiple environments/i, /browser compatibility/i,
        /standard compliance/i, /specification requirement/i
      ],
      verdict: 'Yes',
      reason: 'compatibility requirements necessitate complex implementation'
    }
  ];

  // Analyser le contenu avec les règles
  const appliedRules = [];
  let finalJustification = sections.justification;
  
  // Apply binary rules: any matching rule forces its verdict
  consistencyRules.forEach(rule => {
    const contentToCheck = sections.mainCauses + ' ' + sections.improvements + ' ' + sections.summary;
    const matches = rule.patterns.some(pattern => pattern.test(contentToCheck));
    
    if (matches) {
      appliedRules.push(rule);
      finalJustification = rule.verdict; // Direct assignment - no ambiguity
    }
  });

  // Vérifier la cohérence avec les suggestions d'amélioration (logique plus stricte)
  const hasConcreteImprovements = /Extract|Split|Replace|Refactor|Break down|Separate|Use strategy pattern|Apply.*pattern|State machine|Command pattern/i.test(sections.improvements);
  const hasNoImprovements = /None|No improvements|Already optimal|inherent.*complexity/i.test(sections.improvements);
  
  // Si des améliorations concrètes sont suggérées → pas justified
  if (hasConcreteImprovements && finalJustification === 'Yes') {
    finalJustification = 'No';
    appliedRules.push({
      name: 'concrete_improvements',
      reason: 'concrete refactoring patterns were suggested'
    });
  }
  
  // Si aucune amélioration suggérée → justified
  if (hasNoImprovements && finalJustification === 'No') {
    finalJustification = 'Yes';
    appliedRules.push({
      name: 'no_improvements',
      reason: 'no improvements possible - inherent complexity'
    });
  }

  // Si la justification a changé, mettre à jour l'explication
  if (finalJustification !== sections.justification) {
    return updateExplanationJustification(explanation, finalJustification, appliedRules);
  }
  
  return explanation;
}

// Fonctions auxiliaires

function extractSection(text, startMarker, endMarker) {
  const startRegex = new RegExp(`\\*\\*${startMarker}.*?\\*\\*(.*)`, 'is');
  const match = text.match(startRegex);
  
  if (!match) return '';
  
  let content = match[1];
  
  if (endMarker) {
    const endRegex = new RegExp(`\\*\\*${endMarker}.*?\\*\\*`, 'is');
    const endMatch = content.match(endRegex);
    if (endMatch) {
      content = content.substring(0, endMatch.index);
    }
  }
  
  return content.trim();
}

function extractJustificationLevel(explanation) {
  // Chercher dans le résumé (binary: Yes/No only)
  const summaryMatch = explanation.match(/\*\*Justified\*\*:\s*\[?(Yes|No)\]?/i);
  if (summaryMatch) {
    return summaryMatch[1];
  }
  
  // Chercher dans la section justification (binary mapping)
  const justificationMatch = explanation.match(/Complexity justification[^:]*:.*?(Justified|Not Justified)/is);
  if (justificationMatch) {
    const verdict = justificationMatch[1];
    return verdict === 'Justified' ? 'Yes' : 'No';
  }
  
  // Default: strict binary system defaults to "No"
  return 'No';
}

// Note: constrainJustification removed - using direct assignment in binary system

function updateExplanationJustification(explanation, newJustification, appliedRules) {
  // Préparer le message de cohérence
  const consistencyNote = appliedRules.length > 0 
    ? ` (adjusted for consistency: ${appliedRules[0].reason})`
    : '';
  
  // Note: justificationMap removed - using direct text in switch statement
  
  // Mettre à jour dans le résumé (binary format)
  let updated = explanation.replace(
    /(\*\*Justified\*\*:\s*)\[?(?:Yes|No)\]?([^\n]*)/i,
    `$1[${newJustification}]${consistencyNote}`
  );
  
  // Mettre à jour dans la section complexity justification si elle existe
  const complexitySection = extractSection(explanation, 'Complexity justification', 'Improvement suggestions');
  if (complexitySection) {
    // Créer un nouveau texte de justification cohérent
    let newJustificationText = '';
    
    switch(newJustification) {
      case 'Yes':
        newJustificationText = 'The complexity is fully justified by algorithmic necessity, performance constraints, or compatibility requirements that cannot be simplified without losing essential functionality.';
        break;
      case 'No':
        newJustificationText = 'The complexity is not justified. This is a structural/architectural issue that can be resolved through design patterns and refactoring without losing functionality.';
        break;
    }
    
    // Remplacer la section
    updated = updated.replace(
      /(\*\*Complexity justification\*\*:)[^*]*/s,
      `$1 ${newJustificationText}\n`
    );
  }
  
  // Ajouter une note de cohérence à la fin si des règles ont été appliquées
  if (appliedRules.length > 0 && process.env.DEBUG_CONSISTENCY === 'true') {
    updated += `\n\n_[Consistency check: Justification adjusted from original assessment due to: ${appliedRules.map(r => r.name).join(', ')}]_`;
  }
  
  return updated;
}

// Note: debugConsistency removed - debug functionality not used in production

function getProjectContext(projectName) {
  const contexts = {
    'lodash': { name: 'lodash', description: 'JavaScript utility library', language: 'javascript' },
    'chalk': { name: 'chalk', description: 'Terminal string styling library', language: 'javascript' },
    'uuid': { name: 'uuid', description: 'UUID generation library', language: 'javascript' },
    'express': { name: 'express', description: 'Fast web framework for Node.js', language: 'javascript' },
    'vue': { name: 'Vue.js', description: 'Progressive JavaScript framework', language: 'typescript' },
    'jest': { name: 'Jest', description: 'JavaScript testing framework', language: 'javascript' },
    'react': { name: 'React', description: 'JavaScript library for building user interfaces', language: 'javascript' },
    'typescript': { name: 'TypeScript', description: 'TypeScript language compiler', language: 'typescript' },
    'eslint': { name: 'ESLint', description: 'JavaScript linter', language: 'javascript' }
  };
  
  return contexts[projectName] || { name: projectName, description: 'JavaScript/TypeScript project', language: 'javascript' };
}

function getProjectType(projectName) {
  const types = {
    'typescript': 'language compiler',
    'eslint': 'code analysis tool',
    'react': 'UI framework',
    'vue': 'frontend framework', 
    'express': 'backend framework',
    'jest': 'testing framework',
    'lodash': 'utility library',
    'chalk': 'utility library',
    'uuid': 'utility library'
  };
  
  return types[projectName] || 'development tool';
}

async function analyzeProjectWithExplanations(project, category, excludeMode = false, comparisonContext = null) {
  const startTime = Date.now();
  const modeLabel = excludeMode ? ' (Production Only)' : ' (Full Codebase)';
  console.log(`\n📊 Analyzing ${project.name}${modeLabel} with explanations...`);
  
  try {
    // Clean up any existing temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    
    // Clone the repository
    console.log(`  📥 Cloning repository...`);
    runCommand(`git clone --depth 1 ${project.repo} "${TEMP_DIR}"`);
    
    // Run InsightCode analysis
    console.log(`  🔍 Running analysis...`);
    const analysisStartTime = Date.now();
    const excludeFlag = excludeMode ? ' --exclude-utility' : '';
    const analysisOutput = runCommand(`insightcode analyze "${TEMP_DIR}" --json${excludeFlag}`, process.cwd());
    const analysis = JSON.parse(analysisOutput);
    const analysisTime = Date.now() - analysisStartTime;
    
    // MODIFICATION : Extraire les statistiques détaillées des issues
    const issueStats = {
      total: 0,
      byType: { complexity: 0, duplication: 0, size: 0 },
      bySeverity: { high: 0, medium: 0, low: 0 },
      topIssues: []
    };
    
    analysis.files.forEach(file => {
      file.issues.forEach(issue => {
        issueStats.total++;
        if (issueStats.byType[issue.type] !== undefined) {
          issueStats.byType[issue.type]++;
        }
        if (issueStats.bySeverity[issue.severity] !== undefined) {
          issueStats.bySeverity[issue.severity]++;
        }
      });
    });
    
    // Garder les top issues pour le contexte
    issueStats.topIssues = [];
    for (const file of (analysis.topFiles || [])) {
      for (const issue of file.issues) {
        if (issueStats.topIssues.length < 5) {
          issueStats.topIssues.push({ ...issue, file: file.path.replace(/^temp-analysis\//, '') });
        }
      }
    }
    
    // High complexity files from topIssues
    const topIssues = issueStats.topIssues || [];
    const complexFiles = topIssues
      .filter(issue => issue.type === 'complexity' && issue.value >= COMPLEXITY_THRESHOLD)
      .slice(0, MAX_FILES_TO_EXPLAIN)
      .map(issue => ({
        path: issue.file.replace(/^temp-analysis\//, ''),
        complexity: issue.value, // ou extrais la valeur réelle si tu l’exportes
        fullPath: path.join(TEMP_DIR, issue.file)
      }));

    console.log(`  🧠 Found ${complexFiles.length} complex files to explain...`);
    
    // Get explanations from Claude
    const explanations = [];
    const projectContext = getProjectContext(project.name);
    
    for (const file of complexFiles) {
      console.log(`  📝 Explaining ${file.path} (complexity: ${file.complexity})...`);
      
      try {
        const fileContent = fs.readFileSync(file.fullPath, 'utf-8');
        const lines = fileContent.split('\n');
        
        // Truncate very large files
        const isTruncated = lines.length > MAX_FILE_SIZE;
        const truncatedContent = isTruncated 
          ? lines.slice(0, MAX_FILE_SIZE).join('\n') + `\n\n// ... (file truncated from ${lines.length} to ${MAX_FILE_SIZE} lines for analysis)`
          : fileContent;
        
        // Create analysis context for comparison mode
        let analysisContext = '';
        if (comparisonContext) {
          const { fullGrade, fullScore, prodGrade, prodScore } = comparisonContext;
          if (excludeMode) {
            analysisContext = `This file is part of the production-only analysis where the overall score drops from ${fullGrade} (${fullScore}) to ${prodGrade} (${prodScore}). Focus on how production code complexity is more visible without tests/examples masking it.`;
          } else {
            analysisContext = `This file is part of the full codebase analysis where the overall score is ${fullGrade} (${fullScore}), but drops to ${prodGrade} (${prodScore}) in production-only mode. Consider how tests/examples may be hiding core complexity.`;
          }
        }
        
        const result = await explainFileComplexityArchitecture(
          file.path, 
          truncatedContent, 
          file.complexity, 
          projectContext,
          isTruncated,
          analysisContext
        );
        
        explanations.push({
          file: file.path,
          complexity: file.complexity,
          explanation: result.explanation,
          fileSize: lines.length,
          fromCache: result.fromCache
        });
      } catch (error) {
        console.error(`    ❌ Error reading ${file.path}: ${error.message}`);
        explanations.push({
          file: file.path,
          complexity: file.complexity,
          explanation: `Error reading file: ${error.message}`,
          fileSize: 0,
          fromCache: false
        });
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`  ✅ Completed in ${(duration / 1000).toFixed(1)}s (InsightCode: ${(analysisTime / 1000).toFixed(1)}s, Explanations: ${((duration - analysisTime) / 1000).toFixed(1)}s)`);
    
    return {
      project: project.name,
      repo: project.repo,
      stars: project.stars,
      category,
      mode: excludeMode ? 'production-only' : 'full',
      analysis: {
        totalFiles: analysis.summary.totalFiles,
        totalLines: analysis.summary.totalLines,
        avgComplexity: analysis.summary.avgComplexity,
        avgDuplication: analysis.summary.avgDuplication,
        score: analysis.score,
        grade: analysis.grade
      },
      issueStats, // NOUVEAU : Statistiques détaillées
      explanations,
      duration,
      insightcodeTime: analysisTime
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return {
      project: project.name,
      repo: project.repo,
      stars: project.stars,
      category,
      mode: excludeMode ? 'production-only' : 'full',
      error: error.message,
      explanations: [],
      duration: Date.now() - startTime,
      insightcodeTime: 0
    };
  } finally {
    // Clean up
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

async function generateProjectInsightWithClaude(projectName, fullResult, prodResult, delta) {
  const projectContext = getProjectContext(projectName);
  
  // Generate cache key for insights
  const insightCacheKey = generateInsightCacheKey(projectName, fullResult, prodResult, delta);
  const cachedInsight = !clearCache ? getCachedInsight(insightCacheKey) : null;
  
  if (cachedInsight) {
    console.log(`    💾 Using cached insight for ${projectName}`);
    return cachedInsight;
  }
  
  // Get code snippets from highest complexity files for context
  let codeContext = '';
  
  // Find the most complex files from both analyses
  const topComplexFiles = [];
  
  if (fullResult.explanations && fullResult.explanations.length > 0) {
    const topFullFile = fullResult.explanations.reduce((prev, curr) => 
      curr.complexity > prev.complexity ? curr : prev
    );
    topComplexFiles.push({ ...topFullFile, mode: 'full' });
  }
  
  if (prodResult.explanations && prodResult.explanations.length > 0) {
    const topProdFile = prodResult.explanations.reduce((prev, curr) => 
      curr.complexity > prev.complexity ? curr : prev
    );
    // Only add if it's a different file or adds context
    if (!topComplexFiles.find(f => f.file === topProdFile.file)) {
      topComplexFiles.push({ ...topProdFile, mode: 'production' });
    }
  }
  
  // Extract key complexity patterns from explanations for context
  if (topComplexFiles.length > 0) {
    codeContext = '\n\nKey Complexity Patterns Found:\n';
    topComplexFiles.forEach(file => {
      // Extract main causes and patterns from the explanation
      const explanation = file.explanation || '';
      const mainCausesMatch = explanation.match(/Main causes[^#]*(.*?)(?=###|##|$)/s);
      const patternsMatch = explanation.match(/Key contributing patterns[^#]*(.*?)(?=###|##|$)/s);
      
      if (mainCausesMatch || patternsMatch) {
        codeContext += `\n${file.file} (complexity: ${file.complexity}, ${file.mode} analysis):\n`;
        if (mainCausesMatch) {
          codeContext += `  Main causes: ${mainCausesMatch[1].trim().substring(0, 200)}...\n`;
        }
        if (patternsMatch) {
          codeContext += `  Patterns: ${patternsMatch[1].trim().substring(0, 200)}...\n`;
        }
      }
    });
  }
  
  const prompt = `Analyze the architectural implications of this code quality comparison for **${projectName}** (${projectContext.description}):

**Quality Impact Analysis:**
- Full Codebase: ${fullResult.analysis.grade} (${fullResult.analysis.score}/100) - ${fullResult.analysis.totalFiles.toLocaleString()} files, ${fullResult.analysis.avgComplexity} avg complexity
- Production Only: ${prodResult.analysis.grade} (${prodResult.analysis.score}/100) - ${prodResult.analysis.totalFiles.toLocaleString()} files, ${prodResult.analysis.avgComplexity} avg complexity
- **Delta: ${delta > 0 ? '+' : ''}${delta} points** (${fullResult.analysis.totalFiles - prodResult.analysis.totalFiles} files excluded)

**Project Context:** ${projectContext.name} is a foundational ${getProjectType(projectName)} serving millions of developers worldwide.${codeContext}

Generate a **specific architectural insight** (45-60 words) explaining what this comparison reveals about ${projectName}'s design decisions and what teams can learn from it.

**Focus Areas by Project Type:**
- **Language Infrastructure** (TypeScript, ESLint): Compiler architecture, parsing complexity, tooling design
- **Frontend Frameworks** (React, Vue): Component architecture, state management, rendering optimization  
- **Backend Frameworks** (Express): API design, middleware architecture, plugin systems
- **Testing Tools** (Jest): Cross-platform compatibility, mock systems, assertion architecture
- **Utility Libraries** (lodash, chalk): Performance optimization, API design, backwards compatibility

**Tone & Requirements:**
- Constructive and analytical (not critical)
- Focus on architectural lessons and design decisions
- Explain WHY the delta exists in terms of project architecture
- Reference specific technical patterns when possible
- End with a concrete lesson for development teams

**Format:** "🟢/🟡/🔴 [Architectural Theme]: [Specific analysis of ${projectName}'s architecture and design decisions]. **Lesson**: [Actionable insight for teams]."

**Icons:**
🟢 if delta >= +5 (production architecture is cleaner/more focused)
🟡 if delta between -5 and +5 (balanced architecture across codebase)  
🔴 if delta <= -5 (production code shows architectural complexity issues)`;

  try {
    console.log(`    🧠 Generating insight for ${projectName} (delta: ${delta})...`);
    
    const requestBody = {
      model: 'claude-sonnet-4-0',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    const data = await callClaudeWithRetry(requestBody, `insight-${projectName}`);
    const insight = data.content[0].text.trim();
    
    // Cache the insight
    setCachedInsight(insightCacheKey, insight);
    
    return insight;
    
  } catch (error) {
    console.error(`❌ Failed to generate insight for ${projectName}: ${error.message}`);
    // Fallback to simple categorization
    if (delta >= 5) {
      return `🟢 Test Overhead: Production code cleaner than test/utility files`;
    } else if (delta >= -5) {
      return `🟡 Balanced: Consistent complexity across codebase`;
    } else {
      return `🔴 Hidden Complexity: Production code has significant complexity issues`;
    }
  }
}

async function generateComparisonTable(fullResults, productionResults) {
  let markdown = `## Full Codebase vs Production Only Analysis Comparison

| Project | Stars | Full Codebase Analysis | Production Only | Delta | Insight |
|---------|-------|---------------|-----------------|-------|----------------|
`;

  const projectNames = [...new Set([...fullResults.map(r => r.project), ...productionResults.map(r => r.project)])];
  
  for (const projectName of projectNames) {
    const fullResult = fullResults.find(r => r.project === projectName && !r.error);
    const prodResult = productionResults.find(r => r.project === projectName && !r.error);
    
    if (fullResult && prodResult) {
      const delta = prodResult.analysis.score - fullResult.analysis.score;
      const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
      
      // Generate Claude-powered insight
      const insight = await generateProjectInsightWithClaude(projectName, fullResult, prodResult, delta);
      
      const stars = fullResult.stars || prodResult.stars;
      markdown += `| ${projectName} | ${stars} | **${fullResult.analysis.grade}** (${fullResult.analysis.score}) | **${prodResult.analysis.grade}** (${prodResult.analysis.score}) | ${deltaStr} | ${insight} |\n`;
      
      // Rate limiting between insight generations - 2.5s to stay within API limits
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }
  
  return markdown;
}

async function generateExplanationReport(results, comparisonTable = '') {
  const date = new Date().toISOString().split('T')[0];
  const isComparison = comparisonTable !== '';
  const analysisType = isComparison ? 'Full codebase including tests/examples vs production code only' : (excludeUtility ? 'Production code only' : 'Full codebase including tests/examples');
  const analysisFlag = excludeUtility ? ' (with --exclude-utility)' : '';
  
  // For comparison mode, detect duplicate explanations
  const sharedExplanations = new Map();
  if (isComparison) {
    const allExplanations = results.flatMap(r => r.explanations || []);
    const explanationGroups = new Map();
    
    allExplanations.forEach(exp => {
      const key = `${exp.file}-${exp.complexity}`;
      if (!explanationGroups.has(key)) {
        explanationGroups.set(key, []);
      }
      explanationGroups.get(key).push(exp);
    });
    
    explanationGroups.forEach((group, key) => {
      if (group.length > 1) {
        // Check if explanations are actually identical
        const firstExplanation = group[0].explanation;
        if (group.every(exp => exp.explanation === firstExplanation)) {
          sharedExplanations.set(key, firstExplanation);
        }
      }
    });
  }
  
  // If this is a comparison, halve the project count for summary
  const projectCount = comparisonTable !== '' ? Math.round(results.length / 2) : results.length;

  let markdown = `# InsightCode Benchmark Explanations - ${analysisType}
## Methodology
- **Date**: ${date}
- **InsightCode Version**:  ${getInsightCodeVersion()}
- **Analysis Context**: ${analysisType}${analysisFlag}
- **Total Projects Analyzed**: ${projectCount} 
- **Complexity Threshold**: ${COMPLEXITY_THRESHOLD}+ (for explanations)
- **Analysis Method**: Automated complexity analysis with detailed explanations
- **Repository Method**: Fresh clone, default settings, no modifications

> ⚠️ **Important Limitation**
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.

## Scoring Algorithm and Thresholds

### Overall Score Calculation
The final score (0-100) is calculated using a weighted average of three metrics:
\`\`\`
Score = (Complexity Score × 40%) + (Duplication Score × 30%) + (Maintainability Score × 30%)
\`\`\`

### Metric Calculations and Thresholds

#### 1. Cyclomatic Complexity Score (40% weight)
Measures code complexity based on control flow paths:
- **≤ 10**: 100 points (Excellent - simple, linear code)
- **≤ 15**: 85 points (Good - moderate branching)
- **≤ 20**: 65 points (Acceptable - complex but manageable)
- **≤ 30**: 40 points (Poor - difficult to understand)
- **≤ 50**: 20 points (Very Poor - highly complex)
- **> 50**: Max(5, 20 - (complexity - 50) / 20) (Critical)

#### 2. Code Duplication Score (30% weight)
Percentage of duplicated code blocks using normalized hashing:

**Detection Algorithm:**
- **Block Size**: 5 consecutive lines (sliding window)
- **Normalization**: Variable names → VAR, strings → STRING, numbers → NUM
- **Hashing**: MD5 hash of normalized blocks
- **Filtering**: Blocks must be >20 chars and >5 tokens after normalization
- **Matching**: Exact hash matches across all files
- **Accuracy**: ~85% (conservative approach to avoid false positives)

**Scoring Thresholds:**
- **≤ 3%**: 100 points (Excellent - industry leader level)
- **≤ 8%**: 85 points (Good - industry standard)
- **≤ 15%**: 65 points (Acceptable - pragmatic threshold)
- **≤ 30%**: 40 points (Poor - needs attention)
- **≤ 50%**: 20 points (Very Poor - high duplication)
- **> 50%**: Max(5, 20 - (duplication - 50) / 10) (Critical)

#### 3. Maintainability Score (30% weight)
Combines file size and function count metrics:
\`\`\`
Maintainability = (Size Score + Function Score) / 2 - Extreme File Penalty
\`\`\`

**File Size Score (average lines per file):**
- **≤ 200**: 100 points (Optimal size)
- **≤ 300**: 85 points (Good)
- **≤ 400**: 70 points (Acceptable)
- **≤ 500**: 50 points (Large)
- **≤ 750**: 30 points (Very Large)
- **> 750**: Max(10, 30 - (avgLoc - 750) / 50)

**Function Count Score (average functions per file):**
- **≤ 10**: 100 points (Well-focused)
- **≤ 15**: 85 points (Good)
- **≤ 20**: 70 points (Acceptable)
- **≤ 30**: 50 points (Too many responsibilities)
- **> 30**: Max(10, 50 - (avgFunctions - 30) × 2)

**Extreme File Penalty:**
- Files > 1000 lines: -10 points
- Files > 2000 lines: -20 points

### Grade Mapping
- **A**: 90-100 (Excellent maintainability)
- **B**: 80-89 (Good, production-ready)
- **C**: 70-79 (Acceptable, some refactoring needed)
- **D**: 60-69 (Poor, significant refactoring recommended)
- **F**: 0-59 (Critical, major architectural issues)

${comparisonTable}

## Results Summary

| Project | Stars | Category | Mode | Files | Lines | Score | Grade | Complexity | Duplication | InsightCode Analysis | Explained |
|---------|-------|----------|------|-------|-------|-------|-------|------------|-------------|---------------------|-----------|
`;

  // Add results table
  results.forEach(r => {
    if (!r.error) {
      const mode = r.mode || 'full';
      const insightcodeTime = r.insightcodeTime ? (r.insightcodeTime / 1000).toFixed(1) : 'N/A';
      const insightcodeLinesPerSec = r.insightcodeTime ? Math.round(r.analysis.totalLines / (r.insightcodeTime / 1000)).toLocaleString() : 'N/A';
      markdown += `| ${r.project} | ${r.stars} | ${r.category} | ${mode} | ${r.analysis.totalFiles} | ${r.analysis.totalLines.toLocaleString()} | **${r.analysis.score}** | **${r.analysis.grade}** | ${r.analysis.avgComplexity} | ${r.analysis.avgDuplication ?? 'N/A'}% | ${insightcodeTime}s (${insightcodeLinesPerSec} l/s) | ${r.explanations.length} files |\n`;
    }
  });

  // Add detailed analysis by category
  markdown += `\n## Statistical Analysis\n`;

  const successfulResults = results.filter(r => !r.error);
  
  // Category breakdown
  ['small', 'medium', 'large'].forEach(category => {
    const categoryResults = successfulResults.filter(r => r.category === category);
    if (categoryResults.length === 0) return;
    
    markdown += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)} Projects\n\n`;
    
    // Group by mode if comparison mode (detected by having both full and production results), otherwise show all
    const hasBothModes = categoryResults.some(r => r.mode === 'full') && categoryResults.some(r => r.mode === 'production-only');
    
    if (hasBothModes) {
      const fullResults = categoryResults.filter(r => r.mode === 'full');
      const prodResults = categoryResults.filter(r => r.mode === 'production-only');
      
      if (fullResults.length > 0) {
        markdown += `#### Full Codebase Analysis\n\n`;
        fullResults.forEach(r => {
          markdown += `**${r.project}** (⭐ ${r.stars}): ${r.analysis.grade} (${r.analysis.score}/100) - ${r.analysis.totalFiles} files, ${r.analysis.totalLines.toLocaleString()} lines, ${r.analysis.avgComplexity} complexity, ${r.analysis.avgDuplication ?? 'N/A'}% duplication\n\n`;
        });
      }
      
      if (prodResults.length > 0) {
        markdown += `#### Production Only Analysis\n\n`;
        prodResults.forEach(r => {
          markdown += `**${r.project}** (⭐ ${r.stars}): ${r.analysis.grade} (${r.analysis.score}/100) - ${r.analysis.totalFiles} files, ${r.analysis.totalLines.toLocaleString()} lines, ${r.analysis.avgComplexity} complexity, ${r.analysis.avgDuplication ?? 'N/A'}% duplication\n\n`;
        });
      }
    } else {
      // Original single-mode format
      const modeLabel = categoryResults[0].mode === 'production-only' ? ' Production Only' : ' Full Codebase';
      categoryResults.forEach(r => {
        markdown += `#### ${r.project} (⭐ ${r.stars})\n`;
        markdown += `- **Mode**: ${modeLabel}\n\n`;
        markdown += `- **Score**: ${r.analysis.grade} (${r.analysis.score}/100)\n`;
        markdown += `- **Files**: ${r.analysis.totalFiles} files, ${r.analysis.totalLines.toLocaleString()} lines\n`;
        markdown += `- **Complexity**: ${r.analysis.avgComplexity} average\n`;
        markdown += `- **Duplication**: ${r.analysis.avgDuplication ?? 'N/A'}%\n`;
        markdown += `- **Complex files explained**: ${r.explanations.length}\n`;
        markdown += `\n`;
      });
    }
  });

  // Key findings
  markdown += `## Key Findings\n\n`;

  // Calculate averages by category - deduplicate if comparison mode
  const categoryAverages = ['small', 'medium', 'large'].map(cat => {
    const catResults = successfulResults.filter(r => r.category === cat);
    if (catResults.length === 0) return null;
    
    // If comparison mode, deduplicate by project (prefer production-only for more focused stats)
    const hasBothModes = catResults.some(r => r.mode === 'full') && catResults.some(r => r.mode === 'production-only');
    let uniqueResults = catResults;
    
    if (hasBothModes) {
      const projectMap = new Map();
      catResults.forEach(r => {
        const key = r.project;
        if (!projectMap.has(key) || r.mode === 'production-only') {
          projectMap.set(key, r);
        }
      });
      uniqueResults = Array.from(projectMap.values());
    }
    
    const avgScore = Math.round(uniqueResults.reduce((sum, r) => sum + r.analysis.score, 0) / uniqueResults.length);
    const avgComplexity = (uniqueResults.reduce((sum, r) => sum + r.analysis.avgComplexity, 0) / uniqueResults.length).toFixed(1);
    
    return { category: cat, avgScore, avgComplexity, count: uniqueResults.length };
  }).filter(Boolean);

  markdown += `### Average Scores by Project Size\n\n`;
  categoryAverages.forEach(cat => {
    if (cat) {
      markdown += `- **${cat.category}** projects: Average score ${cat.avgScore}/100, complexity ${cat.avgComplexity}\n`;
    }
  });

  // Performance stats - deduplicate if comparison mode  
  const hasComparisonData = successfulResults.some(r => r.mode === 'full') && successfulResults.some(r => r.mode === 'production-only');
  
  if (hasComparisonData) {
    // For performance stats, include all data but note it's combined
    const totalLines = successfulResults.reduce((sum, r) => sum + r.analysis.totalLines, 0);
    const totalTime = successfulResults.reduce((sum, r) => sum + r.duration, 0) / 1000;
    const insightcodeTime = successfulResults.reduce((sum, r) => sum + (r.insightcodeTime || 0), 0) / 1000;
    const explanationTime = totalTime - insightcodeTime;
    const insightcodeLinesPerSecond = insightcodeTime > 0 ? Math.round(totalLines / insightcodeTime) : 0;

    markdown += `\n### Performance Statistics (Combined Full + Production Analysis)\n\n`;
    markdown += `- **Total lines analyzed**: ${totalLines.toLocaleString()}\n`;
    markdown += `- **InsightCode analysis time**: ${insightcodeTime.toFixed(1)}s (${insightcodeLinesPerSecond.toLocaleString()} lines/second)\n`;
    markdown += `- **Explanation generation time**: ${explanationTime.toFixed(1)}s\n`;
    markdown += `- **Total processing time**: ${totalTime.toFixed(1)}s\n\n`;
    markdown += `**Note**: InsightCode's core analysis is very fast (${insightcodeLinesPerSecond.toLocaleString()} l/s average). Most processing time is spent on detailed explanations. For production use without explanations, expect ${insightcodeLinesPerSecond.toLocaleString()}+ lines/second performance.\n`;
  } else {
    // Original single-mode stats
    const totalLines = successfulResults.reduce((sum, r) => sum + r.analysis.totalLines, 0);
    const totalTime = successfulResults.reduce((sum, r) => sum + r.duration, 0) / 1000;
    const insightcodeTime = successfulResults.reduce((sum, r) => sum + (r.insightcodeTime || 0), 0) / 1000;
    const explanationTime = totalTime - insightcodeTime;
    const insightcodeLinesPerSecond = insightcodeTime > 0 ? Math.round(totalLines / insightcodeTime) : 0;

    markdown += `\n### Performance Statistics\n\n`;
    markdown += `- **Total lines analyzed**: ${totalLines.toLocaleString()}\n`;
    markdown += `- **InsightCode analysis time**: ${insightcodeTime.toFixed(1)}s (${insightcodeLinesPerSecond.toLocaleString()} lines/second)\n`;
    markdown += `- **Explanation generation time**: ${explanationTime.toFixed(1)}s\n`;
    markdown += `- **Total processing time**: ${totalTime.toFixed(1)}s\n\n`;
    markdown += `**Note**: InsightCode's core analysis is very fast (${insightcodeLinesPerSecond.toLocaleString()} l/s average). Most processing time is spent on detailed explanations. For production use without explanations, expect ${insightcodeLinesPerSecond.toLocaleString()}+ lines/second performance.\n`;
  }

  // Grade distribution - show both modes if comparison
  if (hasComparisonData) {
    const fullResults = successfulResults.filter(r => r.mode === 'full');
    const prodResults = successfulResults.filter(r => r.mode === 'production-only');
    
    markdown += `\n### Grade Distribution\n\n`;
    markdown += `#### Full Codebase Analysis\n`;
    const fullGradeDistribution = fullResults.reduce((acc, r) => {
      acc[r.analysis.grade] = (acc[r.analysis.grade] || 0) + 1;
      return acc;
    }, {});
    
    ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
      const count = fullGradeDistribution[grade] || 0;
      if (count > 0) {
        const projects = fullResults
          .filter(r => r.analysis.grade === grade)
          .map(r => r.project)
          .join(', ');
        markdown += `- **${grade}**: ${count} project${count === 1 ? '' : 's'} - ${projects}\n`;
      }
    });
    
    markdown += `\n#### Production Only Analysis\n`;
    const prodGradeDistribution = prodResults.reduce((acc, r) => {
      acc[r.analysis.grade] = (acc[r.analysis.grade] || 0) + 1;
      return acc;
    }, {});
    
    ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
      const count = prodGradeDistribution[grade] || 0;
      if (count > 0) {
        const projects = prodResults
          .filter(r => r.analysis.grade === grade)
          .map(r => r.project)
          .join(', ');
        markdown += `- **${grade}**: ${count} project${count === 1 ? '' : 's'} - ${projects}\n`;
      }
    });
  } else {
    // Original single-mode grade distribution
    const gradeDistribution = successfulResults.reduce((acc, r) => {
      acc[r.analysis.grade] = (acc[r.analysis.grade] || 0) + 1;
      return acc;
    }, {});
    
    markdown += `\n### Grade Distribution\n\n`;
    ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
      const count = gradeDistribution[grade] || 0;
      if (count > 0) {
        const projects = successfulResults
          .filter(r => r.analysis.grade === grade)
          .map(r => r.project)
          .join(', ');
        markdown += `- **${grade}**: ${count} project${count === 1 ? '' : 's'} - ${projects}\n`;
      }
    });
  }

  // Best and worst scores - deduplicate if comparison mode
  if (hasComparisonData) {
    const fullResults = successfulResults.filter(r => r.mode === 'full');
    const prodResults = successfulResults.filter(r => r.mode === 'production-only');
    
    if (fullResults.length > 0) {
      const fullSorted = fullResults.sort((a, b) => b.analysis.score - a.analysis.score);
      markdown += `\n### Score Range - Full Codebase\n\n`;
      markdown += `- **Best score**: ${fullSorted[0].project} with ${fullSorted[0].analysis.grade} (${fullSorted[0].analysis.score}/100)\n`;
      markdown += `- **Worst score**: ${fullSorted[fullSorted.length - 1].project} with ${fullSorted[fullSorted.length - 1].analysis.grade} (${fullSorted[fullSorted.length - 1].analysis.score}/100)\n`;
    }
    
    if (prodResults.length > 0) {
      const prodSorted = prodResults.sort((a, b) => b.analysis.score - a.analysis.score);
      markdown += `\n### Score Range - Production Only\n\n`;
      markdown += `- **Best score**: ${prodSorted[0].project} with ${prodSorted[0].analysis.grade} (${prodSorted[0].analysis.score}/100)\n`;
      markdown += `- **Worst score**: ${prodSorted[prodSorted.length - 1].project} with ${prodSorted[prodSorted.length - 1].analysis.grade} (${prodSorted[prodSorted.length - 1].analysis.score}/100)\n`;
    }
  } else {
    // Original single-mode score range
    const sortedByScore = successfulResults.sort((a, b) => b.analysis.score - a.analysis.score);
    if (sortedByScore.length > 0) {
      markdown += `\n### Score Range\n\n`;
      markdown += `- **Best score**: ${sortedByScore[0].project} with ${sortedByScore[0].analysis.grade} (${sortedByScore[0].analysis.score}/100)\n`;
      markdown += `- **Worst score**: ${sortedByScore[sortedByScore.length - 1].project} with ${sortedByScore[sortedByScore.length - 1].analysis.grade} (${sortedByScore[sortedByScore.length - 1].analysis.score}/100)\n`;
    }
  }

  // Add scoring algorithm explanation for comparison mode
  if (hasComparisonData) {
    // Générer dynamiquement les explications
    const scoringExplanation = await explainProjectImprovedScoreWithHigherComplexity(results);
    markdown += scoringExplanation;
    
    const duplicationAnalysis = await explainProjectDuplicationFromUtilityFiles(results);
    markdown += duplicationAnalysis;
  }

  markdown += `\n## Detailed Complexity Explanations\n\n`;

  if (hasComparisonData) {
    // Group results by project for comparison mode
    const projectGroups = new Map();
    results.forEach(result => {
      if (!result.error) {
        if (!projectGroups.has(result.project)) {
          projectGroups.set(result.project, { full: null, production: null });
        }
        if (result.mode === 'full') {
          projectGroups.get(result.project).full = result;
        } else {
          projectGroups.get(result.project).production = result;
        }
      }
    });

    projectGroups.forEach(({ full, production }, projectName) => {
      if (!full || !production) return;
      
      const scoreDelta = production.analysis.score - full.analysis.score;
      const complexityDelta = production.analysis.avgComplexity - full.analysis.avgComplexity;
      const deltaIndicator = scoreDelta > 0 ? '📈' : scoreDelta < 0 ? '📉' : '➡️';
      const deltaText = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;
      
      markdown += `### 📊 ${projectName} (⭐ ${full.stars})

| Analysis Mode | Grade | Score | Files | Lines | Avg Complexity | Duplication |
|---------------|-------|-------|-------|-------|----------------|-------------|
| **Full Codebase** | **${full.analysis.grade}** | ${full.analysis.score}/100 | ${full.analysis.totalFiles.toLocaleString()} | ${full.analysis.totalLines.toLocaleString()} | ${full.analysis.avgComplexity} | ${full.analysis.avgDuplication ?? 'N/A'}% |
| **Production Only** | **${production.analysis.grade}** | ${production.analysis.score}/100 | ${production.analysis.totalFiles.toLocaleString()} | ${production.analysis.totalLines.toLocaleString()} | ${production.analysis.avgComplexity} | ${production.analysis.avgDuplication ?? 'N/A'}% |

${deltaIndicator} **Score Impact**: ${deltaText} points (${full.analysis.score} → ${production.analysis.score})  
📊 **Complexity Change**: ${complexityDelta > 0 ? '+' : ''}${complexityDelta.toFixed(1)} (${full.analysis.avgComplexity} → ${production.analysis.avgComplexity})

`;

      // Combine explanations and detect duplicates
      const allExplanations = [...(full.explanations || []), ...(production.explanations || [])];
      const explanationMap = new Map();
      
      allExplanations.forEach(exp => {
        const key = `${exp.file}-${exp.complexity}`;
        if (!explanationMap.has(key)) {
          explanationMap.set(key, []);
        }
        explanationMap.get(key).push(exp);
      });

      explanationMap.forEach((exps) => {
        const firstExp = exps[0];
        const isDuplicate = exps.length > 1 && exps.every(e => e.explanation === firstExp.explanation);
        
        if (isDuplicate) {
          markdown += `#### \`${firstExp.file}\` (Complexity: ${firstExp.complexity})
*Note: Same file found in both analysis modes - explanation shared below*

${firstExp.explanation}

---

`;
        } else {
          exps.forEach((exp, index) => {
            const mode = index === 0 ? 'Full Codebase' : 'Production Only';
            markdown += `#### \`${exp.file}\` (Complexity: ${exp.complexity}) - ${mode}

${exp.explanation}

---

`;
          });
        }
      });
    });
  } else {
    // Regular single-mode display
    results.forEach(result => {
      if (result.error) {
        markdown += `### ❌ ${result.project} (Error)
**Error**: ${result.error}

`;
        return;
      }

      markdown += `### 📊 ${result.project} (⭐ ${result.stars})
**Overall Score**: ${result.analysis.grade} (${result.analysis.score}/100)
**Avg Complexity**: ${result.analysis.avgComplexity}
**Files with Explanations**: ${result.explanations.length}

`;

      result.explanations.forEach(explanation => {
        markdown += `#### \`${explanation.file}\` (Complexity: ${explanation.complexity})

${explanation.explanation}

---

`;
      });
    });
  }

  // Add summary insights
  markdown += `## Summary Insights

  ### Common Complexity Patterns
  `;

  const allExplanations = results.flatMap(r => r.explanations || []);
  const totalExplanations = allExplanations.length;

  if (totalExplanations > 0) {
    // GARDER : Les statistiques calculées
    markdown += `- **Total files explained**: ${totalExplanations}
  - **Highest complexity**: ${Math.max(...allExplanations.map(e => e.complexity))}
  - **Average complexity of explained files**: ${Math.round(allExplanations.reduce((sum, e) => sum + e.complexity, 0) / totalExplanations)}

  `;
    console.log('\n🔍 === PHASE 4: Generating Global Key Findings with Claude API');
    // NOUVEAU : Générer les Key Findings dynamiquement
    const keyFindings = await generateBenchmarkInsights(allExplanations, results);
    markdown += keyFindings;
  }

  // Calculate cache statistics for report
  const cacheHits = results.reduce((sum, r) => {
    return sum + (r.explanations?.filter(e => e.fromCache === true).length || 0);
  }, 0);
  const apiCalls = totalExplanations - cacheHits;
  
  markdown += `### Performance
- **Analysis time**: ${results.reduce((sum, r) => sum + (r.duration || 0), 0) / 1000}s total
- **Analysis calls made**: ${totalExplanations}
- **Success rate**: ${((results.length - results.filter(r => r.error).length) / results.length * 100).toFixed(1)}%
- **Cache efficiency**: ${apiCalls} API calls, ${cacheHits} cached (${totalExplanations > 0 ? ((cacheHits/totalExplanations)*100).toFixed(1) : '0'}% cache rate)

---
*Automated analysis report generated by InsightCode*
`;

  return markdown;
}

function printCacheStats() {
  try {
    const cacheFiles = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
    if (cacheFiles.length > 0) {
      console.log(`💾 Cache: ${cacheFiles.length} explanations cached in ${CACHE_DIR}`);
      
      // Calculate cache age statistics
      const now = Date.now();
      const cacheAges = cacheFiles.map(file => {
        try {
          const cached = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf-8'));
          return Math.floor((now - cached.timestamp) / (24 * 60 * 60 * 1000)); // days
        } catch {
          return null;
        }
      }).filter(age => age !== null);
      
      if (cacheAges.length > 0) {
        const avgAge = Math.round(cacheAges.reduce((sum, age) => sum + age, 0) / cacheAges.length);
        const maxAge = Math.max(...cacheAges);
        console.log(`   📅 Cache ages: ${avgAge} days average, ${maxAge} days oldest`);
      }
    } else {
      console.log(`💾 Cache: Empty (${CACHE_DIR})`);
    }
  } catch (error) {
    console.log(`💾 Cache: Unable to read cache directory`);
  }
}

async function main() {
  console.log('🚀 InsightCode Benchmark Explainer\n');
  console.log('This tool analyzes high-complexity files and generates AI explanations.');
  console.log(`Using advanced AI for explanations (threshold: ${COMPLEXITY_THRESHOLD}+)\n`);
  
  if (clearCache) {
    console.log('🧹 Cache: Bypassing cache for fresh analysis (--clear-cache)');
  } else {
    printCacheStats();
  }
  
  if (compareMode) {
    console.log('📊 Mode: Full Codebase vs Production Comparison (--compare)');
  } else if (excludeUtility) {
    console.log('📊 Mode: Production Code Only (--exclude-utility)');
  } else {
    console.log('📊 Mode: Full Codebase Analysis');
  }
  
  // Check if insightcode is available
  try {
    runCommand('insightcode --version');
  } catch (error) {
    console.error('❌ Error: insightcode-cli not found. Please install it first:');
    console.error('   npm install -g insightcode-cli');
    process.exit(1);
  }
  
  // Determine which projects to analyze
  let projectsToAnalyze = [];
  
  if (projectName) {
    // Analyze specific project
    const allProjects = Object.values(PROJECTS).flat();
    const project = allProjects.find(p => p.name === projectName);
    if (!project) {
      console.error(`❌ Project '${projectName}' not found`);
      console.error('Available projects:', allProjects.map(p => p.name).join(', '));
      process.exit(1);
    }
    projectsToAnalyze = [{ ...project, category: 'custom' }];
  } else {
    // Analyze all projects
    for (const [category, projects] of Object.entries(PROJECTS)) {
      projectsToAnalyze.push(...projects.map(p => ({ ...p, category })));
    }
  }
  
  if (compareMode) {
    console.log(`\n📋 Will analyze ${projectsToAnalyze.length} projects (${projectsToAnalyze.length * 2} total analyses: full + production for each)\n`);
    
    const fullCodebaseResults = [];
    const productionCodeResults = [];
    
    // Run full codebaseanalysis first
    console.log('🔍 === PHASE 1: Full Codebase Analysis ===');
    for (const project of projectsToAnalyze) {
      const result = await analyzeProjectWithExplanations(project, project.category, false);
      fullCodebaseResults.push(result);
      
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${project.name}-full-explanations.json`),
        JSON.stringify(result, null, 2)
      );
    }
    
    // Run production-only analysis second with comparison context
    console.log('\n🔍 === PHASE 2: Production-Only Analysis ===');
    for (const project of projectsToAnalyze) {
      const fullResult = fullCodebaseResults.find(r => r.project === project.name);
      const comparisonContext = fullResult ? {
        fullGrade: fullResult.analysis.grade,
        fullScore: fullResult.analysis.score,
        prodGrade: 'TBD', // Will be updated in analysis
        prodScore: 'TBD'
      } : null;
      
      const result = await analyzeProjectWithExplanations(project, project.category, true, comparisonContext);
      
      // Update comparison context with actual production results
      if (comparisonContext) {
        comparisonContext.prodGrade = result.analysis.grade;
        comparisonContext.prodScore = result.analysis.score;
      }
      
      productionCodeResults.push(result);
      
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${project.name}-production-explanations.json`),
        JSON.stringify(result, null, 2)
      );
    }
    
    // Generate comparison with Claude insights
    console.log('\n🧠 === PHASE 3: Generating Claude-Powered Insights ===');
    const comparisonTable = await generateComparisonTable(fullCodebaseResults, productionCodeResults);
    const allResults = [...fullCodebaseResults, ...productionCodeResults];
    const report = await generateExplanationReport(allResults, comparisonTable);
    
    // Save comparison report
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(RESULTS_DIR, `BENCHMARK-EXPLANATIONS-COMPARISON.md`);
    const jsonPath = path.join(RESULTS_DIR, `benchmark-explanations-comparison.json`);
    fs.writeFileSync(reportPath, report);
    fs.writeFileSync(jsonPath, JSON.stringify({ full: fullCodebaseResults, production: productionCodeResults }, null, 2));
    
    // Archive to docs
    const archivePath = path.join(DOCS_BENCHMARKS_DIR, `benchmark-explanations-comparison-${date}.md`);
    fs.writeFileSync(archivePath, report);
    
    console.log('\n✅ Comparison analysis complete!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📊 Full results saved to: ${jsonPath}`);
    console.log(`📁 Archived to: benchmarks/benchmark-explanations-comparison-${date}.md`);
    
    const successful = allResults.filter(r => !r.error).length;
    const totalExplanations = allResults.reduce((sum, r) => sum + (r.explanations?.length || 0), 0);
    const cacheHits = allResults.reduce((sum, r) => {
      return sum + (r.explanations?.filter(e => e.fromCache === true).length || 0);
    }, 0);
    const apiCalls = totalExplanations - cacheHits;
    
    const uniqueProjects = new Set(allResults.map(r => r.project)).size;
    console.log(`\n📈 Summary: ${uniqueProjects} projects analyzed (${successful}/${allResults.length} analyses completed), ${totalExplanations} files explained`);
    if (totalExplanations > 0) {
      console.log(`💰 API efficiency: ${apiCalls} new calls, ${cacheHits} cache hits (${((cacheHits/totalExplanations)*100).toFixed(1)}% cache rate)`);
    }
    
  } else {
    console.log(`\n📋 Will analyze ${projectsToAnalyze.length} projects for complexity explanations\n`);
    
    const results = [];
    
    for (const project of projectsToAnalyze) {
      const result = await analyzeProjectWithExplanations(project, project.category, excludeUtility);
      results.push(result);
      
      // Save intermediate results (individual project files)
      const suffix = excludeUtility ? '-production' : '-full';
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${project.name}${suffix}-explanations.json`),
        JSON.stringify(result, null, 2)
      );
    }
  
    // Generate and save report
    const report = await generateExplanationReport(results);
    const suffix = excludeUtility ? '-production-only' : '';
    const specificSuffix = projectName ? `-${projectName}` : '';
    const date = new Date().toISOString().split('T')[0];
    
    // Save to benchmark-results (working directory)
    const reportPath = path.join(RESULTS_DIR, `BENCHMARK-EXPLANATIONS${suffix}${specificSuffix}.md`);
    const jsonPath = path.join(RESULTS_DIR, `benchmark-explanations${suffix}${specificSuffix}.json`);
    fs.writeFileSync(reportPath, report);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    
    // Archive to benchmarks (permanent documentation)
    const successful = results.filter(r => !r.error).length;
    if (successful >= results.length - 2) { // Allow 2 failures
      const archivePath = path.join(DOCS_BENCHMARKS_DIR, `benchmark-explanations-${date}${suffix}${specificSuffix}.md`);
      fs.writeFileSync(archivePath, report);
      console.log(`📁 Archived to: benchmarks/benchmark-explanations-${date}${suffix}${specificSuffix}.md`);
    }
    
    console.log('\n✅ Analysis complete!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📊 Full results saved to: ${jsonPath}`);
    
    // Print summary with cache stats
    const successfulCount = results.filter(r => !r.error).length;
    const totalExplanations = results.reduce((sum, r) => sum + (r.explanations?.length || 0), 0);
    const cacheHits = results.reduce((sum, r) => {
      return sum + (r.explanations?.filter(e => e.fromCache === true).length || 0);
    }, 0);
    const apiCalls = totalExplanations - cacheHits;
    
    console.log(`\n📈 Summary: ${successfulCount}/${results.length} projects analyzed, ${totalExplanations} files explained`);
    if (totalExplanations > 0) {
      console.log(`💰 API efficiency: ${apiCalls} new calls, ${cacheHits} cache hits (${((cacheHits/totalExplanations)*100).toFixed(1)}% cache rate)`);
    }
  }
  
}


/* Générer l'explication de duplication dynamiquement */
async function explainProjectDuplicationFromUtilityFiles(results) {
  // Analyser les patterns de duplication
  const duplicationPatterns = [];

  results.forEach(result => {
    if (result.mode === 'production-only' && result.analysis.avgDuplication === 0) {
      const fullResult = results.find(r =>
        r.project === result.project && r.mode === 'full'
      );

      if (fullResult && fullResult.analysis.avgDuplication > 0) {
        duplicationPatterns.push({
          project: result.project,
          fullDuplication: fullResult.analysis.avgDuplication,
          prodDuplication: result.analysis.avgDuplication,
          filesExcluded: fullResult.analysis.totalFiles - result.analysis.totalFiles
        });
      }
    }
  });

  if (duplicationPatterns.length === 0) {
    return '';
  }
  
  // Generate cache key for duplication analysis
  const duplicationExplanationcacheKey = 'duplication_' + crypto.createHash('md5').update(JSON.stringify({
    patterns: duplicationPatterns,
    promptVersion: '1.0'
  })).digest('hex');
  
  const cachedResponse = !clearCache ? getCachedDuplicationExplanationApiResponse(duplicationExplanationcacheKey) : null;
  if (cachedResponse) {
    console.log(`    💾 Using cached duplication analysis`);
    return cachedResponse;
  }

  const prompt = `Analyze these duplication patterns where production-only analysis shows different results:

${JSON.stringify(duplicationPatterns, null, 2)}

Generate a brief technical explanation for why duplication metrics change when excluding utility files (tests, examples, docs, scripts, tools, mocks, fixtures, benchmarks). 
Consider:
- Test setup/teardown patterns
- Example/demo code repetition
- Mock/fixture duplication
- Script/tool boilerplate
- Documentation code snippets

Format as a markdown section. Keep it under 100 words.`;

  try {
    const requestBody = {
      model: 'claude-sonnet-4-0',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    const data = await callClaudeWithRetry(requestBody, 'duplication-analysis');
    const response = `\n### Duplication Analysis\n\n${data.content[0].text}`;
    
    // Cache the response
    setCachedDuplicationExplanationApiResponse(duplicationExplanationcacheKey, response);
    
    return response;

  } catch (error) {
    console.error(`❌ Failed to generate duplication analysis: ${error.message}`);
    return '';
  }
}
async function explainProjectImprovedScoreWithHigherComplexity(results) {
  // Identifier les cas de scores paradoxaux
  const paradoxicalCases = [];

  results.forEach(result => {
    const fullResult = results.find(r => r.project === result.project && r.mode === 'full');
    const prodResult = results.find(r => r.project === result.project && r.mode === 'production-only');

    if (fullResult && prodResult) {
      const scoreDelta = prodResult.analysis.score - fullResult.analysis.score;
      const complexityDelta = prodResult.analysis.avgComplexity - fullResult.analysis.avgComplexity;

      // Cas paradoxal : score augmente malgré complexité plus élevée
      if (scoreDelta > 0 && complexityDelta > 0) {
        paradoxicalCases.push({
          project: result.project,
          fullScore: fullResult.analysis.score,
          prodScore: prodResult.analysis.score,
          fullComplexity: fullResult.analysis.avgComplexity,
          prodComplexity: prodResult.analysis.avgComplexity,
          fullDuplication: fullResult.analysis.avgDuplication,
          prodDuplication: prodResult.analysis.avgDuplication,
          scoreDelta,
          complexityDelta
        });
      }
    }
  });

  if (paradoxicalCases.length === 0) {
    return ''; // Pas besoin d'explication si pas de cas paradoxaux
  }
  
  // Generate cache key for scoring explanation
  const cacheKey = 'scoring_' + crypto.createHash('md5').update(JSON.stringify({
    cases: paradoxicalCases,
    promptVersion: '1.0'
  })).digest('hex');
  
  const cachedResponse = !clearCache ? getCachedScoringExplanationApiResponse(cacheKey) : null;
  if (cachedResponse) {
    console.log(`    💾 Using cached scoring algorithm explanation`);
    return cachedResponse;
  }

  const prompt = `Analyze these paradoxical scoring results where production-only scores improved despite higher complexity:

  ${JSON.stringify(paradoxicalCases, null, 2)}

  InsightCode uses this scoring algorithm:
  - Complexity (40% weight): Graduated penalties (100pts ≤10, 85pts ≤15, 65pts ≤20, 40pts ≤30, 20pts ≤50)
  - Duplication (30% weight): Strict thresholds (100pts ≤3%, 85pts ≤8%, 65pts ≤15%, 20pts ≤50%)
  - Maintainability (30% weight): Based on avg file size (100pts ≤200 LOC) and function count

  Generate a clear explanation for why scores can improve despite higher complexity. Use a specific project as an example with actual calculations. Format as markdown suitable for documentation.

  Keep it concise but mathematically accurate.`;

  try {
    const requestBody = {
      model: 'claude-sonnet-4-0',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    const data = await callClaudeWithRetry(requestBody, 'scoring-algorithm-explanation');
    const response = `\n## Understanding the Scoring Algorithm\n\n${data.content[0].text}`;
    
    // Cache the response
    setCachedScoringExplanationApiResponse(cacheKey, response);
    
    return response;

  } catch (error) {
    console.error(`❌ Failed to generate scoring explanation: ${error.message}`);
    // Fallback minimal
    return `\n## Understanding the Scoring Algorithm

  The scoring algorithm uses three weighted components (Complexity 40%, Duplication 30%, File Size 30%). 
  In some cases, production-only scores improve despite higher complexity because other metrics improve significantly when excluding test files.`;
  }
}


async function generateBenchmarkInsights(allExplanations, results) {
  // Analyser les vrais patterns dans les explications
  const patterns = analyzeExplanationPatterns(allExplanations);
  const justificationStats = analyzeJustificationDistribution(allExplanations);
  const projectStats = analyzeProjectDistribution(results);
  
  // Calculate actual project count (handle comparison mode where each project appears twice)
  const uniqueProjects = new Set(results.map(r => r.project));
  const projectCount = uniqueProjects.size;
  
  // Analyser les insights spécifiques au mode comparaison
  const comparisonInsights = analyzeComparisonInsights(results);
  const architecturalPatterns = analyzeArchitecturalPatterns(allExplanations);
  const performanceImpacts = analyzePerformanceImpacts(results);
  
  // Generate cache key for findings
  const cacheKey = 'findings_' + crypto.createHash('md5').update(JSON.stringify({
    patterns,
    justificationStats,
    projectStats,
    comparisonInsights,
    architecturalPatterns,
    performanceImpacts,
    explanationCount: allExplanations.length,
    projectCount,
    promptVersion: '3.1' // Updated for enhanced insights + increased token limit
  })).digest('hex');
  
  const cachedResponse = !clearCache ? getCachedDuplicationExplanationApiResponse(cacheKey) : null;
  if (cachedResponse) {
    console.log(`    💾 Using cached data-driven findings`);
    return cachedResponse;
  }
  
  const prompt = `Analyze this comprehensive codebase quality comparison across ${projectCount} **industry-leading open-source projects** with millions of users worldwide (${allExplanations.length} complex files analyzed).

**Projects analyzed**: TypeScript (98k⭐), React (227k⭐), Vue (46k⭐), Express (65k⭐), Jest (44k⭐), ESLint (25k⭐), lodash (59k⭐), chalk (21k⭐), uuid (14k⭐)

## Analysis Data:
**Core Patterns**: ${JSON.stringify(patterns, null, 2)}
**Complexity Justification**: ${justificationStats.justified}% justified, ${justificationStats.notJustified}% structural issues
**Production vs Full Impact**: ${JSON.stringify(comparisonInsights, null, 2)}
**Architectural Patterns**: ${JSON.stringify(architecturalPatterns, null, 2)}

Generate exactly 5-6 insights following this format:

**Format Requirements:**
- Each bullet point focuses on ONE specific project
- Each bullet analyzes ONE specific architectural pattern or design decision
- Take a constructive, analytical tone (not critical)
- Explain WHY the complexity exists and what it teaches us
- Provide actionable lessons for teams

**Example structure:**
• **[Project Name] + [Architectural Theme]**: [Specific observation about the project's complexity patterns]. [Explanation of why this complexity exists]. **Lesson for teams**: [Specific actionable recommendation].

**Themes to explore:**
- Compiler architecture patterns (TypeScript, ESLint)
- Framework scalability decisions (React, Vue)
- API design complexity trade-offs (Express)
- Testing infrastructure architecture (Jest)
- Utility library optimization strategies (lodash, chalk)
- Performance vs maintainability trade-offs

Focus on what teams can LEARN from these successful architectural decisions, not what's "wrong" with them.

Format as "### Key Findings" with bullet points.`;

  try {
    const requestBody = {
      model: 'claude-sonnet-4-0',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    const data = await callClaudeWithRetry(requestBody, 'key-findings');
    const response = data.content[0].text;
    
    // Cache the response
    setCachedDuplicationExplanationApiResponse(cacheKey, response);
    
    return response;
    
  } catch (error) {
    // Fallback basé sur les données réelles
    console.error(`❌ Failed to generate AI data-driven findings: ${error.message}`);
    return generateFallbackFindings(patterns, justificationStats, projectStats);
  }
}

function analyzeExplanationPatterns(explanations) {
  const patterns = {
    switchStatements: 0,
    nestedLoops: 0,
    monolithicFunctions: 0,
    stateManagement: 0,
    configParsing: 0,
    errorHandling: 0,
    crossPlatform: 0,
    legacyCode: 0
  };
  
  explanations.forEach(exp => {
    const text = exp.explanation.toLowerCase();
    if (text.includes('switch statement')) patterns.switchStatements++;
    if (text.includes('nested loop') || text.includes('nested conditional')) patterns.nestedLoops++;
    if (text.includes('monolithic') || text.includes('large function')) patterns.monolithicFunctions++;
    if (text.includes('state management') || text.includes('state machine')) patterns.stateManagement++;
    if (text.includes('config') || text.includes('parsing')) patterns.configParsing++;
    if (text.includes('error handling') || text.includes('exception')) patterns.errorHandling++;
    if (text.includes('cross-platform') || text.includes('environment')) patterns.crossPlatform++;
    if (text.includes('legacy') || text.includes('backward compatibility')) patterns.legacyCode++;
  });
  
  return patterns;
}

function analyzeJustificationDistribution(explanations) {
  const stats = {
    justified: 0,
    partlyJustified: 0,
    notJustified: 0
  };
  
  explanations.forEach(exp => {
    const level = extractJustificationLevel(exp.explanation);
    if (level === 'Yes') stats.justified++;
    else if (level === 'Partly') stats.partlyJustified++;
    else stats.notJustified++;
  });
  
  const total = explanations.length;
  return {
    justified: Math.round((stats.justified / total) * 100),
    partlyJustified: Math.round((stats.partlyJustified / total) * 100),
    notJustified: Math.round((stats.notJustified / total) * 100)
  };
}

function analyzeProjectDistribution(results) {
  const successful = results.filter(r => !r.error);
  
  // Deduplicate projects when in comparison mode (full + production results)
  const uniqueProjects = new Map();
  successful.forEach(r => {
    const key = r.project;
    // In comparison mode, prefer production-only stats as they're more focused
    if (!uniqueProjects.has(key) || r.mode === 'production-only') {
      uniqueProjects.set(key, r);
    }
  });
  
  const uniqueSuccessful = Array.from(uniqueProjects.values());
  const fGradeProjects = uniqueSuccessful.filter(r => r.analysis.grade === 'F');
  
  // Utiliser les vraies statistiques d'issues
  const aggregatedStats = {
    complexity: 0,
    duplication: 0,
    size: 0
  };
  
  successful.forEach(r => {
    if (r.issueStats) {
      aggregatedStats.complexity += r.issueStats.byType.complexity;
      aggregatedStats.duplication += r.issueStats.byType.duplication;
      aggregatedStats.size += r.issueStats.byType.size;
    }
  });
  
  // Trouver le type d'issue le plus fréquent
  const topIssueType = Object.entries(aggregatedStats)
    .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  return {
    fGradeCount: fGradeProjects.length,
    avgComplexityF: fGradeProjects.length > 0 
      ? Math.round(fGradeProjects.reduce((sum, r) => sum + r.analysis.avgComplexity, 0) / fGradeProjects.length)
      : 0,
    topIssueType,
    totalIssues: aggregatedStats,
    issueDistribution: {
      complexity: Math.round((aggregatedStats.complexity / (aggregatedStats.complexity + aggregatedStats.duplication + aggregatedStats.size)) * 100),
      duplication: Math.round((aggregatedStats.duplication / (aggregatedStats.complexity + aggregatedStats.duplication + aggregatedStats.size)) * 100),
      size: Math.round((aggregatedStats.size / (aggregatedStats.complexity + aggregatedStats.duplication + aggregatedStats.size)) * 100)
    },
    uniqueProjectCount: uniqueProjects.size
  };
}

function analyzeComparisonInsights(results) {
  const projectPairs = new Map();
  
  // Group results by project
  results.forEach(result => {
    if (!result.error) {
      if (!projectPairs.has(result.project)) {
        projectPairs.set(result.project, {});
      }
      projectPairs.get(result.project)[result.mode] = result;
    }
  });
  
  const insights = {
    scoreImprovements: 0,
    scoreDegradations: 0,
    avgScoreDelta: 0,
    biggestWinner: null,
    biggestLoser: null,
    complexityReductions: 0,
    duplicationImpacts: [],
    filesExcludedAvg: 0
  };
  
  const deltas = [];
  projectPairs.forEach((modes, projectName) => {
    if (modes.full && modes['production-only']) {
      const scoreDelta = modes['production-only'].analysis.score - modes.full.analysis.score;
      const complexityDelta = modes['production-only'].analysis.avgComplexity - modes.full.analysis.avgComplexity;
      const filesExcluded = modes.full.analysis.totalFiles - modes['production-only'].analysis.totalFiles;
      
      deltas.push(scoreDelta);
      
      if (scoreDelta > 0) insights.scoreImprovements++;
      if (scoreDelta < 0) insights.scoreDegradations++;
      if (complexityDelta < 0) insights.complexityReductions++;
      
      // Track biggest changes
      if (!insights.biggestWinner || scoreDelta > insights.biggestWinner.delta) {
        insights.biggestWinner = { project: projectName, delta: scoreDelta };
      }
      if (!insights.biggestLoser || scoreDelta < insights.biggestLoser.delta) {
        insights.biggestLoser = { project: projectName, delta: scoreDelta };
      }
      
      // Track duplication patterns
      const fullDup = modes.full.analysis.avgDuplication || 0;
      const prodDup = modes['production-only'].analysis.avgDuplication || 0;
      if (Math.abs(fullDup - prodDup) > 5) { // Significant change
        insights.duplicationImpacts.push({
          project: projectName,
          fullDup,
          prodDup,
          change: prodDup - fullDup
        });
      }
      
      insights.filesExcludedAvg += filesExcluded;
    }
  });
  
  insights.avgScoreDelta = deltas.length > 0 ? Math.round(deltas.reduce((sum, d) => sum + d, 0) / deltas.length) : 0;
  insights.filesExcludedAvg = Math.round(insights.filesExcludedAvg / projectPairs.size);
  
  return insights;
}

function analyzeArchitecturalPatterns(explanations) {
  const patterns = {
    compilerInfrastructure: 0,
    configurationParsing: 0,
    apiFrameworks: 0,
    testingFrameworks: 0,
    utilityLibraries: 0,
    stateManagement: 0,
    performanceCritical: 0,
    legacyCompatibility: 0
  };
  
  explanations.forEach(exp => {
    const text = exp.explanation.toLowerCase();
    
    // Compiler/Language Infrastructure
    if (text.includes('compiler') || text.includes('parser') || text.includes('ast') || 
        text.includes('lexer') || text.includes('tokenizer')) {
      patterns.compilerInfrastructure++;
    }
    
    // Configuration/Setup
    if (text.includes('config') || text.includes('setup') || text.includes('initialization') ||
        text.includes('bootstrap')) {
      patterns.configurationParsing++;
    }
    
    // API/Framework code
    if (text.includes('api') || text.includes('route') || text.includes('middleware') ||
        text.includes('handler')) {
      patterns.apiFrameworks++;
    }
    
    // Testing infrastructure
    if (text.includes('test') || text.includes('mock') || text.includes('assertion') ||
        text.includes('fixture')) {
      patterns.testingFrameworks++;
    }
    
    // Utility/Helper patterns
    if (text.includes('utility') || text.includes('helper') || text.includes('common') ||
        text.includes('shared')) {
      patterns.utilityLibraries++;
    }
    
    // State management
    if (text.includes('state') || text.includes('store') || text.includes('reducer') ||
        text.includes('observable')) {
      patterns.stateManagement++;
    }
    
    // Performance critical
    if (text.includes('performance') || text.includes('optimization') || text.includes('cache') ||
        text.includes('memory')) {
      patterns.performanceCritical++;
    }
    
    // Legacy/Compatibility
    if (text.includes('legacy') || text.includes('compatibility') || text.includes('backward') ||
        text.includes('deprecated')) {
      patterns.legacyCompatibility++;
    }
  });
  
  return patterns;
}

function analyzePerformanceImpacts(results) {
  const impacts = {
    totalLinesAnalyzed: 0,
    avgAnalysisSpeed: 0,
    largestCodebases: [],
    fastestAnalysis: null,
    slowestAnalysis: null
  };
  
  const successful = results.filter(r => !r.error);
  
  successful.forEach(result => {
    impacts.totalLinesAnalyzed += result.analysis.totalLines;
    
    if (result.insightcodeTime > 0) {
      const linesPerSecond = Math.round(result.analysis.totalLines / (result.insightcodeTime / 1000));
      
      if (!impacts.fastestAnalysis || linesPerSecond > impacts.fastestAnalysis.speed) {
        impacts.fastestAnalysis = { project: result.project, speed: linesPerSecond, mode: result.mode };
      }
      
      if (!impacts.slowestAnalysis || linesPerSecond < impacts.slowestAnalysis.speed) {
        impacts.slowestAnalysis = { project: result.project, speed: linesPerSecond, mode: result.mode };
      }
    }
    
    // Track largest codebases
    impacts.largestCodebases.push({
      project: result.project,
      mode: result.mode,
      lines: result.analysis.totalLines,
      files: result.analysis.totalFiles
    });
  });
  
  // Sort and keep top 3 largest
  impacts.largestCodebases.sort((a, b) => b.lines - a.lines);
  impacts.largestCodebases = impacts.largestCodebases.slice(0, 3);
  
  // Calculate average analysis speed
  const totalTime = successful.reduce((sum, r) => sum + (r.insightcodeTime || 0), 0) / 1000;
  impacts.avgAnalysisSpeed = totalTime > 0 ? Math.round(impacts.totalLinesAnalyzed / totalTime) : 0;
  
  return impacts;
}

function generateFallbackFindings(patterns, justificationStats, projectStats) {
  const topPatterns = Object.entries(patterns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .filter(([,count]) => count > 0);
  
  let findings = "### Key Findings\n";
  
  // Finding 1: Justification distribution
  if (justificationStats.justified > 50) {
    findings += `- Most complexity (${justificationStats.justified}%) is justified by legitimate business requirements\n`;
  } else if (justificationStats.notJustified > 30) {
    findings += `- ${justificationStats.notJustified}% of complex files have unjustified complexity that could be refactored\n`;
  }
  
  // Finding 2: Top pattern
  if (topPatterns.length > 0) {
    const [pattern, count] = topPatterns[0];
    findings += `- ${pattern.replace(/([A-Z])/g, ' $1').toLowerCase()} is the leading complexity driver (found in ${count} files)\n`;
  }
  
  // Finding 3: Grade distribution
  if (projectStats.fGradeCount > 0) {
    findings += `- ${projectStats.fGradeCount} projects received F grades with average complexity of ${projectStats.avgComplexityF}\n`;
  }
  
  // Finding 4: Actionable insight
  if (patterns.monolithicFunctions > patterns.switchStatements) {
    findings += `- Monolithic functions are more problematic than complex control flow\n`;
  } else if (patterns.switchStatements > 0) {
    findings += `- Large switch statements are a primary refactoring opportunity\n`;
  }
  
  return findings;
}

function getInsightCodeVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    return packageJson.version || '0.3.0';
  } catch {
    return '0.3.0';
  }
}

main().catch(console.error);