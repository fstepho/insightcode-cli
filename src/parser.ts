import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';
import { FileMetrics, Issue, ThresholdConfig } from './types';

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
];

// Default thresholds by file type
const DEFAULT_THRESHOLDS: ThresholdConfig = {
  complexity: {
    production: { medium: 10, high: 20 },
    test: { medium: 15, high: 30 },      // More tolerant for tests
    utility: { medium: 15, high: 25 },   // More tolerant for utilities
    example: { medium: 20, high: 40 },   // Examples can be complex
    config: { medium: 20, high: 35 }     // Config files may have complex logic
  },
  size: {
    production: { medium: 200, high: 300 },
    test: { medium: 300, high: 500 },    // Tests can be longer
    utility: { medium: 250, high: 400 }, // Utilities can be longer
    example: { medium: 150, high: 250 }, // Examples should be concise
    config: { medium: 300, high: 500 }   // Config files can be large
  },
  duplication: {
    production: { medium: 15, high: 30 },
    test: { medium: 25, high: 50 },      // Tests often have setup duplication
    utility: { medium: 20, high: 40 },   // Utilities may have patterns
    example: { medium: 50, high: 80 },   // Examples often duplicate patterns
    config: { medium: 30, high: 60 }     // Config may have repeated structures
  }
};

/**
 * Find all TypeScript/JavaScript files in the given path
 */
export async function findFiles(targetPath: string, exclude: string[] = [], excludeUtility: boolean = false): Promise<string[]> {
  const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
  let ignore = [...DEFAULT_EXCLUDE, ...exclude];
  
  // Add utility patterns if requested
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
function classifyFileType(filePath: string): FileMetrics['fileType'] {
  const relativePath = path.relative(process.cwd(), filePath).toLowerCase();
  
  // Test files
  if (relativePath.includes('/test/') || 
      relativePath.includes('/tests/') || 
      relativePath.includes('/__tests__/') || 
      relativePath.includes('/spec/') ||
      relativePath.includes('.test.') ||
      relativePath.includes('.spec.') ||
      relativePath.includes('.bench.')) {
    return 'test';
  }
  
  // Example/demo files
  if (relativePath.includes('/example') || 
      relativePath.includes('/demo') ||
      relativePath.includes('/fixtures/') ||
      relativePath.includes('/mocks/')) {
    return 'example';
  }
  
  // Utility/tooling files
  if (relativePath.includes('/scripts/') || 
      relativePath.includes('/tools/') ||
      relativePath.includes('/utils/') ||
      relativePath.includes('/benchmark') ||
      relativePath.match(/^(gulpfile|webpack|rollup|vite|makefile)\./i) ||
      relativePath.endsWith('.config.js') ||
      relativePath.endsWith('.config.ts') ||
      relativePath.endsWith('.config.mjs')) {
    return 'utility';
  }
  
  // Config files
  if (relativePath.match(/\.(config|rc)\.(js|ts|json)$/) ||
      relativePath.includes('eslint.config') ||
      relativePath.includes('prettier.config') ||
      relativePath.includes('tsconfig') ||
      relativePath.includes('package.json')) {
    return 'config';
  }
  
  return 'production';
}

/**
 * Calculates the cyclomatic complexity of a TypeScript source file.
 *
 * Cyclomatic complexity is a software metric introduced by Thomas McCabe 
 * that measures the number of linearly independent paths through a program's source code.
 * This function increases the complexity count for each control flow structure
 * such as if-statements, loops, switch cases, catch clauses, and conditional expressions,
 * as well as for each logical AND (&&) and OR (||) operator within binary expressions.
 *
 * @param sourceFile - The TypeScript source file to analyze.
 * @returns The calculated cyclomatic complexity as a number.
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
  return content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') &&
             !trimmed.startsWith('/*') &&
             !trimmed.startsWith('*');
    })
    .length;
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
 * Parse a single file and extract metrics
 */
export function parseFile(filePath: string, thresholds: ThresholdConfig = DEFAULT_THRESHOLDS): FileMetrics {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  
  const complexity = calculateComplexity(sourceFile);
  const functionCount = countFunctions(sourceFile);
  const loc = countLinesOfCode(content);
  const fileType = classifyFileType(filePath) || 'production';
  const issues: Issue[] = [];
  
  // Get appropriate thresholds for this file type
  const complexityThresholds = thresholds.complexity[fileType as keyof typeof thresholds.complexity] || thresholds.complexity.production;
  const sizeThresholds = thresholds.size[fileType as keyof typeof thresholds.size] || thresholds.size.production;
  
  // Check for high complexity with file-type specific thresholds
  if (complexity > complexityThresholds.high) {
    issues.push({
      type: 'complexity',
      severity: 'high',
      message: `High complexity: ${complexity} (recommended: < ${complexityThresholds.high})`
    });
  } else if (complexity > complexityThresholds.medium) {
    issues.push({
      type: 'complexity',
      severity: 'medium',
      message: `Medium complexity: ${complexity} (recommended: < ${complexityThresholds.medium})`
    });
  }
  
  // Check for large files with file-type specific thresholds
  if (loc > sizeThresholds.high) {
    issues.push({
      type: 'size',
      severity: 'high',
      message: `Large file: ${loc} lines (recommended: < ${sizeThresholds.high})`
    });
  } else if (loc > sizeThresholds.medium) {
    issues.push({
      type: 'size',
      severity: 'medium',
      message: `File getting large: ${loc} lines`
    });
  }
  
  return {
    path: path.relative(process.cwd(), filePath),
    complexity,
    duplication: 0, // Will be calculated in analyzer
    functionCount,
    loc,
    issues,
    fileType
  };
}

/**
 * Parse all TypeScript files in a directory or a single file
 */
export async function parseDirectory(
  targetPath: string, 
  exclude: string[] = [], 
  excludeUtility: boolean = false,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): Promise<FileMetrics[]> {
  let filesToAnalyze: string[] = [];
  
  // Check if targetPath is a file or directory
  const stats = fs.statSync(targetPath);
  
  if (stats.isFile()) {
    // Single file analysis
    const absolutePath = path.isAbsolute(targetPath) ? targetPath : path.resolve(targetPath);
    filesToAnalyze = [absolutePath];
  } else if (stats.isDirectory()) {
    // Directory analysis
    filesToAnalyze = await findFiles(targetPath, exclude, excludeUtility);
  } else {
    throw new Error(`Path is neither a file nor a directory: ${targetPath}`);
  }
  
  if (filesToAnalyze.length === 0) {
    throw new Error('No TypeScript/JavaScript files found');
  }
  
  const results: FileMetrics[] = [];
  
  for (const file of filesToAnalyze) {
    try {
      const metrics = parseFile(file, thresholds);
      results.push(metrics);
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error);
    }
  }
  
  return results;
}

export { DEFAULT_THRESHOLDS };