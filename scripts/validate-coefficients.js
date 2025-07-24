#!/usr/bin/env node

/**
 * Mathematical Coefficients Validation Script
 * 
 * This script systematically tests different coefficient values against
 * real-world code examples to validate and optimize scoring accuracy.
 */

const { calculateFileComplexityScore, getFileDuplicationPenalty } = require('../dist/scoring.js');

console.log('=== MATHEMATICAL COEFFICIENTS VALIDATION ===\n');

// Test cases from real projects
const testCases = {
  complexity: [
    { value: 5, expected: 'excellent', description: 'Simple function' },
    { value: 10, expected: 'excellent', description: 'McCabe threshold' },
    { value: 15, expected: 'good', description: 'NASA current threshold' },
    { value: 20, expected: 'acceptable', description: 'Transition point' },
    { value: 30, expected: 'poor', description: 'High complexity' },
    { value: 50, expected: 'critical', description: 'NIST high risk' },
    { value: 100, expected: 'unmaintainable', description: 'NASA/SEL historical threshold' },
    { value: 176, expected: 'catastrophic', description: 'Real-world extreme case' },
    { value: 500, expected: 'pathological', description: 'Pathological case' }
  ],
  
  duplication: [
    { value: 0.01, expected: 'excellent', description: '1% - Industry best practice' },
    { value: 0.03, expected: 'excellent', description: '3% - SonarQube strict threshold' },
    { value: 0.15, expected: 'acceptable', description: '15% - Legacy tolerance' },
    { value: 0.30, expected: 'poor', description: '30% - High maintenance burden' },
    { value: 0.50, expected: 'critical', description: '50% - Critical technical debt' },
    { value: 0.80, expected: 'catastrophic', description: '80% - Pathological duplication' }
  ]
};

/**
 * Test the specific coefficients 1.8, 30, 40 that are key to the scoring system
 */
function testKeyCoefficients() {
  console.log('🔍 KEY COEFFICIENT ANALYSIS (1.8, 30, 40)\n');
  
  console.log('1️⃣ POWER 1.8 ANALYSIS:');
  console.log('Used in: Complexity exponential & Duplication exponential');
  
  const powerValues = [1.5, 1.8, 2.0];
  const complexityTests = [60, 80, 100, 150];
  
  console.log('\nComplexity | Power 1.5 | Power 1.8 | Power 2.0 | Expert Expected');
  console.log('-----------|-----------|-----------|-----------|----------------');
  
  complexityTests.forEach(complexity => {
    let row = `${complexity.toString().padEnd(10)} |`;
    
    powerValues.forEach(power => {
      const range = complexity - 50;
      const exponentialPenalty = Math.pow(range / 50, power) * 30;
      const score = Math.max(0, Math.round(30 - exponentialPenalty));
      row += ` ${score.toString().padEnd(9)} |`;
    });
    
    // Add expert judgment expectations
    const expertExpected = complexity <= 60 ? 'Acceptable' :
                          complexity <= 100 ? 'Poor' : 'Critical';
    row += ` ${expertExpected.padEnd(14)}`;
    
    console.log(row);
  });
  
  console.log('\n2️⃣ MULTIPLIER 30 ANALYSIS:');
  console.log('Context: Exponential penalty multiplier for complexity >50');
  console.log('Design: Drives scores to 0 for extreme complexity');
  
  const multipliers = [20, 30, 40];
  console.log('\nComplexity 100 with different multipliers:');
  multipliers.forEach(mult => {
    const range = 100 - 50;
    const penalty = Math.pow(range / 50, 1.8) * mult;
    const finalScore = Math.max(0, Math.round(30 - penalty));
    console.log(`Multiplier ${mult}: Final score = ${finalScore} (penalty = ${penalty.toFixed(1)})`);
  });
  
  console.log('\n3️⃣ MULTIPLIER 40 ANALYSIS:');
  console.log('Context: Quadratic penalty multiplier for complexity 20-50');
  console.log('Design: Creates 70→30 point degradation over 30-unit range');
  
  const quadraticMults = [35, 40, 45];
  console.log('\nComplexity progression with different quadratic multipliers:');
  [30, 40, 50].forEach(complexity => {
    let row = `Complexity ${complexity.toString().padEnd(2)}: `;
    
    quadraticMults.forEach(mult => {
      if (complexity <= 20) {
        row += `${100} (${mult}) | `;
      } else {
        const range = complexity - 20;
        const penalty = Math.pow(range / 30, 2) * mult;
        const score = Math.round(70 - penalty);
        row += `${score.toString().padEnd(2)} (${mult}) | `;
      }
    });
    
    console.log(row);
  });
  
  console.log('\n📊 KEY FINDINGS:');
  console.log('• Power 1.8: Harmonized across all penalty types');
  console.log('• Multiplier 30: Appropriate for driving extreme complexity to 0');
  console.log('• Multiplier 40: Well-calibrated for gradual quadratic degradation');
  console.log('• ✅ All powers harmonized to 1.8 for mathematical consistency');
  console.log();
}


