// File: src/analyzer.ts - v0.6.0 Complete Refactor

import { 
  AnalysisResult, 
  FileDetail, 
  Context, 
  Overview, 
  ThresholdConfig,
  validateScore
} from './types';
import { analyzeDependencies } from './dependencyAnalyzer';
import { detectDuplication } from './duplication';
import { getProjectInfo } from './projectInfo';
import { getConfig } from './config';
import { normalizeProjectPath } from './utils';
import { 
  calculateComplexityScore, 
  calculateDuplicationScore, 
  calculateMaintainabilityScore, 
  calculateWeightedScore, 
  getGrade,
  calculateHealthScore 
} from './scoring';
import { generateRecommendations } from './recommendations';

// ==================== V0.6.0 CORE FUNCTIONS ====================

// Health score calculation moved to scoring.ts

/**
 * Marks the top 5 problematic files as critical
 */
function markCriticalFiles(details: FileDetail[]): void {
  // Sort by health score (worst first)
  const sorted = [...details].sort((a, b) => a.healthScore - b.healthScore);
  
  // Mark top 5 as critical, but only files with health score < 80
  sorted.slice(0, 5).forEach(file => {
    if (file.healthScore < 80) {
      file.isCritical = true;
    }
  });
}

/**
 * Calculates usage rank percentile for a file
 */
function calculateUsageRank(file: FileDetail, allFiles: FileDetail[]): number {
  if (allFiles.length <= 1) return 0;
  
  // Sort all files by usageCount
  const sorted = [...allFiles].sort((a, b) => a.importance.usageCount - b.importance.usageCount);
  
  // Find position of current file
  const position = sorted.findIndex(f => f.file === file.file);
  
  // Calculate percentile (0 = least used, 100 = most used)
  const percentile = Math.round((position / (sorted.length - 1)) * 100);
  return isNaN(percentile) ? 0 : percentile;
}

/**
 * Maps overall score to health status
 */
function getHealthStatus(overallScore: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (overallScore >= 90) return 'excellent';
  if (overallScore >= 80) return 'good';
  if (overallScore >= 70) return 'fair';
  if (overallScore >= 60) return 'poor';
  return 'critical';
}

/**
 * Generates human-readable summary
 */
function generateSummary(overview: Overview, criticalCount: number): string {
  if (criticalCount === 0) {
    return `Excellent code health with grade ${overview.grade}`;
  }
  if (criticalCount === 1) {
    return `Good overall health with 1 file requiring attention`;
  }
  return `${criticalCount} critical issues found in core modules`;
}


// Issue generation moved to parser.ts - no more legacy conversion needed

// ==================== MAIN ANALYSIS FUNCTION ====================

/**
 * The main analysis function for v0.6.0 - Complete refactor
 */
export function analyze(files: FileDetail[], projectPath: string, _thresholds: ThresholdConfig): AnalysisResult {
  const startTime = Date.now();
  
  // 1. Calculate all metrics and relationships
  const processedDetails = processFileDetails(files);
  
  // 3. Calculate overview scores
  const overview = calculateOverview(processedDetails);
  
  // 4. Generate context
  const context = generateContext(projectPath, processedDetails, startTime);
  
  // 5. Generate recommendations
  const recommendations = generateRecommendations(processedDetails);
  
  return {
    context,
    overview,
    details: processedDetails,
    recommendations
  };
}


/**
 * Processes file details to calculate all derived metrics
 */
function processFileDetails(details: FileDetail[]): FileDetail[] {
  // 1. Detect duplication
  const filesWithDuplication = detectDuplication(details, getConfig());
  
  // 2. Analyze dependencies
  const dependencyMap = analyzeDependencies(filesWithDuplication);
  
  // 3. Update usage counts from dependency analysis
  filesWithDuplication.forEach(file => {
    file.importance.usageCount = dependencyMap.get(file.file) || 0;
  });
  
  // 4. Calculate usage ranks
  filesWithDuplication.forEach(file => {
    file.importance.usageRank = calculateUsageRank(file, filesWithDuplication);
  });
  
  // 5. Mark critical path files (top 10% by usage)
  const sortedByUsage = [...filesWithDuplication].sort((a, b) => b.importance.usageCount - a.importance.usageCount);
  const top10Percent = Math.ceil(filesWithDuplication.length * 0.1);
  sortedByUsage.slice(0, top10Percent).forEach(file => {
    file.importance.isCriticalPath = true;
  });
  
  // 6. Calculate health scores
  filesWithDuplication.forEach(file => {
    file.healthScore = validateScore(calculateHealthScore(file));
  });
  
  // 7. Mark critical files
  markCriticalFiles(filesWithDuplication);
  
  return filesWithDuplication;
}

