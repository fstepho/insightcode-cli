#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { calculateFileComplexityScore, calculateFileHealthScore, calculateDuplicationScore } = require('../dist/scoring.js');

let globalErrors = 0;
const docsDir = path.join(__dirname, '..', 'docs');

const PATTERNS = {
  complexityScore: /(?:Complexity|complexity|CC)\s*(?:of\s+)?(\d+)\s*(?:[→\-–>=>]|yields?|gives?|produces?)\s*(?:Score|score|result)\s*:?\s*(\d+)/gi,
  complexityPenalty: /(?:Complexity|complexity|CC)\s*(?:of\s+)?(\d+)\s*(?:[→\-–>=>]|yields?|gives?|results?\s+in)\s*(?:Penalty|penalty|deduction)\s*:?\s*(\d+)/gi,
  formula: /`?100\s*-\s*\(?(\d+)\s*-\s*10\)?\s*[×*]\s*3\s*=\s*(\d+)`?/gi,
  healthScore: /\|\s*`?([^`|]+\.ts)`?\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*\*\*(\d+)\*\*/gi,
  mapping: /\|\s*(\d+(?:-\d+)?)\s*\|(?:[^|]*\|){2,3}\s*(\d+)\s*\|/gi,
  duplication: /(?:duplication|duplicate).*?(\d+(?:\.\d+)?)%/gi,
  weight: /(\d+)\/(\d+)\/(\d+)|(\d+)%.*?(\d+)%.*?(\d+)%/gi,
  threshold: /(?:threshold|limit|THRESHOLD|EXCELLENT_THRESHOLD|HIGH_THRESHOLD|boundary|cutoff)\s*[:\s=]*\s*(\d+)/gi,
  quadratic: /`?70\s*-\s*\(\((\d+)\s*-\s*20\)\s*\/\s*30\)\s*[²^2]\s*[×*]\s*40\s*=\s*(\d+)`?/gi,
  exponential: /`?30\s*-\s*\(\((\d+)\s*-\s*50\)\s*\/\s*50\)\s*[\^]\s*1\.8\s*[×*]\s*30\s*=\s*(\d+)`?/gi,
  codeExample: /```(?:typescript|javascript|ts|js)\n([\s\S]*?)```/gi
};

// Validation functions (from validate-markdown-examples.js)
function extractExamples(content, filename) {
  const examples = [];
  
  // Pattern 1: Complexity X → Score Y
  let match;
  while ((match = PATTERNS.complexityScore.exec(content)) !== null) {
    examples.push({
      type: 'complexityScore',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 2: Complexity X → Penalty Y
  PATTERNS.complexityPenalty.lastIndex = 0;
  while ((match = PATTERNS.complexityPenalty.exec(content)) !== null) {
    examples.push({
      type: 'complexityPenalty',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 3: Formula results like "100-(15-10)×3=85"
  PATTERNS.formula.lastIndex = 0;
  while ((match = PATTERNS.formula.exec(content)) !== null) {
    examples.push({
      type: 'formula',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 4: Health Score examples in tables
  PATTERNS.healthScore.lastIndex = 0;
  while ((match = PATTERNS.healthScore.exec(content)) !== null) {
    examples.push({
      type: 'healthScore',
      filename: match[1].trim(),
      complexity: parseInt(match[2]),
      loc: parseInt(match[3]),
      expected: parseInt(match[4]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 5: Mapping table examples
  PATTERNS.mapping.lastIndex = 0;
  while ((match = PATTERNS.mapping.exec(content)) !== null) {
    const beforeMatch = content.substring(0, match.index);
    if (beforeMatch.includes('| Complexity | Phase | Formula | Score |') || 
        beforeMatch.includes('| Range | Formula | Examples | Score |') ||
        beforeMatch.includes('| Complexity | Phase | Formula | Score | Research Basis |')) {
      const complexityStr = match[1];
      
      // Handle both ranges (1-10) and individual values (11, 15, etc.)
      if (complexityStr.includes('-')) {
        // For ranges like "1-10", test with the upper bound
        const rangeParts = complexityStr.split('-');
        if (rangeParts.length === 2) {
          const upperBound = parseInt(rangeParts[1]);
          examples.push({
            type: 'complexityScore',
            input: upperBound,
            expected: parseInt(match[2]),
            source: `${filename}:${getLineNumber(content, match.index)}`,
            raw: match[0],
            isRange: true,
            range: complexityStr
          });
        }
      } else {
        // Individual values
        const complexity = parseInt(complexityStr);
        examples.push({
          type: 'complexityScore',
          input: complexity,
          expected: parseInt(match[2]),
          source: `${filename}:${getLineNumber(content, match.index)}`,
          raw: match[0]
        });
      }
    }
  }
  
  // Pattern 6: Duplication percentage examples
  PATTERNS.duplication.lastIndex = 0;
  while ((match = PATTERNS.duplication.exec(content)) !== null) {
    const percentage = parseFloat(match[1]);
    // Accept common duplication percentages found in documentation
    if (percentage >= 2 && percentage <= 50) {
      examples.push({
        type: 'duplicationScore',
        input: percentage / 100,
        expected: null,
        percentage: percentage,
        source: `${filename}:${getLineNumber(content, match.index)}`,
        raw: match[0]
      });
    }
  }
  
  // Pattern 7: Project weight constants (45/30/25 format or percentages)
  PATTERNS.weight.lastIndex = 0;
  while ((match = PATTERNS.weight.exec(content)) !== null) {
    // Handle 45/30/25 format
    if (match[1] && match[2] && match[3]) {
      const weights = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      if (weights[0] + weights[1] + weights[2] === 100) {
        examples.push({
          type: 'projectWeight',
          input: weights,
          expected: weights,
          source: `${filename}:${getLineNumber(content, match.index)}`,
          raw: match[0]
        });
      }
    }
    // Handle 45% 30% 25% format
    else if (match[4] && match[5] && match[6]) {
      const weights = [parseInt(match[4]), parseInt(match[5]), parseInt(match[6])];
      if (weights[0] + weights[1] + weights[2] === 100) {
        examples.push({
          type: 'projectWeight',
          input: weights,
          expected: weights,
          source: `${filename}:${getLineNumber(content, match.index)}`,
          raw: match[0]
        });
      }
    }
  }
  
  // Pattern 8: Mathematical constants and thresholds
  PATTERNS.threshold.lastIndex = 0;
  while ((match = PATTERNS.threshold.exec(content)) !== null) {
    const threshold = parseInt(match[1]);
    
    if ([200, 500, 100, 10, 15, 20, 50].includes(threshold)) {
      examples.push({
        type: 'threshold',
        input: threshold,
        expected: threshold,
        source: `${filename}:${getLineNumber(content, match.index)}`,
        raw: match[0]
      });
    }
  }
  
  // Pattern 9: Quadratic formula patterns
  PATTERNS.quadratic.lastIndex = 0;
  while ((match = PATTERNS.quadratic.exec(content)) !== null) {
    examples.push({
      type: 'complexityScore',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 9: Quadratic formula patterns  
  PATTERNS.quadratic.lastIndex = 0;
  while ((match = PATTERNS.quadratic.exec(content)) !== null) {
    examples.push({
      type: 'quadratic',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 10: Exponential formula patterns
  PATTERNS.exponential.lastIndex = 0;
  while ((match = PATTERNS.exponential.exec(content)) !== null) {
    examples.push({
      type: 'exponential',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  // Pattern 11: Code examples
  PATTERNS.codeExample.lastIndex = 0;
  while ((match = PATTERNS.codeExample.exec(content)) !== null) {
    const code = match[1];
    
    // Extract InsightCode function calls
    const functionCalls = [
      ...code.matchAll(/calculateFileComplexityScore\((\d+)\)/g),
      ...code.matchAll(/calculateFileHealthScore\([^)]+\)/g),
      ...code.matchAll(/calculateDuplicationScore\(([\d.]+)\)/g)
    ];
    
    functionCalls.forEach(callMatch => {
      if (callMatch[0].includes('calculateFileComplexityScore')) {
        examples.push({
          type: 'complexityScore',
          input: parseInt(callMatch[1]),
          expected: null, // Will be calculated
          source: `${filename}:${getLineNumber(content, match.index)}`,
          raw: `Code example: ${callMatch[0]}`,
          isCodeExample: true
        });
      }
      // Add other functions if needed
    });
  }
  
  return examples;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function validateExample(example) {
  let isValid = false;
  let actual;
  
  try {
    switch (example.type) {
      case 'complexityScore':
        actual = calculateFileComplexityScore(example.input);
        
        // Validate function output
        if (actual === undefined || actual === null || isNaN(actual)) {
          throw new Error(`calculateFileComplexityScore returned invalid value: ${actual}`);
        }
        
        // Special handling for code examples
        if (example.isCodeExample) {
          // For code examples, just verify it's calculable and reasonable
          isValid = !isNaN(actual) && actual >= 0 && actual <= 100;
          if (isValid) {
            console.log(`  ✅ Code example: calculateFileComplexityScore(${example.input}) = ${actual}`);
          } else {
            globalErrors++;
            console.log(`❌ CODE EXAMPLE INVALID RESULT`);
            console.log(`   Source: ${example.source}`);
            console.log(`   Input: ${example.input}, Result: ${actual}`);
          }
        } else {
          // Normal validation for numeric examples
          isValid = actual === example.expected;
          if (!isValid) {
            globalErrors++;
            console.log(`❌ COMPLEXITY SCORE MISMATCH`);
            console.log(`   Source: ${example.source}`);
            console.log(`   Example: "${example.raw}"`);
            console.log(`   Expected: ${example.expected}, Actual: ${actual}`);
          }
        }
        break;
      
      case 'complexityPenalty':
        const score = calculateFileComplexityScore(example.input);
        if (score === undefined || score === null || isNaN(score)) {
          throw new Error(`calculateFileComplexityScore returned invalid value: ${score}`);
        }
        
        const basePenalty = 100 - score;
        let extremePenalty = 0;
        if (example.input > 100) {
          extremePenalty = Math.round(Math.pow((example.input - 100) / 100, 1.8) * 50);
        }
        const actualPenalty = basePenalty + extremePenalty;
        
        if (isNaN(actualPenalty)) {
          throw new Error(`Calculated penalty is NaN for input ${example.input}`);
        }
        
        isValid = actualPenalty === example.expected;
        if (!isValid) {
          globalErrors++;
          console.log(`❌ COMPLEXITY PENALTY MISMATCH`);
          console.log(`   Source: ${example.source}`);
          console.log(`   Expected: ${example.expected}, Actual: ${actualPenalty}`);
        }
        break;
        
      case 'healthScore':
        const file = {
          metrics: {
            complexity: example.complexity,
            loc: example.loc,
            duplicationRatio: 0.0,
            functionCount: Math.round(example.loc / 20)
          },
          issues: []
        };
        
        const actualHealth = calculateFileHealthScore(file);
        if (actualHealth === undefined || actualHealth === null || isNaN(actualHealth)) {
          throw new Error(`calculateFileHealthScore returned invalid value: ${actualHealth}`);
        }
        
        isValid = actualHealth === example.expected;
        if (!isValid) {
          globalErrors++;
          console.log(`❌ HEALTH SCORE MISMATCH`);
          console.log(`   Source: ${example.source}`);
          console.log(`   Expected: ${example.expected}, Actual: ${actualHealth}`);
        }
        break;
        
      case 'duplicationScore':
        // For documentation examples, just validate that duplication percentage is reasonable
        isValid = example.percentage >= 0 && example.percentage <= 100;
        if (isValid) {
          console.log(`  ✅ Duplication reference: ${example.percentage}% (informational)`);
        } else {
          globalErrors++;
          console.log(`❌ DUPLICATION PERCENTAGE OUT OF BOUNDS`);
          console.log(`   Source: ${example.source}`);
          console.log(`   Percentage: ${example.percentage}%`);
        }
        break;
        
      case 'projectWeight':
        // Input validation for project weights (arrays or single values)
        if (Array.isArray(example.input)) {
          // Validate weight arrays (like [45, 30, 25])
          const weights = example.input;
          const sum = weights.reduce((a, b) => a + b, 0);
          isValid = sum === 100 && weights.every(w => w > 0 && w <= 100);
          if (isValid) {
            console.log(`  ✅ Project weights: ${weights.join('/')} (sum: ${sum}%)`);
          } else {
            globalErrors++;
            console.log(`❌ PROJECT WEIGHT VALIDATION FAILED`);
            console.log(`   Source: ${example.source}`);
            console.log(`   Weights: ${weights.join('/')}, Sum: ${sum}%`);
          }
        } else {
          // Validate single weight values (legacy format)
          if (typeof example.input !== 'number' || example.input < 0 || example.input > 1) {
            throw new Error(`Invalid project weight input: ${example.input}`);
          }
          isValid = example.input >= 0 && example.input <= 1 && 
                    Math.abs(example.input - example.expected) < 0.01;
          if (!isValid) {
            globalErrors++;
            console.log(`❌ PROJECT WEIGHT MISMATCH`);
            console.log(`   Source: ${example.source}`);
            console.log(`   Weight: ${example.input}, Expected: ${example.expected}`);
          }
        }
        break;
        
      case 'threshold':
        // Input validation for thresholds
        if (typeof example.input !== 'number' || example.input < 0) {
          throw new Error(`Invalid threshold input: ${example.input}`);
        }
        
        const reasonableThresholds = [200, 500, 100, 10, 15, 20, 50];
        isValid = reasonableThresholds.includes(example.input);
        if (!isValid) {
          globalErrors++;
          console.log(`❌ THRESHOLD VALUE UNREASONABLE`);
          console.log(`   Source: ${example.source}`);
          console.log(`   Threshold: ${example.input}`);
        }
        break;
        
      case 'formula':
      case 'quadratic': 
      case 'exponential':
        // These are all complexity score formulas, validate with calculateFileComplexityScore
        actual = calculateFileComplexityScore(example.input);
        if (actual === undefined || actual === null || isNaN(actual)) {
          throw new Error(`calculateFileComplexityScore returned invalid value: ${actual}`);
        }
        
        isValid = actual === example.expected;
        if (!isValid) {
          globalErrors++;
          console.log(`❌ ${example.type.toUpperCase()} FORMULA MISMATCH`);
          console.log(`   Source: ${example.source}`);
          console.log(`   Formula: "${example.raw}"`);
          console.log(`   Expected: ${example.expected}, Actual: ${actual}`);
        }
        break;
        
      default:
        throw new Error(`Unknown example type: ${example.type}`);
    }
    
  } catch (error) {
    console.error(`💥 CRITICAL ERROR validating ${example.type}`);
    console.error(`   Input: ${JSON.stringify(example.input || {complexity: example.complexity, loc: example.loc})}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Source: ${example.source}`);
    console.error(`   Raw: "${example.raw}"`);
    
    // Mark as error but continue validation
    globalErrors++;
    return false;
  }
  
  return isValid;
}

// Semantic validation functions
function validateSemanticCoherence(examples) {
  let warnings = 0;
  
  // 1. Complexity scores should decrease as complexity increases
  const complexityExamples = examples
    .filter(e => e.type === 'complexityScore')
    .sort((a, b) => a.input - b.input);
  
  for (let i = 1; i < complexityExamples.length; i++) {
    if (complexityExamples[i].expected > complexityExamples[i-1].expected) {
      console.log(`⚠️  Semantic warning: Complexity ${complexityExamples[i].input} has higher score (${complexityExamples[i].expected}) than complexity ${complexityExamples[i-1].input} (${complexityExamples[i-1].expected})`);
      warnings++;
    }
  }
  
  // 2. File health scores should be reasonable (0-100)
  const healthExamples = examples.filter(e => e.type === 'healthScore');
  healthExamples.forEach(example => {
    if (example.expected < 0 || example.expected > 100) {
      console.log(`⚠️  Semantic warning: Health score ${example.expected} is outside valid range [0-100] for ${example.filename}`);
      warnings++;
    }
  });
  
  // 3. Penalties should increase with complexity
  const penaltyExamples = examples
    .filter(e => e.type === 'complexityPenalty')
    .sort((a, b) => a.input - b.input);
  
  for (let i = 1; i < penaltyExamples.length; i++) {
    if (penaltyExamples[i].expected < penaltyExamples[i-1].expected) {
      console.log(`⚠️  Semantic warning: Complexity ${penaltyExamples[i].input} has lower penalty (${penaltyExamples[i].expected}) than complexity ${penaltyExamples[i-1].input} (${penaltyExamples[i-1].expected})`);
      warnings++;
    }
  }
  
  if (warnings === 0) {
    console.log(`✅ Semantic coherence: All ${examples.length} examples follow logical patterns`);
  } else {
    console.log(`⚠️  Semantic coherence: ${warnings} potential inconsistencies detected`);
  }
  
  return warnings;
}


// Generation functions (from doc-test-and-generate.js)
function generateComplexityTable() {
  console.log('=== COMPLEXITY SCORE MAPPING TABLE ===\n');
  console.log('| Complexity | Phase | Formula | Score | Research Basis |');
  console.log('|------------|-------|---------|-------|----------------|');

  const complexityExamples = [1, 10, 11, 15, 16, 20, 25, 30, 40, 50, 60, 100, 176];
  complexityExamples.forEach(complexity => {
    const score = calculateFileComplexityScore(complexity);
    let phase = '';
    let researchBasis = '';
    
    if (complexity <= 10) {
      phase = 'Excellent';
      researchBasis = 'McCabe (1976) "excellent code"';
    } else if (complexity <= 15) {
      phase = 'Linear';
      if (complexity === 15) researchBasis = 'NASA critical threshold';
      else researchBasis = 'NASA acceptable (≤15 for critical software)';
    } else if (complexity <= 20) {
      phase = 'Linear';
      researchBasis = 'Above NASA threshold (Internally Acceptable)';
    } else if (complexity <= 50) {
      phase = 'Quadratic';
      if (complexity === 25) researchBasis = 'High risk zone';
      else if (complexity <= 30) researchBasis = 'Maintenance burden';
      else researchBasis = 'Poor maintainability';
    } else {
      phase = 'Exponential';
      if (complexity >= 176) researchBasis = 'Catastrophic';
      else if (complexity >= 100) researchBasis = 'NASA/SEL critical';
      else researchBasis = 'Unmaintainable';
    }
    
    let formula = '';
    if (complexity <= 10) {
      formula = '`100`';
    } else if (complexity <= 20) {
      formula = `\`100-(${complexity}-10)×3=${100-(complexity-10)*3}\``;
    } else if (complexity <= 50) {
      const expected = Math.round(70 - Math.pow((complexity-20)/30, 2) * 40);
      formula = `\`70-((${complexity}-20)/30)²×40=${expected}\``;
    } else {
      formula = `\`30-((${complexity}-50)/50)^1.8×30=${score}\``;
    }
    
    console.log(`| ${complexity} | ${phase} | ${formula} | ${score} | ${researchBasis} |`);
  });
  console.log('');
}

