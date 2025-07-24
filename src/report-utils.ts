// File: src/shared-analysis-utils.ts
// Centralisation des fonctions d'analyse partagées entre reporter.ts et project-report-generator.ts

import { FileDetail, FunctionAnalysis, Grade, EmblematicFiles } from './types';
import { 
    getGradeInfoByGrade,
    getScoreStatus,
    getCriticalFiles,
    isFileEmblematic,
    getFilePrimaryConcern,
    COMPLEXITY_LEVELS,
    ISSUE_SEVERITY,
    GRADE_CONFIG
} from './scoring.utils';
import { getPatternImplication } from './markdown-report-utils';

// Type for function analysis with file information
export type FunctionWithFile = FunctionAnalysis & { file: string };

// ============================================================================
// SHARED UTILITIES FOR BOTH CLI AND MARKDOWN REPORTS
// ============================================================================

/**
 * Formats a large number into a 'k' (thousands) format.
 * Used by both CLI and Markdown reports
 */
export function formatK(num: number): string {
    return num > 999 ? `${(num / 1000).toFixed(0)}k` : `${num}`;
}

/**
 * Truncates and formats a file path for concise display.
 * Used by both CLI and Markdown reports
 */
export function truncatePath(filePath: string, maxLength: number): string {
    if (filePath.length <= maxLength) {
        return filePath;
    }
    const parts = filePath.split('/');
    if (parts.length > 2) {
        const end = parts.pop() || '';
        const start = parts.shift() || '';
        const shortPath = `${start}/.../${end}`;
        if (shortPath.length <= maxLength) return shortPath;
    }
    return '...' + filePath.slice(-maxLength + 3);
}

/**
 * Pads a string with trailing spaces to a specific length, ignoring ANSI codes.
 * Used primarily by CLI reports for alignment
 */
export function padEnd(str: string, length: number): string {
    const visibleLength = str.replace(/\x1b\[[0-9;]*m/g, '').length;
    return str + ' '.repeat(Math.max(0, length - visibleLength));
}

/**
 * Centralised function to get risky/critical files with consistent sorting
 * Replaces both getRiskyFiles() from reporter.ts and getCriticalFiles() usage
 */
function getRiskyFiles(details: FileDetail[], emblematicFiles?: EmblematicFiles, count: number = 6): FileDetail[] {
    // Use the existing getCriticalFiles logic but allow custom count
    const criticalFiles = getCriticalFiles(details, emblematicFiles);
    return criticalFiles.slice(0, count);
}

/**
 * Centralised metrics formatting for consistent display across reports
 * From reporter.ts formatMetrics() with enhanced formatting
 */
function formatFileMetrics(metrics: { complexity: number, duplicationRatio: number, loc: number }): string {
    const c = metrics.complexity.toString().padStart(5, ' ');
    const d = ((metrics.duplicationRatio * 100).toFixed(0) + "%").padStart(4, ' ');
    const l = formatK(metrics.loc).padStart(4, ' ');
    return `C:${c} D:${d} L:${l}`;
}

// formatK now defined above to avoid duplication

/**
 * Centralised grade display formatting
 * Harmonises getGradeInfoByGrade() usage across both files
 */
export function formatGradeDisplay(grade: Grade): {
    badge: string;
    visual: string;
    info: (typeof GRADE_CONFIG)[number];
} {
    const gradeInfo = getGradeInfoByGrade(grade);
    return {
        badge: gradeInfo.visualEmoji,
        visual: `${gradeInfo.visualEmoji} **${grade}**`,
        info: gradeInfo
    };
}

/**
 * Centralised score status formatting
 * Ensures consistent use of getScoreStatus() across files
 */
export function getFormattedScoreStatus(score: number): {
    full: string;        // Complete status with emoji
    label: string;       // Just the label part
    emoji: string;       // Just the emoji part
} {
    const fullStatus = getScoreStatus(score);
    const parts = fullStatus.split(' ');
    const emoji = parts[0];
    const label = parts.slice(1).join(' ');
    
    return {
        full: fullStatus,
        label,
        emoji
    };
}

/**
 * Centralised severity formatting
 * Harmonises ISSUE_SEVERITY access and getSeverityEmoji() usage
 */
export function formatIssueSeverity(severity: 'critical' | 'high' | 'medium' | 'low'): {
    emoji: string;
    color: string;
    colorCode: number;
    badge: number;
} {
    const severityConfig = ISSUE_SEVERITY[severity];
    return {
        emoji: severityConfig.emoji,
        color: severityConfig.color,
        colorCode: severityConfig.ansiColorCode,
        badge: severityConfig.getBadgeColor()
    };
}

/**
 * Centralised complexity threshold access
 * Harmonises COMPLEXITY_LEVELS usage across files
 */
function getComplexityThresholds() {
    return {
        low: COMPLEXITY_LEVELS.low.maxThreshold,         // 10
        medium: COMPLEXITY_LEVELS.medium.maxThreshold,   // 15  
        high: COMPLEXITY_LEVELS.high.maxThreshold,       // 20
        veryHigh: COMPLEXITY_LEVELS.veryHigh.maxThreshold, // 50
        extreme: COMPLEXITY_LEVELS.extreme.maxThreshold    // Infinity
    };
}

/**
 * Centralised function analysis extraction
 * Harmonises function extraction logic from FileDetail.functions
 */
function extractFunctionsWithFiles(details: FileDetail[]): FunctionWithFile[] {
    return details.flatMap((detail: FileDetail) => 
        detail.functions?.map((func: FunctionAnalysis) => ({ ...func, file: detail.file })) || []
    );
}

/**
 * Centralised top functions selection
 * Now considers severity for selection and sorting
 */
function getTopComplexFunctions(functionsWithFile: FunctionWithFile[], count: number = 5): FunctionWithFile[] {
    return functionsWithFile
        .sort((a, b) => {
            // First, sort by highest severity issue
            const aSeverityWeight = getMaxSeverityWeight(a.issues);
            const bSeverityWeight = getMaxSeverityWeight(b.issues);
            
            if (aSeverityWeight !== bSeverityWeight) {
                return bSeverityWeight - aSeverityWeight; // Higher severity first
            }
            
            // If severity is equal, sort by complexity
            return b.complexity - a.complexity;
        })
        .slice(0, count);
}

/**
 * Get the maximum severity weight for a function's issues
 */
function getMaxSeverityWeight(issues: any[]): number {
    if (issues.length === 0) return -1; // No issues = lowest priority
    
    const severityWeights: Record<string, number> = { 
        critical: 4, 
        high: 3, 
        medium: 2, 
        low: 1 
    };
    
    return Math.max(...issues.map(issue => severityWeights[issue.severity] || 0));
}

/**
 * Centralised issue sorting by severity
 * Harmonises severity ordering across both files
 * Critical first, then high, medium, low
 */
function sortIssuesBySeverity<T extends { severity: string }>(issues: T[]): T[] {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...issues].sort((a, b) => {
        const orderA = severityOrder[a.severity] !== undefined ? severityOrder[a.severity] : 999;
        const orderB = severityOrder[b.severity] !== undefined ? severityOrder[b.severity] : 999;
        return orderA - orderB;
    });
}

