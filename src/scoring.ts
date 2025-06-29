/**
 * Shared scoring calculations for consistency between analyzer and reporter
 */

/**
 * Calculate complexity score with graduated penalties
 */
export function calculateComplexityScore(complexity: number): number {
  if (complexity <= 10) return 100;
  if (complexity <= 15) return 85;
  if (complexity <= 20) return 65;
  if (complexity <= 30) return 40;
  if (complexity <= 50) return 20;
  return Math.max(5, 20 - (complexity - 50) / 20);
}

/**
 * Calculate duplication score with industry-aligned strict thresholds
 */
export function calculateDuplicationScore(duplication: number): number {
  if (duplication <= 3) return 100;   // Excellent - industry leader level
  if (duplication <= 8) return 85;    // Good - industry standard
  if (duplication <= 15) return 65;   // Acceptable - pragmatic threshold
  if (duplication <= 30) return 40;   // Needs attention
  if (duplication <= 50) return 20;   // High
  return Math.max(5, 20 - (duplication - 50) / 10); // Critical
}

/**
 * Calculate maintainability score based on file size and structure
 */
export function calculateMaintainabilityScore(
  avgLoc: number, 
  avgFunctions: number,
  maxLoc: number = 0  // Optional: worst file penalty
): number {
  // Score based on average file size
  let sizeScore: number;
  if (avgLoc <= 200) sizeScore = 100;
  else if (avgLoc <= 300) sizeScore = 85;
  else if (avgLoc <= 400) sizeScore = 70;
  else if (avgLoc <= 500) sizeScore = 50;
  else if (avgLoc <= 750) sizeScore = 30;
  else sizeScore = Math.max(10, 30 - (avgLoc - 750) / 50);
  
  // Score based on functions per file
  let functionScore: number;
  if (avgFunctions <= 10) functionScore = 100;
  else if (avgFunctions <= 15) functionScore = 85;
  else if (avgFunctions <= 20) functionScore = 70;
  else if (avgFunctions <= 30) functionScore = 50;
  else functionScore = Math.max(10, 50 - (avgFunctions - 30) * 2);
  
  // Penalty for extreme files (optional)
  let extremePenalty = 0;
  if (maxLoc > 1000) extremePenalty = 10;
  if (maxLoc > 2000) extremePenalty = 20;
  
  return Math.max(0, (sizeScore + functionScore) / 2 - extremePenalty);
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
  
  // Weighted average (40% complexity, 30% duplication, 30% maintainability)
  return complexityScore * 0.4 + duplicationScore * 0.3 + maintainabilityScore * 0.3;
}

/**
 * Get letter grade from score
 */
export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}