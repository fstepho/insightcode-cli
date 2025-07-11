// File: src/contextExtractor.ts

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { FileDetail, CodeContext, FunctionContext, FilePatterns, QualityIssue } from './types';
import { normalizePath } from './utils';
import { DEFAULT_THRESHOLDS, CONTEXT_EXTRACTION_THRESHOLDS } from './thresholds.constants';
import { isCriticalFile } from './scoring.utils';

// Protection contre les stack overflow pour les fichiers de test TypeScript
const MAX_RECURSION_DEPTH = 1000;

/**
 * Wrapper sécurisé pour les fonctions récursives AST
 */
function safeVisit(node: ts.Node, visitor: (node: ts.Node, depth: number) => void, depth = 0) {
  if (depth > MAX_RECURSION_DEPTH) {
    console.warn(`Max recursion depth reached in context extraction, skipping deeper nodes`);
    return;
  }
  
  visitor(node, depth);
  
  try {
    ts.forEachChild(node, child => safeVisit(child, visitor, depth + 1));
  } catch (error) {
    if (error instanceof RangeError && error.message.includes('Maximum call stack size')) {
      console.warn(`Stack overflow detected in context extraction, skipping subtree`);
    } else {
      throw error;
    }
  }
}

/**
 * Mapping déclaratif des patterns vers leurs catégories
 * Cette approche sépare la détection de la catégorisation et facilite l'ajout de nouveaux patterns
 */
const PATTERN_CATEGORIES: { [key: string]: keyof FilePatterns } = {
  // Quality patterns
  'deep-nesting': 'quality',
  'long-function': 'quality',
  'high-complexity': 'quality',
  'too-many-params': 'quality',
  
  // Architecture patterns
  'async-heavy': 'architecture',
  'error-handling': 'architecture',
  'type-safe': 'architecture',
  
  // Performance patterns
  'io-heavy': 'performance',
  'caching': 'performance',
  
  // Security patterns
  'input-validation': 'security',
  'auth-check': 'security',
  
  // Testing patterns
  'test-file': 'testing',
  'mock-heavy': 'testing',
} as const;

/**
 * Enriches analysis results with context for critical files
 * Usage: enrichWithContext(analysisResult, projectPath)
 */
export function enrichWithContext(files: FileDetail[], projectPath: string): CodeContext[] {
  const criticalFiles = files.filter(f => isCriticalFile(f.healthScore));
  const contexts: CodeContext[] = [];

  for (const file of criticalFiles) {
    try {
      const context = extractCodeContext(file.file, file, projectPath);
      contexts.push(context);
    } catch (error) {
      console.warn(`Could not extract context for ${file.file}:`, error);
    }
  }
  
  return contexts;
}

/**
 * Extract context focused on critical functions and patterns
 * This enriches existing analysis results instead of calling analysis
 */
export function extractCodeContext(filePath: string, metrics: FileDetail, projectPath: string): CodeContext {
  // Resolve filePath: try projectPath first, then process.cwd() as fallback
  let absolutePath: string;
  
  if (path.isAbsolute(filePath)) {
    absolutePath = filePath;
  } else {
    // Try resolving from process.cwd() first (most common case)
    const fromCwd = path.resolve(process.cwd(), filePath);
    if (fs.existsSync(fromCwd)) {
      absolutePath = fromCwd;
    } else {
      // Fallback to projectPath
      const fromProject = path.resolve(projectPath, filePath);
      if (fs.existsSync(fromProject)) {
        absolutePath = fromProject;
      } else {
        // If file doesn't exist in either location, throw a descriptive error
        throw new Error(`File not found: ${filePath} (tried ${fromCwd} and ${fromProject})`);
      }
    }
  }
    
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  
  const criticalFunctions = extractCriticalFunctions(sourceFile, content);
  const patterns = detectFilePatterns(sourceFile, content, filePath);
  
  return {
    file: normalizePath(metrics.file),
    criticalFunctions,
    patterns
  };
}

/**
 * Extract only critical functions (high complexity, long, or problematic)
 */
