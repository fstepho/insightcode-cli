// File: src/analyzer.ts

import { FileMetrics, AnalysisResult, Issue, ThresholdConfig } from './types';
import { analyzeDependencies } from './dependencyAnalyzer';
import { detectDuplication } from './duplication';
import { getProjectInfo } from './projectInfo';
import { 
  calculateComplexityScore, 
  calculateDuplicationScore, 
  calculateMaintainabilityScore, 
  calculateWeightedScore, 
  getGrade 
} from './scoring';

// --- Helper Functions ---

function calculateCriticismScore(file: { complexity: number, impact: number, issues: Issue[] }): number {
    const complexityWeight = 1.0;
    const impactWeight = 2.0;
    const issueWeight = 0.5;
    return (file.impact * impactWeight) + (file.complexity * complexityWeight) + (file.issues.length * issueWeight) + 1;
}

function calculateStandardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((sum, val) => sum + val, 0) / numbers.length;
    const variance = numbers.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
}

function findSilentKillers(allFiles: FileMetrics[], topFiles: FileMetrics[]): FileMetrics[] {
    if (allFiles.length < 10) return [];
    
    const topFilePaths = new Set(topFiles.map(f => f.path));
    const avgImpact = allFiles.reduce((sum, f) => sum + f.impact, 0) / allFiles.length;
    const avgComplexity = allFiles.reduce((sum, f) => sum + f.complexity, 0) / allFiles.length;

    const candidates = allFiles.filter(file => 
        !topFilePaths.has(file.path) &&
        file.impact > 5 &&
        file.impact > avgImpact * 1.5 &&
        file.complexity > avgComplexity
    );
    
    candidates.sort((a, b) => (b.impact * b.complexity) - (a.impact * a.complexity));
    return candidates.slice(0, 3);
}

/**
 * The main analysis function, acting as the single source of truth.
 */
export function analyze(files: FileMetrics[], projectPath: string, thresholds: ThresholdConfig): AnalysisResult {
    // 1. Dependency and duplication analysis
    const impactScores = analyzeDependencies(files);
    const filesWithDuplication = detectDuplication(files, thresholds);

    // 2. Centralized enrichment and scoring for each file
    let totalCriticismScore = 0;
    const processedFiles: FileMetrics[] = filesWithDuplication.map(file => {
        const impact = impactScores.get(file.path) ?? 0;
        
        const fileType = file.fileType || 'production';
        const sizeThreshold = thresholds.size[fileType]?.high || thresholds.size.production.high;
        const complexityThreshold = thresholds.complexity[fileType]?.high || thresholds.complexity.production.high;

        const enhancedIssues: Issue[] = file.issues.map(issue => ({
            ...issue,
            ratio: issue.type === 'complexity' ? file.complexity / complexityThreshold :
                   issue.type === 'size' ? file.loc / sizeThreshold : 
                   undefined,
        }));

        const enrichedFile = { ...file, issues: enhancedIssues, impact, criticismScore: 0 };
        const criticismScore = calculateCriticismScore(enrichedFile);
        totalCriticismScore += criticismScore;

        return { ...enrichedFile, criticismScore };
    });

    // 3. Calculate final project scores, weighted by criticality
    // FIX: Initialize scores to 100 for the empty project case.
    let weightedComplexityScore = 100;
    let weightedDuplicationScore = 100;
    let weightedMaintainabilityScore = 100;

    if (totalCriticismScore > 0) {
        // Reset to 0 only if there are files to process
        weightedComplexityScore = 0;
        weightedDuplicationScore = 0;
        weightedMaintainabilityScore = 0;
        for (const file of processedFiles) {
            const weight = file.criticismScore / totalCriticismScore;
            weightedComplexityScore += calculateComplexityScore(file.complexity) * weight;
            weightedDuplicationScore += calculateDuplicationScore(file.duplication) * weight;
            weightedMaintainabilityScore += calculateMaintainabilityScore(file.loc, file.functionCount) * weight;
        }
    }

    const finalComplexityScore = Math.round(weightedComplexityScore);
    const finalDuplicationScore = Math.round(weightedDuplicationScore);
    const finalMaintainabilityScore = Math.round(weightedMaintainabilityScore);
    
    const finalScore = Math.round(calculateWeightedScore(
        finalComplexityScore,
        finalDuplicationScore,
        finalMaintainabilityScore
    ));
    const grade = getGrade(finalScore);

    // 4. Identify key files and advanced metrics
    const topFiles = [...processedFiles]
      .sort((a, b) => b.criticismScore - a.criticismScore)
      .slice(0, 5);
      
    const silentKillers = findSilentKillers(processedFiles, topFiles);
    const complexityStdDev = calculateStandardDeviation(processedFiles.map(f => f.complexity));

    // 5. Assemble the final result object
    const summary = {
        totalFiles: processedFiles.length,
        totalLines: processedFiles.reduce((sum, f) => sum + f.loc, 0),
        avgComplexity: processedFiles.reduce((sum, f) => sum + f.complexity, 0) / (processedFiles.length || 1),
        avgDuplication: processedFiles.reduce((sum, f) => sum + f.duplication, 0) / (processedFiles.length || 1),
        avgFunctions: processedFiles.reduce((sum, f) => sum + f.functionCount, 0) / (processedFiles.length || 1),
        avgLoc: processedFiles.reduce((sum, f) => sum + f.loc, 0) / (processedFiles.length || 1),
    };

    return {
        files: processedFiles,
        topFiles,
        silentKillers,
        project: getProjectInfo(projectPath),
        summary: {
            ...summary,
            avgComplexity: Math.round(summary.avgComplexity * 10) / 10,
            avgDuplication: Math.round(summary.avgDuplication * 10) / 10,
            avgFunctions: Math.round(summary.avgFunctions * 10) / 10,
            avgLoc: Math.round(summary.avgLoc),
        },
        scores: {
            complexity: finalComplexityScore,
            duplication: finalDuplicationScore,
            maintainability: finalMaintainabilityScore,
            overall: finalScore
        },
        complexityStdDev,
        score: finalScore,
        grade,
    };
}
