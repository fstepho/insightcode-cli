import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, resetConfig, setConfigForTesting } from '../src/config';

describe('Configuration', () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  it('should load default configuration', () => {
    const config = getConfig();
    
    expect(config.complexity.excellent).toBe(10);
    expect(config.complexity.good).toBe(15);
    expect(config.duplication.excellent).toBe(3);
    expect(config.grades.A).toBe(90);
    expect(config.grades.B).toBe(80);
    expect(config.maintainabilityLabels.good).toBe(80);
  });

  it('should allow setting custom configuration for testing', () => {
    const customConfig = {
      complexity: { excellent: 5, good: 10, acceptable: 15, poor: 20, veryPoor: 30 },
      duplication: { excellent: 2, good: 5, acceptable: 10, poor: 20, veryPoor: 30 },
      fileSize: { excellent: 100, good: 200, acceptable: 300, poor: 400, veryPoor: 500 },
      functionCount: { excellent: 5, good: 10, acceptable: 15, poor: 20 },
      grades: { A: 85, B: 75, C: 65, D: 55 },
      maintainabilityLabels: { good: 75, acceptable: 55, poor: 35 },
      extremeFilePenalties: { largeFileThreshold: 800, largeFilePenalty: 5, massiveFileThreshold: 1500, massiveFilePenalty: 15 }
    };

    setConfigForTesting(customConfig);
    const config = getConfig();

    expect(config.complexity.excellent).toBe(5);
    expect(config.duplication.excellent).toBe(2);
    expect(config.grades.A).toBe(85);
    expect(config.maintainabilityLabels.good).toBe(75);
  });

  it('should cache configuration', () => {
    const config1 = getConfig();
    const config2 = getConfig();
    
    expect(config1).toBe(config2); // Same object reference
  });

  it('should reset configuration cache', () => {
    const config1 = getConfig();
    resetConfig();
    const config2 = getConfig();
    
    // Should be different object instances after reset
    expect(config1).not.toBe(config2);
    // But should have same values
    expect(config1.complexity.excellent).toBe(config2.complexity.excellent);
  });
});