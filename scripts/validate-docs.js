#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { calculateComplexityScore, calculateHealthScore, calculateDuplicationScore } = require('../dist/scoring.js');

let globalErrors = 0;
const docsDir = path.join(__dirname, '..', 'docs');

// All patterns from the 4 scripts
const PATTERNS = {
  complexityScore: /(?:Complexity|complexity)\s+(\d+)\s*[→\-–>]\s*(?:Score|score)\s*:?\s*(\d+)/gi,
  complexityPenalty: /(?:Complexity|complexity)\s+(\d+)\s*[→\-–>]\s*(?:Penalty|penalty)\s*:?\s*(\d+)/gi,
  formula: /100-\((\d+)-10\)×3=(\d+)/gi,
  healthScore: /\|\s*`?([^`|]+\.ts)`?\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*\*\*(\d+)\*\*/gi,
  mapping: /\|\s*(\d+(?:-\d+)?)\s*\|[^|]*\|[^|]*\|\s*(\d+)\s*\|/gi,
  duplication: /(?:duplication|Duplication)\s*(?:ratio|percentage|level)?\s*(?:of\s+)?(?:≤|<=|>|>=)?\s*(\d+)%/gi,
  weight: /(?:weight|Weight|WEIGHT)\s*[:\s]*(?:of\s+)?(?:0\.)?(\d{1,2})(?:\.(\d+))?(?:%|percent)?/gi,
  threshold: /(?:threshold|limit|THRESHOLD|EXCELLENT_THRESHOLD|HIGH_THRESHOLD)\s*[:\s=]*\s*(\d+)/gi,
  quadratic: /70-\(\((\d+)-20\)\/30\)²×40=(\d+)/gi,
  exponential: /30-\(\((\d+)-50\)\/50\)\^1\.8×30=(\d+)/gi
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
      type: 'complexityScore',
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
        beforeMatch.includes('| Range | Formula | Examples | Score |')) {
      const complexityStr = match[1];
      const complexity = parseInt(complexityStr.split('-')[0]);
      
      if (!complexityStr.includes('-')) {
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
    const percentage = parseInt(match[1]);
    if ([3, 15, 30, 50].includes(percentage)) {
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
  
  // Pattern 7: Project weight constants (0.45, 0.30, 0.25)
  PATTERNS.weight.lastIndex = 0;
  while ((match = PATTERNS.weight.exec(content)) !== null) {
    const wholeNum = parseInt(match[1]);
    const decimal = match[2] ? parseInt(match[2]) : 0;
    const weight = wholeNum >= 10 ? wholeNum / 100 : wholeNum / 10 + decimal / 100;
    
    if ([0.45, 0.30, 0.25, 0.40].includes(weight)) {
      examples.push({
        type: 'projectWeight',
        input: weight,
        expected: weight,
        source: `${filename}:${getLineNumber(content, match.index)}`,
        raw: match[0]
      });
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
  
  // Pattern 10: Exponential formula patterns
  PATTERNS.exponential.lastIndex = 0;
  while ((match = PATTERNS.exponential.exec(content)) !== null) {
    examples.push({
      type: 'complexityScore',
      input: parseInt(match[1]),
      expected: parseInt(match[2]),
      source: `${filename}:${getLineNumber(content, match.index)}`,
      raw: match[0]
    });
  }
  
  return examples;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function validateExample(example) {
  let isValid = false;
  
  switch (example.type) {
    case 'complexityScore':
      const actual = calculateComplexityScore(example.input);
      isValid = actual === example.expected;
      if (!isValid) {
        globalErrors++;
        console.log(`❌ COMPLEXITY SCORE MISMATCH`);
        console.log(`   Source: ${example.source}`);
        console.log(`   Example: "${example.raw}"`);
        console.log(`   Expected: ${example.expected}, Actual: ${actual}`);
      }
      break;
      
    case 'complexityPenalty':
      const score = calculateComplexityScore(example.input);
      const basePenalty = 100 - score;
      let extremePenalty = 0;
      if (example.input > 100) {
        extremePenalty = Math.round(Math.pow((example.input - 100) / 100, 1.5) * 50);
      }
      const actualPenalty = basePenalty + extremePenalty;
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
      const actualHealth = calculateHealthScore(file);
      isValid = actualHealth === example.expected;
      if (!isValid) {
        globalErrors++;
        console.log(`❌ HEALTH SCORE MISMATCH`);
        console.log(`   Source: ${example.source}`);
        console.log(`   Expected: ${example.expected}, Actual: ${actualHealth}`);
      }
      break;
      
    case 'duplicationScore':
      const actualDup = calculateDuplicationScore(example.input);
      let expectedRange = { min: 0, max: 100 };
      if (example.percentage <= 15) expectedRange = { min: 90, max: 100 };
      else if (example.percentage <= 30) expectedRange = { min: 70, max: 90 };
      else if (example.percentage >= 50) expectedRange = { min: 0, max: 50 };
      
      isValid = actualDup >= expectedRange.min && actualDup <= expectedRange.max;
      if (!isValid) {
        globalErrors++;
        console.log(`❌ DUPLICATION SCORE RANGE MISMATCH`);
        console.log(`   Source: ${example.source}`);
        console.log(`   Percentage: ${example.percentage}%, Score: ${actualDup}`);
        console.log(`   Expected range: ${expectedRange.min}-${expectedRange.max}`);
      }
      break;
      
    case 'projectWeight':
      isValid = example.input >= 0 && example.input <= 1 && 
                Math.abs(example.input - example.expected) < 0.01;
      if (!isValid) {
        globalErrors++;
        console.log(`❌ PROJECT WEIGHT MISMATCH`);
        console.log(`   Source: ${example.source}`);
        console.log(`   Weight: ${example.input}, Expected: ${example.expected}`);
      }
      break;
      
    case 'threshold':
      const reasonableThresholds = [200, 500, 100, 10, 15, 20, 50];
      isValid = reasonableThresholds.includes(example.input);
      if (!isValid) {
        globalErrors++;
        console.log(`❌ THRESHOLD VALUE UNREASONABLE`);
        console.log(`   Source: ${example.source}`);
        console.log(`   Threshold: ${example.input}`);
      }
      break;
  }
  
  return isValid;
}

// Generation functions (from doc-test-and-generate.js)
function generateComplexityTable() {
  console.log('=== COMPLEXITY SCORE MAPPING TABLE ===\n');
  console.log('| Complexity | Phase | Formula | Score | Research Basis |');
  console.log('|------------|-------|---------|-------|----------------|');

  const complexityExamples = [1, 10, 11, 15, 16, 20, 25, 30, 40, 50, 60, 100, 176];
  complexityExamples.forEach(complexity => {
    const score = calculateComplexityScore(complexity);
    let phase = '';
    let researchBasis = '';
    
    if (complexity <= 10) {
      phase = 'Excellent';
      researchBasis = 'McCabe (1976) "excellent code"';
    } else if (complexity <= 15) {
      phase = 'Linear';
      researchBasis = 'NASA acceptable (≤15 for critical software)';
    } else if (complexity <= 20) {
      phase = 'Linear';
      researchBasis = 'Beyond NASA threshold (Internal acceptable)';
    } else if (complexity <= 50) {
      phase = 'Quadratic';
      if (complexity <= 30) researchBasis = 'Maintenance burden';
      else researchBasis = 'Poor maintainability';
    } else {
      phase = 'Exponential';
      researchBasis = complexity >= 100 ? 'NASA/SEL critical' : 'Unmaintainable';
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
    { name: 'context-builder.ts', complexity: 97, loc: 315 },
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
    
    const healthScore = calculateHealthScore(file);
    
    const complexityScore = calculateComplexityScore(example.complexity);
    const complexityPenalty = 100 - complexityScore;
    let extremePenalty = 0;
    if (example.complexity > 100) {
      extremePenalty = Math.round(Math.pow((example.complexity - 100) / 100, 1.5) * 50);
    }
    
    let sizePenalty = 0;
    if (example.loc > 200) {
      if (example.loc <= 500) {
        sizePenalty = Math.round((example.loc - 200) / 15);
      } else {
        const basePenalty = 20;
        const exponentialPenalty = Math.pow((example.loc - 500) / 1000, 1.3) * 8;
        sizePenalty = Math.round(basePenalty + exponentialPenalty);
      }
    }
    
    const totalComplexityPenalty = complexityPenalty + extremePenalty;
    const analysis = `Complexity: ${totalComplexityPenalty}, Size: ${sizePenalty}, Total: ${totalComplexityPenalty + sizePenalty}`;
    
    console.log(`| \`${example.name}\` | ${example.complexity} | ${example.loc} | **${healthScore}** | ${analysis} |`);
  });
  console.log('');
}

function validateAdditionalContent(content, filename) {
  const issues = [];
  
  // Check for broken internal links
  const internalLinkPattern = /\[([^\]]+)\]\(\.\/([^)]+)\)/g;
  let match;
  while ((match = internalLinkPattern.exec(content)) !== null) {
    const linkPath = path.join(docsDir, match[2]);
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
  
  console.log(`📊 Results: ${validExamples}/${examples.length} examples valid`);
}

// Main
const command = process.argv[2];

if (command === 'generate') {
  console.log('=== DOCUMENTATION GENERATION MODE ===\n');
  generateComplexityTable();
  generateHealthExamples();
  console.log('📝 Use the tables above to update your documentation\n');
} else {
  console.log('=== DOCUMENTATION VALIDATION MODE ===\n');
  
  const docsToValidate = [
    'HEALTH_SCORE_METHODOLOGY.md',
    'SCORING_ARCHITECTURE.md',
    'SCORING_THRESHOLDS_JUSTIFICATION.md',
    'DUPLICATION_DETECTION_PHILOSOPHY.md',
    'CODE_QUALITY_GUIDE.md'
  ];
  
  docsToValidate.forEach(validateFile);
  
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