// File: src/codeContextExtractor.ts

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { FileMetrics, AnalysisResult, ThresholdConfig, CodeContext, CodeContextSummary } from './types';
import { analyze } from './analyzer';

/**
 * Extract rich context from a TypeScript/JavaScript file for LLM analysis
 */
export function extractCodeContext(filePath: string, metrics: FileMetrics): CodeContext {
  const absolutePath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(process.cwd(), filePath);
    
  const content = fs.readFileSync(absolutePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  
  const context: CodeContext = {
    path: metrics.path,
    complexity: metrics.complexity,
    structure: {
      imports: [],
      exports: [],
      classes: [],
      functions: [],
      interfaces: [],
      types: [],
      enums: [],
      constants: []
    },
    patterns: {
      hasAsyncFunctions: false,
      hasGenerators: false,
      hasDecorators: false,
      hasJSX: false,
      usesTypeScript: filePath.endsWith('.ts') || filePath.endsWith('.tsx'),
      hasErrorHandling: false,
      hasTests: false
    },
    complexityBreakdown: {
      functions: [],
      highestComplexityFunction: '',
      deepestNesting: 0
    },
    dependencies: {
      internal: [],
      external: [],
      mostImportedFrom: []
    },
    samples: {
      complexFunctions: []
    }
  };
  
  let currentNestingLevel = 0;
  let maxNesting = 0;
  
  // Main visitor function
  function visit(node: ts.Node, nestingLevel: number = 0) {
    currentNestingLevel = nestingLevel;
    maxNesting = Math.max(maxNesting, nestingLevel);
    
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
        extractImport(node as ts.ImportDeclaration);
        break;
        
      case ts.SyntaxKind.ExportDeclaration:
      case ts.SyntaxKind.ExportAssignment:
        context.structure.exports.push(getNodeName(node));
        break;
        
      case ts.SyntaxKind.ClassDeclaration:
        if ((node as ts.ClassDeclaration).name) {
          context.structure.classes.push((node as ts.ClassDeclaration).name!.text);
        }
        break;
        
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.MethodDeclaration:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.FunctionExpression:
        extractFunction(node);
        break;
        
      case ts.SyntaxKind.InterfaceDeclaration:
        if ((node as ts.InterfaceDeclaration).name) {
          context.structure.interfaces.push((node as ts.InterfaceDeclaration).name!.text);
        }
        break;
        
      case ts.SyntaxKind.TypeAliasDeclaration:
        if ((node as ts.TypeAliasDeclaration).name) {
          context.structure.types.push((node as ts.TypeAliasDeclaration).name!.text);
        }
        break;
        
      case ts.SyntaxKind.EnumDeclaration:
        if ((node as ts.EnumDeclaration).name) {
          context.structure.enums.push((node as ts.EnumDeclaration).name!.text);
        }
        break;
        
      case ts.SyntaxKind.VariableDeclaration:
        extractConstant(node as ts.VariableDeclaration);
        break;
        
      case ts.SyntaxKind.TryStatement:
      case ts.SyntaxKind.CatchClause:
        context.patterns.hasErrorHandling = true;
        break;
        
      case ts.SyntaxKind.JsxElement:
      case ts.SyntaxKind.JsxSelfClosingElement:
        context.patterns.hasJSX = true;
        break;
        
      case ts.SyntaxKind.Decorator:
        context.patterns.hasDecorators = true;
        break;
        
      case ts.SyntaxKind.YieldExpression:
        context.patterns.hasGenerators = true;
        break;
    }
    
    // Increment nesting for block-like structures
    if (node.kind === ts.SyntaxKind.Block || 
        node.kind === ts.SyntaxKind.IfStatement ||
        node.kind === ts.SyntaxKind.ForStatement ||
        node.kind === ts.SyntaxKind.WhileStatement) {
      ts.forEachChild(node, child => visit(child, nestingLevel + 1));
    } else {
      ts.forEachChild(node, child => visit(child, nestingLevel));
    }
  }
  
  function extractImport(node: ts.ImportDeclaration) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;
      context.structure.imports.push(importPath);
      
      if (importPath.startsWith('.') || importPath.startsWith('/')) {
        context.dependencies.internal.push(importPath);
      } else {
        context.dependencies.external.push(importPath);
      }
    }
  }
  
  function extractFunction(node: ts.Node) {
    const name = getFunctionName(node);
    const complexity = calculateFunctionComplexity(node);
    const lineCount = getLineCount(node);
    const parameters = getParameterCount(node);
    const isAsync = hasAsyncModifier(node);
    const hasErrorHandling = containsErrorHandling(node);
    
    if (name) {
      context.structure.functions.push(name);
      context.complexityBreakdown.functions.push({
        name,
        complexity,
        lineCount,
        parameters,
        isAsync,
        hasErrorHandling
      });
      
      if (isAsync) {
        context.patterns.hasAsyncFunctions = true;
      }
      
      // Track highest complexity function
      if (!context.complexityBreakdown.highestComplexityFunction ||
          complexity > (context.complexityBreakdown.functions.find(
            f => f.name === context.complexityBreakdown.highestComplexityFunction
          )?.complexity || 0)) {
        context.complexityBreakdown.highestComplexityFunction = name;
      }
      
      // Extract complex function samples (complexity > 10)
      if (complexity > 10 && context.samples.complexFunctions.length < 3) {
        const snippet = extractFunctionSnippet(node, content);
        context.samples.complexFunctions.push({
          name,
          complexity,
          snippet
        });
      }
    }
  }
  
  function extractConstant(node: ts.VariableDeclaration) {
    if (node.name && ts.isIdentifier(node.name)) {
      const name = node.name.text;
      const parent = node.parent.parent;
      if (parent && ts.isVariableStatement(parent)) {
        const isConst = parent.declarationList.flags & ts.NodeFlags.Const;
        const isUpperCase = name === name.toUpperCase();
        if (isConst && isUpperCase) {
          context.structure.constants.push(name);
        }
      }
    }
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
  
  function containsErrorHandling(node: ts.Node): boolean {
    let hasErrorHandling = false;
    
    function checkErrorHandling(n: ts.Node) {
      if (n.kind === ts.SyntaxKind.TryStatement || 
          n.kind === ts.SyntaxKind.CatchClause) {
        hasErrorHandling = true;
      }
      if (!hasErrorHandling) {
        ts.forEachChild(n, checkErrorHandling);
      }
    }
    
    checkErrorHandling(node);
    return hasErrorHandling;
  }
  
  function extractFunctionSnippet(node: ts.Node, fullContent: string): string {
    const start = node.getStart();
    const end = node.getEnd();
    const snippet = fullContent.substring(start, end);
    
    // Limit to first 10 lines for readability
    const lines = snippet.split('\n').slice(0, 10);
    if (snippet.split('\n').length > 10) {
      lines.push('    // ... more code ...');
    }
    
    return lines.join('\n');
  }
  
  // Helper functions
  function getFunctionName(node: ts.Node): string {
    // Type-safe way to check for name property
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      if (node.name && ts.isIdentifier(node.name)) {
        return node.name.text;
      }
    }
    
    // For arrow functions and function expressions
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      if (node.name && ts.isIdentifier(node.name)) {
        return node.name.text;
      }
      
      // Try to get name from variable declaration
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
  
  function getNodeName(node: ts.Node): string {
    // Type-safe checks for different node types
    if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || 
        ts.isEnumDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      if (node.name && ts.isIdentifier(node.name)) {
        return node.name.text;
      }
    }
    
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      if (node.name && ts.isIdentifier(node.name)) {
        return node.name.text;
      }
    }
    
    return '<unnamed>';
  }
  
  function getLineCount(node: ts.Node): number {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    return end.line - start.line + 1;
  }
  
  function getParameterCount(node: ts.Node): number {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || 
        ts.isArrowFunction(node) || ts.isFunctionExpression(node) || 
        ts.isConstructorDeclaration(node)) {
      return node.parameters.length;
    }
    return 0;
  }
  
  function hasAsyncModifier(node: ts.Node): boolean {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || 
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      return node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword) || false;
    }
    return false;
  }
  
  // Check for test patterns
  if (filePath.includes('.test.') || filePath.includes('.spec.') || 
      content.includes('describe(') || content.includes('it(') || 
      content.includes('test(')) {
    context.patterns.hasTests = true;
  }
  
  // Visit the AST
  visit(sourceFile);
  
  context.complexityBreakdown.deepestNesting = maxNesting;
  
  // Sort functions by complexity
  context.complexityBreakdown.functions.sort((a, b) => b.complexity - a.complexity);
  
  // Identify most imported from (top 3)
  const importCounts = context.dependencies.internal.reduce((acc, imp) => {
    const cleanPath = imp.replace(/^\.\//, '').replace(/\.[jt]sx?$/, '');
    acc[cleanPath] = (acc[cleanPath] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  context.dependencies.mostImportedFrom = Object.entries(importCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([path]) => path);
  
  return context;
}

/**
 * Generate a summary of code contexts for LLM analysis
 */
export function summarizeCodeContexts(contexts: CodeContext[]): CodeContextSummary {
  if (contexts.length === 0) {
    return {
      totalFiles: 0,
      patterns: {
        asyncUsage: 0,
        errorHandling: 0,
        typeScriptUsage: 0,
        jsxUsage: 0,
        testFiles: 0,
        decoratorUsage: 0,
        generatorUsage: 0
      },
      architecture: {
        totalClasses: 0,
        totalFunctions: 0,
        totalInterfaces: 0,
        totalTypes: 0,
        totalEnums: 0,
        avgFunctionsPerFile: 0,
        avgImportsPerFile: 0
      },
      complexity: {
        filesWithHighComplexity: 0,
        deepestNesting: 0,
        avgComplexityPerFunction: 0,
        mostComplexFunctions: []
      },
      dependencies: {
        mostUsedExternal: [],
        mostImportedInternal: [],
        avgExternalDepsPerFile: 0,
        avgInternalDepsPerFile: 0
      },
      codeQuality: {
        avgFunctionLength: 0,
        avgParametersPerFunction: 0,
        percentAsyncFunctions: 0,
        percentFunctionsWithErrorHandling: 0
      }
    };
  }
  
  // Calculate pattern usage
  const patterns = {
    asyncUsage: contexts.filter(c => c.patterns.hasAsyncFunctions).length,
    errorHandling: contexts.filter(c => c.patterns.hasErrorHandling).length,
    typeScriptUsage: contexts.filter(c => c.patterns.usesTypeScript).length,
    jsxUsage: contexts.filter(c => c.patterns.hasJSX).length,
    testFiles: contexts.filter(c => c.patterns.hasTests).length,
    decoratorUsage: contexts.filter(c => c.patterns.hasDecorators).length,
    generatorUsage: contexts.filter(c => c.patterns.hasGenerators).length
  };
  
  // Calculate architecture metrics
  const architecture = {
    totalClasses: contexts.reduce((sum, c) => sum + c.structure.classes.length, 0),
    totalFunctions: contexts.reduce((sum, c) => sum + c.structure.functions.length, 0),
    totalInterfaces: contexts.reduce((sum, c) => sum + c.structure.interfaces.length, 0),
    totalTypes: contexts.reduce((sum, c) => sum + c.structure.types.length, 0),
    totalEnums: contexts.reduce((sum, c) => sum + c.structure.enums.length, 0),
    avgFunctionsPerFile: contexts.reduce((sum, c) => sum + c.structure.functions.length, 0) / contexts.length,
    avgImportsPerFile: contexts.reduce((sum, c) => sum + c.structure.imports.length, 0) / contexts.length
  };
  
  // Calculate complexity metrics
  const allFunctions = contexts.flatMap(c => 
    c.complexityBreakdown.functions.map(f => ({
      file: c.path,
      ...f
    }))
  );
  
  const totalComplexity = allFunctions.reduce((sum, f) => sum + f.complexity, 0);
  const avgComplexityPerFunction = allFunctions.length > 0 ? totalComplexity / allFunctions.length : 0;
  
  const complexity = {
    filesWithHighComplexity: contexts.filter(c => c.complexity > 20).length,
    deepestNesting: Math.max(...contexts.map(c => c.complexityBreakdown.deepestNesting), 0),
    avgComplexityPerFunction: Math.round(avgComplexityPerFunction * 10) / 10,
    mostComplexFunctions: allFunctions
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 10)
      .map(f => ({
        file: f.file,
        name: f.name,
        complexity: f.complexity,
        lineCount: f.lineCount
      }))
  };
  
  // Calculate dependencies metrics
  const externalDeps = contexts.flatMap(c => c.dependencies.external);
  const internalDeps = contexts.flatMap(c => c.dependencies.internal);
  
  const dependencies = {
    mostUsedExternal: getCountedItems(externalDeps, 10),
    mostImportedInternal: getCountedItems(
      contexts.flatMap(c => c.dependencies.mostImportedFrom),
      10
    ),
    avgExternalDepsPerFile: Math.round((externalDeps.length / contexts.length) * 10) / 10,
    avgInternalDepsPerFile: Math.round((internalDeps.length / contexts.length) * 10) / 10
  };
  
  // Calculate code quality metrics
  const totalFunctionLength = allFunctions.reduce((sum, f) => sum + f.lineCount, 0);
  const totalParameters = allFunctions.reduce((sum, f) => sum + f.parameters, 0);
  const asyncFunctions = allFunctions.filter(f => f.isAsync).length;
  const functionsWithErrorHandling = allFunctions.filter(f => f.hasErrorHandling).length;
  
  const codeQuality = {
    avgFunctionLength: allFunctions.length > 0 
      ? Math.round(totalFunctionLength / allFunctions.length) 
      : 0,
    avgParametersPerFunction: allFunctions.length > 0
      ? Math.round((totalParameters / allFunctions.length) * 10) / 10
      : 0,
    percentAsyncFunctions: allFunctions.length > 0
      ? Math.round((asyncFunctions / allFunctions.length) * 100)
      : 0,
    percentFunctionsWithErrorHandling: allFunctions.length > 0
      ? Math.round((functionsWithErrorHandling / allFunctions.length) * 100)
      : 0
  };
  
  return {
    totalFiles: contexts.length,
    patterns,
    architecture,
    complexity,
    dependencies,
    codeQuality
  };
}

/**
 * Count occurrences of items and return sorted list with counts
 */
function getCountedItems(items: string[], limit: number): Array<{ name: string; count: number }> {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
  
/**
 * Enriched analysis result with code context for LLM analysis
 */
/**
 * Analyze files with optional code context extraction
 */
export function analyzeWithContext(
  files: FileMetrics[], 
  projectPath: string, 
  thresholds: ThresholdConfig,
  withContext: boolean = false
): AnalysisResult {
  // Get base analysis
  const baseAnalysis = analyze(files, projectPath, thresholds);
  
  if (!withContext) {
    return baseAnalysis;
  }
  
  // Extract context for top files and silent killers
  const criticalFiles = [...baseAnalysis.topFiles, ...baseAnalysis.silentKillers];
  const uniquePaths = new Set(criticalFiles.map(f => f.path));
  
  const contexts: CodeContext[] = [];
  
  for (const filePath of uniquePaths) {
    const fileMetrics = files.find(f => f.path === filePath);
    if (fileMetrics) {
      try {
        const context = extractCodeContext(filePath, fileMetrics);
        contexts.push(context);
      } catch (error) {
        console.warn(`Could not extract context for ${filePath}:`, error);
      }
    }
  }
  
  // Add code context to the result
  baseAnalysis.codeContext = {
    contexts,
    summary: summarizeCodeContexts(contexts)
  };
  
  return baseAnalysis;
}

function getMostFrequent(items: string[]): string[] {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([item]) => item);
}