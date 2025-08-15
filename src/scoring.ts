// File: src/scoring.ts

import { FileIssue, FileDetail, CodeIssue } from './types';
import { DUPLICATION_LEVELS } from './scoring.utils';
import { COMPLEXITY_SCORING_THRESHOLDS } from './thresholds.constants';
import {
  PROJECT_SCORING_WEIGHTS,
  FILE_MAINTAINABILITY_SCORING_THRESHOLDS,
  FILE_HEALTH_PENALTY_CONSTANTS,
  RELIABILITY_SCORING_THRESHOLDS
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
export function calculateFileComplexityScore(complexity: number): number {
  // Use empirically validated coefficients while maintaining table-driven configuration
  const { EXCELLENT, CRITICAL, LINEAR_PENALTY_RATE, EXPONENTIAL_BASE, EXPONENTIAL_POWER, QUADRATIC_PENALTY_MULTIPLIER } = COMPLEXITY_SCORING_THRESHOLDS;
  
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
    const quadraticPenalty = Math.pow(range / 30, 2) * QUADRATIC_PENALTY_MULTIPLIER; // 40 points penalty
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
 * Calculate maintainability score from 0 to 100 based on comprehensive software metrics.
 * 
 * MODERN MAINTAINABILITY INDEX: Combines multiple dimensions of code quality:
 * - Size metrics: LOC and function count (Clean Code principles)
 * - Cohesion: How related are the functions in this file (LCOM-based)
 * - Coupling: Dependency stability and complexity (Martin's metrics)
 * - Structural quality: Based on architectural patterns
 * 
 * This replaces the basic size-only approach with industry-standard metrics.
 */
export function calculateFileMaintainabilityScore(fileLoc: number, fileFunctionCount: number): number;
export function calculateFileMaintainabilityScore(
  fileLoc: number, 
  fileFunctionCount: number, 
  cohesionScore?: number, 
  instability?: number, 
  incomingDeps?: number, 
  outgoingDeps?: number
): number;
export function calculateFileMaintainabilityScore(
  fileLoc: number, 
  fileFunctionCount: number, 
  cohesionScore: number = 1.0, // Default: assume perfect cohesion if not provided
  instability: number = 0.5,   // Default: moderate instability
  incomingDeps: number = 0,    // Default: no dependencies
  outgoingDeps: number = 0     // Default: no dependencies
): number {
  
  // 1. SIZE SCORE (25% weight) - Clean Code inspired
  const sizeScore = fileLoc <= FILE_MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FILE_SIZE
    ? 100 
    : 100 * Math.exp(
        -FILE_MAINTAINABILITY_SCORING_THRESHOLDS.SIZE_PENALTY_MULTIPLIER * 
        Math.pow(fileLoc - FILE_MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FILE_SIZE, FILE_MAINTAINABILITY_SCORING_THRESHOLDS.SIZE_PENALTY_POWER)
      );

  // 2. FUNCTION COUNT SCORE (25% weight) - Cognitive load management
  const functionScore = fileFunctionCount <= FILE_MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FUNCTION_COUNT
    ? 100
    : 100 * Math.exp(
        -FILE_MAINTAINABILITY_SCORING_THRESHOLDS.FUNCTION_PENALTY_MULTIPLIER * 
        Math.pow(fileFunctionCount - FILE_MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FUNCTION_COUNT, FILE_MAINTAINABILITY_SCORING_THRESHOLDS.FUNCTION_PENALTY_POWER)
      );
  
  // 3. COHESION SCORE (30% weight) - LCOM-inspired: higher cohesion = easier to maintain
  // Cohesion ranges from 0 (no cohesion) to 1 (perfect cohesion)
  const cohesionMaintainabilityScore = cohesionScore * 100;
  
  // 4. COUPLING SCORE (20% weight) - Martin's stability metrics
  // Good maintainability: stable dependencies (low instability) but not overly coupled
  let couplingScore = 100;
  
  // Penalize high instability (unstable files are harder to maintain)
  if (instability > 0.7) {
    const instabilityPenalty = (instability - 0.7) / 0.3; // 0-1 scale for instability > 0.7
    couplingScore -= instabilityPenalty * 40; // Up to 40 point penalty
  }
  
  // Penalize excessive coupling (too many dependencies)
  const totalDeps = incomingDeps + outgoingDeps;
  if (totalDeps > 10) { // Threshold for "highly coupled"
    const couplingPenalty = Math.min((totalDeps - 10) / 20, 1); // Cap at 100% penalty
    couplingScore -= couplingPenalty * 30; // Up to 30 point penalty
  }
  
  couplingScore = Math.max(0, couplingScore);
  
  // WEIGHTED COMBINATION of all maintainability factors
  // Size: 25%, Functions: 25%, Cohesion: 30%, Coupling: 20%
  const weightedScore = (
    (sizeScore * 0.25) +
    (functionScore * 0.25) + 
    (cohesionMaintainabilityScore * 0.30) +
    (couplingScore * 0.20)
  );
  
  return Math.max(0, Math.round(weightedScore));
}

/**
 * Calculate reliability score from 0 to 100 based on detected issues/defects severity and count.
 * 
 * RELIABILITY DIMENSION: New scoring dimension that evaluates code reliability
 * based on detected issues/defects (god functions, deep nesting, poor naming, architecture issues, etc.)
 * 
 * METHODOLOGY:
 * - Perfect score (100): No issues/defects detected
 * - Progressive penalties based on severity using RELIABILITY_SCORING_THRESHOLDS
 * - Exponential decay for multiple issues (follows Pareto principle)
 * - No artificial caps - files with many critical issues get very low reliability scores
 * 
 * This complements the existing complexity/duplication/maintainability scores
 * by explicitly accounting for code reliability through defect detection.
 */
export function calculateFileReliabilityScore(issues: CodeIssue[]): number {
  if (issues.length === 0) return RELIABILITY_SCORING_THRESHOLDS.BASE_SCORE;
  
  // Calculate weighted issue count based on severity using configured weights
  let weightedIssueCount = 0;
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'critical':
        weightedIssueCount += RELIABILITY_SCORING_THRESHOLDS.SEVERITY_WEIGHTS.CRITICAL;
        break;
      case 'high':
        weightedIssueCount += RELIABILITY_SCORING_THRESHOLDS.SEVERITY_WEIGHTS.HIGH;
        break;
      case 'medium':
        weightedIssueCount += RELIABILITY_SCORING_THRESHOLDS.SEVERITY_WEIGHTS.MEDIUM;
        break;
      case 'low':
        weightedIssueCount += RELIABILITY_SCORING_THRESHOLDS.SEVERITY_WEIGHTS.LOW;
        break;
      default:
        weightedIssueCount += RELIABILITY_SCORING_THRESHOLDS.SEVERITY_WEIGHTS.DEFAULT;
    }
  });
  
  // Progressive penalty: exponential decay based on weighted issue count
  // This ensures that:
  // - 1-2 minor issues: ~80-90 score (good but not perfect)
  // - 3-5 mixed issues: ~60-80 score (moderate quality) 
  // - Many issues or critical issues: <50 score (poor quality)
  // - Extreme cases (10+ critical issues): ~0 score (catastrophic)
  
  const baseScore = RELIABILITY_SCORING_THRESHOLDS.BASE_SCORE;
  const decayFactor = RELIABILITY_SCORING_THRESHOLDS.DECAY_FACTOR;
  const exponentialPower = RELIABILITY_SCORING_THRESHOLDS.EXPONENTIAL_POWER;
  
  const penalty = baseScore * (1 - Math.exp(-decayFactor * Math.pow(weightedIssueCount, exponentialPower)));
  const score = baseScore - penalty;
  
  return Math.max(0, Math.round(score));
}

