/**
 * Générateur de rapports Markdown pour InsightCode v0.6.0
 * Produit des rapports détaillés basés sur les données réelles d'analyse
 */

import * as path from 'path';
import * as fs from 'fs';
import { AnalysisResult, FileDetail, Issue, Severity, CodeContext, FileDependencyAnalysis, ReportResult, ReportSummary } from './types';
import { getComplexityLabel, getDuplicationLabel, getMaintainabilityLabel } from './scoring';
import { getHealthCategory, getScoreStatus } from './scoring.utils';

/**
 * Génère le rapport markdown synthétique multi-projets
 */
export function generateMarkdownReport(results: ReportResult[], summary: ReportSummary, production: boolean): string {
    const timestamp = new Date().toISOString();
    const mode = production ? 'Production Code' : 'Full Project';
    
    // Header du rapport
    let markdown = `# InsightCode Benchmark Report - ${mode}\n\n`;
    markdown += `**Generated:** ${timestamp}\n`;
    markdown += `**Tool Version:** v0.6.0\n`;
    markdown += `**Analysis Mode:** ${mode}\n\n`;
    
    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    markdown += `### Performance Metrics\n`;
    markdown += `- **Projects Analyzed:** ${summary.totalProjects}\n`;
    markdown += `- **Success Rate:** ${summary.successfulAnalyses}/${summary.totalProjects} (${Math.round(summary.successfulAnalyses/summary.totalProjects * 100)}%)\n`;
    markdown += `- **Total Lines Analyzed:** ${formatNumber(summary.totalLines)}\n`;
    markdown += `- **Analysis Speed:** ${formatNumber(Math.round(summary.totalLines / (summary.realDuration / 1000)))} lines/second\n`;
    markdown += `- **Total Duration:** ${(summary.realDuration / 1000).toFixed(2)}s\n\n`;
    
    // Grade Distribution
    markdown += `### Quality Distribution\n\n`;
    markdown += generateGradeDistributionChart(summary.gradeDistribution);
    
    // Global Insights
    markdown += `## Global Insights\n\n`;
    markdown += generateGlobalInsights(results, summary);
    
    // Per-Category Analysis
    markdown += `## Analysis by Project Size\n\n`;
    ['small', 'medium', 'large'].forEach(category => {
        const categoryResults = results.filter(r => r.category === category && !r.error);
        if (categoryResults.length > 0) {
            markdown += generateCategorySection(categoryResults, category);
        }
    });
    
    // Critical Findings
    markdown += `## Critical Findings Across All Projects\n\n`;
    markdown += generateCriticalFindings(results);
    
    // Pattern Analysis
    markdown += `## Code Pattern Analysis\n\n`;
    markdown += generatePatternAnalysis(results);
  
    
    // Individual Project Summaries
    markdown += `## Project Summaries\n\n`;
    results.filter(r => !r.error).forEach(result => {
        markdown += generateProjectSummary(result);
    });
    
    // Errors Section
    const failedProjects = results.filter(r => r.error);
    if (failedProjects.length > 0) {
        markdown += `## Analysis Failures\n\n`;
        failedProjects.forEach(result => {
            markdown += `### ${result.project}\n`;
            markdown += `- **Error:** ${result.error?.substring(0, 200)}...\n\n`;
        });
    }
    
    return markdown;
}

/**
 * Génère tous les rapports individuels et les sauvegarde
 */
