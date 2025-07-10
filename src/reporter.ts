// File: src/reporter.ts - v0.6.0 Complete Refactor

import chalk from 'chalk';
import { AnalysisResult, FileDetail, Issue, IssueType } from './types';

/**
 * Generate description for an issue based on type and threshold data
 */
function getIssueDescription(issue: Issue): string {
  switch (issue.type) {
    case IssueType.Complexity:
      return `${issue.severity} complexity: Exceeds threshold by ${(issue.excessRatio * 100 - 100).toFixed(0)}%`;
    case IssueType.Size:
      return `${issue.severity} file size: Exceeds threshold by ${(issue.excessRatio * 100 - 100).toFixed(0)}%`;
    case IssueType.Duplication:
      return `${issue.severity} duplication: Exceeds threshold by ${(issue.excessRatio * 100 - 100).toFixed(0)}%`;
    default:
      return `${issue.severity} ${issue.type} issue`;
  }
}

// isCriticalFile function removed - logic integrated into client-side calculations

/**
 * Formate un nombre avec des espaces comme séparateurs de milliers
 */
function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Affiche un en-tête de section stylisé
 */
function printSectionHeader(title: string): void {
  console.log(`\n${chalk.bold.underline(title)}`);
  console.log(chalk.dim('─'.repeat(title.length + 10)));
}

/**
 * Obtient la couleur appropriée pour un score
 */
function getScoreColor(score: number): (text: string) => string {
  if (score >= 90) return chalk.green;
  if (score >= 80) return chalk.yellow;
  if (score >= 70) return chalk.yellow;
  return chalk.red;
}

/**
 * Obtient la couleur appropriée pour un grade
 */
function getGradeColor(grade: string): (text: string) => string {
  switch (grade) {
    case 'A': return chalk.bgGreen.black;
    case 'B': return chalk.bgYellow.black;
    case 'C': return chalk.bgYellow.black;
    case 'D': return chalk.bgRed.white;
    case 'F': return chalk.bgRed.bold.white;
    default: return chalk.gray;
  }
}


/**
 * Affiche les résultats de l'analyse dans le terminal avec un design professionnel
 */
