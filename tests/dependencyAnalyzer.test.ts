import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UniversalDependencyAnalyzer, analyzeDependencies } from '../src/dependencyAnalyzer';
import { FileDetail } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('UniversalDependencyAnalyzer', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(tmpdir(), 'dep-test-'));
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const createTestFile = (filename: string, content: string): void => {
    const filePath = path.join(testDir, filename);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  };

  const createFileDetail = (file: string): FileDetail => ({
    file,
    metrics: {
      complexity: 1,
      loc: 10,
      functionCount: 1,
      duplicationRatio: 0
    },
    dependencies: {
      incomingDependencies: 0,
      outgoingDependencies: 0,
      instability: 0,
      cohesionScore: 0,
      percentileUsageRank: 0,
      isInCycle: false
    },
    issues: [],
    healthScore: 100
  });

  describe('Basic functionality', () => {
    it('should create analyzer instance', () => {
      const analyzer = new UniversalDependencyAnalyzer();
      expect(analyzer).toBeDefined();
    });

    it('should analyze empty file list', async () => {
      const analyzer = new UniversalDependencyAnalyzer();
      const result = await analyzer.analyze([]);

      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalFiles).toBe(0);
    });

    it('should analyze files without crashing', async () => {
      const files = [
        createFileDetail('src/index.ts'),
        createFileDetail('src/utils.ts'),
        createFileDetail('src/types.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer();
      const result = await analyzer.analyze(files);

      expect(result).toBeDefined();
      expect(result.statistics.totalFiles).toBe(3);
      expect(result.fileAnalyses.size).toBe(3);
    });

    it('should handle timeout gracefully', async () => {
      const files = Array.from({ length: 10 }, (_, i) => 
        createFileDetail(`file${i}.ts`)
      );

      const analyzer = new UniversalDependencyAnalyzer({ 
        timeout: 1 // 1ms timeout
      });
      
      const result = await analyzer.analyze(files);
      
      // Should complete (either with timeout error or successfully)
      expect(result).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should accept custom configuration', () => {
      const analyzer = new UniversalDependencyAnalyzer({
        projectRoot: '/custom/path',
        extensions: ['.ts', '.tsx'],
        analyzeCircularDependencies: false,
        analyzeDynamicImports: false,
        hubFileThreshold: 20,
        timeout: 30000
      });
      
      expect(analyzer).toBeDefined();
    });

    it('should handle circular dependency detection flag', async () => {
      const files = [
        createFileDetail('a.ts'),
        createFileDetail('b.ts')
      ];

      const analyzerWithCircular = new UniversalDependencyAnalyzer({ 
        analyzeCircularDependencies: true 
      });
      const resultWith = await analyzerWithCircular.analyze(files);
      expect(resultWith.circularDependencies).toBeDefined();

      const analyzerWithoutCircular = new UniversalDependencyAnalyzer({ 
        analyzeCircularDependencies: false 
      });
      const resultWithout = await analyzerWithoutCircular.analyze(files);
      expect(resultWithout.circularDependencies).toHaveLength(0);
    });
  });

  describe('File analysis results', () => {
    it('should provide analysis for each file', async () => {
      const files = [
        createFileDetail('main.ts'),
        createFileDetail('helper.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer();
      const result = await analyzer.analyze(files);

      expect(result.fileAnalyses.size).toBe(2);
      
      const mainAnalysis = result.fileAnalyses.get('main.ts');
      expect(mainAnalysis).toBeDefined();
      expect(mainAnalysis?.incomingDependencies).toBeDefined();
      expect(mainAnalysis?.outgoingDependencies).toBeDefined();
      expect(mainAnalysis?.instability).toBeDefined();
      expect(mainAnalysis?.cohesionScore).toBeDefined();
      expect(mainAnalysis?.percentileUsageRank).toBeDefined();
      expect(mainAnalysis?.isInCycle).toBeDefined();
    });

    it('should calculate statistics', async () => {
      const files = [
        createFileDetail('a.ts'),
        createFileDetail('b.ts'),
        createFileDetail('c.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer();
      const result = await analyzer.analyze(files);

      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalFiles).toBe(3);
      expect(result.statistics.totalImports).toBeGreaterThanOrEqual(0);
      expect(result.statistics.averageImportsPerFile).toBeGreaterThanOrEqual(0);
      expect(result.statistics.maxImports).toBeDefined();
      expect(result.statistics.isolatedFiles).toBeDefined();
      expect(result.statistics.hubFiles).toBeDefined();
    });
  });

  describe('Legacy API compatibility', () => {
    it('should support analyzeDependencies function', async () => {
      const files = [
        createFileDetail('index.ts'),
        createFileDetail('utils.ts')
      ];

      const result = await analyzeDependencies(files, '/test/path');
      
      expect(result).toBeDefined();
      expect(result instanceof Map).toBe(true);
    });

    it('should handle errors in legacy API', async () => {
      const files = [
        createFileDetail('broken.ts')
      ];

      // Should not throw, just return empty map
      const result = await analyzeDependencies(files);
      expect(result).toBeDefined();
      expect(result instanceof Map).toBe(true);
    });
  });

  describe('Algorithm correctness', () => {
    it('should extract import declarations from source code', async () => {
      // Test that it can at least parse TypeScript and find import statements
      createTestFile('sample.ts', 'import { test } from "some-module";\nimport "./relative";\nconst x = 1;');

      const files = [createFileDetail('sample.ts')];
      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      // Should complete parsing without errors
      expect(result.errors.filter(e => e.phase === 'read')).toHaveLength(0);
    });

    it('should handle various import syntaxes', async () => {
      createTestFile('imports.ts', `
        import defaultExport from "module1";
        import { named } from "module2";
        import * as namespace from "module3";
        import type { TypeOnly } from "module4";
        import "side-effect";
        export { reexport } from "module5";
      `);

      const files = [createFileDetail('imports.ts')];
      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      // Should parse all import types without syntax errors
      expect(result.statistics.totalFiles).toBe(1);
    });

    it('should calculate metrics consistently', async () => {
      const files = [
        createFileDetail('file1.ts'),
        createFileDetail('file2.ts'),
        createFileDetail('file3.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      // All files should have analysis
      expect(result.fileAnalyses.size).toBe(3);
      
      // Metrics should be within valid ranges
      for (const [filename, analysis] of result.fileAnalyses) {
        expect(analysis.instability).toBeGreaterThanOrEqual(0);
        expect(analysis.instability).toBeLessThanOrEqual(1);
        expect(analysis.cohesionScore).toBeGreaterThanOrEqual(0);
        expect(analysis.cohesionScore).toBeLessThanOrEqual(1);
        expect(analysis.percentileUsageRank).toBeGreaterThanOrEqual(0);
        expect(analysis.percentileUsageRank).toBeLessThanOrEqual(100);
      }
    });

    it('should respect configuration options', async () => {
      const files = [createFileDetail('test.ts')];

      // Test with circular detection disabled
      const analyzer1 = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        analyzeCircularDependencies: false 
      });
      const result1 = await analyzer1.analyze(files);
      expect(result1.circularDependencies).toHaveLength(0);

      // Test with different hub threshold
      const analyzer2 = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        hubFileThreshold: 999 
      });
      const result2 = await analyzer2.analyze(files);
      expect(result2.statistics.hubFiles).toHaveLength(0);
    });
  });

  describe('Cache functionality', () => {
    it('should support cache clearing', () => {
      const analyzer = new UniversalDependencyAnalyzer({ cache: true });
      
      // Should not throw
      expect(() => analyzer.clearCache()).not.toThrow();
    });

    it('should work with cache disabled', async () => {
      const files = [createFileDetail('test.ts')];
      
      const analyzer = new UniversalDependencyAnalyzer({ cache: false });
      const result = await analyzer.analyze(files);
      
      expect(result).toBeDefined();
    });
  });
});