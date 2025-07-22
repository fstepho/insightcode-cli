# Health Score Methodology - v0.6.0+

## Executive Summary

InsightCode's **Health Score** (0-100) uses progressive penalties **without artificial caps** to implement the **Pareto Principle**: 20% of critical files that cause 80% of maintenance problems receive appropriately severe scores.

## Core Philosophy

### 🎯 **Pareto Principle Implementation**
- **No penalty caps**: Individual penalties can exceed 100 points for extreme cases
- **Score bounded 0-100**: Final health score is clamped using `Math.max(0, 100 - totalPenalty)`
- **Progressive penalties**: Linear → Quadratic → Exponential progression
- **Academic foundation**: Follows McCabe, Clean Code, and ISO/IEC 25010 standards

> **⚠️ Important**: Health Score uses direct penalty summation without weights. The PROJECT_SCORING_WEIGHTS (0.45/0.30/0.25) apply only to project-level aggregation, not individual file scoring.

## Health Score Formula

```typescript
/**
 * Calculate health score using progressive penalties WITHOUT CAPS.
 * Formula: 100 - Sum of Penalties (without artificial ceilings).
 * Extreme values receive extreme penalties following Rules of the Art.
 */
export function calculateHealthScore(file: { 
  metrics: { 
    complexity: number; 
    loc: number; 
    duplicationRatio: number;
  }; 
  issues: FileIssue[]; 
}, duplicationMode: 'strict' | 'legacy' = 'legacy'): number {
  
  const complexityPenalty = getComplexityPenalty(file.metrics.complexity);
  const duplicationPenalty = getDuplicationPenalty(file.metrics.duplicationRatio, duplicationMode);
  const sizePenalty = getSizePenalty(file.metrics.loc);
  const issuesPenalty = getIssuesPenalty(file.issues);
  
  const totalPenalty = complexityPenalty + duplicationPenalty + sizePenalty + issuesPenalty;
  
  return Math.max(0, Math.round(100 - totalPenalty));
}
```

## Individual Penalty Functions

### 1. Complexity Penalty
```typescript
function getComplexityPenalty(complexity: number): number {
  // Base penalty from industry-standard scoring curve
  const score = calculateComplexityScore(complexity);
  const basePenalty = 100 - score;
  
  // For extreme complexity (>100), add catastrophic penalties
  if (complexity > 100) {
    const extremePenalty = Math.pow((complexity - 100) / 100, 1.8) * 50;
    return basePenalty + extremePenalty; // NO CAP!
  }
  
  return basePenalty;
}
```

**Constants used:**
- `EXPONENTIAL_POWER: 1.8` - Harmonized with all exponential penalties
- `EXPONENTIAL_MULTIPLIER: 50` - Calibrated against real-world extreme cases

### 2. Size Penalty
```typescript
function getSizePenalty(loc: number): number {
  // 200 LOC threshold (Clean Code inspired)
  if (loc <= 200) return 0;
  
  // Linear penalty up to 500 LOC
  if (loc <= 500) {
    return (loc - 200) / 15; // Every 15 LOC = 1 penalty point
  }
  
  // Exponential penalty for massive files - NO CAP!
  const basePenalty = 20; // LINEAR_MAX_PENALTY
  const exponentialPenalty = Math.pow(
    (loc - 500) / 1000, // EXPONENTIAL_DENOMINATOR
    1.8 // EXPONENTIAL_POWER (harmonized)
  ) * 8; // EXPONENTIAL_MULTIPLIER
  
  return basePenalty + exponentialPenalty; // Can exceed 40+ for massive files
}
```

