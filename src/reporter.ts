import chalk from 'chalk';
import * as process from 'process';
import { AnalysisResult } from './types';
import { calculateFileScores } from './fileScoring';

function getSeverityLabel(ratio?: number): string {
  if (!ratio) return '';
  if (ratio >= 100) return 'Extreme';
  if (ratio >= 50) return 'Very High';
  if (ratio >= 10) return 'High';
  if (ratio >= 2.5) return 'Medium';
  return 'Low';
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
  const { summary, score, grade } = result;
  
  // Header
  console.log(chalk.bold.cyan('\n📊 InsightCode Analysis Report\n'));
  
  // Overall Score
  const gradeColor = score >= 90 ? chalk.green :
                    score >= 80 ? chalk.greenBright :
                    score >= 70 ? chalk.yellow :
                    score >= 60 ? chalk.yellowBright :
                    chalk.red;
  
  console.log(`${chalk.bold('Overall Score:')} ${gradeColor(`${grade} (${score}/100)`)}\n`);
  
  // Summary
  console.log(chalk.bold('Summary:'));
  console.log(`  Files analyzed: ${chalk.cyan(summary.totalFiles)}`);
  console.log(`  Total lines: ${chalk.cyan(formatNumber(summary.totalLines))}`);
  
  const complexityColor = summary.avgComplexity <= 10 ? chalk.green :
                         summary.avgComplexity <= 20 ? chalk.yellow :
                         chalk.red;
  const complexityLabel = summary.avgComplexity <= 10 ? 'Low' :
                         summary.avgComplexity <= 20 ? 'Medium' :
                         summary.avgComplexity <= 50 ? 'High' :
                         summary.avgComplexity <= 200 ? 'Very High' :
                         'Extreme';
  console.log(`  Avg complexity: ${complexityColor(`${summary.avgComplexity} (${complexityLabel})`)}`);
  console.log(`  Avg duplication: ${chalk.cyan(summary.avgDuplication + '%')} ${chalk.gray('(project average)')}\n`);
  
  // Metrics with correct scores
  console.log(chalk.bold('Metrics:'));
  
  // Use already calculated scores from analyzer
  const complexityScore = Math.round(result.scores.complexity);
  const duplicationScore = Math.round(result.scores.duplication);
  const maintainabilityScore = Math.round(result.scores.maintainability);
  
  // Complexity (40% weight)
  const complexityScoreColor = complexityScore >= 80 ? chalk.green :
                              complexityScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Complexity      ${progressBar(complexityScore)} ${complexityScoreColor(complexityScore + '%')}`);
  
  // Duplication (30% weight)
  const duplicationColor = duplicationScore >= 80 ? chalk.green :
                          duplicationScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Duplication     ${progressBar(duplicationScore)} ${duplicationColor(duplicationScore + '%')}`);
  
  // File Size & Structure (30% weight)
  const maintainabilityColor = maintainabilityScore >= 80 ? chalk.green :
                              maintainabilityScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Maintainability ${progressBar(maintainabilityScore)} ${maintainabilityColor(maintainabilityScore + '%')}\n`);
  
  // Top Critical Files
  const fileScores = calculateFileScores(result.files);
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
        const color = issue.severity === 'high' ? chalk.red :
                     issue.severity === 'medium' ? chalk.yellow : chalk.gray;
        
        if (issue.type === 'complexity' && issue.ratio) {
          const severityLabel = getSeverityLabel(issue.ratio);
          console.log(color(`${icon} ${severityLabel} complexity: ${formatNumber(issue.value)} (${issue.ratio.toFixed(0)}x limit)`));
        } else if (issue.type === 'size' && issue.ratio) {
          const sizeLabel = issue.value > 5000 ? 'Massive' :
                           issue.value > 1000 ? 'Very large' :
                           issue.value > 300 ? 'Large' :
                           'Getting large';
          console.log(color(`${icon} ${sizeLabel} file: ${formatNumber(issue.value)} lines (${issue.ratio.toFixed(0)}x limit)`));
        } else if (issue.type === 'duplication') {
          const dupLabel = issue.value > 40 ? 'Very high' :
                          issue.value > 20 ? 'High' :
                          'Medium';
          console.log(color(`${icon} ${dupLabel} duplication: ${issue.value}%`));
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
    const extremeComplexityFiles = fileScores.filter(f => f.complexityRatio && f.complexityRatio > 50);
    if (extremeComplexityFiles.length > 0) {
      const potentialGain = Math.min(8, Math.round(extremeComplexityFiles.length * 2));
      improvements.push(`Split top ${Math.min(3, extremeComplexityFiles.length)} complex files into modules (potential +${potentialGain} points)`);
    }
    
    // Check for very large files
    const veryLargeFiles = fileScores.filter(f => f.sizeRatio && f.sizeRatio > 10);
    if (veryLargeFiles.length > 0) {
      const potentialGain = Math.min(5, Math.round(veryLargeFiles.length * 1.5));
      improvements.push(`Break down ${Math.min(5, veryLargeFiles.length)} large files (potential +${potentialGain} points)`);
    }
    
    // Check for high duplication
    const highDuplicationFiles = fileScores.filter(f => f.duplication && f.duplication > 30);
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