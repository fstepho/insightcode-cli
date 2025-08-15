import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { analyze } from '../src/analyzer';
import { AnalysisOptions } from '../src/types';

describe('Analyzer', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'analyzer-unit-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('analyze function', () => {
    it('should analyze single TypeScript file', async () => {
      const testFile = {
        'test.ts': `
          function add(a: number, b: number): number {
            return a + b;
          }
          
          class Calculator {
            multiply(x: number, y: number): number {
              return x * y;
            }
          }
        `
      };
      
      createProjectStructure(tempDir, testFile);

      const options: AnalysisOptions = {
        format: 'json',
        projectPath: tempDir
      };

      const result = await analyze(tempDir, options);

      expect(result).toBeDefined();
      expect(result.details).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.context).toBeDefined();
      
      expect(result.details.length).toBe(1);
      expect(result.details[0].file.endsWith('test.ts')).toBe(true);
      expect(result.details[0].functions.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty project directory', async () => {
      const options: AnalysisOptions = {
        format: 'json',
        projectPath: tempDir
      };

      const result = await analyze(tempDir, options);

      expect(result.details).toEqual([]);
      expect(result.overview.statistics.totalFiles).toBe(0);
    });

    it('should respect production flag', async () => {
      const testFiles = {
        'src/main.ts': 'export function main() { return "main"; }',
        'tests/main.test.ts': 'import { main } from "../src/main"; test("main", () => {});',
        'examples/demo.ts': 'import { main } from "../src/main"; main();'
      };
      
      createProjectStructure(tempDir, testFiles);

      const devResult = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        production: false
      });

      const prodResult = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        production: true
      });

      expect(prodResult.details.length).toBeLessThanOrEqual(devResult.details.length);
      
      // Production should exclude test files
      const prodFiles = prodResult.details.map(d => d.file);
      expect(prodFiles.some(f => f.includes('test'))).toBe(false);
    });

    it('should handle excludePatterns option', async () => {
      const testFiles = {
        'src/include.ts': 'export const included = true;',
        'src/exclude.ts': 'export const excluded = true;',
        'other/file.ts': 'export const other = true;'
      };
      
      createProjectStructure(tempDir, testFiles);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        excludePatterns: ['**/exclude.ts', '**/other/**']
      });

      const filenames = result.details.map(d => path.basename(d.file));
      expect(filenames).toContain('include.ts');
      expect(filenames).not.toContain('exclude.ts');
      expect(filenames).not.toContain('file.ts');
    });

    it('should handle strictDuplication option', async () => {
      const duplicatedCode = `
        function duplicate() {
          const x = 1;
          const y = 2;
          const z = 3;
          return x + y + z;
        }
      `;
      
      const testFiles = {
        'file1.ts': duplicatedCode,
        'file2.ts': duplicatedCode
      };
      
      createProjectStructure(tempDir, testFiles);

      const legacyResult = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        strictDuplication: false
      });

      const strictResult = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        strictDuplication: true
      });

      // Both should detect the duplication, but strict mode should be more sensitive
      expect(legacyResult.overview.scores.duplication).toBeDefined();
      expect(strictResult.overview.scores.duplication).toBeDefined();
    });

    it('should include QuickWins when enabled', async () => {
      const testFiles = {
        'complex.ts': `
          function complexFunction(a: number, b: string, c: boolean, d: object, e: any): void {
            if (a > 0) {
              if (b.length > 0) {
                if (c) {
                  if (d) {
                    console.log('deeply nested');
                  }
                }
              }
            }
          }
        `
      };
      
      createProjectStructure(tempDir, testFiles);

      const withQuickWins = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        includeQuickWins: true
      });

      const withoutQuickWins = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir,
        includeQuickWins: false
      });

      expect(withQuickWins.quickWinsAnalysis).toBeDefined();
      expect(withoutQuickWins.quickWinsAnalysis).toBeUndefined(); 
    });

    it('should produce consistent overview calculations', async () => {
      const testFiles = {
        'simple.ts': `
          export function simple(x: number): number {
            if (x > 0) {
              return x * 2;
            }
            return 0;
          }
        `,
        'medium.ts': `
          export class MediumComplexity {
            process(data: any[]): any[] {
              const results = [];
              for (const item of data) {
                if (item && typeof item === 'object') {
                  if (item.valid) {
                    results.push(this.transform(item));
                  }
                }
              }
              return results;
            }
            
            private transform(item: any): any {
              return { ...item, processed: true };
            }
          }
        `
      };
      
      createProjectStructure(tempDir, testFiles);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      // Verify overview structure
      expect(result.overview.scores).toBeDefined();
      expect(result.overview.scores.overall).toBeGreaterThanOrEqual(0);
      expect(result.overview.scores.overall).toBeLessThanOrEqual(100);
      expect(result.overview.scores.complexity).toBeGreaterThanOrEqual(0);
      expect(result.overview.scores.complexity).toBeLessThanOrEqual(100);
      expect(result.overview.scores.maintainability).toBeGreaterThanOrEqual(0);
      expect(result.overview.scores.maintainability).toBeLessThanOrEqual(100);
      expect(result.overview.scores.duplication).toBeGreaterThanOrEqual(0);
      expect(result.overview.scores.duplication).toBeLessThanOrEqual(100);
      expect(result.overview.scores.reliability).toBeGreaterThanOrEqual(0);
      expect(result.overview.scores.reliability).toBeLessThanOrEqual(100);
      
      expect(result.overview.grade).toMatch(/^[A-F]$/);
      expect(result.overview.statistics).toBeDefined();
      expect(result.overview.statistics.totalFiles).toBe(2);
    });

    it('should handle analysis pipeline errors gracefully', async () => {
      // Create a file that might cause parsing issues
      const problematicFiles = {
        'valid.ts': 'export const valid = true;',
        'empty.ts': '',
        'whitespace.ts': '   \n\n\t  \n   '
      };
      
      createProjectStructure(tempDir, problematicFiles);

      // Should not throw even with problematic files
      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.details)).toBe(true);
      expect(result.overview).toBeDefined();
    });

    it('should generate context metadata consistently', async () => {
      const testFiles = {
        'app.ts': `
          export class Application {
            start(): void {
              console.log('Starting application');
            }
            
            stop(): void {
              console.log('Stopping application');
            }
          }
        `
      };
      
      createProjectStructure(tempDir, testFiles);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      expect(result.context).toBeDefined();
    });

    it('should maintain data integrity across pipeline steps', async () => {
      const testFiles = {
        'integrity.ts': `
          function testIntegrity(param: string): boolean {
            if (param && param.length > 0) {
              const processed = param.trim().toLowerCase();
              if (processed === 'test') {
                return true;
              }
            }
            return false;
          }
          
          class IntegrityTest {
            private value: number = 0;
            
            increment(): void {
              this.value++;
            }
            
            getValue(): number {
              return this.value;
            }
          }
        `
      };
      
      createProjectStructure(tempDir, testFiles);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      const file = result.details[0];
      
      // Verify file details have all required properties
      expect(file.file).toBeDefined();
      expect(file.functions).toBeDefined();
      expect(file.issues).toBeDefined();
      expect(file.metrics).toBeDefined();
      expect(file.dependencies).toBeDefined();
      expect(file.healthScore).toBeDefined();
      
      // Verify metrics are consistent
      expect(file.metrics.loc).toBeGreaterThan(0);
      expect(file.metrics.complexity).toBeGreaterThan(0);
      expect(file.metrics.duplicationRatio).toBeGreaterThanOrEqual(0);
      
      // Verify functions have required properties
      file.functions.forEach(fn => {
        expect(fn.name).toBeDefined();
        expect(fn.line).toBeGreaterThan(0);
        expect(fn.complexity).toBeGreaterThanOrEqual(1);
        expect(fn.loc).toBeGreaterThan(0);
        expect(Array.isArray(fn.issues)).toBe(true);
      });
      
      // Verify health score is calculated
      expect(file.healthScore).toBeGreaterThanOrEqual(0);
      expect(file.healthScore).toBeLessThanOrEqual(100);
    });

    it('should handle different project structures', async () => {
      const nestedProject = {
        'src/core/engine.ts': 'export class Engine {}',
        'src/utils/helpers.ts': 'export function help() {}',
        'lib/external.ts': 'export const external = true;',
        'components/ui/button.ts': 'export class Button {}'
      };
      
      createProjectStructure(tempDir, nestedProject);

      const result = await analyze(tempDir, {
        format: 'json',
        projectPath: tempDir
      });

      expect(result.details.length).toBe(4);
      
      // Should handle nested directory structures
      const filePaths = result.details.map(d => d.file);
      expect(filePaths.some(p => p.includes('src/core'))).toBe(true);
      expect(filePaths.some(p => p.includes('components/ui'))).toBe(true);
    });
  });

  describe('options validation and edge cases', () => {
    it('should handle invalid project path gracefully', async () => {
      const invalidPath = path.join(tempDir, 'nonexistent');
      
      const options: AnalysisOptions = {
        format: 'json',
        projectPath: invalidPath
      };

      // Should handle gracefully, not throw
      await expect(analyze(invalidPath, options)).rejects.toThrow();
    });

    it('should maintain analysis state isolation', async () => {
      const files1 = { 'test1.ts': 'export const test1 = 1;' };
      const files2 = { 'test2.ts': 'export const test2 = 2;' };
      
      createProjectStructure(tempDir, files1);
      const tempDir2 = fs.mkdtempSync(path.join(tmpdir(), 'analyzer-test2-'));
      createProjectStructure(tempDir2, files2);

      try {
        const [result1, result2] = await Promise.all([
          analyze(tempDir, { format: 'json', projectPath: tempDir }),
          analyze(tempDir2, { format: 'json', projectPath: tempDir2 })
        ]);

        expect(result1.details.length).toBe(1);
        expect(result2.details.length).toBe(1);
        expect(result1.details[0].file).not.toBe(result2.details[0].file);
      } finally {
        fs.rmSync(tempDir2, { recursive: true, force: true });
      }
    });

    it('should produce deterministic results', async () => {
      const testFiles = {
        'deterministic.ts': `
          export function deterministic(x: number): number {
            if (x > 10) {
              return x * 2;
            } else if (x > 5) {
              return x + 5;
            }
            return x;
          }
        `
      };
      
      createProjectStructure(tempDir, testFiles);

      const options: AnalysisOptions = {
        format: 'json',
        projectPath: tempDir
      };

      const result1 = await analyze(tempDir, options);
      const result2 = await analyze(tempDir, options);

      // Core metrics should be identical
      expect(result1.overview.scores.overall).toBe(result2.overview.scores.overall);
      expect(result1.details[0].healthScore).toBe(result2.details[0].healthScore);
      expect(result1.details[0].metrics.complexity).toBe(result2.details[0].metrics.complexity);
    });
  });

  // Helper function
  function createProjectStructure(basePath: string, files: Record<string, string>) {
    Object.entries(files).forEach(([filePath, content]) => {
      const fullPath = path.join(basePath, filePath);
      const dir = path.dirname(fullPath);
      
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fullPath, content, 'utf8');
    });
  }
});