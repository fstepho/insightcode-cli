#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔬 Testing InsightCode Complexity Rules\n');

// Simple test cases
const tests = [
  // Base cases
  { name: 'empty', code: 'function test() {}', expected: '1 (base)' },
  { name: 'return', code: 'function test() { return 42; }', expected: '1 (base)' },
  
  // Control flow
  { name: 'if', code: 'function test(x) { if (x) return 1; }', expected: '2 (base + if)' },
  { name: 'if-else', code: 'function test(x) { if (x) return 1; else return 0; }', expected: '2 or 3' },
  { name: 'ternary', code: 'function test(x) { return x ? 1 : 0; }', expected: '2 (if ternary counts)' },
  
  // Logical operators
  { name: 'or-return', code: 'function test() { return a || b; }', expected: '1 or 2' },
  { name: 'and-return', code: 'function test() { return a && b; }', expected: '1 or 2' },
  { name: 'or-assign', code: 'function test() { const x = a || b; return x; }', expected: '1 or 2' },
  
  // Loops
  { name: 'for', code: 'function test() { for(let i=0; i<10; i++) {} }', expected: '2 (base + for)' },
  { name: 'while', code: 'function test() { while(true) {} }', expected: '2 (base + while)' },
  
  // Switch
  { name: 'switch-2', code: 'function test(x) { switch(x) { case 1: return 1; case 2: return 2; } }', expected: '3 (base + 2 cases)' },
  { name: 'switch-default', code: 'function test(x) { switch(x) { case 1: return 1; default: return 0; } }', expected: '2 or 3' },
  
  // Try-catch
  { name: 'try-catch', code: 'function test() { try { return 1; } catch(e) { return 0; } }', expected: '2 (base + catch)' },
  
  // Multiple functions
  { name: 'two-funcs', code: 'function a() { if(x) return 1; }\nfunction b() { if(y) return 2; }', expected: '2 (max) or 4 (sum)' }
];

console.log('Test               | Actual | Expected');
console.log('-------------------|--------|------------------');

tests.forEach(test => {
  const filename = `test-${test.name}.js`;
  
  try {
    // Write test file
    fs.writeFileSync(filename, test.code);
    
    // Run InsightCode
    const output = execSync(`insightcode ${filename} --json`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const result = JSON.parse(output);
    const complexity = result.files[0].complexity;
    
    console.log(`${test.name.padEnd(18)} | ${String(complexity).padEnd(6)} | ${test.expected}`);
    
    // Clean up
    fs.unlinkSync(filename);
    
  } catch (error) {
    console.log(`${test.name.padEnd(18)} | ERROR  | ${test.expected}`);
    // Clean up on error
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
  }
});

console.log('\n📊 Key Findings:\n');

// Manual analysis of specific patterns
const specificTests = [
  { code: 'function test() { return a || b; }', name: 'OR in return' },
  { code: 'function test() { const x = a || b; return x; }', name: 'OR in assignment' },
  { code: 'function test() { if (a) return 1; }', name: 'Single if' },
  { code: 'function test() { if (a) return 1; else return 0; }', name: 'If-else' }
];

const results = {};
specificTests.forEach(test => {
  const filename = 'temp-test.js';
  fs.writeFileSync(filename, test.code);
  try {
    const output = execSync(`insightcode ${filename} --json`, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    const result = JSON.parse(output);
    results[test.name] = result.files[0].complexity;
  } catch (e) {
    results[test.name] = 'ERROR';
  }
  fs.unlinkSync(filename);
});

// Analyze results
if (results['OR in return'] && results['OR in assignment']) {
  console.log(`- OR operator: ${results['OR in return'] > 1 ? 'COUNTED (+1)' : 'NOT counted'}`);
}

if (results['Single if'] && results['If-else']) {
  console.log(`- If statement: +${results['Single if'] - 1}`);
  console.log(`- Else clause: ${results['If-else'] > results['Single if'] ? 'COUNTED separately' : 'NOT counted separately'}`);
}

console.log('\n✅ Test complete!');