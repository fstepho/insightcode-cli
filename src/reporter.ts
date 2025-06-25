import chalk from 'chalk';
import { AnalysisResult } from './types';

/**
 * Create ASCII progress bar
 */
function progressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Get color based on score/grade
 */
function getScoreColor(score: number): typeof chalk {
  if (score >= 90) return chalk.green;
  if (score >= 80) return chalk.blue;
  if (score >= 70) return chalk.yellow;
  if (score >= 60) return chalk.magenta;
  return chalk.red;
}

/**
 * Format the analysis results for terminal output
 */
export function reportToTerminal(results: AnalysisResult): void {
  const { summary, score, grade, files } = results;
  
  // Header
  console.log(chalk.bold('\n📊 InsightCode Analysis Report\n'));
  
  // Overall Score with color
  const scoreColor = getScoreColor(score);
  console.log(chalk.bold('Overall Score: ') + scoreColor.bold(`${grade} (${score}/100)\n`));
  
  // Summary
  console.log(chalk.bold('Summary:'));
  console.log(`  Files analyzed: ${chalk.cyan(summary.totalFiles)}`);
  console.log(`  Total lines: ${chalk.cyan(summary.totalLines.toLocaleString())}`);
  console.log(`  Avg complexity: ${chalk.cyan(summary.avgComplexity)}`);
  console.log(`  Code duplication: ${chalk.cyan(summary.avgDuplication + '%')}\n`);
  
  // Metrics with progress bars
  console.log(chalk.bold('Metrics:'));
  
  // Complexity score (inverted - lower is better)
  const complexityScore = Math.max(0, 100 - summary.avgComplexity * 5);
  const complexityColor = complexityScore >= 80 ? chalk.green : 
                         complexityScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Complexity      ${progressBar(complexityScore)} ${complexityColor(complexityScore + '%')}`);
  
  // Duplication score (inverted - lower is better)
  const duplicationScore = Math.max(0, 100 - summary.avgDuplication * 2);
  const duplicationColor = duplicationScore >= 80 ? chalk.green :
                          duplicationScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Duplication     ${progressBar(duplicationScore)} ${duplicationColor(duplicationScore + '%')}`);
  
  // Maintainability (composite)
  const maintainabilityScore = Math.round((complexityScore + duplicationScore) / 2);
  const maintainabilityColor = maintainabilityScore >= 80 ? chalk.green :
                              maintainabilityScore >= 60 ? chalk.yellow : chalk.red;
  console.log(`  Maintainability ${progressBar(maintainabilityScore)} ${maintainabilityColor(maintainabilityScore + '%')}\n`);
  
  // Top Issues
  const allIssues = files.flatMap(f => 
    f.issues.map(i => ({ ...i, file: f.path }))
  );
  
  const topIssues = allIssues
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, 5);
  
  if (topIssues.length > 0) {
    console.log(chalk.bold('⚠️  Top Issues:\n'));
    
    for (const issue of topIssues) {
      const icon = issue.severity === 'high' ? '❌' : 
                  issue.severity === 'medium' ? '⚠️' : '💡';
      const color = issue.severity === 'high' ? chalk.red :
                   issue.severity === 'medium' ? chalk.yellow : chalk.gray;
      
      console.log(`${icon} ${chalk.underline(issue.file)}`);
      console.log(`   ${color(issue.message)}\n`);
    }
  }
  
  // Tips based on score
  if (score < 70) {
    console.log(chalk.bold('💡 Tips to improve:\n'));
    
    if (summary.avgComplexity > 10) {
      console.log(chalk.gray('  • Break down complex functions into smaller ones'));
      console.log(chalk.gray('  • Extract nested conditions into separate functions'));
    }
    
    if (summary.avgDuplication > 10) {
      console.log(chalk.gray('  • Extract common code into shared utilities'));
      console.log(chalk.gray('  • Use functions or classes to avoid copy-paste'));
    } else if (summary.avgComplexity <= 10 && summary.avgDuplication <= 10) {
      console.log(chalk.gray('  • Consider breaking large files into modules'));
      console.log(chalk.gray('  • Add unit tests to maintain quality'));
    }
    
    console.log();
  }
  
  // Footer
  const emoji = score >= 90 ? '🎉' : score >= 80 ? '✅' : score >= 70 ? '👍' : '🔧';
  console.log(chalk.gray('─'.repeat(50)));
  console.log(`${emoji} ${chalk.bold('Analysis complete!')} Run regularly to track progress.\n`);
}