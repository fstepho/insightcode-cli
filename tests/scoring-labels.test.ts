import { describe, it, expect } from 'vitest';
import { 
  getComplexityLabel, 
  getDuplicationLabel,
  getComplexityColorLevel,
  getDuplicationColorLevel
} from '../src/scoring.utils';
import { 
  getMaintainabilityLabel,
  getMaintainabilityColorLevel,
  getSeverityColorLevel
} from '../src/scoring';

describe('Scoring Labels and Colors', () => {
  describe('getComplexityLabel', () => {
    it('should return correct labels for complexity ranges', () => {
      expect(getComplexityLabel(1)).toBe('Low');
      expect(getComplexityLabel(10)).toBe('Low');
      expect(getComplexityLabel(15)).toBe('Medium');
      expect(getComplexityLabel(20)).toBe('High');
      expect(getComplexityLabel(30)).toBe('Very High');
      expect(getComplexityLabel(50)).toBe('Very High');
      expect(getComplexityLabel(100)).toBe('Extreme');
      expect(getComplexityLabel(200)).toBe('Extreme');
      expect(getComplexityLabel(300)).toBe('Extreme');
    });

    it('should handle edge cases', () => {
      expect(getComplexityLabel(0)).toBe('Low');
      expect(getComplexityLabel(-1)).toBe('Low');
      expect(getComplexityLabel(10.5)).toBe('Medium');
    });
  });

  describe('getDuplicationLabel', () => {
    it('should return correct labels for duplication ranges', () => {
      expect(getDuplicationLabel(0)).toBe('Low');
      expect(getDuplicationLabel(3)).toBe('Low');
      expect(getDuplicationLabel(5)).toBe('Low');
      expect(getDuplicationLabel(8)).toBe('Low');
      expect(getDuplicationLabel(10)).toBe('Low');
      expect(getDuplicationLabel(15)).toBe('Low');
      expect(getDuplicationLabel(20)).toBe('Medium');
      expect(getDuplicationLabel(30)).toBe('Medium');
      expect(getDuplicationLabel(40)).toBe('High');
      expect(getDuplicationLabel(50)).toBe('High');
    });

    it('should handle edge cases', () => {
      expect(getDuplicationLabel(-1)).toBe('Low');
      expect(getDuplicationLabel(3.5)).toBe('Low');
    });
  });

  describe('getMaintainabilityLabel', () => {
    it('should return correct labels for maintainability ranges', () => {
      expect(getMaintainabilityLabel(100)).toBe('Good');
      expect(getMaintainabilityLabel(80)).toBe('Good');
      expect(getMaintainabilityLabel(70)).toBe('Acceptable');
      expect(getMaintainabilityLabel(60)).toBe('Acceptable');
      expect(getMaintainabilityLabel(50)).toBe('Poor');
      expect(getMaintainabilityLabel(40)).toBe('Poor');
      expect(getMaintainabilityLabel(30)).toBe('Very Poor');
      expect(getMaintainabilityLabel(0)).toBe('Very Poor');
    });

    it('should handle edge cases', () => {
      expect(getMaintainabilityLabel(79.9)).toBe('Acceptable');
      expect(getMaintainabilityLabel(80.1)).toBe('Good');
      expect(getMaintainabilityLabel(-10)).toBe('Very Poor');
    });
  });

  describe('getComplexityColorLevel', () => {
    it('should return correct colors for complexity ranges', () => {
      expect(getComplexityColorLevel(1)).toBe('green');
      expect(getComplexityColorLevel(10)).toBe('green');
      expect(getComplexityColorLevel(15)).toBe('yellow');
      expect(getComplexityColorLevel(20)).toBe('red');
      expect(getComplexityColorLevel(30)).toBe('redBold');
      expect(getComplexityColorLevel(50)).toBe('redBold');
      expect(getComplexityColorLevel(100)).toBe('redBold');
    });

    it('should handle edge cases', () => {
      expect(getComplexityColorLevel(0)).toBe('green');
      expect(getComplexityColorLevel(10.5)).toBe('yellow');
      expect(getComplexityColorLevel(20.5)).toBe('redBold');
    });
  });

  describe('getDuplicationColorLevel', () => {
    it('should return correct colors for duplication ranges', () => {
      expect(getDuplicationColorLevel(0)).toBe('green');
      expect(getDuplicationColorLevel(3)).toBe('green');
      expect(getDuplicationColorLevel(5)).toBe('green');
      expect(getDuplicationColorLevel(8)).toBe('green');
      expect(getDuplicationColorLevel(10)).toBe('green');
      expect(getDuplicationColorLevel(15)).toBe('green');
      expect(getDuplicationColorLevel(20)).toBe('yellow');
      expect(getDuplicationColorLevel(30)).toBe('yellow');
      expect(getDuplicationColorLevel(40)).toBe('red');
      expect(getDuplicationColorLevel(60)).toBe('redBold');
    });

    it('should handle edge cases', () => {
      expect(getDuplicationColorLevel(-1)).toBe('green');
      expect(getDuplicationColorLevel(3.5)).toBe('green');
    });
  });

  describe('getMaintainabilityColorLevel', () => {
    it('should return correct colors for maintainability ranges', () => {
      expect(getMaintainabilityColorLevel(100)).toBe('green');
      expect(getMaintainabilityColorLevel(80)).toBe('green');
      expect(getMaintainabilityColorLevel(70)).toBe('yellow');
      expect(getMaintainabilityColorLevel(60)).toBe('yellow');
      expect(getMaintainabilityColorLevel(50)).toBe('red');
      expect(getMaintainabilityColorLevel(40)).toBe('red');
      expect(getMaintainabilityColorLevel(30)).toBe('redBold');
    });

    it('should handle edge cases', () => {
      expect(getMaintainabilityColorLevel(79.9)).toBe('yellow');
      expect(getMaintainabilityColorLevel(80.1)).toBe('green');
      expect(getMaintainabilityColorLevel(-10)).toBe('redBold');
    });
  });

  describe('getSeverityColorLevel', () => {
    it('should return correct colors for severity ratios', () => {
      expect(getSeverityColorLevel(1)).toBe('green');
      expect(getSeverityColorLevel(2)).toBe('green');
      expect(getSeverityColorLevel(3)).toBe('yellow');
      expect(getSeverityColorLevel(4)).toBe('yellow');
      expect(getSeverityColorLevel(6)).toBe('red');
      expect(getSeverityColorLevel(8)).toBe('red');
      expect(getSeverityColorLevel(12)).toBe('redBold');
    });

    it('should handle edge cases', () => {
      expect(getSeverityColorLevel(0)).toBe('green');
      expect(getSeverityColorLevel(2.5)).toBe('yellow');
      expect(getSeverityColorLevel(5)).toBe('red');
      expect(getSeverityColorLevel(10)).toBe('redBold');
    });
  });

  describe('consistency between labels and colors', () => {
    it('should have consistent complexity thresholds', () => {
      // Green should correspond to Low
      expect(getComplexityColorLevel(5)).toBe('green');
      expect(getComplexityLabel(5)).toBe('Low');
      
      // Yellow should correspond to Medium
      expect(getComplexityColorLevel(15)).toBe('yellow');
      expect(getComplexityLabel(15)).toBe('Medium');
      
      // Red should correspond to High
      expect(getComplexityColorLevel(20)).toBe('red');
      expect(getComplexityLabel(20)).toBe('High');
    });

    it('should have consistent duplication thresholds', () => {
      // Green should correspond to Low
      expect(getDuplicationColorLevel(2)).toBe('green');
      expect(getDuplicationLabel(2)).toBe('Low');
      
      // Yellow should correspond to Medium
      expect(getDuplicationColorLevel(25)).toBe('yellow');
      expect(getDuplicationLabel(25)).toBe('Medium');
      
      // Red should correspond to High
      expect(getDuplicationColorLevel(40)).toBe('red');
      expect(getDuplicationLabel(40)).toBe('High');
    });

    it('should have consistent maintainability thresholds', () => {
      // Green should correspond to Good
      expect(getMaintainabilityColorLevel(90)).toBe('green');
      expect(getMaintainabilityLabel(90)).toBe('Good');
      
      // Yellow should correspond to Acceptable
      expect(getMaintainabilityColorLevel(70)).toBe('yellow');
      expect(getMaintainabilityLabel(70)).toBe('Acceptable');
      
      // Red should correspond to Poor
      expect(getMaintainabilityColorLevel(50)).toBe('red');
      expect(getMaintainabilityLabel(50)).toBe('Poor');
    });
  });
});