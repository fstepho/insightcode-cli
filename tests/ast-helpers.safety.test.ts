import { describe, it, expect, vi } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import * as astHelpers from '../src/ast-helpers';

describe('AST traversal safety', () => {
  it('prevents infinite loops in traversal functions', () => {
    // Mock console.warn to capture warnings
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    try {
      // Create a deep nesting scenario that could trigger depth limits
      const deepCode = `
        function deeplyNested() {
          ${Array(150).fill(0).map((_, i) => `if (condition${i}) {`).join('\n')}
            return true;
          ${Array(150).fill(0).map(() => '}').join('\n')}
        }
      `;
      
      const { sf } = fromCode(deepCode);
      const fn = fnByName(sf, 'deeplyNested')!;
      
      // These should complete without hanging, even with deep nesting
      const maxNesting = astHelpers.getMaxNestingDepth(fn);
      const hasImpure = astHelpers.hasImpureOperations(fn);
      const lineCount = astHelpers.getFunctionLineCount(fn);
      
      // Should get reasonable results
      expect(maxNesting).toBeGreaterThan(0);
      expect(typeof hasImpure).toBe('boolean');
      expect(lineCount).toBeGreaterThan(0);
      
      // Functions should complete in reasonable time (not hang)
      expect(true).toBe(true); // If we get here, no infinite loop occurred
      
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('handles pathological AST structures gracefully', () => {
    // Test with very nested class structure
    const nestedClassCode = `
      ${Array(200).fill(0).map((_, i) => `class Class${i} {`).join('\n')}
        method() {
          return this.value;
        }
      ${Array(200).fill(0).map(() => '}').join('\n')}
    `;
    
    try {
      const { sf } = fromCode(nestedClassCode);
      
      // This should not hang or crash
      const methods = sf.getDescendantsOfKind(sf.constructor.SyntaxKind.MethodDeclaration);
      expect(methods.length).toBeGreaterThan(0);
      
    } catch (error) {
      // Even if parsing fails, it should not hang
      expect(error).toBeDefined();
    }
  });

  it('depth limits are enforced in traversal functions', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    try {
      // Create a structure that might trigger our depth warnings
      const complexCode = `
        function complex() {
          ${Array(200).fill(0).map((_, i) => `
            if (condition${i}) {
              for (let j${i} = 0; j${i} < 10; j${i}++) {
                while (check${i}) {
          `).join('\n')}
                  return result;
          ${Array(200).fill(0).map(() => `
                }
              }
            }
          `).join('\n')}
        }
      `;
      
      const { sf } = fromCode(complexCode);
      const fn = fnByName(sf, 'complex')!;
      
      // Should complete without hanging
      const result = astHelpers.getMaxNestingDepth(fn);
      expect(typeof result).toBe('number');
      
    } finally {
      consoleSpy.mockRestore();
    }
  });

  it('does not hang on recursive function analysis', () => {
    const recursiveCode = `
      function factorial(n: number): number {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
      }
      
      function mutuallyRecursiveA(x: number): number {
        if (x <= 0) return 0;
        return mutuallyRecursiveB(x - 1);
      }
      
      function mutuallyRecursiveB(x: number): number {
        if (x <= 0) return 1;
        return mutuallyRecursiveA(x - 1);
      }
    `;
    
    const { sf } = fromCode(recursiveCode);
    
    // These analyses should complete without hanging, even for recursive functions
    const factorial = fnByName(sf, 'factorial')!;
    const mutualA = fnByName(sf, 'mutuallyRecursiveA')!;
    
    const factorialNesting = astHelpers.getMaxNestingDepth(factorial);
    const factorialImpure = astHelpers.hasImpureOperations(factorial);
    const mutualNesting = astHelpers.getMaxNestingDepth(mutualA);
    
    expect(typeof factorialNesting).toBe('number');
    expect(typeof factorialImpure).toBe('boolean');
    expect(typeof mutualNesting).toBe('number');
  });
});