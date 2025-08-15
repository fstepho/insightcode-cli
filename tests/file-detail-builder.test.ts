import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fileDetailBuilder, calculateFunctionComplexity } from '../src/file-detail-builder';
import { ASTBuildResult } from '../src/ast-builder';
import { Project, SourceFile } from 'ts-morph';

// Mock performance for tests
const mockPerformance = {
  now: vi.fn(() => Date.now())
};
global.performance = mockPerformance as any;

// Mock console.warn to avoid noise in test output
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

// Helper function to create a mock SourceFile
function createMockSourceFile(content: string, filePath: string = 'test.ts'): SourceFile {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: 1 // ES5
    }
  });
  
  return project.createSourceFile(filePath, content);
}

// Helper function to create basic ASTBuildResult
function createMockASTBuildResult(files: Array<{
  content: string;
  filePath?: string;
  relativePath?: string;
}>): ASTBuildResult {
  const project = new Project({
    useInMemoryFileSystem: true
  });

  return {
    files: files.map((file, index) => {
      const filePath = file.filePath || `test${index}.ts`;
      const relativePath = file.relativePath || `src/test${index}.ts`;
      const sourceFile = project.createSourceFile(filePath, file.content);
      
      return {
        filePath,
        sourceFile,
        content: file.content,
        relativePath
      };
    }),
    project,
    totalFiles: files.length
  };
}

