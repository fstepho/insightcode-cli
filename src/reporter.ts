import chalk from 'chalk';
import * as process from 'process';
import { AnalysisResult } from './types';
import { getTopCriticalFiles } from './fileScoring';
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

function getSeverityLabel(ratio?: number): string {
  if (!ratio) return '';
  if (ratio >= 100) return 'Extreme';
  if (ratio >= 50) return 'Very High';
  if (ratio >= 10) return 'High';
  if (ratio >= 2.5) return 'Medium';
  return 'Low';
}

/**
 * Convert color level to chalk function
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
 * Progress bar generator
 */
function progressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return `${'█'.repeat(filled)}${'░'.repeat(empty)}`;
}

/**
 * Format large numbers with commas
 */
function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Display analysis results in the terminal
 */
export function reportToTerminal(result: AnalysisResult): void {
  const { summary, score, grade, project } = result;
  
  // Header
  console.log(chalk.bold.cyan('\n📊 InsightCode Analysis Report\n'));
  
  // Project Info
  console.log(chalk.bold('📁 Project:'));
  console.log(`  Name: ${chalk.cyan(project.name)}`);
  if (project.packageJson?.version) {
    console.log(`  Version: ${chalk.cyan(project.packageJson.version)}`);
  }
  if (project.packageJson?.description) {
    console.log(`  Description: ${chalk.gray(project.packageJson.description)}`);
  }
  console.log(`  Path: ${chalk.gray(project.path)}\n`);
  
  // Overall Score
  const config = getConfig();
  const gradeColor = score >= config.grades.A ? chalk.green :
                    score >= config.grades.B ? chalk.greenBright :
                    score >= config.grades.C ? chalk.yellow :
                    score >= config.grades.D ? chalk.yellowBright :
                    chalk.red;
  
  console.log(`${chalk.bold('Overall Score:')} ${gradeColor(`${grade} (${score}/100)`)}\n`);
  
  // Summary
  console.log(chalk.bold('Summary:'));
  console.log(`  Files analyzed: ${chalk.cyan(summary.totalFiles)}`);
  console.log(`  Total lines: ${chalk.cyan(formatNumber(summary.totalLines))}`);
  
  const complexityLabel = getComplexityLabel(summary.avgComplexity);
  const complexityColor = getChalkColor(getComplexityColorLevel(summary.avgComplexity));
  console.log(`  Avg complexity: ${complexityColor(`${summary.avgComplexity} (${complexityLabel})`)}`);
  console.log(`  Avg duplication: ${chalk.cyan(summary.avgDuplication + '%')} ${chalk.gray('(project average)')}\n`);
  
  // Metrics with actual values (industry standard presentation)
  console.log(chalk.bold('Metrics:'));
  
  // Complexity - show actual value with intensity bar
  const complexityIntensity = Math.min(100, Math.max(0, summary.avgComplexity * 2)); // Scale for display
  const complexityMetricLabel = getComplexityLabel(summary.avgComplexity);
  const complexityMetricColor = getChalkColor(getComplexityColorLevel(summary.avgComplexity));
  console.log(`  Complexity      ${progressBar(complexityIntensity)} ${complexityMetricColor(summary.avgComplexity + ' (' + complexityMetricLabel + ')')}`);
  
  // Duplication - show actual percentage with intensity bar
  const duplicationIntensity = Math.min(100, summary.avgDuplication * 2); // Scale for display
  const duplicationMetricLabel = getDuplicationLabel(summary.avgDuplication);
  const duplicationMetricColor = getChalkColor(getDuplicationColorLevel(summary.avgDuplication));
  console.log(`  Duplication     ${progressBar(duplicationIntensity)} ${duplicationMetricColor(summary.avgDuplication + '% (' + duplicationMetricLabel + ')')}`);
  
  // Maintainability - show quality score (this one is actually a quality metric)
  const maintainabilityScore = Math.round(result.scores.maintainability);
  const maintainabilityMetricLabel = getMaintainabilityLabel(maintainabilityScore);
  const maintainabilityMetricColor = getChalkColor(getMaintainabilityColorLevel(maintainabilityScore));
  console.log(`  Maintainability ${progressBar(maintainabilityScore)} ${maintainabilityMetricColor(maintainabilityScore + '/100 (' + maintainabilityMetricLabel + ')')}\n`);
  
  // Top Critical Files
  const topFiles = result.topFiles;
  
  if (topFiles.length > 0) {
    console.log(chalk.bold('⚠️  Top 5 Most Critical Files:\n'));
    
    topFiles.forEach((file, index) => {
      // Clean file path for display
      const cleanPath = file.path.replace(process.cwd() + '/', '');
      
      console.log(`${chalk.bold(`${index + 1}.`)} ${chalk.underline(cleanPath)}`);
      
      // Display each issue with proper formatting
      file.issues.forEach(issue => {
        const icon = issue.severity === 'high' ? '   •' : '   •';
        
        if (issue.type === 'complexity' && issue.ratio) {
          const severityLabel = getSeverityLabel(issue.ratio);
          const severityColor = getChalkColor(getSeverityColorLevel(issue.ratio));
          console.log(severityColor(`${icon} ${severityLabel} complexity: ${formatNumber(issue.value)} (${issue.ratio.toFixed(0)}x limit)`));
        } else if (issue.type === 'size' && issue.ratio) {
          const sizeLabel = issue.value > 5000 ? 'Massive' :
                           issue.value > 1000 ? 'Very large' :
                           issue.value > 300 ? 'Large' :
                           'Getting large';
          const severityColor = getChalkColor(getSeverityColorLevel(issue.ratio));
          console.log(severityColor(`${icon} ${sizeLabel} file: ${formatNumber(issue.value)} lines (${issue.ratio.toFixed(0)}x limit)`));
        } else if (issue.type === 'duplication') {
          const dupLabel = issue.value > 40 ? 'Very high' :
                          issue.value > 20 ? 'High' :
                          'Medium';
          const duplicationColor = getChalkColor(getDuplicationColorLevel(issue.value));
          console.log(duplicationColor(`${icon} ${dupLabel} duplication: ${issue.value}%`));
        }
      });
      
      console.log(); // Empty line between files
    });
  }
  
  // Quick wins to improve score
  if (score < 90 && topFiles.length > 0) {
    console.log(chalk.bold('💡 Quick wins to improve score:\n'));
    
    // Calculate potential improvements
    const improvements: string[] = [];
    
    // Check for extreme complexity files
    const extremeComplexityFiles = result.files.filter(f => f.complexityRatio && f.complexityRatio > 50);
    if (extremeComplexityFiles.length > 0) {
      const potentialGain = Math.min(8, Math.round(extremeComplexityFiles.length * 2));
      improvements.push(`Split top ${Math.min(3, extremeComplexityFiles.length)} complex files into modules (potential +${potentialGain} points)`);
    }
    
    // Check for very large files
    const veryLargeFiles = result.files.filter(f => f.sizeRatio && f.sizeRatio > 10);
    if (veryLargeFiles.length > 0) {
      const potentialGain = Math.min(5, Math.round(veryLargeFiles.length * 1.5));
      improvements.push(`Break down ${Math.min(5, veryLargeFiles.length)} large files (potential +${potentialGain} points)`);
    }
    
    // Check for high duplication
    const highDuplicationFiles = result.files.filter(f => f.duplication && f.duplication > 30);
    if (highDuplicationFiles.length > 0) {
      const potentialGain = Math.min(4, Math.round(highDuplicationFiles.length));
      improvements.push(`Address duplication in ${highDuplicationFiles.length} files (potential +${potentialGain} points)`);
    }
    
    // Show top 3 improvements
    improvements.slice(0, 3).forEach(improvement => {
      console.log(chalk.gray(`  • ${improvement}`));
    });
    
    console.log();
  }
  
  // Footer
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`✅ ${chalk.bold('Analysis complete!')} Run regularly to track progress.\n`);
}