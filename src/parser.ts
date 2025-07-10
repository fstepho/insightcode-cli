// File: src/parser.ts

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';
import { FileDetail, Issue, IssueType, Severity, ThresholdConfig } from './types';
import { normalizePath } from './utils';
import { getConfig } from './config';

/**
 * Checks if a file is an entry point
 */
function isEntryPoint(filePath: string): boolean {
  const normalizedPath = normalizePath(filePath);
  return normalizedPath.includes('main.ts') || 
         normalizedPath.includes('index.ts') || 
         normalizedPath.includes('app.ts') ||
         normalizedPath.endsWith('main.js') ||
         normalizedPath.endsWith('index.js') ||
         normalizedPath.endsWith('app.js');
}

// Default patterns to exclude
const DEFAULT_EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.d.ts',
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
  "**/temp-analysis/**"
];

/**
 * Find all TypeScript/JavaScript files in the given path
 */
export async function findFiles(targetPath: string, exclude: string[] = [], excludeUtility: boolean = false): Promise<string[]> {
  const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
  let ignore = [...DEFAULT_EXCLUDE, ...exclude];
  
  if (excludeUtility) {
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

/**
 * Classify file type based on its path
 */
function classifyFileType(filePath: string): 'production' | 'test' | 'example' | 'utility' | 'config' {
  const relativePath = path.relative(process.cwd(), filePath).toLowerCase();
  
  if (relativePath.includes('/test/') || relativePath.includes('/tests/') || relativePath.includes('/__tests__/') || relativePath.includes('/spec/') || relativePath.includes('.test.') || relativePath.includes('.spec.') || relativePath.includes('.bench.')) {
    return 'test';
  }
  if (relativePath.includes('/example') || relativePath.includes('/demo') || relativePath.includes('/fixtures/') || relativePath.includes('/mocks/')) {
    return 'example';
  }
  if (relativePath.includes('/scripts/') || relativePath.includes('/tools/') || relativePath.includes('/utils/') || relativePath.includes('/benchmark') || relativePath.match(/^(gulpfile|webpack|rollup|vite|makefile)\./i) || relativePath.endsWith('.config.js') || relativePath.endsWith('.config.ts') || relativePath.endsWith('.config.mjs')) {
    return 'utility';
  }
  if (relativePath.match(/\.(config|rc)\.(js|ts|json)$/) || relativePath.includes('eslint.config') || relativePath.includes('prettier.config') || relativePath.includes('tsconfig') || relativePath.includes('package.json')) {
    return 'config';
  }
  
  return 'production';
}

/**
 * Calculates the extended cyclomatic complexity of a TypeScript source file.
 *
 * This implementation follows the "extended" definition of cyclomatic complexity,
 * as commonly used by modern static analysis tools (e.g., ESLint, SonarQube).
 * In addition to classical control flow structures (if, for, while, case, catch),
 * it also increments complexity for each logical AND (&&) and OR (||) operator
 * and for each ternary conditional expression (?:) encountered in the code.
 *
 * Note: This is more comprehensive than the original 1976 McCabe definition,
 * as it better reflects the complexity of modern JavaScript/TypeScript code.
 *
 * @param sourceFile - The TypeScript source file to analyze.
 * @returns The calculated extended cyclomatic complexity as a number.
 */
function calculateComplexity(sourceFile: ts.SourceFile): number {
  let complexity = 1; // Base complexity
  
  function visit(node: ts.Node) {
    // Add +1 for each decision point
    switch (node.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ConditionalExpression: // ? :
      case ts.SyntaxKind.CaseClause:
      case ts.SyntaxKind.CatchClause:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.SwitchStatement:
        complexity++;
        break;
      case ts.SyntaxKind.BinaryExpression:
        const op = (node as ts.BinaryExpression).operatorToken.kind;
        if (op === ts.SyntaxKind.AmpersandAmpersandToken || 
            op === ts.SyntaxKind.BarBarToken) {
          complexity++;
        }
        break;
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return complexity;
}


/**
 * Count lines of code (excluding comments and blank lines)
 */
function countLinesOfCode(content: string): number {
  const lines = content.split('\n');
  let inMultiLineComment = false;
  let codeLines = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (trimmed.length === 0) continue;
    
    // Handle multi-line comments
    if (trimmed.includes('/*') && trimmed.includes('*/')) {
      // Single line comment /* ... */ - skip if it's the only content
      const beforeComment = trimmed.substring(0, trimmed.indexOf('/*')).trim();
      const afterComment = trimmed.substring(trimmed.indexOf('*/') + 2).trim();
      if (beforeComment.length > 0 || afterComment.length > 0) {
        codeLines++;
      }
      continue;
    }
    
    if (trimmed.includes('/*')) {
      inMultiLineComment = true;
    }
    if (trimmed.includes('*/')) {
      inMultiLineComment = false;
      // If there's code after */, count this line
      const afterComment = trimmed.substring(trimmed.indexOf('*/') + 2).trim();
      if (afterComment.length > 0) {
        codeLines++;
      }
      continue;
    }
    
    // Skip lines inside multi-line comments
    if (inMultiLineComment) continue;
    
    // Skip single-line comments
    if (trimmed.startsWith('//')) continue;
    
    // Count as code line
    codeLines++;
  }
  
  return codeLines;
}

/**
 * Count functions in a TypeScript file
 */
function countFunctions(sourceFile: ts.SourceFile): number {
  let functionCount = 0;

  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.Constructor:
      case ts.SyntaxKind.GetAccessor:
      case ts.SyntaxKind.SetAccessor:
        functionCount++;
        break;
    }
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return functionCount;
}

/**
 * Parse a single file and extract metrics.
 */
export function parseFile(filePath: string): FileDetail {
  // FIX: Get thresholds from the single source of truth.
  const thresholds = getConfig();
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  
  const complexity = calculateComplexity(sourceFile);
  const functionCount = countFunctions(sourceFile);
  const loc = countLinesOfCode(content);
  const fileType = classifyFileType(filePath) || 'production';
  const issues: Issue[] = [];
  
  const complexityThresholds = thresholds.complexity[fileType as keyof typeof thresholds.complexity] || thresholds.complexity.production;
  const sizeThresholds = thresholds.size[fileType as keyof typeof thresholds.size] || thresholds.size.production;
  
  if (complexity > complexityThresholds.high) {
    issues.push({
      type: IssueType.Complexity,
      severity: Severity.High,
      location: {
        line: 1,
        function: undefined
      },
      context: {
        message: `High complexity: ${complexity} (recommended: < ${complexityThresholds.high})`,
        threshold: complexityThresholds.high,
        excessRatio: complexity / complexityThresholds.high,
        unit: 'count'
      },
      action: {
        description: 'Break down into smaller functions',
        impact: 'Improved readability and maintainability',
        effortHours: 4
      }
    });
  } else if (complexity > complexityThresholds.medium) {
    issues.push({
      type: IssueType.Complexity,
      severity: Severity.Medium,
      location: {
        line: 1,
        function: undefined
      },
      context: {
        message: `Medium complexity: ${complexity} (recommended: < ${complexityThresholds.medium})`,
        threshold: complexityThresholds.medium,
        excessRatio: complexity / complexityThresholds.medium,
        unit: 'count'
      },
      action: {
        description: 'Refactor to reduce complexity',
        impact: 'Improved readability and maintainability',
        effortHours: 2
      }
    });
  }
  
  if (loc > sizeThresholds.high) {
    issues.push({
      type: IssueType.Size,
      severity: Severity.High,
      location: {
        line: 1,
        function: undefined
      },
      context: {
        message: `Large file: ${loc} lines (recommended: < ${sizeThresholds.high})`,
        threshold: sizeThresholds.high,
        excessRatio: loc / sizeThresholds.high,
        unit: 'lines'
      },
      action: {
        description: 'Split into smaller, focused modules',
        impact: 'Better module organization',
        effortHours: 6
      }
    });
  } else if (loc > sizeThresholds.medium) {
    issues.push({
      type: IssueType.Size,
      severity: Severity.Medium,
      location: {
        line: 1,
        function: undefined
      },
      context: {
        message: `File getting large: ${loc} lines (recommended: < ${sizeThresholds.medium})`,
        threshold: sizeThresholds.medium,
        excessRatio: loc / sizeThresholds.medium,
        unit: 'lines'
      },
      action: {
        description: 'Consider splitting into smaller modules',
        impact: 'Better module organization',
        effortHours: 3
      }
    });
  }
  
  return {
    file: normalizePath(path.relative(process.cwd(), filePath)),
    metrics: {
      complexity,
      loc,
      functionCount,
      duplication: 0  // Will be calculated later in duplication.ts
    },
    importance: {
      usageCount: 0,  // Will be calculated later in dependencyAnalyzer.ts
      usageRank: 0,   // Will be calculated later in analyzer.ts
      isEntryPoint: isEntryPoint(filePath),
      isCriticalPath: false  // Will be calculated later in analyzer.ts
    },
    issues,
    healthScore: 0,  // Will be calculated later in analyzer.ts
    isCritical: false  // Will be calculated later in analyzer.ts
  };
}

/**
 * Parse all TypeScript files in a directory or a single file.
 */
export async function parseDirectory(
  targetPath: string, 
  exclude: string[] = [], 
  excludeUtility: boolean = false
): Promise<FileDetail[]> {
  // FIX: The `thresholds` parameter is removed as it's no longer needed.
  // `parseFile` will get it from `getConfig()`.

  let filesToAnalyze: string[] = [];
  
  const stats = fs.statSync(targetPath);
  
  if (stats.isFile()) {
    const absolutePath = path.isAbsolute(targetPath) ? targetPath : path.resolve(targetPath);
    filesToAnalyze = [absolutePath];
  } else if (stats.isDirectory()) {
    filesToAnalyze = await findFiles(targetPath, exclude, excludeUtility);
  } else {
    throw new Error(`Path is neither a file nor a directory: ${targetPath}`);
  }
  
  if (filesToAnalyze.length === 0) {
    throw new Error('No TypeScript/JavaScript files found');
  }
  
  const results: FileDetail[] = [];
  
  for (const file of filesToAnalyze) {
    try {
      const fileDetail = parseFile(file);
      results.push(fileDetail);
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error);
    }
  }
  
  return results;
}