// File: src/scoring.ts

import { FileIssue, FileDetail } from './types';
import { DUPLICATION_LEVELS } from './scoring.utils';
import { COMPLEXITY_SCORING_THRESHOLDS } from './thresholds.constants';
import {
  PROJECT_SCORING_WEIGHTS,
  MAINTAINABILITY_SCORING_THRESHOLDS,
  HEALTH_PENALTY_CONSTANTS
} from './thresholds.constants';
import { percentageToRatio, ratioToPercentage, DUPLICATION_SCORING } from './scoring.utils';
/**
 * Converts cyclomatic complexity to a score from 0 to 100 according to industry best practices.
 * Uses progressive degradation following the gold standard: Linear → Quadratic → Exponential.
 * 
 * RESEARCH BASIS: 
 * - McCabe (1976): complexity <= 10 for excellent code
 * - ISO/IEC 25010: Extreme complexity violates maintainability principles
 * - Fowler Technical Debt: Must be visible and quantified, not masked
 * 
 * METHODOLOGY (Rules of the Art):
 * - Phase 1 (≤10): Excellent (100 points)
 * - Phase 2 (10-20): Linear degradation (100 → 70 points)  
 * - Phase 3 (20-50): Quadratic penalty (70 → 30 points)
 * - Phase 4 (>50): Exponential penalty (30 → 0 points)
 * 
 * This ensures extreme complexity (16,000+) receives catastrophic scores,
 * respecting the Pareto principle and making technical debt visible.
 */
export function calculateComplexityScore(complexity: number): number {
  // Use empirically validated coefficients while maintaining table-driven configuration
  const { EXCELLENT, CRITICAL, LINEAR_PENALTY_RATE, EXPONENTIAL_BASE, EXPONENTIAL_POWER, EXPONENTIAL_MULTIPLIER } = COMPLEXITY_SCORING_THRESHOLDS;
  
  // Phase 1: McCabe "excellent" threshold - excellent code (≤10)
  if (complexity <= EXCELLENT) {
    return 100;
  }
  
  // Phase 2: Linear degradation using empirically validated rate (10-20)
  if (complexity <= CRITICAL) {
    // Calibration supérieure: 3 points lost per complexity unit (100→70 progression)
    return Math.round(100 - (complexity - EXCELLENT) * LINEAR_PENALTY_RATE);
  }
  
  // Phase 3: Quadratic penalty for very high complexity (20-50)
  if (complexity <= 50) {
    const base = 100 - (CRITICAL - EXCELLENT) * LINEAR_PENALTY_RATE; // 70 (from linear phase end)
    const range = complexity - CRITICAL; // 0-30 range
    const quadraticPenalty = Math.pow(range / 30, 2) * EXPONENTIAL_MULTIPLIER; // 40 points penalty
    return Math.round(base - quadraticPenalty);
  }
  
  // Phase 4: Exponential penalty for extreme complexity (>50)
  // Ensures functions with complexity 100+ get near-zero scores
  // and complexity 1000+ get zero scores (following Pareto principle)
  const base = EXPONENTIAL_BASE;
  const range = complexity - 50;
  const exponentialPenalty = Math.pow(range / 50, EXPONENTIAL_POWER) * EXPONENTIAL_BASE;
  const score = base - exponentialPenalty;
  
  return Math.max(0, Math.round(score));
}

/**
 * Converts duplication ratio to a score from 0 to 100 using configurable thresholds.
 * 
 * Supports both legacy (permissive) and strict (industry-standard) modes:
 * - Legacy mode: ≤15% = "excellent" (for brownfield/legacy analysis)
 * - Strict mode: ≤3% = "excellent" (aligned with SonarQube/Google standards)
 * 
 * ⚠️ MODE AWARENESS: The scoring mode significantly affects results:
 * - 10% duplication: Legacy=100/100 (excellent), Strict=~20/100 (poor)
 * - Users should be aware which mode is active to interpret scores correctly
 * 
 * RESEARCH BASIS: Config alignment varies by mode - legacy optimized for brownfield,
 * strict aligned with industry standards (SonarQube quality gates).
 */
export function calculateDuplicationScore(duplicationRatio: number, duplicationMode: 'strict' | 'legacy' = 'legacy'): number {
  const percentage = ratioToPercentage(duplicationRatio);
  const mode = duplicationMode;
  
  // Use centralized configuration from DUPLICATION_LEVELS
  const excellentThreshold = mode === 'strict' ? 
    DUPLICATION_LEVELS.strict.excellent.maxThreshold : 
    DUPLICATION_LEVELS.legacy.excellent.maxThreshold;
  
  // Return 100 if below excellent threshold (varies by mode: 3% strict vs 15% legacy)
  if (percentage <= excellentThreshold) return 100;
  
  // Exponential decay beyond excellent threshold, using DUPLICATION_SCORING constants
  const exponentialMultiplier = DUPLICATION_SCORING.EXPONENTIAL_MULTIPLIER;
  const exponentialPower = DUPLICATION_SCORING.EXPONENTIAL_POWER;
  
  const score = 100 * Math.exp(
    -exponentialMultiplier * 
    Math.pow(percentage - excellentThreshold, exponentialPower)
  );
  return Math.max(0, Math.round(score));
}

