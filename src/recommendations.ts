// File: src/recommendations.ts - v0.6.0 Recommendations Engine

import { FileDetail, Recommendations, Action, QuickWin, Improvement, Severity, IssueType } from './types';

/**
 * Checks if a file is critical based on health score
 */
function isCriticalFile(file: FileDetail): boolean {
  return file.healthScore < 80;
}

/**
 * Generates smart recommendations based on file analysis
 * Prioritizes by impact and effort according to v0.6.0 specs
 */
export function generateRecommendations(details: FileDetail[]): Recommendations {
  const criticalFiles = details.filter(f => isCriticalFile(f));
  // Filter files with high/critical issues for potential use
  const mediumIssueFiles = details.filter(f => f.issues.some(i => i.severity === Severity.Medium));
  
  return {
    critical: generateCriticalActions(criticalFiles),
    quickWins: generateQuickWins(mediumIssueFiles),
    improvements: generateImprovements(details)
  };
}

/**
 * Generates critical actions for the most problematic files
 */
function generateCriticalActions(criticalFiles: FileDetail[]): Action[] {
  return criticalFiles.map(file => {
    const worstIssue = getWorstIssue(file);
    const baseEffort = calculateEffortForFile(file);
    
    return {
      file: file.file,
      issue: worstIssue ? worstIssue.context.message : `Health score: ${file.healthScore}/100`,
      solution: worstIssue ? worstIssue.action.description : 'Comprehensive refactoring needed',
      effortHours: baseEffort,
      impact: worstIssue ? worstIssue.action.impact : 'Significantly improved code quality',
      priority: calculatePriority(file)
    };
  }).sort((a, b) => b.priority - a.priority);
}

/**
 * Generates quick wins (< 60 minutes effort)
 */
function generateQuickWins(mediumIssueFiles: FileDetail[]): QuickWin[] {
  const quickWins: QuickWin[] = [];
  
  // Group files by issue type for batch fixes
  const issueGroups = groupFilesByIssueType(mediumIssueFiles);
  
  Object.entries(issueGroups).forEach(([issueType, files]) => {
    if (files.length > 1) {
      const effortMinutes = Math.min(files.length * 15, 45); // Max 45 minutes
      const scoreImprovement = files.length * 2; // Rough estimate
      
      quickWins.push({
        description: getQuickWinDescription(issueType as IssueType, files.length),
        files: files.map(f => f.file),
        effortMinutes,
        scoreImprovement
      });
    }
  });
  
  // Individual quick fixes for files with simple issues
  mediumIssueFiles.forEach(file => {
    if (file.issues.length === 1 && file.metrics.complexity < 15) {
      const issue = file.issues[0];
      quickWins.push({
        description: `Quick fix: ${issue.context.message}`,
        files: [file.file],
        effortMinutes: 30,
        scoreImprovement: 3
      });
    }
  });
  
  return quickWins
    .sort((a, b) => (b.scoreImprovement / b.effortMinutes) - (a.scoreImprovement / a.effortMinutes))
    .slice(0, 5); // Top 5 quick wins
}

/**
 * Generates long-term improvements (1-5 days effort)
 */
