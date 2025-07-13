// File: src/context-builder.ts - Unified Code Context Construction Module

import { CodeContext, FileDetail, FunctionContext, FilePatterns, QualityIssue } from './types';
import { ASTBuildResult } from './ast-builder';
import { isCriticalFile } from './scoring.utils';
import { DEFAULT_THRESHOLDS, CONTEXT_EXTRACTION_THRESHOLDS } from './thresholds.constants';
import { calculateFunctionComplexity } from './file-detail-builder';
import { Node, SourceFile, SyntaxKind } from 'ts-morph';
import { 
  isFunctionLike, 
  getFunctionName, 
  getFunctionLineCount, 
  getFunctionParameterCount,
  hasAsyncModifier,
  isNestingNode,
  isFunctionNode
} from './ast-helpers';

/**
 * Options for building code context
 */
export interface ContextBuildOptions {
  projectPath: string;
  enabled: boolean;
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
 * Unified Context Builder - Responsible for extracting code context from AST when requested
 */
export class ContextBuilder {

  /**
   * Build code context array from file details and AST data when enabled
   */
  async build(
    fileDetails: FileDetail[], 
    astData: ASTBuildResult, 
    options: ContextBuildOptions
  ): Promise<CodeContext[] | undefined> {
    
    if (!options.enabled) {
      return undefined;
    }

    try {
      // Filter to only critical files
      const criticalFiles = fileDetails.filter(f => isCriticalFile(f.healthScore));
      const contexts: CodeContext[] = [];

      for (const fileDetail of criticalFiles) {
        // Find corresponding AST data using absolute path
        // Try both absolute path and normalized path (without leading slash)
        let astFile = astData.files.find(f => f.filePath === fileDetail.absolutePath);
        if (!astFile) {
          // Try without leading slash
          const normalizedPath = fileDetail.absolutePath.startsWith('/') ? fileDetail.absolutePath.slice(1) : fileDetail.absolutePath;
          astFile = astData.files.find(f => f.filePath === normalizedPath);
        }
        if (!astFile) {
          // Try with leading slash added
          const withSlash = fileDetail.absolutePath.startsWith('/') ? fileDetail.absolutePath : '/' + fileDetail.absolutePath;
          astFile = astData.files.find(f => f.filePath === withSlash);
        }
        

        if (astFile) {
          try {
            // Extract context using AST data directly
            const context = this.extractCodeContext(
              astFile.sourceFile,
              astFile.content,
              astFile.filePath,
              fileDetail
            );
            contexts.push(context);
          } catch (error) {
            console.warn(`Could not extract context for ${fileDetail.file}:`, error instanceof Error ? error.message : String(error));
          }
        }
      }

      return contexts;
    } catch (error) {
      console.warn('Could not build code context:', error instanceof Error ? error.message : String(error));
      return undefined;
    }
  }

  /**
   * Extract context focused on critical functions and patterns
   */
  private extractCodeContext(
    sourceFile: SourceFile,
    content: string,
    filePath: string, 
    fileDetail: FileDetail
  ): CodeContext {
    // Get all functions from the source file
    const allFunctions = this.getAllNamedFunctions(sourceFile);
    
    // Extract critical functions
    const criticalFunctions = this.extractCriticalFunctions(allFunctions, content);
    
    // Detect file patterns
    const patterns = this.detectFilePatterns(sourceFile, content, filePath);
    
    return {
      file: fileDetail.file, // Already normalized at source
      criticalFunctions,
      patterns
    };
  }

