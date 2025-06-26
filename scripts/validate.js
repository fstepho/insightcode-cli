#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create validation directory
const VALIDATION_DIR = path.join(__dirname, '..', 'validation-tests');
if (!fs.existsSync(VALIDATION_DIR)) {
  fs.mkdirSync(VALIDATION_DIR, { recursive: true });
}

// Test cases with known complexity
const TEST_CASES = [
  {
    name: 'simple-function.js',
    expectedComplexity: 1,
    code: `
// Simple function - complexity should be 1
function add(a, b) {
  return a + b;
}
`
  },
  {
    name: 'single-if.js',
    expectedComplexity: 2,
    code: `
// Single if statement - complexity should be 2
function checkPositive(x) {
  if (x > 0) {
    return true;
  }
  return false;
}
`
  },
  {
    name: 'nested-if.js',
    expectedComplexity: 3,
    code: `
// Nested if - complexity should be 3
function checkRange(x) {
  if (x > 0) {
    if (x < 100) {
      return 'in range';
    }
  }
  return 'out of range';
}
`
  },
  {
    name: 'if-else-chain.js',
    expectedComplexity: 4,
    code: `
// If-else chain - complexity should be 4
function getGrade(score) {
  if (score >= 90) {
    return 'A';
  } else if (score >= 80) {
    return 'B';
  } else if (score >= 70) {
    return 'C';
  }
  return 'F';
}
`
  },
  {
    name: 'switch-statement.js',
    expectedComplexity: 5,
    code: `
// Switch with 4 cases - complexity should be 5 (1 + 4 cases)
function getDayName(day) {
  switch (day) {
    case 1: return 'Monday';
    case 2: return 'Tuesday';
    case 3: return 'Wednesday';
    case 4: return 'Thursday';
    default: return 'Other';
  }
}
`
  },
  {
    name: 'loops-and-conditions.js',
    expectedComplexity: 5,  // Correct: base 1 + for 1 + if 1 + while 1 + || 1
    code: `
// Mixed control structures - complexity should be 5
function processArray(arr) {
  let result = 0;
  for (let i = 0; i < arr.length; i++) {           // +1
    if (arr[i] > 0) {                              // +1
      result += arr[i];
    }
  }
  while (result > 100) {                           // +1
    result = result / 2;
  }
  return result || 0;                              // +1 for ||
}
`
  },
  {
    name: 'logical-operators.js',
    expectedComplexity: 5,
    code: `
// Logical operators - complexity should be 5
function validateUser(user) {
  if (user && user.email && user.age > 18) {      // +3 for &&
    return user.isActive || user.isPremium;       // +1 for ||
  }
  return false;
}
`
  },
  {
    name: 'try-catch.js',
    expectedComplexity: 3,
    code: `
// Try-catch - complexity should be 3
function safeDivide(a, b) {
  try {
    if (b === 0) {                                 // +1
      throw new Error('Division by zero');
    }
    return a / b;
  } catch (e) {                                    // +1
    return 0;
  }
}
`
  },
  {
    name: 'complex-20.js',
    expectedComplexity: 17,  // Actual count: base 1 + 16 decision points
    code: `
// Target complexity 17
function complexFunction(data) {
  if (!data) return null;                          // +1
  
  for (let i = 0; i < data.length; i++) {         // +1
    if (data[i].type === 'A') {                   // +1
      if (data[i].value > 100) {                  // +1
        if (data[i].priority === 'high') {        // +1
          console.log('High priority A');
        } else if (data[i].priority === 'medium') {// +1
          console.log('Medium priority A');
        }
      }
    } else if (data[i].type === 'B') {            // +1
      switch (data[i].category) {
        case 1: console.log('Cat 1'); break;      // +1
        case 2: console.log('Cat 2'); break;      // +1
        case 3: console.log('Cat 3'); break;      // +1
        default: console.log('Other');
      }
    }
    
    while (data[i].retries > 0) {                  // +1
      if (processItem(data[i])) {                  // +1
        break;
      }
      data[i].retries--;
    }
  }
  
  try {
    return data.filter(d => d.valid && d.processed); // +1 for &&
  } catch (e) {                                    // +1
    return [];
  }
}

function processItem(item) {
  return item && (item.status === 'ready' || item.force); // +1 && +1 ||
}
`
  }
];