function extractCriticalFunctions(sourceFile: ts.SourceFile, content: string): FunctionContext[] {
  const functions: FunctionContext[] = [];
  
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || 
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      
      const name = getFunctionName(node);
      const complexity = calculateFunctionComplexity(node);
      const lineCount = getFunctionLineCount(node);
      const parameterCount = getFunctionParameterCount(node);
      
      // Only include critical functions based on industry standards
      if (complexity > (DEFAULT_THRESHOLDS.complexity.production.high || 15) || 
          lineCount > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES || 
          parameterCount > CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT) {
        const snippet = extractCleanSnippet(node, content);
        const issues = identifyFunctionIssues(node, complexity, lineCount, parameterCount);
        
        functions.push({
          name,
          complexity,
          lineCount,
          parameterCount,
          snippet,
          issues
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  
  // Sort by complexity and limit to top N critical functions
  return functions
    .sort((a, b) => b.complexity - a.complexity)
    .slice(0, CONTEXT_EXTRACTION_THRESHOLDS.MAX_CRITICAL_FUNCTIONS);
}

/**
 * Detect file-level patterns organized by category in a single AST pass
 */
function detectFilePatterns(sourceFile: ts.SourceFile, content: string, filePath: string): FilePatterns {
  const patterns = new Set<string>();
  let maxNestingDepth = 0;
  let currentNestingDepth = 0;
  
  function visit(node: ts.Node) {
    // Track nesting depth for blocks and control structures
    if (ts.isBlock(node) || ts.isIfStatement(node) || ts.isForStatement(node) || ts.isWhileStatement(node)) {
      currentNestingDepth++;
      maxNestingDepth = Math.max(maxNestingDepth, currentNestingDepth);
    }
    
    // Detect function-related patterns
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || 
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      
      // Quality patterns
      if (getFunctionLineCount(node) > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES) patterns.add('long-function');
      if (calculateFunctionComplexity(node) > (DEFAULT_THRESHOLDS.complexity.production.high || 15)) patterns.add('high-complexity');
      if (getFunctionParameterCount(node) > CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT) patterns.add('too-many-params');
      
      // Architecture patterns
      if (node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        patterns.add('async-heavy');
      }
    }
    
    // Architecture patterns
    if (ts.isTryStatement(node) || ts.isCatchClause(node)) {
      patterns.add('error-handling');
    }
    
    // Continue visiting children
    ts.forEachChild(node, visit);
    
    // Decrement nesting depth when exiting blocks
    if (ts.isBlock(node) || ts.isIfStatement(node) || ts.isForStatement(node) || ts.isWhileStatement(node)) {
      currentNestingDepth--;
    }
  }
  
  // Single AST traversal
  visit(sourceFile);
  
  // Add deep-nesting pattern based on calculated depth
  if (maxNestingDepth > CONTEXT_EXTRACTION_THRESHOLDS.NESTING_DEPTH) patterns.add('deep-nesting');
  
  // Content-based patterns (no AST traversal needed)
  if (isTypeScriptFile(filePath)) patterns.add('type-safe');
  if (hasIOOperations(content)) patterns.add('io-heavy');
  if (hasCaching(content)) patterns.add('caching');
  if (hasInputValidation(content)) patterns.add('input-validation');
  if (hasAuthChecks(content)) patterns.add('auth-check');
  if (isTestFile(filePath, content)) patterns.add('test-file');
  if (hasMocks(content)) patterns.add('mock-heavy');
  
  // Organize patterns by category
  const categorizedPatterns: FilePatterns = {
    quality: [],
    architecture: [],
    performance: [],
    security: [],
    testing: []
  };
  
  // Map patterns to categories using declarative mapping
  patterns.forEach(pattern => {
    const category = PATTERN_CATEGORIES[pattern];
    if (category) {
      // Type assertion nécessaire car TypeScript ne peut pas inférer le type exact
      (categorizedPatterns[category] as string[]).push(pattern);
    }
  });
  
  return categorizedPatterns;
}

/**
 * Extract a clean, focused snippet of a function
 */
function extractCleanSnippet(node: ts.Node, content: string): string {
  const start = node.getStart();
  const end = node.getEnd();
  const fullSnippet = content.substring(start, end);
  
  // Get first N meaningful lines (skip empty lines and comments)
  const lines = fullSnippet.split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('//'))
    .slice(0, CONTEXT_EXTRACTION_THRESHOLDS.SNIPPET_LINES);
  
  if (fullSnippet.split('\n').length > CONTEXT_EXTRACTION_THRESHOLDS.SNIPPET_THRESHOLD) {
    lines.push('  // ... more code ...');
  }
  
  return lines.join('\n');
}

/**
 * Identify specific issues with a function
 */
function identifyFunctionIssues(node: ts.Node, complexity: number, lineCount: number, parameterCount: number): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  if (complexity > (DEFAULT_THRESHOLDS.complexity.production.critical || 20)) {
    issues.push({
      type: 'high-complexity',
      severity: 'high',
      description: `Complexity ${complexity} exceeds recommended threshold of ${DEFAULT_THRESHOLDS.complexity.production.high || 15}`
    });
  }
  
  if (lineCount > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES) {
    issues.push({
      type: 'long-function',
      severity: 'medium',
      description: `Function has ${lineCount} lines, consider splitting`
    });
  }
  
  if (parameterCount > CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT) {
    issues.push({
      type: 'too-many-params',
      severity: 'medium',
      description: `${parameterCount} parameters, consider using object parameter`
    });
  }
  
  if (hasDeepNestingInFunction(node)) {
    issues.push({
      type: 'deep-nesting',
      severity: 'medium',
      description: 'Deep nesting detected, consider extracting sub-functions'
    });
  }
  
  return issues;
}

