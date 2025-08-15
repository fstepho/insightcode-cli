import { describe, it, expect } from 'vitest';
import { 
  calculateFileComplexityScore, 
  calculateDuplicationScore, 
  calculateFileMaintainabilityScore,
  calculateProjectWeightedScore,
  calculateFileHealthScore
} from '../src/scoring';
import { getGrade } from '../src/scoring.utils';
import { FileIssue, FileIssueType, Severity } from '../src/types';

describe('Scoring Algorithms', () => {
  describe('calculateFileComplexityScore', () => {
    it('should return 100 for low complexity', () => {
      expect(calculateFileComplexityScore(1)).toBe(100);
      expect(calculateFileComplexityScore(10)).toBe(100);
    });

    it('should return decreasing scores for higher complexity', () => {
      const score15 = calculateFileComplexityScore(15);
      const score20 = calculateFileComplexityScore(20);
      const score30 = calculateFileComplexityScore(30);
      const score50 = calculateFileComplexityScore(50);
      
      // Scores should decrease as complexity increases
      expect(score15).toBeGreaterThan(score20);
      expect(score20).toBeGreaterThan(score30);
      expect(score30).toBeGreaterThan(score50);
      
      // All scores should be within valid range
      expect(score15).toBeGreaterThan(0);
      expect(score15).toBeLessThanOrEqual(100);
      expect(score50).toBeGreaterThan(0);
      expect(score50).toBeLessThanOrEqual(100);
    });

    it('should handle extreme complexity values', () => {
      const score = calculateFileComplexityScore(100);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(20);
    });

    it('should be monotonically decreasing', () => {
      // Test that complexity score decreases as complexity increases
      const complexities = [1, 5, 10, 15, 20, 25, 30, 40, 50, 100];
      for (let i = 1; i < complexities.length; i++) {
        const prevScore = calculateFileComplexityScore(complexities[i - 1]);
        const currScore = calculateFileComplexityScore(complexities[i]);
        expect(currScore).toBeLessThanOrEqual(prevScore);
      }
    });
  });

  describe('calculateDuplicationScore', () => {
    it('should return 100 for no duplication', () => {
      expect(calculateDuplicationScore(0)).toBe(100);
      expect(calculateDuplicationScore(0.03)).toBe(100); // 3% as ratio
    });

    it('should return decreasing scores for higher duplication', () => {
      const score8 = calculateDuplicationScore(0.08);  // 8% as ratio
      const score20 = calculateDuplicationScore(0.20); // 20% as ratio
      const score30 = calculateDuplicationScore(0.30); // 30% as ratio
      const score50 = calculateDuplicationScore(0.50); // 50% as ratio
      
      // Scores should decrease as duplication increases
      expect(score8).toBeGreaterThan(score20);
      expect(score20).toBeGreaterThan(score30);
      expect(score30).toBeGreaterThan(score50);
      
      // All scores should be within valid range
      expect(score8).toBeGreaterThan(0);
      expect(score8).toBeLessThanOrEqual(100);
      expect(score50).toBeGreaterThan(0);
      expect(score50).toBeLessThanOrEqual(100);
    });

    it('should handle extreme duplication values', () => {
      const score = calculateDuplicationScore(1.0); // 100% as ratio
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(30);
    });

    it('should be monotonically decreasing', () => {
      // Test that duplication score decreases as duplication increases
      const duplications = [0, 0.03, 0.08, 0.15, 0.30, 0.50, 0.75, 1.0]; // As ratios
      for (let i = 1; i < duplications.length; i++) {
        const prevScore = calculateDuplicationScore(duplications[i - 1]);
        const currScore = calculateDuplicationScore(duplications[i]);
        expect(currScore).toBeLessThanOrEqual(prevScore);
      }
    });
  });

  describe('calculateFileMaintainabilityScore', () => {
    it('should return 100 for small files with few functions', () => {
      expect(calculateFileMaintainabilityScore(100, 5)).toBe(100);
      expect(calculateFileMaintainabilityScore(200, 10)).toBe(100);
    });

    it('should penalize large files', () => {
      const small = calculateFileMaintainabilityScore(100, 5);
      const medium = calculateFileMaintainabilityScore(300, 5);
      const large = calculateFileMaintainabilityScore(400, 5);
      const veryLarge = calculateFileMaintainabilityScore(500, 5);
      
      // Larger files should have lower maintainability scores
      expect(small).toBeGreaterThan(medium);
      expect(medium).toBeGreaterThan(large);
      expect(large).toBeGreaterThan(veryLarge);
      
      // All scores should be within valid range
      [small, medium, large, veryLarge].forEach(score => {
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should penalize high function count', () => {
      const fewFunctions = calculateFileMaintainabilityScore(100, 5);
      const mediumFunctions = calculateFileMaintainabilityScore(100, 15);
      const manyFunctions = calculateFileMaintainabilityScore(100, 20);
      const veryManyFunctions = calculateFileMaintainabilityScore(100, 30);
      
      // More functions should result in lower maintainability scores
      expect(fewFunctions).toBeGreaterThan(mediumFunctions);
      expect(mediumFunctions).toBeGreaterThan(manyFunctions);
      expect(manyFunctions).toBeGreaterThan(veryManyFunctions);
      
      // All scores should be within valid range
      [fewFunctions, mediumFunctions, manyFunctions, veryManyFunctions].forEach(score => {
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should handle extreme values', () => {
      const score = calculateFileMaintainabilityScore(10000, 1000);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(55); // Ajusté pour la nouvelle formule sophistiquée
    });

    it('should be affected by both LOC and function count', () => {
      const baseline = calculateFileMaintainabilityScore(100, 5);
      const bigFile = calculateFileMaintainabilityScore(500, 5);
      const manyFunctions = calculateFileMaintainabilityScore(100, 25);
      const both = calculateFileMaintainabilityScore(500, 25);
      
      expect(bigFile).toBeLessThan(baseline);
      expect(manyFunctions).toBeLessThan(baseline);
      expect(both).toBeLessThan(bigFile);
      expect(both).toBeLessThan(manyFunctions);
    });
  });

  describe('calculateProjectWeightedScore', () => {
    it('should apply correct weights (35/25/20/20)', () => {
      const score = calculateProjectWeightedScore(100, 75, 50, 80);
      const expected = (100 * 0.35) + (50 * 0.25) + (75 * 0.20) + (80 * 0.20);
      expect(score).toBe(expected);
    });

    it('should handle edge cases', () => {
      expect(calculateProjectWeightedScore(0, 0, 0, 0)).toBe(0);
      expect(calculateProjectWeightedScore(100, 100, 100, 100)).toBe(100);
    });

    it('should produce scores between 0 and 100', () => {
      for (let i = 0; i < 100; i++) {
        const c = Math.random() * 100;
        const d = Math.random() * 100;
        const m = Math.random() * 100;
        const r = Math.random() * 100;
        const score = calculateProjectWeightedScore(c, d, m, r);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getGrade', () => {
    it('should return correct grades for score ranges', () => {
      expect(getGrade(95)).toBe('A');
      expect(getGrade(90)).toBe('A');
      expect(getGrade(85)).toBe('B');
      expect(getGrade(80)).toBe('B');
      expect(getGrade(75)).toBe('C');
      expect(getGrade(70)).toBe('C');
      expect(getGrade(65)).toBe('D');
      expect(getGrade(60)).toBe('D');
      expect(getGrade(55)).toBe('F');
      expect(getGrade(0)).toBe('F');
    });

    it('should handle edge cases', () => {
      expect(getGrade(89.9)).toBe('B');
      expect(getGrade(90.1)).toBe('A');
      expect(getGrade(100)).toBe('A');
      expect(getGrade(-10)).toBe('F');
    });
  });

  describe('calculateFileHealthScore', () => {
    const createMockIssue = (severity: Severity): FileIssue => ({
      type: 'complexity' as FileIssueType,
      severity,
      location: { file: 'test.ts', line: 1 },
      description: 'Test issue',
      threshold: 10,
      excessRatio: 1.5
    });

    it('should return 100 for perfect files', () => {
      const file = {
        metrics: { complexity: 1, loc: 10, duplicationRatio: 0 },
        issues: []
      };
      const score = calculateFileHealthScore(file);
      expect(score).toBe(100);
    });

    it('should penalize files with issues', () => {
      const noIssues = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: []
      });
      const withCritical = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.Critical)]
      });
      const withHigh = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.High)]
      });
      const withMedium = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.Medium)]
      });
      
      expect(withCritical).toBeLessThan(noIssues);
      expect(withHigh).toBeLessThan(noIssues);
      expect(withMedium).toBeLessThan(noIssues);
      expect(withCritical).toBeLessThan(withHigh);
      expect(withHigh).toBeLessThan(withMedium);
    });

    it('should handle multiple issues', () => {
      const singleIssue = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.High)]
      });
      const multipleIssues = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [
          createMockIssue(Severity.High),
          createMockIssue(Severity.Medium),
          createMockIssue(Severity.Low)
        ]
      });
      
      expect(multipleIssues).toBeLessThan(singleIssue);
    });

    it('should consider complexity, size, and duplication', () => {
      const baseline = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 100, duplicationRatio: 0.05 },
        issues: []
      });
      const highComplexity = calculateFileHealthScore({
        metrics: { complexity: 50, loc: 100, duplicationRatio: 0.05 },
        issues: []
      });
      const largeFile = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 1000, duplicationRatio: 0.05 },
        issues: []
      });
      const highDuplication = calculateFileHealthScore({
        metrics: { complexity: 10, loc: 100, duplicationRatio: 0.5 },
        issues: []
      });
      
      expect(highComplexity).toBeLessThan(baseline);
      expect(largeFile).toBeLessThan(baseline);
      expect(highDuplication).toBeLessThan(baseline);
    });
  });
});