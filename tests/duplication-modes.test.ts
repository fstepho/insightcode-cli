// Test pour la fonctionnalité des modes de duplication

import { describe, it, expect } from 'vitest';
import { 
  getDuplicationThresholds,
  DUPLICATION_CONFIG_LEGACY,
  DUPLICATION_CONFIG_STRICT
} from '../src/scoring.utils';
import { calculateDuplicationScore, getDuplicationPenalty } from '../src/scoring';

describe('Duplication Modes', () => {
  describe('Configuration Factory', () => {
    it('should create legacy configuration by default', () => {
      const config = getDuplicationThresholds('legacy');
      
      expect(config).toBe(DUPLICATION_CONFIG_LEGACY);
      expect(config[0].maxThreshold).toBe(15); // excellent
      expect(config[3].maxThreshold).toBe(50); // major
      expect(config[3].maxThreshold).toBe(50); // critical
    });

    it('should create strict configuration when requested', () => {
      const config = getDuplicationThresholds('strict');
      
      expect(config).toBe(DUPLICATION_CONFIG_STRICT);
      expect(config[0].maxThreshold).toBe(3); // excellent
      expect(config[1].maxThreshold).toBe(5); // good
      expect(config[3].maxThreshold).toBe(20); // major
    });
  });

  describe('Scoring Thresholds', () => {
    it('should have different thresholds between legacy and strict modes', () => {
      const legacyConfig = getDuplicationThresholds('legacy');
      const strictConfig = getDuplicationThresholds('strict');
      
      // Legacy should be more permissive
      expect(legacyConfig[0].maxThreshold).toBe(15); // excellent threshold
      expect(strictConfig[0].maxThreshold).toBe(3); // excellent threshold
      
      // Strict should be more demanding
      expect(strictConfig[0].maxThreshold).toBeLessThan(legacyConfig[0].maxThreshold);
    });
  });

  describe('Duplication Score Calculation', () => {
    it('should return perfect score for duplication below excellent threshold', () => {
      // 2% duplication should be excellent in both modes
      const lowDuplication = 0.02;
      expect(calculateDuplicationScore(lowDuplication, 'legacy')).toBe(100);
      expect(calculateDuplicationScore(lowDuplication, 'strict')).toBe(100);
    });

    it('should show significant differences for 10% duplication', () => {
      const moderateDuplication = 0.10; // 10%
      const legacyScore = calculateDuplicationScore(moderateDuplication, 'legacy');
      const strictScore = calculateDuplicationScore(moderateDuplication, 'strict');
      
      // Legacy should still give 100 (≤15% threshold)
      expect(legacyScore).toBe(100);
      
      // Strict should penalize significantly (>3% threshold)
      expect(strictScore).toBeLessThan(100);
      expect(strictScore).toBeGreaterThan(80); // But not too harsh
      
      // Difference should be meaningful
      expect(legacyScore - strictScore).toBeGreaterThan(0);
    });

    it('should show dramatic differences for 30% duplication', () => {
      const highDuplication = 0.30; // 30%
      const legacyScore = calculateDuplicationScore(highDuplication, 'legacy');
      const strictScore = calculateDuplicationScore(highDuplication, 'strict');
      
      // Both should penalize, but legacy should be more tolerant
      expect(legacyScore).toBeGreaterThan(strictScore);
      expect(strictScore).toBeLessThan(80); // Strict should be harsh
      expect(legacyScore).toBeGreaterThan(60); // Legacy should be more tolerant
      
      // Difference should be substantial
      expect(legacyScore - strictScore).toBeGreaterThan(10);
    });
  });

  describe('Duplication Penalty Calculation', () => {
    it('should return zero penalty for excellent duplication in both modes', () => {
      // 2% should have no penalty in both modes
      const lowDuplication = 0.02;
      expect(getDuplicationPenalty(lowDuplication, 'legacy')).toBe(0);
      expect(getDuplicationPenalty(lowDuplication, 'strict')).toBe(0);
    });

    it('should show different penalties for moderate duplication', () => {
      const moderateDuplication = 0.10; // 10%
      const legacyPenalty = getDuplicationPenalty(moderateDuplication, 'legacy');
      const strictPenalty = getDuplicationPenalty(moderateDuplication, 'strict');
      
      // Legacy should have no penalty (≤15%)
      expect(legacyPenalty).toBe(0);
      
      // Strict should have penalty (>3%)
      expect(strictPenalty).toBeGreaterThan(0);
    });
  });

  describe('Configuration Structure', () => {
    it('should have proper threshold configuration structure', () => {
      const legacyConfig = getDuplicationThresholds('legacy');
      const strictConfig = getDuplicationThresholds('strict');
      
      // Both should be arrays with threshold objects
      expect(Array.isArray(legacyConfig)).toBe(true);
      expect(Array.isArray(strictConfig)).toBe(true);
      
      // Each should have threshold objects with expected properties
      expect(legacyConfig[0]).toHaveProperty('category');
      expect(legacyConfig[0]).toHaveProperty('maxThreshold');
      expect(strictConfig[0]).toHaveProperty('category');
      expect(strictConfig[0]).toHaveProperty('maxThreshold');
    });
  });

  describe('Mode Differences', () => {
    it('should have meaningful differences between modes', () => {
      const legacyConfig = getDuplicationThresholds('legacy');
      const strictConfig = getDuplicationThresholds('strict');
      
      // Strict mode should have lower thresholds (more demanding)
      expect(strictConfig[0].maxThreshold).toBeLessThan(legacyConfig[0].maxThreshold);
      expect(strictConfig[1].maxThreshold).toBeLessThan(legacyConfig[1].maxThreshold);
      expect(strictConfig[2].maxThreshold).toBeLessThan(legacyConfig[2].maxThreshold);
      expect(strictConfig[3].maxThreshold).toBeLessThan(legacyConfig[3].maxThreshold);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle the documented 30% duplication case correctly', () => {
      // This test validates the numbers shown in our documentation
      const duplication30Percent = 0.30;
      
      const legacyScore = calculateDuplicationScore(duplication30Percent, 'legacy');
      const strictScore = calculateDuplicationScore(duplication30Percent, 'strict');
      
      // Both should penalize, but legacy should be more tolerant
      expect(legacyScore).toBeGreaterThan(strictScore);
      
      // Verify the meaningful difference
      expect(legacyScore - strictScore).toBeGreaterThan(5);
    });

    it('should provide backward compatibility with default behavior', () => {
      // When no mode is provided, should default to legacy
      const duplication = 0.10;
      
      const scoreWithoutMode = calculateDuplicationScore(duplication);
      const scoreWithLegacyMode = calculateDuplicationScore(duplication, 'legacy');
      
      expect(scoreWithoutMode).toBe(scoreWithLegacyMode);
    });
  });
});
