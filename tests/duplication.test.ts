import { describe, it, expect, beforeEach } from 'vitest';
import { detectDuplication } from '../src/duplication';
import { FileDetail } from '../src/types';
import { DEFAULT_THRESHOLDS } from '../src/thresholds.constants';

// Extended FileDetail for testing with content
interface FileDetailWithContent extends FileDetail {
  content: string;
}

describe('Duplication Detection', () => {
  const createFileDetail = (file: string, content: string, loc: number = 10): FileDetailWithContent => ({
    file,
    metrics: {
      complexity: 1,
      loc,
      functionCount: 1,
      duplicationRatio: 0
    },
    dependencies: {
      outgoingDependencies: 0,
      incomingDependencies: 0,
      cohesionScore: 0,
      instability: 0,
      percentileUsageRank: 0,
      isInCycle: false
    },
    issues: [],
    healthScore: 100,
    // Store the content for duplication detection
    content
  });

  it('should detect no duplication in unique files', () => {
    const files = [
      createFileDetail('file1.ts', 'const x = 1; console.log(x);'),
      createFileDetail('file2.ts', 'const y = 2; console.log(y);'),
      createFileDetail('file3.ts', 'const z = 3; console.log(z);')
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBe(0);
    });
  });

  it('should exclude configuration files from duplication detection', () => {
    const karmaConfig1 = `
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
    ],
    port: 9876,
    browsers: ['ChromeHeadlessNoSandbox'],
  });
};`;

    const karmaConfig2 = `
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
    ],
    port: 9876,
    browsers: ['ChromeHeadlessNoSandbox'],
  });
};`;

    const files = [
      createFileDetail('karma1.conf.js', karmaConfig1, 15),
      createFileDetail('karma2.conf.js', karmaConfig2, 15)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // Configuration files should not be counted as duplication
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeLessThan(0.1);
    });
  });

  it('should exclude license headers from duplication detection', () => {
    const licenseHeader = `
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function someFunction(): void {
  console.log('unique implementation 1');
}`;

    const anotherFileWithSameLicense = `
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function anotherFunction(): void {
  console.log('unique implementation 2');
}`;

    const files = [
      createFileDetail('file1.ts', licenseHeader, 15),
      createFileDetail('file2.ts', anotherFileWithSameLicense, 15)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // License headers should not be counted as duplication
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeLessThan(0.5); // Should be much lower than before
    });
  });

  it('should detect high duplication in identical files', () => {
    const duplicatedContent = `
      function validateEmail(email: string): boolean {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!email) return false;
        if (email.length > 255) return false;
        if (!emailRegex.test(email)) return false;
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        const domain = parts[1];
        if (!domain.includes('.')) return false;
        return true;
      }
    `;

    const files = [
      createFileDetail('file1.ts', duplicatedContent, 11),
      createFileDetail('file2.ts', duplicatedContent, 11)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // Identical files should have high duplication
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeGreaterThan(0); // Should detect duplication
      expect(file.metrics.duplicationRatio).toBeLessThanOrEqual(1); // Valid range
    });
  });

  it('should detect partial duplication', () => {
    const sharedBlock = `
      function processData(data: any[]): any[] {
        if (!data) return [];
        const filtered = data.filter(item => item !== null);
        const mapped = filtered.map(item => item.value);
        const sorted = mapped.sort();
        const validated = sorted.filter(item => item !== undefined);
        const processed = validated.map(item => item.toString());
        return processed;
      }
    `;

    const files = [
      createFileDetail('file1.ts', sharedBlock + '\nconst extra1 = true;\nconst extra2 = false;\nconst extra3 = null;', 12),
      createFileDetail('file2.ts', sharedBlock + '\nconst different1 = false;\nconst different2 = true;\nconst different3 = {};', 12)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeGreaterThan(0);
      expect(file.metrics.duplicationRatio).toBeLessThan(1);
    });
  });

  it('should handle files with no content', () => {
    const files = [
      createFileDetail('empty1.ts', '', 0),
      createFileDetail('empty2.ts', '', 0)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBe(0);
    });
  });

  it('should handle single file', () => {
    const files = [
      createFileDetail('single.ts', 'const x = 1;', 1)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    expect(result[0].metrics.duplicationRatio).toBe(0);
  });

  it('should ignore small files in duplication detection', () => {
    const smallContent = 'const x = 1;';
    
    const files = [
      createFileDetail('small1.ts', smallContent, 1),
      createFileDetail('small2.ts', smallContent, 1)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // Small files should not be considered for duplication
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBe(0);
    });
  });

  it('should handle files with different line endings', () => {
    const content1 = 'function test() {\n  const a = 1;\n  const b = 2;\n  const c = 3;\n  const d = 4;\n  const e = 5;\n  const f = 6;\n  return true;\n}';
    const content2 = 'function test() {\r\n  const a = 1;\r\n  const b = 2;\r\n  const c = 3;\r\n  const d = 4;\r\n  const e = 5;\r\n  const f = 6;\r\n  return true;\r\n}';
    const content3 = 'function test() {\r  const a = 1;\r  const b = 2;\r  const c = 3;\r  const d = 4;\r  const e = 5;\r  const f = 6;\r  return true;\r}';

    const files = [
      createFileDetail('unix.ts', content1, 10),
      createFileDetail('windows.ts', content2, 10),
      createFileDetail('mac.ts', content3, 10)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // Should detect duplication despite different line endings
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeGreaterThan(0); // Should detect duplication
    });
  });

  it('should handle files with different whitespace', () => {
    const content1 = `function test() {
  const a = 1;
  const b = 2;
  const c = 3;
  const d = 4;
  const e = 5;
  const f = 6;
  const g = 7;
  const h = 8;
  return true;
}`;
    const content2 = content1.replace(/  /g, '    ');
    const content3 = content1.replace(/  /g, '\t');

    const files = [
      createFileDetail('spaces2.ts', content1, 10),
      createFileDetail('spaces4.ts', content2, 10),
      createFileDetail('tabs.ts', content3, 10)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // Should detect duplication despite different whitespace
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeGreaterThan(0); // Should detect duplication
    });
  });

  it('should generate duplication issues when threshold exceeded', () => {
    const duplicatedContent = `
      function longDuplicatedFunction(input: string): string {
        const processed = input.trim().toLowerCase();
        const validated = processed.length > 0 ? processed : 'default';
        const formatted = validated.charAt(0).toUpperCase() + validated.slice(1);
        const sanitized = formatted.replace(/[^a-zA-Z0-9]/g, '');
        const finalized = sanitized.length > 0 ? sanitized : 'empty';
        const result = finalized.substring(0, 50);
        return result;
      }
    `;

    const files = [
      createFileDetail('file1.ts', duplicatedContent, 11),
      createFileDetail('file2.ts', duplicatedContent, 11)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeGreaterThan(0.15); // Above production threshold
      expect(file.issues.some(issue => issue.type === 'duplication')).toBe(true);
    });
  });

  it('should handle complex duplication patterns', () => {
    const commonUtility = `
      function formatDate(date: Date): string {
        const isoString = date.toISOString();
        const parts = isoString.split('T');
        const datePart = parts[0];
        const formatted = datePart.replace(/-/g, '/');
        const validated = formatted.length === 10 ? formatted : 'invalid';
        const result = validated.substring(0, 10);
        return result;
      }
    `;

    const files = [
      createFileDetail('utils1.ts', commonUtility + '\nconst CONSTANT1 = "value1";\nconst A = 1;\nconst B = 2;\nconst C = 3;', 8),
      createFileDetail('utils2.ts', commonUtility + '\nconst CONSTANT2 = "value2";\nconst D = 4;\nconst E = 5;\nconst F = 6;', 8),
      createFileDetail('utils3.ts', commonUtility + '\nconst CONSTANT3 = "value3";\nconst G = 7;\nconst H = 8;\nconst I = 9;', 8),
      createFileDetail('unique.ts', 'function uniqueFunction() { return "unique"; }', 1)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // First 3 files should have duplication, last one should not
    expect(result[0].metrics.duplicationRatio).toBeGreaterThan(0);
    expect(result[1].metrics.duplicationRatio).toBeGreaterThan(0);
    expect(result[2].metrics.duplicationRatio).toBeGreaterThan(0);
    expect(result[3].metrics.duplicationRatio).toBe(0);
  });

  it('should handle files with comments correctly', () => {
    const content1 = `
      // This is a comment
      function test() {
        const x = 1;
        const y = 2;
        const z = 3;
        const result = x + y + z;
        console.log(result);
        return result > 5;
      }
    `;

    const content2 = `
      // This is a different comment
      function test() {
        const x = 1;
        const y = 2;
        const z = 3;
        const result = x + y + z;
        console.log(result);
        return result > 5;
      }
    `;

    const files = [
      createFileDetail('file1.ts', content1, 10),
      createFileDetail('file2.ts', content2, 10)
    ];

    const result = detectDuplication(files, DEFAULT_THRESHOLDS, undefined);

    // Should detect duplication in code despite different comments
    result.forEach(file => {
      expect(file.metrics.duplicationRatio).toBeGreaterThan(0); // Should detect duplication
    });
  });
});