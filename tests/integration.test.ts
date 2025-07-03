import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseDirectory } from '../src/parser'; // Import default thresholds
import { analyze } from '../src/analyzer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { DEFAULT_THRESHOLDS } from '../src/config';

describe('Integration Tests', () => {
  let tempDir: string;
  
  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insightcode-integration-'));
  });
  
  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  
  it('should analyze a simple project correctly', async () => {
    // Create a simple project structure
    const simpleCode = `
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return a - b;
}`;
    
    fs.writeFileSync(path.join(tempDir, 'math.ts'), simpleCode);
    
    // Run full analysis pipeline
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments to analyze
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    expect(results.summary.totalFiles).toBe(1);
    expect(results.summary.avgComplexity).toBeLessThan(5);
    expect(results.summary.avgDuplication).toBe(0);
    expect(results.score).toBeGreaterThan(85);
    expect(results.grade).toBe('A');
  });
  
  it('should detect issues in complex project', async () => {
    // Create a complex file
    const complexCode = `
function processData(data: any[]): any[] {
  const results = [];
  
  for (let i = 0; i < data.length; i++) {
    if (data[i].type === 'A') {
      if (data[i].value > 100) {
        if (data[i].priority === 'high') {
          results.push(data[i].value * 2);
        } else if (data[i].priority === 'medium') {
          results.push(data[i].value * 1.5);
        } else {
          results.push(data[i].value);
        }
      } else if (data[i].value > 50) {
        results.push(data[i].value * 1.2);
      } else {
        results.push(data[i].value);
      }
    } else if (data[i].type === 'B') {
      switch (data[i].category) {
        case 1: results.push(data[i].value + 10); break;
        case 2: results.push(data[i].value + 20); break;
        case 3: results.push(data[i].value + 30); break;
        default: results.push(data[i].value);
      }
    } else {
      results.push(data[i].value || 0);
    }
  }
  
  return results;
}`;
    
    fs.writeFileSync(path.join(tempDir, 'complex.ts'), complexCode);
    
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    expect(results.summary.avgComplexity).toBeGreaterThan(10);
    expect(results.score).toBeLessThan(95);
    expect(results.files[0].issues.length).toBeGreaterThan(0);
    expect(results.files[0].issues[0].type).toBe('complexity');
  });
  
  it('should detect code duplication', async () => {
    // Create files with duplicated code
    const duplicatedBlock = `
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return false;
  if (email.length > 255) return false;
  if (!emailRegex.test(email)) return false;
  return true;
}`;
    
    const file1Content = `
${duplicatedBlock}

export function processUser(user: any) {
  if (!validateEmail(user.email)) {
    throw new Error('Invalid email');
  }
  return user;
}`;
    
    const file2Content = `
${duplicatedBlock}

export function validateUser(user: any) {
  if (!validateEmail(user.email)) {
    return false;
  }
  return true;
}`;
    
    fs.writeFileSync(path.join(tempDir, 'user-processor.ts'), file1Content);
    fs.writeFileSync(path.join(tempDir, 'user-validator.ts'), file2Content);
    
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    // Should detect some duplication
    expect(results.summary.avgDuplication).toBeGreaterThan(0);
  });
  
  it('should handle mixed quality codebase', async () => {
    // Good quality file
    fs.writeFileSync(path.join(tempDir, 'utils.ts'), `
export const PI = 3.14159;
export const E = 2.71828;

export function square(n: number): number {
  return n * n;
}`);
    
    // Medium complexity file
    fs.writeFileSync(path.join(tempDir, 'validator.ts'), `
export function validate(data: any): boolean {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  if (!data.id || !data.name) return false;
  if (data.age && (data.age < 0 || data.age > 150)) return false;
  return true;
}`);
    
    // High complexity file
    fs.writeFileSync(path.join(tempDir, 'processor.ts'), `
export function process(items: any[]): any[] {
  const results = [];
  for (const item of items) {
    if (item.type === 'A') {
      if (item.status === 'active') {
        if (item.priority > 5) {
          results.push({ ...item, score: item.value * 2 });
        } else {
          results.push({ ...item, score: item.value });
        }
      } else if (item.status === 'pending') {
        results.push({ ...item, score: 0 });
      }
    } else if (item.type === 'B') {
      if (item.category === 1) {
        results.push({ ...item, score: 100 });
      } else if (item.category === 2) {
        results.push({ ...item, score: 50 });
      }
    }
  }
  return results;
}`);
    
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    expect(results.summary.totalFiles).toBe(3);
    expect(results.score).toBeGreaterThan(50);
    expect(results.score).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D'].includes(results.grade)).toBe(true);
  });
  
  it('should handle edge cases gracefully', async () => {
    // Empty file
    fs.writeFileSync(path.join(tempDir, 'empty.ts'), '');
    
    // File with only comments
    fs.writeFileSync(path.join(tempDir, 'comments.ts'), `
// This file contains only comments
/* * Multi-line comment
 * No actual code
 */
// More comments`);
    
    // Minimal valid code
    fs.writeFileSync(path.join(tempDir, 'minimal.ts'), 'export const x = 1;');
    
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    expect(results.summary.totalFiles).toBe(3);
    expect(results.summary.totalLines).toBeGreaterThanOrEqual(1);
    expect(results.score).toBeGreaterThan(0);
    expect(results.grade).toBeTruthy();
  });
  
  it('should exclude utility files when requested', async () => {
    // Production file
    fs.writeFileSync(path.join(tempDir, 'app.ts'), `
export function main() {
  console.log('Hello World');
}`);
    
    // Test file
    fs.writeFileSync(path.join(tempDir, 'app.test.ts'), `
import { main } from './app';
describe('app', () => {
  it('should work', () => {
    expect(main).toBeDefined();
  });
});`);
    
    // Script file
    fs.mkdirSync(path.join(tempDir, 'scripts'));
    fs.writeFileSync(path.join(tempDir, 'scripts', 'build.ts'), `
console.log('Building...');
process.exit(0);`);
    
    const allFiles = await parseDirectory(tempDir, [], false);
    const productionFiles = await parseDirectory(tempDir, [], true);
    
    // FIX: Pass all required arguments
    const allResults = analyze(allFiles, tempDir, DEFAULT_THRESHOLDS);
    const productionResults = analyze(productionFiles, tempDir, DEFAULT_THRESHOLDS);
    
    expect(allResults.summary.totalFiles).toBe(3);
    expect(productionResults.summary.totalFiles).toBe(1);
    expect(productionResults.files[0].path).toContain('app.ts');
  });
  
  it('should handle different file types with appropriate thresholds', async () => {
    // Production file with medium complexity
    fs.writeFileSync(path.join(tempDir, 'service.ts'), `
export function processOrder(order: any) {
  if (order.status === 'pending') {
    if (order.amount > 1000) {
      return { ...order, priority: 'high' };
    } else if (order.amount > 500) {
      return { ...order, priority: 'medium' };
    } else {
      return { ...order, priority: 'low' };
    }
  }
  return order;
}`);
    
    // Test file with same complexity (should be more tolerant)
    fs.writeFileSync(path.join(tempDir, 'service.test.ts'), `
import { processOrder } from './service';
describe('processOrder', () => {
  it('should handle pending orders', () => {
    const order = { status: 'pending', amount: 1500 };
    if (order.status === 'pending') {
      if (order.amount > 1000) {
        expect(processOrder(order).priority).toBe('high');
      } else if (order.amount > 500) {
        expect(processOrder(order).priority).toBe('medium');
      } else {
        expect(processOrder(order).priority).toBe('low');
      }
    }
  });
});`);
    
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    const prodFile = results.files.find(f => f.path.includes('service.ts'));
    const testFile = results.files.find(f => f.path.includes('service.test.ts'));
    
    expect(prodFile?.fileType).toBe('production');
    expect(testFile?.fileType).toBe('test');
    
    expect(prodFile?.complexity).toBeGreaterThan(3);
    expect(testFile?.complexity).toBeGreaterThan(3);
  });
  
  it('should handle parsing errors gracefully', async () => {
    // Valid file
    fs.writeFileSync(path.join(tempDir, 'valid.ts'), 'export const x = 1;');
    
    // Invalid syntax file
    fs.writeFileSync(path.join(tempDir, 'invalid.ts'), 'const x = { invalid syntax');
    
    // File with encoding issues (simulate by creating binary content)
    fs.writeFileSync(path.join(tempDir, 'binary.ts'), Buffer.from([0x00, 0x01, 0x02]));
    
    const files = await parseDirectory(tempDir);
    // FIX: Pass all required arguments
    const results = analyze(files, tempDir, DEFAULT_THRESHOLDS);
    
    // Should still process valid files despite errors
    expect(results.summary.totalFiles).toBeGreaterThanOrEqual(1);
    expect(results.files.some(f => f.path.includes('valid.ts'))).toBe(true);
    expect(results.score).toBeGreaterThan(0);
  });
  
  it('should output valid JSON when --json flag is used', async () => {
    // Create a simple test file
    fs.writeFileSync(path.join(tempDir, 'test.ts'), `
export function add(a: number, b: number): number {
  return a + b;
}`);
    
    // Execute CLI with --json flag
    const cliPath = path.join(process.cwd(), 'dist', 'cli.js');
    const command = `node "${cliPath}" analyze "${tempDir}" --json`;
    
    let output: string;
    try {
      output = execSync(command, { encoding: 'utf8' });
    } catch (error) {
      // If dist doesn't exist, build first
      execSync('npm run build', { cwd: process.cwd() });
      output = execSync(command, { encoding: 'utf8' });
    }
    
    // Parse JSON output
    const jsonResult = JSON.parse(output);
    
    // Verify JSON structure
    expect(jsonResult).toHaveProperty('summary');
    expect(jsonResult).toHaveProperty('files');
    expect(jsonResult).toHaveProperty('score');
    expect(jsonResult).toHaveProperty('grade');
    expect(jsonResult.summary).toHaveProperty('totalFiles', 1);
    expect(jsonResult.files).toHaveLength(1);
    expect(jsonResult.files[0]).toHaveProperty('path');
    expect(jsonResult.files[0]).toHaveProperty('complexity');
    expect(jsonResult.files[0]).toHaveProperty('duplication');
    expect(jsonResult.files[0]).toHaveProperty('loc');
  });
});
