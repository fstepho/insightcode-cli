// src/fileScoring.ts

import { FileMetrics, Issue } from './types';
import { DEFAULT_THRESHOLDS } from './parser';
import { calculateComplexityScore, calculateDuplicationScore, calculateMaintainabilityScore, calculateWeightedScore } from './scoring';

/**
 * Calculate a criticality score for each file based on its issues
 * Enriches FileMetrics with scoring information and returns sorted by totalScore
 */
export function calculateFileScores(files: FileMetrics[]): FileMetrics[] {
  // Calculate scores for ALL files and enhance issues with ratios (for global scoring)
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
    const complexityThreshold = DEFAULT_THRESHOLDS.complexity[fileType]?.high || DEFAULT_THRESHOLDS.complexity.production.high;
    const complexityRatio = file.complexity / complexityThreshold;
    const sizeRatio = file.loc / sizeThreshold;
    
    // Enhance issues with ratio information for proper display
    const enhancedIssues: Issue[] = file.issues.map(issue => {
      if (issue.type === 'complexity') {
        return {
          ...issue,
          ratio: complexityRatio
        };
      } else if (issue.type === 'size') {
        return {
          ...issue,
          ratio: sizeRatio
        };
      }
      return issue; // Duplication issues already have proper structure
    });
    
    // Return file with scoring information
    return {
      ...file,
      issues: enhancedIssues,
      totalScore,
      complexityRatio: Math.round(complexityRatio * 100) / 100,
      sizeRatio: Math.round(sizeRatio * 100) / 100
    };
  });
  
  // Sort by total score descending and return ALL files (for global scoring)
  return filesWithScores.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Get top critical files with issues for display in reporter
 */
export function getTopCriticalFiles(files: FileMetrics[], limit: number = 5): FileMetrics[] {
  // First enhance all files with scores and ratios
  const filesWithScores = calculateFileScores(files);
  
  // Filter only files with critical issues (high severity issues)
  const criticalFiles = filesWithScores.filter(file => 
    file.issues.some(issue => issue.severity === 'high')
  );
  
  // Calculate criticality score for ranking (higher = more critical)
  const filesWithCriticalityScore = criticalFiles.map(file => {
    let criticalityScore = 0;
    
    // Add points for high complexity issues
    const complexityIssue = file.issues.find(i => i.type === 'complexity' && i.severity === 'high');
    if (complexityIssue && complexityIssue.ratio) {
      criticalityScore += Math.min(complexityIssue.ratio * 100, 1000);
    }
    
    // Add points for high size issues
    const sizeIssue = file.issues.find(i => i.type === 'size' && i.severity === 'high');
    if (sizeIssue && sizeIssue.ratio) {
      criticalityScore += Math.min(sizeIssue.ratio * 50, 500);
    }
    
    // Add points for high duplication
    const duplicationIssue = file.issues.find(i => i.type === 'duplication' && i.severity === 'high');
    if (duplicationIssue) {
      criticalityScore += duplicationIssue.value * 2;
    }
    
    return {
      ...file,
      criticalityScore
    };
  });
  
  // Sort by criticality score descending (most critical first) and take top N
  return filesWithCriticalityScore
    .sort((a, b) => b.criticalityScore - a.criticalityScore)
    .slice(0, limit)
    .map(({ criticalityScore, ...file }) => file); // Remove temporary field
}

