// File: src/ast-builder.ts - AST Construction Module

import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';
import { Project, SourceFile } from 'ts-morph';
import { normalizePath } from './utils';

// Default patterns to exclude
const DEFAULT_EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.git/**'
];

// Utility directory patterns to optionally exclude
const UTILITY_PATTERNS = [
  '**/test/**',
  '**/tests/**',
  '**/__tests__/**',
  '**/spec/**',
  '**/examples/**',
  '**/example/**',
  '**/demo/**',
  '**/docs/**',
  '**/scripts/**',
  '**/tools/**',
  '**/utils/**',
  '**/fixtures/**',
  '**/mocks/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/*.bench.*',
  '**/benchmark/**',
  '**/benchmarks/**',
  '**/coverage/**',
  "**/vendor/**",
  "**/temp-analysis/**",
  // Fichiers de test problématiques causant des stack overflow/memory issues
  "**/binderBinaryExpressionStress*",
  "**/binderBinaryExpressionStressJs*",
  "**/stress*",
  "**/fourslash*"
];

/**
 * Configuration options for AST building
 */
export interface ASTBuildOptions {
  production?: boolean;
  excludePatterns?: string[];
}

/**
 * Result of AST building containing file paths and their parsed source files
 */
export interface ASTBuildResult {
  files: Array<{
    filePath: string;
    sourceFile: SourceFile;
    content: string;
    relativePath: string;
  }>;
  project: Project;
  totalFiles: number;
}

/**
 * AST Builder - Responsible for discovering files and building the AST
 */
export class ASTBuilder {
  
  /**
   * Build AST for all files in the given directory
   */
  async build(targetPath: string, options: ASTBuildOptions = {}): Promise<ASTBuildResult> {
    // 1. Discover files
    const filePaths = await this.findFiles(targetPath, options);
    
    // 2. Create TypeScript project
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        allowJs: true,
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        target: 99, // Latest
        moduleResolution: 99 // Node
      }
    });

    // 3. Parse all files and build AST
    const files: ASTBuildResult['files'] = [];
    
    for (const filePath of filePaths) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const sourceFile = project.createSourceFile(filePath, content);
        const relativePath = path.relative(targetPath, filePath);
        
        files.push({
          filePath: normalizePath(filePath),
          sourceFile,
          content,
          relativePath: normalizePath(relativePath)
        });
      } catch (error) {
        console.warn(`Warning: Could not parse ${filePath}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return {
      files,
      project,
      totalFiles: files.length
    };
  }

  /**
   * Find all TypeScript/JavaScript files in the given path
   */
  private async findFiles(targetPath: string, options: ASTBuildOptions): Promise<string[]> {
    const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
    let ignore = [...DEFAULT_EXCLUDE, ...(options.excludePatterns || [])];
    
    if (options.production) {
      ignore = [...ignore, ...UTILITY_PATTERNS];
    }
    
    const files = await glob(patterns, {
      cwd: targetPath,
      absolute: true,
      ignore,
      dot: true,
      onlyFiles: true
    });
    
    return files;
  }
}

/**
 * Default AST builder instance
 */
export const astBuilder = new ASTBuilder();
