// File: src/scoring.ts

import { Issue, DuplicationConfig } from './types';
import {
  PROJECT_SCORING_WEIGHTS,
  MAINTAINABILITY_SCORING_THRESHOLDS,
  COMPLEXITY_LABEL_THRESHOLDS,
  COMPLEXITY_COLOR_THRESHOLDS,
  DUPLICATION_COLOR_THRESHOLDS,
  HEALTH_PENALTY_CONSTANTS,
  MAINTAINABILITY_COLOR_THRESHOLDS,
  SEVERITY_COLOR_THRESHOLDS,
  createDuplicationConfig,
  createDuplicationScoringThresholds,
  createDuplicationLabelThresholds,
  createDuplicationPenaltyConstants
} from './thresholds.constants';
import { percentageToRatio, ratioToPercentage } from './scoring.utils';

/**
 * Pure and autonomous functions for calculating scores from raw metrics.
 * v0.6.0 formulas use progressive curves (linear then exponential) 
 * without artificial caps for realistic evaluation of critical problems.
 */

// --- Labeling functions (aligned with McCabe thresholds) ---

export function getComplexityLabel(complexity: number): string {
  // Aligned with McCabe research-based thresholds in constants.ts
  if (complexity <= COMPLEXITY_LABEL_THRESHOLDS.LOW) return 'Low';
  if (complexity <= COMPLEXITY_LABEL_THRESHOLDS.MEDIUM) return 'Medium';
  if (complexity <= COMPLEXITY_LABEL_THRESHOLDS.HIGH) return 'High';
  if (complexity <= COMPLEXITY_LABEL_THRESHOLDS.VERY_HIGH) return 'Very High';
  return 'Extreme';
}

export function getDuplicationLabel(duplication: number, duplicationConfig?: DuplicationConfig): string {
  const config = duplicationConfig || createDuplicationConfig(false);
  const thresholds = createDuplicationLabelThresholds(config);
  
  // Aligned with dynamic thresholds based on mode (3/8/15 strict vs 15/30/50 legacy)
  if (duplication <= thresholds.LOW) return 'Low';
  if (duplication <= thresholds.MEDIUM) return 'Medium';
  if (duplication <= thresholds.HIGH) return 'High';
  return 'Very High';
}

export function getMaintainabilityLabel(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
}

// --- Dimension scoring functions (without artificial caps) ---

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
  // Phase 1: McCabe "excellent" threshold - excellent code
  if (complexity <= 10) return 100;
  
  // Phase 2: Linear degradation (industry standard for moderate complexity)
  if (complexity <= 20) {
    return Math.round(100 - (complexity - 10) * 3); // 3 points per unit (100 → 70)
  }
  
  // Phase 3: Quadratic penalty (reflects exponentially growing maintenance burden)
  if (complexity <= 50) {
    const base = 70;
    const range = complexity - 20; // 0-30 range
    const quadraticPenalty = Math.pow(range / 30, 2) * 40; // Up to 40 points penalty
    return Math.round(base - quadraticPenalty);
  }
  
  // Phase 4: Exponential penalty (extreme complexity = extreme penalties)
  // Ensures functions with complexity 100+ get near-zero scores
  // and complexity 1000+ get zero scores (following Pareto principle)
  const base = 30;
  const range = complexity - 50;
  const exponentialPenalty = Math.pow(range / 50, 1.8) * 30;
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
export function calculateDuplicationScore(duplicationRatio: number, duplicationConfig?: DuplicationConfig): number {
  const percentage = ratioToPercentage(duplicationRatio);
  
  // Use provided config or default to legacy mode
  const config = duplicationConfig || createDuplicationConfig(false);
  const thresholds = createDuplicationScoringThresholds(config);
  
  // Return 100 if below excellent threshold (varies by mode: 3% strict vs 15% legacy)
  if (percentage <= thresholds.EXCELLENT) return 100;
  
  // Exponential decay beyond excellent threshold, calibrated for high and critical levels
  const score = 100 * Math.exp(
    -thresholds.EXPONENTIAL_MULTIPLIER * 
    Math.pow(percentage - thresholds.EXCELLENT, thresholds.EXPONENTIAL_POWER)
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


// --- Color level functions (aligned with research thresholds) ---

export function getComplexityColorLevel(complexity: number): 'green' | 'yellow' | 'red' | 'redBold' {
    // Aligned with McCabe research thresholds
    if (complexity <= COMPLEXITY_COLOR_THRESHOLDS.GREEN) return 'green';
    if (complexity <= COMPLEXITY_COLOR_THRESHOLDS.YELLOW) return 'yellow';
    if (complexity <= COMPLEXITY_COLOR_THRESHOLDS.RED) return 'red';
    return 'redBold';
}

export function getDuplicationColorLevel(duplication: number): 'green' | 'yellow' | 'red' | 'redBold' {
    // Aligned with constants.ts thresholds (15/30/50)
    if (duplication <= DUPLICATION_COLOR_THRESHOLDS.GREEN) return 'green';
    if (duplication <= DUPLICATION_COLOR_THRESHOLDS.YELLOW) return 'yellow';
    if (duplication <= DUPLICATION_COLOR_THRESHOLDS.RED) return 'red';
    return 'redBold';
}

export function getMaintainabilityColorLevel(score: number): 'green' | 'yellow' | 'red' | 'redBold' {
    if (score >= MAINTAINABILITY_COLOR_THRESHOLDS.GREEN) return 'green';
    if (score >= MAINTAINABILITY_COLOR_THRESHOLDS.YELLOW) return 'yellow';
    if (score >= MAINTAINABILITY_COLOR_THRESHOLDS.RED) return 'red';
    return 'redBold';
}

export function getSeverityColorLevel(ratio: number): 'green' | 'yellow' | 'red' | 'redBold' {
    if (ratio >= SEVERITY_COLOR_THRESHOLDS.RED_BOLD) return 'redBold';
    if (ratio >= SEVERITY_COLOR_THRESHOLDS.RED) return 'red';
    if (ratio >= SEVERITY_COLOR_THRESHOLDS.YELLOW) return 'yellow';
    return 'green';
}

// --- Calcul du Score de Santé (sans caps de pénalité) ---

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
    const extremePenalty = Math.pow((complexity - 100) / 100, 1.5) * 50;
    return basePenalty + extremePenalty;
  }
  
  return basePenalty;
}