// Content-based pattern detection helpers (no AST traversal)
//
// APPROCHE ACTUELLE : Détection par expressions régulières
// 
// AVANTAGES :
// - Rapide et simple à implémenter
// - Efficace pour la majorité des cas d'usage
// - Pas de complexité supplémentaire
//
// LIMITATIONS CONNUES :
// - Faux positifs : mots-clés dans les strings/commentaires (partiellement résolu)
// - Faux négatifs : abstractions custom (myFetch wrappant axios)
// - Pas d'analyse sémantique des types ou de la portée
//
// ALTERNATIVES FUTURES :
// - Analyse AST : détecter imports/appels de fonction
// - TypeChecker : analyse sémantique complète des types
// - Heuristiques mixtes : combiner regex + AST pour certains patterns

/**
 * Removes comments from code content to reduce false positives in pattern detection
 */
function removeComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, ' ')  // Multi-line comments
    .replace(/\/\/.*$/gm, ' ')          // Single-line comments
    .replace(/\/\*.*$/gm, ' ')          // Unclosed multi-line comments at end
    .replace(/^.*\*\//gm, ' ');         // Unclosed multi-line comments at start
}

function hasDeepNestingInFunction(node: ts.Node): boolean {
  let depth = 0;
  let maxDepth = 0;
  
  function visit(n: ts.Node) {
    if (ts.isBlock(n) || ts.isIfStatement(n) || ts.isForStatement(n) || ts.isWhileStatement(n)) {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    }
    ts.forEachChild(n, visit);
    if (ts.isBlock(n) || ts.isIfStatement(n) || ts.isForStatement(n) || ts.isWhileStatement(n)) {
      depth--;
    }
  }
  
  visit(node);
  return maxDepth > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_NESTING_DEPTH;
}

function isTypeScriptFile(filePath: string): boolean {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
}

/**
 * Détecte les opérations I/O via regex sur le contenu.
 * LIMITATIONS : 
 * - Peut donner des faux positifs (mots dans strings)
 * - Peut manquer des abstractions (myFetch wrapping axios)
 * - Pour plus de précision, utiliser l'analyse AST/sémantique
 */
function hasIOOperations(content: string): boolean {
  const codeOnly = removeComments(content);
  return /\b(readFile|writeFile|readFileSync|writeFileSync|fetch|axios|request|query|exec)\b/.test(codeOnly);
}

/**
 * Détecte les patterns de cache/memoization.
 * LIMITATIONS : Peut manquer les abstractions customs ou donner des faux positifs
 */
function hasCaching(content: string): boolean {
  const codeOnly = removeComments(content);
  return /\b(cache|memoize|redis|localStorage|sessionStorage|Map|WeakMap|Set|WeakSet)\b/i.test(codeOnly);
}

/**
 * Détecte les patterns de validation d'input.
 * LIMITATIONS : Peut manquer les validations customs ou donner des faux positifs
 */
function hasInputValidation(content: string): boolean {
  const codeOnly = removeComments(content);
  return /\b(validate|sanitize|escape|trim|filter)\b/i.test(codeOnly);
}

/**
 * Détecte les patterns d'authentification/autorisation.
 * LIMITATIONS : Peut manquer les implémentations customs ou donner des faux positifs
 */
function hasAuthChecks(content: string): boolean {
  const codeOnly = removeComments(content);
  return /\b(auth|login|token|permission|role|access)\b/i.test(codeOnly);
}

function isTestFile(filePath: string, content: string): boolean {
  return filePath.includes('.test.') || filePath.includes('.spec.') || 
         /\b(describe|it|test|expect|jest|mocha)\b/.test(content);
}

/**
 * Détecte les patterns de mocking dans les tests.
 * LIMITATIONS : Peut manquer les frameworks de mock customs
 */
function hasMocks(content: string): boolean {
  const codeOnly = removeComments(content);
  return /\b(mock|stub|spy|sinon|jest\.fn)\b/i.test(codeOnly);
}

// Helper functions for function analysis
function getFunctionName(node: ts.Node): string {
  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
    if (node.name && ts.isIdentifier(node.name)) {
      return node.name.text;
    }
  }
  
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    if (node.name && ts.isIdentifier(node.name)) {
      return node.name.text;
    }
    
    const parent = node.parent;
    if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
      return parent.name.text;
    }
    if (parent && ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
      return parent.name.text;
    }
  }
  
  return '<anonymous>';
}

function calculateFunctionComplexity(node: ts.Node): number {
  let complexity = 1;
  
  function visitForComplexity(n: ts.Node) {
    switch (n.kind) {
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ConditionalExpression:
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
        const op = (n as ts.BinaryExpression).operatorToken.kind;
        if (op === ts.SyntaxKind.AmpersandAmpersandToken || 
            op === ts.SyntaxKind.BarBarToken) {
          complexity++;
        }
        break;
    }
    ts.forEachChild(n, visitForComplexity);
  }
  
  visitForComplexity(node);
  return complexity;
}

function getFunctionLineCount(node: ts.Node): number {
  const sourceFile = node.getSourceFile();
  const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  return end.line - start.line + 1;
}

function getFunctionParameterCount(node: ts.Node): number {
  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || 
      ts.isArrowFunction(node) || ts.isFunctionExpression(node) || 
      ts.isConstructorDeclaration(node)) {
    return node.parameters.length;
  }
  return 0;
}