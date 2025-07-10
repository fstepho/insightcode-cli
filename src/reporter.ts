// File: src/reporter.ts - v0.6.0 Complete Refactor

import chalk from 'chalk';
import { AnalysisResult, FileDetail } from './types';

/**
 * Checks if a file is critical based on health score
 */
function isCriticalFile(file: FileDetail): boolean {
  return file.healthScore < 80;
}

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

  // --- Fichiers Critiques ---
  const criticalFiles = details.filter(f => isCriticalFile(f));
  if (criticalFiles.length > 0) {
    printSectionHeader('Critical Files (Top Issues)');
    criticalFiles.forEach((file, index) => {
      const healthColor = file.healthScore < 50 ? chalk.red : file.healthScore < 70 ? chalk.yellow : chalk.green;
      console.log(`  ${chalk.bold(index + 1 + '.')} ${chalk.cyan(file.file)}`);
      console.log(`      ${chalk.bold('Health Score:')} ${healthColor(file.healthScore + '/100')}`);
      console.log(`      ${chalk.bold('Complexity:')}   ${file.metrics.complexity} | ${chalk.bold('LOC:')} ${file.metrics.loc} | ${chalk.bold('Usage:')} ${file.dependencies.incomingCount}`);
      
      if (file.issues.length > 0) {
        file.issues.forEach(issue => {
          const severityColor = issue.severity === 'critical' ? chalk.red.bold : 
                               issue.severity === 'high' ? chalk.red : 
                               issue.severity === 'medium' ? chalk.yellow : chalk.green;
          console.log(`      ${severityColor('⚠')} ${severityColor(issue.severity.toUpperCase())}: ${issue.context.message}`);
        });
      }
    });
  }

  // --- Recommandations ---
  if (result.recommendations.critical.length > 0) {
    printSectionHeader('Critical Recommendations');
    result.recommendations.critical.forEach((action, index) => {
      console.log(`  ${chalk.bold(index + 1 + '.')} ${chalk.red(action.issue)}`);
      console.log(`      ${chalk.bold('File:')} ${chalk.cyan(action.file)}`);
      console.log(`      ${chalk.bold('Solution:')} ${action.solution}`);
      console.log(`      ${chalk.bold('Effort:')} ${action.effortHours}h | ${chalk.bold('Priority:')} ${action.priority}/10`);
    });
  }

  if (result.recommendations.quickWins.length > 0) {
    printSectionHeader('Quick Wins');
    result.recommendations.quickWins.forEach((win, index) => {
      console.log(`  ${chalk.bold(index + 1 + '.')} ${chalk.green(win.description)}`);
      console.log(`      ${chalk.bold('Files:')} ${win.files.join(', ')}`);
      console.log(`      ${chalk.bold('Effort:')} ${win.effortMinutes}min | ${chalk.bold('Score Improvement:')} +${win.scoreImprovement}`);
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