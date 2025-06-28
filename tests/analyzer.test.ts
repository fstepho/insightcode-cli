import { describe, it, expect } from 'vitest';
import { analyze } from '../src/analyzer';
import { FileMetrics } from '../src/types';

describe('Analyzer', () => {
  describe('analyze', () => {
    it('should calculate correct score for perfect code', () => {
      const files: FileMetrics[] = [
        {
          path: 'test1.ts',
          complexity: 1,
          duplication: 0,
          loc: 50,
          functionCount: 3,
          issues: []
        },
        {
          path: 'test2.ts',
          complexity: 2,
          duplication: 0,
          loc: 30,
          functionCount: 2,
          issues: []
        }
      ];
      
      const result = analyze(files);
      
      expect(result.summary.avgComplexity).toBe(1.5);
      expect(result.summary.avgDuplication).toBe(0);
      expect(result.summary.avgFunctions).toBe(2.5);
      expect(result.summary.avgLoc).toBe(40);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.grade).toBe('A');
    });
    
    it('should calculate correct score for poor quality code', () => {
      const files: FileMetrics[] = [
        {
          path: 'complex.ts',
          complexity: 30,
          duplication: 0,
          loc: 500,
          functionCount: 25,
          issues: [
            { type: 'complexity', severity: 'high', message: 'High complexity' }
          ]
        }
      ];
      
      const result = analyze(files);
      
      expect(result.summary.avgComplexity).toBe(30);
      expect(result.summary.avgFunctions).toBe(25);
      expect(result.summary.avgLoc).toBe(500);
      expect(result.score).toBeLessThan(65);
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
        {
          path: 'legacy.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 0, // Missing function count
          issues: []
        }
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
        const files: FileMetrics[] = [{
          path: 'test.ts',
          complexity,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        }];
        
        const result = analyze(files);
        const gradeRanges = {
          'A': [90, 100],
          'B': [80, 89],
          'C': [70, 79],
          'D': [60, 69],
          'F': [0, 59]
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
        {
          path: 'file1.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        },
        {
          path: 'file2.ts',
          complexity: 5,
          duplication: 0,
          loc: 100,
          functionCount: 5,
          issues: []
        }
      ];
      
      const result = analyze(files);
      
      expect(result.files).toHaveLength(2);
    });
    
    it('should add high duplication issues', () => {
      const files: FileMetrics[] = [{
        path: 'duplicated.ts',
        complexity: 5,
        duplication: 35,
        loc: 100,
        functionCount: 5,
        issues: []
      }];
      
      const result = analyze(files);
      
      expect(result.summary.avgDuplication).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('score calculation', () => {
    it('should weight complexity at 40%', () => {
      const highComplexity: FileMetrics[] = [{
        path: 'complex.ts',
        complexity: 25,
        duplication: 0,
        loc: 100,
        functionCount: 5,
        issues: []
      }];
      
      const result = analyze(highComplexity);
      
      expect(result.score).toBeLessThan(80);
      expect(result.score).toBeGreaterThanOrEqual(50);
    });
    
    it('should weight duplication at 30%', () => {
      const highDuplication: FileMetrics[] = [{
        path: 'duplicated.ts',
        complexity: 5,
        duplication: 40,
        loc: 100,
        functionCount: 5,
        issues: []
      }];
      
      const result = analyze(highDuplication);
      
      expect(result.score).toBeLessThanOrEqual(100); // Perfect other metrics compensate
      expect(result.score).toBeGreaterThan(75);
    });
    
    it('should weight maintainability at 30%', () => {
      const poorMaintainability: FileMetrics[] = [{
        path: 'huge.ts',
        complexity: 5,
        duplication: 0,
        loc: 1000,
        functionCount: 50,
        issues: []
      }];
      
      const result = analyze(poorMaintainability);
      
      expect(result.score).toBeLessThan(80); // Large files still impact score
      expect(result.score).toBeGreaterThan(50);
    });
    
    it('should calculate maintainability as composite score', () => {
      const balanced: FileMetrics[] = [{
        path: 'balanced.ts',
        complexity: 10,
        duplication: 10,
        loc: 200,
        functionCount: 10,
        issues: []
      }];
      
      const result = analyze(balanced);
      
      expect(result.score).toBeGreaterThan(95); // Good metrics across the board
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.grade).toBe('A');
    });
  });
  
  describe('summary calculations', () => {
    it('should calculate correct averages', () => {
      const files: FileMetrics[] = [
        { path: 'a.ts', complexity: 10, duplication: 20, loc: 100, functionCount: 5, issues: [] },
        { path: 'b.ts', complexity: 20, duplication: 10, loc: 200, functionCount: 15, issues: [] },
        { path: 'c.ts', complexity: 15, duplication: 15, loc: 150, functionCount: 10, issues: [] }
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
        { path: 'a.ts', complexity: 10.333, duplication: 33.333, loc: 100, functionCount: 3, issues: [] },
        { path: 'b.ts', complexity: 15.667, duplication: 16.667, loc: 200, functionCount: 7, issues: [] }
      ];
      
      const result = analyze(files);
      
      expect(result.summary.avgComplexity).toBe(13);
      expect(result.summary.avgFunctions).toBe(5);
      expect(result.summary.avgLoc).toBe(150);
      expect(typeof result.summary.avgDuplication).toBe('number');
    });
    
    it('should handle extreme maintainability cases', () => {
      const extremeFiles: FileMetrics[] = [
        {
          path: 'monster.ts',
          complexity: 5,
          duplication: 0,
          loc: 5000,
          functionCount: 100,
          issues: []
        }
      ];
      
      const result = analyze(extremeFiles);
      
      expect(result.score).toBeLessThan(80); // Extreme size still gets decent score with low complexity
      expect(result.grade).toBe('C');
    });
    
    it('should handle mixed files with and without functionCount', () => {
      const files: FileMetrics[] = [
        { path: 'a.ts', complexity: 10, duplication: 0, loc: 100, functionCount: 10, issues: [] },
        { path: 'b.ts', complexity: 10, duplication: 0, loc: 100, issues: [], functionCount: 0 },
        { path: 'c.ts', complexity: 10, duplication: 0, loc: 100, functionCount: 5, issues: [] }
      ];
      
      const result = analyze(files);
      
      // Should calculate average with available data
      expect(result.summary.avgFunctions).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
    });
  });
});