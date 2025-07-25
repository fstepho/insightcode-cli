// File: reporter.ts
import { ReportResult, AnalysisResult, Overview, FileDetail, Grade, EmblematicFiles } from './types';
import {
    formatGradeDisplay,
    formatIssueSeverity,
    calculateKeyStatistics,
    // Deep Dive harmonization
    prepareDeepDiveData,
    formatFunctionIssuesForDeepDive,
    // Risky Files harmonization
    prepareRiskyFilesData,
    formatRiskyFileIssue,
    type RiskyFileDisplayInfo,
    // CLI-specific utilities
    formatK,
    truncatePath,
    padEnd
} from './report-utils';

// -----------------------------------------------------------------------------
// SECTION 0: CONFIGURATION
// -----------------------------------------------------------------------------

const TOTAL_WIDTH = 110; // Master width for all tables and boxes

// -----------------------------------------------------------------------------
// SECTION 1: ANSI COLOR AND STYLE MANAGEMENT
// -----------------------------------------------------------------------------

// A simple helper to encapsulate ANSI codes for readability.
const Ansi = {
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  color: (code: number, s: string) => `\x1b[38;5;${code}m${s}\x1b[0m`,
  bg_color: (code: number, s: string) => `\x1b[48;5;${code}m${s}\x1b[0m`,

  // Semantic color palette (self-resetting)
  blue: (s: string) => Ansi.color(75, s),
  gray: (s: string) => Ansi.color(244, s),
  white: (s: string) => Ansi.color(255, s),
  red: (s: string) => Ansi.color(196, s),
  orange: (s: string) => Ansi.color(208, s),
  yellow: (s: string) => Ansi.color(220, s),
  green: (s: string) => Ansi.color(77, s),
  
  // Grade-specific colors derived from shared utils
  gradeColor: (grade: Grade, s: string) => {
    const gradeDisplay = formatGradeDisplay(grade);
    return Ansi.color(gradeDisplay.info.badgeColor, s);
  },
};

// -----------------------------------------------------------------------------
// SECTION 2: FORMATTING AND LAYOUT HELPERS
// -----------------------------------------------------------------------------


/**
 * Creates a visual progress bar with neutral, less bright colors.
 */
function createProgressBar(score: number, width: number): string {
    const filledCount = Math.round((score / 100) * width);
    const emptyCount = width - filledCount;
    const filled = '█'.repeat(filledCount);
    const empty = '░'.repeat(emptyCount);

    // Use a light gray for the filled part to be less flashy than pure white.
    return `${Ansi.color(250, filled)}${Ansi.gray(empty)}`;
}

/**
 * Generates a table row with borders.
 */
function createTableRow(columns: string[], widths: number[]): string {
    const content = columns.map((col, i) => padEnd(col, widths[i])).join(` ${Ansi.bold('│')} `);
    return `${Ansi.bold('│')} ${content} ${Ansi.bold('│')}`;
}

/**
 * Generates a table separator line.
 */
function createTableSeparator(widths: number[]): string {
    const left = '├';
    const right = '┤';
    const cross = '┼';
    const line = '─';
    const separator = widths.map(w => line.repeat(w + 2)).join(Ansi.bold(cross));
    return Ansi.bold(`${left}${separator}${right}`);
}

/**
 * Creates a line of text inside a box, ensuring alignment.
 */
function createBoxedLine(content: string, totalWidth: number): string {
    const innerWidth = totalWidth - 4; // 2 for borders, 2 for spaces
    const paddedContent = padEnd(content, innerWidth);
    return `${Ansi.bold('│')} ${paddedContent} ${Ansi.bold('│')}`;
}

// formatIssueString removed - now using harmonized formatRiskyFileIssue() from report-utils.ts

/**
 * Creates a colored badge for the project grade.
 */
function formatGradeBadge(grade: Grade): string {
    const blackText = (s: string) => Ansi.color(0, s);
    const gradeText = ` ${grade} `;
    // Use centralized display formatting
    const gradeDisplay = formatGradeDisplay(grade);
    return Ansi.bg_color(gradeDisplay.info.badgeColor, blackText(gradeText));
}


// NOTE: getSeverityColorCode moved to scoring.utils.ts - using centralized function

/**
 * Returns an ANSI color function based on issue severity.
 */
function getSeverityColorForIssue(severity: string): (s: string) => string {
    // Use centralized severity formatting
    const severityInfo = formatIssueSeverity(severity as 'critical' | 'high' | 'medium' | 'low');
    return (s: string) => Ansi.color(severityInfo.badge, s);
}

// formatMetrics moved to shared-analysis-utils.ts as formatFileMetrics()

// getRiskyFiles moved to shared-analysis-utils.ts with enhanced logic


// -----------------------------------------------------------------------------
// SECTION 3: REPORT SECTION GENERATION LOGIC
// -----------------------------------------------------------------------------

