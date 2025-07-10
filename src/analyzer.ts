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
// generateRecommendations removed in v0.6.0 - calculable client-side

// ==================== V0.6.0 CORE FUNCTIONS ====================

// Health score calculation moved to scoring.ts

/**
 * Checks if a file is critical based on health score
 */
function isCriticalFile(file: FileDetail): boolean {
  return file.healthScore < 80;
}

/**
 * Checks if a file is in the critical path (top 10% by usage)
 */
function isCriticalPath(file: FileDetail, allFiles: FileDetail[]): boolean {
  const sortedByUsage = [...allFiles].sort((a, b) => b.dependencies.incomingCount - a.dependencies.incomingCount);
  const topTenPercentCount = Math.ceil(sortedByUsage.length * 0.1);
  return sortedByUsage.slice(0, topTenPercentCount).includes(file);
}

/**
 * Calculates usage rank percentile for a file
 */
function calculateUsageRank(file: FileDetail, allFiles: FileDetail[]): number {
  if (allFiles.length <= 1) return 0;
  
  // Sort all files by incomingCount
  const sorted = [...allFiles].sort((a, b) => a.dependencies.incomingCount - b.dependencies.incomingCount);
  
  // Find position of current file
  const position = sorted.findIndex(f => f.file === file.file);
  
  // Calculate percentile (0 = least used, 100 = most used)
  const percentile = Math.round((position / (sorted.length - 1)) * 100);
  return isNaN(percentile) ? 0 : percentile;
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
  
  // 5. Recommendations removed in v0.6.0 - calculable client-side
  
  return {
    context,
    overview,
    details: processedDetails
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
    file.dependencies.incomingCount = dependencyMap.get(file.file) || 0;
  });
  
  // 4. Calculate usage ranks
  filesWithDuplication.forEach(file => {
    file.dependencies.percentile = calculateUsageRank(file, filesWithDuplication);
  });
  
  // 5. Mark critical path files (top 10% by usage)
  const sortedByUsage = [...filesWithDuplication].sort((a, b) => b.dependencies.incomingCount - a.dependencies.incomingCount);
  const top10Percent = Math.ceil(filesWithDuplication.length * 0.1);
  sortedByUsage.slice(0, top10Percent).forEach(file => {
    // isCriticalPath is now calculated on demand based on top 10% usage
  });
  
  // 6. Calculate health scores
  filesWithDuplication.forEach(file => {
    file.healthScore = validateScore(calculateHealthScore(file));
  });
  
  // 7. Mark critical files
  
  return filesWithDuplication;
}

/**
 * Calculates overview metrics from processed details
 */
function calculateOverview(details: FileDetail[]): Overview {
  if (details.length === 0) {
    return {
      grade: 'F',
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
    return sum + (f.dependencies.incomingCount * impactWeight) + (f.metrics.complexity * complexityWeight) + (f.issues.length * issueWeight) + 1;
  }, 0);
  
  let weightedComplexityScore = 0;
  let weightedDuplicationScore = 0;
  let weightedMaintainabilityScore = 0;
  
  if (totalCriticismScore > 0) {
    for (const file of details) {
      const criticismScore = (file.dependencies.incomingCount * 2.0) + (file.metrics.complexity * 1.0) + (file.issues.length * 0.5) + 1;
      const weight = criticismScore / totalCriticismScore;
      weightedComplexityScore += calculateComplexityScore(file.metrics.complexity) * weight;
      weightedDuplicationScore += calculateDuplicationScore(file.metrics.duplicationRatio) * weight;
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
  
  const criticalCount = details.filter(f => isCriticalFile(f)).length;
  
  const overview: Overview = {
    grade,
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
      repository: typeof projectInfo.packageJson?.repository === 'string' ? projectInfo.packageJson.repository : undefined
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