export function reportToTerminal(result: AnalysisResult): void {
  const { context, overview, details } = result;

  // --- En-tête Principal ---
  console.log(chalk.cyanBright(`
  ┌──────────────────────────────────────────┐
  │                                          │
  │   📊   ${chalk.bold('InsightCode Analysis Report')}   📊  │
  │                                          │
  └──────────────────────────────────────────┘
  `));

  // --- Infos du Projet ---
  printSectionHeader('Project Overview');
  console.log(`  ${chalk.bold('Project:')}     ${chalk.cyan(context.project.name)}`);
  if (context.project.version) {
    console.log(`  ${chalk.bold('Version:')}     ${chalk.cyan(context.project.version)}`);
  }
  console.log(`  ${chalk.bold('Path:')}        ${chalk.dim(context.project.path)}`);
  console.log(`  ${chalk.bold('Files:')}       ${chalk.cyan(overview.statistics.totalFiles)}`);
  console.log(`  ${chalk.bold('Total Lines:')} ${chalk.cyan(formatNumber(overview.statistics.totalLOC))}`);
  console.log(`  ${chalk.bold('Analyzed:')}    ${chalk.dim(new Date(context.analysis.timestamp).toLocaleString())}`);
  console.log(`  ${chalk.bold('Duration:')}    ${chalk.dim(context.analysis.durationMs + 'ms')}`);

  // --- Score Global ---
  printSectionHeader('Overall Code Quality Score');
  const gradeColor = getGradeColor(overview.grade);
  const scoreColor = getScoreColor(overview.scores.overall);
  
  console.log(`  ${chalk.bold('Overall Score:')} ${scoreColor(overview.scores.overall + '/100')} ${gradeColor(` ${overview.grade} `)}`);
  console.log(`  ${chalk.bold('Summary:')} ${chalk.italic(overview.summary)}`);

  // --- Détails des Scores ---
  printSectionHeader('Score Breakdown');
  console.log(`  ${chalk.bold('Complexity:')}      ${getScoreColor(overview.scores.complexity)(overview.scores.complexity + '/100')}`);
  console.log(`  ${chalk.bold('Duplication:')}     ${getScoreColor(overview.scores.duplication)(overview.scores.duplication + '/100')}`);
  console.log(`  ${chalk.bold('Maintainability:')} ${getScoreColor(overview.scores.maintainability)(overview.scores.maintainability + '/100')}`);

  // --- Statistiques ---
  printSectionHeader('Project Statistics');
  console.log(`  ${chalk.bold('Average Complexity:')} ${chalk.cyan(overview.statistics.avgComplexity)}`);
  console.log(`  ${chalk.bold('Average LOC:')}        ${chalk.cyan(overview.statistics.avgLOC)}`);
  
  const avgDuplication = details.reduce((sum, f) => sum + f.metrics.duplicationRatio, 0) / details.length;
  const avgFunctions = details.reduce((sum, f) => sum + f.metrics.functionCount, 0) / details.length;
  console.log(`  ${chalk.bold('Average Duplication:')} ${chalk.cyan(Math.round(avgDuplication * 100) + '%')}`);
  console.log(`  ${chalk.bold('Average Functions:')}   ${chalk.cyan(Math.round(avgFunctions))}`);

  // --- Critical Files section moved to recommendations below ---

  // --- Recommendations v0.6.0 - Client-side calculation ---
  
  // Critical Files: Top 5 worst healthScore
  const criticalFiles = result.details
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 5)
    .filter(f => f.healthScore < 80); // Only show truly critical files
  
  if (criticalFiles.length > 0) {
    printSectionHeader('Critical Files');
    criticalFiles.forEach((file, index) => {
      console.log(`  ${chalk.bold(index + 1 + '.')} ${chalk.red(file.file)} ${chalk.dim(`(health: ${file.healthScore}/100)`)}`);  
      if (file.issues.length > 0) {
        const worstIssue = file.issues.sort((a, b) => b.excessRatio - a.excessRatio)[0];
        console.log(`      ${chalk.bold('Main Issue:')} ${getIssueDescription(worstIssue)}`);
        console.log(`      ${chalk.bold('Impact:')} ${worstIssue.excessRatio.toFixed(1)}x over threshold`);
      }
    });
  }
  
  // Quick Wins: Issues sorted by excessRatio (highest impact first)
  const quickWins = result.details
    .flatMap(file => 
      file.issues
        .filter(issue => issue.severity === 'medium') // Focus on medium issues as quick wins
        .map(issue => ({ file: file.file, ...issue }))
    )
    .sort((a, b) => b.excessRatio - a.excessRatio)
    .slice(0, 5);
  
  if (quickWins.length > 0) {
    printSectionHeader('Quick Wins');
    quickWins.forEach((win, index) => {
      console.log(`  ${chalk.bold(index + 1 + '.')} ${chalk.green(win.file)} - ${chalk.cyan(win.type)}`);
      console.log(`      ${chalk.bold('Issue:')} ${getIssueDescription(win)}`);
      console.log(`      ${chalk.bold('Impact:')} ${win.excessRatio.toFixed(1)}x over threshold`);
    });
  }

  // --- Résumé des Issues ---
  const allIssues = details.flatMap(f => f.issues);
  if (allIssues.length > 0) {
    printSectionHeader('Issues Summary');
    
    const issuesBySeverity = allIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const issuesByType = allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`  ${chalk.bold('By Severity:')}`);
    Object.entries(issuesBySeverity).forEach(([severity, count]) => {
      const color = severity === 'critical' ? chalk.red.bold : 
                   severity === 'high' ? chalk.red : 
                   severity === 'medium' ? chalk.yellow : chalk.green;
      console.log(`    ${color(severity.toUpperCase())}: ${count}`);
    });

    console.log(`  ${chalk.bold('By Type:')}`);
    Object.entries(issuesByType).forEach(([type, count]) => {
      console.log(`    ${chalk.cyan(type)}: ${count}`);
    });
  }

  // --- Pied de page ---
  console.log(chalk.dim(`\n  Analysis completed with InsightCode v${context.analysis.toolVersion}`));
  console.log(chalk.dim(`  For detailed JSON output, use: insightcode analyze --json`));
}