  /**
   * Get all named functions from source file
   */
  private getAllNamedFunctions(sf: SourceFile): Node[] {
    const functions: Node[] = [];
    const processed = new WeakSet<Node>();
    
    // Function declarations
    const allFunctionDecls = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    allFunctionDecls.forEach(fn => {
      if (fn.getName() && fn.getBody() && !processed.has(fn)) {
        functions.push(fn);
        processed.add(fn);
      }
    });
    
    // Class members
    const allClasses = sf.getDescendantsOfKind(SyntaxKind.ClassDeclaration);
    allClasses.forEach(cls => {
      // Constructors
      cls.getConstructors().forEach(ctor => {
        if (ctor.getBody() && !processed.has(ctor)) {
          functions.push(ctor);
          processed.add(ctor);
        }
      });
      
      // Methods
      cls.getMethods().forEach(method => {
        if (method.getBody() && !method.isAbstract() && !processed.has(method)) {
          functions.push(method);
          processed.add(method);
        }
      });
      
      // Accessors
      cls.getGetAccessors().forEach(getter => {
        if (getter.getBody() && !processed.has(getter)) {
          functions.push(getter);
          processed.add(getter);
        }
      });
      
      cls.getSetAccessors().forEach(setter => {
        if (setter.getBody() && !processed.has(setter)) {
          functions.push(setter);
          processed.add(setter);
        }
      });
    });
    
    // Arrow functions and function expressions
    const allVariableDecls = sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    allVariableDecls.forEach(varDecl => {
      const initializer = varDecl.getInitializer();
      if (initializer && varDecl.getName() && !processed.has(initializer)) {
        const kind = initializer.getKind();
        if (kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.FunctionExpression) {
          functions.push(initializer);
          processed.add(initializer);
        }
      }
    });

    return functions;
  }

  /**
   * Extract only critical functions (high complexity, long, or problematic)
   */
  private extractCriticalFunctions(functions: Node[], content: string): FunctionContext[] {
    const criticalFunctions: FunctionContext[] = [];
    
    functions.forEach(node => {
      const name = getFunctionName(node);
      const complexity = calculateFunctionComplexity(node);
      const lineCount = getFunctionLineCount(node);
      const parameterCount = getFunctionParameterCount(node);
      
      // Only include critical functions based on industry standards
      if (complexity > (DEFAULT_THRESHOLDS.complexity.production.high || 15) || 
          lineCount > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES || 
          parameterCount > CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT) {
        const snippet = this.extractCleanSnippet(node, content);
        const issues = this.identifyFunctionIssues(node, complexity, lineCount, parameterCount);
        
        criticalFunctions.push({
          name,
          complexity,
          lineCount,
          parameterCount,
          snippet,
          issues  
        });
      }
    });
    
    // Sort by complexity and limit to top N critical functions
    return criticalFunctions
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, CONTEXT_EXTRACTION_THRESHOLDS.MAX_CRITICAL_FUNCTIONS);
  }

