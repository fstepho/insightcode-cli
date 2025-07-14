/**
 * Générateur de rapports pour un projet individuel
 */

import { AnalysisResult, FileDetail, CodeContext } from './types';
import { 
    getScoreStatus, 
    getSeverityEmoji, 
    getAverageExcessRatio, 
    getPrimaryConcern, 
    getRecommendationForFile, 
    getCriticalFiles, 
    generateHealthDistribution,
    isFileEmblematic,
    getHealthCategory,
    ratioToPercentage,
    formatPercentage
} from './scoring.utils';
import {
    formatNumber,
    capitalize,
    getTopAffectedAreas,
    generatePatternTable,
    inferFileRole,
    generateSection
} from './shared-report-utils';

/**
 * Génère un rapport détaillé pour un seul projet
 */
export function generateProjectReport(result: any): string {
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
    
     // Intégration du contexte de code enrichi
    if (analysis.codeContext && analysis.codeContext.length > 0) {
        // Section "Deep Dive" sur les fonctions
        markdown += generateFunctionDeepDiveSection(analysis.codeContext);
    }
    
    // Dependency Analysis
    markdown += `## Dependency Analysis\n\n`;
    markdown += generateDependencyInsights(analysis.details);
    
    // Issue Analysis
    markdown += `## Issue Analysis\n\n`;
    markdown += generateIssueAnalysis(analysis.details);
    
    // Pattern Analysis (if available)
    if (analysis.codeContext && analysis.codeContext.length > 0) {
        markdown += generatePatternAnalysis(analysis.codeContext);
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

function generateExecutiveSummary(analysis: AnalysisResult, emblematicFiles: any): string {
    const grade = analysis.overview.grade;
    const score = analysis.overview.scores.overall;
    const criticalFiles = getCriticalFiles(analysis.details, emblematicFiles);
    
    // Determine health status
    const healthCategory = getHealthCategory(score);
    const healthStatus = {
        excellent: 'Excellent health',
        good: 'Good health',
        moderate: 'Moderate health',
        poor: 'Critical health issues'
    }[healthCategory];
    
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
        
        if (avgComplexity > 8) {
            summary += `**🔧 Improvement Opportunity:** Consider reducing average complexity (${avgComplexity.toFixed(1)}) through function decomposition.\n\n`;
        } else if (dupRatio > 3) {
            summary += `**🔧 Improvement Opportunity:** Consider reducing code duplication (${dupRatio.toFixed(1)}%) through refactoring.\n\n`;
        } else {
            summary += `**🔧 Improvement Opportunity:** Focus on maintaining current quality standards during feature development.\n\n`;
        }
    }
    
    return summary;
}

function generateGradeVisual(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
    const gradeEmojis: Record<'A' | 'B' | 'C' | 'D' | 'F', string> = {
        'A': '🌟',
        'B': '✅',
        'C': '⚠️',
        'D': '🔴',
        'F': '💀'
    };
    
    return `### Grade: ${gradeEmojis[grade]} **${grade}**\n`;
}

function generateScoreTable(scores: any, avgDuplicationRatio?: number): string { 
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
    let notes = `InsightCode uses **internal hypothesis-based scoring** requiring empirical validation:\n\n`;
    
    notes += `#### Overall Score Formula\n`;
    notes += `\`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)\`\n\n`;
    
    notes += `| Dimension | Weight | Foundation & Thresholds |\n`;
    notes += `|-----------|--------|--------------------------|\n`;
    notes += `| **Complexity** | **45%** | **McCabe (1976) thresholds:** ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Weight = internal hypothesis. |\n`;
    notes += `| **Maintainability** | **30%** | **File size impact hypothesis:** ≤200 LOC ideal. Weight = internal hypothesis (requires validation). |\n`;
    // Adapt duplication description based on mode
    const duplicationMode = analysis?.context?.analysis?.duplicationMode || 'legacy';
    if (duplicationMode === 'strict') {
        notes += `| **Duplication** | **25%** | **Industry-standard thresholds:** ≤3% "excellent" aligned with SonarQube. Weight = internal hypothesis. |\n\n`;
    } else {
        notes += `| **Duplication** | **25%** | **⚠️ LEGACY thresholds (5x more permissive than industry):** ≤15% "excellent" vs SonarQube ≤3%. Weight = internal hypothesis. |\n\n`;
    }
    
    notes += `#### ⚠️ Important Disclaimers\n`;
    notes += `**Project weights (45/30/25) are internal hypotheses requiring empirical validation, NOT industry standards.** These weights apply only to project-level aggregation. File Health Scores use unweighted penalty summation.\n\n`;
    
    // Only show duplication threshold disclaimer in legacy mode
    if (duplicationMode !== 'strict') {
        notes += `**Duplication thresholds are 5x more permissive than industry standards** (≤15% = "excellent" vs SonarQube ≤3%). Scores may appear inflated compared to standard tools.\n\n`;
    }
    
    notes += `#### Grade Scale (Academic Standard)\n`;
    notes += `**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)\n\n`;
    
    notes += `#### Aggregation Method\n`;
    notes += `- **Project-level:** Architectural criticality weighting WITHOUT outlier masking\n`;
    notes += `- **File-level:** Penalty-based (100 - penalties) with NO CAPS - extreme values get extreme penalties\n`;
    notes += `- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems\n\n`;
    
    return notes;
}

function generateCriticalFilesSection(criticalFiles: FileDetail[], emblematicFiles: any): string {
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

function generateFunctionDeepDiveSection(codeContexts: CodeContext[]): string {
    // Preserve file-function relationship instead of flattening first
    const allFunctionsWithContext = codeContexts.flatMap(context => 
        context.criticalFunctions.map(func => ({ ...func, file: context.file }))
    );

    if (allFunctionsWithContext.length === 0) {
        return '';
    }

    const topFunctions = allFunctionsWithContext
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 5);
    
    const rows = topFunctions.map(func => {
        const issues = func.issues.map(i => i.type).join(', ');
        return `| \`${func.name}\` | \`${func.file}\` | **${func.complexity}** | ${func.lineCount} | ${issues || '_None_'} |`;
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
        .filter(d => d.dependencies.percentileUsageRank > 80)
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

function generateIssueAnalysis(details: FileDetail[]): string {
    const allIssues = details.flatMap(d => d.issues.map(i => ({ ...i, file: d.file })));
    
    const issueCounts = {
        critical: allIssues.filter(i => i.severity === 'critical').length,
        high: allIssues.filter(i => i.severity === 'high').length,
        medium: allIssues.filter(i => i.severity === 'medium').length,
        low: allIssues.filter(i => i.severity === 'low').length
    };
    
    let markdown = `### Issue Summary\n\n`;
    markdown += `| Severity | Count | Top Affected Areas |\n`;
    markdown += `|----------|-------|-------------------|\n`;
    
    (['critical', 'high', 'medium', 'low'] as const).forEach(severity => {
        const count = issueCounts[severity];
        if (count > 0) {
            const topAreas = getTopAffectedAreas(allIssues.filter(i => i.severity === severity));
            markdown += `| ${getSeverityEmoji(severity)} ${capitalize(severity)} | ${count} | ${topAreas} |\n`;
        }
    });
    
    // Most common issue types
    markdown += `\n### Most Common Issue Types\n\n`;
    const issueTypeCount = new Map<string, number>();
    allIssues.forEach(issue => {
        issueTypeCount.set(issue.type, (issueTypeCount.get(issue.type) || 0) + 1);
    });
    
    const sortedTypes = Array.from(issueTypeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    markdown += `| Issue Type | Occurrences | Typical Threshold Excess |\n`;
    markdown += `|------------|-------------|-------------------------|\n`;
    
    sortedTypes.forEach(([type, count]) => {
        const avgExcess = getAverageExcessRatio(allIssues.filter(i => i.type === type));
        markdown += `| ${capitalize(type)} | ${count} | ${avgExcess}x threshold |\n`;
    });
    
    markdown += `\n`;
    return markdown;
}

function generatePatternAnalysis(codeContexts: CodeContext[]): string {
    let markdown = `## 📈 Analyse des Patterns\n\n`;
    
    // Aggregate all patterns
    const patternCounts = {
        quality: new Map<string, number>(),
        architecture: new Map<string, number>()
    };
    
    codeContexts.forEach((context) => {
        context.patterns.quality.forEach(p => 
            patternCounts.quality.set(p, (patternCounts.quality.get(p) || 0) + 1));
        context.patterns.architecture.forEach(p => 
            patternCounts.architecture.set(p, (patternCounts.architecture.get(p) || 0) + 1));
    });
    
    // Anti-patterns (quality issues, excluding positive patterns)
    const antiPatterns = Array.from(patternCounts.quality.entries())
        .filter(([pattern]) => !['type-safe', 'error-handling', 'input-validation'].includes(pattern));
    
    if (antiPatterns.length > 0) {
        markdown += `### ❗ Anti-Patterns & Code Smells\n\n`;
        markdown += generatePatternTable(new Map(antiPatterns), 'quality');
    }
    
    // Good practices (architecture patterns + positive quality patterns)
    const goodPractices = Array.from(patternCounts.architecture.entries());
    const positiveQualityPatterns = Array.from(patternCounts.quality.entries())
        .filter(([pattern]) => ['type-safe', 'error-handling', 'input-validation'].includes(pattern));
    
    const allGoodPractices = [...goodPractices, ...positiveQualityPatterns];
    
    if (allGoodPractices.length > 0) {
        markdown += `### ✅ Good Practices Detected\n\n`;
        markdown += generatePatternTable(new Map(allGoodPractices), 'architecture');
    }
    
    return markdown;
}