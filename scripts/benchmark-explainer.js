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
    { name: 'typescript', repo: 'https://github.com/microsoft/TypeScript.git', stars: '98k' },
    { name: 'eslint', repo: 'https://github.com/eslint/eslint.git', stars: '25k' },
  ]
};

// Directories
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');
const TEMP_DIR = path.join(projectRoot, 'temp-analysis');
const RESULTS_DIR = path.join(projectRoot, 'benchmark-results');
const CACHE_DIR = path.join(RESULTS_DIR, '.claude-cache');
const DOCS_BENCHMARKS_DIR = path.join(projectRoot, 'docs', 'benchmarks');

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

function generateCacheKey(filePath, fileContent, complexity, projectContext, isTruncated, analysisContext = '') {
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
    promptVersion: '1.2' // Increment when prompt changes
  };
  
  return crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex');
}

function getCachedExplanation(cacheKey) {
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

function setCachedExplanation(cacheKey, explanation) {
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

      // Handle rate limit (429) with exponential backoff
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const baseDelay = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Use retry-after header or default to 5s
        const backoffDelay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        const jitter = Math.random() * 1000; // Add jitter to avoid thundering herd
        const totalDelay = backoffDelay + jitter;
        
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
        const backoffDelay = 5000 * Math.pow(2, attempt - 1); // Exponential backoff starting at 5s
        const jitter = Math.random() * 1000;
        const totalDelay = backoffDelay + jitter;
        
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

async function explainComplexity(filePath, fileContent, complexity, projectContext, isTruncated, analysisContext = '') {
  // Check cache first - include analysis context in cache key for comparison mode
  const cacheKey = generateCacheKey(filePath, fileContent, complexity, projectContext, isTruncated, analysisContext);
  const cachedExplanation = !clearCache ? getCachedExplanation(cacheKey) : null;
  
  if (cachedExplanation) {
    console.log(`    💾 Using cached explanation for ${filePath}`);
    return { explanation: cachedExplanation, fromCache: true };
  }
  
  const truncationNote = isTruncated ? `\n\nIMPORTANT: This file has been truncated to ${MAX_FILE_SIZE} lines for analysis. Focus on the visible patterns and note if key logic might be missing.` : '';
  const contextNote = analysisContext ? `\n\nANALYSIS CONTEXT: ${analysisContext}` : '';
  
  const prompt = `Analyze this ${projectContext.language} file and explain why it has high cyclomatic complexity (${complexity}).

Project: ${projectContext.name} (${projectContext.description})
File: ${filePath}
Complexity: ${complexity} (threshold: ${COMPLEXITY_THRESHOLD})${truncationNote}${contextNote}

File content:
\`\`\`${projectContext.language}
${fileContent}
\`\`\`

ANALYSIS REQUIREMENTS:
1. BE BINARY: Choose EITHER "Justified" OR "Not Justified" - no middle ground
2. BE SPECIFIC: Name exact patterns, line numbers, and concrete refactoring steps
3. BE TECHNICAL: Use precise terminology (strategy pattern, factory, state machine, etc.)

JUSTIFICATION CRITERIA (choose ONE - no middle ground):
- **"Justified"**: Algorithmic necessity, performance constraints, or compatibility requirements that cannot be simplified
- **"Not Justified"**: Structural/architectural issues that design patterns and refactoring can resolve

Provide exactly these sections:
1. **Primary complexity driver** (single most important cause with line references)
2. **Business context** (what the code achieves in 1-2 sentences)
3. **Technical assessment** (specific patterns: switch complexity, nested conditions, state management, etc.)
4. **Complexity justification**:
   - "Justified": Inherent algorithmic complexity or performance requirements
   - "Not Justified": Structural/architectural issues that standard patterns can resolve
5. **Specific improvements** (if not justified, provide 2-3 concrete technical solutions with pattern names)

Summary:
- **Root cause**: [exact technical pattern, e.g. "180-case switch statement", "5-level nested conditionals"]
- **Justified**: [Yes/No] - [algorithmic reason OR structural problem]
- **Action**: [specific pattern/refactoring: "Replace with Strategy pattern", "Extract state machine", "Apply Command pattern" OR "None - inherent algorithmic complexity"]

Maximum 400 words. Be definitive, not diplomatic.`;

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
    setCachedExplanation(cacheKey, explanation);
    
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

async function analyzeProjectWithExplanations(project, category, excludeMode = false, comparisonContext = null) {
  const startTime = Date.now();
  const modeLabel = excludeMode ? ' (Production Only)' : '';
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
        
        const result = await explainComplexity(
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

async function generateInsightWithClaude(projectName, fullResult, prodResult, delta) {
  const projectContext = getProjectContext(projectName);
  
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
  
  const prompt = `Analyze this code quality comparison for ${projectName}:

Full Codebase Analysis: ${fullResult.analysis.grade} (${fullResult.analysis.score}/100)
Production Code Only: ${prodResult.analysis.grade} (${prodResult.analysis.score}/100)  
Score Delta: ${delta} points

Project: ${projectContext.name} - ${projectContext.description}
Files analyzed: Full=${fullResult.analysis.totalFiles}, Production=${prodResult.analysis.totalFiles}
Complexity: Full=${fullResult.analysis.avgComplexity}, Production=${prodResult.analysis.avgComplexity}${codeContext}

Based on the actual complexity patterns found in the code above, generate a concise technical insight (20-30 words) explaining WHY this score difference occurred. Consider:
- Architecture patterns that explain the difference
- Whether the complexity revealed/hidden is justified
- Specific technical factors (testing patterns, examples, utilities vs core logic)

Format your response as: "🟢/🟡/🔴 Category: Technical explanation based on the actual code patterns"

Use:
🟢 if delta >= +5 (production cleaner than tests/examples)
🟡 if delta between -5 and +5 (balanced)  
🔴 if delta <= -5 (production has hidden complexity issues)`;

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
    return data.content[0].text.trim();
    
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
  let markdown = `## Full vs Production Only Analysis Comparison

| Project | Stars | Full Analysis | Production Only | Delta | Insight |
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
      const insight = await generateInsightWithClaude(projectName, fullResult, prodResult, delta);
      
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
  const analysisType = isComparison ? 'Full vs Production Comparison' : (excludeUtility ? 'Production Code Only' : 'Full Codebase');
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
  
  let markdown = `# InsightCode Benchmark Explanations - ${analysisType}

## Methodology
- **Date**: ${date}
- **InsightCode Version**: 0.2.0
- **Analysis Type**: ${analysisType}${analysisFlag}
- **Total Projects Analyzed**: ${results.length}
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
    
    categoryResults.forEach(r => {
      markdown += `#### ${r.project} (⭐ ${r.stars})\n`;
      markdown += `- **Score**: ${r.analysis.grade} (${r.analysis.score}/100)\n`;
      markdown += `- **Files**: ${r.analysis.totalFiles} files, ${r.analysis.totalLines.toLocaleString()} lines\n`;
      markdown += `- **Complexity**: ${r.analysis.avgComplexity} average\n`;
      markdown += `- **Duplication**: ${r.analysis.avgDuplication ?? 'N/A'}%\n`;
      markdown += `- **Complex files explained**: ${r.explanations.length}\n`;
      markdown += `\n`;
    });
  });

  // Key findings
  markdown += `## Key Findings\n\n`;

  // Calculate averages by category
  const categoryAverages = ['small', 'medium', 'large'].map(cat => {
    const catResults = successfulResults.filter(r => r.category === cat);
    if (catResults.length === 0) return null;
    
    const avgScore = Math.round(catResults.reduce((sum, r) => sum + r.analysis.score, 0) / catResults.length);
    const avgComplexity = (catResults.reduce((sum, r) => sum + r.analysis.avgComplexity, 0) / catResults.length).toFixed(1);
    
    return { category: cat, avgScore, avgComplexity, count: catResults.length };
  }).filter(Boolean);

  markdown += `### Average Scores by Project Size\n\n`;
  categoryAverages.forEach(cat => {
    if (cat) {
      markdown += `- **${cat.category}** projects: Average score ${cat.avgScore}/100, complexity ${cat.avgComplexity}\n`;
    }
  });

  // Performance stats - separate InsightCode from total times
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

  // Grade distribution
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
      markdown += `- **${grade}**: ${count} project(s) - ${projects}\n`;
    }
  });

  // Best and worst scores
  const sortedByScore = successfulResults.sort((a, b) => b.analysis.score - a.analysis.score);
  if (sortedByScore.length > 0) {
    markdown += `\n### Score Range\n\n`;
    markdown += `- **Best score**: ${sortedByScore[0].project} with ${sortedByScore[0].analysis.grade} (${sortedByScore[0].analysis.score}/100)\n`;
    markdown += `- **Worst score**: ${sortedByScore[sortedByScore.length - 1].project} with ${sortedByScore[sortedByScore.length - 1].analysis.grade} (${sortedByScore[sortedByScore.length - 1].analysis.score}/100)\n`;
  }

  // Add scoring algorithm explanation for comparison mode
  if (isComparison) {
    // Générer dynamiquement les explications
    const scoringExplanation = await generateScoringAlgorithmExplanation(results);
    markdown += scoringExplanation;
    
    const duplicationAnalysis = await generateDuplicationAnalysis(results);
    markdown += duplicationAnalysis;
  }

  markdown += `\n## Detailed Complexity Explanations\n\n`;

  if (isComparison) {
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
      
      markdown += `### 📊 ${projectName} (⭐ ${full.stars})
**Full Analysis**: ${full.analysis.grade} (${full.analysis.score}/100) - ${full.analysis.avgComplexity} avg complexity
**Production Only**: ${production.analysis.grade} (${production.analysis.score}/100) - ${production.analysis.avgComplexity} avg complexity

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

      explanationMap.forEach((exps, key) => {
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
            const mode = index === 0 ? 'Full Analysis' : 'Production Only';
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

    // NOUVEAU : Générer les Key Findings dynamiquement
    const keyFindings = await generateDataDrivenFindings(allExplanations, results);
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
    console.log('📊 Mode: Full vs Production Comparison (--compare)');
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
    console.log(`\n📋 Will analyze ${projectsToAnalyze.length} projects in BOTH modes for comparison\n`);
    
    const fullResults = [];
    const productionResults = [];
    
    // Run full analysis first
    console.log('🔍 === PHASE 1: Full Codebase Analysis ===');
    for (const project of projectsToAnalyze) {
      const result = await analyzeProjectWithExplanations(project, project.category, false);
      fullResults.push(result);
      
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${project.name}-full-explanations.json`),
        JSON.stringify(result, null, 2)
      );
    }
    
    // Run production-only analysis second with comparison context
    console.log('\n🔍 === PHASE 2: Production-Only Analysis ===');
    for (const project of projectsToAnalyze) {
      const fullResult = fullResults.find(r => r.project === project.name);
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
      
      productionResults.push(result);
      
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${project.name}-production-explanations.json`),
        JSON.stringify(result, null, 2)
      );
    }
    
    // Generate comparison with Claude insights
    console.log('\n🧠 === PHASE 3: Generating Claude-Powered Insights ===');
    const comparisonTable = await generateComparisonTable(fullResults, productionResults);
    const allResults = [...fullResults, ...productionResults];
    const report = await generateExplanationReport(allResults, comparisonTable);
    
    // Save comparison report
    const date = new Date().toISOString().split('T')[0];
    const reportPath = path.join(RESULTS_DIR, `BENCHMARK-EXPLANATIONS-COMPARISON.md`);
    const jsonPath = path.join(RESULTS_DIR, `benchmark-explanations-comparison.json`);
    fs.writeFileSync(reportPath, report);
    fs.writeFileSync(jsonPath, JSON.stringify({ full: fullResults, production: productionResults }, null, 2));
    
    // Archive to docs
    const archivePath = path.join(DOCS_BENCHMARKS_DIR, `benchmark-explanations-comparison-${date}.md`);
    fs.writeFileSync(archivePath, report);
    
    console.log('\n✅ Comparison analysis complete!');
    console.log(`📄 Report saved to: ${reportPath}`);
    console.log(`📊 Full results saved to: ${jsonPath}`);
    console.log(`📁 Archived to: docs/benchmarks/benchmark-explanations-comparison-${date}.md`);
    
    const successful = allResults.filter(r => !r.error).length;
    const totalExplanations = allResults.reduce((sum, r) => sum + (r.explanations?.length || 0), 0);
    const cacheHits = allResults.reduce((sum, r) => {
      return sum + (r.explanations?.filter(e => e.fromCache === true).length || 0);
    }, 0);
    const apiCalls = totalExplanations - cacheHits;
    
    console.log(`\n📈 Summary: ${successful}/${allResults.length} analyses completed, ${totalExplanations} files explained`);
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
    
    // Archive to docs/benchmarks (permanent documentation)
    const successful = results.filter(r => !r.error).length;
    if (successful >= results.length - 2) { // Allow 2 failures
      const archivePath = path.join(DOCS_BENCHMARKS_DIR, `benchmark-explanations-${date}${suffix}${specificSuffix}.md`);
      fs.writeFileSync(archivePath, report);
      console.log(`📁 Archived to: docs/benchmarks/benchmark-explanations-${date}${suffix}${specificSuffix}.md`);
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
async function generateDuplicationAnalysis(results) {
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

  const prompt = `Analyze these duplication patterns where production-only analysis shows different results:

${JSON.stringify(duplicationPatterns, null, 2)}

Generate a brief technical explanation for why duplication metrics change when excluding test/example files. 
Consider:
- Test setup/teardown patterns
- Example code repetition
- Mock/fixture duplication

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
    return `\n### Duplication Analysis\n\n${data.content[0].text}`;

  } catch (error) {
    console.error(`❌ Failed to generate duplication analysis: ${error.message}`);
    return '';
  }
}
async function generateScoringAlgorithmExplanation(results) {
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
    return `\n## Understanding the Scoring Algorithm\n\n${data.content[0].text}`;

  } catch (error) {
    console.error(`❌ Failed to generate scoring explanation: ${error.message}`);
    // Fallback minimal
    return `\n## Understanding the Scoring Algorithm

  The scoring algorithm uses three weighted components (Complexity 40%, Duplication 30%, File Size 30%). 
  In some cases, production-only scores improve despite higher complexity because other metrics improve significantly when excluding test files.`;
  }
}


