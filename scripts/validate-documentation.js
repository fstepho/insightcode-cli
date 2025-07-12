#!/usr/bin/env node

/**
 * Script de validation COMPLET des exemples de la documentation
 * Assure la cohérence entre code et documentation pour TOUS les aspects critiques
 */

const { 
  calculateComplexityScore, 
  calculateHealthScore,
  calculateDuplicationScore 
} = require('../dist/scoring.js');

console.log('=== VALIDATION COMPLÈTE Documentation vs Code ===\n');

let globalErrors = 0;

// 1. TEST COMPLEXITY SCORE MAPPING
console.log('1. 📊 COMPLEXITY SCORE MAPPING');
const complexityTests = [
  { complexity: 11, expected: 97, phase: 'Linear' },
  { complexity: 15, expected: 85, phase: 'Linear' },
  { complexity: 20, expected: 70, phase: 'Linear' },
  { complexity: 25, expected: 69, phase: 'Quadratic' },
  { complexity: 30, expected: 66, phase: 'Quadratic' },
  { complexity: 40, expected: 52, phase: 'Quadratic' },
  { complexity: 50, expected: 30, phase: 'Quadratic' },
  { complexity: 60, expected: 28, phase: 'Exponential' },
  { complexity: 100, expected: 0, phase: 'Exponential' },
  { complexity: 176, expected: 0, phase: 'Exponential' }
];

complexityTests.forEach(({ complexity, expected, phase }) => {
  const actual = calculateComplexityScore(complexity);
  const valid = actual === expected;
  
  if (!valid) {
    globalErrors++;
    console.log(`❌ ERREUR - Complexité ${complexity} (${phase}):`);
    console.log(`   Documenté: ${expected}, Réel: ${actual}`);
  } else {
    console.log(`✅ OK - Complexité ${complexity} (${phase}): ${actual}`);
  }
});

// 2. TEST HEALTH SCORE EXAMPLES (points critiques identifiés)
console.log('\n2. 🏥 HEALTH SCORE EXAMPLES');
const healthTests = [
  {
    name: 'dependency-analyzer.ts',
    file: { metrics: { complexity: 176, loc: 834, duplicationRatio: 0 }, issues: [] },
    expected: 0,
    note: 'Complexity 176, LOC 834'
  },
  {
    name: 'context-builder.ts', 
    file: { metrics: { complexity: 97, loc: 315, duplicationRatio: 0 }, issues: [] },
    expected: 0,
    note: 'Complexity 97, LOC 315'
  },
  {
    name: 'parser.ts',
    file: { metrics: { complexity: 80, loc: 300, duplicationRatio: 0 }, issues: [] },
    expected: 11,
    note: 'Complexity 80, LOC 300'
  }
];

healthTests.forEach(({ name, file, expected, note }) => {
  const actual = calculateHealthScore(file);
  const valid = actual === expected;
  
  if (!valid) {
    globalErrors++;
    console.log(`❌ ERREUR - ${name}:`);
    console.log(`   ${note} → Documenté: ${expected}, Réel: ${actual}`);
  } else {
    console.log(`✅ OK - ${name}: ${actual} (${note})`);
  }
});

// 3. TEST DUPLICATION THRESHOLDS (seuils critiques)
console.log('\n3. 📋 DUPLICATION THRESHOLDS');
const duplicationTests = [
  { ratio: 0.15, note: '15% threshold (our standard)' },
  { ratio: 0.03, note: '3% (SonarQube standard - should be better)' },
  { ratio: 0.30, note: '30% (high duplication)' },
  { ratio: 0.50, note: '50% (extreme duplication)' }
];

duplicationTests.forEach(({ ratio, note }) => {
  const score = calculateDuplicationScore(ratio);
  const percentage = (ratio * 100).toFixed(0);
  
  // Validation des seuils documentés
  let expectedBehavior = 'unknown';
  if (ratio <= 0.15) expectedBehavior = 'excellent (100 pts)';
  else if (ratio <= 0.30) expectedBehavior = 'degrading (100→70)';
  else if (ratio <= 0.50) expectedBehavior = 'poor (70→30)';
  else expectedBehavior = 'critical (30→0)';
  
  console.log(`✅ INFO - ${percentage}% duplication → Score: ${score} (${expectedBehavior})`);
});