function generateHeader(result: ReportResult): string[] {
    const repoPath = result.repo.replace(/https?:\/\//, '').replace(/\.git$/, '');
    const header = `${Ansi.blue(Ansi.bold(result.project))} ${Ansi.blue(`v${result.stableVersion}`)}`;
    const subHeader = `(${repoPath}, ${result.stars} stars)`;
    const analysisTime = `Analysis from ${new Date(result.analysis.context.analysis.timestamp).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric'})}, took ${(result.durationMs / 1000).toFixed(1)}s`;

    return [
        Ansi.bold(`┌${'─'.repeat(TOTAL_WIDTH - 2)}┐`),
        createBoxedLine(`${header} ${Ansi.gray(subHeader)}`, TOTAL_WIDTH),
        createBoxedLine(Ansi.gray(analysisTime), TOTAL_WIDTH),
        Ansi.bold(`└${'─'.repeat(TOTAL_WIDTH - 2)}┘`),
    ];
}

function generateOverview(overview: Overview): string[] {
    const { grade, summary, scores } = overview;
    const lines: string[] = [];

    const widths = [24, 66, 10];

    const gradeBadge = formatGradeBadge(grade);
    const overviewTitle = `OVERVIEW: GRADE ${gradeBadge} ${Ansi.gray(`(${scores.overall})`)}`;

    lines.push(Ansi.bold(`┌${'─'.repeat(widths[0]+2)}┬${'─'.repeat(widths[1]+2)}┬${'─'.repeat(widths[2]+2)}┐`));
    lines.push(createTableRow([overviewTitle, Ansi.gray(summary), ''], widths));
    lines.push(createTableSeparator(widths));

    const metrics = [
        { key: 'Complexity', score: scores.complexity, color: Ansi.orange },
        { key: 'Duplication', score: scores.duplication, color: Ansi.green },
        { key: 'Maintainability', score: scores.maintainability, color: Ansi.yellow },
    ];

    metrics.forEach(({ key, score, color }, index) => {
        const label = color(key);
        let scoreStr = color(score.toString());

        if (key === 'Duplication') {
            const duplicationRatio = overview.statistics.avgDuplicationRatio ?? 0;
            const duplicationPercent = (duplicationRatio * 100).toFixed(0);
            scoreStr = `${color(score.toString())} ${Ansi.gray(`(${duplicationPercent}%)`)}`;
        }

        const bar = createProgressBar(score, 64);
        lines.push(createTableRow([label, bar, scoreStr], widths));
        
        // Add spacing between progress bars, except after the last one
        if (index < metrics.length - 1) {
            lines.push(createTableRow(['', '', ''], widths));
        }
    });

    lines.push(Ansi.bold(`└${'─'.repeat(widths[0]+2)}┴${'─'.repeat(widths[1]+2)}┴${'─'.repeat(widths[2]+2)}┘`));
    return lines;
}

function generateStatsAndInsights(analysis: AnalysisResult): string[] {
    const { overview, details } = analysis;
    const stats = overview.statistics;

    // --- Data Extraction using centralized calculations ---
    const keyStatistics = calculateKeyStatistics(details);

    const keyStats = [
        { label: 'Total Files', value: Ansi.white(stats.totalFiles.toString()) },
        { label: 'Total LOC', value: Ansi.white(formatK(stats.totalLOC)) },
        { label: 'Avg Complexity', value: Ansi.white(stats.avgComplexity.toFixed(1)) },
    ];

    const archConcerns = [
        { label: '🚨 High Maintenance Cost', value: Ansi.white(keyStatistics.highMaintenanceCostFiles.toString()) },
        { label: '🐌 Slow to Change Files', value: Ansi.white(keyStatistics.slowToChangeFiles.toString()) },
        { label: '🔗 Tightly Coupled Files', value: Ansi.white(keyStatistics.tightlyCoupledFiles.toString()) },
    ];

    // --- Layout Configuration ---
    const widths = [51, 52];
    const keyStatsLabelWidth = 16;
    const archConcernsLabelWidth = 32;

    // --- Table Construction ---
    const lines = [
        Ansi.bold(`┌${'─'.repeat(widths[0] + 2)}┬${'─'.repeat(widths[1] + 2)}┐`),
        createTableRow(['KEY STATS', 'BUSINESS IMPACT'], widths),
        createTableSeparator(widths),
    ];

    for (let i = 0; i < 3; i++) {
        const statCol = `${padEnd(keyStats[i].label, keyStatsLabelWidth)}${keyStats[i].value}`;
        const concernCol = `${padEnd(archConcerns[i].label, archConcernsLabelWidth)}${archConcerns[i].value}`;
        lines.push(createTableRow([statCol, concernCol], widths));
    }

    lines.push(Ansi.bold(`└${'─'.repeat(widths[0] + 2)}┴${'─'.repeat(widths[1] + 2)}┘`));

    return lines;
}

function generateRiskyFiles(details: FileDetail[], emblematicFiles?: EmblematicFiles): string[] {
    // Use harmonized risky files logic
    const riskyFilesData = prepareRiskyFilesData(details, emblematicFiles);
    const riskyFiles = riskyFilesData.files;

    // Adjusted column widths to ensure alignment
    const widths = [2, 46, 21, 28];
    const totalWidth = widths.reduce((a, b) => a + b, 0) + (widths.length * 3) + 1;
    
    const title = ' CRITICAL FILES REQUIRING ATTENTION ';
    const topBorderLine = '─'.repeat(totalWidth - title.length - 2);

    const lines = [
        Ansi.bold(`┌${title}${topBorderLine}┐`),
        createTableRow(['S', 'File Path', 'Metrics', 'Primary Issue'], widths),
        createTableSeparator(widths),
    ];

    riskyFiles.forEach(riskyFile => {
        const score = Ansi.red(riskyFile.healthScore.toString());
        
        // Handle emblematic files with marker
        const fileDisplayPath = riskyFile.isEmblematic 
            ? `⭐ ${riskyFile.file}` 
            : riskyFile.file;
        const filePath = truncatePath(fileDisplayPath, widths[1] - 2);
        
        const metricsStr = riskyFile.metrics.formattedMetrics;
        
        // Use harmonized issue formatting
        const issueStr = formatRiskyFileIssue(riskyFile, 'cli', widths[3]);
        
        lines.push(createTableRow([score, Ansi.gray(filePath), Ansi.gray(metricsStr), issueStr], widths));
    });

    lines.push(Ansi.bold(`└${'─'.repeat(totalWidth - 2)}┘`));
    return lines;
}
function generateDeepDive(analysis: AnalysisResult): string[] {
    const title = Ansi.bold('DEEP DIVE: KEY FUNCTION ANALYSIS');
    const separator = Ansi.gray('─'.repeat(TOTAL_WIDTH));

    const lines = [title, separator];

    // Use harmonized Deep Dive logic
    const deepDiveData = prepareDeepDiveData(analysis.details);

    if (!deepDiveData.hasData) {
        lines.push(Ansi.gray('No critical functions found meeting the reporting threshold.'));
        return lines;
    }
    
    deepDiveData.functions.forEach((func, index) => {
        if (index > 0) {
            lines.push(Ansi.gray('· '.repeat(TOTAL_WIDTH / 2)));
        }
        
        // Get the highest severity issue color for the function
        const issueData = formatFunctionIssuesForDeepDive(func, 'cli');
        let functionColor = Ansi.bold;
        if (issueData.hasIssues && issueData.sortedIssues.length > 0) {
            const highestSeverity = issueData.sortedIssues[0].severity;
            const severityColorFunc = getSeverityColorForIssue(highestSeverity);
            functionColor = (s: string) => Ansi.bold(severityColorFunc(s));
        }
        
        lines.push(`\n🎯 ${functionColor(func.name)} in ${Ansi.white(truncatePath(func.file, 50))}`);
        
        // Use inline metrics formatting for CLI
        lines.push(`   ${Ansi.gray('Metrics:')} Complexity: ${Ansi.orange(func.complexity.toString())} | Lines: ${Ansi.orange(func.loc.toString())} | Params: ${Ansi.orange(func.parameterCount.toString())}`);
        if (issueData.hasIssues) {
            lines.push(`   ${Ansi.bold('Detected Issues:')}`);
            
            const issueLabels = issueData.sortedIssues.map(issue => {
                const colorFunc = getSeverityColorForIssue(issue.severity);
                return `     - ${colorFunc(issue.type)} (${issue.severity})`;
            });

            const maxLabelLength = issueLabels.reduce((max, label) => {
                const visibleLength = label.replace(/\x1b\[[0-9;]*m/g, '').length;
                return Math.max(max, visibleLength);
            }, 0);

            issueData.sortedIssues.forEach((_, i) => {
                const paddedLabel = padEnd(issueLabels[i], maxLabelLength);
                // Use implications instead of descriptions for better clarity
                const impliedIssue = issueData.issuesDetailedWithImplications[i];
                const implicationText = impliedIssue.includes(': ') ? impliedIssue.split(': ')[1] : 'Review for best practices';
                const issueLine = `${paddedLabel}: ${Ansi.gray(implicationText)}`;
                lines.push(issueLine);
            });
        }
    });
    
    return lines;
}


// -----------------------------------------------------------------------------
// SECTION 4: MAIN EXPORTED FUNCTION
// -----------------------------------------------------------------------------

/**
 * Orchestrates the generation and printing of the full report to the console.
 */
export function generateCliOutput(result: ReportResult): void {
    const output: string[] = [
        ...generateHeader(result),
        '',
        ...generateOverview(result.analysis.overview),
        '',
        ...generateStatsAndInsights(result.analysis),
        '',
        ...generateRiskyFiles(result.analysis.details, result.emblematicFiles),
        '',
        ...generateDeepDive(result.analysis),
    ];

    console.log(output.join('\n'));
}