/**
 * Centralised statistics calculation
 * Harmonises key stats calculation between the two files
 */
export function calculateKeyStatistics(details: FileDetail[]): {
    totalFiles: number;
    filesWithCycles: number;
    highMaintenanceCostFiles: number;
    slowToChangeFiles: number;
    tightlyCoupledFiles: number;
} {
    const thresholds = getComplexityThresholds();
    const gradeThresholds = GRADE_CONFIG.find(g => g.grade === 'D')!.threshold;
    
    return {
        totalFiles: details.length,
        filesWithCycles: details.filter(d => d.dependencies.isInCycle).length,
        highMaintenanceCostFiles: details.filter(d => d.healthScore < gradeThresholds).length,
        slowToChangeFiles: details.filter(d => d.metrics.complexity > thresholds.high).length,
        tightlyCoupledFiles: details.filter(d => 
            d.dependencies.incomingDependencies > 5 || 
            d.dependencies.outgoingDependencies > 5
        ).length
    };
}

/**
 * Infer file role from path for architectural analysis
 * Used by both CLI and Markdown reports
 */
export function inferFileRole(filePath: string): string {
    const fileName = filePath.split('/').pop()?.toLowerCase() || '';
    
    if (fileName.includes('index')) return 'Entry point';
    if (fileName.includes('config')) return 'Configuration';
    if (fileName.includes('util') || fileName.includes('helper')) return 'Utilities';
    if (fileName.includes('type') || fileName.includes('interface')) return 'Type definitions';
    if (fileName.includes('router') || fileName.includes('route')) return 'Routing';
    if (fileName.includes('controller')) return 'Controller';
    if (fileName.includes('service')) return 'Service layer';
    if (fileName.includes('model')) return 'Data model';
    
    return 'Core module';
}

// ============================================================================
// DEEP DIVE HARMONIZATION - SHARED LOGIC FOR CLI AND MARKDOWN
// ============================================================================