async function generateDataDrivenFindings(allExplanations, results) {
  // Analyser les vrais patterns dans les explications
  const patterns = analyzeExplanationPatterns(allExplanations);
  const justificationStats = analyzeJustificationDistribution(allExplanations);
  const projectStats = analyzeProjectDistribution(results);
  
  const prompt = `Based on analysis of ${allExplanations.length} complex files across ${results.length} projects:

Pattern Analysis:
${JSON.stringify(patterns, null, 2)}

Justification Distribution:
- Fully justified: ${justificationStats.justified}% 
- Partly justified: ${justificationStats.partlyJustified}%
- Not justified: ${justificationStats.notJustified}%

Project Distribution:
- Projects with F grade: ${projectStats.fGradeCount}
- Average complexity in F projects: ${projectStats.avgComplexityF}
- Most common issue type: ${projectStats.topIssueType}

Generate 4-5 key findings that are:
1. Data-driven (use the actual numbers)
2. Specific to what was found (not generic statements)
3. Actionable for developers
4. Honest about both justified and unjustified complexity

Format as markdown bullet points starting with "### Key Findings"`;

  try {
    const requestBody = {
      model: 'claude-sonnet-4-0',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };
    
    const data = await callClaudeWithRetry(requestBody, 'key-findings');
    return data.content[0].text;
    
  } catch (error) {
    // Fallback basé sur les données réelles
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
  const fGradeProjects = successful.filter(r => r.analysis.grade === 'F');
  
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
    }
  };
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

main().catch(console.error);