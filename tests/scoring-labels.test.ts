import { describe, it, expect } from 'vitest';
import { 
  getComplexityConfig, 
  getDuplicationInfo,
  getScoreStatus,
  COMPLEXITY_CONFIG,
  DUPLICATION_CONFIG_LEGACY,
  DUPLICATION_CONFIG_STRICT,
} from '../src/scoring.utils';

describe('Scoring Configuration and Labels', () => {
  describe('getComplexityConfig', () => {
    it('should return correct configuration for complexity ranges', () => {
      expect(getComplexityConfig(1).label).toBe('Low');
      expect(getComplexityConfig(10).label).toBe('Low');
      expect(getComplexityConfig(11).label).toBe('Medium');
      expect(getComplexityConfig(15).label).toBe('Medium');
      expect(getComplexityConfig(16).label).toBe('High');
      expect(getComplexityConfig(20).label).toBe('High');
      expect(getComplexityConfig(21).label).toBe('Very High');
      expect(getComplexityConfig(50).label).toBe('Very High');
      expect(getComplexityConfig(51).label).toBe('Extreme');
      expect(getComplexityConfig(100).label).toBe('Extreme');
    });

    it('should return correct colors for complexity ranges', () => {
      expect(getComplexityConfig(5).color).toBe('green');
      expect(getComplexityConfig(12).color).toBe('yellow');
      expect(getComplexityConfig(18).color).toBe('red');
      expect(getComplexityConfig(30).color).toBe('redBold');
      expect(getComplexityConfig(100).color).toBe('redBold');
    });

    it('should handle edge cases', () => {
      expect(getComplexityConfig(0).label).toBe('Low');
      expect(getComplexityConfig(-1).label).toBe('Low');
      expect(getComplexityConfig(10.5).label).toBe('Medium');
    });
  });

  describe('getDuplicationInfo (legacy mode)', () => {
    it('should return correct labels for duplication ranges', () => {
      expect(getDuplicationInfo(0, 'legacy').label).toBe('Excellent');
      expect(getDuplicationInfo(15, 'legacy').label).toBe('Excellent');
      expect(getDuplicationInfo(16, 'legacy').label).toBe('Good');
      expect(getDuplicationInfo(25, 'legacy').label).toBe('Good');
      expect(getDuplicationInfo(26, 'legacy').label).toBe('Needs Improvement');
      expect(getDuplicationInfo(35, 'legacy').label).toBe('Needs Improvement');
      expect(getDuplicationInfo(36, 'legacy').label).toBe('Major');
      expect(getDuplicationInfo(50, 'legacy').label).toBe('Major');
      expect(getDuplicationInfo(51, 'legacy').label).toBe('Critical');
    });
    it('should handle edge cases', () => {
      expect(getDuplicationInfo(-1, 'legacy').label).toBe('Excellent');
      expect(getDuplicationInfo(3.5, 'legacy').label).toBe('Excellent');
    });
  });

  describe('getDuplicationInfo (strict mode)', () => {
    it('should return correct labels for strict duplication ranges', () => {
      expect(getDuplicationInfo(0, 'strict').label).toBe('Excellent');
      expect(getDuplicationInfo(3, 'strict').label).toBe('Excellent');
      expect(getDuplicationInfo(4, 'strict').label).toBe('Good');
      expect(getDuplicationInfo(5, 'strict').label).toBe('Good');
      expect(getDuplicationInfo(6, 'strict').label).toBe('Needs Improvement');
      expect(getDuplicationInfo(10, 'strict').label).toBe('Needs Improvement');
      expect(getDuplicationInfo(15, 'strict').label).toBe('Major');
      expect(getDuplicationInfo(20, 'strict').label).toBe('Major');
      expect(getDuplicationInfo(25, 'strict').label).toBe('Critical');
    });

    it('should be more demanding than legacy mode', () => {
      // 10% duplication should be worse in strict mode
      expect(getDuplicationInfo(10, 'strict').label).toBe('Needs Improvement');
      expect(getDuplicationInfo(10, 'legacy').label).toBe('Excellent');
    });
  });


  describe('getScoreStatus', () => {
    it('should return formatted status with emoji and label', () => {
      const status100 = getScoreStatus(100);
      expect(status100).toMatch(/🟢.*Exceptional/);
      
      const status85 = getScoreStatus(85);
      expect(status85).toMatch(/🟢.*Good/);
      
      const status75 = getScoreStatus(75);
      expect(status75).toMatch(/🟡.*Acceptable/);
      
      const status65 = getScoreStatus(65);
      expect(status65).toMatch(/🟠.*Poor/);
      
      const status50 = getScoreStatus(50);
      expect(status50).toMatch(/🔴.*Critical/);
    });
  });

  describe('consistency between configurations', () => {
    it('should have consistent complexity configuration structure', () => {
      COMPLEXITY_CONFIG.forEach(config => {
        expect(config).toHaveProperty('maxThreshold');
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('color');
        expect(config).toHaveProperty('severity');
      });
    });

    it('should have consistent duplication configuration structure', () => {
      DUPLICATION_CONFIG_LEGACY.forEach(config => {
        expect(config).toHaveProperty('maxThreshold');
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('category');
      });

      DUPLICATION_CONFIG_STRICT.forEach(config => {
        expect(config).toHaveProperty('maxThreshold');
        expect(config).toHaveProperty('label');
        expect(config).toHaveProperty('category');
      });
    });

    it('should have strict duplication thresholds lower than legacy', () => {
      // Strict mode should be more demanding (lower thresholds)
      expect(DUPLICATION_CONFIG_STRICT[0].maxThreshold).toBeLessThan(DUPLICATION_CONFIG_LEGACY[0].maxThreshold);
      expect(DUPLICATION_CONFIG_STRICT[1].maxThreshold).toBeLessThan(DUPLICATION_CONFIG_LEGACY[1].maxThreshold);
      expect(DUPLICATION_CONFIG_STRICT[2].maxThreshold).toBeLessThan(DUPLICATION_CONFIG_LEGACY[2].maxThreshold);
      expect(DUPLICATION_CONFIG_STRICT[3].maxThreshold).toBeLessThan(DUPLICATION_CONFIG_LEGACY[3].maxThreshold);
    });
  });
});