/**
 * Calculates overview metrics from processed details
 */
function calculateOverview(details: FileDetail[]): Overview {
  if (details.length === 0) {
    return {
      grade: 'F',
      health: 'critical',
      statistics: {
        totalFiles: 0,
        totalLOC: 0,
        avgComplexity: 0,
        avgLOC: 0
      },
      scores: {
        complexity: 0,
        duplication: 0,
        maintainability: 0,
        overall: 0
      },
      summary: 'No files analyzed'
    };
  }
  
  // Calculate statistics
  const totalLOC = details.reduce((sum, f) => sum + f.metrics.loc, 0);
  const avgComplexity = details.reduce((sum, f) => sum + f.metrics.complexity, 0) / details.length;
  const avgLOC = totalLOC / details.length;
  
  // Calculate weighted scores using criticality weighting
  const totalCriticismScore = details.reduce((sum, f) => {
    const complexityWeight = 1.0;
    const impactWeight = 2.0;
    const issueWeight = 0.5;
    return sum + (f.importance.usageCount * impactWeight) + (f.metrics.complexity * complexityWeight) + (f.issues.length * issueWeight) + 1;
  }, 0);
  
  let weightedComplexityScore = 0;
  let weightedDuplicationScore = 0;
  let weightedMaintainabilityScore = 0;
  
  if (totalCriticismScore > 0) {
    for (const file of details) {
      const criticismScore = (file.importance.usageCount * 2.0) + (file.metrics.complexity * 1.0) + (file.issues.length * 0.5) + 1;
      const weight = criticismScore / totalCriticismScore;
      weightedComplexityScore += calculateComplexityScore(file.metrics.complexity) * weight;
      weightedDuplicationScore += calculateDuplicationScore(file.metrics.duplication * 100) * weight; // Convert to percentage for scoring
      weightedMaintainabilityScore += calculateMaintainabilityScore(file.metrics.loc, file.metrics.functionCount) * weight;
    }
  } else {
    weightedComplexityScore = 100;
    weightedDuplicationScore = 100;
    weightedMaintainabilityScore = 100;
  }
  
  const complexityScore = validateScore(weightedComplexityScore);
  const duplicationScore = validateScore(weightedDuplicationScore);
  const maintainabilityScore = validateScore(weightedMaintainabilityScore);
  const overallScore = validateScore(calculateWeightedScore(complexityScore, duplicationScore, maintainabilityScore));
  
  const grade = getGrade(overallScore);
  const health = getHealthStatus(overallScore);
  
  const criticalCount = details.filter(f => f.isCritical).length;
  
  const overview: Overview = {
    grade,
    health,
    statistics: {
      totalFiles: details.length,
      totalLOC,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      avgLOC: Math.round(avgLOC)
    },
    scores: {
      complexity: complexityScore,
      duplication: duplicationScore,
      maintainability: maintainabilityScore,
      overall: overallScore
    },
    summary: '' // Will be set after overview creation
  };
  
  // Set summary after overview is created
  overview.summary = generateSummary(overview, criticalCount);
  
  return overview;
}

/**
 * Generates context information
 */
function generateContext(projectPath: string, details: FileDetail[], startTime: number): Context {
  const projectInfo = getProjectInfo(projectPath);
  const endTime = Date.now();
  
  return {
    project: {
      name: projectInfo.name,
      path: normalizeProjectPath(projectInfo.path),
      version: projectInfo.packageJson?.version,
      repository: typeof (projectInfo.packageJson as any)?.repository === 'string' ? (projectInfo.packageJson as any).repository : undefined
    },
    analysis: {
      timestamp: new Date().toISOString(),
      durationMs: endTime - startTime,
      toolVersion: '0.6.0',
      filesAnalyzed: details.length
    }
  };
}

// Recommendations generation moved to recommendations.ts