// File: src/reporter.ts - Enhanced CLI Reporter with Perfect Alignment
import chalk from 'chalk';
import { AnalysisResult, FileDetail, Issue, Severity, IssueType, CodeContext, DuplicationMode } from './types';

// Configuration for alignment
const COLUMN_CONFIG = {
  label: 20,        // Width for labels
  value: 12,        // Width for values
  description: 40,  // Width for descriptions
  indent: 2,        // Spaces for indentation
  subIndent: 4      // Spaces for sub-items
};

// Unicode symbols
const SYMBOLS = {
  arrow: '→',
  bullet: '•',
  success: '✓',
  error: '✗',
  warning: '⚠',
  star: '★',
  box: '■',
  boxEmpty: '□',
  progressFull: '█',
  progressEmpty: '░',
  verticalLine: '│',
  horizontalLine: '─',
  cornerTopLeft: '┌',
  cornerTopRight: '┐',
  cornerBottomLeft: '└',
  cornerBottomRight: '┘'
};

/**
 * Pad string to specific length
 */
function padEnd(str: string, length: number): string {
  const visibleLength = str.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, length - visibleLength);
  return str + ' '.repeat(padding);
}

function padStart(str: string, length: number): string {
  const visibleLength = str.replace(/\x1b\[[0-9;]*m/g, '').length;
  const padding = Math.max(0, length - visibleLength);
  return ' '.repeat(padding) + str;
}

/**
 * Create aligned row with label and value
 */
function createAlignedRow(label: string, value: string, indent: number = 0): string {
  const indentStr = ' '.repeat(indent);
  const paddedLabel = padEnd(label, COLUMN_CONFIG.label - indent);
  return `${indentStr}${paddedLabel}${value}`;
}

/**
 * Create a progress bar with exact width
 */
function createProgressBar(value: number, max: number = 100, width: number = 20): string {
  const percentage = Math.min(value / max, 1);
  const filled = Math.round(percentage * width);
  const empty = width - filled;
  
  const filledChars = SYMBOLS.progressFull.repeat(filled);
  const emptyChars = SYMBOLS.progressEmpty.repeat(empty);
  
  // Color the filled part based on percentage
  let coloredBar = '';
  if (percentage >= 0.8) {
    coloredBar = chalk.green(filledChars);
  } else if (percentage >= 0.6) {
    coloredBar = chalk.yellow(filledChars);
  } else {
    coloredBar = chalk.red(filledChars);
  }
  
  return coloredBar + chalk.gray(emptyChars);
}

/**
 * Create a horizontal line
 */
function createSeparator(width: number = 80): string {
  return chalk.gray(SYMBOLS.horizontalLine.repeat(width));
}

/**
 * Create a section header with consistent formatting
 */
function createSectionHeader(title: string): string {
  const line = createSeparator(60);
  return `\n${line}\n${chalk.bold.white(title)}\n${line}`;
}

/**
 * Format file path for consistent display
 */
function formatFilePath(path: string, maxLength: number = 40): string {
  // FileDetail.file is already normalized - trust it
  if (path.length <= maxLength) {
    return padEnd(path, maxLength);
  }
  
  const parts = path.split('/');
  if (parts.length <= 2) {
    return padEnd(path.substring(0, maxLength - 3) + '...', maxLength);
  }
  
  // Shorten middle parts
  const start = parts[0];
  const end = parts[parts.length - 1];
  const shortened = `${start}/.../` + end;
  
  if (shortened.length <= maxLength) {
    return padEnd(shortened, maxLength);
  }
  
  return padEnd(path.substring(0, maxLength - 3) + '...', maxLength);
}

/**
 * Get color based on score - returns a chalk function compatible with v4
 */
function getScoreColor(score: number) {
  if (score >= 90) return chalk.green;
  if (score >= 80) return chalk.greenBright; 
  if (score >= 70) return chalk.yellow;
  if (score >= 60) return chalk.red;
  return chalk.redBright;
}

/**
 * Main reporter function with perfect alignment
 */
export function reportToTerminal(result: AnalysisResult): void {
  const { context, overview, details } = result;
  
  // Clear and start
  console.clear();
  console.log('');
  
  // Header Box
  const projectName = context.project.name;
  const timestamp = new Date(context.analysis.timestamp).toLocaleString();
  
  console.log(chalk.cyan('┌' + '─'.repeat(78) + '┐'));
  console.log(chalk.cyan('│') + chalk.bold.white('  INSIGHTCODE ANALYSIS REPORT').padEnd(95) + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  ' + padEnd(`Project: ${projectName}`, 76) + chalk.cyan('│'));
  console.log(chalk.cyan('│') + '  ' + padEnd(`Date: ${timestamp}`, 76) + chalk.cyan('│'));
  console.log(chalk.cyan('└' + '─'.repeat(78) + '┘'));
  
  // Grade Display with aligned metrics
  console.log(createSectionHeader('QUALITY OVERVIEW'));
  
  const gradeColor = getScoreColor(overview.scores.overall);
  console.log(createAlignedRow('Overall Grade:', `${gradeColor.bold(overview.grade)} (${overview.scores.overall}/100)`));
  console.log(createAlignedRow('Project Health:', createProgressBar(overview.scores.overall)));
  console.log('');
  
  // Individual Scores - perfectly aligned
  console.log(createAlignedRow('Complexity Score:', padStart(overview.scores.complexity.toString(), 3) + '/100  ' + createProgressBar(overview.scores.complexity)));
  console.log(createAlignedRow('Duplication Score:', padStart(overview.scores.duplication.toString(), 3) + '/100  ' + createProgressBar(overview.scores.duplication)));
  console.log(createAlignedRow('Maintainability:', padStart(overview.scores.maintainability.toString(), 3) + '/100  ' + createProgressBar(overview.scores.maintainability)));
  
  // Duplication mode indicator
  const duplicationModeText = context.analysis.duplicationMode === 'strict' 
    ? chalk.yellow('Strict (Industry Standards: SonarQube/Google)') 
    : chalk.blue('Legacy (Permissive for Brownfield)');
  console.log(createAlignedRow('Duplication Mode:', duplicationModeText));
  
  // Statistics - aligned in columns
  console.log(createSectionHeader('PROJECT STATISTICS'));
  
  console.log(createAlignedRow('Files Analyzed:', overview.statistics.totalFiles.toString()));
  console.log(createAlignedRow('Total Lines:', overview.statistics.totalLOC.toLocaleString()));
  console.log(createAlignedRow('Average Complexity:', overview.statistics.avgComplexity.toFixed(1)));
  console.log(createAlignedRow('Average File Size:', overview.statistics.avgLOC.toFixed(0) + ' lines'));
  
  const avgDuplication = overview.statistics.avgDuplicationRatio || 0;
  console.log(createAlignedRow('Average Duplication:', (avgDuplication * 100).toFixed(1) + '%'));
  
  // Critical Files - with perfect sub-item alignment
  const criticalFiles = details
    .filter(f => f.healthScore < 70)
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, 5);
  
  if (criticalFiles.length > 0) {
    console.log(createSectionHeader('CRITICAL FILES REQUIRING ATTENTION'));
    
    criticalFiles.forEach((file, index) => {
      const mainIssue = file.issues.sort((a, b) => b.excessRatio - a.excessRatio)[0];
      
      console.log(`\n${chalk.red.bold(`${index + 1}.`)} ${chalk.red(formatFilePath(file.file))}`);
      
      // Sub-items with consistent arrow alignment
      console.log(createAlignedRow(
        `  ${SYMBOLS.arrow} Health:`,
        `${createProgressBar(file.healthScore, 100, 10)} ${padStart(file.healthScore.toString(), 3)}/100`,
        COLUMN_CONFIG.subIndent
      ));
      
      if (mainIssue) {
        // Get the actual metric value based on issue type
        let actualValue = '';
        if (mainIssue.type === IssueType.Complexity) {
          actualValue = `${file.metrics.complexity}`;
        } else if (mainIssue.type === IssueType.Size) {
          actualValue = `${file.metrics.loc} lines`;
        } else if (mainIssue.type === IssueType.Duplication) {
          actualValue = `${(file.metrics.duplicationRatio * 100).toFixed(1)}%`;
        }
        
        console.log(createAlignedRow(
          `  ${SYMBOLS.arrow} Issue:`,
          `${mainIssue.type} (${mainIssue.severity})`,
          COLUMN_CONFIG.subIndent
        ));
        console.log(createAlignedRow(
          `  ${SYMBOLS.arrow} Value:`,
          `${actualValue} (${mainIssue.excessRatio.toFixed(1)}x threshold)`,
          COLUMN_CONFIG.subIndent
        ));
      }
      
      if (file.dependencies && file.dependencies.incomingDependencies > 0) {
        console.log(createAlignedRow(
          `  ${SYMBOLS.arrow} Impact:`,
          `${file.dependencies.incomingDependencies} files depend on this`,
          COLUMN_CONFIG.subIndent
        ));
      }
    });
  }
  
  // Architecture Insights - if available
  if (hasArchitectureData(details)) {
    console.log(createSectionHeader('ARCHITECTURE INSIGHTS'));
    
    // Hub Files
    const hubFiles = details
      .filter(f => f.dependencies && f.dependencies.incomingDependencies > 10)
      .sort((a, b) => b.dependencies.incomingDependencies - a.dependencies.incomingDependencies)
      .slice(0, 3);
    
    if (hubFiles.length > 0) {
      console.log(chalk.bold('\nCentral Hub Files:'));
      hubFiles.forEach(file => {
        console.log(createAlignedRow(
          `  ${SYMBOLS.arrow} ${formatFilePath(file.file, 35)}`,
          `${file.dependencies.incomingDependencies} dependents`,
          COLUMN_CONFIG.subIndent
        ));
      });
    }
    
    // Unstable Files
    const unstableFiles = details
      .filter(f => f.dependencies && f.dependencies.instability > 0.8)
      .slice(0, 3);
    
    if (unstableFiles.length > 0) {
      console.log(chalk.bold('\nUnstable Files (high change risk):'));
      unstableFiles.forEach(file => {
        console.log(createAlignedRow(
          `  ${SYMBOLS.arrow} ${formatFilePath(file.file, 35)}`,
          `instability: ${(file.dependencies.instability * 100).toFixed(0)}%`,
          COLUMN_CONFIG.subIndent
        ));
      });
    }
  }
  
  // Issues Summary - aligned table
  const allIssues = details.flatMap(f => f.issues);
  if (allIssues.length > 0) {
    console.log(createSectionHeader('ISSUES SUMMARY'));
    
    // Group by severity
    const issuesBySeverity = allIssues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group by type
    const issuesByType = allIssues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(chalk.bold('\nBy Severity:'));
    Object.entries(issuesBySeverity)
      .sort(([a], [b]) => getSeverityOrder(a) - getSeverityOrder(b))
      .forEach(([severity, count]) => {
        const color = getSeverityColor(severity);
        console.log(createAlignedRow(
          `  ${severity}:`,
          color(count.toString()),
          COLUMN_CONFIG.subIndent
        ));
      });
    
    console.log(chalk.bold('\nBy Type:'));
    Object.entries(issuesByType)
      .sort(([, a], [, b]) => b - a)
      .forEach(([type, count]) => {
        console.log(createAlignedRow(
          `  ${type}:`,
          count.toString(),
          COLUMN_CONFIG.subIndent
        ));
      });
  }
  
  // Recommendations - well formatted
  console.log(createSectionHeader('ACTIONABLE RECOMMENDATIONS'));
  
  const recommendations = generateRecommendations(details);
  recommendations.slice(0, 5).forEach((rec, index) => {
    console.log(`\n${chalk.green.bold(`${index + 1}.`)} ${chalk.green(rec.title)}`);
    console.log(createAlignedRow(
      `  ${SYMBOLS.arrow} Action:`,
      rec.description,
      COLUMN_CONFIG.subIndent
    ));
    console.log(createAlignedRow(
      `  ${SYMBOLS.arrow} Impact:`,
      `+${rec.impact} points`,
      COLUMN_CONFIG.subIndent
    ));
    console.log(createAlignedRow(
      `  ${SYMBOLS.arrow} Effort:`,
      rec.effort,
      COLUMN_CONFIG.subIndent
    ));
  });
  
  // Footer
  console.log('\n' + createSeparator());
  console.log(chalk.gray(`InsightCode v${context.analysis.toolVersion} • Analysis completed in ${context.analysis.durationMs}ms`));
  console.log(chalk.gray(`Run with --format=json for detailed data export`));
}

// Helper functions

function hasArchitectureData(details: FileDetail[]): boolean {
  return details.some(f => f.dependencies && f.dependencies.incomingDependencies > 0);
}

function getSeverityOrder(severity: string): number {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  return order[severity.toLowerCase()] || 99;
}

function getSeverityColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'critical': return chalk.red.bold;
    case 'high': return chalk.red;
    case 'medium': return chalk.yellow;
    case 'low': return chalk.green;
    default: return chalk.gray;
  }
}