// --- Global scoring and grading functions (weighted scoring) ---

/**
 * Calculate the final weighted score based on updated 4-dimensional scoring.
 * 
 * UPDATED WEIGHTS (4-dimensional scoring):
 * - 35% Complexity: Primary defect predictor (reduced but still highest)
 * - 25% Maintainability: Development velocity impact  
 * - 20% Duplication: Technical debt indicator
 * - 20% Reliability: NEW - Code reliability based on detected defects
 * 
 * Note: These weights are internal conventions and require empirical validation.
 */
export function calculateProjectWeightedScore(
  projectComplexityScore: number,
  projectDuplicationScore: number, 
  projectMaintainabilityScore: number,
  projectReliabilityScore: number
): number {
  return (projectComplexityScore * PROJECT_SCORING_WEIGHTS.COMPLEXITY) + 
         (projectMaintainabilityScore * PROJECT_SCORING_WEIGHTS.MAINTAINABILITY) + 
         (projectDuplicationScore * PROJECT_SCORING_WEIGHTS.DUPLICATION) +
         (projectReliabilityScore * PROJECT_SCORING_WEIGHTS.RELIABILITY);
}

/**
 * Individual progressive penalty functions without artificial ceilings.
 * Follow the Pareto principle: extreme values should dominate the calculation.
 */