export function generateAllIndividualReports(results: ReportResult[], outputDir: string, production: boolean): void {
     
    // Créer le dossier des rapports individuels s'il n'existe pas
    const individualReportsDir = path.join(outputDir);
    if (!fs.existsSync(individualReportsDir)) {
        fs.mkdirSync(individualReportsDir, { recursive: true });
    }
    
    // Générer un rapport pour chaque projet réussi
    results.filter(r => !r.error).forEach(result => {
        const reportContent = generateProjectReport(result);
        // add production info to filename
        const modeSuffix = production ? '-prod' : '-full';
        const date = new Date().toISOString().split('T')[0];

        const filename = `${result.project}-analysis-report${modeSuffix}-${date}.md`;
        const filepath = path.join(individualReportsDir, filename);
        
        fs.writeFileSync(filepath, reportContent);
        console.log(`  📄 Generated individual report: ${filename}`);
    });
}

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
    
    // Overview with Visual Grade
    markdown += `## Quality Overview\n\n`;
    markdown += generateGradeVisual(analysis.overview.grade);
    markdown += `\n**${analysis.overview.summary}**\n\n`;
    
    // Detailed Scores
    markdown += `### Quality Scores\n\n`;
    markdown += generateScoreTable(analysis.overview.scores, analysis.overview.statistics.avgDuplicationRatio);
    
    // Methodology Notes
    markdown += `\n### 📊 Scoring Methodology\n\n`;
    markdown += generateScoringMethodologyNotes();
    
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
        // Section sur les patterns de code
        markdown += generatePatternAnalysisSection(analysis.codeContext);
    }
    
    // Dependency Analysis
    markdown += `## Dependency Analysis\n\n`;
    markdown += generateDependencyInsights(analysis.details);
    
    // Issue Analysis
    markdown += `## Issue Analysis\n\n`;
    markdown += generateIssueAnalysis(analysis.details);
    
    // Code Context (if available)
    if (analysis.codeContext && analysis.codeContext.length > 0) {
        markdown += `## Code Quality Patterns\n\n`;
        markdown += generateCodeContextAnalysis(analysis.codeContext);
    }
    
    // Recommendations
    markdown += `## Actionable Recommendations\n\n`;
    markdown += generateRecommendations(analysis, result.emblematicFiles);
    
    // Technical Notes
    markdown += `\n---\n`;
    markdown += `## 🔬 Technical Notes\n\n`;
    markdown += `### Duplication Detection\n`;
    markdown += `- **Algorithm:** Enhanced 8-line literal pattern matching with 8+ token minimum, cross-file exact matches only\n`;
    markdown += `- **Focus:** Copy-paste duplication using MD5 hashing of normalized blocks (not structural similarity)\n`;
    markdown += `- **Philosophy:** Pragmatic approach using regex normalization - avoids false positives while catching actionable duplication\n`;
    markdown += `- **Results:** Typically 0-15% duplication vs ~70% with structural detection tools, filtering imports/trivial declarations\n\n`;
    
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

// Helper Functions

function generateGradeVisual(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
    const gradeEmojis: Record<'A' | 'B' | 'C' | 'D' | 'F', string> = {
        'A': '🌟',
        'B': '✅',
        'C': '⚠️',
        'D': '🔴',
        'F': '💀'
    };
    
    const gradeColors: Record<'A' | 'B' | 'C' | 'D' | 'F', string> = {
        'A': 'green',
        'B': 'lightgreen',
        'C': 'yellow',
        'D': 'orange',
        'F': 'red'
    };
    
    return `### Grade: ${gradeEmojis[grade]} **${grade}**\n`;
}

/**
 * Crée la section "Deep Dive" sur les fonctions les plus complexes.
 */
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

/**
 * Crée la section d'analyse des patterns de code détectés.
 */
function generatePatternAnalysisSection(codeContexts: CodeContext[]): string {
    const allPatterns = {
        quality: new Map<string, number>(),
        architecture: new Map<string, number>()
    };

    codeContexts.forEach(c => {
        c.patterns.quality.forEach(p => allPatterns.quality.set(p, (allPatterns.quality.get(p) || 0) + 1));
        c.patterns.architecture.forEach(p => allPatterns.architecture.set(p, (allPatterns.architecture.get(p) || 0) + 1));
    });

    let markdown = '';
    const antiPatterns = Array.from(allPatterns.quality.entries()).filter(([p]) => !['type-safe', 'error-handling'].includes(p));
    const goodPractices = Array.from(allPatterns.architecture.entries());

    if (antiPatterns.length > 0) {
        markdown += `### ❗ Anti-Patterns & Code Smells\n\n`;
        markdown += generatePatternTable(new Map(antiPatterns), 'quality');
    }

    if (goodPractices.length > 0) {
        markdown += `### ✅ Good Practices Detected\n\n`;
        markdown += generatePatternTable(new Map(goodPractices), 'architecture');
    }

    return generateSection("📈 Code Pattern Analysis", markdown);
}


