import { describe, it, expect } from 'vitest';
import { 
  calculateComplexityScore, 
  calculateDuplicationScore, 
  calculateMaintainabilityScore,
  calculateWeightedScore,
  calculateHealthScore
} from '../src/scoring';
import { getGrade } from '../src/scoring.utils';
import { FileIssue, FileIssueType, Severity } from '../src/types';

describe('Scoring Algorithms', () => {
  describe('calculateComplexityScore', () => {
    it('should return 100 for low complexity', () => {
      expect(calculateComplexityScore(1)).toBe(100);
      expect(calculateComplexityScore(10)).toBe(100);
    });

    it('should return decreasing scores for higher complexity', () => {
      const score15 = calculateComplexityScore(15);
      const score20 = calculateComplexityScore(20);
      const score30 = calculateComplexityScore(30);
      const score50 = calculateComplexityScore(50);
      
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
      const score = calculateComplexityScore(100);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(20);
    });

    it('should be monotonically decreasing', () => {
      // Test that complexity score decreases as complexity increases
      const complexities = [1, 5, 10, 15, 20, 25, 30, 40, 50, 100];
      for (let i = 1; i < complexities.length; i++) {
        const prevScore = calculateComplexityScore(complexities[i - 1]);
        const currScore = calculateComplexityScore(complexities[i]);
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

  describe('calculateMaintainabilityScore', () => {
    it('should return 100 for small files with few functions', () => {
      expect(calculateMaintainabilityScore(100, 5)).toBe(100);
      expect(calculateMaintainabilityScore(200, 10)).toBe(100);
    });

    it('should penalize large files', () => {
      const small = calculateMaintainabilityScore(100, 5);
      const medium = calculateMaintainabilityScore(300, 5);
      const large = calculateMaintainabilityScore(400, 5);
      const veryLarge = calculateMaintainabilityScore(500, 5);
      
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
      const fewFunctions = calculateMaintainabilityScore(100, 5);
      const mediumFunctions = calculateMaintainabilityScore(100, 15);
      const manyFunctions = calculateMaintainabilityScore(100, 20);
      const veryManyFunctions = calculateMaintainabilityScore(100, 30);
      
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
      const score = calculateMaintainabilityScore(10000, 1000);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThan(40);
    });

    it('should be affected by both LOC and function count', () => {
      const baseline = calculateMaintainabilityScore(100, 5);
      const bigFile = calculateMaintainabilityScore(500, 5);
      const manyFunctions = calculateMaintainabilityScore(100, 25);
      const both = calculateMaintainabilityScore(500, 25);
      
      expect(bigFile).toBeLessThan(baseline);
      expect(manyFunctions).toBeLessThan(baseline);
      expect(both).toBeLessThan(bigFile);
      expect(both).toBeLessThan(manyFunctions);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should apply correct weights (45/30/25)', () => {
      const score = calculateWeightedScore(100, 75, 50);
      const expected = (100 * 0.45) + (50 * 0.30) + (75 * 0.25);
      expect(score).toBe(expected);
    });

    it('should handle edge cases', () => {
      expect(calculateWeightedScore(0, 0, 0)).toBe(0);
      expect(calculateWeightedScore(100, 100, 100)).toBe(100);
    });

    it('should produce scores between 0 and 100', () => {
      for (let i = 0; i < 100; i++) {
        const c = Math.random() * 100;
        const d = Math.random() * 100;
        const m = Math.random() * 100;
        const score = calculateWeightedScore(c, d, m);
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

  describe('calculateHealthScore', () => {
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
      const score = calculateHealthScore(file);
      expect(score).toBe(100);
    });

    it('should penalize files with issues', () => {
      const noIssues = calculateHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: []
      });
      const withCritical = calculateHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.Critical)]
      });
      const withHigh = calculateHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.High)]
      });
      const withMedium = calculateHealthScore({
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
      const singleIssue = calculateHealthScore({
        metrics: { complexity: 10, loc: 50, duplicationRatio: 0.05 },
        issues: [createMockIssue(Severity.High)]
      });
      const multipleIssues = calculateHealthScore({
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
      const baseline = calculateHealthScore({
        metrics: { complexity: 10, loc: 100, duplicationRatio: 0.05 },
        issues: []
      });
      const highComplexity = calculateHealthScore({
        metrics: { complexity: 50, loc: 100, duplicationRatio: 0.05 },
        issues: []
      });
      const largeFile = calculateHealthScore({
        metrics: { complexity: 10, loc: 1000, duplicationRatio: 0.05 },
        issues: []
      });
      const highDuplication = calculateHealthScore({
        metrics: { complexity: 10, loc: 100, duplicationRatio: 0.5 },
        issues: []
      });
      
      expect(highComplexity).toBeLessThan(baseline);
      expect(largeFile).toBeLessThan(baseline);
      expect(highDuplication).toBeLessThan(baseline);
    });
  });
});