function getFileComplexityPenalty(complexity: number): number {
  // Convert complexity score to penalty using the same industry-standard curve
  // This ensures consistency between scoring and health calculation
  const score = calculateFileComplexityScore(complexity);
  
  // Base penalty from score (0-100 score becomes 100-0 penalty)
  const basePenalty = 100 - score;
  
  // For extreme complexity (>100), add catastrophic penalties to emphasize technical debt
  // This makes complexity 1000+ clearly distinguishable from complexity 100
  if (complexity > 100) {
    const extremePenalty = Math.pow((complexity - 100) / 100, FILE_HEALTH_PENALTY_CONSTANTS.COMPLEXITY.EXPONENTIAL_POWER) * FILE_HEALTH_PENALTY_CONSTANTS.COMPLEXITY.EXPONENTIAL_MULTIPLIER;
    return basePenalty + extremePenalty;
  }
  
  return basePenalty;
}

export function getFileDuplicationPenalty(duplicationRatio: number, duplicationMode: 'strict' | 'legacy' = 'legacy'): number {
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
    return (percentage - excellentThreshold) * FILE_HEALTH_PENALTY_CONSTANTS.DUPLICATION.LINEAR_MULTIPLIER;
  }
  
  // Exponential penalty beyond high threshold - NO CAP!
  // High duplication should devastate the score
  const basePenalty = FILE_HEALTH_PENALTY_CONSTANTS.DUPLICATION.LINEAR_MAX_PENALTY;
  const exponentialPenalty = Math.pow(
    (percentage - highThreshold) / FILE_HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_DENOMINATOR, 
    FILE_HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_POWER
  ) * FILE_HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_MULTIPLIER;
  
  return basePenalty + exponentialPenalty; // Can exceed 50+ for extreme duplication
}

function getFileSizePenalty(loc: number): number {
  
  if (loc <= FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXCELLENT_THRESHOLD) return 0;
  
  // Progressive penalty following internal convention (Clean Code inspired)
  if (loc <= FILE_HEALTH_PENALTY_CONSTANTS.SIZE.HIGH_THRESHOLD) {
    // Linear penalty up to 500 LOC
    return (loc - FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXCELLENT_THRESHOLD) / FILE_HEALTH_PENALTY_CONSTANTS.SIZE.LINEAR_DIVISOR;
  }
  
  // Exponential penalty for massive files - NO CAP!
  // Files with 5000+ LOC should be severely penalized
  const basePenalty = FILE_HEALTH_PENALTY_CONSTANTS.SIZE.LINEAR_MAX_PENALTY;
  const exponentialPenalty = Math.pow(
    (loc - FILE_HEALTH_PENALTY_CONSTANTS.SIZE.HIGH_THRESHOLD) / FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXPONENTIAL_DENOMINATOR, 
    FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXPONENTIAL_POWER
  ) * FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXPONENTIAL_MULTIPLIER;
  
  return basePenalty + exponentialPenalty; // Can exceed 40+ for massive files
}