function generateScoringMethodologyNotes(): string {
    let notes = `InsightCode uses **internal hypothesis-based scoring** requiring empirical validation:\n\n`;
    
    notes += `#### Overall Score Formula\n`;
    notes += `\`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)\`\n\n`;
    
    notes += `| Dimension | Weight | Foundation & Thresholds |\n`;
    notes += `|-----------|--------|--------------------------|\n`;
    notes += `| **Complexity** | **45%** | **McCabe (1976) thresholds:** ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Weight = internal hypothesis. |\n`;
    notes += `| **Maintainability** | **30%** | **File size impact hypothesis:** ≤200 LOC ideal. Weight = internal hypothesis (requires validation). |\n`;
    notes += `| **Duplication** | **25%** | **⚠️ LEGACY thresholds (5x more permissive than industry):** ≤15% "excellent" vs SonarQube ≤3%. Weight = internal hypothesis. |\n\n`;
    
    notes += `#### ⚠️ Important Disclaimers\n`;
    notes += `**Project weights (45/30/25) are internal hypotheses requiring empirical validation, NOT industry standards.** These weights apply only to project-level aggregation. File Health Scores use unweighted penalty summation.\n\n`;
    notes += `**Duplication thresholds are 5x more permissive than industry standards** (≤15% = "excellent" vs SonarQube ≤3%). Scores may appear inflated compared to standard tools.\n\n`;
    
    notes += `#### Grade Scale (Academic Standard)\n`;
    notes += `**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)\n\n`;
    
    notes += `#### Aggregation Method\n`;
    notes += `- **Project-level:** Architectural criticality weighting WITHOUT outlier masking\n`;
    notes += `- **File-level:** Penalty-based (100 - penalties) with NO CAPS - extreme values get extreme penalties\n`;
    notes += `- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems\n\n`;
    
    return notes;
}

function generateSection(title: string, content: string | string[]): string {
    const contentStr = Array.isArray(content) ? content.join('\n') : content;
    return `## ${title}\n\n${contentStr}\n\n`;
}

function generateScoreTable(scores: any, avgDuplicationRatio?: number): string { 
    const getStatus = getScoreStatus;
    
   let table = `| Dimension | Score (Value) | Status |\n`;
    table += `|:---|:---|:---|\n`;

    // AFFICHE SYSTÉMATIQUEMENT LE POURCENTAGE DE DUPLICATION
    const dupPercent = avgDuplicationRatio !== undefined ? (avgDuplicationRatio * 100).toFixed(1) : '0.0';
    const duplicationText = `${scores.duplication}/100 (${dupPercent}% detected)`;

    table += `| Complexity | ${scores.complexity}/100 | ${getStatus(scores.complexity)} |\n`;
    table += `| Duplication | ${duplicationText} | ${getStatus(scores.duplication)} |\n`;
    table += `| Maintainability | ${scores.maintainability}/100 | ${getStatus(scores.maintainability)} |\n`;
    table += `| **Overall** | **${scores.overall}/100** | **${getStatus(scores.overall)}** |\n`;
    return table;
}

function generateHealthDistribution(details: FileDetail[]): string {
    const distribution = {
        excellent: details.filter(d => getHealthCategory(d.healthScore) === 'excellent').length,
        good: details.filter(d => getHealthCategory(d.healthScore) === 'good').length,
        moderate: details.filter(d => getHealthCategory(d.healthScore) === 'moderate').length,
        poor: details.filter(d => getHealthCategory(d.healthScore) === 'poor').length
    };
    
    let markdown = `| Health Status | Count | Percentage |\n`;
    markdown += `|---------------|-------|------------|\n`;
    
    const total = details.length;
    markdown += `| 🟢 Excellent (90-100) | ${distribution.excellent} | ${Math.round(distribution.excellent/total * 100)}% |\n`;
    markdown += `| 🟡 Good (70-89) | ${distribution.good} | ${Math.round(distribution.good/total * 100)}% |\n`;
    markdown += `| 🟠 Moderate (50-69) | ${distribution.moderate} | ${Math.round(distribution.moderate/total * 100)}% |\n`;
    markdown += `| 🔴 Poor (<50) | ${distribution.poor} | ${Math.round(distribution.poor/total * 100)}% |\n\n`;
    
    return markdown;
}

