// File: src/scoring.ts

/**
 * Shared scoring calculations for consistency between analyzer and reporter
 */
import { getConfig } from './config';

/**
 * Get human-readable label for complexity values
 */
export function getComplexityLabel(complexity: number): string {
  const config = getConfig();
  if (complexity <= config.complexity.excellent) return 'Low';
  if (complexity <= config.complexity.acceptable) return 'Medium';
  if (complexity <= config.complexity.veryPoor) return 'High';
  if (complexity <= 200) return 'Very High';
  return 'Extreme';
}

/**
 * Get human-readable label for duplication values
 */
export function getDuplicationLabel(duplication: number): string {
  const config = getConfig();
  if (duplication <= config.duplication.excellent) return 'Low';
  if (duplication <= config.duplication.good) return 'Medium';
  if (duplication <= config.duplication.acceptable) return 'High';
  return 'Very High';
}

/**
 * Get human-readable label for maintainability scores
 */
export function getMaintainabilityLabel(score: number): string {
  const config = getConfig();
  if (score >= config.maintainabilityLabels.good) return 'Good';
  if (score >= config.maintainabilityLabels.acceptable) return 'Acceptable';
  if (score >= config.maintainabilityLabels.poor) return 'Poor';
  return 'Very Poor';
}

/**
 * Calculate complexity score with graduated penalties
 */
export function calculateComplexityScore(complexity: number): number {
  const config = getConfig();
  if (complexity <= config.complexity.excellent) return 100;
  if (complexity <= config.complexity.good) return 85;
  if (complexity <= config.complexity.acceptable) return 65;
  if (complexity <= config.complexity.poor) return 40;
  if (complexity <= config.complexity.veryPoor) return 20;
  return Math.max(5, 20 - (complexity - config.complexity.veryPoor) / 20);
}

/**
 * Calculate duplication score with industry-aligned strict thresholds
 */
export function calculateDuplicationScore(duplication: number): number {
  const config = getConfig();
  if (duplication <= config.duplication.excellent) return 100;
  if (duplication <= config.duplication.good) return 85;
  if (duplication <= config.duplication.acceptable) return 65;
  if (duplication <= config.duplication.poor) return 40;
  if (duplication <= config.duplication.veryPoor) return 20;
  return Math.max(5, 20 - (duplication - config.duplication.veryPoor) / 10);
}

/**
 * Calculate maintainability score based on file size and structure
 */
export function calculateMaintainabilityScore(
  avgLoc: number, 
  avgFunctions: number,
  maxLoc: number = 0  // Optional: worst file penalty
): number {
  const config = getConfig();
  
  // Score based on average file size
  let sizeScore: number;
  if (avgLoc <= config.fileSize.excellent) sizeScore = 100;
  else if (avgLoc <= config.fileSize.good) sizeScore = 85;
  else if (avgLoc <= config.fileSize.acceptable) sizeScore = 70;
  else if (avgLoc <= config.fileSize.poor) sizeScore = 50;
  else if (avgLoc <= config.fileSize.veryPoor) sizeScore = 30;
  else sizeScore = Math.max(10, 30 - (avgLoc - config.fileSize.veryPoor) / 50);
  
  // Score based on functions per file
  let functionScore: number;
  if (avgFunctions <= config.functionCount.excellent) functionScore = 100;
  else if (avgFunctions <= config.functionCount.good) functionScore = 85;
  else if (avgFunctions <= config.functionCount.acceptable) functionScore = 70;
  else if (avgFunctions <= config.functionCount.poor) functionScore = 50;
  else functionScore = Math.max(10, 50 - (avgFunctions - config.functionCount.poor) * 2);
  
  // Penalty for extreme files (optional)
  let extremePenalty = 0;
  if (maxLoc > config.extremeFilePenalties.massiveFileThreshold) extremePenalty = config.extremeFilePenalties.massiveFilePenalty;
  else if (maxLoc > config.extremeFilePenalties.largeFileThreshold) extremePenalty = config.extremeFilePenalties.largeFilePenalty;
  
  return Math.max(0, (sizeScore + functionScore) / 2 - extremePenalty);
}

/**
 * Calculate weighted score from individual component scores
 * Single source of truth for 40/30/30 philosophy
 */
export function calculateWeightedScore(
  complexityScore: number,
  duplicationScore: number, 
  maintainabilityScore: number
): number {
  // Weighted average (40% complexity, 30% duplication, 30% maintainability)
  return complexityScore * 0.4 + duplicationScore * 0.3 + maintainabilityScore * 0.3;
}

/**
 * Calculate overall score based on metrics (0-100, higher is better)
 * Now with proper avgFunctions parameter
 */
export function calculateScore(
  complexity: number, 
  duplication: number, 
  avgLoc: number,
  avgFunctions: number
): number {
  // Calculate component scores with graduated thresholds
  const complexityScore = calculateComplexityScore(complexity);
  const duplicationScore = calculateDuplicationScore(duplication);
  const maintainabilityScore = calculateMaintainabilityScore(avgLoc, avgFunctions);
  
  // Use centralized weighting function
  return calculateWeightedScore(complexityScore, duplicationScore, maintainabilityScore);
}

/**
 * Get letter grade from score
 */
export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  const config = getConfig();
  if (score >= config.grades.A) return 'A';
  if (score >= config.grades.B) return 'B';
  if (score >= config.grades.C) return 'C';
  if (score >= config.grades.D) return 'D';
  return 'F';
}

/**
 * Get color level for complexity values (for consistent coloring)
 * Aligned with getSeverityLabel ratios in reporter
 */
export function getComplexityColorLevel(complexity: number): 'green' | 'yellow' | 'red' | 'redBold' {
  const config = getConfig();
  if (complexity <= config.complexity.excellent) return 'green';
  if (complexity <= config.complexity.acceptable) return 'yellow';
  if (complexity <= config.complexity.veryPoor) return 'red';
  return 'redBold';
}

/**
 * Get color level for duplication values (for consistent coloring)
 */
export function getDuplicationColorLevel(duplication: number): 'green' | 'yellow' | 'red' | 'redBold' {
  const config = getConfig();
  if (duplication <= config.duplication.excellent) return 'green';
  if (duplication <= config.duplication.good) return 'yellow';
  if (duplication <= config.duplication.acceptable) return 'red';
  return 'redBold';
}

/**
 * Get color level for maintainability scores (for consistent coloring)
 */
export function getMaintainabilityColorLevel(score: number): 'green' | 'yellow' | 'red' | 'redBold' {
  const config = getConfig();
  if (score >= config.maintainabilityLabels.good) return 'green';
  if (score >= config.maintainabilityLabels.acceptable) return 'yellow';
  if (score >= config.maintainabilityLabels.poor) return 'red';
  return 'redBold';
}

/**
 * Get color level for severity ratios (for issue display)
 */
export function getSeverityColorLevel(ratio: number): 'green' | 'yellow' | 'red' | 'redBold' {
  if (ratio >= 100) return 'redBold';  // Extreme
  if (ratio >= 50) return 'redBold';   // Very High  
  if (ratio >= 10) return 'red';       // High
  if (ratio >= 2.5) return 'yellow';   // Medium
  return 'green';                      // Low
}