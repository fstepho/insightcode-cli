import { describe, it, expect } from 'vitest';
import { parseFile } from '../src/parser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Parser', () => {
  it('should calculate cyclomatic complexity correctly', () => {
    // Create a temp file with known complexity
    const tempDir = os.tmpdir();
    const testFile = path.join(tempDir, 'test-complexity.ts');
    
    const testCode = `
function testFunction(x: number) {
  if (x > 0) {            // +1
    return x;
  } else if (x < 0) {     // +1
    return -x;
  }
  
  for (let i = 0; i < 10; i++) {  // +1
    if (i % 2 === 0) {            // +1
      console.log(i);
    }
  }
  
  return x || 0;          // +1
}
    `;
    
    fs.writeFileSync(testFile, testCode);
    
    const metrics = parseFile(testFile);
    
    // Base complexity 1 + 5 decision points = 6
    expect(metrics.complexity).toBe(6);
    expect(metrics.loc).toBeGreaterThan(10);
    expect(metrics.loc).toBeLessThan(20);
    
    // Clean up
    fs.unlinkSync(testFile);
  });
  
  it('should count lines of code excluding comments', () => {
    const tempDir = os.tmpdir();
    const testFile = path.join(tempDir, 'test-loc.ts');
    
    const testCode = `
// This is a comment
function hello() {
  // Another comment
  console.log('Hello');
  
  /*
   * Multi-line comment
   */
  return true;
}

// More comments
`;
    
    fs.writeFileSync(testFile, testCode);
    
    const metrics = parseFile(testFile);
    
    // Should count only actual code lines
    expect(metrics.loc).toBe(4); // function, console.log, return, closing brace
    
    // Clean up
    fs.unlinkSync(testFile);
  });
  
  it('should detect high complexity issues', () => {
    const tempDir = os.tmpdir();
    const testFile = path.join(tempDir, 'test-high-complexity.ts');
    
    // Create a function with high complexity
    const conditions = Array(25).fill(0).map((_, i) => `if (x === ${i}) return ${i};`).join('\n');
    const testCode = `
function veryComplex(x: number) {
  ${conditions}
  return -1;
}
    `;
    
    fs.writeFileSync(testFile, testCode);
    
    const metrics = parseFile(testFile);
    
    expect(metrics.complexity).toBeGreaterThan(20);
    expect(metrics.issues).toHaveLength(1);
    expect(metrics.issues[0].type).toBe('complexity');
    expect(metrics.issues[0].severity).toBe('high');
    
    // Clean up
    fs.unlinkSync(testFile);
  });
});