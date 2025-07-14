/**
 * Générateur de rapports synthétiques multi-projets
 */

import { ReportResult, ReportSummary, FileIssue } from './types';
import { isFileEmblematic, formatPercentage } from './scoring.utils';
import { 
    formatNumber, 
    capitalize, 
    generatePatternTable 
} from './shared-report-utils';

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
    markdown += `## 📈 Pattern Analysis\n\n`;
    markdown += generateGlobalPatternAnalysis(results);
  
    
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

// Helper functions for summary report

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
    markdown += `- **Code Duplication Rate:** ${formatPercentage(summary.avgDuplication)}\n`;
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

function getMostCommonIssueType(issues: FileIssue[]): string {
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

function generateGlobalPatternAnalysis(results: ReportResult[]): string {
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
            markdown += `| ${capitalize(pattern.split('-').join(' '))} | ${stat.count} | ${projects}${more} |\n`;
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