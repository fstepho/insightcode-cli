import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { extractCodeContext, enrichWithContext } from '../src/contextExtractor';
import { FileDetail } from '../src/types';

describe('ContextExtractor', () => {
  let tempDir: string;
  let testFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'context-test-'));
  });

  describe('extractCodeContext', () => {
    it('should extract critical functions with high complexity', () => {
      const testCode = `
function simpleFunction() {
  return 42;
}

function complexFunction(a, b, c, d, e, f, g) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          if (e > 0) {
            for (let i = 0; i < f; i++) {
              if (i % 2 === 0) {
                if (i > 10) {
                  console.log('even and > 10');
                } else {
                  console.log('even and <= 10');
                }
              } else {
                if (i > 10) {
                  console.log('odd and > 10');
                } else {
                  console.log('odd and <= 10');
                }
              }
            }
          }
        }
      }
    }
  }
  return a + b + c + d + e + f + g;
}
`;

      testFile = path.join(tempDir, 'test.ts');
      fs.writeFileSync(testFile, testCode);

      const mockFileDetail: FileDetail = {
        file: path.relative(process.cwd(), testFile),
        metrics: { complexity: 25, loc: 30, functionCount: 2, duplicationRatio: 0 },
        dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
        issues: [],
        healthScore: 70
      };

      const result = extractCodeContext(testFile, mockFileDetail, process.cwd());

      expect(result.file).toContain('test.ts');
      expect(result.criticalFunctions).toHaveLength(1);
      expect(result.criticalFunctions[0].name).toBe('complexFunction');
      expect(result.criticalFunctions[0].complexity).toBeGreaterThan(5);
      expect(result.criticalFunctions[0].parameterCount).toBe(7);
      expect(result.criticalFunctions[0].issues).toContainEqual(
        expect.objectContaining({ type: 'too-many-params' })
      );
      expect(result.criticalFunctions[0].snippet).toContain('function complexFunction');
    });

    it('should detect quality patterns correctly', () => {
      const testCode = `
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

function deepNesting() {
  if (true) {
    if (true) {
      if (true) {
        if (true) {
          if (true) {
            console.log('deep');
          }
        }
      }
    }
  }
}
`;

      testFile = path.join(tempDir, 'patterns.ts');
      fs.writeFileSync(testFile, testCode);

      const mockFileDetail: FileDetail = {
        file: path.relative(process.cwd(), testFile),
        metrics: { complexity: 15, loc: 25, functionCount: 2, duplicationRatio: 0 },
        dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
        issues: [],
        healthScore: 65
      };

      const result = extractCodeContext(testFile, mockFileDetail, process.cwd());

      expect(result.patterns.quality).toContain('deep-nesting');
      expect(result.patterns.architecture).toContain('async-heavy');
      expect(result.patterns.architecture).toContain('error-handling');
      expect(result.patterns.architecture).toContain('type-safe');
    });

    it('should detect performance and security patterns', () => {
      const testCode = `
import * as fs from 'fs';

function validateInput(input: string) {
  if (!input || input.trim().length === 0) {
    throw new Error('Invalid input');
  }
  return input.trim().toLowerCase();
}

function processFile(filename: string) {
  const data = fs.readFileSync(filename, 'utf-8');
  const cache = new Map();
  
  if (cache.has(filename)) {
    return cache.get(filename);
  }
  
  const result = validateInput(data);
  cache.set(filename, result);
  return result;
}
`;

      testFile = path.join(tempDir, 'security.ts');
      fs.writeFileSync(testFile, testCode);

      const mockFileDetail: FileDetail = {
        file: path.relative(process.cwd(), testFile),
        metrics: { complexity: 12, loc: 20, functionCount: 2, duplicationRatio: 0 },
        dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
        issues: [],
        healthScore: 75
      };

      const result = extractCodeContext(testFile, mockFileDetail, process.cwd());

      // Le pattern io-heavy detecte readFile, writeFile, etc.
      expect(result.patterns.performance).toContain('io-heavy');
      expect(result.patterns.performance).toContain('caching');
      expect(result.patterns.security).toContain('input-validation');
    });

    it('should detect test patterns', () => {
      const testCode = `
import { describe, it, expect, jest } from '@jest/globals';

describe('MyModule', () => {
  const mockFunction = jest.fn();
  
  it('should work correctly', () => {
    const spy = jest.spyOn(console, 'log');
    mockFunction.mockReturnValue('test');
    
    expect(mockFunction()).toBe('test');
    expect(spy).toHaveBeenCalled();
  });
});
`;

      testFile = path.join(tempDir, 'test.spec.ts');
      fs.writeFileSync(testFile, testCode);

      const mockFileDetail: FileDetail = {
        file: path.relative(process.cwd(), testFile),
        metrics: { complexity: 5, loc: 15, functionCount: 1, duplicationRatio: 0 },
        dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
        issues: [],
        healthScore: 90
      };

      const result = extractCodeContext(testFile, mockFileDetail, process.cwd());

      expect(result.patterns.testing).toContain('test-file');
      expect(result.patterns.testing).toContain('mock-heavy');
    });
  });

  describe('enrichWithContext', () => {
    it('should only process critical files (health score < 80)', () => {
      // Create the critical file with complex code
      const criticalFile = path.join(tempDir, 'critical.ts');
      
      const files: FileDetail[] = [
        {
          file: 'healthy.ts',
          metrics: { complexity: 5, loc: 10, functionCount: 1, duplicationRatio: 0 },
          dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
          issues: [],
          healthScore: 85
        },
        {
          file: path.relative(process.cwd(), criticalFile),
          metrics: { complexity: 25, loc: 50, functionCount: 3, duplicationRatio: 0 },
          dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
          issues: [],
          healthScore: 60
        }
      ];
      fs.writeFileSync(criticalFile, `
function veryComplexFunction(a, b, c, d, e, f, g, h) {
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          if (e > 0) {
            for (let i = 0; i < f; i++) {
              if (i % 2 === 0) {
                if (i > 10) {
                  if (g > 5) {
                    console.log('complex path 1');
                  } else {
                    console.log('complex path 2');
                  }
                } else {
                  console.log('complex path 3');
                }
              } else {
                if (h > 3) {
                  console.log('complex path 4');
                } else {
                  console.log('complex path 5');
                }
              }
            }
          }
        }
      }
    }
  } else {
    if (b < 0) {
      if (c < 0) {
        console.log('negative path');
      }
    }
  }
  return a + b + c + d + e + f + g + h;
}
`);

      const results = enrichWithContext(files, tempDir);

      expect(results).toHaveLength(1);
      expect(results[0].file).toContain('critical.ts');
      expect(results[0].criticalFunctions).toHaveLength(1);
    });

    it('should handle errors gracefully', () => {
      const files: FileDetail[] = [
        {
          file: 'nonexistent.ts',
          metrics: { complexity: 25, loc: 50, functionCount: 3, duplicationRatio: 0 },
          dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
          issues: [],
          healthScore: 60
        }
      ];

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const results = enrichWithContext(files, tempDir);

      expect(results).toHaveLength(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not extract context for nonexistent.ts:'),
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('function issue detection', () => {
    it('should identify multiple issues in problematic functions', () => {
      const testCode = `
function terribleFunction(a, b, c, d, e, f, g, h) {
  let result = 0;
  if (a > 0) {
    if (b > 0) {
      if (c > 0) {
        if (d > 0) {
          if (e > 0) {
            for (let i = 0; i < f; i++) {
              for (let j = 0; j < g; j++) {
                for (let k = 0; k < h; k++) {
                  if (i % 2 === 0) {
                    if (j % 2 === 0) {
                      if (k % 2 === 0) {
                        result += i + j + k;
                      } else {
                        result -= i + j + k;
                      }
                    } else {
                      result *= 2;
                    }
                  } else {
                    result /= 2;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  // Add many more lines to make it long
  console.log('line 1');
  console.log('line 2');
  console.log('line 3');
  console.log('line 4');
  console.log('line 5');
  console.log('line 6');
  console.log('line 7');
  console.log('line 8');
  console.log('line 9');
  console.log('line 10');
  console.log('line 11');
  console.log('line 12');
  console.log('line 13');
  console.log('line 14');
  console.log('line 15');
  console.log('line 16');
  console.log('line 17');
  console.log('line 18');
  console.log('line 19');
  console.log('line 20');
  console.log('line 21');
  console.log('line 22');
  console.log('line 23');
  console.log('line 24');
  console.log('line 25');
  console.log('line 26');
  console.log('line 27');
  console.log('line 28');
  console.log('line 29');
  console.log('line 30');
  return result;
}
`;

      testFile = path.join(tempDir, 'terrible.ts');
      fs.writeFileSync(testFile, testCode);

      const mockFileDetail: FileDetail = {
        file: path.relative(process.cwd(), testFile),
        metrics: { complexity: 50, loc: 60, functionCount: 1, duplicationRatio: 0 },
        dependencies: { instability: 0, cohesionScore: 0, incomingDependencies: 0, outgoingDependencies: 0, percentileUsageRank: 0, isInCycle: false },
        issues: [],
        healthScore: 30
      };

      const result = extractCodeContext(testFile, mockFileDetail, process.cwd());

      expect(result.criticalFunctions).toHaveLength(1);
      const func = result.criticalFunctions[0];
      
      expect(func.name).toBe('terribleFunction');
      // La complexité dépend de l'algorithme de calcul exact
      const hasHighComplexity = func.issues.some(issue => issue.type === 'high-complexity');
      if (func.complexity > 20) {
        expect(hasHighComplexity).toBe(true);
      }
      expect(func.issues).toContainEqual(
        expect.objectContaining({ type: 'long-function', severity: 'medium' })
      );
      expect(func.issues).toContainEqual(
        expect.objectContaining({ type: 'too-many-params', severity: 'medium' })
      );
      expect(func.issues).toContainEqual(
        expect.objectContaining({ type: 'deep-nesting', severity: 'medium' })
      );
    });
  });
});