// Test pour la fonctionnalité des modes de duplication

import { describe, it, expect } from 'vitest';
import { 
  createDuplicationConfig, 
  createDuplicationScoringThresholds,
  createDuplicationLabelThresholds,
  createDuplicationPenaltyConstants
} from '../src/thresholds.constants';
import { calculateDuplicationScore, getDuplicationPenalty } from '../src/scoring';
import { DuplicationMode } from '../src/types';

describe('Duplication Modes', () => {
  describe('Configuration Factory', () => {
    it('should create legacy configuration by default', () => {
      const config = createDuplicationConfig(false);
      
      expect(config.mode).toBe(DuplicationMode.Legacy);
      expect(config.thresholds.excellent).toBe(15);
      expect(config.thresholds.high).toBe(30);
      expect(config.thresholds.critical).toBe(50);
    });

    it('should create strict configuration when requested', () => {
      const config = createDuplicationConfig(true);
      
      expect(config.mode).toBe(DuplicationMode.Strict);
      expect(config.thresholds.excellent).toBe(3);
      expect(config.thresholds.high).toBe(8);
      expect(config.thresholds.critical).toBe(15);
    });
  });

  describe('Scoring Thresholds', () => {
    it('should create dynamic scoring thresholds based on configuration', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const legacyThresholds = createDuplicationScoringThresholds(legacyConfig);
      const strictThresholds = createDuplicationScoringThresholds(strictConfig);
      
      expect(legacyThresholds.EXCELLENT).toBe(15);
      expect(strictThresholds.EXCELLENT).toBe(3);
    });
  });

  describe('Duplication Score Calculation', () => {
    it('should return perfect score for duplication below excellent threshold', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      // 2% duplication should be excellent in both modes
      const lowDuplication = 0.02;
      expect(calculateDuplicationScore(lowDuplication, legacyConfig)).toBe(100);
      expect(calculateDuplicationScore(lowDuplication, strictConfig)).toBe(100);
    });

    it('should show significant differences for 10% duplication', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const moderateDuplication = 0.10; // 10%
      const legacyScore = calculateDuplicationScore(moderateDuplication, legacyConfig);
      const strictScore = calculateDuplicationScore(moderateDuplication, strictConfig);
      
      // Legacy should still give 100 (≤15% threshold)
      expect(legacyScore).toBe(100);
      
      // Strict should penalize significantly (>3% threshold)
      expect(strictScore).toBeLessThan(100);
      expect(strictScore).toBeGreaterThan(80); // But not too harsh
      
      // Difference should be meaningful
      expect(legacyScore - strictScore).toBeGreaterThan(0);
    });

    it('should show dramatic differences for 30% duplication', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const highDuplication = 0.30; // 30%
      const legacyScore = calculateDuplicationScore(highDuplication, legacyConfig);
      const strictScore = calculateDuplicationScore(highDuplication, strictConfig);
      
      // Both should penalize, but legacy should be more tolerant
      expect(legacyScore).toBeGreaterThan(strictScore);
      expect(strictScore).toBeLessThan(80); // Strict should be harsh
      expect(legacyScore).toBeGreaterThan(80); // Legacy should be more tolerant
      
      // Difference should be substantial
      expect(legacyScore - strictScore).toBeGreaterThan(10);
    });
  });

  describe('Duplication Penalty Calculation', () => {
    it('should return zero penalty for excellent duplication in both modes', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      // 2% should have no penalty in both modes
      const lowDuplication = 0.02;
      expect(getDuplicationPenalty(lowDuplication, legacyConfig)).toBe(0);
      expect(getDuplicationPenalty(lowDuplication, strictConfig)).toBe(0);
    });

    it('should show different penalties for moderate duplication', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const moderateDuplication = 0.10; // 10%
      const legacyPenalty = getDuplicationPenalty(moderateDuplication, legacyConfig);
      const strictPenalty = getDuplicationPenalty(moderateDuplication, strictConfig);
      
      // Legacy should have no penalty (≤15%)
      expect(legacyPenalty).toBe(0);
      
      // Strict should have penalty (>3%)
      expect(strictPenalty).toBeGreaterThan(0);
    });
  });

  describe('Label Thresholds', () => {
    it('should create appropriate label thresholds based on mode', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const legacyLabels = createDuplicationLabelThresholds(legacyConfig);
      const strictLabels = createDuplicationLabelThresholds(strictConfig);
      
      expect(legacyLabels.LOW).toBe(15);
      expect(strictLabels.LOW).toBe(3);
      
      expect(legacyLabels.MEDIUM).toBe(30);
      expect(strictLabels.MEDIUM).toBe(8);
      
      expect(legacyLabels.HIGH).toBe(50);
      expect(strictLabels.HIGH).toBe(15);
    });
  });

  describe('Penalty Constants', () => {
    it('should create penalty constants with correct thresholds', () => {
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const legacyConstants = createDuplicationPenaltyConstants(legacyConfig);
      const strictConstants = createDuplicationPenaltyConstants(strictConfig);
      
      expect(legacyConstants.EXCELLENT_THRESHOLD).toBe(15);
      expect(strictConstants.EXCELLENT_THRESHOLD).toBe(3);
      
      expect(legacyConstants.HIGH_THRESHOLD).toBe(30);
      expect(strictConstants.HIGH_THRESHOLD).toBe(8);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle the documented 30% duplication case correctly', () => {
      // This test validates the numbers shown in our documentation
      const legacyConfig = createDuplicationConfig(false);
      const strictConfig = createDuplicationConfig(true);
      
      const duplication30Percent = 0.30;
      
      const legacyScore = calculateDuplicationScore(duplication30Percent, legacyConfig);
      const strictScore = calculateDuplicationScore(duplication30Percent, strictConfig);
      
      // These should match our documented examples
      expect(legacyScore).toBe(88); // As documented in audit
      expect(strictScore).toBe(74); // Should be around 75 as documented
      
      // Verify the meaningful difference
      expect(legacyScore - strictScore).toBeGreaterThanOrEqual(10);
    });

    it('should provide backward compatibility with default behavior', () => {
      // When no configuration is provided, should default to legacy
      const duplication = 0.10;
      
      const scoreWithoutConfig = calculateDuplicationScore(duplication);
      const scoreWithLegacyConfig = calculateDuplicationScore(duplication, createDuplicationConfig(false));
      
      expect(scoreWithoutConfig).toBe(scoreWithLegacyConfig);
    });
  });
});