function getCriticalFiles(details: FileDetail[], emblematicFiles: any): FileDetail[] {
    return details
        .filter(d => d.healthScore < 70 || d.issues.some(i => i.severity === 'critical' || i.severity === 'high'))
        .sort((a, b) => {
            // Priority 0: Emblematic files first within same severity groups
            const aIsEmblematic = isFileEmblematic(a.file, emblematicFiles);
            const bIsEmblematic = isFileEmblematic(b.file, emblematicFiles);
            
            // Priority 1: Critical issues count (descending)
            const aCriticalCount = a.issues.filter(i => i.severity === 'critical').length;
            const bCriticalCount = b.issues.filter(i => i.severity === 'critical').length;
            if (aCriticalCount !== bCriticalCount) {
                return bCriticalCount - aCriticalCount;
            }
            
            // Priority 1.5: Within same critical count, emblematic files first
            if (aCriticalCount === bCriticalCount && aIsEmblematic !== bIsEmblematic) {
                return aIsEmblematic ? -1 : 1;
            }
            
            // Priority 2: High issues count (descending)
            const aHighCount = a.issues.filter(i => i.severity === 'high').length;
            const bHighCount = b.issues.filter(i => i.severity === 'high').length;
            if (aHighCount !== bHighCount) {
                return bHighCount - aHighCount;
            }
            
            // Priority 2.5: Within same high count, emblematic files first
            if (aHighCount === bHighCount && aIsEmblematic !== bIsEmblematic) {
                return aIsEmblematic ? -1 : 1;
            }
            
            // Priority 3: Health score (ascending - worst first)
            if (a.healthScore !== b.healthScore) {
                return a.healthScore - b.healthScore;
            }
            
            // Priority 4: Complexity (descending)
            return b.metrics.complexity - a.metrics.complexity;
        })
        .slice(0, 10);
}

function generateCriticalFilesSection(criticalFiles: FileDetail[], emblematicFiles: any): string {
    let markdown = `| File | Health | Issues (Crit/High) | Primary Concern |\n`; // Titre de colonne plus clair
    markdown += `|------|--------|--------------------|----------------|\n`;
    
    criticalFiles.forEach(file => {
        // FileDetail.file is already normalized - trust it
        const isEmblematic = isFileEmblematic(file.file, emblematicFiles);
        const fileLabel = isEmblematic ? `⭐ ${file.file}` : file.file;
        
        // SÉPARER le comptage pour plus de clarté
        const criticalIssueCount = file.issues.filter(i => i.severity === 'critical').length;
        const highIssueCount = file.issues.filter(i => i.severity === 'high').length;
        
        // CRÉER un résumé plus informatif
        let issuesSummary = `${criticalIssueCount + highIssueCount}`;
        if (criticalIssueCount > 0 || highIssueCount > 0) {
            issuesSummary += ` (${criticalIssueCount} crit, ${highIssueCount} high)`;
        }
        
        const primaryConcern = getPrimaryConcern(file);
        
        // UTILISER le nouveau résumé
        markdown += `| ${fileLabel} | ${file.healthScore}% | ${issuesSummary} | ${primaryConcern} |\n`;
    });
    
    markdown += `\n*⭐ indicates emblematic/core files*\n\n`;
    return markdown;
}

function isFileEmblematic(filePath: string, emblematicFiles: any): boolean {
    const allEmblematic = [
        ...emblematicFiles.coreFiles,
        ...emblematicFiles.architecturalFiles,
        ...emblematicFiles.performanceCriticalFiles,
        ...emblematicFiles.complexAlgorithmFiles
    ];
    
    return allEmblematic.some(ef => filePath.includes(ef));
}

function getPrimaryConcern(file: FileDetail): string {
    // Priorité 1: Complexité extrême
    if (file.metrics.complexity > 20) {
        const label = getComplexityLabel(file.metrics.complexity);
        return `${label} complexity (${file.metrics.complexity})`;
    }
    
    // Priorité 2: Taille de fichier
    if (file.metrics.loc > 300) {
        const severity = file.metrics.loc > 1000 ? 'Extremely large' : 
                        file.metrics.loc > 600 ? 'Very large' : 'Large';
        return `${severity} file (${file.metrics.loc} LOC)`;
    }
    
    // Priorité 3: Duplication
    if (file.metrics.duplicationRatio > 0.1) {
        const duplicationPercentage = file.metrics.duplicationRatio * 100;
        const label = getDuplicationLabel(duplicationPercentage);
        // Add more granularity for extreme cases
        const finalLabel = duplicationPercentage > 30 ? 'Extreme' : label;
        return `${finalLabel} duplication (${Math.round(duplicationPercentage)}%)`;
    }
    
    // Priorité 4: Instabilité
    if (file.dependencies.instability > 0.8) {
        const severity = file.dependencies.instability > 0.95 ? 'Extreme' : 'High';
        return `${severity} instability (${file.dependencies.instability.toFixed(2)})`;
    }
    
    // Priorité 5: Score de santé très bas
    if (file.healthScore < 30) {
        const label = getMaintainabilityLabel(file.healthScore);
        return `${label} health score (${file.healthScore}%)`;
    }
    
    return 'Multiple quality issues';
}

