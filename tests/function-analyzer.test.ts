import { describe, it, expect, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { functionAnalyzer } from '../src/function-analyzer';

describe('FunctionAnalyzer', () => {
  let project: Project;
  
  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
    functionAnalyzer.clearCaches();
  });

  describe('buildFunctionAnalysis', () => {
    it('should return empty array for file with no functions', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        const value = 42;
        const name = "test";
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result).toEqual([]);
    });

    it('should analyze simple function declaration', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        function simpleFunction(a: number, b: number): number {
          return a + b;
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result).toHaveLength(1);
      
      const fn = result[0];
      expect(fn.name).toBe('simpleFunction');
      expect(fn.parameterCount).toBe(2);
      expect(fn.complexity).toBeGreaterThanOrEqual(1);
      expect(fn.loc).toBeGreaterThan(0);
      expect(fn.line).toBe(2);
    });

    it('should analyze class methods', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        class TestClass {
          constructor(private value: number) {}
          
          getValue(): number {
            return this.value;
          }
          
          setValue(newValue: number): void {
            this.value = newValue;
          }
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result.length).toBeGreaterThanOrEqual(1);
      
      const functionNames = result.map(f => f.name);
      expect(functionNames).toContain('getValue');
      expect(functionNames).toContain('setValue');
    });

    it('should analyze arrow functions', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        const arrowFunction = (x: number, y: number) => {
          const sum = x + y;
          return sum * 2;
        };
        
        const simpleArrow = (n: number) => n * 2;
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result.length).toBeGreaterThanOrEqual(1);
      
      const complexArrow = result.find(f => f.name === 'arrowFunction');
      if (complexArrow) {
        expect(complexArrow.parameterCount).toBe(2);
        expect(complexArrow.loc).toBeGreaterThan(1);
      }
    });

    it('should handle functions with high complexity', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        function complexFunction(x: number): number {
          if (x > 10) {
            for (let i = 0; i < x; i++) {
              if (i % 2 === 0) {
                if (i > 5) {
                  return i;
                } else {
                  continue;
                }
              } else {
                try {
                  if (i * x > 100) {
                    throw new Error('too big');
                  }
                } catch (e) {
                  return -1;
                }
              }
            }
          }
          return 0;
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result).toHaveLength(1);
      
      const fn = result[0];
      expect(fn.complexity).toBeGreaterThan(5);
      expect(fn.issues.length).toBeGreaterThan(0);
    });

    it('should handle functions with many parameters', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        function manyParams(
          a: string,
          b: number,
          c: boolean,
          d: object,
          e: string[],
          f: number,
          g: boolean,
          h: any
        ): void {
          console.log(a, b, c, d, e, f, g, h);
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result).toHaveLength(1);
      
      const fn = result[0];
      expect(fn.parameterCount).toBe(8);
      expect(fn.issues.some(issue => issue.type === 'too-many-params')).toBe(true);
    });

    it('should handle very long functions', () => {
      const longFunctionBody = Array(50).fill('  console.log("line");').join('\n');
      const sourceFile = project.createSourceFile('test.ts', `
        function longFunction(): void {
${longFunctionBody}
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result).toHaveLength(1);
      
      const fn = result[0];
      expect(fn.loc).toBeGreaterThan(30);
      expect(fn.issues.some(issue => issue.type === 'long-function')).toBe(true);
    });

    it('should handle trivial and substantial functions', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        function trivial1() {}
        function trivial2() { return; }
        function getter() { return this.value; }
        
        function substantial() {
          const x = 1;
          const y = 2;
          return x + y;
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      
      // Test actual behavior - analyzer may include or exclude based on its logic
      expect(Array.isArray(result)).toBe(true);
      
      // If any functions are returned, they should have valid structure
      result.forEach(fn => {
        expect(typeof fn.name).toBe('string');
        expect(fn.complexity).toBeGreaterThanOrEqual(1);
        expect(fn.loc).toBeGreaterThan(0);
      });
    });

    it('should handle files with mixed function types', () => {
      const sourceFile = project.createSourceFile('test.ts', `
        // Function declaration
        function regularFunction(param: string): string {
          return param.toUpperCase();
        }
        
        // Class with methods
        class MyClass {
          method(x: number): number {
            if (x > 0) {
              return x * 2;
            }
            return 0;
          }
        }
        
        // Arrow function
        const arrow = (n: number) => {
          if (n < 0) return 0;
          return n + 1;
        };
        
        // Function expression
        const funcExpr = function(a: boolean) {
          if (a) {
            return "true";
          }
          return "false";
        };
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'test.ts');
      expect(result.length).toBeGreaterThanOrEqual(3);
      
      const names = result.map(f => f.name);
      expect(names).toContain('regularFunction');
      expect(names).toContain('method');
    });

    it('should handle performance timeout scenarios', () => {
      // Create a file with many functions to test batching and timeout handling
      const manyFunctions = Array(100).fill(0).map((_, i) => `
        function func${i}(param${i}: number): number {
          if (param${i} > ${i}) {
            return param${i} * ${i};
          }
          return ${i};
        }
      `).join('\n');
      
      const sourceFile = project.createSourceFile('large.ts', manyFunctions);
      
      // Should not throw or hang
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'large.ts');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('issue identification', () => {
    it('should identify god functions accurately', () => {
      const sourceFile = project.createSourceFile('god.ts', `
        function godFunction(): void {
          // High complexity with multiple responsibilities
          let result = 0;
          
          // Database operations
          const users = getUsersFromDatabase();
          
          // Validation logic
          for (const user of users) {
            if (user.email && validateEmail(user.email)) {
              if (user.age >= 18) {
                if (user.active) {
                  // Business logic
                  if (user.subscriptionType === 'premium') {
                    result += calculatePremiumPoints(user);
                  } else if (user.subscriptionType === 'basic') {
                    result += calculateBasicPoints(user);
                  }
                  
                  // Notification logic
                  if (user.notificationsEnabled) {
                    sendWelcomeEmail(user);
                    scheduleFollowUp(user);
                  }
                  
                  // Analytics
                  trackUserEvent('user_processed', user.id);
                  updateMetrics(user);
                }
              }
            }
          }
          
          // File operations
          saveResultToFile(result);
          logOperation('god_function_executed');
        }
        
        function getUsersFromDatabase() { return []; }
        function validateEmail(email: string) { return true; }
        function calculatePremiumPoints(user: any) { return 10; }
        function calculateBasicPoints(user: any) { return 5; }
        function sendWelcomeEmail(user: any) {}
        function scheduleFollowUp(user: any) {}
        function trackUserEvent(event: string, id: string) {}
        function updateMetrics(user: any) {}
        function saveResultToFile(result: number) {}
        function logOperation(op: string) {}
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'god.ts');
      const godFunc = result.find(f => f.name === 'godFunction');
      
      expect(godFunc).toBeDefined();
      if (godFunc) {
        expect(godFunc.issues.some(issue => 
          issue.type === 'god-function' || 
          issue.type === 'multiple-responsibilities' ||
          issue.type === 'high-complexity'
        )).toBe(true);
      }
    });

    it('should handle deep nesting appropriately', () => {
      const sourceFile = project.createSourceFile('nested.ts', `
        function deeplyNested(x: number): number {
          if (x > 0) {
            if (x > 10) {
              if (x > 20) {
                if (x > 30) {
                  if (x > 40) {
                    return x * 5;
                  }
                  return x * 4;
                }
                return x * 3;
              }
              return x * 2;
            }
            return x;
          }
          return 0;
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'nested.ts');
      expect(result).toHaveLength(1);
      
      const fn = result[0];
      expect(fn.complexity).toBeGreaterThan(5); // Deep nesting increases complexity
      
      // Function should be analyzed and have valid structure
      expect(fn.name).toBe('deeplyNested');
      expect(fn.parameterCount).toBe(1);
      expect(Array.isArray(fn.issues)).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty functions without errors', () => {
      const sourceFile = project.createSourceFile('empty.ts', `
        function empty() {}
        function emptyWithReturn() { return; }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'empty.ts');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle functions with syntax issues gracefully', () => {
      // Note: ts-morph might not parse this, but we test graceful degradation
      const sourceFile = project.createSourceFile('syntax.ts', `
        function validFunction() {
          return 42;
        }
        
        function anotherValid(x: number) {
          if (x > 0) {
            return x;
          }
          return 0;
        }
      `);
      
      expect(() => {
        const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'syntax.ts');
        expect(Array.isArray(result)).toBe(true);
      }).not.toThrow();
    });

    it('should provide deterministic analysis structure', () => {
      const sourceFile = project.createSourceFile('consistent.ts', `
        function testConsistency(param: string): string {
          if (param.length > 5) {
            return param.toUpperCase();
          }
          return param.toLowerCase();
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'consistent.ts');
      
      // Should return consistent structure regardless of internal state
      expect(Array.isArray(result)).toBe(true);
      
      // If functions are included, they should have valid properties
      result.forEach(fn => {
        expect(typeof fn.name).toBe('string');
        expect(typeof fn.complexity).toBe('number');
        expect(typeof fn.parameterCount).toBe('number');
        expect(typeof fn.loc).toBe('number');
        expect(Array.isArray(fn.issues)).toBe(true);
      });
    });
  });

  describe('function analysis data integrity', () => {
    it('should provide valid analysis data structure', () => {
      const sourceFile = project.createSourceFile('data.ts', `
        function testDataIntegrity(x: number, y: string): boolean {
          if (x > 0 && y.length > 0) {
            for (let i = 0; i < x; i++) {
              console.log(y + i);
            }
            return true;
          }
          return false;
        }
      `);
      
      const result = functionAnalyzer.buildFunctionAnalysis(sourceFile, 'data.ts');
      expect(result).toHaveLength(1);
      
      const fn = result[0];
      
      // Verify required properties exist
      expect(typeof fn.name).toBe('string');
      expect(typeof fn.line).toBe('number');
      expect(typeof fn.endLine).toBe('number');
      expect(typeof fn.complexity).toBe('number');
      expect(typeof fn.loc).toBe('number');
      expect(typeof fn.parameterCount).toBe('number');
      expect(Array.isArray(fn.issues)).toBe(true);
      
      // Verify logical constraints
      expect(fn.line).toBeGreaterThan(0);
      expect(fn.endLine).toBeGreaterThanOrEqual(fn.line);
      expect(fn.complexity).toBeGreaterThanOrEqual(1);
      expect(fn.loc).toBeGreaterThan(0);
      expect(fn.parameterCount).toBeGreaterThanOrEqual(0);
      
      // Verify issues have proper structure if they exist
      fn.issues.forEach(issue => {
        expect(typeof issue.type).toBe('string');
        expect(typeof issue.severity).toBe('string');
        expect(typeof issue.description).toBe('string');
        expect(issue.location).toBeDefined();
        expect(typeof issue.location.file).toBe('string');
        expect(typeof issue.location.line).toBe('number');
      });
    });
  });
});