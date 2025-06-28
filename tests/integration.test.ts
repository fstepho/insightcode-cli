import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseDirectory } from '../src/parser';
import { analyze } from '../src/analyzer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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
    const results = analyze(files);
    
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
    const results = analyze(files);
    
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
    const results = analyze(files);
    
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
    const results = analyze(files);
    
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
/* 
 * Multi-line comment
 * No actual code
 */
// More comments`);
    
    // Minimal valid code
    fs.writeFileSync(path.join(tempDir, 'minimal.ts'), 'export const x = 1;');
    
    const files = await parseDirectory(tempDir);
    const results = analyze(files);
    
    expect(results.summary.totalFiles).toBe(3);
    expect(results.summary.totalLines).toBeGreaterThanOrEqual(1);
    expect(results.score).toBeGreaterThan(0);
    expect(results.grade).toBeTruthy();
  });
});