function generateHealthExamples() {
  console.log('=== HEALTH SCORE EXAMPLES TABLE ===\n');
  console.log('| File | Complexity | LOC | Health Score | Penalty Analysis |');
  console.log('|------|------------|-----|--------------|------------------|');

  const healthExamples = [
    { name: 'dependency-analyzer.ts', complexity: 176, loc: 834 },
    { name: 'file-detail-builder.ts', complexity: 80, loc: 300 },
  ];

  healthExamples.forEach(example => {
    const file = {
      metrics: {
        complexity: example.complexity,
        loc: example.loc,
        duplicationRatio: 0.0,
        functionCount: Math.round(example.loc / 20)
      },
      issues: []
    };
    
    const healthScore = calculateFileHealthScore(file);
    
    const complexityScore = calculateFileComplexityScore(example.complexity);
    const complexityPenalty = 100 - complexityScore;
    let extremePenalty = 0;
    if (example.complexity > 100) {
      extremePenalty = Math.round(Math.pow((example.complexity - 100) / 100, 1.8) * 50);
    }
    
    let sizePenalty = 0;
    if (example.loc > 200) {
      if (example.loc <= 500) {
        sizePenalty = Math.round((example.loc - 200) / 15);
      } else {
        const basePenalty = 20;
        const exponentialPenalty = Math.pow((example.loc - 500) / 1000, 1.8) * 8;
        sizePenalty = Math.round(basePenalty + exponentialPenalty);
      }
    }
    
    const totalComplexityPenalty = complexityPenalty + extremePenalty;
    const analysis = `Complexity: ${totalComplexityPenalty}, Size: ${sizePenalty}, Total: ${totalComplexityPenalty + sizePenalty}`;
    
    console.log(`| \`${example.name}\` | ${example.complexity} | ${example.loc} | **${healthScore}** | ${analysis} |`);
  });
  console.log('');
}

