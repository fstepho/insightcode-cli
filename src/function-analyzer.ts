// File: src/function-analyzer.ts - Dedicated Function Analysis Module

import { SourceFile, Node, SyntaxKind } from 'ts-morph';
import { FunctionAnalysis, FunctionIssue } from './types';
import {
  getFunctionName,
  getFunctionLineCount,
  getFunctionParameterCount,
  getMaxNestingDepth,
  checkFunctionNaming,
  hasImpureOperations,
  countResponsibilities,
  countDistinctOperations,
  analyzeResponsibilities,
  clearCache
} from './ast-helpers';
import { CONTEXT_EXTRACTION_THRESHOLDS } from './thresholds.constants';
import { COMPLEXITY_LEVELS } from './scoring.utils';
import { calculateFunctionComplexity } from './file-detail-builder';

// ========== CONFIGURATION CONSTANTS ==========
const ANALYSIS_THRESHOLDS = {
  GOD_FUNCTION_OPERATIONS: 20,
  GOD_FUNCTION_COMPLEXITY: 30,
  GOD_FUNCTION_LINES: 100,
  GOD_FUNCTION_MIN_CRITERIA: 2,
  
  NOTABLE_COMPLEXITY: 5,
  NOTABLE_LINES: 20,
  NOTABLE_PARAMS: 3,
  
  HIGH_PARAM_COUNT: 7,
  ERROR_HANDLING_RATIO: 0.2,
  
  // Cache settings
  BATCH_SIZE: 50 // Process functions in batches to manage memory
} as const;

/**
 * Dedicated analyzer for building comprehensive function analysis
 * Centralizes all function-level analysis logic in one place
 */
class FunctionAnalyzer {
  private functionCache = new WeakMap<Node, FunctionAnalysis>();
  private processedNodes = new WeakSet<Node>();

  /**
   * Build comprehensive function analysis from source file
   * Optimized with batching and caching
   */
  buildFunctionAnalysis(sf: SourceFile, filePath: string): FunctionAnalysis[] {
    const functions: FunctionAnalysis[] = [];
    const allFunctions = this.getAllNamedFunctions(sf);

    // Process in batches to manage memory
    const batches = this.createBatches(allFunctions, ANALYSIS_THRESHOLDS.BATCH_SIZE);
    
    const startTime = performance.now();
    for (const batch of batches) {
      const batchResults = this.processBatch(batch, filePath);
      functions.push(...batchResults);
      
      // Global timeout guard - don't spend more than 30s on any single file
      if (performance.now() - startTime > 30000) {
        console.warn(`Function analysis timeout for ${filePath}, processed ${functions.length}/${allFunctions.length} functions`);
        break;
      }
      
      // Clear AST helper cache periodically to prevent memory buildup
      if (functions.length % (ANALYSIS_THRESHOLDS.BATCH_SIZE * 2) === 0) {
        clearCache();
      }
    }
    
    // Final cache clear
    clearCache();
    
    return functions;
  }

  /**
   * Process a batch of functions
   */
  private processBatch(batch: Node[], filePath: string): FunctionAnalysis[] {
    const results: FunctionAnalysis[] = [];
    
    for (const node of batch) {
      // Check cache first
      if (this.functionCache.has(node)) {
        const cached = this.functionCache.get(node)!;
        results.push(cached);
        continue;
      }
      
      const analysis = this.analyzeSingleFunction(node, filePath);
      
      if (analysis) {
        this.functionCache.set(node, analysis);
        results.push(analysis);
      }
    }
    
    return results;
  }

