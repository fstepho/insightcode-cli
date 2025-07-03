// File: src/reporter.ts

import chalk from 'chalk';
import * as process from 'process';
import { AnalysisResult } from './types';
import { 
  getComplexityLabel, 
  getDuplicationLabel, 
  getMaintainabilityLabel,
  getComplexityColorLevel,
  getDuplicationColorLevel,
  getMaintainabilityColorLevel,
  getSeverityColorLevel
} from './scoring';
import { getConfig } from './config';

// --- Fonctions d'aide pour l'UI ---

/**
 * Crée un en-tête de section stylisé.
 * @param title Le titre de la section.
 */
function printSectionHeader(title: string): void {
  console.log(chalk.gray(`\n╭─ ${chalk.bold.cyan(title)} ` + '─'.repeat(Math.max(0, 50 - title.length))));
}

/**
 * Convertit un niveau de couleur en fonction chalk.
 */
function getChalkColor(colorLevel: 'green' | 'yellow' | 'red' | 'redBold') {
  switch (colorLevel) {
    case 'green': return chalk.green;
    case 'yellow': return chalk.yellow;
    case 'red': return chalk.red;
    case 'redBold': return chalk.red.bold;
  }
}

/**
 * Générateur de barre de progression avec des couleurs dynamiques.
 * @param percentage Le pourcentage à afficher.
 * @param width La largeur de la barre.
 * @param colorLevel Le niveau de couleur pour la barre.
 */
function progressBar(percentage: number, width: number = 20, colorLevel: 'green' | 'yellow' | 'red' | 'redBold'): string {
  const filledCount = Math.round((percentage / 100) * width);
  const emptyCount = width - filledCount;
  const filledBar = '█'.repeat(filledCount);
  const emptyBar = chalk.gray('░'.repeat(emptyCount));
  
  const colorFunc = getChalkColor(colorLevel);
  return `${colorFunc(filledBar)}${emptyBar}`;
}

/**
 * Formate les grands nombres avec des séparateurs de milliers.
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Affiche les résultats de l'analyse dans le terminal avec un design professionnel.
 */
