// File: src/analyzer.ts - v0.6.0 Complete Refactor

import * as path from 'path';
import * as fs from 'fs';
import { 
  AnalysisResult, 
  FileDetail, 
  Context, 
  Overview, 
  ThresholdConfig,
  validateScore
} from './types';
import { enrichWithContext } from './contextExtractor';
import { detectDuplication } from './duplication';
import { getProjectInfo } from './projectInfo';
import { isCriticalFile, getGrade } from './scoring.utils';
import { normalizeProjectPath } from './utils';
import { 
  calculateComplexityScore, 
  calculateDuplicationScore, 
  calculateMaintainabilityScore, 
  calculateWeightedScore, 
  calculateHealthScore 
} from './scoring';
import { SCORING_WEIGHTS } from './thresholds.constants';
import { UniversalDependencyAnalyzer } from './dependencyAnalyzer';
import { getConfig } from './config.manager';
// generateRecommendations removed in v0.6.0 - calculable client-side

// ==================== V0.6.0 CORE FUNCTIONS ====================

/**
 * Finds the actual project root by looking for package.json, tsconfig.json, etc.
 * For monorepos, prioritizes workspace root over individual package roots.
 */
function findProjectRoot(analysisPath: string): string {
  let currentPath = path.resolve(analysisPath);
  const rootPath = path.parse(currentPath).root;
  let lastFoundRoot: string | null = null;
  
  while (currentPath !== rootPath) {
    // Check for project markers
    const packageJsonPath = path.join(currentPath, 'package.json');
    const gitPath = path.join(currentPath, '.git');
    const yarnLockPath = path.join(currentPath, 'yarn.lock');
    const pnpmLockPath = path.join(currentPath, 'pnpm-lock.yaml');
    const tsconfigPath = path.join(currentPath, 'tsconfig.json');
    
    // Priority order: git repo > lock files > package.json with workspaces > package.json > tsconfig
    if (fs.existsSync(gitPath)) {
      // Git repository root - highest priority for monorepos
      return currentPath;
    }
    
    if (fs.existsSync(yarnLockPath) || fs.existsSync(pnpmLockPath)) {
      // Lock files usually indicate workspace root
      return currentPath;
    }
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.workspaces) {
          // This is a workspace root - highest priority
          return currentPath;
        }
        // Remember this as a potential root, but keep looking for workspace root
        lastFoundRoot = currentPath;
      } catch {
        // Invalid package.json, treat as regular marker
        lastFoundRoot = currentPath;
      }
    }
    
    if (!lastFoundRoot && fs.existsSync(tsconfigPath)) {
      lastFoundRoot = currentPath;
    }
    
    currentPath = path.dirname(currentPath);
  }
  
  // Return the last found root, or the analysis path itself
  return lastFoundRoot || path.resolve(analysisPath);
}

// Health score calculation moved to scoring.ts

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
  return `${criticalCount} critical files found requiring attention`;
}


// Issue generation moved to parser.ts - no more legacy conversion needed

// ==================== MAIN ANALYSIS FUNCTION ====================

/**
 * The main analysis function for v0.6.0 - Complete refactor
 */
export async function analyze(files: FileDetail[], projectPath: string, _thresholds: ThresholdConfig, withContext: boolean = false): Promise<AnalysisResult> {
  const startTime = Date.now();
  
  // 1. Calculate all metrics and relationships
  const processedDetails = await processFileDetails(files, projectPath);
  
  // 3. Calculate overview scores
  const overview = calculateOverview(processedDetails);
  
  // 4. Generate context
  const context = generateContext(projectPath, processedDetails, startTime);
  
  // 5. Recommendations removed in v0.6.0 - calculable client-side
  
  const result: AnalysisResult = {
    context,
    overview,
    details: processedDetails
  };

  // Enrichir avec le code context si demandé
  if (withContext) {
    try {
      const codeContexts = enrichWithContext(processedDetails, projectPath);
      result.codeContext = codeContexts;
    } catch (error) {
      console.warn('Could not enrich with code context:', error);
    }
  }

  return result;
}

/**
 * Processes file details to calculate all derived metrics
 */
