import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyze } from '../src/analyzer';
import { FileMetrics, AnalysisResult, ThresholdConfig, Issue } from '../src/types';
import * as dependencyAnalyzer from '../src/dependencyAnalyzer';
import * as duplication from '../src/duplication';
import * as projectInfo from '../src/projectInfo';

// Mock the dependencies of analyzer.ts
vi.mock('../src/dependencyAnalyzer');
vi.mock('../src/duplication');
vi.mock('../src/projectInfo');

// Helper to create a mock FileMetrics object for testing, aligned with the new type
const createFileMetrics = (overrides: Partial<FileMetrics>): FileMetrics => ({
    path: 'test.ts',
    complexity: 1,
    duplication: 0,
    loc: 10,
    functionCount: 1,
    issues: [],
    fileType: 'production',
    impact: 0,
    criticismScore: 0,
    ...overrides,
});

// A default threshold config for tests
const MOCK_THRESHOLDS: ThresholdConfig = {
    complexity: { production: { medium: 10, high: 20 }, test: { medium: 15, high: 30 } },
    size: { production: { medium: 200, high: 300 }, test: { medium: 300, high: 500 } },
    duplication: { production: { medium: 15, high: 30 }, test: { medium: 25, high: 50 } },
} as ThresholdConfig;


describe('Analyzer', () => {

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

    it('should return a perfect score for a perfect file', () => {
        const files: FileMetrics[] = [createFileMetrics({ complexity: 5, duplication: 1, loc: 50, functionCount: 2 })];
        
        vi.spyOn(dependencyAnalyzer, 'analyzeDependencies').mockReturnValue(new Map([['test.ts', 1]]));

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.score).toBe(100);
        expect(result.grade).toBe('A');
    });

    it('should return a low score for a file with high complexity and high impact', () => {
        const files: FileMetrics[] = [createFileMetrics({ path: 'critical.ts', complexity: 50, loc: 500, functionCount: 20 })];
        
        vi.spyOn(dependencyAnalyzer, 'analyzeDependencies').mockReturnValue(new Map([['critical.ts', 20]]));

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.score).toBeLessThan(60);
        expect(result.grade).toBe('F');
    });

    it('should correctly identify topFiles based on criticismScore', () => {
        const files: FileMetrics[] = [
            createFileMetrics({ path: 'a.ts', complexity: 10, impact: 1 }), // low criticism
            createFileMetrics({ path: 'b.ts', complexity: 50, impact: 2 }), // high criticism
            createFileMetrics({ path: 'c.ts', complexity: 5, impact: 30 }), // highest criticism
        ];
        
        const impactMap = new Map([['a.ts', 1], ['b.ts', 2], ['c.ts', 30]]);
        vi.spyOn(dependencyAnalyzer, 'analyzeDependencies').mockReturnValue(impactMap);

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.topFiles.length).toBe(3);
        expect(result.topFiles[0].path).toBe('c.ts');
        expect(result.topFiles[1].path).toBe('b.ts');
    });

    it('should calculate complexity standard deviation', () => {
        const files: FileMetrics[] = [
            createFileMetrics({ complexity: 10 }),
            createFileMetrics({ complexity: 20 }),
            createFileMetrics({ complexity: 30 }),
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.complexityStdDev).toBeCloseTo(8.16);
    });

    it('should identify silent killers', () => {
        // FIX: Adjusted test data to ensure the "killer" file meets the criteria
        const files: FileMetrics[] = [
            // 5 "Top Files" with high complexity to ensure they rank highest
            ...Array.from({ length: 5 }, (_, i) => createFileMetrics({ path: `top${i}.ts`, complexity: 80, impact: 10 })),
            // The "Silent Killer": its criticismScore is lower than the top files, but its individual metrics are high.
            // Increased complexity to be above the new average.
            createFileMetrics({ path: 'killer.ts', complexity: 30, impact: 25 }),
            // 10 "Normal Files" to create realistic averages
            ...Array.from({ length: 10 }, (_, i) => createFileMetrics({ path: `normal${i}.ts`, complexity: 2, impact: 1 })),
        ];

        const impactMap = new Map(files.map(f => [f.path, f.impact]));
        vi.spyOn(dependencyAnalyzer, 'analyzeDependencies').mockReturnValue(impactMap);

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.silentKillers.length).toBe(1);
        expect(result.silentKillers[0].path).toBe('killer.ts');
    });

    it('should handle an empty file list gracefully', () => {
        const result = analyze([], '.', MOCK_THRESHOLDS);

        expect(result.summary.totalFiles).toBe(0);
        expect(result.score).toBe(100);
        expect(result.grade).toBe('A');
    });

    it('should enrich issues with correct ratios', () => {
        const files: FileMetrics[] = [
            createFileMetrics({
                path: 'issue.ts',
                complexity: 40, // 2x the high threshold of 20
                issues: [{ type: 'complexity', severity: 'high', message: '', value: 40 } as Issue]
            })
        ];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.files[0].issues[0].ratio).toBeCloseTo(2.0);
    });

    it('should return a lower score for high duplication', () => {
        const files: FileMetrics[] = [createFileMetrics({ duplication: 50 })];
        
        const result = analyze(files, '.', MOCK_THRESHOLDS);
        
        expect(result.scores.duplication).toBeLessThan(50);
        expect(result.score).toBeLessThan(100);
    });

    it('should return a lower score for poor maintainability (large file)', () => {
        const files: FileMetrics[] = [createFileMetrics({ loc: 800, functionCount: 30 })];

        const result = analyze(files, '.', MOCK_THRESHOLDS);

        expect(result.scores.maintainability).toBeLessThan(50);
        expect(result.score).toBeLessThan(100);
    });

    it('should use custom thresholds to generate issues', () => {
        const files: FileMetrics[] = [
            createFileMetrics({
                path: 'test.ts',
                complexity: 12, // This would be fine with default thresholds
                issues: [{ type: 'complexity', severity: 'high', message: '', value: 12 } as Issue]
            })
        ];

        const strictThresholds: ThresholdConfig = {
            ...MOCK_THRESHOLDS,
            complexity: {
                ...MOCK_THRESHOLDS.complexity,
                production: { medium: 5, high: 10 },
            },
        };

        const result = analyze(files, '.', strictThresholds);

        expect(result.files[0].issues.length).toBe(1);
        expect(result.files[0].issues[0].type).toBe('complexity');
        expect(result.files[0].issues[0].ratio).toBeCloseTo(1.2);
    });

    it('should calculate summary statistics correctly', () => {
        const files: FileMetrics[] = [
            createFileMetrics({ path: 'a.ts', complexity: 10, duplication: 5, loc: 100, functionCount: 2 }),
            createFileMetrics({ path: 'b.ts', complexity: 20, duplication: 15, loc: 300, functionCount: 8 }),
        ];

        vi.spyOn(duplication, 'detectDuplication').mockImplementation((files) => files);

        const result = analyze(files, '.', MOCK_THRESHOLDS);
        
        expect(result.summary.totalFiles).toBe(2);
        expect(result.summary.totalLines).toBe(400);
        expect(result.summary.avgComplexity).toBe(15);
        expect(result.summary.avgDuplication).toBe(10);
        expect(result.summary.avgFunctions).toBe(5);
        expect(result.summary.avgLoc).toBe(200);
    });
});
