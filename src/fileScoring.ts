// src/fileScoring.ts

import { FileMetrics } from './types';
import { DEFAULT_THRESHOLDS } from './parser';
import { calculateComplexityScore, calculateDuplicationScore, calculateMaintainabilityScore, calculateWeightedScore } from './scoring';

/**
 * Calculate a criticality score for each file based on its issues
 * Enriches FileMetrics with scoring information and returns sorted by totalScore
 */
export function calculateFileScores(files: FileMetrics[]): FileMetrics[] {
  // Calculate scores for all files using the same logic as global scoring
  const filesWithScores = files.map(file => {
    // Calculate individual scores using shared functions (40/30/30 philosophy)
    const complexityScore = calculateComplexityScore(file.complexity);
    const duplicationScore = calculateDuplicationScore(file.duplication);
    const maintainabilityScore = calculateMaintainabilityScore(file.loc, file.functionCount);
    
    // Calculate weighted total score using centralized function
    const totalScore = Math.round(
      calculateWeightedScore(complexityScore, duplicationScore, maintainabilityScore)
    );
    
    // Calculate ratios for display
    const fileType = file.fileType || 'production';
    const sizeThreshold = DEFAULT_THRESHOLDS.size[fileType]?.high || DEFAULT_THRESHOLDS.size.production.high;
    const complexityRatio = file.complexity / 20; // Standard threshold
    const sizeRatio = file.loc / sizeThreshold;
    
    // Return file with scoring information
    return {
      ...file,
      totalScore,
      complexityRatio: Math.round(complexityRatio * 100) / 100,
      sizeRatio: Math.round(sizeRatio * 100) / 100
    };
  });
  
  // Sort by total score descending and return
  return filesWithScores.sort((a, b) => b.totalScore - a.totalScore);
}

