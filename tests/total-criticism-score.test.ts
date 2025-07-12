import { describe, it, expect } from 'vitest';

describe('Total Criticism Score Logic', () => {
  
  // Test the calculateCriticismScore function logic directly
  function calculateCriticismScore(file: {
    complexity: number;
    loc: number;
    duplicationRatio: number;
    incomingDependencies: number;
    outgoingDependencies: number;
    isInCycle: boolean;
  }): number {
    const complexityWeight = 1.0;
    const impactWeight = 2.0;
    const issueWeight = 0.5;
    
    // Calculate impact based on dependency metrics
    const impact = file.incomingDependencies + file.outgoingDependencies + (file.isInCycle ? 5 : 0);
    
    // Count issues (we don't have explicit issues array in new structure, so approximate)
    let issueCount = 0;
    if (file.complexity > 10) issueCount++;
    if (file.duplicationRatio > 0.1) issueCount++; // 10% duplication threshold
    if (file.loc > 500) issueCount++; // Large file threshold
    
    return (impact * impactWeight) + 
           (file.complexity * complexityWeight) + 
           (issueCount * issueWeight) + 
           1; // Base score to avoid zero weights
  }

  it('should calculate criticism score with proper weights for impact, complexity, and issues', () => {
    // Test data: file with high dependency impact should get higher criticism score
    const highImpactFile = {
      complexity: 10,
      loc: 200,
      duplicationRatio: 0.15,
      incomingDependencies: 10,
      outgoingDependencies: 8,
      isInCycle: true
    };

    const lowImpactFile = {
      complexity: 3,
      loc: 50,
      duplicationRatio: 0.02,
      incomingDependencies: 1,
      outgoingDependencies: 1,
      isInCycle: false
    };

    const highImpactCriticismScore = calculateCriticismScore(highImpactFile);
    const lowImpactCriticismScore = calculateCriticismScore(lowImpactFile);

    // Verify high impact file has significantly higher criticism score
    expect(highImpactCriticismScore).toBeGreaterThan(lowImpactCriticismScore);
    
    // Verify specific calculations
    // High impact file: (18+5)*2 + 10*1 + 1*0.5 + 1 = 46 + 10 + 0.5 + 1 = 57.5
    expect(highImpactCriticismScore).toBeCloseTo(57.5);
    
    // Low impact file: 2*2 + 3*1 + 0*0.5 + 1 = 4 + 3 + 0 + 1 = 8
    expect(lowImpactCriticismScore).toBeCloseTo(8);
  });

  it('should weight dependency impact most heavily (2.0x)', () => {
    const highDependencyFile = {
      complexity: 1,
      loc: 50,
      duplicationRatio: 0,
      incomingDependencies: 20,
      outgoingDependencies: 20,
      isInCycle: false
    };

    const highComplexityFile = {
      complexity: 20,
      loc: 50,
      duplicationRatio: 0,
      incomingDependencies: 1,
      outgoingDependencies: 1,
      isInCycle: false
    };

    const highDepScore = calculateCriticismScore(highDependencyFile);
    const highComplexScore = calculateCriticismScore(highComplexityFile);

    // Calculate manually
    // High dependency: 40*2 + 1*1 + 0*0.5 + 1 = 80 + 1 + 0 + 1 = 82
    // High complexity: 2*2 + 20*1 + 1*0.5 + 1 = 4 + 20 + 0.5 + 1 = 25.5 (complexity > 10 = 1 issue)

    expect(highDepScore).toBeCloseTo(82);
    expect(highComplexScore).toBeCloseTo(25.5); // Corrected: complexity 20 > 10 creates 1 issue
    expect(highDepScore).toBeGreaterThan(highComplexScore);
  });

  it('should penalize circular dependencies', () => {
    const circularFile = {
      complexity: 5,
      loc: 100,
      duplicationRatio: 0,
      incomingDependencies: 5,
      outgoingDependencies: 5,
      isInCycle: true
    };

    const nonCircularFile = {
      complexity: 5,
      loc: 100,
      duplicationRatio: 0,
      incomingDependencies: 5,
      outgoingDependencies: 5,
      isInCycle: false
    };

    const circularScore = calculateCriticismScore(circularFile);
    const nonCircularScore = calculateCriticismScore(nonCircularFile);

    // Circular should get +5 penalty: (10+5)*2 vs 10*2 = 30 vs 20 impact component
    // Total difference should be 5*2 = 10 points
    expect(circularScore - nonCircularScore).toBe(10);
  });

  it('should count issues properly (complexity > 10, duplication > 10%, LOC > 500)', () => {
    const manyIssuesFile = {
      complexity: 15,    // Issue 1: complexity > 10
      loc: 600,          // Issue 2: LOC > 500  
      duplicationRatio: 0.12,  // Issue 3: duplication > 10%
      incomingDependencies: 0,
      outgoingDependencies: 0,
      isInCycle: false
    };

    const noIssuesFile = {
      complexity: 5,     // No issue
      loc: 100,          // No issue  
      duplicationRatio: 0.05,  // No issue
      incomingDependencies: 0,
      outgoingDependencies: 0,
      isInCycle: false
    };

    const manyIssuesScore = calculateCriticismScore(manyIssuesFile);
    const noIssuesScore = calculateCriticismScore(noIssuesFile);

    // Many issues: 0*2 + 15*1 + 3*0.5 + 1 = 17.5
    // No issues: 0*2 + 5*1 + 0*0.5 + 1 = 6
    
    expect(manyIssuesScore).toBeCloseTo(17.5);
    expect(noIssuesScore).toBeCloseTo(6);
    expect(manyIssuesScore - noIssuesScore).toBeCloseTo(11.5);
  });

  it('should always have a minimum score of 1 (base weight)', () => {
    const minimalFile = {
      complexity: 0,
      loc: 0,
      duplicationRatio: 0,
      incomingDependencies: 0,
      outgoingDependencies: 0,
      isInCycle: false
    };

    const score = calculateCriticismScore(minimalFile);
    expect(score).toBe(1); // Only the base weight
  });
});
