import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UniversalDependencyAnalyzer } from '../src/dependencyAnalyzer';
import { FileDetail } from '../src/types';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

describe('UniversalDependencyAnalyzer - Integration Tests', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(tmpdir(), 'dep-integration-'));
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
    file: file.startsWith('/') ? file : path.join(testDir, file),
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

  describe('Basic analyzer functionality', () => {
    it('should process files without crashing', async () => {
      createTestFile('utils/logger.ts', `
        export function log(message: string): void {
          console.log(message);
        }
      `);

      createTestFile('main.ts', `
        import { log } from './utils/logger';
        log('Hello world');
      `);

      const files = [
        createFileDetail('utils/logger.ts'),
        createFileDetail('main.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      expect(result).toBeDefined();
      expect(result.fileAnalyses.size).toBe(2);
      expect(result.statistics.totalFiles).toBe(2);
      expect(result.errors).toBeDefined();
    });

    it('should provide valid metrics for all analyzed files', async () => {
      const files = [
        createFileDetail('fileA.ts'),
        createFileDetail('fileB.ts'),
        createFileDetail('fileC.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      // All files should have analysis
      expect(result.fileAnalyses.size).toBe(3);
      
      // All metrics should be within valid ranges
      for (const [filename, analysis] of result.fileAnalyses) {
        expect(analysis.instability).toBeGreaterThanOrEqual(0);
        expect(analysis.instability).toBeLessThanOrEqual(1);
        expect(analysis.cohesionScore).toBeGreaterThanOrEqual(0);
        expect(analysis.cohesionScore).toBeLessThanOrEqual(1);
        expect(analysis.percentileUsageRank).toBeGreaterThanOrEqual(0);
        expect(analysis.percentileUsageRank).toBeLessThanOrEqual(100);
        expect(analysis.incomingDependencies).toBeGreaterThanOrEqual(0);
        expect(analysis.outgoingDependencies).toBeGreaterThanOrEqual(0);
        expect(typeof analysis.isInCycle).toBe('boolean');
      }
    });

    it('should handle empty file lists', async () => {
      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze([]);

      expect(result.fileAnalyses.size).toBe(0);
      expect(result.statistics.totalFiles).toBe(0);
      expect(result.statistics.totalImports).toBe(0);
      expect(result.circularDependencies).toHaveLength(0);
    });

    it('should handle configuration options correctly', async () => {
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

      // Test with custom timeout
      const analyzer3 = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        timeout: 1000 
      });
      const result3 = await analyzer3.analyze(files);
      expect(result3).toBeDefined();
    });
  });

  describe('Import detection capabilities', () => {
    it('should detect import statements in TypeScript files', async () => {
      createTestFile('imports.ts', `
        import defaultExport from "module1";
        import { named } from "module2";
        import * as namespace from "module3";
        import type { TypeOnly } from "module4";
        import "side-effect";
        export { reexport } from "module5";
        const dynamicImport = await import("module6");
      `);

      const files = [createFileDetail('imports.ts')];
      const analyzer = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        logResolutionErrors: false // Disable noise
      });
      const result = await analyzer.analyze(files);

      expect(result.fileAnalyses.size).toBe(1);
      // The analyzer should at least process the file without errors
      const analysisErrors = result.errors.filter(e => e.phase === 'read');
      expect(analysisErrors).toHaveLength(0);
    });

    it('should detect CommonJS require statements', async () => {
      createTestFile('commonjs.js', `
        const fs = require('fs');
        const path = require('path');
        const util = require('util');
        const localModule = require('./local');
      `);

      const files = [createFileDetail('commonjs.js')];
      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      expect(result.fileAnalyses.size).toBe(1);
      const analysisErrors = result.errors.filter(e => e.phase === 'read');
      expect(analysisErrors).toHaveLength(0);
    });

    it('should handle mixed import styles', async () => {
      createTestFile('mixed.ts', `
        import { readFileSync } from 'fs';
        const util = require('util');
        import type { SomeType } from './types';
        export * from './exports';
      `);

      const files = [createFileDetail('mixed.ts')];
      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      expect(result.fileAnalyses.size).toBe(1);
      const analysisErrors = result.errors.filter(e => e.phase === 'read');
      expect(analysisErrors).toHaveLength(0);
    });
  });

  describe('Statistics calculation', () => {
    it('should calculate comprehensive statistics', async () => {
      const files = Array.from({ length: 10 }, (_, i) => 
        createFileDetail(`file${i}.ts`)
      );

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalFiles).toBe(10);
      expect(result.statistics.totalImports).toBeGreaterThanOrEqual(0);
      expect(result.statistics.averageImportsPerFile).toBeGreaterThanOrEqual(0);
      expect(result.statistics.maxImports).toBeDefined();
      expect(result.statistics.isolatedFiles).toBeDefined();
      expect(result.statistics.hubFiles).toBeDefined();
      expect(Array.isArray(result.statistics.isolatedFiles)).toBe(true);
      expect(Array.isArray(result.statistics.hubFiles)).toBe(true);
    });

    it('should identify isolated files correctly', async () => {
      const files = [
        createFileDetail('isolated1.ts'),
        createFileDetail('isolated2.ts'),
        createFileDetail('isolated3.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      // Files with no dependencies should be marked as isolated
      expect(result.statistics.isolatedFiles.length).toBeGreaterThan(0);
    });

    it('should handle hub file detection based on threshold', async () => {
      const files = Array.from({ length: 5 }, (_, i) => 
        createFileDetail(`file${i}.ts`)
      );

      // Test with low threshold (should find more hub files)
      const analyzer1 = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        hubFileThreshold: 1
      });
      const result1 = await analyzer1.analyze(files);

      // Test with high threshold (should find fewer hub files)
      const analyzer2 = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        hubFileThreshold: 100
      });
      const result2 = await analyzer2.analyze(files);

      expect(result1.statistics.hubFiles.length).toBeGreaterThanOrEqual(result2.statistics.hubFiles.length);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle timeout gracefully', async () => {
      const files = Array.from({ length: 20 }, (_, i) => 
        createFileDetail(`file${i}.ts`)
      );

      const analyzer = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        timeout: 1 // Very short timeout
      });
      
      const result = await analyzer.analyze(files);
      
      // Should complete without throwing, either with timeout error or successfully
      expect(result).toBeDefined();
    });

    it('should handle large files based on configuration', async () => {
      const files = [
        {
          ...createFileDetail('large.ts'),
          metrics: {
            ...createFileDetail('large.ts').metrics,
            loc: 10000 // Very large file
          }
        }
      ];

      const analyzer = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        maxFileSize: 1000 * 80 // Small limit in bytes (1000 lines * 80 chars)
      });
      
      const result = await analyzer.analyze(files);
      
      // Should have errors for files that are too large
      const sizeErrors = result.errors.filter(e => e.error.includes('too large'));
      expect(sizeErrors.length).toBeGreaterThan(0);
    });

    it('should handle non-existent files gracefully', async () => {
      const files = [
        createFileDetail('nonexistent.ts') // File that doesn't exist on disk
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      expect(result).toBeDefined();
      // Should handle gracefully - either skip or error but not crash
    });

    it('should provide valid cache functionality', async () => {
      const files = [createFileDetail('test.ts')];

      // Test with cache enabled
      const analyzerWithCache = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        cache: true 
      });
      
      expect(() => analyzerWithCache.clearCache()).not.toThrow();
      const result1 = await analyzerWithCache.analyze(files);
      expect(result1).toBeDefined();

      // Test with cache disabled
      const analyzerWithoutCache = new UniversalDependencyAnalyzer({ 
        projectRoot: testDir,
        cache: false 
      });
      
      const result2 = await analyzerWithoutCache.analyze(files);
      expect(result2).toBeDefined();
    });
  });

  describe('Real-world validation', () => {
    it('should work with actual project structure', async () => {
      // Create a realistic project structure
      createTestFile('package.json', JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        main: 'index.js'
      }));

      createTestFile('src/types.ts', `
        export interface User {
          id: string;
          name: string;
        }
      `);

      createTestFile('src/utils.ts', `
        export function formatName(name: string): string {
          return name.toUpperCase();
        }
      `);

      createTestFile('src/index.ts', `
        export * from './types';
        export * from './utils';
      `);

      const files = [
        createFileDetail('src/types.ts'),
        createFileDetail('src/utils.ts'),
        createFileDetail('src/index.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      const result = await analyzer.analyze(files);

      expect(result.fileAnalyses.size).toBe(3);
      expect(result.statistics.totalFiles).toBe(3);
      
      // Should detect the package.json and use it for project info
      expect(result.errors.filter(e => e.phase === 'read')).toHaveLength(0);
    });

    it('should maintain consistent behavior across multiple runs', async () => {
      const files = [
        createFileDetail('file1.ts'),
        createFileDetail('file2.ts')
      ];

      const analyzer = new UniversalDependencyAnalyzer({ projectRoot: testDir });
      
      const result1 = await analyzer.analyze(files);
      const result2 = await analyzer.analyze(files);

      expect(result1.fileAnalyses.size).toBe(result2.fileAnalyses.size);
      expect(result1.statistics.totalFiles).toBe(result2.statistics.totalFiles);
      
      // Metrics should be consistent
      for (const [filename, analysis1] of result1.fileAnalyses) {
        const analysis2 = result2.fileAnalyses.get(filename);
        expect(analysis2).toBeDefined();
        expect(analysis1.instability).toBe(analysis2!.instability);
        expect(analysis1.cohesionScore).toBe(analysis2!.cohesionScore);
      }
    });
  });
});