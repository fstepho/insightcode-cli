// analyzer/OverviewCalculator.ts - Centralized overview calculation

import { Overview, FileDetail, validateScore } from '../types';
import { 
  calculateFileComplexityScore, 
  calculateDuplicationScore, 
  calculateFileMaintainabilityScore, 
  calculateProjectWeightedScore,
  calculateFileCriticismScore 
} from '../scoring';
import { getGrade, isCriticalFile, GRADE_CONFIG, COMPLEXITY_LEVELS, getDuplicationThreshold } from '../scoring.utils';

/**
 * Calculates comprehensive overview from file details
 */
export class OverviewCalculator {
  
  static calculate(fileDetails: FileDetail[], duplicationMode: 'strict' | 'legacy' = 'legacy'): Overview {
    if (fileDetails.length === 0) {
      return this.createEmptyOverview();
    }

    const scores = this.calculateComponentScores(fileDetails, duplicationMode);
    const statistics = this.calculateStatistics(fileDetails);
    
    return {
      grade: getGrade(scores.overall),
      statistics,
      scores,
      summary: this.generateSummary(scores.overall, fileDetails.filter(f => isCriticalFile(f.healthScore)).length)
    };
  }
  
  /**
   * Calculates overview metrics using criticism-based weighted scoring.
   * 
   * METHODOLOGY:
   * 1. Each file gets a "criticism score" based on:
   *    - Dependency impact (weight: 2.0) - most critical factor
   *    - Complexity (weight: 1.0) - maintainability predictor  
   *    - Issue indicators (weight: 0.5) - quality markers
   *    
   * 2. Files with higher criticism scores contribute more to final project scores
   *    (Pareto principle: 20% of files often cause 80% of problems)
   * 
   * 3. Final project score combines three dimensions:
   *    - Complexity: 45% (primary defect predictor hypothesis)
   *    - Maintainability: 30% (development velocity impact)
   *    - Duplication: 25% (technical debt indicator)
   * 
   * NOTE: No outlier masking - extreme values receive extreme penalties
   */
  private static calculateComponentScores(fileDetails: FileDetail[], duplicationMode: 'strict' | 'legacy' = 'legacy') : {
    complexity: number;
    duplication: number;
    maintainability: number;
    overall: number;
  } {
    // Calculate weighted scores using criticism-based approach
    let weightedComplexityScore = 0;
    let weightedDuplicationScore = 0;
    let weightedMaintainabilityScore = 0;
    let totalCriticismScore = 0;

    // First pass: calculate total criticism score
    fileDetails.forEach(file => {
      const criticismScore = calculateFileCriticismScore(file);
      totalCriticismScore += criticismScore;
    });

    // Second pass: calculate weighted scores
    if (totalCriticismScore > 0) {
      fileDetails.forEach(file => {
        const fileCriticismScore = calculateFileCriticismScore(file);
        const fileWeight = fileCriticismScore / totalCriticismScore;
        
        weightedComplexityScore += calculateFileComplexityScore(file.metrics.complexity) * fileWeight;
        weightedDuplicationScore += calculateDuplicationScore(file.metrics.duplicationRatio, duplicationMode) * fileWeight;
        weightedMaintainabilityScore += calculateFileMaintainabilityScore(file.metrics.loc, file.metrics.functionCount) * fileWeight;
      });
    } else {
      // Fallback to simple averages
      weightedComplexityScore = fileDetails.reduce((sum, f) => sum + calculateFileComplexityScore(f.metrics.complexity), 0) / fileDetails.length;
      weightedDuplicationScore = fileDetails.reduce((sum, f) => sum + calculateDuplicationScore(f.metrics.duplicationRatio, duplicationMode), 0) / fileDetails.length;
      weightedMaintainabilityScore = fileDetails.reduce((sum, f) => sum + calculateFileMaintainabilityScore(f.metrics.loc, f.metrics.functionCount), 0) / fileDetails.length;
    }
    
    weightedComplexityScore = validateScore(weightedComplexityScore);
    weightedDuplicationScore = validateScore(weightedDuplicationScore);
    weightedMaintainabilityScore = validateScore(weightedMaintainabilityScore);

    const overallScore = validateScore(calculateProjectWeightedScore(
      weightedComplexityScore,
      weightedDuplicationScore,
      weightedMaintainabilityScore
    ));

    return {
      complexity: weightedComplexityScore,
      duplication: weightedDuplicationScore,
      maintainability: weightedMaintainabilityScore,
      overall: overallScore
    };
  }
  
  /**
   * Calculate criticism score for a file
   * Higher score = more problematic file = more weight in final scores
   * 
   * Synchronized with calculateFileHealthScore to use actual file.issues array
   * instead of approximating issue count from metrics.
   * 
   * Weights:
   * - Impact (dependencies): 2.0 (most important)
   * - Complexity: 1.0 
   * - Weighted issues by severity: 0.5 (critical×4, high×3, medium×2, low×1)
   * - Base score: 1 (to avoid zero weights)
   */
  
  /**
   * Calculates file statistics
   */
  private static calculateStatistics(fileDetails: FileDetail[]) {
    const totalFiles = fileDetails.length;
    const totalLOC = fileDetails.reduce((sum, file) => sum + file.metrics.loc, 0);
    const totalComplexity = fileDetails.reduce((sum, file) => sum + file.metrics.complexity, 0);
    
    const avgComplexity = totalFiles > 0 ? Math.round(totalComplexity / totalFiles * 100) / 100 : 0;
    const avgLOC = totalFiles > 0 ? Math.round(totalLOC / totalFiles) : 0;
    const avgDuplicationRatio = totalFiles > 0 
      ? fileDetails.reduce((sum, file) => sum + file.metrics.duplicationRatio, 0) / totalFiles
      : 0;

    return {
      totalFiles,
      totalLOC,
      avgComplexity,
      avgLOC,
      avgDuplicationRatio
    };
  }
  
  /**
   * Creates default overview for empty projects
   */
  private static createEmptyOverview(): Overview {
    return {
      grade: GRADE_CONFIG[GRADE_CONFIG.length - 1].grade, // Use lowest grade from config
      statistics: {
        totalFiles: 0,
        totalLOC: 0,
        avgComplexity: 0,
        avgLOC: 0,
        avgDuplicationRatio: 0
      },
      scores: {
        complexity: 0, 
        duplication: 0,
        maintainability: 0,
        overall: 0
      },
      summary: 'No files to analyze'
    };
  }
  
  /**
   * Generates human-readable summary
   */
  private static generateSummary(overallScore: number, criticalCount: number): string {
    const grade = getGrade(overallScore);
    if (criticalCount === 0) {
      return `Excellent code health with grade ${grade}`;
    }
    if (criticalCount === 1) {
      return `Good overall health with 1 file requiring attention`;
    }
    return `${criticalCount} critical files found requiring attention`;
  }
}