/**
 * Centralised Deep Dive configuration
 * Harmonises the number of functions and selection criteria
 */
const DEEP_DIVE_CONFIG = {
    FUNCTION_COUNT: 5,  // Unified: both CLI and Markdown show 5 functions (was 3 for CLI, 5 for Markdown)
    MIN_COMPLEXITY_THRESHOLD: 5,  // Only show functions with complexity > 5
    INCLUDE_ISSUES_DETAILS: true, // Both should show detailed issue information
} as const;

/**
 * Centralised Risky Files configuration
 * Harmonises the number of risky files displayed
 */
const RISKY_FILES_CONFIG = {
    COUNT: 6,  // Unified: both CLI and Markdown show 6 risky files (was 6 for CLI, 10 for Markdown)
    INCLUDE_EMBLEMATIC_MARKING: true, // Both should show emblematic file indicators
} as const;

/**
 * Centralised function for getting critical functions for Deep Dive
 * Ensures both CLI and Markdown use the same selection logic
 */
function getCriticalFunctionsForDeepDive(details: FileDetail[]): FunctionWithFile[] {
    const allFunctions = extractFunctionsWithFiles(details);
    
    // Filter functions that are worth analyzing (above threshold)
    const notableFunctions = allFunctions.filter(func => 
        func.complexity >= DEEP_DIVE_CONFIG.MIN_COMPLEXITY_THRESHOLD || 
        func.issues.length > 0
    );
    
    return getTopComplexFunctions(notableFunctions, DEEP_DIVE_CONFIG.FUNCTION_COUNT);
}

/**
 * Centralised function issue formatting for Deep Dive sections
 * Ensures consistent issue display and sorting across CLI and Markdown
 */
export function formatFunctionIssuesForDeepDive(func: FunctionWithFile, format: 'cli' | 'markdown' = 'markdown'): {
    hasIssues: boolean;
    issueCount: number;
    sortedIssues: any[];
    issuesSummary: string;
    issuesSummaryWithImplications: string;
    issuesDetailed: string[];
    issuesDetailedWithImplications: string[];
} {
    const sortedIssues = sortIssuesBySeverity(func.issues);
    const hasIssues = sortedIssues.length > 0;
    
    // Summary format (for tables) - original version
    const issuesSummary = hasIssues 
        ? sortedIssues.map(issue => issue.type).join(', ')
        : '_None_';
    
    // Enhanced summary with implications (new version)
    const issuesSummaryWithImplications = hasIssues 
        ? sortedIssues.map(issue => {
            const implication = getPatternImplication(issue.type, 'quality');
            return `**${issue.type}** (${implication})`;
          }).join('<br/>')
        : '_None_';
    
    // Detailed format (for narratives) - original version
    const issuesDetailed = sortedIssues.map(issue => {
        const severityInfo = formatIssueSeverity(issue.severity as any);
        if (format === 'cli') {
            return `- ${issue.type} (${issue.severity}): ${issue.description || 'No description'}`;
        } else {
            return `**${severityInfo.emoji} ${issue.type}** (${issue.severity}): ${issue.description || 'No description'}`;
        }
    });
    
    // Enhanced detailed format with implications (new version)
    const issuesDetailedWithImplications = sortedIssues.map(issue => {
        const severityInfo = formatIssueSeverity(issue.severity as any);
        const implication = getPatternImplication(issue.type, 'quality');
        if (format === 'cli') {
            return `- ${issue.type} (${issue.severity}): ${implication}`;
        } else {
            return `**${severityInfo.emoji} ${issue.type}** (${issue.severity}): ${implication}`;
        }
    });
    
    return {
        hasIssues,
        issueCount: sortedIssues.length,
        sortedIssues,
        issuesSummary,
        issuesSummaryWithImplications,
        issuesDetailed,
        issuesDetailedWithImplications
    };
}

/**
 * Centralised Deep Dive data preparation
 * Provides unified data structure for both CLI and Markdown rendering
 */
export function prepareDeepDiveData(details: FileDetail[]): {
    functions: FunctionWithFile[];
    hasData: boolean;
    summary: {
        totalFunctions: number;
        criticalFunctions: number;
        avgComplexity: number;
    };
} {
    const criticalFunctions = getCriticalFunctionsForDeepDive(details);
    const allFunctions = extractFunctionsWithFiles(details);
    
    const avgComplexity = allFunctions.length > 0 
        ? allFunctions.reduce((sum, f) => sum + f.complexity, 0) / allFunctions.length
        : 0;
    
    return {
        functions: criticalFunctions,
        hasData: criticalFunctions.length > 0,
        summary: {
            totalFunctions: allFunctions.length,
            criticalFunctions: criticalFunctions.length,
            avgComplexity: Math.round(avgComplexity * 10) / 10
        }
    };
}

