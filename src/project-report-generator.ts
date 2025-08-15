// File: src/project-report-generator.ts
/**
 * Générateur de rapports pour un projet individuel
 */

import { AnalysisResult, FileDetail, FunctionIssue, ReportResult, EmblematicFiles, Grade, DuplicationMode, QuickWin, QuickWinsAnalysis, Overview, Context, FunctionAnalysis, Score } from './types';
import { 
    getAverageExcessRatio, 
    generateFileHealthDistribution,
    ratioToPercentage,
    formatPercentage,
    ISSUE_SEVERITY,
    GRADE_CONFIG
} from './scoring.utils';
import {
    formatGradeDisplay,
    getFormattedScoreStatus,
    inferFileRole,
    FunctionWithFile,
    // Deep Dive harmonization
    prepareDeepDiveData,
    formatFunctionIssuesForDeepDive,
    // Risky Files harmonization
    prepareRiskyFilesData,
    RiskyFileDisplayInfo,
    // Function extraction
    extractFunctionsWithFiles
} from './report-utils';
import { FILE_SIZE_THRESHOLDS, IMPROVEMENT_SUGGESTION_THRESHOLDS } from './thresholds.constants';
import {
    formatNumber,
    capitalize,
    getTopAffectedAreas,
    generatePatternTable,
    generateSection,
    isQualityPattern,
    isArchitecturePattern,
    getPatternImplication
} from './markdown-report-utils';
import { QuickWinsReporter } from './quick-wins-reporter';
import { IdeLinkGenerator } from './ide-links';
import path from 'path';

// FunctionWithFile type moved to shared-analysis-utils.ts

/**
 * Génère un rapport détaillé pour un seul projet
 */