interface Recommendation {
  title: string;
  description: string;
  impact: number;
  effort: string;
}

function generateRecommendations(details: FileDetail[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // High complexity files
  const highComplexityFiles = details
    .filter(f => f.metrics.complexity > 20)
    .sort((a, b) => b.metrics.complexity - a.metrics.complexity);
    
  if (highComplexityFiles.length > 0) {
    recommendations.push({
      title: `Refactor ${formatFilePath(highComplexityFiles[0].file, 30)}`,
      description: 'Split complex functions into smaller units',
      impact: Math.min(15, highComplexityFiles.length * 3),
      effort: '2-4 hours'
    });
  }
  
  // Duplication issues
  const duplicationFiles = details
    .filter(f => f.metrics.duplicationRatio > 0.1)
    .sort((a, b) => b.metrics.duplicationRatio - a.metrics.duplicationRatio);
    
  if (duplicationFiles.length > 0) {
    recommendations.push({
      title: `Extract duplicated code`,
      description: `${duplicationFiles.length} files have >10% duplication`,
      impact: Math.min(20, duplicationFiles.length * 5),
      effort: '3-5 hours'
    });
  }
  
  // Architectural improvements
  const hubFiles = details
    .filter(f => f.dependencies && f.dependencies.incomingDependencies > 15)
    .sort((a, b) => b.dependencies.incomingDependencies - a.dependencies.incomingDependencies);
    
  if (hubFiles.length > 0) {
    recommendations.push({
      title: `Decouple ${formatFilePath(hubFiles[0].file, 30)}`,
      description: 'Reduce coupling with dependency injection',
      impact: 25,
      effort: '1-2 days'
    });
  }
  
  // Large files
  const largeFiles = details
    .filter(f => f.metrics.loc > 500)
    .sort((a, b) => b.metrics.loc - a.metrics.loc);
    
  if (largeFiles.length > 0) {
    recommendations.push({
      title: `Split large file`,
      description: `${formatFilePath(largeFiles[0].file, 30)} has ${largeFiles[0].metrics.loc} lines`,
      impact: 10,
      effort: '4-6 hours'
    });
  }
  
  return recommendations.sort((a, b) => {
    const aRatio = a.impact / (a.effort.includes('day') ? 16 : 4);
    const bRatio = b.impact / (b.effort.includes('day') ? 16 : 4);
    return bRatio - aRatio;
  });
}