function generateDependencyInsights(details: FileDetail[]): string {
    // Hub files (high incoming dependencies)
    const hubFiles = details
        .filter(d => d.dependencies.percentileUsageRank > 80)
        .sort((a, b) => b.dependencies.incomingDependencies - a.dependencies.incomingDependencies)
        .slice(0, 5);
    
    // Unstable files
    const unstableFiles = details
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

function inferFileRole(filePath: string): string {
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

function generateCodeContextAnalysis(codeContexts: CodeContext[]): string {
    let markdown = `### Detected Patterns Summary\n\n`;
    
    // Aggregate all patterns
    const patternCounts = {
        quality: new Map<string, number>(),
        architecture: new Map<string, number>(),
        performance: new Map<string, number>(),
        security: new Map<string, number>(),
        testing: new Map<string, number>()
    };
    
    codeContexts.forEach((context) => {
        context.patterns.quality.forEach(p => 
            patternCounts.quality.set(p, (patternCounts.quality.get(p) || 0) + 1));
        context.patterns.architecture.forEach(p => 
            patternCounts.architecture.set(p, (patternCounts.architecture.get(p) || 0) + 1));
        context.patterns.performance.forEach(p => 
            patternCounts.performance.set(p, (patternCounts.performance.get(p) || 0) + 1));
        context.patterns.security.forEach(p => 
            patternCounts.security.set(p, (patternCounts.security.get(p) || 0) + 1));
        context.patterns.testing.forEach(p => 
            patternCounts.testing.set(p, (patternCounts.testing.get(p) || 0) + 1));
    });
    
    // Quality patterns
    if (patternCounts.quality.size > 0) {
        markdown += `#### Quality Patterns\n`;
        markdown += generatePatternTable(patternCounts.quality, 'quality');
    }
    
    // Architecture patterns
    if (patternCounts.architecture.size > 0) {
        markdown += `#### Architecture Patterns\n`;
        markdown += generatePatternTable(patternCounts.architecture, 'architecture');
    }
    
    
    return markdown;
}

function generateRecommendations(analysis: AnalysisResult, emblematicFiles: any): string {
    const parts: string[] = [];

    // Priority 1: Critical complexity in core files
    const complexCoreFiles = analysis.details
        .filter(d => d.healthScore < 50 && d.metrics.complexity > 50 && isFileEmblematic(d.file, emblematicFiles))
        .sort((a, b) => b.metrics.complexity - a.metrics.complexity)
        .slice(0, 3);

    // Fallback with lower threshold if no critical files found
    const fallbackFiles = complexCoreFiles.length === 0 ? 
        analysis.details
            .filter(d => d.metrics.complexity > 20 && isFileEmblematic(d.file, emblematicFiles))
            .sort((a, b) => b.metrics.complexity - a.metrics.complexity)
            .slice(0, 3) : [];

    const targetFiles = complexCoreFiles.length > 0 ? complexCoreFiles : fallbackFiles;

    if (targetFiles.length > 0) {
        let section = `### 🔴 Priority 1: Refactor High-Complexity Core Functions\n\n`;
        section += `These emblematic files have very high complexity that impacts maintainability:\n\n`;
        
        targetFiles.forEach(file => {
            const fileContext = analysis.codeContext?.find(c => c.file === file.file);
            const topFunction = fileContext?.criticalFunctions?.length ?? 0 > 0 
                ? fileContext?.criticalFunctions.sort((a, b) => b.complexity - a.complexity)[0]
                : null;
            
            section += `- **File:** \`${file.file}\` (Complexity: ${file.metrics.complexity})\n`;
            if (topFunction && topFunction.complexity > 10) { // Sanity check
                section += `  - 🎯 **Target Function:** \`${topFunction.name}\` (Function Complexity: ${topFunction.complexity})\n`;
                section += `  - **Suggestion:** This function is the primary complexity driver. Break it down into smaller, single-responsibility helpers.\n\n`;
            } else if (fileContext && fileContext.criticalFunctions?.length === 0) {
                section += `  - **Note:** No specific functions identified for targeting (possibly many small functions).\n`;
                section += `  - **Suggestion:** Review file architecture - consider if this complexity comes from too many responsibilities.\n\n`;
            } else {
                section += `  - **Suggestion:** Apply the Single Responsibility Principle to decompose this file into smaller modules.\n\n`;
            }
        });
        parts.push(section);
    }

    // Priority 2: Architectural improvements (stricter instability threshold)
    const unstableHubs = analysis.details
        .filter(d => d.dependencies.percentileUsageRank > 80 && d.dependencies.instability > 0.7)
        .sort((a, b) => b.dependencies.incomingDependencies - a.dependencies.incomingDependencies)
        .slice(0, 3);
    
    if (unstableHubs.length > 0) {
        let section = `### 🟠 Priority 2: Stabilize High-Impact Files\n\n`;
        section += `These files are heavily used but highly unstable, propagating change risks:\n\n`;
        
        unstableHubs.forEach(file => {
            const fileContext = analysis.codeContext?.find(c => c.file === file.file);
            const topFunction = fileContext?.criticalFunctions?.length ?? 0 > 0
                ? fileContext?.criticalFunctions.sort((a, b) => b.complexity - a.complexity)[0]
                : null;
            
            section += `- **File:** \`${file.file}\` (Instability: ${file.dependencies.instability.toFixed(2)}, Used by: ${file.dependencies.incomingDependencies})\n`;
            if (topFunction && topFunction.complexity > 5) { // Lower threshold for dependency-heavy functions
                section += `  - 🎯 **Target Function:** \`${topFunction.name}\` (Function Complexity: ${topFunction.complexity})\n`;
                section += `  - **Suggestion:** This function likely contains many dependencies. Extract smaller helpers and apply Dependency Inversion.\n\n`;
            } else {
                section += `  - **Suggestion:** Reduce outgoing dependencies (current: ${file.dependencies.outgoingDependencies}). Apply Dependency Inversion Principle.\n\n`;
            }
        });
        parts.push(section);
    }
    
    // Quick wins (better sorting by excess ratio)
    const quickWins = analysis.details
        .filter(d => d.issues.some(i => i.severity === 'medium' && i.excessRatio < 1.5))
        .sort((a, b) => {
            const aRatio = a.issues.find(i => i.severity === 'medium' && i.excessRatio < 1.5)?.excessRatio || 0;
            const bRatio = b.issues.find(i => i.severity === 'medium' && i.excessRatio < 1.5)?.excessRatio || 0;
            return bRatio - aRatio;
        })
        .slice(0, 5);
    
    if (quickWins.length > 0) {
        let section = `### 🟢 Quick Wins (< 1 hour each)\n\n`;
        section += `These issues are relatively simple to fix and will quickly improve overall quality:\n\n`;
        
        quickWins.forEach(file => {
            const issue = file.issues.find(i => i.severity === 'medium' && i.excessRatio < 1.5);
            if (issue) {
                const fileContext = analysis.codeContext?.find(c => c.file === file.file);
                const topFunction = fileContext?.criticalFunctions?.length ?? 0 > 0
                    ? fileContext?.criticalFunctions.sort((a, b) => b.complexity - a.complexity)[0]
                    : null;
                
                section += `- **File:** \`${file.file}\` (${capitalize(issue.type)}: ${Math.round(issue.excessRatio * 100)}% over threshold)\n`;
                
                if (topFunction && issue.type === 'complexity' && topFunction.complexity > 5) {
                    section += `  - 🎯 **Target Function:** \`${topFunction.name}\` (Function Complexity: ${topFunction.complexity})\n`;
                    section += `  - **Suggestion:** Break this function into smaller helpers to quickly reduce file complexity.\n\n`;
                } else if (topFunction && topFunction.complexity > 3) {
                    section += `  - 🎯 **Focus Function:** \`${topFunction.name}\` (Complexity: ${topFunction.complexity})\n`;
                    section += `  - **Suggestion:** Addressing this function will help reduce the file's ${issue.type} issues.\n\n`;
                } else {
                    section += `  - **Suggestion:** Quick refactor to reduce ${issue.type} - achievable in under an hour.\n\n`;
                }
            }
        });
        parts.push(section);
    }
    
    // Handle case where no recommendations are found (perfect project)
    if (parts.length === 0) {
        return "🎉 **Congratulations!** No priority recommendations identified. This project shows excellent code quality standards.\n";
    }
    
    return parts.join('\n');
}

// Utility functions
function formatNumber(num: number): string {
    return num.toLocaleString();
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSeverityEmoji(severity: 'critical' | 'high' | 'medium' | 'low'): string {
    const emojis = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
    };
    return emojis[severity] || '';
}

function getTopAffectedAreas(issues: any[]): string {
    const fileCounts = new Map<string, number>();
    issues.forEach(issue => {
        const dir = issue.file.split('/').slice(0, -1).join('/') || 'root';
        fileCounts.set(dir, (fileCounts.get(dir) || 0) + 1);
    });
    
    return Array.from(fileCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([dir]) => dir)
        .join(', ');
}

function getAverageExcessRatio(issues: Issue[]): string {
    if (issues.length === 0) return '0';
    const avg = issues.reduce((sum, i) => sum + i.excessRatio, 0) / issues.length;
    return avg.toFixed(1);
}

function generatePatternTable(patterns: Map<string, number>, category: string): string {
    let markdown = `| Pattern | Occurrences | Implication |\n`;
    markdown += `|---------|-------------|-------------|\n`;
    
    Array.from(patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
            markdown += `| ${formatPatternName(pattern)} | ${count} | ${getPatternImplication(pattern, category)} |\n`;
        });
    
    markdown += `\n`;
    return markdown;
}

function formatPatternName(pattern: string): string {
    return pattern.split('-').map(capitalize).join(' ');
}

function getPatternImplication(pattern: string, _category: string): string {
    const implications = {
        'deep-nesting': 'Hard to read and test',
        'long-function': 'Should be split into smaller functions',
        'high-complexity': 'Error-prone and hard to maintain',
        'too-many-params': 'Consider using object parameters',
        'god-function': 'Violates Single Responsibility',
        'async-heavy': 'Ensure proper error handling',
        'error-handling': 'Good defensive programming',
        'type-safe': 'Reduces runtime errors',
        'memory-intensive': 'Monitor for memory leaks',
        'io-heavy': 'Consider caching strategies',
        'input-validation': 'Security-conscious code',
        'test-file': 'Good test coverage'
    };
    
    return implications[pattern as keyof typeof implications] || 'Review for best practices';
}

// Functions for summary report
function generateGradeDistributionChart(distribution: Record<string, number>): string {
    let markdown = `| Grade | Projects | Visual |\n`;
    markdown += `|-------|----------|--------|\n`;
    
    const grades = ['A', 'B', 'C', 'D', 'F'];
    grades.forEach(grade => {
        const count = distribution[grade] || 0;
        const bar = '█'.repeat(count * 2);
        markdown += `| ${grade} | ${count} | ${bar} |\n`;
    });
    
    markdown += `\n`;
    return markdown;
}

function generateGlobalInsights(results: ReportResult[], summary: ReportSummary): string {
    const successfulResults = results.filter(r => !r.error);
    
    // Top performers
    const topPerformers = successfulResults
        .sort((a, b) => b.analysis.overview.scores.overall - a.analysis.overview.scores.overall)
        .slice(0, 3);
    
    // Most common issues
    const allIssues = successfulResults.flatMap(r => 
        r.analysis.details.flatMap(d => d.issues)
    );
    
    let markdown = `### Key Findings\n\n`;
    
    // Average metrics
    const avgScore = successfulResults.reduce((sum, r) => sum + r.analysis.overview.scores.overall, 0) / successfulResults.length;
    markdown += `- **Average Code Quality Score:** ${Math.round(avgScore)}%\n`;
    markdown += `- **Code Duplication Rate:** ${(summary.avgDuplication * 100).toFixed(1)}%\n`;
    markdown += `- **Most Common Issue Type:** ${getMostCommonIssueType(allIssues)}\n`;
    markdown += `- **Critical Issues Found:** ${allIssues.filter(i => i.severity === 'critical').length}\n\n`;
    
    // Top performers
    markdown += `### Highest Quality Projects\n\n`;
    topPerformers.forEach((result, index) => {
        markdown += `${index + 1}. **${result.project}** (Grade ${result.analysis.overview.grade}, Score: ${result.analysis.overview.scores.overall}/100)\n`;
        markdown += `   - ${result.description}\n`;
    });
    
    markdown += `\n`;
    return markdown;
}

function getMostCommonIssueType(issues: Issue[]): string {
    const typeCounts = new Map<string, number>();
    issues.forEach(issue => {
        typeCounts.set(issue.type, (typeCounts.get(issue.type) || 0) + 1);
    });
    
    const sorted = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? capitalize(sorted[0][0]) : 'None';
}

function generateCategorySection(results: ReportResult[], category: string): string {
    let markdown = `### ${capitalize(category)} Projects\n\n`;
    
    const avgScore = results.reduce((sum, r) => sum + r.analysis.overview.scores.overall, 0) / results.length;
    const avgComplexity = results.reduce((sum, r) => sum + r.analysis.overview.statistics.avgComplexity, 0) / results.length;
    
    markdown += `- **Projects:** ${results.map(r => r.project).join(', ')}\n`;
    markdown += `- **Average Score:** ${Math.round(avgScore)}/100\n`;
    markdown += `- **Average Complexity:** ${avgComplexity.toFixed(1)}\n\n`;
    
    return markdown;
}

function generateCriticalFindings(results: ReportResult[]): string {
    const successfulResults = results.filter(r => !r.error);
    
    // Collect all critical issues with context
    const criticalIssues = successfulResults.flatMap(r => 
        r.analysis.details.flatMap(d => 
            d.issues
                .filter(i => i.severity === 'critical' || i.severity === 'high')
                .map(i => ({
                    project: r.project,
                    file: d.file,
                    issue: i,
                    isEmblematic: isFileEmblematic(d.file, r.emblematicFiles)
                }))
        )
    );
    
    let markdown = `Found ${criticalIssues.length} critical/high severity issues across all projects:\n\n`;
    
    // Group by project
    const byProject = new Map<string, typeof criticalIssues>();
    criticalIssues.forEach(item => {
        const list = byProject.get(item.project) || [];
        list.push(item);
        byProject.set(item.project, list);
    });
    
    byProject.forEach((issues, project) => {
        markdown += `### ${project}\n`;
        issues.slice(0, 3).forEach(item => {
            const emblematicMark = item.isEmblematic ? ' ⭐' : '';
            markdown += `- **${item.file}**${emblematicMark}: ${capitalize(item.issue.type)} `;
            markdown += `(${Math.round(item.issue.excessRatio * 100)}% over threshold)\n`;
        });
        if (issues.length > 3) {
            markdown += `- *...and ${issues.length - 3} more issues*\n`;
        }
        markdown += `\n`;
    });
    
    return markdown;
}

function generatePatternAnalysis(results: ReportResult[]): string {
    const successfulResults = results.filter(r => !r.error && r.analysis.codeContext);
    
    // Aggregate patterns across all projects
    const patternStats = {
        quality: new Map<string, { count: number; projects: Set<string> }>(),
        architecture: new Map<string, { count: number; projects: Set<string> }>(),
        performance: new Map<string, { count: number; projects: Set<string> }>()
    };
    
    successfulResults.forEach(result => {
        result.analysis.codeContext?.forEach((context) => {
            context.patterns.quality.forEach(p => {
                const stat = patternStats.quality.get(p) || { count: 0, projects: new Set() };
                stat.count++;
                stat.projects.add(result.project);
                patternStats.quality.set(p, stat);
            });
            
            context.patterns.architecture.forEach(p => {
                const stat = patternStats.architecture.get(p) || { count: 0, projects: new Set() };
                stat.count++;
                stat.projects.add(result.project);
                patternStats.architecture.set(p, stat);
            });
            
            context.patterns.performance.forEach(p => {
                const stat = patternStats.performance.get(p) || { count: 0, projects: new Set() };
                stat.count++;
                stat.projects.add(result.project);
                patternStats.performance.set(p, stat);
            });
        });
    });
    
    let markdown = `### Most Common Patterns\n\n`;
    
    // Quality patterns
    const topQuality = Array.from(patternStats.quality.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
    
    if (topQuality.length > 0) {
        markdown += `#### Quality Patterns\n`;
        markdown += `| Pattern | Occurrences | Found In |\n`;
        markdown += `|---------|-------------|----------|\n`;
        topQuality.forEach(([pattern, stat]) => {
            const projects = Array.from(stat.projects).slice(0, 3).join(', ');
            const more = stat.projects.size > 3 ? ` +${stat.projects.size - 3}` : '';
            markdown += `| ${formatPatternName(pattern)} | ${stat.count} | ${projects}${more} |\n`;
        });
        markdown += `\n`;
    }
    
    return markdown;
}

function generateProjectSummary(result: ReportResult): string {
    const { project, analysis } = result;
    
    let markdown = `### ${project}\n\n`;
    markdown += `- **Grade:** ${analysis.overview.grade} (${analysis.overview.scores.overall}/100)\n`;
    markdown += `- **Summary:** ${analysis.overview.summary}\n`;
    markdown += `- **Files:** ${analysis.overview.statistics.totalFiles} | **LOC:** ${formatNumber(analysis.overview.statistics.totalLOC)}\n`;
    markdown += `- **Avg Complexity:** ${analysis.overview.statistics.avgComplexity.toFixed(1)}\n`;
    
    // Highlight main issues
    const criticalCount = analysis.details.reduce((count, d) => 
        count + d.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length, 0
    );
    
    if (criticalCount > 0) {
        markdown += `- **⚠️ Critical Issues:** ${criticalCount}\n`;
    }
    
    markdown += `\n`;
    return markdown;
}