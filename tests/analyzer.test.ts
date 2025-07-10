import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyze } from '../src/analyzer';
import { FileDetail, AnalysisResult, ThresholdConfig, Issue, IssueType, Severity } from '../src/types';
import * as dependencyAnalyzer from '../src/dependencyAnalyzer';
import * as duplication from '../src/duplication';
import * as projectInfo from '../src/projectInfo';

// Mock the dependencies of analyzer.ts
vi.mock('../src/dependencyAnalyzer');
vi.mock('../src/duplication');
vi.mock('../src/projectInfo');

// Helper to create a mock FileDetail object for testing
const createFileDetail = (overrides: Partial<FileDetail>): FileDetail => ({
    file: 'test.ts',
    metrics: {
        complexity: 1,
        loc: 10,
        functionCount: 1,
        duplication: 0
    },
    importance: {
        usageCount: 0,
        usageRank: 0,
        isEntryPoint: false,
        isCriticalPath: false
    },
    issues: [],
    healthScore: 100,
    isCritical: false,
    ...overrides,
});

// Helper to create a mock Issue
const createIssue = (overrides: Partial<Issue>): Issue => ({
    type: IssueType.Complexity,
    severity: Severity.High,
    location: {
        line: 1
    },
    context: {
        message: 'Test issue',
        threshold: 10,
        excessRatio: 2.0
    },
    action: {
        description: 'Fix this issue',
        impact: 'Better code quality',
        effortHours: 2
    },
    ...overrides,
});

// A default threshold config for tests
const MOCK_THRESHOLDS: ThresholdConfig = {
    complexity: { 
        production: { medium: 10, high: 20 }, 
        test: { medium: 15, high: 30 }, 
        utility: { medium: 20, high: 40 } 
    },
    size: { 
        production: { medium: 200, high: 300 }, 
        test: { medium: 300, high: 500 }, 
        utility: { medium: 400, high: 600 } 
    },
    duplication: { 
        production: { medium: 15, high: 30 }, 
        test: { medium: 25, high: 50 }, 
        utility: { medium: 30, high: 60 } 
    },
};