  /**
   * Detect file-level patterns organized by category in a single AST pass
   */
  private detectFilePatterns(sourceFile: SourceFile, content: string, filePath: string): FilePatterns {
    const patterns = new Set<string>();
    let maxNestingDepth = 0;
    let currentNestingDepth = 0;
    
    const visit = (node: Node) => {
      // Track nesting depth for blocks and control structures
      if (isNestingNode(node)) {
        currentNestingDepth++;
        maxNestingDepth = Math.max(maxNestingDepth, currentNestingDepth);
      }
      
      // Detect function-related patterns
      if (isFunctionNode(node)) {
        // Quality patterns
        if (getFunctionLineCount(node) > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES) patterns.add('long-function');
        if (calculateFunctionComplexity(node) > (DEFAULT_THRESHOLDS.complexity.production.high || 15)) patterns.add('high-complexity');
        if (getFunctionParameterCount(node) > CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT) patterns.add('too-many-params');
        
        // Architecture patterns - check for async modifier
        if (hasAsyncModifier(node)) {
          patterns.add('async-heavy');
        }
      }
      
      // Architecture patterns
      if (Node.isTryStatement(node) || Node.isCatchClause(node)) {
        patterns.add('error-handling');
      }
      
      // Continue visiting children
      node.forEachChild(visit);
      
      // Decrement nesting depth when exiting blocks
      if (isNestingNode(node)) {
        currentNestingDepth--;
      }
    };
    
    // Single AST traversal
    visit(sourceFile);
    
    // Add deep-nesting pattern based on calculated depth
    if (maxNestingDepth > CONTEXT_EXTRACTION_THRESHOLDS.NESTING_DEPTH) patterns.add('deep-nesting');
    
    // Content-based patterns (no AST traversal needed)
    if (this.isTypeScriptFile(filePath)) patterns.add('type-safe');
    if (this.hasIOOperations(content)) patterns.add('io-heavy');
    if (this.hasCaching(content)) patterns.add('caching');
    if (this.hasInputValidation(content)) patterns.add('input-validation');
    if (this.hasAuthChecks(content)) patterns.add('auth-check');
    if (this.isTestFile(filePath, content)) patterns.add('test-file');
    if (this.hasMocks(content)) patterns.add('mock-heavy');
    
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
  private extractCleanSnippet(node: Node, content: string): string {
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
  private identifyFunctionIssues(node: Node, complexity: number, lineCount: number, parameterCount: number): QualityIssue[] {
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
    
    if (this.hasDeepNestingInFunction(node)) {
      issues.push({
        type: 'deep-nesting',
        severity: 'medium',
        description: 'Deep nesting detected, consider extracting sub-functions'
      });
    }
    
    return issues;
  }

  /**
   * Detect deep nesting in a function using ts-morph
   */
  private hasDeepNestingInFunction(node: Node): boolean {
    let depth = 0;
    let maxDepth = 0;
    
    const visit = (n: Node) => {
      if (isNestingNode(n)) {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      }
      n.forEachChild(visit);
      if (isNestingNode(n)) {
        depth--;
      }
    };
    
    visit(node);
    return maxDepth > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_NESTING_DEPTH;
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
  private removeComments(content: string): string {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, ' ')  // Multi-line comments
      .replace(/\/\/.*$/gm, ' ')          // Single-line comments
      .replace(/\/\*.*$/gm, ' ')          // Unclosed multi-line comments at end
      .replace(/^.*\*\//gm, ' ');         // Unclosed multi-line comments at start
  }

  private isTypeScriptFile(filePath: string): boolean {
    return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
  }

  /**
   * Détecte les opérations I/O via regex sur le contenu.
   * LIMITATIONS : 
   * - Peut donner des faux positifs (mots dans strings)
   * - Peut manquer des abstractions (myFetch wrapping axios)
   * - Pour plus de précision, utiliser l'analyse AST/sémantique
   */
  private hasIOOperations(content: string): boolean {
    const codeOnly = this.removeComments(content);
    return /\b(readFile|writeFile|readFileSync|writeFileSync|fetch|axios|request|query|exec)\b/.test(codeOnly);
  }

  /**
   * Détecte les patterns de cache/memoization.
   * LIMITATIONS : Peut manquer les abstractions customs ou donner des faux positifs
   */
  private hasCaching(content: string): boolean {
    const codeOnly = this.removeComments(content);
    return /\b(cache|memoize|redis|localStorage|sessionStorage|Map|WeakMap|Set|WeakSet)\b/i.test(codeOnly);
  }

  /**
   * Détecte les patterns de validation d'input.
   * LIMITATIONS : Peut manquer les validations customs ou donner des faux positifs
   */
  private hasInputValidation(content: string): boolean {
    const codeOnly = this.removeComments(content);
    return /\b(validate|sanitize|escape|trim|filter)\b/i.test(codeOnly);
  }

  /**
   * Détecte les patterns d'authentification/autorisation.
   * LIMITATIONS : Peut manquer les implémentations customs ou donner des faux positifs
   */
  private hasAuthChecks(content: string): boolean {
    const codeOnly = this.removeComments(content);
    return /\b(auth|login|token|permission|role|access)\b/i.test(codeOnly);
  }

  private isTestFile(filePath: string, content: string): boolean {
    return filePath.includes('.test.') || filePath.includes('.spec.') || 
           /\b(describe|it|test|expect|jest|mocha)\b/.test(content);
  }

  /**
   * Détecte les patterns de mocking dans les tests.
   * LIMITATIONS : Peut manquer les frameworks de mock customs
   */
  private hasMocks(content: string): boolean {
    const codeOnly = this.removeComments(content);
    return /\b(mock|stub|spy|sinon|jest\.fn)\b/i.test(codeOnly);
  }
}

/**
 * Default context builder instance
 */
export const contextBuilder = new ContextBuilder();
