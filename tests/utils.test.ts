import { describe, it, expect } from 'vitest';
import { normalizePath, normalizeProjectPath } from '../src/utils';

describe('Utils', () => {
  describe('normalizePath', () => {
    it('should normalize Windows paths', () => {
      const result = normalizePath("C:\\Users\\test\\file.txt");
      expect(result).toBe("C:/Users/test/file.txt");
    });

    it('should remove leading "./" from paths', () => {
      const result = normalizePath("./src/index.ts");
      expect(result).toBe("src/index.ts");
    });

    it('should remove trailing slashes from paths', () => {
      const result = normalizePath("src/utils/");
      expect(result).toBe("src/utils");
    });

    it('should ensure relative paths (no leading "/")', () => {
      const result = normalizePath("/src/index.ts");
      expect(result).toBe("src/index.ts");
    });
  });

  describe('normalizeProjectPath', () => {
    it('should normalize project paths', () => {
      const result = normalizeProjectPath("/Users/test/temp-analysis/uuid");
      expect(result).toBe(".");
    });

    it('should extract project name from full paths', () => {
      const result = normalizeProjectPath("/Users/test/myproject");
      expect(result).toBe("myproject");
    });
    
    it('should convert Windows backslashes to forward slashes', () => {
      expect(normalizePath('src\\parser.ts')).toBe('src/parser.ts');
      expect(normalizePath('src\\utils\\index.ts')).toBe('src/utils/index.ts');
      expect(normalizePath('C:\\Users\\test\\file.ts')).toBe('C:/Users/test/file.ts');
    });

    it('should remove leading "./"', () => {
      expect(normalizePath('./src/index.ts')).toBe('src/index.ts');
      expect(normalizePath('./file.ts')).toBe('file.ts');
      expect(normalizePath('./src/utils/helper.ts')).toBe('src/utils/helper.ts');
    });

    it('should remove trailing slashes', () => {
      expect(normalizePath('src/utils/')).toBe('src/utils');
      expect(normalizePath('src/parser/')).toBe('src/parser');
      expect(normalizePath('folder/subfolder/')).toBe('folder/subfolder');
    });

    it('should remove leading slashes to ensure relative paths', () => {
      expect(normalizePath('/src/index.ts')).toBe('src/index.ts');
      expect(normalizePath('/file.ts')).toBe('file.ts');
      expect(normalizePath('/src/utils/helper.ts')).toBe('src/utils/helper.ts');
    });

    it('should remove temporary analysis prefixes', () => {
      expect(normalizePath('temp-analysis/uuid123/src/parser.ts')).toBe('src/parser.ts');
      expect(normalizePath('temp-analysis/abc-def/utils/index.ts')).toBe('utils/index.ts');
      expect(normalizePath('temp-analysis/test-id/file.ts')).toBe('file.ts');
    });

    it('should handle complex paths with multiple issues', () => {
      expect(normalizePath('./src\\utils\\index.ts/')).toBe('src/utils/index.ts');
      expect(normalizePath('/src\\parser\\file.ts')).toBe('src/parser/file.ts');
      expect(normalizePath('.\\src/utils/')).toBe('src/utils');
    });

    it('should handle empty and simple paths', () => {
      expect(normalizePath('')).toBe('');
      expect(normalizePath('file.ts')).toBe('file.ts');
      expect(normalizePath('folder')).toBe('folder');
    });

    it('should handle edge cases', () => {
      expect(normalizePath('.')).toBe('.');
      expect(normalizePath('./')).toBe('');
      expect(normalizePath('/')).toBe('');
      expect(normalizePath('\\')).toBe('');
      expect(normalizePath('.//')).toBe('');
    });

    it('should preserve file extensions', () => {
      expect(normalizePath('./src/file.ts')).toBe('src/file.ts');
      expect(normalizePath('./src/file.js')).toBe('src/file.js');
      expect(normalizePath('./src/file.tsx')).toBe('src/file.tsx');
      expect(normalizePath('./src/file.d.ts')).toBe('src/file.d.ts');
    });

    it('should handle paths with dots in filenames', () => {
      expect(normalizePath('./src/config.test.ts')).toBe('src/config.test.ts');
      expect(normalizePath('./src/types.d.ts')).toBe('src/types.d.ts');
      expect(normalizePath('./src/file.min.js')).toBe('src/file.min.js');
    });
  });

  describe('normalizeProjectPath', () => {
    it('should return "." for temporary analysis paths', () => {
      expect(normalizeProjectPath('temp-analysis/uuid123')).toBe('.');
      expect(normalizeProjectPath('/Users/test/temp-analysis/project-id')).toBe('.');
      expect(normalizeProjectPath('C:\\temp-analysis\\abc-def')).toBe('.');
    });

    it('should extract project name from full paths', () => {
      expect(normalizeProjectPath('/Users/test/myproject')).toBe('myproject');
      expect(normalizeProjectPath('C:\\Users\\test\\myapp')).toBe('myapp');
      expect(normalizeProjectPath('/home/user/awesome-project')).toBe('awesome-project');
    });

    it('should handle edge cases', () => {
      expect(normalizeProjectPath('')).toBe('.');
      expect(normalizeProjectPath('.')).toBe('.');
      expect(normalizeProjectPath('project')).toBe('project');
    });
  });
});