**Constants used:**
- `EXCELLENT_THRESHOLD: 200` - Clean Code inspired (not a formal standard)
- `HIGH_THRESHOLD: 500` - Threshold where files become difficult to navigate  
- `LINEAR_DIVISOR: 15` - Based on cognitive chunking theory (Miller's 7±2)
- `LINEAR_MAX_PENALTY: 20` - Consistent with complexity penalties
- `EXPONENTIAL_DENOMINATOR: 1000` - May be too forgiving for massive files
- `EXPONENTIAL_POWER: 1.8` - Harmonized with all exponential penalties
- `EXPONENTIAL_MULTIPLIER: 8` - Lower than complexity as size alone is less critical

### 3. Duplication Penalty (Mode-Aware v0.6.0+)
```typescript
function getDuplicationPenalty(duplicationRatio: number, duplicationMode: 'strict' | 'legacy' = 'legacy'): number {
  const percentage = duplicationRatio * 100;
  
  // Threshold varies by mode: 3% (strict) vs 15% (legacy)
  const excellentThreshold = duplicationMode === 'strict' ? 3 : 15;
  if (percentage <= excellentThreshold) return 0;
  
  // High threshold: 8% (strict) vs 30% (legacy)
  const highThreshold = duplicationMode === 'strict' ? 8 : 30;
  
  if (percentage <= highThreshold) {
    // Linear penalty up to high threshold
    return (percentage - excellentThreshold) * 1.5; // LINEAR_MULTIPLIER
  }
  
  // Exponential penalty beyond high threshold - NO CAP!
  const basePenalty = 22.5; // LINEAR_MAX_PENALTY
  const exponentialPenalty = Math.pow(
    (percentage - highThreshold) / 10, // EXPONENTIAL_DENOMINATOR
    1.8 // EXPONENTIAL_POWER (harmonized)
  ) * 10; // EXPONENTIAL_MULTIPLIER
  
  return basePenalty + exponentialPenalty; // Can exceed 50+ for extreme duplication
}
```

**Duplication Thresholds: Configurable Modes**

InsightCode supports **dual duplication modes** to accommodate different project contexts:

| Mode | Excellent | Good | Critical | Usage Context |
|------|-----------|------|----------|---------------|
| **Strict** | ≤3% | ≤8% | ≤15% | New projects, industry standards (SonarQube/Google) |
| **Legacy** | ≤15% | ≤30% | ≤50% | Existing codebases, brownfield analysis |

**CLI Usage:**
```bash
# Strict mode (industry-aligned)
insightcode . --strict-duplication

# Legacy mode (default, backward compatible)
insightcode .
```

**Constants used:**
- `LINEAR_MULTIPLIER: 1.5` - Gentler than complexity (duplication easier to fix)
- `LINEAR_MAX_PENALTY: 22.5` - Slightly higher than complexity penalties
- `EXPONENTIAL_DENOMINATOR: 10` - Creates rapid acceleration beyond 30%
- `EXPONENTIAL_POWER: 1.8` - Harmonized with all exponential penalties
- `EXPONENTIAL_MULTIPLIER: 10` - Strong penalty for excessive duplication

### 4. Issues Penalty
```typescript
function getIssuesPenalty(issues: FileIssue[]): number {
  const penalty = issues.reduce((currentPenalty, issue) => {
    switch (issue.severity) {
      case 'critical': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.CRITICAL_PENALTY; // 20 points
      case 'high': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.HIGH_PENALTY;         // 12 points
      case 'medium': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.MEDIUM_PENALTY;     // 6 points
      case 'low': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.LOW_PENALTY;           // 2 points
      default: return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.DEFAULT_PENALTY;          // 6 points
    }
  }, 0);
  
  // NO CAP! Files with many critical issues should score very low
  return penalty;
}
```

**Constants used:**
- `CRITICAL_PENALTY: 20` - 5 critical issues = 100 penalty points
- `HIGH_PENALTY: 12` - 60% of critical penalty (0.6 severity weighting)
- `MEDIUM_PENALTY: 6` - 30% of critical penalty (0.3 severity weighting)
- `LOW_PENALTY: 2` - 10% of critical penalty (0.1 severity weighting)
- `DEFAULT_PENALTY: 6` - Medium severity assumption for unclassified issues

**Penalty ratio maintains clean mathematical relationship: 20:12:6:2 = 10:6:3:1**

## Health Score Examples

Based on real project analysis:

| File | Complexity | LOC | Issues | Health Score | Analysis |
|------|------------|-----|--------|--------------|----------|
| `perfect.ts` | 5 | 100 | 0 | 100 | No penalties applied |
| `context-builder.ts` | 97 | 315 | 0 | 13 | High complexity (87 penalty) + size (7.7 penalty) |
| `dependency-analyzer.ts` | 176 | 834 | 0 | 0 | Extreme complexity (119 penalty) + large size (22.4 penalty) |

The extreme scores reflect **real technical debt** that requires immediate attention. This follows the **Pareto Principle**: identifying the 20% of code that causes 80% of maintenance problems.

### Immediate Actions Required
1. **Refactor `dependency-analyzer.ts`**: Split 176-complexity functions
2. **Break down large files**: Extract modules from 800+ LOC files
3. **Simplify conditional logic**: Reduce nested if/else statements

These scores serve their purpose: **making technical debt visible and actionable**.

## Quality Assurance

### Documentation Validation
The methodology is validated using automated scripts:

```bash
npm run validate-docs      # Validates numerical examples against actual code
npm run generate-docs      # Generates tables from current implementation
npm run validate-coefficients  # Validates mathematical foundations
```

**Key validation features:**
- Real-time validation against actual `calculateComplexityScore()`, `calculateHealthScore()` implementations
- Anti-regression protection prevents future inconsistencies
- All examples in this document are auto-validated against the codebase