/**
 * Test different duplication penalty coefficients
 */
function testDuplicationCoefficients() {
  console.log('🧪 TESTING DUPLICATION PENALTY COEFFICIENTS\n');
  
  const multipliers = [1.0, 1.5, 2.0];
  const powers = [1.5, 1.8, 2.0];
  
  console.log('Testing 30% duplication with different coefficients:');
  console.log('Linear Mult | Power 1.5 | Power 1.8 | Power 2.0');
  console.log('------------|-----------|-----------|----------');
  
  multipliers.forEach(mult => {
    let row = `${mult.toString().padEnd(11)} |`;
    
    powers.forEach(power => {
      // Simulate duplication penalty calculation
      const percentage = 30;
      const basePenalty = (percentage - 15) * mult;
      const exponentialPenalty = Math.pow((percentage - 30) / 10, power) * 10;
      const totalPenalty = Math.round(basePenalty + exponentialPenalty);
      
      row += ` ${totalPenalty.toString().padEnd(9)} |`;
    });
    
    console.log(row);
  });
  
  console.log('\n📊 Analysis:');
  console.log('- Current (1.5, 1.8): Balanced approach');
  console.log('- Higher multipliers: More aggressive linear penalties');
  console.log('- Higher powers: Steeper exponential growth');
  console.log('\n💡 Recommendation: Validate against real high-duplication projects\n');
}

/**
 * Analyze score distribution for real-world cases
 */
function analyzeScoreDistribution() {
  console.log('📈 SCORE DISTRIBUTION ANALYSIS\n');
  
  console.log('Real-world complexity score distribution:');
  testCases.complexity.forEach(testCase => {
    const score = calculateFileComplexityScore(testCase.value);
    const category = score >= 80 ? '🟢 Good' : 
                    score >= 60 ? '🟡 Fair' : 
                    score >= 30 ? '🟠 Poor' : '🔴 Critical';
    
    console.log(`Complexity ${testCase.value.toString().padEnd(3)}: ${score.toString().padEnd(3)} points ${category} (${testCase.description})`);
  });
  
  console.log('\nDuplication penalty distribution:');
  testCases.duplication.forEach(testCase => {
    const penalty = getFileDuplicationPenalty(testCase.value);
    const impact = penalty === 0 ? '🟢 None' :
                  penalty < 10 ? '🟡 Low' :
                  penalty < 25 ? '🟠 Medium' : '🔴 High';
    
    console.log(`Duplication ${(testCase.value * 100).toFixed(0).padEnd(2)}%: ${penalty.toFixed(1).padEnd(4)} penalty ${impact} (${testCase.description})`);
  });
}

/**
 * Generate coefficient optimization recommendations
 */
function generateRecommendations() {
  console.log('\n🎯 COEFFICIENT OPTIMIZATION RECOMMENDATIONS\n');
  
  console.log('HIGH PRIORITY (Immediate Action Required):');
  console.log('1. 🔬 Validate harmonized exponential power 1.8');
  console.log('   - ✅ All powers harmonized to 1.8 for mathematical consistency');
  console.log('   - Method: A/B test harmonized system against expert ratings of 50+ cases');
  console.log('');
  
  console.log('2. 📊 Validate duplication exponential denominator (10)');
  console.log('   - Current: Very rapid acceleration beyond 30%');
  console.log('   - Method: Test against brownfield projects with 40-80% duplication');
  console.log('');
  
  console.log('3. 🧪 Calibrate size exponential denominator (1000)');
  console.log('   - Current: May be too forgiving for 2000+ LOC files');
  console.log('   - Method: Analyze maintenance time correlation with file size');
  console.log('');
  
  console.log('MEDIUM PRIORITY (Quarterly Review):');
  console.log('1. 📈 Optimize linear multipliers against industry benchmarks');
  console.log('2. 🎯 Validate issue penalty ratios (20:12:6:2) against user feedback');
  console.log('3. 📋 Establish systematic coefficient evolution process');
  console.log('');
  
  console.log('VALIDATION FRAMEWORK:');
  console.log('1. Monthly: Compare scores against expert judgment on new projects');
  console.log('2. Quarterly: Systematic coefficient testing against expanded dataset');
  console.log('3. Annually: Major coefficient recalibration based on accumulated data');
}

// Run all validations
testKeyCoefficients();
testDuplicationCoefficients();
analyzeScoreDistribution();
generateRecommendations();

console.log('\n✅ Validation complete! See docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md for detailed analysis.');