  /**
   * Analyze a single function
   */
  private analyzeSingleFunction(node: Node, filePath: string): FunctionAnalysis | null {
    const name = getFunctionName(node);
    const line = node.getStartLineNumber();
    const endLine = node.getEndLineNumber();
    
    // Get basic metrics for all functions
    const loc = getFunctionLineCount(node);
    
    const complexity = calculateFunctionComplexity(node);
    const parameterCount = getFunctionParameterCount(node);

    // Calculate additional metrics
    const nestingDepth = getMaxNestingDepth(node);
    
    // Identify issues
    const issues = this.identifyFunctionIssues(node, complexity, loc, parameterCount, filePath);

    // Return analysis for ALL functions (no longer filter by notability)
    return {
      name,
      line,
      endLine,
      complexity,
      loc,
      parameterCount,
      issues,
      snippet: this.shouldIncludeSnippet(issues) ? this.extractCleanSnippet(node) : undefined,
      metrics: {
        nestingDepth
      }
    };
  }

  /**
   * Create batches from function list
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }


  /**
   * Extract all named functions with implementations from source file
   * Optimized with Set for deduplication
   */
  private getAllNamedFunctions(sf: SourceFile): Node[] {
    const functions: Node[] = [];
    const processed = new WeakSet<Node>(); // Local set for this call only

    // Function declarations
    const functionDecls = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    for (const fn of functionDecls) {
      if (fn.getName() && fn.getBody() && !processed.has(fn)) {
        functions.push(fn);
        processed.add(fn);
      }
    }

    // Class members
    const classDecls = sf.getDescendantsOfKind(SyntaxKind.ClassDeclaration);
    for (const cls of classDecls) {
      // Constructors
      const constructors = cls.getConstructors();
      for (const ctor of constructors) {
        if (ctor.getBody() && !processed.has(ctor)) {
          functions.push(ctor);
          processed.add(ctor);
        }
      }
      
      // Methods
      const methods = cls.getMethods();
      for (const method of methods) {
        if (method.getBody() && !method.isAbstract() && !processed.has(method)) {
          functions.push(method);
          processed.add(method);
        }
      }
      
      // Get accessors
      const getAccessors = cls.getGetAccessors();
      for (const getter of getAccessors) {
        if (getter.getBody() && !processed.has(getter)) {
          functions.push(getter);
          processed.add(getter);
        }
      }
      
      // Set accessors
      const setAccessors = cls.getSetAccessors();
      for (const setter of setAccessors) {
        if (setter.getBody() && !processed.has(setter)) {
          functions.push(setter);
          processed.add(setter);
        }
      }
    }

    // Arrow functions and function expressions
    const variableDecls = sf.getDescendantsOfKind(SyntaxKind.VariableDeclaration);
    for (const varDecl of variableDecls) {
      const initializer = varDecl.getInitializer();
      if (initializer && varDecl.getName() && !processed.has(initializer)) {
        const kind = initializer.getKind();
        if (kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.FunctionExpression) {
          functions.push(initializer);
          processed.add(initializer);
        }
      }
    }

    return functions;
  }