export function generateProjectReport(result: ReportResult, enableLinks: boolean): string {
    const { project, analysis, durationMs } = result;
    
    let markdown = `# InsightCode Analysis Report: ${project}\n\n`;
    
    // Project Metadata
    markdown += `## Project Information\n\n`;
    markdown += `- **Name:** ${project}\n`;
    markdown += `- **Type:** ${result.type}\n`;
    markdown += `- **Repository:** ${result.repo}\n`;
    markdown += `- **Version:** ${result.stableVersion}\n`;
    markdown += `- **Stars:** ${result.stars}\n`;
    markdown += `- **Category:** ${result.category}\n\n`;
    
    // Quality Summary - MOVED UP for priority
    markdown += `## Quality Summary\n\n`;
    markdown += generateQualitySummary(analysis, result.emblematicFiles);
    
    // Quick Wins
    if (analysis.quickWinsAnalysis && analysis.quickWinsAnalysis.quickWins.length > 0) {
        markdown += generateQuickWinsSection(analysis.quickWinsAnalysis, analysis.context.project.path, enableLinks);
    }
    
    // Analysis Context
    markdown += `## Analysis Context\n\n`;
    markdown += `- **Timestamp:** ${analysis.context.analysis.timestamp}\n`;
    markdown += `- **Duration:** ${(durationMs / 1000).toFixed(2)}s\n`;
    markdown += `- **Files Analyzed:** ${analysis.context.analysis.filesAnalyzed}\n`;
    markdown += `- **Tool Version:** ${analysis.context.analysis.toolVersion}\n\n`;
    
    // Key Statistics
    markdown += `## Key Statistics\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Files | ${analysis.overview.statistics.totalFiles} |\n`;
    markdown += `| Total Lines of Code | ${formatNumber(analysis.overview.statistics.totalLOC)} |\n`;
    markdown += `| Average Complexity | ${analysis.overview.statistics.avgComplexity.toFixed(1)} |\n`;
    markdown += `| Average LOC per File | ${Math.round(analysis.overview.statistics.avgLOC)} |\n\n`;
    
    // Methodology Notes
    markdown += `### 📊 Scoring Methodology\n\n`;
    markdown += generateScoringMethodologyNotes(analysis);
    
    // Health Distribution
    markdown += `## File Health Distribution\n\n`;
    markdown += generateFileHealthDistribution(analysis.details);
    
    // Critical Files - using harmonized risky files logic
    const riskyFilesData = prepareRiskyFilesData(analysis.details, result.emblematicFiles);
    if (riskyFilesData.hasData) {
        markdown += `## Critical Files Requiring Attention\n\n`;
        markdown += generateCriticalFilesSection(riskyFilesData.files);
    }
    
    // Function Deep Dive - using harmonized Deep Dive logic
    const deepDiveData = prepareDeepDiveData(analysis.details);
    if (deepDiveData.hasData) {
        markdown += generateFunctionDeepDiveSection(deepDiveData.functions);
    }
    
    // Dependency Analysis
    markdown += `## Dependency Analysis\n\n`;
    markdown += generateDependencyInsights(analysis.details);
    
    // Issue Analysis - use all functions for complete statistics
    const allFunctionsData = extractFunctionsWithFiles(analysis.details);
    markdown += `## Issue Analysis\n\n`;
    markdown += generateIssueAnalysis(analysis.details, allFunctionsData);
    
    // Pattern Analysis - use all functions for complete statistics
    if (allFunctionsData.length > 0) {
        markdown += generatePatternAnalysis(allFunctionsData);
    }
    
    // Technical Notes
    markdown += `\n---\n`;
    markdown += `## 🔬 Technical Notes\n\n`;
    markdown += `### Duplication Detection\n`;
    markdown += `- **Algorithm:** Enhanced 8-line literal pattern matching with 20+ token minimum, cross-file exact matches only\n`;
    markdown += `- **Focus:** Copy-paste duplication using MD5 hashing of normalized blocks (not structural similarity)\n`;
    markdown += `- **Philosophy:** Pragmatic approach using regex normalization - avoids false positives while catching actionable duplication\n`;
    
    // Adapt results description based on duplication mode
    const duplicationMode: DuplicationMode = analysis.context?.analysis?.duplicationMode || 'legacy';
    if (duplicationMode === 'strict') {
        markdown += `- **Mode:** STRICT mode active (≤3% = excellent, industry-standard thresholds)\n`;
        markdown += `- **Results:** Typically 0-3% duplication with strict thresholds, aligning with SonarQube standards\n\n`;
    } else {
        markdown += `- **Results:** Typically 0-15% duplication vs ~70% with structural detection tools, filtering imports/trivial declarations\n\n`;
    }
    
    markdown += `### Complexity Calculation\n`;
    markdown += `- **Method:** McCabe Cyclomatic Complexity (1976) + Industry Best Practices\n`;
    markdown += `- **Scoring:** Linear (≤10→20) → Quadratic (20→50) → Exponential (>50) - Rules of the Art\n`;
    markdown += `- **Research Base:** Internal methodology inspired by Pareto Principle - extreme values dominate\n\n`;
    
    markdown += `### Health Score Formula\n`;
    markdown += `- **Base:** 100 points minus penalties\n`;
    markdown += `- **Penalties:** Progressive (linear then exponential) - NO LOGARITHMIC MASKING\n`;
    markdown += `- **Caps:** NO CAPS - extreme values receive extreme penalties (following Pareto principle)\n`;
    markdown += `- **Purpose:** Identify real problems following Pareto principle (80/20)\n`;
    
    return markdown;
}

// Helper functions specific to project reports

function generateQualitySummary(
  analysis: AnalysisResult,
  emblematicFiles?: EmblematicFiles
): string {
  // 1. Visual grade header (e.g. “Grade: 🟡 C”)
  let out = generateGradeVisual(analysis.overview.grade) + '\n';

  // 2. Executive-style bullet (primary concern, context, etc.)
  //    — we reuse the existing logic but strip its own grade line to avoid repetition.
  out += generateNarrativeSummary(analysis, emblematicFiles) + '\n';

  // 3. Compact score table (complexity / maintainability / duplication / overall)
  out += generateScoreTable(
    analysis.overview.scores,
    analysis.overview.statistics.avgDuplicationRatio
  );

  return out;
}

/**
 * Generates a narrative and directive executive summary based on analysis data.
 * @param analysis The complete analysis results object.
 * @param emblematicFiles The emblematic files for context.
 * @returns A markdown string containing the narrative summary.
 */
// ========== HELPER INTERFACES ==========
/**
 * Interface for critical file data used in narrative generation
 */

/**
 * Interface for problem pattern data
 */
interface ProblemPattern {
    category: string;
    count: number;
    percentage: number;
}

// ========== HELPER FUNCTIONS ==========
/**
 * Generates a narrative and directive executive summary based on analysis data.
 * @param analysis The complete analysis results object.
 * @param emblematicFiles The emblematic files for context.
 * @returns A markdown string containing the narrative summary.
 */