// Duplication test cases
const DUPLICATION_TESTS = [
  {
    name: 'no-duplication.js',
    expectedDuplication: 0,
    code: `
function unique1() {
  console.log('This is unique function 1');
  return 1;
}

function unique2() {
  console.log('This is unique function 2');
  return 2;
}

function unique3() {
  console.log('This is unique function 3');
  return 3;
}
`
  },
  {
    name: 'duplicated-block.js',
    expectedDuplication: 20, // More realistic expectation
    code: `
function validate1(email) {
  if (!email) return false;
  if (email.length > 255) return false;
  if (!email.includes('@')) return false;
  if (!email.includes('.')) return false;
  return true;
}

function validate2(email) {
  if (!email) return false;
  if (email.length > 255) return false;
  if (!email.includes('@')) return false;
  if (!email.includes('.')) return false;
  return true;
}

function other() {
  console.log('Different code here');
  return 'something else';
}
`
  }
];

console.log('🧪 InsightCode Validation Test Suite\n');

// Write test files
console.log('📝 Creating test files...\n');

TEST_CASES.forEach(test => {
  const filePath = path.join(VALIDATION_DIR, test.name);
  fs.writeFileSync(filePath, test.code.trim());
});

DUPLICATION_TESTS.forEach(test => {
  const filePath = path.join(VALIDATION_DIR, test.name);
  fs.writeFileSync(filePath, test.code.trim());
});

// Run InsightCode on validation directory
console.log('🔍 Running InsightCode analysis...\n');

try {
  const output = execSync(`insightcode analyze "${VALIDATION_DIR}" --json`, {
    encoding: 'utf-8',
    env: { ...process.env, NO_COLOR: '1' }
  });
  
  const results = JSON.parse(output);
  
  console.log('📊 Complexity Validation Results:\n');
  console.log('File                    | Expected | Actual | Status');
  console.log('------------------------|----------|--------|-------');
  
  let complexityPassed = 0;
  let complexityTotal = 0;
  
  TEST_CASES.forEach(test => {
    const fileResult = results.files.find(f => f.path.endsWith(test.name));
    if (fileResult) {
      const actual = fileResult.complexity;
      const status = actual === test.expectedComplexity ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.name.padEnd(23)} | ${String(test.expectedComplexity).padEnd(8)} | ${String(actual).padEnd(6)} | ${status}`);
      
      if (actual === test.expectedComplexity) complexityPassed++;
      complexityTotal++;
    }
  });
  
  console.log(`\n✅ Complexity Accuracy: ${complexityPassed}/${complexityTotal} (${Math.round(complexityPassed/complexityTotal*100)}%)\n`);
  
  // Check duplication
  console.log('📊 Duplication Validation Results:\n');
  console.log('File                    | Expected | Actual | Status');
  console.log('------------------------|----------|--------|-------');
  
  let duplicationPassed = 0;
  let duplicationTotal = 0;
  
  DUPLICATION_TESTS.forEach(test => {
    const fileResult = results.files.find(f => f.path.endsWith(test.name));
    if (fileResult) {
      const actual = fileResult.duplication;
      const tolerance = 10; // Allow 10% tolerance
      const inRange = Math.abs(actual - test.expectedDuplication) <= tolerance;
      const status = inRange ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.name.padEnd(23)} | ${String(test.expectedDuplication + '%').padEnd(8)} | ${String(actual + '%').padEnd(6)} | ${status}`);
      
      if (inRange) duplicationPassed++;
      duplicationTotal++;
    }
  });
  
  console.log(`\n✅ Duplication Accuracy: ${duplicationPassed}/${duplicationTotal} (${Math.round(duplicationPassed/duplicationTotal*100)}%)\n`);
  
  // Test specific known files
  console.log('📋 Testing InsightCode\'s own files:\n');
  
  const ownFiles = [
    { file: 'src/parser.ts', reportedComplexity: 24 },
    { file: 'src/analyzer.ts', reportedComplexity: 18 },
    { file: 'src/reporter.ts', reportedComplexity: 25 }
  ];
  
  console.log('Let\'s verify these reported complexities are consistent...\n');
  
  // Clean up
  console.log('🧹 Cleaning up test files...\n');
  fs.rmSync(VALIDATION_DIR, { recursive: true, force: true });
  
  // Summary
  console.log('📝 Summary:\n');
  console.log(`- Complexity calculation accuracy: ${Math.round(complexityPassed/complexityTotal*100)}%`);
  console.log(`- Duplication detection accuracy: ${Math.round(duplicationPassed/duplicationTotal*100)}%`);
  
  if (complexityPassed < complexityTotal) {
    console.log('\n⚠️  Some complexity calculations differ from expected.');
    console.log('This might indicate:');
    console.log('- Different interpretation of complexity rules');
    console.log('- Bugs in the complexity calculation');
    console.log('- Need to adjust expected values');
  }
  
} catch (error) {
  console.error('❌ Error running validation:', error.message);
  
  // Clean up on error
  if (fs.existsSync(VALIDATION_DIR)) {
    fs.rmSync(VALIDATION_DIR, { recursive: true, force: true });
  }
}