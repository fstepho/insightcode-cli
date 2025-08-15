/**
 * Générateur de rapports synthétiques multi-projets
 */

import { ReportResult, ReportSummary } from './types';
import { isFileEmblematic, formatPercentage, GRADE_CONFIG } from './scoring.utils';
import { 
    formatNumber, 
    capitalize, 
    getPatternCategory,
    PatternCategory
} from './markdown-report-utils';

/**
 * Génère le rapport markdown synthétique multi-projets
 */
export function generateMarkdownReport(results: ReportResult[], summary: ReportSummary, production: boolean): string {
    const timestamp = new Date().toISOString();
    const mode = production ? 'Production Code' : 'Full Project';
    
    // Header du rapport
    let markdown = `# InsightCode Benchmark Report - ${mode}\n\n`;
    markdown += `**Generated:** ${timestamp}\n`;
    markdown += `**Tool Version:** v0.8.0\n`;
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
    
    // Use centralized configuration
    GRADE_CONFIG.forEach(gradeInfo => {
        const count = distribution[gradeInfo.grade] || 0;
        const bar = '█'.repeat(count * 2);
        markdown += `| ${gradeInfo.grade} | ${count} | ${bar} |\n`;
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
    
    // Count critical issues across both file and function levels
    function getCriticalIssueCount(results: ReportResult[]): number {
        let count = 0;
        results.forEach(result => {
            if (!result.error) {
                // File-level critical issues
                result.analysis.details.forEach(detail => {
                    count += detail.issues.filter(i => i.severity === 'critical').length;
                });
                
                // Function-level critical issues - ADAPTED for new structure
                result.analysis.details.forEach(detail => {
                    detail.functions?.forEach(func => {
                        count += func.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;
                    });
                });
            }
        });
        return count;
    }
    
    let markdown = `### Key Findings\n\n`;
    
    // Average metrics
    const avgScore = successfulResults.reduce((sum, r) => sum + r.analysis.overview.scores.overall, 0) / successfulResults.length;
    markdown += `- **Average Code Quality Score:** ${Math.round(avgScore)}%\n`;
    markdown += `- **Code Duplication Rate:** ${formatPercentage(summary.avgDuplication)}\n`;
    markdown += `- **Most Common Issue Type:** ${getMostCommonIssueType(successfulResults)}\n`;
    markdown += `- **Critical Issues Found:** ${getCriticalIssueCount(successfulResults)}\n\n`;
    
    // Top performers
    markdown += `### Highest Quality Projects\n\n`;
    topPerformers.forEach((result, index) => {
        markdown += `${index + 1}. **${result.project}** (Grade ${result.analysis.overview.grade}, Score: ${result.analysis.overview.scores.overall}/100)\n`;
        markdown += `   - ${result.description}\n`;
    });
    
    markdown += `\n`;
    return markdown;
}

function getMostCommonIssueType(results: ReportResult[]): string {
    const typeCounts = new Map<string, number>();
    
    // Collect both file-level and function-level issues
    results.forEach(result => {
        if (!result.error) {
            // File-level issues
            result.analysis.details.forEach(detail => {
                detail.issues.forEach(issue => {
                    typeCounts.set(issue.type, (typeCounts.get(issue.type) || 0) + 1);
                });
            });
            
            // ADAPTED: Function-level issues from FileDetail.functions
            result.analysis.details.forEach(detail => {
                detail.functions?.forEach(func => {
                    func.issues.forEach(issue => {
                        typeCounts.set(issue.type, (typeCounts.get(issue.type) || 0) + 1);
                    });
                });
            });
        }
    });
    
    const sorted = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? capitalize(sorted[0][0].replace('-', ' ')) : 'None';
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
    
    // Collect all critical issues with context from both file and function levels
    const criticalIssues: Array<{
        project: string;
        file: string;
        issue: { type: string; severity: string; excessRatio?: number };
        isEmblematic: boolean;
        source: 'file' | 'function';
        functionName?: string;
    }> = [];
    
    // Collect critical issues from both file-level and function-level
    successfulResults.forEach(r => {
        // File-level critical issues
        r.analysis.details.forEach(detail => {
            detail.issues
                .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
                .forEach(issue => {
                    criticalIssues.push({
                        project: r.project,
                        file: detail.file,
                        issue: { type: issue.type, severity: issue.severity, excessRatio: issue.excessRatio || 1 },
                        isEmblematic: isFileEmblematic(detail.file, r.emblematicFiles),
                        source: 'file'
                    });
                });
        });
        
        // Function-level critical issues - ADAPTED for new structure
        r.analysis.details.forEach(detail => {
            detail.functions?.forEach(func => {
                func.issues
                    .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
                    .forEach(issue => {
                        criticalIssues.push({
                            project: r.project,
                            file: detail.file,
                            issue: { type: issue.type, severity: issue.severity, excessRatio: 1 },
                            isEmblematic: isFileEmblematic(detail.file, r.emblematicFiles),
                            source: 'function',
                            functionName: func.name
                        });
                    });
            });
        });
    });
    
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
            const sourceIndicator = item.source === 'function' ? ` in \`${item.functionName}\`` : '';
            const excessInfo = item.issue.excessRatio ? `(${Math.round(item.issue.excessRatio * 100)}% over threshold)` : '';
            markdown += `- **${item.file}**${emblematicMark}: ${capitalize(item.issue.type.replace('-', ' '))}${sourceIndicator} ${excessInfo}\n`;
        });
        if (issues.length > 3) {
            markdown += `- *...and ${issues.length - 3} more issues*\n`;
        }
        markdown += '\n';
    });
    
    return markdown;
}

function generateGlobalPatternAnalysis(results: ReportResult[]): string {
    const successfulResults = results.filter(r => !r.error);
    
    // Aggregate patterns across all projects
    const patternStats = {
        quality: new Map<string, { count: number; projects: Set<string> }>(),
        architecture: new Map<string, { count: number; projects: Set<string> }>(),
        performance: new Map<string, { count: number; projects: Set<string> }>()
    };
    
    successfulResults.forEach(result => {
        // ADAPTED: Extract patterns from function issues instead of codeContext
        result.analysis.details.forEach(detail => {
            detail.functions?.forEach(func => {
                func.issues.forEach(issue => {
                    // Categorize issue types into pattern categories
                    const category: PatternCategory | null = getPatternCategory(issue.type);
                    if (category) {
                        const categoryMap = patternStats[category as keyof typeof patternStats];
                        const stat = categoryMap.get(issue.type) || { count: 0, projects: new Set() };
                        stat.count++;
                        stat.projects.add(result.project);
                        categoryMap.set(issue.type, stat);
                    }
                });
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