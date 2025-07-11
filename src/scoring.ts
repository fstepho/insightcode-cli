// File: src/scoring.ts

import { Issue } from './types';
import {
  SCORING_WEIGHTS,
  DUPLICATION_SCORING_THRESHOLDS,
  MAINTAINABILITY_SCORING_THRESHOLDS,
  COMPLEXITY_LABEL_THRESHOLDS,
  DUPLICATION_LABEL_THRESHOLDS,
  COMPLEXITY_COLOR_THRESHOLDS,
  DUPLICATION_COLOR_THRESHOLDS,
  HEALTH_PENALTY_CONSTANTS,
  MAINTAINABILITY_COLOR_THRESHOLDS,
  SEVERITY_COLOR_THRESHOLDS
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

export function getDuplicationLabel(duplication: number): string {
  // Aligned with constants.ts thresholds (15/30/50)
  if (duplication <= DUPLICATION_LABEL_THRESHOLDS.LOW) return 'Low';
  if (duplication <= DUPLICATION_LABEL_THRESHOLDS.MEDIUM) return 'Medium';
  if (duplication <= DUPLICATION_LABEL_THRESHOLDS.HIGH) return 'High';
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
 * - McCabe (1976): complexity <= 10 for good code
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
  // Phase 1: McCabe "good" threshold - excellent code
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
 * Converts duplication ratio to a score from 0 to 100 according to industry standards.
 * 
 * RESEARCH BASIS: Config alignment - ≤15% duplication is acceptable,
 * >30% is concerning, >50% requires immediate attention.
 */
export function calculateDuplicationScore(duplicationRatio: number): number {
  const percentage = ratioToPercentage(duplicationRatio);
  
  // Config threshold: <= 15% duplication is considered acceptable  
  if (percentage <= DUPLICATION_SCORING_THRESHOLDS.EXCELLENT) return 100;
  
  // Exponential decay beyond 15%, calibrated for 30% (high) and 50% (critical)
  // At 30%: ~70 score, at 50%: ~30 score
  const score = 100 * Math.exp(
    -DUPLICATION_SCORING_THRESHOLDS.EXPONENTIAL_MULTIPLIER * 
    Math.pow(percentage - DUPLICATION_SCORING_THRESHOLDS.EXCELLENT, DUPLICATION_SCORING_THRESHOLDS.EXPONENTIAL_POWER)
  );
  return Math.max(0, Math.round(score));
}

/**
 * Calcule un score de maintenabilité de 0 à 100 basé sur les métriques de taille.
 * 
 * RESEARCH BASIS: Martin (2008) Clean Code suggests files should be small.
 * Industry consensus: < 200 LOC is good, 300+ becomes harder to maintain.
 */
export function calculateMaintainabilityScore(fileLoc: number, fileFunctionCount: number): number {
  // Martin Clean Code threshold: <= 200 LOC is considered maintainable
  const sizeScore = fileLoc <= MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FILE_SIZE
    ? 100 
    : 100 * Math.exp(
        -MAINTAINABILITY_SCORING_THRESHOLDS.SIZE_PENALTY_MULTIPLIER * 
        Math.pow(fileLoc - MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FILE_SIZE, MAINTAINABILITY_SCORING_THRESHOLDS.SIZE_PENALTY_POWER)
      );

  // Score basé sur le nombre de fonctions
  const functionScore = fileFunctionCount <= MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FUNCTION_COUNT
    ? 100
    : 100 * Math.exp(
        -MAINTAINABILITY_SCORING_THRESHOLDS.FUNCTION_PENALTY_MULTIPLIER * 
        Math.pow(fileFunctionCount - MAINTAINABILITY_SCORING_THRESHOLDS.OPTIMAL_FUNCTION_COUNT, MAINTAINABILITY_SCORING_THRESHOLDS.FUNCTION_PENALTY_POWER)
      );
  
  return Math.max(0, Math.round((sizeScore + functionScore) / 2));
}

// --- Fonctions de scoring global et de grade (poids académiques) ---

/**
 * Calcule le score final pondéré selon les standards académiques.
 * 
 * WEIGHTS BASED ON EMPIRICAL RESEARCH:
 * - 45% Complexity: McCabe (1976) - Strong correlation with defect rate
 * - 30% Maintainability: Martin (2008) - Code structure impact on evolution
 * - 25% Duplication: Fowler (1999) - Refactoring debt indicator
 * 
 * These weights align with SonarQube methodology and ISO/IEC 25010 standards.
 */
export function calculateWeightedScore(
  complexityScore: number,
  duplicationScore: number, 
  maintainabilityScore: number
): number {
  return (complexityScore * SCORING_WEIGHTS.COMPLEXITY) + 
         (maintainabilityScore * SCORING_WEIGHTS.MAINTAINABILITY) + 
         (duplicationScore * SCORING_WEIGHTS.DUPLICATION);
}


// --- Fonctions de coloration (alignées sur les seuils recherche) ---

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

function getDuplicationPenalty(duplicationRatio: number): number {
  const constants = HEALTH_PENALTY_CONSTANTS.DUPLICATION;
  
  // Aligned with constants.ts threshold of 15%
  if (duplicationRatio <= percentageToRatio(constants.EXCELLENT_THRESHOLD)) return 0;
  
  // Progressive penalty without artificial caps
  const percentage = ratioToPercentage(duplicationRatio);
  
  if (percentage <= constants.HIGH_THRESHOLD) {
    // Linear penalty up to 30%
    return (percentage - constants.EXCELLENT_THRESHOLD) * constants.LINEAR_MULTIPLIER;
  }
  
  // Exponential penalty beyond 30% - NO CAP!
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
  
  // Progressive penalty following Clean Code principles
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
 * Calcule le score de santé en utilisant des pénalités progressives SANS CAPS.
 * Formule : 100 - Somme des Pénalités (sans plafonds artificiels).
 * Les valeurs extrêmes reçoivent des pénalités extrêmes conformes aux règles de l'art.
 * 
 * @param file Objet contenant les métriques et issues du fichier.
 * @returns Score de santé de 0 à 100.
 */
export function calculateHealthScore(file: { 
  metrics: { 
    complexity: number; 
    loc: number; 
    duplicationRatio: number;
  }; 
  issues: Issue[]; 
}): number {
  
  const complexityPenalty = getComplexityPenalty(file.metrics.complexity);
  const duplicationPenalty = getDuplicationPenalty(file.metrics.duplicationRatio);
  const sizePenalty = getSizePenalty(file.metrics.loc);
  const issuesPenalty = getIssuesPenalty(file.issues);
  
  const totalPenalty = complexityPenalty + duplicationPenalty + sizePenalty + issuesPenalty;
  
  return Math.max(0, Math.round(100 - totalPenalty));
}