import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { parseFile, parseDirectory, findFiles } from '../src/parser';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Parser', () => {
  let tempDir: string;
  
  beforeEach(() => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insightcode-test-'));
  });
  
  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
  
  describe('findFiles', () => {
    it('should find TypeScript and JavaScript files', async () => {
      // Create test files
      fs.writeFileSync(path.join(tempDir, 'test.ts'), 'const x = 1;');
      fs.writeFileSync(path.join(tempDir, 'test.js'), 'const y = 2;');
      fs.writeFileSync(path.join(tempDir, 'test.tsx'), 'const z = 3;');
      fs.writeFileSync(path.join(tempDir, 'test.jsx'), 'const w = 4;');
      fs.writeFileSync(path.join(tempDir, 'test.txt'), 'not included');
      
      const files = await findFiles(tempDir);
      
      expect(files).toHaveLength(4);
      expect(files.some(f => f.endsWith('test.ts'))).toBe(true);
      expect(files.some(f => f.endsWith('test.js'))).toBe(true);
      expect(files.some(f => f.endsWith('test.tsx'))).toBe(true);
      expect(files.some(f => f.endsWith('test.jsx'))).toBe(true);
      expect(files.some(f => f.endsWith('test.txt'))).toBe(false);
    });
    
    it('should exclude node_modules by default', async () => {
      // Create node_modules with a file
      const nodeModulesDir = path.join(tempDir, 'node_modules');
      fs.mkdirSync(nodeModulesDir);
      fs.writeFileSync(path.join(nodeModulesDir, 'lib.ts'), 'export const x = 1;');
      fs.writeFileSync(path.join(tempDir, 'app.ts'), 'const app = true;');
      
      const files = await findFiles(tempDir);
      
      expect(files).toHaveLength(1);
      expect(files[0].endsWith('app.ts')).toBe(true);
    });
    
    it('should respect custom exclude patterns', async () => {
      fs.writeFileSync(path.join(tempDir, 'app.ts'), 'const app = 1;');
      fs.writeFileSync(path.join(tempDir, 'app.spec.ts'), 'test("", () => {});');
      
      const files = await findFiles(tempDir, ['**/*.spec.ts']);
      
      expect(files).toHaveLength(1);
      expect(files[0].endsWith('app.ts')).toBe(true);
    });
    
    it('should exclude utility files when excludeUtility is true', async () => {
      fs.writeFileSync(path.join(tempDir, 'app.ts'), 'const app = 1;');
      fs.writeFileSync(path.join(tempDir, 'app.test.ts'), 'test("", () => {});');
      fs.mkdirSync(path.join(tempDir, 'scripts'));
      fs.writeFileSync(path.join(tempDir, 'scripts', 'build.ts'), 'console.log("build");');
      
      const filesWithUtility = await findFiles(tempDir, [], false);
      const filesWithoutUtility = await findFiles(tempDir, [], true);
      
      expect(filesWithUtility).toHaveLength(3);
      expect(filesWithoutUtility).toHaveLength(1);
      expect(filesWithoutUtility[0].endsWith('app.ts')).toBe(true);
    });
  });
  
  describe('parseFile', () => {
    it('should calculate cyclomatic complexity correctly', () => {
      const testFile = path.join(tempDir, 'complex.ts');
      const code = `
function testFunction(x: number): number {
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
}`;
      
      fs.writeFileSync(testFile, code);
      const metrics = parseFile(testFile);
      
      // Base complexity 1 + 5 decision points = 6
      expect(metrics.complexity).toBe(6);
    });
    
    it('should count lines of code excluding comments and empty lines', () => {
      const testFile = path.join(tempDir, 'loc-test.ts');
      const code = `// This is a comment
function hello() {
  // Another comment
  console.log('Hello');
  
  /*
   * Multi-line comment
   */
  return true;
}

// More comments`;
      
      fs.writeFileSync(testFile, code);
      const metrics = parseFile(testFile);
      
      // Should count: function hello() {, console.log, return true;, }
      expect(metrics.loc).toBe(4);
    });
    
    it('should detect high complexity issues', () => {
      const testFile = path.join(tempDir, 'high-complex.ts');
      // Create a function with complexity > 20
      const conditions = Array(25).fill(0).map((_, i) => `  if (x === ${i}) return ${i};`).join('\n');
      const code = `function veryComplex(x: number): number {\n${conditions}\n  return -1;\n}`;
      
      fs.writeFileSync(testFile, code);
      const metrics = parseFile(testFile);
      
      expect(metrics.complexity).toBeGreaterThan(20);
      expect(metrics.issues).toHaveLength(1);
      expect(metrics.issues[0]).toMatchObject({
        type: 'complexity',
        severity: 'high',
        message: expect.stringContaining('High complexity')
      });
    });
    
    it('should detect medium complexity issues', () => {
      const testFile = path.join(tempDir, 'medium-complex.ts');
      const code = `
function mediumComplex(x: number): number {
  if (x > 10) {             // +1
    if (x > 20) {           // +1
      return x * 2;
    }
    return x;
  }
  
  for (let i = 0; i < x; i++) {    // +1
    if (i % 3 === 0) {             // +1
      console.log(i);
    } else if (i % 5 === 0) {      // +1
      console.log(i * 2);
    }
  }
  
  switch (x) {              // +1 per case
    case 1: return 1;      // +1
    case 2: return 2;      // +1
    case 3: return 3;      // +1
    case 4: return 4;      // +1
    case 5: return 5;      // +1
    default: return 0;
  }
}`;
      
      fs.writeFileSync(testFile, code);
      const metrics = parseFile(testFile);
      
      expect(metrics.complexity).toBeGreaterThan(10);
      expect(metrics.complexity).toBeLessThanOrEqual(20);
      expect(metrics.issues).toHaveLength(1);
      expect(metrics.issues[0].severity).toBe('medium');
    });
    
    it('should detect large file issues', () => {
      const testFile = path.join(tempDir, 'large-file.ts');
      // Create a file with 350 lines
      const lines = Array(350).fill(0).map((_, i) => `const var${i} = ${i};`).join('\n');
      
      fs.writeFileSync(testFile, lines);
      const metrics = parseFile(testFile);
      
      expect(metrics.loc).toBe(350);
      expect(metrics.issues).toHaveLength(1);
      expect(metrics.issues[0]).toMatchObject({
        type: 'size',
        severity: 'high',
        message: expect.stringContaining('Large file')
      });
    });
    
    it('should count functions correctly', () => {
      const testFile = path.join(tempDir, 'functions.ts');
      const code = `
function regularFunction() {}
const arrowFunction = () => {};
class TestClass {
  method() {}
  get accessor() { return 1; }
  set accessor(val: number) {}
  constructor() {}
}
const anonymousFunction = function() {};
`;
      
      fs.writeFileSync(testFile, code);
      const metrics = parseFile(testFile);
      
      expect(metrics.functionCount).toBe(7);
    });
    
    it('should handle logical operators in complexity calculation', () => {
      const testFile = path.join(tempDir, 'logical-ops.ts');
      const code = `
function testLogical(a: boolean, b: boolean, c: boolean): boolean {
  if (a && b) {          // +1 for if, +1 for &&
    return true;
  }
  
  if (a || b || c) {     // +1 for if, +1 for ||, +1 for ||
    return false;
  }
  
  return a ? b : c;      // +1 for ternary
}`;
      
      fs.writeFileSync(testFile, code);
      const metrics = parseFile(testFile);
      
      // Base 1 + if(2) + if(3) + ternary(1) = 7
      expect(metrics.complexity).toBe(7);
    });
  });
  
  describe('parseDirectory', () => {
    it('should parse all TypeScript files in directory', async () => {
      fs.writeFileSync(path.join(tempDir, 'file1.ts'), 'const x = 1;');
      fs.writeFileSync(path.join(tempDir, 'file2.ts'), 'function test() { return 2; }');
      fs.mkdirSync(path.join(tempDir, 'sub'));
      fs.writeFileSync(path.join(tempDir, 'sub', 'file3.ts'), 'export const y = 3;');
      
      const results = await parseDirectory(tempDir);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.complexity >= 1)).toBe(true);
      expect(results.every(r => r.loc > 0)).toBe(true);
    });
    
    it('should throw error when no files found', async () => {
      await expect(parseDirectory(tempDir)).rejects.toThrow('No TypeScript/JavaScript files found');
    });
    
    it('should handle parse errors gracefully', async () => {
      // Create an invalid TypeScript file
      fs.writeFileSync(path.join(tempDir, 'valid.ts'), 'const x = 1;');
      fs.writeFileSync(path.join(tempDir, 'invalid.ts'), 'const x = {');
      
      // Should still parse valid files
      const results = await parseDirectory(tempDir);
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });
});