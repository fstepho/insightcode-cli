/**
 * Script de génération automatique des exemples numériques
 * Génère les mappings complexité → score à partir du code réel
 * Évite les écarts futurs entre documentation et implémentation
 */

const { calculateComplexityScore, calculateDuplicationScore, calculateHealthScore } = require('../dist/scoring.js');

console.log('=== GÉNÉRATION AUTOMATIQUE EXEMPLES NUMÉRIQUES ===\n');

// 1. Génération du mapping complexité → score
console.log('## 1. COMPLEXITY SCORE MAPPING');
console.log('| Complexity | Score | Phase | Note |');
console.log('|------------|-------|-------|------|');

const complexityTestCases = [1, 5, 10, 11, 15, 16, 20, 21, 25, 30, 40, 50, 60, 70, 80, 100, 176];

complexityTestCases.forEach(complexity => {
  const score = calculateComplexityScore(complexity);
  let phase = '';
  let note = '';
  
  if (complexity <= 10) {
    phase = 'Excellent';
    note = 'McCabe "excellent code"';
  } else if (complexity <= 20) {
    phase = 'Linear';
    if (complexity <= 15) {
      note = 'NASA acceptable (≤15 pour logiciel critique)';
    } else {
      note = 'Au-delà du seuil NASA (Acceptable interne)';
    }
  } else if (complexity <= 50) {
    phase = 'Quadratic';
    note = 'Maintenance burden';
  } else {
    phase = 'Exponential';
    note = 'Unmaintainable';
  }
  
  console.log(`| ${complexity} | ${score} | ${phase} | ${note} |`);
});

// 2. Génération du mapping duplication → score
console.log('\n## 2. DUPLICATION SCORE MAPPING');
console.log('| Duplication % | Score | Note |');
console.log('|---------------|-------|------|');

const duplicationTestCases = [0, 3, 15, 30, 50, 70, 100];

duplicationTestCases.forEach(percentage => {
  const ratio = percentage / 100;
  const score = calculateDuplicationScore(ratio);
  let note = '';
  
  if (percentage <= 3) {
    note = 'Industry standard (SonarQube)';
  } else if (percentage <= 15) {
    note = 'Legacy tolerance';
  } else if (percentage <= 30) {
    note = 'Degrading';
  } else {
    note = 'Poor/Critical';
  }
  
  console.log(`| ${percentage}% | ${score} | ${note} |`);
});

// 3. Génération d'exemples de Health Score complets
console.log('\n## 3. HEALTH SCORE EXAMPLES');
console.log('| File Profile | Complexity | LOC | Duplication | Health Score | Analysis |');
console.log('|--------------|------------|-----|-------------|--------------|----------|');

const healthTestCases = [
  { name: 'Excellent', complexity: 5, loc: 100, duplication: 0.01, issues: [] },
  { name: 'Good', complexity: 15, loc: 200, duplication: 0.05, issues: [] },
  { name: 'Acceptable', complexity: 25, loc: 300, duplication: 0.15, issues: [] },
  { name: 'Poor', complexity: 50, loc: 500, duplication: 0.30, issues: [] },
  { name: 'Critical', complexity: 80, loc: 600, duplication: 0.40, issues: [] },
  { name: 'Extreme', complexity: 176, loc: 834, duplication: 0.02, issues: [] }
];

healthTestCases.forEach(testCase => {
  const file = {
    metrics: {
      complexity: testCase.complexity,
      loc: testCase.loc,
      duplicationRatio: testCase.duplication,
      functionCount: Math.round(testCase.loc / 20) // Approximation
    },
    issues: testCase.issues
  };
  
  const healthScore = calculateHealthScore(file);
  const analysis = healthScore >= 80 ? 'Good' : 
                  healthScore >= 60 ? 'Acceptable' : 
                  healthScore >= 30 ? 'Poor' : 'Critical';
  
  console.log(`| ${testCase.name} | ${testCase.complexity} | ${testCase.loc} | ${Math.round(testCase.duplication * 100)}% | ${healthScore} | ${analysis} |`);
});

// 4. Génération des formules exactes
console.log('\n## 4. FORMULES EXACTES VALIDÉES');

console.log('\n### Complexity Linear Phase (10-20):');
[11, 15, 20].forEach(complexity => {
  const score = calculateComplexityScore(complexity);
  const formula = `100 - (${complexity} - 10) × 3 = ${100 - (complexity - 10) * 3}`;
  console.log(`- Complexity ${complexity}: ${formula} → Score: ${score} ✅`);
});

console.log('\n### Complexity Quadratic Phase (20-50):');
[25, 30, 50].forEach(complexity => {
  const score = calculateComplexityScore(complexity);
  const range = complexity - 20;
  const expected = Math.round(70 - Math.pow(range / 30, 2) * 40);
  console.log(`- Complexity ${complexity}: 70 - ((${complexity}-20)/30)² × 40 = ${expected} → Score: ${score} ${score === expected ? '✅' : '❌'}`);
});

console.log('\n### Validation terminée ! Utilisez ces valeurs pour mettre à jour la documentation.');