describe('FileDetailBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('build', () => {
    it('should build FileDetail array from AST data', async () => {
      const astData = createMockASTBuildResult([
        { content: 'function test() { return 42; }', relativePath: 'src/test.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        file: 'src/test.ts',
        metrics: expect.objectContaining({
          complexity: expect.any(Number),
          loc: expect.any(Number),
          functionCount: expect.any(Number),
          duplicationRatio: 0
        }),
        issues: expect.any(Array),
        functions: expect.any(Array),
        dependencies: expect.objectContaining({
          incomingDependencies: 0,
          outgoingDependencies: 0,
          instability: 0,
          cohesionScore: 0,
          percentileUsageRank: 0,
          isInCycle: false
        }),
        healthScore: 0
      });
    });

    it('should process files in batches', async () => {
      const files = Array.from({ length: 25 }, (_, i) => ({
        content: `function test${i}() { return ${i}; }`,
        relativePath: `src/test${i}.ts`
      }));
      
      const astData = createMockASTBuildResult(files);
      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });

      expect(result).toHaveLength(25);
    });

    it('should handle build failures gracefully', async () => {
      const astData = createMockASTBuildResult([
        { content: 'invalid syntax <<<', relativePath: 'src/invalid.ts' }
      ]);

      // Mock a build failure by throwing error in performance.now
      mockPerformance.now.mockImplementationOnce(() => { throw new Error('Mock error'); });
      
      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });

      // Should handle error gracefully and filter out failed builds
      expect(result).toHaveLength(0);
      expect(mockConsoleWarn).toHaveBeenCalled();
    });

    it('should clear caches after processing', async () => {
      const astData = createMockASTBuildResult([
        { content: 'function test() { return 42; }', relativePath: 'src/test.ts' }
      ]);

      await fileDetailBuilder.build(astData, { projectPath: '/test' });

      // Can't directly test cache clearing, but ensure no errors occur
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('calculateLOC', () => {
    it('should return 1 for empty content', async () => {
      const astData = createMockASTBuildResult([
        { content: '', relativePath: 'src/empty.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      expect(result[0].metrics.loc).toBe(1);
    });

    it('should count only code lines, excluding comments and blank lines', async () => {
      const content = `// This is a comment
      
function test() {
  /* Multi-line
     comment */
  return 42; // inline comment
}

// Another comment
`;
      
      const astData = createMockASTBuildResult([
        { content, relativePath: 'src/test.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      // Should count: function declaration line, return statement
      expect(result[0].metrics.loc).toBeGreaterThan(1);
      expect(result[0].metrics.loc).toBeLessThan(10); // Much less than total lines
    });

    it('should handle mixed code and comments on same line', async () => {
      const content = `const x = 1; /* comment */ const y = 2;`;
      
      const astData = createMockASTBuildResult([
        { content, relativePath: 'src/test.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      expect(result[0].metrics.loc).toBe(1);
    });
  });

  describe('complexity calculation', () => {
    it('should calculate basic function complexity', () => {
      const sourceFile = createMockSourceFile(`
        function simpleFunction() {
          return 42;
        }
      `);
      
      const functionNode = sourceFile.getFunction('simpleFunction')!;
      const complexity = calculateFunctionComplexity(functionNode);
      
      expect(complexity).toBe(1); // Base complexity
    });

    it('should calculate complexity with control structures', () => {
      const sourceFile = createMockSourceFile(`
        function complexFunction(x: number) {
          if (x > 10) {
            for (let i = 0; i < x; i++) {
              if (i % 2 === 0) {
                return i;
              }
            }
          }
          return 0;
        }
      `);
      
      const functionNode = sourceFile.getFunction('complexFunction')!;
      const complexity = calculateFunctionComplexity(functionNode);
      
      expect(complexity).toBeGreaterThan(1);
      expect(complexity).toBe(4); // 1 base + 1 if + 1 for + 1 if
    });

    it('should handle logical operators', () => {
      const sourceFile = createMockSourceFile(`
        function logicalFunction(a: boolean, b: boolean, c: boolean) {
          return a && b || c;
        }
      `);
      
      const functionNode = sourceFile.getFunction('logicalFunction')!;
      const complexity = calculateFunctionComplexity(functionNode);
      
      expect(complexity).toBeGreaterThan(1);
    });

    it('should not count nested functions in parent complexity', () => {
      const sourceFile = createMockSourceFile(`
        function outerFunction() {
          function innerFunction() {
            if (true) return 1;
            return 0;
          }
          return innerFunction();
        }
      `);
      
      const outerFunction = sourceFile.getFunction('outerFunction')!;
      const complexity = calculateFunctionComplexity(outerFunction);
      
      expect(complexity).toBe(1); // Should not count inner function's complexity
    });

    it('should handle switch statements', () => {
      const sourceFile = createMockSourceFile(`
        function switchFunction(x: number) {
          switch (x) {
            case 1:
              return 'one';
            case 2:
              return 'two';
            default:
              return 'other';
          }
        }
      `);
      
      const functionNode = sourceFile.getFunction('switchFunction')!;
      const complexity = calculateFunctionComplexity(functionNode);
      
      expect(complexity).toBeGreaterThan(1);
    });
  });

  describe('file type classification', () => {
    it('should classify test files correctly', async () => {
      const astData = createMockASTBuildResult([
        { content: 'function test() {}', relativePath: 'src/test/example.test.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      // Test files typically have different threshold handling
      expect(result[0]).toBeDefined();
    });

    it('should classify config files correctly', async () => {
      const astData = createMockASTBuildResult([
        { content: 'export default {};', relativePath: 'webpack.config.js' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      expect(result[0]).toBeDefined();
    });

    it('should classify utility files correctly', async () => {
      const astData = createMockASTBuildResult([
        { content: 'export function util() {}', relativePath: 'scripts/build.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      expect(result[0]).toBeDefined();
    });

    it('should classify production files correctly', async () => {
      const astData = createMockASTBuildResult([
        { content: 'export function main() {}', relativePath: 'src/index.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      expect(result[0]).toBeDefined();
    });
  });

  describe('issue extraction', () => {
    it('should detect high complexity files', async () => {
      // Create a file with very high complexity
      const complexContent = `
        function veryComplexFunction() {
          ${Array.from({ length: 100 }, (_, i) => `
            if (condition${i}) {
              for (let j = 0; j < 10; j++) {
                if (j % 2) {
                  while (true) {
                    if (Math.random() > 0.5) break;
                  }
                }
              }
            }
          `).join('')}
        }
      `;
      
      const astData = createMockASTBuildResult([
        { content: complexContent, relativePath: 'src/complex.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      const complexityIssues = result[0].issues.filter(issue => 
        issue.type.includes('complexity')
      );
      expect(complexityIssues.length).toBeGreaterThan(0);
    });

    it('should detect large files', async () => {
      // Create a file with many lines
      const largeContent = Array.from({ length: 300 }, (_, i) => 
        `const variable${i} = ${i};`
      ).join('\n');
      
      const astData = createMockASTBuildResult([
        { content: largeContent, relativePath: 'src/large.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      const sizeIssues = result[0].issues.filter(issue => 
        issue.type === 'large-file' || issue.type === 'very-large-file'
      );
      expect(sizeIssues.length).toBeGreaterThan(0);
    });

    it('should detect too many functions', async () => {
      // Create a file with many functions
      const manyFunctionsContent = Array.from({ length: 25 }, (_, i) => 
        `function func${i}() { return ${i}; }`
      ).join('\n');
      
      const astData = createMockASTBuildResult([
        { content: manyFunctionsContent, relativePath: 'src/manyFunctions.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      const functionCountIssues = result[0].issues.filter(issue => 
        issue.type === 'too-many-functions'
      );
      expect(functionCountIssues.length).toBeGreaterThan(0);
    });

    it('should include proper issue metadata', async () => {
      const astData = createMockASTBuildResult([
        { content: 'function test() {}', relativePath: 'src/test.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      result[0].issues.forEach(issue => {
        expect(issue).toMatchObject({
          type: expect.any(String),
          severity: expect.stringMatching(/^(critical|high|medium|low)$/),
          location: expect.objectContaining({
            file: expect.any(String),
            line: expect.any(Number)
          }),
          description: expect.any(String)
        });
        
        if (issue.threshold !== undefined) {
          expect(typeof issue.threshold).toBe('number');
          expect(typeof issue.actualValue).toBe('number');
          expect(typeof issue.excessRatio).toBe('number');
        }
      });
    });
  });

  describe('function analysis integration', () => {
    it('should include function analysis in results', async () => {
      const content = `
        function testFunction() {
          return 42;
        }
        
        class TestClass {
          testMethod() {
            return 'test';
          }
        }
      `;
      
      const astData = createMockASTBuildResult([
        { content, relativePath: 'src/test.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(result[0].functions).toBeDefined();
      expect(Array.isArray(result[0].functions)).toBe(true);
    });
  });

  describe('performance edge cases', () => {
    it('should handle files with many functions efficiently', async () => {
      // Create a file with many functions to test performance optimizations
      const manyFunctionsContent = Array.from({ length: 600 }, (_, i) => 
        `function func${i}() { if (true) return ${i}; else return 0; }`
      ).join('\n');
      
      const astData = createMockASTBuildResult([
        { content: manyFunctionsContent, relativePath: 'src/huge.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      // Performance test completed
      
      expect(result).toHaveLength(1);
      expect(result[0].metrics.functionCount).toBe(600);
      
      // Should use sampling for extremely large files
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Extremely large file')
      );
    });

    it('should handle timeout in complexity calculations', async () => {
      // Create content that would trigger timeout logic
      const timeoutContent = `
        function timeoutFunction() {
          ${Array.from({ length: 50 }, (_, i) => `
            if (condition${i}) {
              for (let j = 0; j < 100; j++) {
                while (someCondition${i}) {
                  if (anotherCondition) break;
                }
              }
            }
          `).join('')}
        }
      `;
      
      // Mock timeout scenario
      let callCount = 0;
      mockPerformance.now.mockImplementation(() => {
        callCount++;
        // Simulate timeout after a few calls
        if (callCount > 5) {
          return 20000; // 20 seconds, should trigger timeout
        }
        return 1000;
      });

      const astData = createMockASTBuildResult([
        { content: timeoutContent, relativePath: 'src/timeout.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(result).toHaveLength(1);
      // Should handle timeout gracefully
    });
  });

  describe('absolute path handling', () => {
    it('should handle relative file paths correctly', async () => {
      const astData = createMockASTBuildResult([
        { 
          content: 'function test() {}', 
          filePath: '/test/src/test.ts',  // absolute path (comme le vrai ASTBuilder)
          relativePath: 'src/test.ts' 
        }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(result[0].file).toBe('src/test.ts');
      expect(result[0].absolutePath).toBe('/test/src/test.ts');
    });

    it('should handle absolute file paths correctly', async () => {
      const astData = createMockASTBuildResult([
        { 
          content: 'function test() {}', 
          filePath: '/Users/test/project/src/test.ts',  // absolute path
          relativePath: 'src/test.ts' 
        }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(result[0].file).toBe('src/test.ts');
      expect(result[0].absolutePath).toBe('/Users/test/project/src/test.ts');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle files with no functions', async () => {
      const astData = createMockASTBuildResult([
        { content: 'const x = 42; export default x;', relativePath: 'src/constants.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(result[0].metrics.functionCount).toBe(0);
      expect(result[0].metrics.complexity).toBe(1); // Minimum complexity
    });

    it('should handle malformed code gracefully', async () => {
      const astData = createMockASTBuildResult([
        { content: 'function incomplete(', relativePath: 'src/broken.ts' }
      ]);

      // Should not throw, may produce warnings
      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very small files', async () => {
      const astData = createMockASTBuildResult([
        { content: '1', relativePath: 'src/tiny.ts' }
      ]);

      const result = await fileDetailBuilder.build(astData, { projectPath: '/test' });
      
      expect(result[0].metrics.loc).toBe(1);
      expect(result[0].metrics.functionCount).toBe(0);
      expect(result[0].metrics.complexity).toBe(1);
    });
  });
});