// ============================================================================
// RISKY FILES HARMONIZATION - SHARED LOGIC FOR CLI AND MARKDOWN
// ============================================================================

/**
 * Interface for standardized risky file display information
 */
export interface RiskyFileDisplayInfo {
    file: string;
    healthScore: number;
    primaryConcern: string;
    isEmblematic: boolean;
    metrics: {
        complexity: number;
        duplicationRatio: number;
        loc: number;
        formattedMetrics: string; // Compact format for CLI
    };
    primaryIssue?: {
        type: string;
        severity: string;
        description?: string;
    };
}

/**
 * Centralised function for preparing risky files data
 * Ensures both CLI and Markdown use the same selection and formatting logic
 */
export function prepareRiskyFilesData(details: FileDetail[], emblematicFiles?: EmblematicFiles): {
    files: RiskyFileDisplayInfo[];
    hasData: boolean;
    summary: {
        totalRiskyFiles: number;
        emblematicCount: number;
        criticalIssueCount: number;
    };
} {
    const riskyFiles = getRiskyFiles(details, emblematicFiles, RISKY_FILES_CONFIG.COUNT);
    
    const formattedFiles = riskyFiles.map(file => formatRiskyFileInfo(file, emblematicFiles));
    
    const emblematicCount = formattedFiles.filter(f => f.isEmblematic).length;
    const criticalIssueCount = formattedFiles.filter(f => 
        f.primaryIssue?.severity === 'critical'
    ).length;
    
    return {
        files: formattedFiles,
        hasData: formattedFiles.length > 0,
        summary: {
            totalRiskyFiles: formattedFiles.length,
            emblematicCount,
            criticalIssueCount
        }
    };
}

/**
 * Centralised function for formatting risky file information
 * Provides standardized data structure for both CLI and Markdown
 */
function formatRiskyFileInfo(file: FileDetail, emblematicFiles?: EmblematicFiles): RiskyFileDisplayInfo {
    const isEmblematic = isFileEmblematic(file.file, emblematicFiles);
    
    // Get primary concern without recommendation (as requested)
    const filePrimaryConcern = getFilePrimaryConcern(file);
    
    // Get primary issue (highest severity first)
    const sortedIssues = sortIssuesBySeverity(file.issues);
    const primaryIssue = sortedIssues.length > 0 ? {
        type: sortedIssues[0].type,
        severity: sortedIssues[0].severity,
        description: sortedIssues[0].description
    } : undefined;
    
    // Format metrics compactly
    const formattedMetrics = formatFileMetrics(file.metrics);
    
    return {
        file: file.file,
        healthScore: file.healthScore,
        primaryConcern: filePrimaryConcern,
        isEmblematic,
        metrics: {
            complexity: file.metrics.complexity,
            duplicationRatio: file.metrics.duplicationRatio,
            loc: file.metrics.loc,
            formattedMetrics
        },
        primaryIssue
    };
}

/**
 * Centralised function for formatting risky file issues for display
 * Handles both CLI and Markdown formatting needs
 */
export function formatRiskyFileIssue(riskyFile: RiskyFileDisplayInfo, format: 'cli' | 'markdown' = 'markdown', maxLength: number = 28): string {
    if (!riskyFile.primaryIssue) {
        return format === 'cli' ? 'N/A' : '_No issues_';
    }
    
    const issue = riskyFile.primaryIssue;
    const severityInfo = formatIssueSeverity(issue.severity as any);
    
    if (format === 'cli') {
        const icon = severityInfo.emoji;
        const fullText = `${icon} ${issue.type} (${issue.severity})`;
        
        // Truncate if needed for CLI display
        if (fullText.length <= maxLength) {
            return fullText;
        }
        
        const shortSeverity = issue.severity.substring(0, 4);
        const shortText = `${icon} ${issue.type} (${shortSeverity}.)`;
        if (shortText.length <= maxLength) {
            return shortText;
        }
        
        const availableSpace = maxLength - (shortText.length - issue.type.length);
        const shortType = issue.type.substring(0, availableSpace - 4) + '...';
        return `${icon} ${shortType} (${shortSeverity}.)`;
    } else {
        // Markdown format - can be more verbose
        return `**${severityInfo.emoji} ${issue.type}** (${issue.severity})`;
    }
}