/**
 * Générateur de rapports pour un projet individuel
 */

import { AnalysisResult, FileDetail, FunctionAnalysis, FunctionIssue, ReportResult, EmblematicFiles, Grade } from './types';
import { 
    getScoreStatus, 
    getSeverityEmoji, 
    getAverageExcessRatio, 
    getPrimaryConcern, 
    getRecommendationForFile, 
    getCriticalFiles, 
    generateHealthDistribution,
    isFileEmblematic,
    getGradeInfoByGrade,
    GRADE_CONFIG,
    ratioToPercentage,
    formatPercentage
} from './scoring.utils';
import { FILE_SIZE_THRESHOLDS, IMPROVEMENT_SUGGESTION_THRESHOLDS } from './thresholds.constants';
import {
    formatNumber,
    capitalize,
    getTopAffectedAreas,
    generatePatternTable,
    inferFileRole,
    generateSection,
    isQualityPattern,
    isArchitecturePattern
} from './shared-report-utils';

// Type for function analysis with file information
type FunctionWithFile = FunctionAnalysis & { file: string };

/**
 * Génère un rapport détaillé pour un seul projet
 */
export function generateProjectReport(result: ReportResult): string {
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
    
    // Analysis Context
    markdown += `## Analysis Context\n\n`;
    markdown += `- **Timestamp:** ${analysis.context.analysis.timestamp}\n`;
    markdown += `- **Duration:** ${(durationMs / 1000).toFixed(2)}s\n`;
    markdown += `- **Files Analyzed:** ${analysis.context.analysis.filesAnalyzed}\n`;
    markdown += `- **Tool Version:** ${analysis.context.analysis.toolVersion}\n\n`;
    
    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += generateExecutiveSummary(analysis, result.emblematicFiles);
    
    // Overview with Visual Grade
    markdown += `## Quality Overview\n\n`;
    markdown += generateGradeVisual(analysis.overview.grade);
    markdown += `\n**${analysis.overview.summary}**\n\n`;
    
    // Detailed Scores
    markdown += `### Quality Scores\n\n`;
    markdown += generateScoreTable(analysis.overview.scores, analysis.overview.statistics.avgDuplicationRatio);
    
    // Methodology Notes
    markdown += `\n### 📊 Scoring Methodology\n\n`;
    markdown += generateScoringMethodologyNotes(analysis);
    
    // Key Statistics
    markdown += `### Key Statistics\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Files | ${analysis.overview.statistics.totalFiles} |\n`;
    markdown += `| Total Lines of Code | ${formatNumber(analysis.overview.statistics.totalLOC)} |\n`;
    markdown += `| Average Complexity | ${analysis.overview.statistics.avgComplexity.toFixed(1)} |\n`;
    markdown += `| Average LOC per File | ${Math.round(analysis.overview.statistics.avgLOC)} |\n\n`;
    
    // Health Distribution
    markdown += `## File Health Distribution\n\n`;
    markdown += generateHealthDistribution(analysis.details);
    
    // Critical Files
    const criticalFiles = getCriticalFiles(analysis.details, result.emblematicFiles);
    if (criticalFiles.length > 0) {
        markdown += `## Critical Files Requiring Attention\n\n`;
        markdown += generateCriticalFilesSection(criticalFiles, result.emblematicFiles);
    }
    
    // Function Deep Dive - ADAPTED to use FileDetail.functions
    const functionsAnalysis = analysis.details.flatMap((detail: FileDetail) => 
        detail.functions?.map((func: FunctionAnalysis) => ({ ...func, file: detail.file })) || []
    );
    if (functionsAnalysis.length > 0) {
        markdown += generateFunctionDeepDiveSection(functionsAnalysis);
    }
    
    // Dependency Analysis
    markdown += `## Dependency Analysis\n\n`;
    markdown += generateDependencyInsights(analysis.details);
    
    // Issue Analysis
    markdown += `## Issue Analysis\n\n`;
    markdown += generateIssueAnalysis(analysis.details, functionsAnalysis);
    
    // Pattern Analysis - ADAPTED to use FileDetail.functions  
    if (functionsAnalysis.length > 0) {
        markdown += generatePatternAnalysis(functionsAnalysis);
    }
    
    // Technical Notes
    markdown += `\n---\n`;
    markdown += `## 🔬 Technical Notes\n\n`;
    markdown += `### Duplication Detection\n`;
    markdown += `- **Algorithm:** Enhanced 8-line literal pattern matching with 8+ token minimum, cross-file exact matches only\n`;
    markdown += `- **Focus:** Copy-paste duplication using MD5 hashing of normalized blocks (not structural similarity)\n`;
    markdown += `- **Philosophy:** Pragmatic approach using regex normalization - avoids false positives while catching actionable duplication\n`;
    
    // Adapt results description based on duplication mode
    const duplicationMode = analysis.context?.analysis?.duplicationMode || 'legacy';
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

function generateExecutiveSummary(analysis: AnalysisResult, emblematicFiles?: EmblematicFiles): string {
    const grade = analysis.overview.grade;
    const score = analysis.overview.scores.overall;
    const criticalFiles = getCriticalFiles(analysis.details, emblematicFiles);
    
    // Determine health status (remove emoji for cleaner executive summary)
    const healthStatus = getScoreStatus(score).replace(/^.+ /, '');
    
    let summary = `**Grade ${grade} (${score}/100)** - ${healthStatus}.\n\n`;
    
    // Identify the biggest problem
    if (criticalFiles.length > 0) {
        const worstFile = criticalFiles[0];
        const primaryConcern = getPrimaryConcern(worstFile);
        const isEmblematic = isFileEmblematic(worstFile.file, emblematicFiles);
        const emblemMark = isEmblematic ? ' (core file)' : '';
        
        summary += `**🚨 Primary Concern:** ${primaryConcern} in \`${worstFile.file}\`${emblemMark}.\n\n`;
        
        // Priority action
        const recommendation = getRecommendationForFile(worstFile);
        summary += `**🎯 Priority Action:** ${recommendation}\n\n`;
        
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
    // Use centralized configuration
    const gradeInfo = getGradeInfoByGrade(grade);
    return `### Grade: ${gradeInfo.visualEmoji} **${grade}**\n`;
}

function generateScoreTable(scores: AnalysisResult['overview']['scores'], avgDuplicationRatio?: number): string { 
    const getStatus = getScoreStatus;
    
   let table = `| Dimension | Score (Value) | Status |\n`;
    table += `|:---|:---|:---|\n`;

    // AFFICHE SYSTÉMATIQUEMENT LE POURCENTAGE DE DUPLICATION
    const dupPercent = formatPercentage(avgDuplicationRatio || 0);
    const duplicationText = `${scores.duplication}/100 (${dupPercent} detected)`;

    table += `| Complexity | ${scores.complexity}/100 | ${getStatus(scores.complexity)} |\n`;
    table += `| Duplication | ${duplicationText} | ${getStatus(scores.duplication)} |\n`;
    table += `| Maintainability | ${scores.maintainability}/100 | ${getStatus(scores.maintainability)} |\n`;
    table += `| **Overall** | **${scores.overall}/100** | **${getStatus(scores.overall)}** |\n`;
    return table;
}

function generateScoringMethodologyNotes(analysis?: AnalysisResult): string {
    let notes = `InsightCode combines **research-based thresholds** with **hypothesis-driven weighting**:\n\n`;
    
    notes += `#### Overall Score Formula\n`;
    notes += `\`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)\`\n\n`;
    
    notes += `| Dimension | Weight | Foundation & Thresholds |\n`;
    notes += `|-----------|--------|--------------------------|\n`;
    notes += `| **Complexity** | **45%** | **McCabe (1976) thresholds:** ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Weight = internal hypothesis. |\n`;
    notes += `| **Maintainability** | **30%** | **File size impact:** ≤200 LOC ideal (Clean Code principles). Weight = internal hypothesis. |\n`;
    // Adapt duplication description based on mode
    const duplicationMode = analysis?.context?.analysis?.duplicationMode || 'legacy';
    if (duplicationMode === 'strict') {
        notes += `| **Duplication** | **25%** | **Industry-standard thresholds:** ≤3% "excellent" aligned with SonarQube. Weight = internal hypothesis. |\n\n`;
    } else {
        notes += `| **Duplication** | **25%** | **⚠️ LEGACY thresholds (more permissive):** ≤15% "excellent" vs SonarQube ≤3%. Weight = internal hypothesis. |\n\n`;
    }
    
    notes += `#### 📊 Score Interpretation\n`;
    notes += `**Important:** Project scores use architectural criticality weighting, not simple averages. Here's why extreme complexity can still yield moderate project scores:\n\n`;
    
    notes += `**Example - Lodash Case:**\n`;
    notes += `- **lodash.js:** Complexity 1818 → Individual score 0, but CriticismScore ~1823\n`;
    notes += `- **19 other files:** Complexity ~5 → Individual scores ~100, CriticismScore ~12 each\n`;
    notes += `- **Weighted result:** (0×89%) + (100×11%) = ~7 final score\n\n`;
    
    notes += `**Key Distinctions:**\n`;
    notes += `- **Raw Metrics:** Average complexity, total LOC (arithmetic means)\n`;
    notes += `- **Weighted Scores:** Architectural importance influences final project scores\n`;
    notes += `- **Individual Files:** Use penalty-based health scores (0-100)\n\n`;
    
    notes += `#### ⚠️ Methodology Notes\n`;
    notes += `- **Thresholds:** Research-based (McCabe 1976, Clean Code, SonarQube standards)\n`;
    notes += `- **Weights:** Internal hypotheses (45/30/25) requiring empirical validation\n`;
    notes += `- **Aggregation:** Criticality-weighted to identify architecturally important files\n\n`;
    
    // Only show duplication threshold disclaimer in legacy mode
    if (duplicationMode !== 'strict') {
        notes += `**Note:** Legacy mode uses more permissive duplication thresholds (≤15% = "excellent" vs SonarQube ≤3%) for brownfield projects.\n\n`;
    }
    
    notes += `#### Grade Scale (Academic Standard)\n`;
    // Generate grade scale dynamically from GRADE_CONFIG
    const gradeScale = GRADE_CONFIG.map(config => `**${config.grade}** (${config.range})`).join(' • ');
    notes += `${gradeScale}\n\n`;
    
    notes += `#### Aggregation Method\n`;
    notes += `- **Project-level:** Architectural criticality weighting identifies most impactful files\n`;
    notes += `- **File-level:** Penalty-based (100 - penalties) with progressive penalties for extreme values\n`;
    notes += `- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems\n\n`;
    
    notes += `#### 🔍 Architectural Criticality Formula\n`;
    notes += `Each file receives a "criticism score" that determines its weight in final project scores:\n\n`;
    notes += `\`\`\`\n`;
    notes += `CriticismScore = (Dependencies × 2.0) + (Complexity × 1.0) + (WeightedIssues × 0.5) + 1\n`;
    notes += `\`\`\`\n\n`;
    notes += `**Components:**\n`;
    notes += `- **Dependencies:** incomingDeps + outgoingDeps + (isInCycle ? 5 : 0)\n`;
    notes += `- **Complexity:** File cyclomatic complexity\n`;
    notes += `- **WeightedIssues:** (critical×4) + (high×3) + (medium×2) + (low×1)\n`;
    notes += `- **Base:** +1 to avoid zero weights\n\n`;
    notes += `**Final Project Score:** Each dimension is weighted by file criticality, then combined using 45/30/25 weights.\n\n`;
    
    return notes;
}

function generateCriticalFilesSection(criticalFiles: FileDetail[], emblematicFiles?: EmblematicFiles): string {
    let markdown = `| File | Health | Primary Concern & Recommendation |\n`;
    markdown += `|------|--------|-----------------------------------|\n`;
    
    criticalFiles.forEach(file => {
        const isEmblematic = isFileEmblematic(file.file, emblematicFiles);
        const fileLabel = isEmblematic ? `⭐ ${file.file}` : file.file;
        
        const primaryConcern = getPrimaryConcern(file);
        const recommendation = getRecommendationForFile(file);
        const combinedInfo = `${primaryConcern} <br/> 🎯 **Action:** ${recommendation}`;
        
        markdown += `| ${fileLabel} | ${file.healthScore}% | ${combinedInfo} |\n`;
    });
    
    markdown += `\n*⭐ indicates emblematic/core files*\n\n`;
    return markdown;
}

function generateFunctionDeepDiveSection(functionsWithFile: FunctionWithFile[]): string {
    // Get top 5 most complex functions
    const topFunctions = functionsWithFile
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 5);

    if (topFunctions.length === 0) {
        return '';
    }

    const rows = topFunctions.map(func => {
        const issues = func.issues.map((i: FunctionIssue) => i.type).join(', ');
        return `| \`${func.name}\` | \`${func.file}\` | **${func.complexity}** | ${func.loc} | ${issues || '_None_'} |`;
    });

    const table = [
        `| Function | File | Complexity | Lines | Key Issues |`,
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
    
    // Unstable files
    const unstableFiles = applicationFiles
        .filter(d => d.dependencies.instability > 0.8)
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
            markdown += `| ${getSeverityEmoji(severity)} ${capitalize(severity)} | ${count} | ${fileCount} | ${funcCount} | ${topAreas} |\n`;
        }
    });
    
    // Most common issue types - function-level detail
    if (functionIssues.length > 0) {
        markdown += `\n### Function-Level Issue Details\n\n`;
        const functionTypeCount = new Map<string, { count: number; functions: string[] }>();
        functionIssues.forEach(issue => {
            const key = issue.type;
            const current = functionTypeCount.get(key) || { count: 0, functions: [] };
            current.count++;
            current.functions.push(`${issue.function} (${issue.file})`);
            functionTypeCount.set(key, current);
        });
        
        const sortedFunctionTypes = Array.from(functionTypeCount.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
        
        markdown += `| Issue Pattern | Functions Affected | Examples |\n`;
        markdown += `|---------------|-------------------|----------|\n`;
        
        sortedFunctionTypes.forEach(([type, data]) => {
            const examples = data.functions.slice(0, 2).join(', ');
            const moreText = data.count > 2 ? ` +${data.count - 2} more` : '';
            markdown += `| ${capitalize(type.replace('-', ' '))} | ${data.count} | ${examples}${moreText} |\n`;
        });
    }
    
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
        markdown += `| Issue Type | Occurrences | Typical Threshold Excess |\n`;
        markdown += `|------------|-------------|-------------------------|\n`;
        
        sortedFileTypes.forEach(([type, count]) => {
            const filteredIssues = fileIssues.filter(i => i.type === type && i.excessRatio !== undefined) as Array<typeof fileIssues[0] & {excessRatio: number}>;
        const avgExcess = filteredIssues.length > 0 ? getAverageExcessRatio(filteredIssues) : 0;
            markdown += `| ${capitalize(type)} | ${count} | ${avgExcess}x threshold |\n`;
        });
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
    
    // ADAPTED: Extract patterns from function issues instead of codeContext
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
    
    // Anti-patterns (vraiment négatifs seulement)
    const antiPatterns = Array.from(patternCounts.quality.entries())
        .filter(([pattern]) => ['deep-nesting', 'long-function', 'high-complexity', 'too-many-params', 'god-function'].includes(pattern));
    
    if (antiPatterns.length > 0) {
        markdown += `### ❗ Anti-Patterns & Code Smells\n\n`;
        markdown += generatePatternTable(new Map(antiPatterns), 'quality');
    }
    
    // Good practices (patterns positifs)
    const architecturePractices = Array.from(patternCounts.architecture.entries())
        .filter(([pattern]) => ['error-handling', 'type-safe'].includes(pattern)); // Exclure async-heavy
    const positiveQualityPatterns = Array.from(patternCounts.quality.entries())
        .filter(([pattern]) => ['single-responsibility', 'pure-function', 'well-named'].includes(pattern));
    
    const allGoodPractices = [...architecturePractices, ...positiveQualityPatterns];
    
    if (allGoodPractices.length > 0) {
        markdown += `### ✅ Good Practices Detected\n\n`;
        markdown += generatePatternTable(new Map(allGoodPractices), 'architecture');
    }
    
    // Caractéristiques architecturales (neutres)
    const architecturalCharacteristics = Array.from(patternCounts.architecture.entries())
        .filter(([pattern]) => ['async-heavy'].includes(pattern));
    
    if (architecturalCharacteristics.length > 0) {
        markdown += `### 🏗️ Architectural Characteristics\n\n`;
        markdown += generatePatternTable(new Map(architecturalCharacteristics), 'architecture');
    }
    
    return markdown;
}