describe('Analyzer v0.6.0', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks();

        // Provide default mock implementations for the analyzer's dependencies
        vi.spyOn(dependencyAnalyzer, 'analyzeDependencies').mockReturnValue(new Map());
        vi.spyOn(duplication, 'detectDuplication').mockImplementation((files, _) => files);
        vi.spyOn(projectInfo, 'getProjectInfo').mockReturnValue({
          name: 'test-project',
          path: '.',
          packageJson: undefined
        });
    });

    it('should return correct AnalysisResult structure', () => {
        const files: FileDetail[] = [createFileDetail({ 
            metrics: { complexity: 5, loc: 50, functionCount: 2, duplication: 0.01 } 
        })];
        
        const result = analyze(files, '.', MOCK_THRESHOLDS);

        // Check the v0.6.0 structure
        expect(result).toHaveProperty('context');
        expect(result).toHaveProperty('overview');
        expect(result).toHaveProperty('details');
        expect(result).toHaveProperty('recommendations');
        
        // Check context structure
        expect(result.context).toHaveProperty('project');
        expect(result.context).toHaveProperty('analysis');
        expect(result.context.project).toHaveProperty('name');
        expect(result.context.project).toHaveProperty('path');
        expect(result.context.analysis).toHaveProperty('timestamp');
        expect(result.context.analysis).toHaveProperty('durationMs');
        expect(result.context.analysis).toHaveProperty('toolVersion');
        expect(result.context.analysis).toHaveProperty('filesAnalyzed');
        
        // Check overview structure
        expect(result.overview).toHaveProperty('grade');
        expect(result.overview).toHaveProperty('statistics');
        expect(result.overview).toHaveProperty('scores');
        expect(result.overview).toHaveProperty('summary');
        
        // Check scores structure
        expect(result.overview.scores).toHaveProperty('complexity');
        expect(result.overview.scores).toHaveProperty('duplication');
        expect(result.overview.scores).toHaveProperty('maintainability');
        expect(result.overview.scores).toHaveProperty('overall');
        
        // Check recommendations structure
        expect(result.recommendations).toHaveProperty('critical');
        expect(result.recommendations).toHaveProperty('quickWins');
        expect(result.recommendations).toHaveProperty('improvements');
    });

    it('should return high scores for perfect files', () => {
        const files: FileDetail[] = [createFileDetail({ 
            metrics: { complexity: 5, loc: 50, functionCount: 2, duplication: 0.01 } 
        })];
        
        const result = analyze(files, '.', MOCK_THRESHOLDS);

        // Test that good metrics produce good scores without forcing exact values
        expect(result.overview.scores.overall).toBeGreaterThan(85);
        expect(result.overview.scores.complexity).toBeGreaterThan(80);
        expect(result.overview.scores.duplication).toBeGreaterThan(80);
        expect(['A', 'B'].includes(result.overview.grade)).toBe(true);
        expect(['A', 'B'].includes(result.overview.grade)).toBe(true);
    });

    it('should return low scores for problematic files', () => {
        const files: FileDetail[] = [createFileDetail({ 
            file: 'critical.ts',
            metrics: { complexity: 50, loc: 500, functionCount: 20, duplication: 0.3 },
            issues: [createIssue({ severity: Severity.Critical })]
        })];
        
        const result = analyze(files, '.', MOCK_THRESHOLDS);

        // Test that bad metrics produce bad scores without forcing exact values
        expect(result.overview.scores.overall).toBeLessThan(70);
        expect(result.overview.scores.complexity).toBeLessThan(50);
        expect(result.overview.scores.duplication).toBeLessThan(80);
        expect(['D', 'F'].includes(result.overview.grade)).toBe(true);
        expect(['D', 'F'].includes(result.overview.grade)).toBe(true);
    });

    it('should correctly mark critical files', () => {
        const files: FileDetail[] = [
            createFileDetail({ 
                file: 'good.ts',
                metrics: { complexity: 5, loc: 50, functionCount: 2, duplication: 0.01 }
            }),
            createFileDetail({ 
                file: 'bad.ts',
                metrics: { complexity: 50, loc: 500, functionCount: 20, duplication: 0.3 }
            }),
            createFileDetail({ 
                file: 'worse.ts',
                metrics: { complexity: 80, loc: 800, functionCount: 40, duplication: 0.5 }
            }),
        ];
        
        const result = analyze(files, '.', MOCK_THRESHOLDS);

        const criticalFiles = result.details.filter(f => f.isCritical);
        expect(criticalFiles.length).toBeGreaterThan(0);
        expect(criticalFiles.length).toBeLessThanOrEqual(5); // Max 5 critical files
        
        // Critical files should have worse health scores
        const nonCriticalFiles = result.details.filter(f => !f.isCritical);
        if (nonCriticalFiles.length > 0) {
            const avgCriticalHealth = criticalFiles.reduce((sum, f) => sum + f.healthScore, 0) / criticalFiles.length;
            const avgNonCriticalHealth = nonCriticalFiles.reduce((sum, f) => sum + f.healthScore, 0) / nonCriticalFiles.length;
            expect(avgCriticalHealth).toBeLessThan(avgNonCriticalHealth);
        }
    });

    it('should calculate correct statistics', () => {
        const files: FileDetail[] = [
            createFileDetail({ 
                metrics: { complexity: 10, loc: 100, functionCount: 2, duplication: 0.05 } 
            }),
            createFileDetail({ 
                metrics: { complexity: 20, loc: 300, functionCount: 8, duplication: 0.15 } 
            }),
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);
        
        expect(result.overview.statistics.totalFiles).toBe(2);
        expect(result.overview.statistics.totalLOC).toBe(400);
        // Average complexity should be between the two input values
    expect(result.overview.statistics.avgComplexity).toBeGreaterThan(10);
    expect(result.overview.statistics.avgComplexity).toBeLessThan(20);
        expect(result.overview.statistics.avgLOC).toBe(200);
    });

    it('should enrich issues with correct context', () => {
        const testIssue = createIssue({ 
            type: IssueType.Complexity,
            severity: Severity.High,
            context: {
                message: 'High complexity: 40',
                threshold: 20,
                excessRatio: 2.0
            }
        });
        
        const files: FileDetail[] = [
            createFileDetail({
                file: 'issue.ts',
                metrics: { complexity: 40, loc: 200, functionCount: 10, duplication: 0.1 },
                issues: [testIssue]
            })
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        // Excess ratio should reflect how much the value exceeds the threshold
    expect(result.details[0].issues[0].context.excessRatio).toBeGreaterThan(1.5);
    expect(result.details[0].issues[0].context.excessRatio).toBeLessThan(2.5);
        expect(result.details[0].issues[0].context.threshold).toBe(20);
        expect(result.details[0].issues[0].type).toBe(IssueType.Complexity);
        expect(result.details[0].issues[0].severity).toBe(Severity.High);
    });

    it('should handle empty file list gracefully', () => {
        const result = analyze([], '.', MOCK_THRESHOLDS);

        expect(result.overview.statistics.totalFiles).toBe(0);
        expect(result.overview.statistics.totalLOC).toBe(0);
        expect(result.overview.statistics.avgComplexity).toBe(0);
        expect(result.overview.statistics.avgLOC).toBe(0);
        expect(result.overview.scores.overall).toBe(0);
        expect(result.overview.grade).toBe('F');
        expect(result.overview.grade).toBe('F');
        expect(result.overview.summary).toBe('No files analyzed');
    });

    it('should generate recommendations', () => {
        const files: FileDetail[] = [
            createFileDetail({ 
                file: 'critical.ts',
                metrics: { complexity: 50, loc: 500, functionCount: 20, duplication: 0.3 },
                issues: [createIssue({ severity: Severity.Critical })]
            }),
            createFileDetail({ 
                file: 'normal.ts',
                metrics: { complexity: 5, loc: 100, functionCount: 2, duplication: 0.01 }
            }),
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.recommendations).toBeDefined();
        expect(Array.isArray(result.recommendations.critical)).toBe(true);
        expect(Array.isArray(result.recommendations.quickWins)).toBe(true);
        expect(Array.isArray(result.recommendations.improvements)).toBe(true);
    });

    it('should calculate health scores correctly', () => {
        const files: FileDetail[] = [
            createFileDetail({ 
                metrics: { complexity: 10, loc: 100, functionCount: 2, duplication: 0.05 }
            }),
            createFileDetail({ 
                metrics: { complexity: 50, loc: 500, functionCount: 20, duplication: 0.3 }
            }),
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        // Health scores should be between 0 and 100
        result.details.forEach(file => {
            expect(file.healthScore).toBeGreaterThanOrEqual(0);
            expect(file.healthScore).toBeLessThanOrEqual(100);
        });
        
        // First file should have better health than second
        expect(result.details[0].healthScore).toBeGreaterThan(result.details[1].healthScore);
    });

    it('should set usage ranks correctly', () => {
        const files: FileDetail[] = [
            createFileDetail({ 
                file: 'low-usage.ts',
                importance: { usageCount: 1, usageRank: 0, isEntryPoint: false, isCriticalPath: false }
            }),
            createFileDetail({ 
                file: 'high-usage.ts',
                importance: { usageCount: 10, usageRank: 0, isEntryPoint: false, isCriticalPath: false }
            }),
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        // Usage ranks should be calculated (0-100 percentile)
        result.details.forEach(file => {
            expect(file.importance.usageRank).toBeGreaterThanOrEqual(0);
            expect(file.importance.usageRank).toBeLessThanOrEqual(100);
        });
    });
});