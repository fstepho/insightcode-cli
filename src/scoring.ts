// File: src/scoring.ts

/**
 * Contains pure, self-contained functions for calculating scores from raw metrics.
 * The thresholds used here are based on academic and empirical research and are not user-configurable.
 */

/**
 * Get human-readable label for complexity values.
 */
export function getComplexityLabel(complexity: number): string {
  if (complexity <= 10) return 'Low';
  if (complexity <= 20) return 'Medium';
  if (complexity <= 50) return 'High';
  if (complexity <= 200) return 'Very High';
  return 'Extreme';
}

/**
 * Get human-readable label for duplication values.
 */
export function getDuplicationLabel(duplication: number): string {
  if (duplication <= 3) return 'Low';
  if (duplication <= 8) return 'Medium';
  if (duplication <= 15) return 'High';
  return 'Very High';
}

/**
 * Get human-readable label for maintainability scores.
 */
export function getMaintainabilityLabel(score: number): string {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Acceptable';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
}

/**
 * Converts a raw cyclomatic complexity value into a 0-100 score.
 */
export function calculateComplexityScore(complexity: number): number {
  if (complexity <= 10) return 100; // Excellent
  if (complexity <= 15) return 85;  // Good
  if (complexity <= 20) return 65;  // Acceptable
  if (complexity <= 30) return 40;  // Poor
  if (complexity <= 50) return 20;  // Very Poor
  // Gradual penalty for extreme values
  return Math.max(5, 20 - (complexity - 50) / 20);
}

/**
 * Converts a raw duplication percentage into a 0-100 score.
 */
export function calculateDuplicationScore(duplication: number): number {
  if (duplication <= 3) return 100;  // Excellent
  if (duplication <= 8) return 85;   // Good
  if (duplication <= 15) return 65;  // Acceptable
  if (duplication <= 30) return 40;  // Poor
  if (duplication <= 50) return 20;  // Very Poor
  // Gradual penalty for extreme values
  return Math.max(5, 20 - (duplication - 50) / 10);
}

/**
 * Calculates a 0-100 maintainability score based on file size and function count.
 */
export function calculateMaintainabilityScore(fileLoc: number, fileFunctionCount: number): number {
  // Score based on file size (Lines of Code)
  let sizeScore: number;
  if (fileLoc <= 200) sizeScore = 100;       // Excellent
  else if (fileLoc <= 300) sizeScore = 85;  // Good
  else if (fileLoc <= 400) sizeScore = 70;  // Acceptable
  else if (fileLoc <= 500) sizeScore = 50;  // Poor
  else if (fileLoc <= 750) sizeScore = 30;  // Very Poor
  else sizeScore = Math.max(10, 30 - (fileLoc - 750) / 50);

  // Score based on number of functions per file
  let functionScore: number;
  if (fileFunctionCount <= 10) functionScore = 100;      // Excellent
  else if (fileFunctionCount <= 15) functionScore = 85; // Good
  else if (fileFunctionCount <= 20) functionScore = 70; // Acceptable
  else if (fileFunctionCount <= 30) functionScore = 50; // Poor
  else functionScore = Math.max(10, 50 - (fileFunctionCount - 30) * 2);

  // The maintainability score is an average of the size and function scores.
  return Math.max(0, (sizeScore + functionScore) / 2);
}

/**
 * Calculates the final weighted score from the three component scores.
 * This defines the 40/30/30 philosophy of the tool.
 */
export function calculateWeightedScore(
  complexityScore: number,
  duplicationScore: number, 
  maintainabilityScore: number
): number {
  return (complexityScore * 0.4) + (duplicationScore * 0.3) + (maintainabilityScore * 0.3);
}

/**
 * Gets a letter grade from a final score.
 */
export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Gets a color level for complexity values, used for consistent terminal reporting.
 */
export function getComplexityColorLevel(complexity: number): 'green' | 'yellow' | 'red' | 'redBold' {
  if (complexity <= 10) return 'green';
  if (complexity <= 20) return 'yellow';
  if (complexity <= 50) return 'red';
  return 'redBold';
}

/**
 * Gets a color level for duplication values.
 */
export function getDuplicationColorLevel(duplication: number): 'green' | 'yellow' | 'red' | 'redBold' {
  if (duplication <= 3) return 'green';
  if (duplication <= 8) return 'yellow';
  if (duplication <= 15) return 'red';
  return 'redBold';
}

/**
 * Gets a color level for maintainability scores.
 */
export function getMaintainabilityColorLevel(score: number): 'green' | 'yellow' | 'red' | 'redBold' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  if (score >= 40) return 'red';
  return 'redBold';
}

/**
 * Gets a color level for severity ratios, used for displaying issues.
 */
export function getSeverityColorLevel(ratio: number): 'green' | 'yellow' | 'red' | 'redBold' {
  if (ratio >= 10) return 'redBold';  // Extreme (e.g., 10x the limit)
  if (ratio >= 5) return 'red';       // High
  if (ratio >= 2.5) return 'yellow';  // Medium
  return 'green';                     // Low
}