function generateNarrativeSummary(analysis: AnalysisResult, emblematicFiles?: EmblematicFiles): string {
    const { overview, details, quickWinsAnalysis: quickWins, context } = analysis;
    const riskyFilesData = prepareRiskyFilesData(details, emblematicFiles);
    const criticalFiles = riskyFilesData.files;

    // Handle healthy codebase scenario
    if (criticalFiles.length === 0) {
        return generateHealthyCodebaseSummary(overview);
    }

    // Build narrative for codebases with issues
    return generateIssueNarrative(
        criticalFiles,
        overview,
        details,
        quickWins,
        context
    );
}

/**
 * Generates a summary for a healthy codebase with no critical issues.
 */
function generateHealthyCodebaseSummary(overview: Overview): string {
    let summary = `**✅ Excellent news:** No critical issues detected. The codebase maintains high quality standards.\n\n`;
    
    const avgComplexity = overview.statistics.avgComplexity;
    const duplicationRate = ratioToPercentage(overview.statistics.avgDuplicationRatio || 0);

    // Suggest proactive improvements even for healthy codebases
    if (avgComplexity > IMPROVEMENT_SUGGESTION_THRESHOLDS.AVG_COMPLEXITY) {
        summary += `**💡 Proactive improvement:** Consider reducing average complexity (currently ${avgComplexity.toFixed(1)}) through strategic function decomposition.\n\n`;
    } else if (duplicationRate > IMPROVEMENT_SUGGESTION_THRESHOLDS.DUPLICATION_PERCENTAGE) {
        summary += `**💡 Proactive improvement:** Consider addressing code duplication (currently ${duplicationRate.toFixed(1)}%) to enhance maintainability.\n\n`;
    }
    
    return summary;
}

/**
 * Generates a narrative for codebases with identified issues.
 */
function generateIssueNarrative(
    criticalFiles: RiskyFileDisplayInfo[],
    overview: Overview,
    details: FileDetail[],
    quickWins: QuickWinsAnalysis | undefined,
    context: Context
): string {
    const projectHealth = assessProjectHealth(overview.grade);
    const mainHotspot = identifyMainHotspot(criticalFiles);
    const criticalExamples = getCriticalExamples(criticalFiles, mainHotspot);
    const patterns = getTopProblemPatterns(quickWins);
    const mostComplexFunction = findMostComplexFunction(details, mainHotspot);
    const architecturalWin = findArchitecturalQuickWin(quickWins);

    // Build the narrative
    let narrative = `With a grade of **${overview.grade}**, **${context.project.name}** is a **${projectHealth}** project. `;
    narrative += `Our analysis identifies the **\`${mainHotspot}\`** module as the primary technical debt concentration. `;

    // Add critical file examples
    if (criticalExamples.length > 0) {
        narrative += formatCriticalExamples(criticalExamples);
    }
    
    // Add problem patterns
    if (patterns.length > 0) {
        narrative += formatProblemPatterns(patterns);
    }
    
    // Add strategic recommendation
    narrative += `\n\n**🎯 Strategic recommendation:** Focus Phase 1 efforts on stabilizing the \`${mainHotspot}\` module. `;
    narrative += formatActionItems(architecturalWin, mostComplexFunction);

    return narrative + '\n';
}

/**
 * Helper functions for cleaner code organization
 */
function assessProjectHealth(grade: Grade): string {
    if (grade <= 'B') return 'robust';
    if (grade === 'C') return 'maintainable but improvable';
    return 'requiring immediate attention';
}