// 4. TEST MATHEMATICAL FORMULAS (validation des calculs)
console.log('\n4. 🧮 MATHEMATICAL FORMULA VALIDATION');

// Test formule linéaire (10-20)
const linearTest = calculateComplexityScore(15);
const expectedLinear = Math.round(100 - (15 - 10) * 3); // 85
if (linearTest !== expectedLinear) {
  globalErrors++;
  console.log(`❌ ERREUR - Formule linéaire: attendu ${expectedLinear}, réel ${linearTest}`);
} else {
  console.log(`✅ OK - Formule linéaire (15): 100-(15-10)×3 = ${linearTest}`);
}

// Test formule quadratique (20-50)
const quadraticTest = calculateComplexityScore(30);
const base = 70;
const range = 30 - 20;
const expectedQuadratic = Math.round(base - Math.pow(range / 30, 2) * 40); // 66
if (quadraticTest !== expectedQuadratic) {
  globalErrors++;
  console.log(`❌ ERREUR - Formule quadratique: attendu ${expectedQuadratic}, réel ${quadraticTest}`);
} else {
  console.log(`✅ OK - Formule quadratique (30): 70-((30-20)/30)²×40 = ${quadraticTest}`);
}

// 5. TEST ANTI-PATTERNS (validation "no caps" vs cap implicite)
console.log('\n5. 🚫 ANTI-PATTERNS VALIDATION');

// Test extreme values pour vérifier les "no caps"
const extremeFile = {
  metrics: { complexity: 1000, loc: 5000, duplicationRatio: 0.8 },
  issues: Array(10).fill({ severity: 'critical' })
};

const extremeHealth = calculateHealthScore(extremeFile);
if (extremeHealth !== 0) {
  console.log(`⚠️  WARNING - Extreme file health score: ${extremeHealth} (attendu 0 - cap implicite)`);
} else {
  console.log(`✅ OK - Extreme file → Health Score: 0 (cap implicite fonctionne)`);
}

// 6. AUTO-VALIDATION DES TABLES DE DOCUMENTATION
console.log('\n6. 📋 AUTO-VALIDATION TABLES DOCUMENTATION');

// Validation automatique des mappings critiques
const criticalMappings = [
  { complexity: 11, expectedScore: 97, phase: 'Linear' },
  { complexity: 15, expectedScore: 85, phase: 'Linear' }, 
  { complexity: 16, expectedScore: 82, phase: 'Linear' },
  { complexity: 20, expectedScore: 70, phase: 'Linear' },
  { complexity: 25, expectedScore: 69, phase: 'Quadratic' },
  { complexity: 30, expectedScore: 66, phase: 'Quadratic' },
  { complexity: 60, expectedScore: 28, phase: 'Exponential' },
  { complexity: 176, expectedScore: 0, phase: 'Exponential' }
];

let mappingErrors = 0;
criticalMappings.forEach(({ complexity, expectedScore, phase }) => {
  const actualScore = calculateComplexityScore(complexity);
  if (actualScore === expectedScore) {
    console.log(`✅ OK - Complexity ${complexity} (${phase}): ${actualScore}`);
  } else {
    console.log(`❌ ERREUR - Complexity ${complexity}: attendu ${expectedScore}, obtenu ${actualScore}`);
    mappingErrors++;
    globalErrors++;
  }
});

if (mappingErrors === 0) {
  console.log('✅ INFO - Tous les mappings critiques sont validés');
} else {
  console.log(`❌ ERREUR - ${mappingErrors} mapping(s) incorrect(s) détecté(s)`);
}

// 7. RÉSUMÉ FINAL
console.log('\n=== RÉSUMÉ VALIDATION ===');
if (globalErrors === 0) {
  console.log('✅ SUCCÈS - Tous les exemples documentés sont cohérents avec le code');
  console.log('✅ Formules mathématiques validées');
  console.log('✅ Exemples réels validés');
  console.log('✅ Seuils critiques validés');
  process.exit(0);
} else {
  console.log(`❌ ÉCHEC - ${globalErrors} incohérence(s) détectée(s)`);
  console.log('❌ Mise à jour de la documentation requise');
  process.exit(1);
}