async function processFileDetails(details: FileDetail[], projectPath: string): Promise<FileDetail[]> {
  // 1. Detect duplication
  const filesWithDuplication = detectDuplication(details, getConfig(), projectPath);
  
  // 2. Analyze dependencies
  const actualProjectRoot = findProjectRoot(projectPath);
  const dependencyAnalyzer = new UniversalDependencyAnalyzer({
    projectRoot: actualProjectRoot,
    analyzeCircularDependencies: true,
    analyzeDynamicImports: true, 
    cache: true,
    timeout: 90000,
    logResolutionErrors: false, // Désactiver debug verbeux
  });
  
  const dependencyAnalysisResult = await dependencyAnalyzer.analyze(filesWithDuplication);

  // 3. Update dependencies from dependency analysis
  filesWithDuplication.forEach(file => {
    file.dependencies = dependencyAnalysisResult.fileAnalyses.get(file.file) || {
      incomingDependencies: 0,
      outgoingDependencies: 0,
      instability: 0,
      cohesionScore: 0,
      percentileUsageRank: 0,
      isInCycle: false
    };
  });
  
  // 4. Calculate critical path files (done on-demand)
  
  
  // 5. Mark critical path files (top 10% by usage)
  // Critical path calculation is now done on-demand in helper functions
  
  // 6. Calculate health scores
  filesWithDuplication.forEach(file => {
    file.healthScore = validateScore(calculateHealthScore(file));
  });
  
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
  const avgDuplicationRatio = details.reduce((sum, f) => sum + f.metrics.duplicationRatio, 0) / details.length;
  
  // Calculate weighted scores following industry standards WITHOUT outlier masking
  // 
  // METHODOLOGY: Raw arithmetic weighting that ensures extreme values are properly reflected
  // in the final grade, following the Pareto principle (20% of code causes 80% of problems).
  // 
  // ACADEMIC FOUNDATION:
  // - McCabe (1976): Complexity is the primary defect predictor - gets highest weight (45%)
  // - Martin Clean Code (2008): File size impacts maintainability - secondary weight (30%)
  // - Fowler Refactoring (1999): Duplication indicates technical debt - tertiary weight (25%)
  // 
  // INDUSTRY ALIGNMENT:
  // - SonarQube methodology: Linear aggregation without artificial caps
  // - CodeClimate approach: Extreme values should dominate quality assessment
  // - NO logarithmic scaling: Outliers must be visible, not masked
  // 
  // WEIGHT RATIONALE (45/30/25%):
  // - 45% Complexity: Primary defect predictor (McCabe research)
  // - 30% Dependencies: Architectural impact and maintainability
  // - 25% Duplication: Technical debt indicator (Fowler)
  //
  // This approach ensures that projects with critical issues (complexity 1000+, 
  // massive files) receive appropriately low grades, following industry best practices
  // for identifying the most problematic code that requires immediate attention.
  
  const totalCriticismScore = details.reduce((sum, f) => {
    // Simple arithmetic mean without logarithmic masking of outliers
    // This ensures that extremely complex files are properly weighted
    const baseWeight = 1.0; // Democratic base weight
    
    // Use raw complexity - NO logarithmic scaling!
    // Files with complexity 1000+ should dominate the calculation
    const complexityImpact = f.metrics.complexity;
    
    // Use normalized dependencies for architectural impact
    const dependencyImpact = f.dependencies.incomingDependencies;
    
    // Use raw duplication ratio
    const duplicationImpact = f.metrics.duplicationRatio * 100;
    
    // Simple weighted sum following industry standards
    return sum + (complexityImpact * SCORING_WEIGHTS.COMPLEXITY) + (dependencyImpact * SCORING_WEIGHTS.MAINTAINABILITY) + (duplicationImpact * SCORING_WEIGHTS.DUPLICATION) + baseWeight;
  }, 0);
  
  let weightedComplexityScore = 0;
  let weightedDuplicationScore = 0;
  let weightedMaintainabilityScore = 0;
  
  if (totalCriticismScore > 0) {
    for (const file of details) {
      // Use raw values without logarithmic masking
      const complexityImpact = file.metrics.complexity;
      const dependencyImpact = file.dependencies.incomingDependencies;
      const duplicationImpact = file.metrics.duplicationRatio * 100;
      const criticismScore = (complexityImpact * SCORING_WEIGHTS.COMPLEXITY) + (dependencyImpact * SCORING_WEIGHTS.MAINTAINABILITY) + (duplicationImpact * SCORING_WEIGHTS.DUPLICATION) + 1.0;
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
  
  const criticalCount = details.filter(f => isCriticalFile(f.healthScore)).length;
  
  const overview: Overview = {
    grade,
    statistics: {
      totalFiles: details.length,
      totalLOC,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      avgLOC: Math.round(avgLOC),
      avgDuplicationRatio: Math.round(avgDuplicationRatio * 1000) / 1000 // Round to 3 decimals
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