function identifyMainHotspot(criticalFiles: RiskyFileDisplayInfo[]): string {
    const directoryCounts = criticalFiles
        .map(f => f.file.split('/')[0])
        .reduce((acc, dir) => {
            acc[dir] = (acc[dir] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    if (Object.keys(directoryCounts).length === 0) {
        return 'the codebase';
    }

    return Object.entries(directoryCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
}

function getCriticalExamples(criticalFiles: RiskyFileDisplayInfo[], hotspot: string): RiskyFileDisplayInfo[] {
    return criticalFiles
        .filter(f => f.file.startsWith(hotspot))
        .slice(0, 2);
}

function getTopProblemPatterns(quickWins: QuickWinsAnalysis | undefined): ProblemPattern[] {
    return quickWins?.problemPatterns
        ?.map(p => ({
            category: p.category,
            count: p.count,
            percentage: p.percentage
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2) || [];
}

function findMostComplexFunction(details: FileDetail[], hotspot: string): FunctionAnalysis & { file: string } | undefined {
    const allFunctions = details.flatMap(d => 
        d.functions?.map(f => ({...f, file: d.file})) || []
    );
    
    return allFunctions
        .filter(f => f.file.startsWith(hotspot))
        .sort((a, b) => b.complexity - a.complexity)[0];
}

function findArchitecturalQuickWin(quickWins: QuickWinsAnalysis | undefined): QuickWin | undefined {
    const architecturalActions: QuickWin['type'][] = ['split-file', 'reduce-parameters', 'extract-module'];
    return quickWins?.quickWins?.find(qw => architecturalActions.includes(qw.type));
}

function formatCriticalExamples(examples: RiskyFileDisplayInfo[]): string {
    if (examples.length === 0) return '';
    
    let text = `Key concerns include \`${examples[0].file}\` (health score: ${examples[0].healthScore}%)`;
    if (examples.length > 1) {
        text += ` and \`${examples[1].file}\` (health score: ${examples[1].healthScore}%)`;
    }
    return text + '. ';
}

function formatProblemPatterns(patterns: ProblemPattern[]): string {
    if (patterns.length === 0) return '';
    
    const pattern1 = patterns[0];
    const cleanCategory1 = pattern1.category.replace(/ Issues| Violations/g, '').toLowerCase();
    let text = `The most prevalent issues are **${cleanCategory1}** (${pattern1.percentage.toFixed(0)}% of all issues)`;
    
    if (patterns[1]) {
        const cleanCategory2 = patterns[1].category.replace(/ Issues| Violations/g, '').toLowerCase();
        text += ` followed by **${cleanCategory2}**`;
    }
    
    return text + '. ';
}

function formatActionItems(architecturalWin?: QuickWin, complexFunction?: FunctionAnalysis & { file: string }): string {
    const actions = [];
    
    if (architecturalWin) {
        actions.push(`implementing **${architecturalWin.action}** on \`${architecturalWin.file}\``);
    }
    
    if (complexFunction) {
        actions.push(`refactoring the high-complexity function **\`${complexFunction.name}\`** (complexity: ${complexFunction.complexity})`);
    }

    if (actions.length === 0) {
        return 'Begin with a comprehensive review to identify specific improvement opportunities.';
    }

    return `Prioritize ${actions.join(' and ')} for maximum impact.`;
}

function generateExecutiveSummary(analysis: AnalysisResult, emblematicFiles?: EmblematicFiles): string {
    const riskyFilesData = prepareRiskyFilesData(analysis.details, emblematicFiles);
    const criticalFiles = riskyFilesData.files;
    
    let summary = '';
    
    // Identify the biggest problem
    if (criticalFiles.length > 0) {
        const worstFile = criticalFiles[0];
        const primaryConcern = worstFile.primaryConcern;
        const isEmblematic = worstFile.isEmblematic;
        const emblemMark = isEmblematic ? ' (core file)' : '';
        
        summary += `**🚨 Primary Concern:** ${primaryConcern} in \`${worstFile.file}\`${emblemMark}.\n\n`;
        
        // Priority action - removed as requested (no recommendations per file)
        summary += `**🎯 Priority Action:** See function-level analysis for specific improvements.\n\n`;
        
        // Additional context if multiple critical files
        if (criticalFiles.length > 1) {
            summary += `**📊 Additional Context:** ${criticalFiles.length - 1} other files require attention.\n\n`;
        }
    } else {
        // No critical files - good news!
        summary += `**✅ Good News:** No critical issues detected. The codebase maintains good quality standards.\n\n`;
        
        // Still provide next steps for improvement
        const avgComplexity = analysis.overview.statistics.avgComplexity;
        const dupRatio = ratioToPercentage(analysis.overview.statistics.avgDuplicationRatio || 0);
        
        if (avgComplexity > IMPROVEMENT_SUGGESTION_THRESHOLDS.AVG_COMPLEXITY) {
            summary += `**🔧 Improvement Opportunity:** Consider reducing average complexity (${avgComplexity.toFixed(1)}) through function decomposition.\n\n`;
        } else if (dupRatio > IMPROVEMENT_SUGGESTION_THRESHOLDS.DUPLICATION_PERCENTAGE) {
            summary += `**🔧 Improvement Opportunity:** Consider reducing code duplication (${dupRatio.toFixed(1)}%) through refactoring.\n\n`;
        } else {
            summary += `**🔧 Improvement Opportunity:** Focus on maintaining current quality standards during feature development.\n\n`;
        }
    }
    
    return summary;
}

function generateGradeVisual(grade: Grade): string {
    // Use centralized display formatting
    const gradeDisplay = formatGradeDisplay(grade);
    return `### Grade: ${gradeDisplay.visual}\n`;
}

function generateScoreTable(scores: AnalysisResult['overview']['scores'], avgDuplicationRatio?: number): string { 
    let table = `| Dimension | Score (Value) | Status |\n`;
    table += `|:---|:---|:---|\n`;

    // AFFICHE SYSTÉMATIQUEMENT LE POURCENTAGE DE DUPLICATION
    const dupPercent = formatPercentage(avgDuplicationRatio || 0);
    const duplicationText = `${scores.duplication}/100 (${dupPercent} detected)`;

    // Use centralized score status formatting for consistency
    table += `| Complexity | ${scores.complexity}/100 | ${getFormattedScoreStatus(scores.complexity).full} |\n`;
    table += `| Duplication | ${duplicationText} | ${getFormattedScoreStatus(scores.duplication).full} |\n`;
    table += `| Maintainability | ${scores.maintainability}/100 | ${getFormattedScoreStatus(scores.maintainability).full} |\n`;
    table += `| Reliability | ${scores.reliability}/100 | ${getFormattedScoreStatus(scores.reliability).full} |\n`;
    table += `| **Overall** | **${scores.overall}/100** | **${getFormattedScoreStatus(scores.overall).full}** |\n`;
    return table;
}
function generateScoringMethodologyNotes(analysis?: AnalysisResult): string {
    const duplicationMode: DuplicationMode = analysis?.context?.analysis?.duplicationMode || 'legacy';

    let notes = `InsightCode combines **research-based thresholds** with **criticality-weighted aggregation**, following the **Pareto principle**.\n\n`;

    notes += `#### 🔧 Overall Score Calculation\n`;
    notes += `InsightCode uses a **two-step weighted aggregation** process:\n\n`;
    
    notes += `**Step 1:** Each metric is weighted by architectural criticality:\n`;
    notes += `\`\`\`\n`;
    notes += `Weighted_Complexity = Σ(File_Complexity × CriticismScore) / Σ(CriticismScore)\n`;
    notes += `Weighted_Maintainability = Σ(File_Maintainability × CriticismScore) / Σ(CriticismScore)\n`;
    notes += `Weighted_Duplication = Σ(File_Duplication × CriticismScore) / Σ(CriticismScore)\n`;
    notes += `Weighted_Reliability = Σ(File_Reliability × CriticismScore) / Σ(CriticismScore)\n`;
    notes += `\`\`\`\n\n`;
    
    notes += `**Step 2:** Final score combines weighted metrics:\n`;
    notes += `\`\`\`\n`;
    notes += `Overall Score = (Weighted_Complexity × 35%) + (Weighted_Maintainability × 25%) + (Weighted_Duplication × 20%) + (Weighted_Reliability × 20%)\n`;
    notes += `\`\`\`\n\n`;

    notes += `#### 🧮 Metric Configuration\n`;
    notes += `| Metric | Final Weight | Thresholds & Research Basis |\n`;
    notes += `|--------|--------------|-----------------------------|\n`;
    notes += `| **Complexity** | 35% | McCabe (1976): ≤10 = low, ≤15 = medium, ≤20 = high, ≤50 = very high, >50 = extreme |\n`;
    notes += `| **Maintainability** | 25% | Clean Code principles: ≤200 LOC/file preferred, progressive penalties |\n`;
    if (duplicationMode === 'strict') {
        notes += `| **Duplication** | 20% | Strict threshold: ≤3% (SonarQube-aligned) |\n`;
    } else {
        notes += `| **Duplication** | 20% | Legacy threshold: ≤15% considered excellent for brownfield projects |\n`;
    }
    notes += `| **Reliability** | 20% | Based on detected issues: deep nesting, long functions, complex conditions |\n`;
    notes += `\n`;

    notes += `#### 🧭 Architectural Criticality Formula\n`;
    notes += `Each file’s weight is computed as:\n`;
    notes += `\`\`\`\n`;
    notes += `CriticismScore = (Dependencies × 2.0) + (WeightedIssues × 0.5) + 1\n`;
    notes += `\`\`\`\n`;
    notes += `- **Dependencies:** incoming + outgoing + cycle penalty (if any)\n`;
    notes += `- **WeightedIssues:** critical×4 + high×3 + medium×2 + low×1\n`;
    notes += `- **Note:** Complexity excluded to avoid double-counting (already weighted at 45%)\n`;
    notes += `- **Base +1** avoids zero weighting\n\n`;

    notes += `#### 🎓 Grade Scale\n`;
    const gradeScale = GRADE_CONFIG.map(config => `**${config.grade}** (${config.range})`).join(' • ');
    notes += `${gradeScale}\n\n`;

    return notes;
}

/**
 * Get emoji for criticism level
 */
function getCriticismEmoji(level: 'Low' | 'Medium' | 'High' | 'Critical'): string {
    switch (level) {
        case 'Critical': return '🔥';
        case 'High': return '⚠️';
        case 'Medium': return '🟡';
        case 'Low': return '🟢';
        default: return '❓';
    }
}

function generateCriticalFilesSection(riskyFiles: RiskyFileDisplayInfo[]): string {
    let markdown = `| File | Health | Criticism | Primary Concern |\n`;
    markdown += `|------|--------|-----------|------------------|\n`;
    
    riskyFiles.forEach(riskyFile => {
        const fileLabel = riskyFile.isEmblematic ? `⭐ ${riskyFile.file}` : riskyFile.file;
        
        // Format criticism level with emoji for visual impact
        const criticismEmoji = getCriticismEmoji(riskyFile.criticismLevel);
        const criticismDisplay = `${criticismEmoji} ${riskyFile.criticismLevel}`;
        
        // Use standardized primary concern (without recommendations as requested)
        const primaryConcern = riskyFile.primaryConcern;
        
        markdown += `| ${fileLabel} | ${riskyFile.healthScore}% | ${criticismDisplay} | ${primaryConcern} |\n`;
    });
    
    markdown += `\n*⭐ indicates emblematic/core files*\n\n`;
    return markdown;
}

function generateFunctionDeepDiveSection(functionsWithFile: FunctionWithFile[]): string {
    // Functions are already filtered and sorted by the harmonized prepareDeepDiveData()
    if (functionsWithFile.length === 0) {
        return '';
    }

    const rows = functionsWithFile.map(func => {
        // Use harmonized issue formatting for consistency with implications
        const issueData = formatFunctionIssuesForDeepDive(func, 'markdown');
        // Shorten long file paths for better readability
        const shortPath = func.file.length > 40 ? 
            `.../${func.file.split('/').slice(-2).join('/')}` : 
            func.file;
        return `| \`${func.name}\` | \`${shortPath}\` | **${func.complexity}** | ${func.loc} | ${issueData.issuesSummaryWithImplications} |`;
    });

    const table = [
        `| Function | File | Complexity | Lines | Key Issues|`,
        `|:---|:---|:---|:---|:---|`,
        ...rows
    ].join('\n');
    
    return generateSection("🎯 Deep Dive: Key Function Analysis", table);
}

function generateDependencyInsights(details: FileDetail[]): string {
    // Filter out non-application source files (tests, config, types, etc.)
    const isApplicationSource = (file: string) => {
        const fileName = file.toLowerCase();
        return !fileName.includes('.test') && 
               !fileName.includes('.spec') && 
               !fileName.includes('.d.ts') && 
               !fileName.includes('config') && 
               !fileName.includes('__tests__') && 
               !fileName.includes('__mocks__') && 
               !fileName.includes('.config.') && 
               !fileName.includes('webpack') && 
               !fileName.includes('babel') && 
               !fileName.includes('jest') && 
               !fileName.includes('eslint') && 
               !fileName.includes('tsconfig') && 
               !fileName.includes('package.json') && 
               !fileName.includes('yarn.lock') && 
               !fileName.includes('node_modules');
    };
    
    // Filter to only application source files
    const applicationFiles = details.filter(d => isApplicationSource(d.file));
    
    // Hub files (high incoming dependencies)
    const hubFiles = applicationFiles
        .filter(d => d.dependencies.percentileUsageRank > FILE_SIZE_THRESHOLDS.HUB_FILES_PERCENTILE)
        .sort((a, b) => b.dependencies.incomingDependencies - a.dependencies.incomingDependencies)
        .slice(0, 5);
    
    // Unstable files (exclude entry points like index.ts)
    const isEntryPoint = (file: string) => {
        const fileName = file.split('/').pop()?.toLowerCase() || '';
        return fileName === 'index.ts' || fileName === 'index.js' || 
               fileName.includes('main.') || fileName.includes('entry.');
    };
    
    const unstableFiles = applicationFiles
        .filter(d => d.dependencies.instability > 0.8 && !isEntryPoint(d.file))
        .slice(0, 5);
    
    let markdown = `### Hub Files (High Impact)\n\n`;
    if (hubFiles.length > 0) {
        markdown += `| File | Incoming Deps | Usage Rank | Role |\n`;
        markdown += `|------|---------------|------------|------|\n`;
        hubFiles.forEach(file => {
            const role = inferFileRole(file.file);
            markdown += `| ${file.file} | ${file.dependencies.incomingDependencies} | ${file.dependencies.percentileUsageRank}th percentile | ${role} |\n`;
        });
    } else {
        markdown += `*No significant hub files detected*\n`;
    }
    
    markdown += `\n### Highly Unstable Files\n\n`;
    if (unstableFiles.length > 0) {
        markdown += `| File | Instability | Outgoing/Incoming |\n`;
        markdown += `|------|-------------|-------------------|\n`;
        unstableFiles.forEach(file => {
            markdown += `| ${file.file} | ${file.dependencies.instability.toFixed(2)} | ${file.dependencies.outgoingDependencies}/${file.dependencies.incomingDependencies} |\n`;
        });
    } else {
        markdown += `*All files show good stability*\n`;
    }
    
    markdown += `\n`;
    return markdown;
}

function generateIssueAnalysis(details: FileDetail[], functionsWithFile: FunctionWithFile[]): string {
    // Combine file-level and function-level issues for unified analysis
    const fileIssues = details.flatMap(d => d.issues.map(i => ({ 
        ...i, 
        file: d.file,
        source: 'file' as const,
        type: i.type,
        severity: i.severity
    })));
    
    const functionIssues = functionsWithFile.flatMap(func => 
        func.issues.map((issue: FunctionIssue) => ({
            type: issue.type,
            severity: issue.severity,
            file: func.file,
            function: func.name,
            source: 'function' as const,
            description: issue.description
        }))
    );
    
    const allIssues = [...fileIssues, ...functionIssues];
    
    const issueCounts = {
        critical: allIssues.filter(i => i.severity === 'critical').length,
        high: allIssues.filter(i => i.severity === 'high').length,
        medium: allIssues.filter(i => i.severity === 'medium').length,
        low: allIssues.filter(i => i.severity === 'low').length
    };
    
    let markdown = `### Issue Summary\n\n`;
    markdown += `| Severity | Count | File-Level | Function-Level | Top Affected Areas |\n`;
    markdown += `|----------|-------|------------|----------------|-------------------|\n`;
    
    (['critical', 'high', 'medium', 'low'] as const).forEach(severity => {
        const count = issueCounts[severity];
        if (count > 0) {
            const fileCount = fileIssues.filter(i => i.severity === severity).length;
            const funcCount = functionIssues.filter(i => i.severity === severity).length;
            const topAreas = getTopAffectedAreas(allIssues.filter(i => i.severity === severity));
            markdown += `| ${ISSUE_SEVERITY[severity].emoji} ${capitalize(severity)} | ${count} | ${fileCount} | ${funcCount} | ${topAreas} |\n`;
        }
    });
  
    
    // Legacy file-level types for compatibility
    markdown += `\n### File-Level Issue Types\n\n`;
    const fileTypeCount = new Map<string, number>();
    fileIssues.forEach(issue => {
        fileTypeCount.set(issue.type, (fileTypeCount.get(issue.type) || 0) + 1);
    });
    
    const sortedFileTypes = Array.from(fileTypeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (sortedFileTypes.length > 0) {
        markdown += `| Issue Type | Occurrences | Threshold Excess | Implication |\n`;
        markdown += `|------------|-------------|------------------|-------------|\n`;
        
        sortedFileTypes.forEach(([type, count]) => {
            const filteredIssues = fileIssues.filter(i => i.type === type && i.excessRatio !== undefined) as Array<typeof fileIssues[0] & {excessRatio: number}>;
        const avgExcess = filteredIssues.length > 0 ? getAverageExcessRatio(filteredIssues) : 0;
          // Use generic implication for file-level patterns  
          const implication = getPatternImplication(type, 'quality');
          markdown += `| ${capitalize(type)} | ${count} | ${avgExcess}x threshold | ${implication} |\n`;
        });
    }
    
    // Add function-level issues analysis
    markdown += `\n### Function-Level Issue Types\n\n`;
    const functionTypeCount = new Map<string, number>();
    functionIssues.forEach(issue => {
        functionTypeCount.set(issue.type, (functionTypeCount.get(issue.type) || 0) + 1);
    });
    
    const sortedFunctionTypes = Array.from(functionTypeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (sortedFunctionTypes.length > 0) {
        markdown += `| Issue Pattern | Occurrences | Most Affected Functions | Implication |\n`;
        markdown += `|---------------|-------------|-------------------------|-------------|\n`;
        
        sortedFunctionTypes.forEach(([type, count]) => {
            // Find functions with this issue type
            const affectedFunctions = functionIssues
                .filter(i => i.type === type)
                .map(i => i.function)
                .slice(0, 2); // Show up to 2 function names
            
            const functionList = affectedFunctions.length > 0 
                ? `\`${affectedFunctions.join('`, `')}\`` + (functionIssues.filter(i => i.type === type).length > 2 ? '...' : '')
                : '_Various_';
                
            // Use generic implication for function-level patterns
            const implication = getPatternImplication(type, 'quality');
            markdown += `| ${capitalize(type)} | ${count} | ${functionList} | ${implication} |\n`;
        });
    } else {
        markdown += `*No significant function-level issues detected*\n`;
    }
    
    markdown += `\n`;
    return markdown;
}

function generatePatternAnalysis(functionsWithFile: FunctionWithFile[]): string {
    let markdown = `## 📈 Pattern Analysis\n\n`;
    
    // Aggregate all patterns
    const patternCounts = {
        quality: new Map<string, number>(),
        architecture: new Map<string, number>()
    };
    
    // Extract patterns from function issues using centralized function data
    functionsWithFile.forEach((func) => {
        func.issues.forEach((issue: FunctionIssue) => {
            // Categorize issue types into pattern categories using type guards
            if (isQualityPattern(issue.type)) {
                patternCounts.quality.set(issue.type, (patternCounts.quality.get(issue.type) || 0) + 1);
            } else if (isArchitecturePattern(issue.type)) {
                patternCounts.architecture.set(issue.type, (patternCounts.architecture.get(issue.type) || 0) + 1);
            }
        });
    });

    // Quality Patterns
    if (patternCounts.quality.size > 0) {
        markdown += `### 🎯 Quality Patterns\n\n`;
        markdown += generatePatternTable(patternCounts.quality, 'quality');
    }

    // Caractéristiques architecturales (neutres)
    const architecturalCharacteristics = Array.from(patternCounts.architecture.entries())
        .filter(([pattern]) => ['async-heavy'].includes(pattern));
    
    if (architecturalCharacteristics.length > 0) {
        markdown += `### 🏗️ Architectural Characteristics\n\n`;
        markdown += generatePatternTable(new Map(architecturalCharacteristics), 'architecture');
    }
    
    // Return empty string if no patterns found to avoid showing empty section
    if (patternCounts.quality.size === 0 && architecturalCharacteristics.length === 0) {
        return '';
    }
    
    return markdown;
}


// AJOUT : Fonction pour générer la section Quick Wins
function generateQuickWinsSection(quickWinsAnalysis: QuickWinsAnalysis, analysisPath: string, enableLinks: boolean): string {
    if (!quickWinsAnalysis || quickWinsAnalysis.quickWins.length === 0) {
        return '';
    }

    const quickWinsReporter = new QuickWinsReporter({
        ide: IdeLinkGenerator.detectIDE(),
        projectRoot: path.resolve(analysisPath),
        enableLinks: enableLinks
    });
      
      
    // Générer la section markdown en utilisant le reporter existant
    let markdown = `## 🚀 Quick Wins Analysis\n\n`;
    
    // Ajouter les métriques de base
    markdown += `**Summary:**\n`;
    markdown += `- **Total potential score gain:** +${quickWinsAnalysis.totalPotentialGain} points\n`;
    markdown += `- **Quick wins identified:** ${quickWinsAnalysis.quickWins.length}\n`;
    markdown += `- **Immediate wins (< 30min):** ${quickWinsAnalysis.summary.immediateWins}\n`;
    markdown += `- **Estimated total effort:** ${quickWinsAnalysis.summary.estimatedHours.toFixed(1)} hours\n\n`;
    
    // Ajouter le rapport markdown complet du QuickWinsReporter
    // En supprimant le header principal pour éviter la duplication
    const fullReport = quickWinsReporter.generateMarkdownReport(quickWinsAnalysis);
    const reportWithoutHeader = fullReport.replace(/^## 🚀 Quick Wins Analysis\s*\n/, '');
    
    markdown += reportWithoutHeader;
    
    return markdown;
}