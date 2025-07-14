// File: reporter.ts
import { ReportResult, AnalysisResult, Overview, FileDetail, FileIssue, FunctionQualityIssue } from './types';
import { formatK, truncatePath, padEnd } from './shared-report-utils';

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

/**
 * Formats an issue string to fit within a max length, abbreviating if necessary.
 */
function formatIssueString(issue: FileIssue | undefined, maxLength: number): string {
    if (!issue) {
        return Ansi.gray('N/A');
    }

    const icon = Ansi.red('🔴');
    const type = issue.type;
    const severity = issue.severity;

    const fullText = `${icon} ${type} (${severity})`;
    const visibleLength = fullText.replace(/\x1b\[[0-9;]*m/g, '').length;

    if (visibleLength <= maxLength) {
        return fullText;
    }
    
    const shortSeverity = severity.substring(0, 4);
    const shortText = `${icon} ${type} (${shortSeverity}.)`;
    const shortVisibleLength = shortText.replace(/\x1b\[[0-9;]*m/g, '').length;

    if (shortVisibleLength <= maxLength) {
        return shortText;
    }

    const availableSpaceForType = maxLength - (shortVisibleLength - type.length);
    const shortType = type.substring(0, availableSpaceForType - 4) + '...';
    return `${icon} ${shortType} (${shortSeverity}.)`;
}

/**
 * Creates a colored badge for the project grade.
 */
function formatGradeBadge(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
    const blackText = (s: string) => Ansi.color(0, s);
    const gradeText = ` ${grade} `;
    switch (grade) {
        case 'A': return Ansi.bg_color(40, blackText(gradeText)); // Green
        case 'B': return Ansi.bg_color(118, blackText(gradeText)); // Light Green
        case 'C': return Ansi.bg_color(226, blackText(gradeText)); // Yellow
        case 'D': return Ansi.bg_color(208, blackText(gradeText)); // Orange
        case 'F': return Ansi.bg_color(196, blackText(gradeText)); // Red
        default: return grade;
    }
}


/**
 * Returns an ANSI color code based on issue severity.
 */
function getSeverityColorCode(severity: 'critical' | 'high' | 'medium' | 'low'): number {
  switch (severity) {
    case 'critical': return 196; // Red
    case 'high': return 196; // Red
    case 'medium': return 208; // Orange
    case 'low': return 220; // Yellow
    default: return 244; // Gray
  }
}

/**
 * Returns an ANSI color function based on issue severity.
 */
function getSeverityColorForIssue(severity: 'high' | 'medium' | 'low'): (s: string) => string {
    const colorCode = getSeverityColorCode(severity as 'critical' | 'high' | 'medium' | 'low');
    return (s: string) => Ansi.color(colorCode, s);
}

/**
 * Formats the metrics string for the risky files table with right alignment.
 */
function formatMetrics(metrics: { complexity: number, duplicationRatio: number, loc: number }): string {
    const c = metrics.complexity.toString().padStart(5, ' ');
    const d = ((metrics.duplicationRatio * 100).toFixed(0) + "%").padStart(4, ' ');
    const l = formatK(metrics.loc).padStart(4, ' ');
    return `C:${c} D:${d} L:${l}`;
}

/**
 * Gets risky files sorted by health score.
 */
function getRiskyFiles(details: FileDetail[], count: number = 6): FileDetail[] {
    return [...details]
        .sort((a, b) => a.healthScore - b.healthScore)
        .slice(0, count);
}


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
    const overviewTitle = `OVERVIEW: GRADE ${gradeBadge}`;

    lines.push(Ansi.bold(`┌${'─'.repeat(widths[0]+2)}┬${'─'.repeat(widths[1]+2)}┬${'─'.repeat(widths[2]+2)}┐`));
    lines.push(createTableRow([overviewTitle, Ansi.gray(summary), ''], widths));
    lines.push(createTableSeparator(widths));

    const metrics = [
        { key: 'Complexity', score: scores.complexity, color: Ansi.orange },
        { key: 'Duplication', score: scores.duplication, color: Ansi.green },
        { key: 'Maintainability', score: scores.maintainability, color: Ansi.yellow },
        { key: 'Overall Health', score: scores.overall, color: Ansi.yellow },
    ];

    metrics.forEach(({ key, score, color }) => {
        const label = color(key);
        let scoreStr = color(score.toString());

        if (key === 'Duplication') {
            const duplicationRatio = overview.statistics.avgDuplicationRatio ?? 0;
            const duplicationPercent = (duplicationRatio * 100).toFixed(0);
            scoreStr = `${color(score.toString())} ${Ansi.gray(`(${duplicationPercent}%)`)}`;
        }

        const bar = createProgressBar(score, 64);
        lines.push(createTableRow([label, bar, scoreStr], widths));
    });

    lines.push(Ansi.bold(`└${'─'.repeat(widths[0]+2)}┴${'─'.repeat(widths[1]+2)}┴${'─'.repeat(widths[2]+2)}┘`));
    return lines;
}

function generateStatsAndInsights(analysis: AnalysisResult): string[] {
    const { overview, details } = analysis;
    const stats = overview.statistics;

    // --- Data Extraction ---
    const cycleCount = details.filter(d => d.dependencies.isInCycle).length;

    const keyStats = [
        { label: 'Total Files', value: Ansi.white(stats.totalFiles.toString()) },
        { label: 'Total LOC', value: Ansi.white(formatK(stats.totalLOC)) },
        { label: 'Avg Complexity', value: Ansi.white(stats.avgComplexity.toFixed(1)) },
    ];

    const archConcerns = [
        { label: '🚨 High Maintenance Cost', value: Ansi.white(details.filter(d => d.healthScore < 50).length.toString()) },
        { label: '🐌 Slow to Change Files', value: Ansi.white(details.filter(d => d.metrics.complexity > 30).length.toString()) },
        { label: '🔗 Tightly Coupled Files', value: Ansi.white(cycleCount.toString()) },
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

function generateRiskyFiles(details: FileDetail[]): string[] {
    const riskyFiles = getRiskyFiles(details, 6);

    // Adjusted column widths to ensure alignment
    const widths = [2, 46, 21, 28];
    const totalWidth = widths.reduce((a, b) => a + b, 0) + (widths.length * 3) + 1;
    
    const title = ' TOP 6 RISKY FILES ';
    const topBorderLine = '─'.repeat(totalWidth - title.length - 2);

    const lines = [
        Ansi.bold(`┌${title}${topBorderLine}┐`),
        createTableRow(['S', 'File Path', 'Metrics', 'Primary Issue'], widths),
        createTableSeparator(widths),
    ];

    riskyFiles.forEach(file => {
        const score = Ansi.red(file.healthScore.toString());
        const filePath = truncatePath(file.file, widths[1] - 2);
        const metricsStr = formatMetrics(file.metrics);
        
        const primaryIssue = file.issues.sort((a,b) => {
             const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
             return severityOrder[a.severity] - severityOrder[b.severity];
        })[0];

        const issueStr = formatIssueString(primaryIssue, widths[3]);
        
        lines.push(createTableRow([score, Ansi.gray(filePath), Ansi.gray(metricsStr), issueStr], widths));
    });

    lines.push(Ansi.bold(`└${'─'.repeat(totalWidth - 2)}┘`));
    return lines;
}

function generateDeepDive(analysis: AnalysisResult): string[] {
    const title = Ansi.bold('DEEP DIVE: CRITICAL FUNCTIONS');
    const separator = Ansi.gray('─'.repeat(TOTAL_WIDTH));

    const lines = [title, separator];

    if (!analysis.codeContext || analysis.codeContext.length === 0) {
        lines.push(Ansi.gray('No detailed function context available for this analysis.'));
        return lines;
    }

    const allFunctions = analysis.codeContext.flatMap(context => 
        context.criticalFunctions.map(func => ({ ...func, file: context.file }))
    );

    const topFunctions = allFunctions
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 3);

    if (topFunctions.length === 0) {
        lines.push(Ansi.gray('No critical functions found meeting the reporting threshold.'));
        return lines;
    }
    
    topFunctions.forEach((func, index) => {
        if (index > 0) {
            lines.push(Ansi.gray('· '.repeat(TOTAL_WIDTH / 2)));
        }
        
        lines.push(`\n🎯 ${Ansi.bold(func.name)} in ${Ansi.yellow(truncatePath(func.file, 50))}`);
        lines.push(`   ${Ansi.gray('Metrics:')} Complexity: ${Ansi.orange(func.complexity.toString())} | Lines: ${Ansi.orange(func.lineCount.toString())} | Params: ${Ansi.orange(func.parameterCount.toString())}`);

        if (func.issues.length > 0) {
            lines.push(`   ${Ansi.bold('Detected Issues:')}`);
            
            const severityOrder = { high: 0, medium: 1, low: 2 };
            const sortedIssues: FunctionQualityIssue[] = [...func.issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

            const issueLabels = sortedIssues.map(issue => {
                const colorFunc = getSeverityColorForIssue(issue.severity);
                return `     - ${colorFunc(issue.type)} (${issue.severity})`;
            });

            const maxLabelLength = issueLabels.reduce((max, label) => {
                const visibleLength = label.replace(/\x1b\[[0-9;]*m/g, '').length;
                return Math.max(max, visibleLength);
            }, 0);

            sortedIssues.forEach((issue, i) => {
                const paddedLabel = padEnd(issueLabels[i], maxLabelLength);
                const issueLine = `${paddedLabel}: ${Ansi.gray(issue.description)}`;
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
        ...generateRiskyFiles(result.analysis.details),
        '',
        ...generateDeepDive(result.analysis),
    ];

    console.log(output.join('\n'));
}