export function reportToTerminal(result: AnalysisResult): void {
  const { summary, score, grade, project, topFiles } = result;
  const config = getConfig();

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
  console.log(`  ${chalk.bold('Project:')}     ${chalk.cyan(project.name)}`);
  if (project.packageJson?.version) {
    console.log(`  ${chalk.bold('Version:')}     ${chalk.cyan(project.packageJson.version)}`);
  }
  console.log(`  ${chalk.bold('Path:')}        ${chalk.dim(project.path)}`);
  console.log(`  ${chalk.bold('Files:')}       ${chalk.cyan(summary.totalFiles)}`);
  console.log(`  ${chalk.bold('Total Lines:')} ${chalk.cyan(formatNumber(summary.totalLines))}`);

  // --- Score Global ---
  printSectionHeader('Overall Code Quality Score');
  const gradeColor = score >= config.grades.A ? chalk.bgGreen.black :
                     score >= config.grades.B ? chalk.bgYellow.black :
                     chalk.bgRed.white;
                     
  console.log(`\n  ${gradeColor.bold(`  ${grade}  `)} ${chalk.bold(score.toFixed(1))}${chalk.dim('/100')}\n`);


  // --- Métriques Détaillées ---
  printSectionHeader('Core Metrics');
  
  // Complexité
  const complexityScore = result.scores.complexity;
  const complexityColor = getComplexityColorLevel(summary.avgComplexity);
  console.log(
    `  ${chalk.bold('Complexity:')}      ${progressBar(complexityScore, 20, complexityColor)}  ${getChalkColor(complexityColor)(`${summary.avgComplexity.toFixed(1)} (${getComplexityLabel(summary.avgComplexity)})`)}`
  );

  // Duplication
  const duplicationScore = result.scores.duplication;
  const duplicationColor = getDuplicationColorLevel(summary.avgDuplication);
  console.log(
    `  ${chalk.bold('Duplication:')}     ${progressBar(duplicationScore, 20, duplicationColor)}  ${getChalkColor(duplicationColor)(`${summary.avgDuplication.toFixed(1)}% (${getDuplicationLabel(summary.avgDuplication)})`)}`
  );

  // Maintenabilité
  const maintainabilityScore = result.scores.maintainability;
  const maintainabilityColor = getMaintainabilityColorLevel(maintainabilityScore);
  console.log(
    `  ${chalk.bold('Maintainability:')} ${progressBar(maintainabilityScore, 20, maintainabilityColor)}  ${getChalkColor(maintainabilityColor)(`${maintainabilityScore.toFixed(0)}/100 (${getMaintainabilityLabel(maintainabilityScore)})`)}`
  );


  // --- Fichiers Critiques ---
  if (topFiles.length > 0) {
    printSectionHeader('⚠️ Top 5 Critical Files to Address');
    
    topFiles.forEach((file, index) => {
      const cleanPath = file.path.replace(process.cwd() + '/', '');
      console.log(`\n  ${chalk.bold(`${index + 1}.`)} ${chalk.underline.white(cleanPath)}`);
      
      file.issues.forEach(issue => {
        let icon: string;
        let colorFunc: chalk.Chalk;
        
        if (issue.type === 'complexity' && issue.ratio) {
            const color = getSeverityColorLevel(issue.ratio);
            colorFunc = getChalkColor(color);
            icon = color === 'redBold' ? '🔴' : color === 'red' ? '🟠' : '🟡';
            console.log(`    ${icon} ${colorFunc(`High Complexity: ${formatNumber(issue.value)} (${issue.ratio.toFixed(0)}x above limit)`)}`);
        } else if (issue.type === 'size' && issue.ratio) {
            const color = getSeverityColorLevel(issue.ratio);
            colorFunc = getChalkColor(color);
            icon = color === 'redBold' ? '🔴' : color === 'red' ? '🟠' : '🟡';
            console.log(`    ${icon} ${colorFunc(`Very Large File: ${formatNumber(issue.value)} lines (${issue.ratio.toFixed(0)}x above limit)`)}`);
        } else if (issue.type === 'duplication') {
            const color = getDuplicationColorLevel(issue.value);
            colorFunc = getChalkColor(color);
            icon = color === 'redBold' ? '🔴' : color === 'red' ? '🟠' : '🟡';
            console.log(`    ${icon} ${colorFunc(`High Duplication: ${issue.value.toFixed(1)}% detected`)}`);
        }
      });
    });
  }

  // --- Plans d'action ---
  if (score < 90 && topFiles.length > 0) {
    printSectionHeader('💡 Quick Wins to Improve Score');
    
    const improvements: string[] = [];
    const extremeComplexityFiles = result.files.filter(f => f.complexityRatio && f.complexityRatio >= 50);
    const veryLargeFiles = result.files.filter(f => f.sizeRatio && f.sizeRatio >= 10);
    const highDuplicationFiles = result.files.filter(f => f.duplication && f.duplication >= 25);

    if (extremeComplexityFiles.length > 0) {
      const gain = Math.min(10, Math.round(extremeComplexityFiles.length * 2.5));
      improvements.push(`Refactor the ${Math.min(3, extremeComplexityFiles.length)} most complex file(s) for a potential gain of ~${chalk.green.bold(`+${gain} pts`)}.`);
    }
    if (veryLargeFiles.length > 0) {
      const gain = Math.min(8, Math.round(veryLargeFiles.length * 1.5));
      improvements.push(`Split the ${Math.min(3, veryLargeFiles.length)} largest file(s) for a potential gain of ~${chalk.green.bold(`+${gain} pts`)}.`);
    }
    if (highDuplicationFiles.length > 0) {
      const gain = Math.min(6, highDuplicationFiles.length);
      improvements.push(`Abstract repeated code in ${highDuplicationFiles.length} file(s) for a potential gain of ~${chalk.green.bold(`+${gain} pts`)}.`);
    }

    improvements.slice(0, 3).forEach(improvement => {
      console.log(`  ${chalk.cyan('›')} ${chalk.gray(improvement)}`);
    });
  }

  // --- Pied de page ---
  console.log(chalk.gray('\n\n' + '─'.repeat(58)));
  console.log(`  ✅ ${chalk.bold('Analysis complete!')} Run regularly to maintain code quality.`);
  console.log(chalk.dim(`     Report generated on ${new Date().toLocaleString()}\n`));
}