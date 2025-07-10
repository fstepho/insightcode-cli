import { describe, it, expect, beforeEach } from 'vitest';
import { detectDuplication } from '../src/duplication';
import { FileDetail } from '../src/types';
import { DEFAULT_THRESHOLDS } from '../src/config';

describe('Duplication Detection', () => {
  const createFileDetail = (file: string, content: string, loc: number = 10): FileDetail => ({
    file,
    metrics: {
      complexity: 1,
      loc,
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
    // Store the content for duplication detection
    content
  } as any);

  it('should detect no duplication in unique files', () => {
    const files = [
      createFileDetail('file1.ts', 'const x = 1; console.log(x);'),
      createFileDetail('file2.ts', 'const y = 2; console.log(y);'),
      createFileDetail('file3.ts', 'const z = 3; console.log(z);')
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    result.forEach(file => {
      expect(file.metrics.duplication).toBe(0);
    });
  });

  it('should detect high duplication in identical files', () => {
    const duplicatedContent = `
      function validateEmail(email: string): boolean {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!email) return false;
        if (email.length > 255) return false;
        if (!emailRegex.test(email)) return false;
        return true;
      }
    `;

    const files = [
      createFileDetail('file1.ts', duplicatedContent, 8),
      createFileDetail('file2.ts', duplicatedContent, 8)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    // Identical files should have high duplication
    result.forEach(file => {
      expect(file.metrics.duplication).toBeGreaterThan(0); // Should detect duplication
      expect(file.metrics.duplication).toBeLessThanOrEqual(1); // Valid range
    });
  });

  it('should detect partial duplication', () => {
    const sharedBlock = `
      function processData(data: any[]): any[] {
        return data.filter(item => item !== null);
      }
    `;

    const files = [
      createFileDetail('file1.ts', sharedBlock + '\nconst extra1 = true;', 5),
      createFileDetail('file2.ts', sharedBlock + '\nconst extra2 = false;', 5)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    result.forEach(file => {
      expect(file.metrics.duplication).toBeGreaterThan(0);
      expect(file.metrics.duplication).toBeLessThan(1);
    });
  });

  it('should handle files with no content', () => {
    const files = [
      createFileDetail('empty1.ts', '', 0),
      createFileDetail('empty2.ts', '', 0)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    result.forEach(file => {
      expect(file.metrics.duplication).toBe(0);
    });
  });

  it('should handle single file', () => {
    const files = [
      createFileDetail('single.ts', 'const x = 1;', 1)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    expect(result[0].metrics.duplication).toBe(0);
  });

  it('should ignore small files in duplication detection', () => {
    const smallContent = 'const x = 1;';
    
    const files = [
      createFileDetail('small1.ts', smallContent, 1),
      createFileDetail('small2.ts', smallContent, 1)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    // Small files should not be considered for duplication
    result.forEach(file => {
      expect(file.metrics.duplication).toBe(0);
    });
  });

  it('should handle files with different line endings', () => {
    const content1 = 'function test() {\n  return true;\n}';
    const content2 = 'function test() {\r\n  return true;\r\n}';
    const content3 = 'function test() {\r  return true;\r}';

    const files = [
      createFileDetail('unix.ts', content1, 3),
      createFileDetail('windows.ts', content2, 3),
      createFileDetail('mac.ts', content3, 3)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    // Should detect duplication despite different line endings
    result.forEach(file => {
      expect(file.metrics.duplication).toBeGreaterThan(0); // Should detect duplication
    });
  });

  it('should handle files with different whitespace', () => {
    const content1 = 'function test() {\n  return true;\n}';
    const content2 = 'function test() {\n    return true;\n}';
    const content3 = 'function test() {\n\treturn true;\n}';

    const files = [
      createFileDetail('spaces2.ts', content1, 3),
      createFileDetail('spaces4.ts', content2, 3),
      createFileDetail('tabs.ts', content3, 3)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    // Should detect duplication despite different whitespace
    result.forEach(file => {
      expect(file.metrics.duplication).toBeGreaterThan(0); // Should detect duplication
    });
  });

  it('should generate duplication issues when threshold exceeded', () => {
    const duplicatedContent = `
      function longDuplicatedFunction(input: string): string {
        const processed = input.trim().toLowerCase();
        const validated = processed.length > 0 ? processed : 'default';
        const formatted = validated.charAt(0).toUpperCase() + validated.slice(1);
        return formatted;
      }
    `;

    const files = [
      createFileDetail('file1.ts', duplicatedContent, 6),
      createFileDetail('file2.ts', duplicatedContent, 6)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    result.forEach(file => {
      expect(file.metrics.duplication).toBeGreaterThan(0.15); // Above production threshold
      expect(file.issues.some(issue => issue.type === 'duplication')).toBe(true);
    });
  });

  it('should handle complex duplication patterns', () => {
    const commonUtility = `
      function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
      }
    `;

    const files = [
      createFileDetail('utils1.ts', commonUtility + '\nconst CONSTANT1 = "value1";', 4),
      createFileDetail('utils2.ts', commonUtility + '\nconst CONSTANT2 = "value2";', 4),
      createFileDetail('utils3.ts', commonUtility + '\nconst CONSTANT3 = "value3";', 4),
      createFileDetail('unique.ts', 'function uniqueFunction() { return "unique"; }', 1)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    // First 3 files should have duplication, last one should not
    expect(result[0].metrics.duplication).toBeGreaterThan(0);
    expect(result[1].metrics.duplication).toBeGreaterThan(0);
    expect(result[2].metrics.duplication).toBeGreaterThan(0);
    expect(result[3].metrics.duplication).toBe(0);
  });

  it('should handle files with comments correctly', () => {
    const content1 = `
      // This is a comment
      function test() {
        return true;
      }
    `;

    const content2 = `
      // This is a different comment
      function test() {
        return true;
      }
    `;

    const files = [
      createFileDetail('file1.ts', content1, 4),
      createFileDetail('file2.ts', content2, 4)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS);

    // Should detect duplication in code despite different comments
    result.forEach(file => {
      expect(file.metrics.duplication).toBeGreaterThan(0); // Should detect duplication
    });
  });
});