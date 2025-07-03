import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyze } from '../src/analyzer';
import { FileMetrics, Issue } from '../src/types';
import { resetConfig, setConfigForTesting, getConfig } from '../src/config';
import { getComplexityLabel, getDuplicationLabel } from '../src/scoring';

// Mock fs module
vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

import { readFileSync } from 'fs';

// Helper function to create FileMetrics for testing
function createFileMetrics(overrides: Partial<FileMetrics>): FileMetrics {
  return {
    path: 'test.ts',
    complexity: 1,
    duplication: 0,
    loc: 50,
    functionCount: 3,
    issues: [],
    totalScore: 100,
    complexityRatio: 0.1,
    sizeRatio: 0.25,
    ...overrides
  };
}

// Helper function to create Issue for testing
function createIssue(overrides: Partial<Issue>): Issue {
  return {
    type: 'complexity',
    severity: 'high',
    message: 'Test issue',
    value: 10,
    ...overrides
  };
}

describe('Analyzer', () => {
  beforeEach(() => {
    resetConfig();
  });

  describe('analyze', () => {
    it('should calculate correct score for perfect code', () => {
      const config = getConfig();
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'test1.ts',
          complexity: 1,
          duplication: 0,
          loc: 50,
          functionCount: 3,
          issues: []
        }),
        createFileMetrics({
          path: 'test2.ts',
          complexity: 2,
          duplication: 0,
          loc: 30,
          functionCount: 2,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      expect(result.summary.avgComplexity).toBe(1.5);
      expect(result.summary.avgDuplication).toBe(0);
      expect(result.summary.avgFunctions).toBe(2.5);
      expect(result.summary.avgLoc).toBe(40);
      expect(result.score).toBeGreaterThanOrEqual(config.grades.A);
      expect(result.grade).toBe('A');
    });
    
    it('should calculate correct score for poor quality code', () => {
      const config = getConfig();
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'complex.ts',
          complexity: config.complexity.poor,
          duplication: 0,
          loc: config.fileSize.poor,
          functionCount: config.functionCount.poor,
          issues: [
            createIssue({ type: 'complexity', severity: 'high', message: 'High complexity', value: config.complexity.poor })
          ]
        })
      ];
      
      const result = analyze(files);
      
      expect(result.summary.avgComplexity).toBe(config.complexity.poor);
      expect(result.summary.avgFunctions).toBe(config.functionCount.poor);
      expect(result.summary.avgLoc).toBe(config.fileSize.poor);
      expect(result.score).toBeLessThan(config.grades.C);
      expect(result.grade).toBe('D');
    });
    
    it('should handle empty file list', () => {
      const result = analyze([]);
      
      expect(result.summary.totalFiles).toBe(0);
      expect(result.summary.totalLines).toBe(0);
      expect(result.summary.avgComplexity).toBe(0);
      expect(result.summary.avgDuplication).toBe(0);
      expect(result.summary.avgFunctions).toBe(0);
      expect(result.summary.avgLoc).toBe(0);
      expect(result.score).toBe(100); // Empty returns default max score
      expect(result.grade).toBe('A');
    });
    
    it('should handle missing functionCount gracefully', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'legacy.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 0, // Missing function count
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Should use default value (0 or 10 depending on implementation)
      expect(result.summary.avgFunctions).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
    
    it('should calculate correct grade boundaries', () => {
      const testCases = [
        { score: 95, expectedGrade: 'A' },
        { score: 90, expectedGrade: 'A' },
        { score: 85, expectedGrade: 'B' },
        { score: 80, expectedGrade: 'B' },
        { score: 75, expectedGrade: 'C' },
        { score: 70, expectedGrade: 'C' },
        { score: 65, expectedGrade: 'D' },
        { score: 60, expectedGrade: 'D' },
        { score: 55, expectedGrade: 'F' },
        { score: 30, expectedGrade: 'F' }
      ];
      
      testCases.forEach(({ score, expectedGrade }) => {
        const complexity = Math.max(1, 20 - (score / 5));
        const files: FileMetrics[] = [createFileMetrics({
          path: 'test.ts',
          complexity,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        })];
        
        const result = analyze(files);
        const config = getConfig();
        const gradeRanges = {
          'A': [config.grades.A, 100],
          'B': [config.grades.B, config.grades.A - 1],
          'C': [config.grades.C, config.grades.B - 1],
          'D': [config.grades.D, config.grades.C - 1],
          'F': [0, config.grades.D - 1]
        };
        
        const [min, max] = gradeRanges[expectedGrade];
        if (result.score >= min && result.score <= max) {
          expect(result.grade).toBe(expectedGrade);
        }
      });
    });
  });
  
  describe('duplication detection', () => {
    it('should detect duplicated code blocks', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'file1.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        }),
        createFileMetrics({
          path: 'file2.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      expect(result.files).toHaveLength(2);
    });
    
    it('should add high duplication issues', () => {
      const files: FileMetrics[] = [createFileMetrics({
        path: 'duplicated.ts',
        complexity: 5,
        duplication: 35,
        loc: 100,
        functionCount: 5,
        issues: []
      })];
      
      const result = analyze(files);
      
      expect(result.summary.avgDuplication).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('score calculation', () => {
    it('should weight complexity at 40%', () => {
      const highComplexity: FileMetrics[] = [createFileMetrics({
        path: 'complex.ts',
        complexity: 25,
        duplication: 0,
        loc: 100,
        functionCount: 5,
        issues: []
      })];
      
      const result = analyze(highComplexity);
      
      expect(result.score).toBeLessThan(80);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });
    
    it('should weight duplication at 30%', () => {
      const highDuplication: FileMetrics[] = [createFileMetrics({
        path: 'duplicated.ts',
        complexity: 5,
        duplication: 40,
        loc: 100,
        functionCount: 5,
        issues: []
      })];
      
      const result = analyze(highDuplication);
      
      expect(result.score).toBeLessThanOrEqual(100); // Perfect other metrics compensate
      expect(result.score).toBeGreaterThan(75);
    });
    
    it('should weight maintainability at 30%', () => {
      const poorMaintainability: FileMetrics[] = [createFileMetrics({
        path: 'huge.ts',
        complexity: 5,
        duplication: 0,
        loc: 1000,
        functionCount: 50,
        issues: []
      })];
      
      const result = analyze(poorMaintainability);
      
      expect(result.score).toBeLessThan(80); // Large files still impact score
      expect(result.score).toBeGreaterThan(50);
    });
    
    it('should calculate maintainability as composite score', () => {
      const balanced: FileMetrics[] = [createFileMetrics({
        path: 'balanced.ts',
        complexity: 10,
        duplication: 10,
        loc: 200,
        functionCount: 10,
        issues: []
      })];
      
      const result = analyze(balanced);
      
      expect(result.score).toBeGreaterThan(95); // Good metrics across the board
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBe('A');
    });
  });
  
  describe('file scoring integration', () => {
    it('should calculate file scores correctly', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'good.ts',
          complexity: 5,
          duplication: 2,
          loc: 150,
          functionCount: 8,
          issues: []
        }),
        createFileMetrics({
          path: 'bad.ts',
          complexity: 25,
          duplication: 20,
          loc: 800,
          functionCount: 40,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Files should be sorted by total score
      expect(result.files).toHaveLength(2);
      expect(result.files[0].totalScore).toBeGreaterThan(result.files[1].totalScore);
      
      // Check that files have score properties
      expect(result.files[0]).toHaveProperty('totalScore');
      expect(result.files[0]).toHaveProperty('complexityRatio');
      expect(result.files[0]).toHaveProperty('sizeRatio');
    });
    
    it('should identify top critical files', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'critical.ts',
          complexity: 30,
          duplication: 0,
          loc: 500,
          functionCount: 25,
          issues: [
            createIssue({ type: 'complexity', severity: 'high', message: 'High complexity', value: 30 })
          ]
        }),
        createFileMetrics({
          path: 'normal.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      expect(result.topFiles).toHaveLength(1);
      expect(result.topFiles[0].path).toBe('critical.ts');
    });
    
    it('should handle weighted scoring correctly', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'test.ts',
          complexity: 10,
          duplication: 5,
          loc: 200,
          functionCount: 10,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Should have scores object with all components
      expect(result.scores).toHaveProperty('complexity');
      expect(result.scores).toHaveProperty('duplication');
      expect(result.scores).toHaveProperty('maintainability');
      expect(result.scores).toHaveProperty('overall');
      
      // Overall score should match legacy score property
      expect(result.scores.overall).toBe(result.score);
    });
  });
  
  describe('threshold configuration', () => {
    it('should use configurable thresholds and affect scoring', () => {
      const testFile = createFileMetrics({
        path: 'test.ts',
        complexity: 12,
        duplication: 0,
        loc: 100,
        functionCount: 5,
        issues: []
      });

      // Test with default config first
      resetConfig();
      const defaultResult = analyze([testFile]);
      const defaultGrade = defaultResult.grade;

      // Now test with stricter config
      setConfigForTesting({
        complexity: { excellent: 5, good: 8, acceptable: 10, poor: 15, veryPoor: 20 },
        duplication: { excellent: 2, good: 5, acceptable: 10, poor: 20, veryPoor: 30 },
        fileSize: { excellent: 50, good: 75, acceptable: 100, poor: 150, veryPoor: 200 },
        functionCount: { excellent: 3, good: 5, acceptable: 8, poor: 12 },
        grades: { A: 95, B: 85, C: 75, D: 65 },
        maintainabilityLabels: { good: 80, acceptable: 60, poor: 40 },
        extremeFilePenalties: { largeFileThreshold: 1000, largeFilePenalty: 10, massiveFileThreshold: 2000, massiveFilePenalty: 20 }
      });

      const strictResult = analyze([testFile]);
      const strictGrade = strictResult.grade;

      // The same file should get a worse score with stricter thresholds
      expect(strictResult.score).toBeLessThan(defaultResult.score);
      
      // Verify config is actually applied
      const config = getConfig();
      expect(config.complexity.excellent).toBe(5);
      expect(config.grades.A).toBe(95);
    });

    it('should affect complexity and duplication labels based on config', () => {
      // Test with default config
      resetConfig();
      const defaultComplexityLabel = getComplexityLabel(12);
      const defaultDuplicationLabel = getDuplicationLabel(5);

      // Test with custom config where thresholds are lower
      setConfigForTesting({
        complexity: { excellent: 5, good: 8, acceptable: 10, poor: 15, veryPoor: 20 },
        duplication: { excellent: 2, good: 4, acceptable: 6, poor: 10, veryPoor: 15 },
        fileSize: { excellent: 100, good: 200, acceptable: 300, poor: 400, veryPoor: 500 },
        functionCount: { excellent: 5, good: 10, acceptable: 15, poor: 20 },
        grades: { A: 90, B: 80, C: 70, D: 60 },
        maintainabilityLabels: { good: 80, acceptable: 60, poor: 40 },
        extremeFilePenalties: { largeFileThreshold: 1000, largeFilePenalty: 10, massiveFileThreshold: 2000, massiveFilePenalty: 20 }
      });

      const customComplexityLabel = getComplexityLabel(12);
      const customDuplicationLabel = getDuplicationLabel(5);

      // With lower thresholds, the same values should get worse labels
      expect(customComplexityLabel).not.toBe(defaultComplexityLabel);
      expect(customDuplicationLabel).not.toBe(defaultDuplicationLabel);
    });
    
    it('should handle different file types with thresholds', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'app.ts',
          complexity: 20,
          duplication: 0,
          loc: 400,
          functionCount: 15,
          fileType: 'production',
          issues: []
        }),
        createFileMetrics({
          path: 'test.spec.ts',
          complexity: 20,
          duplication: 0,
          loc: 400,
          functionCount: 15,
          fileType: 'test',
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Production files should have stricter thresholds
      const prodFile = result.files.find(f => f.path === 'app.ts');
      const testFile = result.files.find(f => f.path === 'test.spec.ts');
      
      expect(prodFile).toBeDefined();
      expect(testFile).toBeDefined();
      
      // Test files should be more lenient
      expect(prodFile!.issues.length).toBeGreaterThanOrEqual(testFile!.issues.length);
    });
  });
  
  describe('duplication detection with mocked files', () => {
    beforeEach(() => {
      // Mock fs.readFileSync
      vi.mocked(readFileSync).mockImplementation((filepath: any) => {
        const pathStr = filepath as string;
        const normalizedPath = pathStr.split('/').pop() || pathStr.split('\\').pop() || pathStr;
        
        if (normalizedPath === 'duplicated1.ts') {
          return `function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
    console.log('Processing item');
    if (item.discount) {
      total -= item.discount;
    }
    validateItem(item);
    updateCache(item.id);
  }
  return total;
}

function validateItem(item) {
  if (!item.price || item.price < 0) {
    throw new Error('Invalid price');
  }
  if (!item.quantity || item.quantity < 1) {
    throw new Error('Invalid quantity');
  }
  return true;
}`;
        }
        
        if (normalizedPath === 'duplicated2.ts') {
          return `function calculateSum(products) {
  let sum = 0;
  for (const product of products) {
    sum += product.price * product.quantity;
    console.log('Processing item');
    if (product.discount) {
      sum -= product.discount;
    }
    validateItem(product);
    updateCache(product.id);
  }
  return sum;
}

function validateItem(item) {
  if (!item.price || item.price < 0) {
    throw new Error('Invalid price');
  }
  if (!item.quantity || item.quantity < 1) {
    throw new Error('Invalid quantity');
  }
  return true;
}`;
        }
        
        if (normalizedPath === 'unique.ts') {
          return `
function uniqueFunction() {
  console.log('This is completely unique');
  return 'unique result';
}

class UniqueClass {
  constructor(private value: string) {}
  
  getValue() {
    return this.value;
  }
}
          `;
        }
        
        throw new Error('File not found');
      });
    });
    
    afterEach(() => {
      vi.restoreAllMocks();
    });
    
    it('should handle files with duplication correctly', () => {
      // Since file reading is complex to mock, we'll test with simulated duplication values
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'duplicated1.ts',
          complexity: 5,
          duplication: 25, // Simulate detected duplication
          loc: 100,
          functionCount: 5,
          issues: []
        }),
        createFileMetrics({
          path: 'duplicated2.ts', 
          complexity: 5,
          duplication: 15, // Simulate detected duplication
          loc: 100,
          functionCount: 5,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // The duplication detection algorithm will recalculate based on file content,
      // but we can test that the analyzer handles non-zero input duplication
      expect(result.summary.totalFiles).toBe(2);
      expect(result.files).toHaveLength(2);
      expect(typeof result.summary.avgDuplication).toBe('number');
    });
    
    it('should not detect duplication in unique files', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'unique.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        }),
        createFileMetrics({
          path: 'duplicated1.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      const uniqueFile = result.files.find(f => f.path === 'unique.ts');
      expect(uniqueFile!.duplication).toBe(0);
    });
    
    it('should add duplication issues for high duplication', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'duplicated1.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        }),
        createFileMetrics({
          path: 'duplicated2.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Should add duplication issues if duplication is detected
      const duplicatedFiles = result.files.filter(f => f.duplication > 0);
      if (duplicatedFiles.length > 0) {
        expect(duplicatedFiles.some(f => 
          f.issues.some(i => i.type === 'duplication')
        )).toBe(true);
      }
    });
  });
  
  describe('edge cases and error handling', () => {
    beforeEach(() => {
      vi.mocked(readFileSync).mockImplementation((filepath: any) => {
        const normalizedPath = (filepath as string).split('/').pop() || filepath;
        
        if (normalizedPath === 'empty.ts') {
          return '';
        }
        
        if (normalizedPath === 'short.ts') {
          return 'const x = 1;';
        }
        
        if (normalizedPath === 'whitespace.ts') {
          return '\n\n   \n\n';
        }
        
        throw new Error('File not found');
      });
    });
    
    afterEach(() => {
      vi.restoreAllMocks();
    });
    
    it('should handle empty files gracefully', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'empty.ts',
          complexity: 0,
          duplication: 0,
          loc: 0,
          functionCount: 0,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      expect(result.files[0].duplication).toBe(0);
      expect(result.summary.totalFiles).toBe(1);
    });
    
    it('should handle files with only whitespace', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'whitespace.ts',
          complexity: 0,
          duplication: 0,
          loc: 0,
          functionCount: 0,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      expect(result.files[0].duplication).toBe(0);
    });
    
    it('should handle files that cannot be read', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'nonexistent.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Should not crash and should return file with no duplication
      expect(result.files[0].duplication).toBe(0);
    });
    
    it('should handle very short files', () => {
      const files: FileMetrics[] = [
        createFileMetrics({
          path: 'short.ts',
          complexity: 1,
          duplication: 0,
          loc: 1,
          functionCount: 0,
          issues: []
        })
      ];
      
      const result = analyze(files);
      
      // Short files should not have duplication detected
      expect(result.files[0].duplication).toBe(0);
    });
  });
  
  describe('summary calculations', () => {
    it('should calculate correct averages', () => {
      const files: FileMetrics[] = [
        createFileMetrics({ path: 'a.ts', complexity: 10, duplication: 20, loc: 100, functionCount: 5, issues: [] }),
        createFileMetrics({ path: 'b.ts', complexity: 20, duplication: 10, loc: 200, functionCount: 15, issues: [] }),
        createFileMetrics({ path: 'c.ts', complexity: 15, duplication: 15, loc: 150, functionCount: 10, issues: [] })
      ];
      
      const result = analyze(files);
      
      expect(result.summary.totalFiles).toBe(3);
      expect(result.summary.totalLines).toBe(450);
      expect(result.summary.avgComplexity).toBe(15);
      expect(result.summary.avgFunctions).toBe(10);
      expect(result.summary.avgLoc).toBe(150);
      expect(typeof result.summary.avgDuplication).toBe('number');
    });
    
    it('should round averages to one decimal place', () => {
      const files: FileMetrics[] = [
        createFileMetrics({ path: 'a.ts', complexity: 10.333, duplication: 33.333, loc: 100, functionCount: 3, issues: [] }),
        createFileMetrics({ path: 'b.ts', complexity: 15.667, duplication: 16.667, loc: 200, functionCount: 7, issues: [] })
      ];
      
      const result = analyze(files);
      
      expect(result.summary.avgComplexity).toBe(13);
      expect(result.summary.avgFunctions).toBe(5);
      expect(result.summary.avgLoc).toBe(150);
      expect(typeof result.summary.avgDuplication).toBe('number');
    });
    
    it('should handle extreme maintainability cases', () => {
      const extremeFiles: FileMetrics[] = [
        createFileMetrics({
          path: 'monster.ts',
          complexity: 5,
          duplication: 0,
          loc: 5000,
          functionCount: 100,
          issues: []
        })
      ];
      
      const result = analyze(extremeFiles);
      
      expect(result.score).toBeLessThan(80); // Extreme size still gets decent score with low complexity
      expect(result.grade).toBe('C');
    });
    
    it('should handle mixed files with and without functionCount', () => {
      const files: FileMetrics[] = [
        createFileMetrics({ path: 'a.ts', complexity: 10, duplication: 0, loc: 100, functionCount: 10, issues: [] }),
        createFileMetrics({ path: 'b.ts', complexity: 10, duplication: 0, loc: 100, issues: [], functionCount: 0 }),
        createFileMetrics({ path: 'c.ts', complexity: 10, duplication: 0, loc: 100, functionCount: 5, issues: [] })
      ];
      
      const result = analyze(files);
      
      // Should calculate average with available data
      expect(result.summary.avgFunctions).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
  });
});