function generateImprovements(allFiles: FileDetail[]): Improvement[] {
  const improvements: Improvement[] = [];
  
  // Architecture improvement based on critical path analysis
  const criticalPathFiles = allFiles.filter(f => f.dependencies.isCriticalPath);
  if (criticalPathFiles.length > 0) {
    improvements.push({
      title: 'Critical Path Optimization',
      description: 'Refactor high-usage files to improve overall system performance',
      files: criticalPathFiles.map(f => f.file),
      approach: 'Incremental refactoring with comprehensive test coverage',
      effortDays: Math.min(Math.ceil(criticalPathFiles.length / 3), 5),
      benefits: [
        'Improved system performance',
        'Reduced coupling between modules',
        'Better maintainability for core features'
      ],
      risks: ['Potential breaking changes in core functionality']
    });
  }
  
  // Complexity reduction improvement
  const complexFiles = allFiles.filter(f => f.metrics.complexity > 20);
  if (complexFiles.length > 2) {
    improvements.push({
      title: 'Complexity Reduction Initiative',
      description: 'Systematic reduction of cyclomatic complexity across the codebase',
      files: complexFiles.map(f => f.file),
      approach: 'Extract methods, apply SOLID principles, introduce design patterns',
      effortDays: Math.min(Math.ceil(complexFiles.length / 2), 4),
      benefits: [
        'Improved code readability',
        'Reduced bug rate',
        'Easier onboarding for new developers'
      ],
      risks: ['Time investment required', 'Potential for introducing new bugs during refactoring']
    });
  }
  
  // Duplication elimination improvement
  const duplicatedFiles = allFiles.filter(f => f.metrics.duplicationRatio > 0.1);
  if (duplicatedFiles.length > 1) {
    improvements.push({
      title: 'Duplication Elimination',
      description: 'Extract common code into reusable utilities and shared modules',
      files: duplicatedFiles.map(f => f.file),
      approach: 'Identify common patterns, create utility functions, implement shared libraries',
      effortDays: Math.min(Math.ceil(duplicatedFiles.length / 4), 3),
      benefits: [
        'Reduced maintenance overhead',
        'Improved consistency across codebase',
        'Smaller bundle size'
      ],
      risks: ['Over-abstraction risk', 'Potential breaking changes']
    });
  }
  
  // Large file decomposition
  const largeFiles = allFiles.filter(f => f.metrics.loc > 400);
  if (largeFiles.length > 0) {
    improvements.push({
      title: 'Large File Decomposition',
      description: 'Break down large files into smaller, focused modules',
      files: largeFiles.map(f => f.file),
      approach: 'Apply Single Responsibility Principle, extract related functionality',
      effortDays: Math.min(Math.ceil(largeFiles.length / 2), 3),
      benefits: [
        'Better module organization',
        'Improved testability',
        'Reduced cognitive load'
      ],
      risks: ['Increased file count', 'Potential circular dependencies']
    });
  }
  
  return improvements
    .sort((a, b) => calculateImprovementPriority(b) - calculateImprovementPriority(a))
    .slice(0, 3); // Top 3 improvements
}

/**
 * Helper functions
 */

function getWorstIssue(file: FileDetail) {
  if (file.issues.length === 0) return null;
  
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return file.issues.sort((a, b) => 
    severityOrder[b.severity] - severityOrder[a.severity]
  )[0];
}

function calculateEffortForFile(file: FileDetail): number {
  const baseEffort = Math.max(2, Math.ceil(file.metrics.complexity / 10));
  const issueEffort = file.issues.reduce((sum, issue) => sum + issue.action.effortHours, 0);
  const sizeMultiplier = file.metrics.loc > 500 ? 1.5 : 1.0;
  
  return Math.min(Math.ceil((baseEffort + issueEffort) * sizeMultiplier), 16); // Max 16 hours
}

function calculatePriority(file: FileDetail): number {
  let priority = 5; // Base priority
  
  // High usage increases priority
  if (file.dependencies.isCriticalPath) priority += 3;
  if (file.dependencies.usageCount > 10) priority += 2;
  
  // Poor health decreases priority score (making it higher priority)
  if (file.healthScore < 30) priority += 3;
  else if (file.healthScore < 50) priority += 2;
  else if (file.healthScore < 70) priority += 1;
  
  // Critical issues increase priority
  const criticalIssues = file.issues.filter(i => i.severity === Severity.Critical).length;
  const highIssues = file.issues.filter(i => i.severity === Severity.High).length;
  priority += criticalIssues * 2 + highIssues;
  
  return Math.min(priority, 10); // Max priority 10
}

function groupFilesByIssueType(files: FileDetail[]): Record<string, FileDetail[]> {
  const groups: Record<string, FileDetail[]> = {};
  
  files.forEach(file => {
    file.issues.forEach(issue => {
      if (!groups[issue.type]) {
        groups[issue.type] = [];
      }
      if (!groups[issue.type].includes(file)) {
        groups[issue.type].push(file);
      }
    });
  });
  
  return groups;
}

function getQuickWinDescription(issueType: IssueType, fileCount: number): string {
  switch (issueType) {
    case IssueType.Complexity:
      return `Reduce complexity in ${fileCount} files through method extraction`;
    case IssueType.Duplication:
      return `Eliminate common code patterns in ${fileCount} files`;
    case IssueType.Size:
      return `Split ${fileCount} large files into smaller modules`;
    default:
      return `Address ${issueType} issues in ${fileCount} files`;
  }
}

function calculateImprovementPriority(improvement: Improvement): number {
  let priority = improvement.benefits.length * 2; // More benefits = higher priority
  
  // Factor in effort (lower effort = higher priority)
  priority += (6 - improvement.effortDays);
  
  // Factor in file count (more files = higher impact)
  priority += Math.min(improvement.files.length / 2, 5);
  
  // Factor in risks (more risks = lower priority)
  priority -= (improvement.risks?.length || 0);
  
  return Math.max(priority, 1);
}