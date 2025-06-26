import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';
import { FileMetrics, Issue } from './types';

// Default patterns to exclude
const DEFAULT_EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.d.ts',
  '**/coverage/**',
  '**/.git/**'
];

/**
 * Find all TypeScript/JavaScript files in the given path
 */
export async function findFiles(targetPath: string, exclude: string[] = []): Promise<string[]> {
  const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'];
  const ignore = [...DEFAULT_EXCLUDE, ...exclude];
  
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
 * Calculate cyclomatic complexity for a TypeScript source file
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
            op === ts.SyntaxKind.BarBarToken ||
            op === ts.SyntaxKind.QuestionQuestionToken) {
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
 * Parse a single file and extract metrics
 */
export function parseFile(filePath: string): FileMetrics {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  
  const complexity = calculateComplexity(sourceFile);
  const loc = countLinesOfCode(content);
  const issues: Issue[] = [];
  
  // Check for high complexity
  if (complexity > 20) {
    issues.push({
      type: 'complexity',
      severity: 'high',
      message: `High complexity: ${complexity} (recommended: < 20)`
    });
  } else if (complexity > 10) {
    issues.push({
      type: 'complexity',
      severity: 'medium',
      message: `Medium complexity: ${complexity} (recommended: < 10)`
    });
  }
  
  // Check for large files
  if (loc > 300) {
    issues.push({
      type: 'size',
      severity: 'high',
      message: `Large file: ${loc} lines (recommended: < 300)`
    });
  } else if (loc > 200) {
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
    loc,
    issues
  };
}

/**
 * Parse all TypeScript files in a directory or a single file
 */
export async function parseDirectory(targetPath: string, exclude: string[] = []): Promise<FileMetrics[]> {
  let filesToAnalyze: string[] = [];
  
  // Check if targetPath is a file or directory
  const stats = fs.statSync(targetPath);
  
  if (stats.isFile()) {
    // Single file analysis
    const absolutePath = path.isAbsolute(targetPath) ? targetPath : path.resolve(targetPath);
    filesToAnalyze = [absolutePath];
  } else if (stats.isDirectory()) {
    // Directory analysis
    filesToAnalyze = await findFiles(targetPath, exclude);
  } else {
    throw new Error(`Path is neither a file nor a directory: ${targetPath}`);
  }
  
  if (filesToAnalyze.length === 0) {
    throw new Error('No TypeScript/JavaScript files found');
  }
  
  const results: FileMetrics[] = [];
  
  for (const file of filesToAnalyze) {
    try {
      const metrics = parseFile(file);
      results.push(metrics);
    } catch (error) {
      console.warn(`Warning: Could not parse ${file}:`, error);
    }
  }
  
  return results;
}