function getIssuesPenalty(issues: FileIssue[]): number {
  // Issues penalty without artificial caps - following Pareto principle
  const penalty = issues.reduce((currentPenalty, issue) => {
    switch (issue.severity) {
      case 'critical': return currentPenalty + FILE_HEALTH_PENALTY_CONSTANTS.ISSUES.CRITICAL_PENALTY;
      case 'high': return currentPenalty + FILE_HEALTH_PENALTY_CONSTANTS.ISSUES.HIGH_PENALTY;
      case 'medium': return currentPenalty + FILE_HEALTH_PENALTY_CONSTANTS.ISSUES.MEDIUM_PENALTY;
      case 'low': return currentPenalty + FILE_HEALTH_PENALTY_CONSTANTS.ISSUES.LOW_PENALTY;
      default: return currentPenalty + FILE_HEALTH_PENALTY_CONSTANTS.ISSUES.DEFAULT_PENALTY;
    }
  }, 0);
  
  // NO CAP! Files with many critical issues should score very low
  return penalty;
}

/**
 * Calculate file health score using progressive penalties WITHOUT CAPS.
 * Formula: 100 - Sum of Penalties (without artificial ceilings).
 * Extreme values receive extreme penalties following Rules of the Art.
 * 
 * @param file Object containing file metrics and issues.
 * @returns File health score from 0 to 100.
 */
export function calculateFileHealthScore(file: { 
  metrics: { 
    complexity: number; 
    loc: number; 
    duplicationRatio: number;
  }; 
  issues: FileIssue[];
  functions?: Array<{ issues?: FileIssue[] }>; // Include function issues 
}, duplicationMode: 'strict' | 'legacy' = 'legacy'): number {
  
  const complexityPenalty = getFileComplexityPenalty(file.metrics.complexity);
  const duplicationPenalty = getFileDuplicationPenalty(file.metrics.duplicationRatio, duplicationMode);
  const sizePenalty = getFileSizePenalty(file.metrics.loc);
  
  // Include both file-level and function-level issues
  const allIssues = [...file.issues];
  if (file.functions) {
    for (const func of file.functions) {
      if (func.issues) {
        allIssues.push(...func.issues);
      }
    }
  }
  const issuesPenalty = getIssuesPenalty(allIssues);
  
  const totalPenalty = complexityPenalty + duplicationPenalty + sizePenalty + issuesPenalty;
  
  return Math.max(0, Math.round(100 - totalPenalty));
}

/**
 * Calculate criticism score for a file using original hypothesis weights
 * Higher score = more problematic file = more weight in final scores
 * 
 * Synchronized with calculateFileHealthScore to use actual file.issues array
 * instead of approximating issue count from metrics.
 * 
 * Weights:
 * - Impact (dependencies): 2.0 (most important)
 * - Weighted issues by severity: 0.5 (critical×4, high×3, medium×2, low×1)
 * - Base score: 1 (to avoid zero weights)
 * 
 * Note: Complexity is NOT included here to avoid double-counting since it's 
 * already weighted at 45% in the file health score calculation.
 */
export function calculateFileCriticismScore(file: FileDetail): number {
  const impactWeight = 2.0;
  const issueWeight = 0.5;
  
  // Calculate impact based on dependency metrics
  const impact = (file.dependencies?.incomingDependencies || 0) + 
                 (file.dependencies?.outgoingDependencies || 0) + 
                 (file.dependencies?.isInCycle ? 5 : 0); // Penalty for circular dependencies
  
  // Use actual issues array instead of approximation - synchronized with calculateFileHealthScore
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