/**
 * Calculate maintainability score from 0 to 100 based on size metrics.
 * 
 * INTERNAL CONVENTION: Inspired by Clean Code principles suggesting files should be small.
 * Industry guidance: < 200 LOC is often considered good, 300+ becomes harder to maintain.
 */
export function calculateMaintainabilityScore(fileLoc: number, fileFunctionCount: number): number {
  // Internal convention (Clean Code inspired): <= 200 LOC is considered maintainable
  const sizeScore = fileLoc <= MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FILE_SIZE
    ? 100 
    : 100 * Math.exp(
        -MAINTAINABILITY_SCORING_THRESHOLDS.SIZE_PENALTY_MULTIPLIER * 
        Math.pow(fileLoc - MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FILE_SIZE, MAINTAINABILITY_SCORING_THRESHOLDS.SIZE_PENALTY_POWER)
      );

  // Score based on function count
  const functionScore = fileFunctionCount <= MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FUNCTION_COUNT
    ? 100
    : 100 * Math.exp(
        -MAINTAINABILITY_SCORING_THRESHOLDS.FUNCTION_PENALTY_MULTIPLIER * 
        Math.pow(fileFunctionCount - MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FUNCTION_COUNT, MAINTAINABILITY_SCORING_THRESHOLDS.FUNCTION_PENALTY_POWER)
      );
  
  return Math.max(0, Math.round((sizeScore + functionScore) / 2));
}

// --- Global scoring and grading functions (weighted scoring) ---

/**
 * Calculate the final weighted score based on internal hypotheses.
 * 
 * WEIGHTS BASED ON INTERNAL HYPOTHESIS (requires empirical validation):
 * - 45% Complexity: Internal hypothesis - Primary defect predictor
 * - 30% Maintainability: Internal hypothesis - Development velocity impact  
 * - 25% Duplication: Internal hypothesis - Technical debt indicator
 * 
 * Note: These weights are internal conventions and require empirical validation.
 */
export function calculateWeightedScore(
  complexityScore: number,
  duplicationScore: number, 
  maintainabilityScore: number
): number {
  return (complexityScore * PROJECT_SCORING_WEIGHTS.COMPLEXITY) + 
         (maintainabilityScore * PROJECT_SCORING_WEIGHTS.MAINTAINABILITY) + 
         (duplicationScore * PROJECT_SCORING_WEIGHTS.DUPLICATION);
}

/**
 * Fonctions de pénalité individuelles progressives sans plafonds artificiels.
 * Suivent le principe de Pareto : les valeurs extrêmes doivent dominer le calcul.
 */

function getComplexityPenalty(complexity: number): number {
  // Convert complexity score to penalty using the same industry-standard curve
  // This ensures consistency between scoring and health calculation
  const score = calculateComplexityScore(complexity);
  
  // Base penalty from score (0-100 score becomes 100-0 penalty)
  const basePenalty = 100 - score;
  
  // For extreme complexity (>100), add catastrophic penalties to emphasize technical debt
  // This makes complexity 1000+ clearly distinguishable from complexity 100
  if (complexity > 100) {
    const extremePenalty = Math.pow((complexity - 100) / 100, HEALTH_PENALTY_CONSTANTS.COMPLEXITY.EXPONENTIAL_POWER) * HEALTH_PENALTY_CONSTANTS.COMPLEXITY.EXPONENTIAL_MULTIPLIER;
    return basePenalty + extremePenalty;
  }
  
  return basePenalty;
}

export function getDuplicationPenalty(duplicationRatio: number, duplicationMode: 'strict' | 'legacy' = 'legacy'): number {
  const mode = duplicationMode;
  
  // Use centralized configuration from DUPLICATION_LEVELS
  const excellentThreshold = mode === 'strict' ? 
    DUPLICATION_LEVELS.strict.excellent.maxThreshold : 
    DUPLICATION_LEVELS.legacy.excellent.maxThreshold;
  const highThreshold = mode === 'strict' ? 
    DUPLICATION_LEVELS.strict.good.maxThreshold : 
    DUPLICATION_LEVELS.legacy.good.maxThreshold;
  
  // Threshold varies by mode: 3% (strict) vs 15% (legacy)
  if (duplicationRatio <= percentageToRatio(excellentThreshold)) return 0;
  
  // Progressive penalty without artificial caps
  const percentage = ratioToPercentage(duplicationRatio);
  
  if (percentage <= highThreshold) {
    // Linear penalty up to high threshold (8% strict vs 30% legacy)
    return (percentage - excellentThreshold) * HEALTH_PENALTY_CONSTANTS.DUPLICATION.LINEAR_MULTIPLIER;
  }
  
  // Exponential penalty beyond high threshold - NO CAP!
  // High duplication should devastate the score
  const basePenalty = HEALTH_PENALTY_CONSTANTS.DUPLICATION.LINEAR_MAX_PENALTY;
  const exponentialPenalty = Math.pow(
    (percentage - highThreshold) / HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_DENOMINATOR, 
    HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_POWER
  ) * HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_MULTIPLIER;
  
  return basePenalty + exponentialPenalty; // Can exceed 50+ for extreme duplication
}