export function getDuplicationPenalty(duplicationRatio: number, duplicationConfig?: DuplicationConfig): number {
  const config = duplicationConfig || createDuplicationConfig(false);
  const constants = createDuplicationPenaltyConstants(config);
  
  // Threshold varies by mode: 3% (strict) vs 15% (legacy)
  if (duplicationRatio <= percentageToRatio(constants.EXCELLENT_THRESHOLD)) return 0;
  
  // Progressive penalty without artificial caps
  const percentage = ratioToPercentage(duplicationRatio);
  
  if (percentage <= constants.HIGH_THRESHOLD) {
    // Linear penalty up to high threshold (8% strict vs 30% legacy)
    return (percentage - constants.EXCELLENT_THRESHOLD) * constants.LINEAR_MULTIPLIER;
  }
  
  // Exponential penalty beyond high threshold - NO CAP!
  // High duplication should devastate the score
  const basePenalty = constants.LINEAR_MAX_PENALTY;
  const exponentialPenalty = Math.pow(
    (percentage - constants.HIGH_THRESHOLD) / constants.EXPONENTIAL_DENOMINATOR, 
    constants.EXPONENTIAL_POWER
  ) * constants.EXPONENTIAL_MULTIPLIER;
  
  return basePenalty + exponentialPenalty; // Can exceed 50+ for extreme duplication
}

function getSizePenalty(loc: number): number {
  const constants = HEALTH_PENALTY_CONSTANTS.SIZE;
  
  if (loc <= constants.EXCELLENT_THRESHOLD) return 0;
  
  // Progressive penalty following internal convention (Clean Code inspired)
  if (loc <= constants.HIGH_THRESHOLD) {
    // Linear penalty up to 500 LOC
    return (loc - constants.EXCELLENT_THRESHOLD) / constants.LINEAR_DIVISOR;
  }
  
  // Exponential penalty for massive files - NO CAP!
  // Files with 5000+ LOC should be severely penalized
  const basePenalty = constants.LINEAR_MAX_PENALTY;
  const exponentialPenalty = Math.pow(
    (loc - constants.HIGH_THRESHOLD) / constants.EXPONENTIAL_DENOMINATOR, 
    constants.EXPONENTIAL_POWER
  ) * constants.EXPONENTIAL_MULTIPLIER;
  
  return basePenalty + exponentialPenalty; // Can exceed 40+ for massive files
}

function getIssuesPenalty(issues: Issue[]): number {
  const constants = HEALTH_PENALTY_CONSTANTS.ISSUES;
  
  // Issues penalty without artificial caps - following Pareto principle
  const penalty = issues.reduce((currentPenalty, issue) => {
    switch (issue.severity) {
      case 'critical': return currentPenalty + constants.CRITICAL_PENALTY;
      case 'high': return currentPenalty + constants.HIGH_PENALTY;
      case 'medium': return currentPenalty + constants.MEDIUM_PENALTY;
      case 'low': return currentPenalty + constants.LOW_PENALTY;
      default: return currentPenalty + constants.DEFAULT_PENALTY;
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
  issues: Issue[]; 
}, duplicationConfig?: DuplicationConfig): number {
  
  const complexityPenalty = getComplexityPenalty(file.metrics.complexity);
  const duplicationPenalty = getDuplicationPenalty(file.metrics.duplicationRatio, duplicationConfig);
  const sizePenalty = getSizePenalty(file.metrics.loc);
  const issuesPenalty = getIssuesPenalty(file.issues);
  
  const totalPenalty = complexityPenalty + duplicationPenalty + sizePenalty + issuesPenalty;
  
  return Math.max(0, Math.round(100 - totalPenalty));
}