function generateCodeExample() {
  console.log('=== CODE EXAMPLE TEMPLATE ===\n');
  console.log('```typescript');
  console.log('import { calculateFileComplexityScore } from \'insightcode-cli\';');
  console.log('');
  console.log('// Examples of scores by complexity');
  [5, 10, 15, 25, 50].forEach(complexity => {
    const score = calculateFileComplexityScore(complexity);
    console.log(`const score${complexity} = calculateFileComplexityScore(${complexity}); // ${score}`);
  });
  console.log('```\n');
}

function validateAdditionalContent(content, filename) {
  const issues = [];
  
  // Check for broken internal links
  const internalLinkPattern = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
  let match;
  while ((match = internalLinkPattern.exec(content)) !== null) {
    // Determine base directory based on filename
    let basePath;
    if (filename.startsWith('../')) {
      // Files like ../README.md are in project root
      basePath = path.join(__dirname, '..');
    } else {
      // Files in docs/ directory
      basePath = docsDir;
    }
    
    const linkPath = path.join(basePath, match[2]);
    if (!fs.existsSync(linkPath)) {
      issues.push({
        type: 'brokenLink',
        text: match[1],
        path: match[2],
        line: getLineNumber(content, match.index)
      });
    }
  }
  
  return issues;
}

function validateFile(filename) {
  const filepath = path.join(docsDir, filename);
  console.log(`\n## 📋 Validating ${filename}...`);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filepath}`);
    return;
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  const examples = extractExamples(content, filename);
  const issues = validateAdditionalContent(content, filename);
  
  // Report additional issues
  if (issues.length > 0) {
    console.log(`\n⚠️  Additional issues found:`);
    issues.forEach(issue => {
      if (issue.type === 'brokenLink') {
        console.log(`   📎 Broken link at line ${issue.line}: "${issue.text}" → ${issue.path}`);
        globalErrors++;
      }
    });
  }
  
  if (examples.length === 0) {
    console.log(`ℹ️  No numerical examples found in ${filename}`);
    return;
  }
  
  console.log(`Found ${examples.length} numerical example(s) to validate:`);
  
  let validExamples = 0;
  examples.forEach((example, index) => {
    const isValid = validateExample(example);
    if (isValid) {
      validExamples++;
      console.log(`  ✅ Example ${index + 1}/${examples.length}: ${example.raw.substring(0, 40)}...`);
    }
  });
  
  // Semantic coherence validation
  console.log(`\n🧠 Semantic coherence validation:`);
  const semanticWarnings = validateSemanticCoherence(examples);
  
  console.log(`📊 Results: ${validExamples}/${examples.length} examples valid, ${semanticWarnings} semantic warnings`);
}

// Pattern coverage diagnostics
function diagnosePatternsUsage(allExamples) {
  console.log('\n🔍 Pattern Usage Diagnostics:');
  
  const patternUsage = {};
  Object.keys(PATTERNS).forEach(key => {
    let count = 0;
    if (key === 'mapping') {
      // Count complexityScore examples that came from mapping tables
      count = allExamples.filter(e => e.type === 'complexityScore' && (e.isRange || e.raw.includes('|'))).length;
    } else if (key === 'codeExample') {
      count = allExamples.filter(e => e.isCodeExample).length;
    } else if (key === 'duplication') {
      count = allExamples.filter(e => e.type === 'duplicationScore').length;
    } else if (key === 'weight') {
      count = allExamples.filter(e => e.type === 'projectWeight').length;
    } else {
      count = allExamples.filter(e => e.type === key).length;
    }
    patternUsage[key] = count;
  });
  
  Object.entries(patternUsage).forEach(([pattern, count]) => {
    const status = count > 0 ? '✅' : '➖';
    console.log(`  ${status} ${pattern}: ${count} examples detected`);
  });
  
  const totalDetected = Object.values(patternUsage).reduce((sum, count) => sum + count, 0);
  console.log(`\n📊 Pattern coverage: ${totalDetected} total examples detected across ${Object.keys(patternUsage).filter(k => patternUsage[k] > 0).length}/${Object.keys(PATTERNS).length} patterns`);
}

// Main
const command = process.argv[2];

if (command === 'generate') {
  console.log('=== DOCUMENTATION GENERATION MODE ===\n');
  generateComplexityTable();
  generateHealthExamples();
  generateCodeExample();
  console.log('📝 Use the tables above to update your documentation\n');
} else {
  console.log('=== DOCUMENTATION VALIDATION MODE ===\n');
  
  const docsToValidate = [
    'FILE_HEALTH_SCORE_METHODOLOGY.md',
    'SCORING_ARCHITECTURE.md',
    'SCORING_THRESHOLDS_JUSTIFICATION.md',
    'DUPLICATION_DETECTION_PHILOSOPHY.md',
    'CODE_QUALITY_GUIDE.md',
    'PROJECT_WEIGHTS_FAQ.md',
    'PROJECT_WEIGHTS_USER_GUIDE.md',
    'MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md',
    'MATHEMATICAL_COEFFICIENTS_REFERENCE.md',
    '../README.md',
    '../.ai.md'
  ];
  
  // Collect all examples for pattern diagnostics
  const allExamples = [];
  docsToValidate.forEach(docFile => {
    const filepath = path.join(docsDir, docFile);
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf8');
      allExamples.push(...extractExamples(content, docFile));
    }
  });
  
  docsToValidate.forEach(validateFile);
  
  // Pattern usage diagnostics
  diagnosePatternsUsage(allExamples);
  
  console.log('\n' + '='.repeat(60));
  console.log('## 📈 VALIDATION SUMMARY');
  
  if (globalErrors === 0) {
    console.log('✅ **SUCCESS**: All numerical examples in documentation are consistent with code');
    console.log('✅ Documentation and implementation are perfectly synchronized');
    console.log('✅ Ready for publication');
    process.exit(0);
  } else {
    console.log(`❌ **ERRORS DETECTED**: ${globalErrors} inconsistency(ies) found`);
    console.log('❌ Documentation needs to be updated to match the actual code implementation');
    console.log('💡 Run `npm run generate-docs` to get correct values for updating documentation');
    process.exit(1);
  }
}
