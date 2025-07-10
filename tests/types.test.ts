import { describe, it, expect } from 'vitest';
import { validateRatio, validateScore } from '../src/types';

describe('Types Validation', () => {
  describe('validateRatio', () => {
    it('should accept valid ratios', () => {
      expect(validateRatio(0)).toBe(0);
      expect(validateRatio(0.5)).toBe(0.5);
      expect(validateRatio(1)).toBe(1);
      expect(validateRatio(0.123456)).toBe(0.123456);
    });

    it('should reject ratios below 0', () => {
      expect(() => validateRatio(-0.1)).toThrow('Invalid ratio: -0.1');
      expect(() => validateRatio(-1)).toThrow('Invalid ratio: -1');
      expect(() => validateRatio(-100)).toThrow('Invalid ratio: -100');
    });

    it('should reject ratios above 1', () => {
      expect(() => validateRatio(1.1)).toThrow('Invalid ratio: 1.1');
      expect(() => validateRatio(2)).toThrow('Invalid ratio: 2');
      expect(() => validateRatio(100)).toThrow('Invalid ratio: 100');
    });

    it('should handle edge cases', () => {
      expect(validateRatio(0.0)).toBe(0);
      expect(validateRatio(1.0)).toBe(1);
      expect(validateRatio(0.9999999)).toBe(0.9999999);
      expect(validateRatio(0.0000001)).toBe(0.0000001);
    });

    it('should handle floating point precision', () => {
      expect(validateRatio(0.1 + 0.2 - 0.3)).toBe(0.1 + 0.2 - 0.3);
    });
  });

  describe('validateScore', () => {
    it('should accept valid scores', () => {
      expect(validateScore(0)).toBe(0);
      expect(validateScore(50)).toBe(50);
      expect(validateScore(100)).toBe(100);
      expect(validateScore(25.7)).toBe(26); // Should round
    });

    it('should round scores to nearest integer', () => {
      expect(validateScore(25.4)).toBe(25);
      expect(validateScore(25.5)).toBe(26);
      expect(validateScore(25.6)).toBe(26);
      expect(validateScore(99.9)).toBe(100);
      expect(validateScore(0.1)).toBe(0);
      expect(validateScore(0.9)).toBe(1);
    });

    it('should reject scores below 0', () => {
      expect(() => validateScore(-0.1)).toThrow('Invalid score: -0.1');
      expect(() => validateScore(-1)).toThrow('Invalid score: -1');
      expect(() => validateScore(-100)).toThrow('Invalid score: -100');
    });

    it('should reject scores above 100', () => {
      expect(() => validateScore(100.1)).toThrow('Invalid score: 100.1');
      expect(() => validateScore(101)).toThrow('Invalid score: 101');
      expect(() => validateScore(200)).toThrow('Invalid score: 200');
    });

    it('should handle edge cases', () => {
      expect(validateScore(0.0)).toBe(0);
      expect(validateScore(100.0)).toBe(100);
      expect(validateScore(99.99)).toBe(100);
      expect(validateScore(0.01)).toBe(0);
    });

    it('should handle floating point precision', () => {
      // Test with floating point arithmetic that might not be exact
      const result = 50.1 + 49.9 - 100; // Should be 0 but might be close to 0
      expect(validateScore(100 + result)).toBe(100);
    });

    it('should handle very small positive numbers', () => {
      expect(validateScore(0.4)).toBe(0);
      expect(validateScore(0.5)).toBe(1);
      expect(validateScore(0.6)).toBe(1);
    });

    it('should handle very large valid numbers', () => {
      expect(validateScore(99.4)).toBe(99);
      expect(validateScore(99.5)).toBe(100);
      expect(validateScore(99.6)).toBe(100);
    });
  });

  describe('integration between validateRatio and validateScore', () => {
    it('should work together for ratio to percentage conversion', () => {
      const ratio = validateRatio(0.456);
      const percentage = ratio * 100;
      const score = validateScore(percentage);
      
      expect(score).toBe(46); // 0.456 * 100 = 45.6 -> rounds to 46
    });

    it('should work together for percentage to ratio conversion', () => {
      const score = validateScore(67.8);
      const ratio = validateRatio(score / 100);
      
      expect(score).toBe(68); // 67.8 rounds to 68
      expect(ratio).toBe(0.68); // 68 / 100 = 0.68
    });
  });
});