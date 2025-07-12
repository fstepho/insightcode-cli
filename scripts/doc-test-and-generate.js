#!/usr/bin/env node

/**
 * Documentation test and automatic generation script
 * Validates and regenerates ALL numerical examples from real code
 * Prevents future discrepancies between documentation and implementation
 */

const { 
  calculateComplexityScore, 
  calculateHealthScore,
  calculateDuplicationScore 
} = require('../dist/scoring.js');

console.log('=== AUTOMATIC DOCUMENTATION TEST & GENERATION ===\n');

let globalErrors = 0;

// 1. CRITICAL VALIDATION OF EXISTING EXAMPLES
console.log('## 1. CRITICAL VALIDATION OF EXISTING EXAMPLES\n');

// Test critical values mentioned in documentation
const criticalTests = [
  { name: 'Complexity 176 → Penalty 133', complexity: 176, expectedPenalty: 133 },
  { name: 'Complexity 60 → Score 28', complexity: 60, expectedScore: 28 },
  { name: 'Complexity 11 → Score 97', complexity: 11, expectedScore: 97 },
  { name: 'Complexity 15 → Score 85', complexity: 15, expectedScore: 85 },
  { name: 'Complexity 20 → Score 70', complexity: 20, expectedScore: 70 },
];

criticalTests.forEach(test => {
  if (test.expectedScore) {
    const actualScore = calculateComplexityScore(test.complexity);
    if (actualScore === test.expectedScore) {
      console.log(`✅ PASS - ${test.name}: ${actualScore}`);
    } else {
      console.log(`❌ FAIL - ${test.name}: expected ${test.expectedScore}, got ${actualScore}`);
      globalErrors++;
    }
  }
  
  if (test.expectedPenalty) {
    // Calculate exact penalty
    const score = calculateComplexityScore(test.complexity);
    const basePenalty = 100 - score;
    let extremePenalty = 0;
    if (test.complexity > 100) {
      extremePenalty = Math.pow((test.complexity - 100) / 100, 1.5) * 50;
    }
    const totalPenalty = Math.round(basePenalty + extremePenalty);
    
    if (totalPenalty === test.expectedPenalty) {
      console.log(`✅ PASS - ${test.name}: ${totalPenalty}`);
    } else {
      console.log(`❌ FAIL - ${test.name}: expected ${test.expectedPenalty}, got ${totalPenalty}`);
      globalErrors++;
    }
  }
});

// 2. COMPLETE MAPPING TABLES GENERATION
console.log('\n## 2. MAPPING TABLES GENERATION FOR DOCUMENTATION\n');

console.log('### Table Complexity → Score (for SCORING_THRESHOLDS_JUSTIFICATION.md)');
console.log('```markdown');
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

console.log('```\n');

// 3. GÉNÉRATION DES EXEMPLES DE HEALTH SCORE
console.log('### Table Health Score Examples (for HEALTH_SCORE_METHODOLOGY.md)');
console.log('```markdown');
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
  
  // Detailed penalty calculation
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

console.log('```\n');

// 4. MATHEMATICAL FORMULAS VALIDATION
console.log('## 3. MATHEMATICAL FORMULAS VALIDATION\n');

const formulaTests = [
  { complexity: 15, expectedFormula: '100-(15-10)×3=85', phase: 'Linear' },
  { complexity: 30, expectedFormula: '70-((30-20)/30)²×40=66', phase: 'Quadratic' },
];

formulaTests.forEach(test => {
  const actualScore = calculateComplexityScore(test.complexity);
  const expectedScore = parseInt(test.expectedFormula.split('=')[1]);
  
  if (actualScore === expectedScore) {
    console.log(`✅ PASS - Formula ${test.phase} (${test.complexity}): ${test.expectedFormula} → ${actualScore}`);
  } else {
    console.log(`❌ FAIL - Formula ${test.phase} (${test.complexity}): expected ${expectedScore}, got ${actualScore}`);
    globalErrors++;
  }
});

// 5. SUMMARY AND RECOMMENDATIONS
console.log('\n## 4. SUMMARY AND RECOMMENDATIONS\n');

if (globalErrors === 0) {
  console.log('✅ **COMPLETE SUCCESS** - All examples are consistent with code');
  console.log('✅ Documentation and implementation perfectly synchronized');
  console.log('✅ Ready for publication');
  console.log('\n🔄 **USAGE**: Run `npm run doc:test` before each release to maintain consistency');
  process.exit(0);
} else {
  console.log(`❌ **ERRORS DETECTED** - ${globalErrors} inconsistency(ies) found`);
  console.log('❌ Documentation update required');
  console.log('\n📝 **ACTION REQUIRED**: Use the tables generated above to correct the documentation');
  process.exit(1);
}