  /**
   * Comprehensive function issue identification - Optimized
   */
  private identifyFunctionIssues(
    node: Node,
    complexity: number,
    lineCount: number,
    parameterCount: number,
    filePath: string
  ): FunctionIssue[] {
    const issues: FunctionIssue[] = [];
    const functionName = getFunctionName(node);
    const startLine = node.getStartLineNumber();
    
    // PERFORMANCE GUARD: Skip expensive analysis for massive functions
    if (lineCount > 5000) {
      console.warn(`Skipping detailed analysis for massive function: ${functionName} (${lineCount} lines)`);
      // Just add a god-function issue and return early
      issues.push({
        type: 'god-function',
        severity: 'critical',
        location: { file: filePath, line: startLine, function: functionName },
        description: `Massive function with ${lineCount} lines - analysis skipped for performance`,
        threshold: 100,
        actualValue: lineCount,
        excessRatio: lineCount / 100
      });
      return issues;
    }
    
    // Special guard for compiler files - they tend to have very complex but well-structured functions
    const isCompilerFile = filePath.includes('compiler/') || filePath.includes('checker.ts') || filePath.includes('emitter.ts');
    const maxAnalysisSize = isCompilerFile ? 500 : 1000;
    
    // Pre-create location object for reuse
    const location = {
      file: filePath,
      line: startLine,
      function: functionName
    };

    // === COMPLEXITY CHECKS (ordered by severity) ===
    
    // Critical complexity
    const criticalThreshold = COMPLEXITY_LEVELS.veryHigh.maxThreshold;
    if (complexity > criticalThreshold) {
      issues.push({
        type: 'critical-complexity',
        severity: 'critical',
        location,
        description: `Complexity ${complexity} exceeds critical threshold of ${criticalThreshold}`,
        threshold: criticalThreshold,
        actualValue: complexity,
        excessRatio: complexity / criticalThreshold
      });
    } 
    // High complexity
    else {
      const highThreshold = COMPLEXITY_LEVELS.high.maxThreshold;
      if (complexity > highThreshold) {
        issues.push({
          type: 'high-complexity',
          severity: 'high',
          location,
          description: `Complexity ${complexity} exceeds recommended threshold of ${highThreshold}`,
          threshold: highThreshold,
          actualValue: complexity,
          excessRatio: complexity / highThreshold
        });
      }
      // Medium complexity
      else {
        const mediumThreshold = COMPLEXITY_LEVELS.medium.maxThreshold;
        if (complexity > mediumThreshold) {
          issues.push({
            type: 'medium-complexity',
            severity: 'medium',
            location,
            description: `Complexity ${complexity} exceeds medium threshold of ${mediumThreshold}`,
            threshold: mediumThreshold,
            actualValue: complexity,
            excessRatio: complexity / mediumThreshold
          });
        }
      }
    }

    // === LENGTH CHECKS ===
    
    const criticalLineThreshold = CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES * 2;
    const normalLineThreshold = CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES;
    
    if (lineCount > criticalLineThreshold) {
      issues.push({
        type: 'long-function',
        severity: 'high',
        location,
        description: `Function has ${lineCount} lines, consider breaking into smaller functions`,
        threshold: criticalLineThreshold,
        actualValue: lineCount,
        excessRatio: lineCount / criticalLineThreshold
      });
    } else if (lineCount > normalLineThreshold) {
      issues.push({
        type: 'long-function',
        severity: 'medium',
        location,
        description: `Function has ${lineCount} lines, consider splitting for better maintainability`,
        threshold: normalLineThreshold,
        actualValue: lineCount,
        excessRatio: lineCount / normalLineThreshold
      });
    }

    // === PARAMETER CHECKS ===
    
    const paramThreshold = CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT;
    if (parameterCount > paramThreshold) {
      issues.push({
        type: 'too-many-params',
        severity: parameterCount > ANALYSIS_THRESHOLDS.HIGH_PARAM_COUNT ? 'high' : 'medium',
        location,
        description: `${parameterCount} parameters, consider using object parameter or builder pattern`,
        threshold: paramThreshold,
        actualValue: parameterCount,
        excessRatio: parameterCount / paramThreshold
      });
    }

    // === STRUCTURAL CHECKS (expensive, do last) ===
    
    // Only check these for functions that aren't already flagged as too complex
    if (!issues.some(i => i.type.includes('complexity') && i.severity === 'critical')) {
      
      // Calculate expensive values once
      const maxDepth = getMaxNestingDepth(node);
      const operationCount = countDistinctOperations(node);
      
      // Deep nesting
      const nestingThreshold = CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_NESTING_DEPTH;
      if (maxDepth > nestingThreshold) {
        issues.push({
          type: 'deep-nesting',
          severity: 'medium',
          location,
          description: `Deep nesting detected (depth: ${maxDepth}), consider extracting sub-functions or using early returns`,
          threshold: nestingThreshold,
          actualValue: maxDepth,
          excessRatio: maxDepth / nestingThreshold
        });
      }

      // God Function - pass pre-calculated operationCount
      if (this.isGodFunction(node, complexity, lineCount, operationCount)) {
        issues.push({
          type: 'god-function',
          severity: 'high',
          location,
          description: `Function does too much - Operations: ${operationCount} (complexity: ${complexity}, lines: ${lineCount})`,
          threshold: ANALYSIS_THRESHOLDS.GOD_FUNCTION_OPERATIONS,
          actualValue: operationCount,
          excessRatio: operationCount / ANALYSIS_THRESHOLDS.GOD_FUNCTION_OPERATIONS
        });
      }

      // Single Responsibility (expensive check) - skip for large functions
      if (lineCount < maxAnalysisSize) {
        const responsibilities = countResponsibilities(node);
        if (responsibilities > 1) {
          const analysis = analyzeResponsibilities(node);
          const responsibilityList = Array.from(analysis.responsibilities).join(', ');

        issues.push({
          type: 'multiple-responsibilities',
          severity: responsibilities > 2 ? 'high' : 'medium',
          location,
          description: `Function has ${responsibilities} distinct responsibilities (${responsibilityList}), violates Single Responsibility Principle`,
          threshold: 1,
          actualValue: responsibilities,
          excessRatio: responsibilities
        });
        }
      }

      // Code quality checks (less critical) - skip for large functions  
      if (issues.length < 3 && lineCount < maxAnalysisSize) { // Only check if not already many issues and function is reasonable size
        
        // Impure function
        if (hasImpureOperations(node)) {
          issues.push({
            type: 'impure-function',
            severity: 'low',
            location,
            description: 'Function has side effects or depends on external state'
          });
        }

        // Poor naming
        const namingIssue = checkFunctionNaming(node);
        if (namingIssue) {
          issues.push({
            type: 'poorly-named',
            severity: 'low',
            location,
            description: namingIssue
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detect if function is a "God Function" - Optimized
   */
  private isGodFunction(node: Node, complexity: number, lineCount: number, operationCount?: number): boolean {
    // Fast path: if clearly not a god function
    if (complexity < 10 && lineCount < 50) {
      return false;
    }
    
    // Use provided operationCount or calculate if not provided
    const operations = operationCount ?? countDistinctOperations(node);

    // Check criteria
    let failedCriteria = 0;
    if (complexity > ANALYSIS_THRESHOLDS.GOD_FUNCTION_COMPLEXITY) failedCriteria++;
    if (lineCount > ANALYSIS_THRESHOLDS.GOD_FUNCTION_LINES) failedCriteria++;
    if (operations > ANALYSIS_THRESHOLDS.GOD_FUNCTION_OPERATIONS) failedCriteria++;

    return failedCriteria >= ANALYSIS_THRESHOLDS.GOD_FUNCTION_MIN_CRITERIA;
  }


  /**
   * Determine if snippet should be included based on issue severity
   */
  private shouldIncludeSnippet(issues: FunctionIssue[]): boolean {
    // Fast check with early exit
    for (const issue of issues) {
      if (issue.severity === 'critical' || issue.severity === 'high') {
        return true;
      }
    }
    return false;
  }

  /**
   * Extract a clean, focused snippet - Optimized
   */
  private extractCleanSnippet(node: Node): string {
    const fullText = node.getText();
    const lines = fullText.split('\n');
    
    // Fast filter and slice
    const cleanLines: string[] = [];
    let count = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('//')) {
        cleanLines.push(line);
        count++;
        if (count >= CONTEXT_EXTRACTION_THRESHOLDS.SNIPPET_LINES) {
          break;
        }
      }
    }

    if (lines.length > CONTEXT_EXTRACTION_THRESHOLDS.SNIPPET_THRESHOLD) {
      cleanLines.push('  // ... more code ...');
    }

    return cleanLines.join('\n');
  }


  /**
   * Clear internal caches
   */
  public clearCaches(): void {
    this.functionCache = new WeakMap();
    this.processedNodes = new WeakSet();
    clearCache(); // Clear AST helper cache
  }
}

/**
 * Default function analyzer instance
 */
export const functionAnalyzer = new FunctionAnalyzer();