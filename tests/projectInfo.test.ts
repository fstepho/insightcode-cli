import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getProjectInfo } from '../src/projectInfo';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ProjectInfo', () => {
  let tempDir: string;
  
  beforeEach(() => {
    // Create temp directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insightcode-projectinfo-'));
  });
  
  afterEach(() => {
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('getProjectInfo', () => {
    it('should return project info with package.json', () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        description: 'A test project'
      };
      
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      const result = getProjectInfo(tempDir);
      
      expect(result.name).toBe('test-project');
      expect(result.path).toBeTruthy();
      expect(result.packageJson).toEqual({
        name: 'test-project',
        version: '1.0.0',
        description: 'A test project'
      });
    });

    it('should return project info without package.json', () => {
      const dirName = path.basename(tempDir);
      
      const result = getProjectInfo(tempDir);
      
      expect(result.name).toBe(dirName);
      expect(result.path).toBeTruthy();
      expect(result.packageJson).toBeUndefined();
    });

    it('should handle package.json with missing fields', () => {
      const packageJson = {
        name: 'minimal-project'
        // Missing version and description
      };
      
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      const result = getProjectInfo(tempDir);
      
      expect(result.name).toBe('minimal-project');
      expect(result.packageJson).toEqual({
        name: 'minimal-project',
        version: undefined,
        description: undefined
      });
    });

    it('should handle malformed package.json', () => {
      // Create invalid JSON
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{ invalid json }');
      
      const result = getProjectInfo(tempDir);
      
      // Should fallback to directory name when package.json is malformed
      expect(result.name).toBe(path.basename(tempDir));
      expect(result.packageJson).toBeUndefined();
    });

    it('should handle empty package.json', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '{}');
      
      const result = getProjectInfo(tempDir);
      
      // Should fallback to directory name when package.json has no name
      expect(result.name).toBe(path.basename(tempDir));
      expect(result.packageJson).toEqual({
        name: undefined,
        version: undefined,
        description: undefined
      });
    });

    it('should handle package.json with extra fields', () => {
      const packageJson = {
        name: 'full-project',
        version: '2.0.0',
        description: 'A full project',
        author: 'Test Author',
        license: 'MIT',
        dependencies: {
          'some-dep': '^1.0.0'
        }
      };
      
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      const result = getProjectInfo(tempDir);
      
      expect(result.name).toBe('full-project');
      expect(result.packageJson).toEqual({
        name: 'full-project',
        version: '2.0.0',
        description: 'A full project'
      });
      // Should not include extra fields like author, license, dependencies
    });

    it('should handle relative and absolute paths', () => {
      const packageJson = {
        name: 'path-test',
        version: '1.0.0'
      };
      
      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      // Test with absolute path
      const resultAbsolute = getProjectInfo(tempDir);
      expect(resultAbsolute.name).toBe('path-test');
      
      // Test with relative path
      const relativePath = path.relative(process.cwd(), tempDir);
      const resultRelative = getProjectInfo(relativePath);
      expect(resultRelative.name).toBe('path-test');
    });

    it('should handle current directory path', () => {
      const originalCwd = process.cwd();
      
      try {
        // Change to temp directory
        process.chdir(tempDir);
        
        const packageJson = {
          name: 'current-dir-test',
          version: '1.0.0'
        };
        
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        
        const result = getProjectInfo('.');
        
        expect(result.name).toBe('current-dir-test');
        expect(result.path).toBe('.');
      } finally {
        // Restore original working directory
        process.chdir(originalCwd);
      }
    });

    it('should handle non-existent directory gracefully', () => {
      const nonExistentPath = path.join(tempDir, 'non-existent');
      
      const result = getProjectInfo(nonExistentPath);
      
      expect(result.name).toBe('non-existent');
      expect(result.packageJson).toBeUndefined();
    });

    it('should handle package.json read permission errors', () => {
      const packageJson = {
        name: 'permission-test',
        version: '1.0.0'
      };
      
      const packagePath = path.join(tempDir, 'package.json');
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      
      // Make package.json unreadable (skip on Windows where chmod might not work)
      if (process.platform !== 'win32') {
        fs.chmodSync(packagePath, 0o000);
        
        const result = getProjectInfo(tempDir);
        
        expect(result.name).toBe(path.basename(tempDir));
        expect(result.packageJson).toBeUndefined();
        
        // Restore permissions for cleanup
        fs.chmodSync(packagePath, 0o644);
      }
    });
  });
});