function getSizePenalty(loc: number): number {
  
  if (loc <= HEALTH_PENALTY_CONSTANTS.SIZE.EXCELLENT_THRESHOLD) return 0;
  
  // Progressive penalty following internal convention (Clean Code inspired)
  if (loc <= HEALTH_PENALTY_CONSTANTS.SIZE.HIGH_THRESHOLD) {
    // Linear penalty up to 500 LOC
    return (loc - HEALTH_PENALTY_CONSTANTS.SIZE.EXCELLENT_THRESHOLD) / HEALTH_PENALTY_CONSTANTS.SIZE.LINEAR_DIVISOR;
  }
  
  // Exponential penalty for massive files - NO CAP!
  // Files with 5000+ LOC should be severely penalized
  const basePenalty = HEALTH_PENALTY_CONSTANTS.SIZE.LINEAR_MAX_PENALTY;
  const exponentialPenalty = Math.pow(
    (loc - HEALTH_PENALTY_CONSTANTS.SIZE.HIGH_THRESHOLD) / HEALTH_PENALTY_CONSTANTS.SIZE.EXPONENTIAL_DENOMINATOR, 
    HEALTH_PENALTY_CONSTANTS.SIZE.EXPONENTIAL_POWER
  ) * HEALTH_PENALTY_CONSTANTS.SIZE.EXPONENTIAL_MULTIPLIER;
  
  return basePenalty + exponentialPenalty; // Can exceed 40+ for massive files
}

function getIssuesPenalty(issues: FileIssue[]): number {
  // Issues penalty without artificial caps - following Pareto principle
  const penalty = issues.reduce((currentPenalty, issue) => {
    switch (issue.severity) {
      case 'critical': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.CRITICAL_PENALTY;
      case 'high': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.HIGH_PENALTY;
      case 'medium': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.MEDIUM_PENALTY;
      case 'low': return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.LOW_PENALTY;
      default: return currentPenalty + HEALTH_PENALTY_CONSTANTS.ISSUES.DEFAULT_PENALTY;
    }
  }, 0);
  
  // NO CAP! Files with many critical issues should score very low
  return penalty;
}

/**
 * Calculate health score using progressive penalties WITHOUT CAPS.
 * Formula: 100 - Sum of Penalties (without artificial ceilings).
 * Extreme values receive extreme penalties following Rules of the Art.
 * 
 * @param file Object containing file metrics and issues.
 * @returns Health score from 0 to 100.
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

/**
 * Calculate criticism score for a file using original hypothesis weights
 * Higher score = more problematic file = more weight in final scores
 * 
 * Synchronized with calculateHealthScore to use actual file.issues array
 * instead of approximating issue count from metrics.
 * 
 * Weights:
 * - Impact (dependencies): 2.0 (most important)
 * - Weighted issues by severity: 0.5 (critical×4, high×3, medium×2, low×1)
 * - Base score: 1 (to avoid zero weights)
 * 
 * Note: Complexity is NOT included here to avoid double-counting since it's 
 * already weighted at 45% in the health score calculation.
 */
export function calculateCriticismScore(file: FileDetail): number {
  const impactWeight = 2.0;
  const issueWeight = 0.5;
  
  // Calculate impact based on dependency metrics
  const impact = (file.dependencies?.incomingDependencies || 0) + 
                 (file.dependencies?.outgoingDependencies || 0) + 
                 (file.dependencies?.isInCycle ? 5 : 0); // Penalty for circular dependencies
  
  // Use actual issues array instead of approximation - synchronized with calculateHealthScore
  const criticalIssues = file.issues.filter(i => i.severity === 'critical').length;
  const highIssues = file.issues.filter(i => i.severity === 'high').length;
  const mediumIssues = file.issues.filter(i => i.severity === 'medium').length;
  const lowIssues = file.issues.filter(i => i.severity === 'low').length;
  
  // Weight by severity for more accurate criticism scoring
  const weightedIssueScore = (criticalIssues * 4) + (highIssues * 3) + (mediumIssues * 2) + (lowIssues * 1);
  
  return (impact * impactWeight) + 
         (weightedIssueScore * issueWeight) + 
         1; // Base score to avoid zero weights
}