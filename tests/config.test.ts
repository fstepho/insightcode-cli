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
    
    // Test structure and types rather than specific values
    expect(config).toHaveProperty('complexity');
    expect(config).toHaveProperty('size');
    expect(config).toHaveProperty('duplication');
    
    // Test that configurations have proper structure
    expect(config.complexity.production).toHaveProperty('medium');
    expect(config.complexity.production).toHaveProperty('high');
    expect(config.complexity.test).toHaveProperty('medium');
    expect(config.complexity.test).toHaveProperty('high');
    
    // Test that medium < high for all categories
    expect(config.complexity.production.medium).toBeLessThan(config.complexity.production.high);
    expect(config.complexity.test.medium).toBeLessThan(config.complexity.test.high);
    expect(config.size.production.medium).toBeLessThan(config.size.production.high);
    expect(config.duplication.production.medium).toBeLessThan(config.duplication.production.high);
  });

  it('should allow setting custom configuration for testing', () => {
    const customConfig = {
      complexity: {
        production: { medium: 5, high: 10 },
        test: { medium: 8, high: 15 },
        utility: { medium: 10, high: 20 }
      },
      size: {
        production: { medium: 150, high: 250 },
        test: { medium: 200, high: 400 },
        utility: { medium: 180, high: 320 }
      },
      duplication: {
        production: { medium: 10, high: 20 },
        test: { medium: 15, high: 30 },
        utility: { medium: 12, high: 25 }
      }
    };

    setConfigForTesting(customConfig);
    const config = getConfig();

    expect(config.complexity.production.medium).toBe(5);
    expect(config.complexity.production.high).toBe(10);
    expect(config.duplication.production.medium).toBe(10);
    expect(config.duplication.production.high).toBe(20);
    expect(config.size.test.medium).toBe(200);
    expect(config.size.test.high).toBe(400);
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
    expect(config1.complexity.production.medium).toBe(config2.complexity.production.medium);
  });
});