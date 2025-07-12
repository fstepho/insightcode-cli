// File: src/file-detail-builder.ts - FileDetail Construction Module

import { FileDetail, Issue, IssueType, Severity } from './types';
import { ASTBuildResult } from './ast-builder';
import { getConfig } from './config.manager';
import { SourceFile, SyntaxKind, Node } from 'ts-morph';
import { isFunctionLike } from './ast-helpers';

export interface FileDetailBuildOptions {
  projectPath: string;
}

/**
 * Extracts FileDetail information from AST data
 */
export class FileDetailBuilder {

  async build(astData: ASTBuildResult, options: FileDetailBuildOptions): Promise<FileDetail[]> {
    const fileDetails: FileDetail[] = [];

    for (const fileData of astData.files) {
      try {
        const fileDetail = this.buildFileDetail(fileData, options);
        fileDetails.push(fileDetail);
      } catch (error) {
        console.warn(`Warning: Could not build file detail for ${fileData.filePath}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return fileDetails;
  }

  private buildFileDetail(
    fileData: ASTBuildResult['files'][0], 
    _options: FileDetailBuildOptions
  ): FileDetail {
    const { filePath, sourceFile, content, relativePath } = fileData;
    
    // Use the already normalized relative path from AST builder
    const normalizedPath = relativePath;
    
    const loc = this.calculateLOC(content);
    const complexity = this.calculateComplexity(sourceFile);
    const functionCount = this.countFunctions(sourceFile);
    const fileType = this.classifyFileType(normalizedPath);
    const issues = this.extractIssues(sourceFile, complexity, loc, fileType);

    return {
      file: normalizedPath,
      absolutePath: filePath.startsWith('/') ? filePath : '/' + filePath,
      metrics: {
        complexity,
        loc,
        functionCount,
        duplicationRatio: 0, // Calculated later by duplication detection
      },
      issues,
      dependencies: {
        incomingDependencies: 0,
        outgoingDependencies: 0,
        instability: 0,
        cohesionScore: 0,
        percentileUsageRank: 0,
        isInCycle: false
      },
      healthScore: 0 // Calculated later
    };
  }

  /**
   * Count lines of code excluding comments and blank lines
   */
  private calculateLOC(content: string): number {
    const lines = content.split('\n');
    let inMultiLineComment = false;
    let codeLines = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (trimmed.length === 0) continue;
      
      // Handle multi-line comments
      if (trimmed.includes('/*') && trimmed.includes('*/')) {
        // Single line comment - skip if it's the only content
        const beforeComment = trimmed.substring(0, trimmed.indexOf('/*')).trim();
        const afterComment = trimmed.substring(trimmed.indexOf('*/') + 2).trim();
        if (beforeComment.length > 0 || afterComment.length > 0) {
          codeLines++;
        }
        continue;
      }
      
      if (trimmed.includes('/*')) {
        inMultiLineComment = true;
        // Check if there's code before the comment start
        const beforeComment = trimmed.substring(0, trimmed.indexOf('/*')).trim();
        if (beforeComment.length > 0) {
          codeLines++;
        }
        continue;
      }
      
      if (trimmed.includes('*/')) {
        inMultiLineComment = false;
        // If there's code after closing comment, count this line
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
    
    return Math.max(1, codeLines);
  }

  /**
   * Calculate cyclomatic complexity by summing all function complexities
   * 
   * @description
   * Implements cyclomatic complexity calculation by summing individual function
   * complexities. This metric helps identify code that may be difficult to test
   * and maintain.
   * 
   * @algorithm
   * Total complexity = Sum of all function complexities
   * Each function starts at 1 and increments for each decision point.
   * 
   * @note Different tools use different aggregation methods:
   * - Sum (used here): Total complexity = Σ(function complexities)
   * - Max: Highest individual function complexity
   * - Average: Mean complexity across all functions
   * - This implementation uses Sum, common in tools like ESLint
   * 
   * @complexity O(n) where n is the total number of nodes in the AST
   * 
   * @reference
   * - McCabe, T. J. (1976). "A Complexity Measure". IEEE Transactions on Software Engineering, SE-2(4), 308-320.
   * - Watson & McCabe (1996) NIST 500-235: 10 as upper limit for module complexity
   * - SonarQube default threshold: 10 for methods, 200 for files
   * - Common industry thresholds: 1-10 (low risk), 11-20 (moderate risk), 
   *   21-50 (high risk), >50 (very high risk)
   * 
   * @param sf - The source file to analyze
   * @returns Total cyclomatic complexity (sum of all function complexities)
   */
  private calculateComplexity(sf: SourceFile): number {
    let totalComplexity = 0;
    
    // Get all functions that contribute to file complexity
    const allFunctions = this.getAllNamedFunctions(sf);
    
    // Sum individual function complexities (aggregation principle)
    allFunctions.forEach(fn => {
      const fnComplexity = this.calculateFunctionComplexity(fn);
      totalComplexity += fnComplexity;
    });
    
    // Ensure minimum complexity of 1 (base complexity for any file)
    return Math.max(1, totalComplexity);
  }

  /**
   * Count named functions with implementations
   * 
   * @description
   * Counts executable functions - those with actual code bodies.
   * This metric helps assess code modularity and testing scope.
   * 
   * @approach
   * Only named functions with bodies are counted because:
   * 1. Anonymous functions are often implementation details
   * 2. Abstract methods have no implementation
   * 3. Function signatures (overloads) have no executable code
   * 
   * Many static analyzers exclude non-executable declarations
   * to focus metrics on actual code complexity.
   * 
   * @param sf - The source file to analyze
   * @returns Number of countable functions
   */
  private countFunctions(sf: SourceFile): number {
    return this.getAllNamedFunctions(sf).length;
  }

  /**
   * Extract all named functions with implementations from source file
   * 
   * @description
   * Identifies all "units of functionality" that contribute to complexity.
   * This includes regular functions, methods, constructors, and accessors.
   * 
   * @implementation-notes
   * - Uses WeakSet for O(1) duplicate detection
   * - Processes all function types defined in ECMAScript/TypeScript
   * - Includes nested functions (important for files like checker.ts)
   * - Each function type is processed separately for clarity
   * 
   * @edge-cases
   * - Anonymous functions in callbacks: Not counted
   * - IIFE (Immediately Invoked Function Expressions): Not counted unless assigned to variable
   * - Class property arrow functions: Counted if named
   * - Overloaded functions: Only implementation counted, not signatures
   * 
   * @param sf - The source file to analyze
   * @returns Array of function nodes with implementations
   */
  private getAllNamedFunctions(sf: SourceFile): Node[] {
    const functions: Node[] = [];
    const processed = new WeakSet<Node>(); // Prevent duplicate processing
    
    // 1. Function declarations
    // These are the primary units of functionality in JavaScript/TypeScript
    const allFunctionDecls = sf.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    allFunctionDecls.forEach(fn => {
      // Only count if: named (not anonymous) AND has implementation (not just signature)
      if (fn.getName() && fn.getBody() && !processed.has(fn)) {
        functions.push(fn);
        processed.add(fn);
      }
    });
    
    // 2. Class members
    // Object-oriented code complexity comes from methods
    const allClasses = sf.getDescendantsOfKind(SyntaxKind.ClassDeclaration);
    allClasses.forEach(cls => {
      // Constructors - initialization complexity
      cls.getConstructors().forEach(ctor => {
        if (ctor.getBody() && !processed.has(ctor)) {
          functions.push(ctor);
          processed.add(ctor);
        }
      });
      
      // Methods - behavior complexity (exclude abstract as they have no implementation)
      cls.getMethods().forEach(method => {
        if (method.getBody() && !method.isAbstract() && !processed.has(method)) {
          functions.push(method);
          processed.add(method);
        }
      });
      
      // Property accessors - encapsulation complexity
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
    
    // 3. Named arrow functions and function expressions
    // Modern JavaScript uses these extensively (ES6+)
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
   * Calculate cyclomatic complexity for a single function.
   * 
   * @description
   * Counts the number of linearly independent paths through a function.
   * Based on McCabe's original metric with additional decision points
   * commonly included in modern JavaScript/TypeScript analysis.
   * 
   * @algorithm
   * Starting from base complexity of 1, increment for each decision point.
   * This is mathematically equivalent to McCabe's graph-based formula (M = E - N + 2P)
   * but more practical for implementation.
   * 
   * Decision points counted:
   * - Conditional statements (if, ?: ternary)
   * - Loop constructs (for, while, do-while, for-in, for-of)
   * - Exception handling (catch, throw)
   * - Case clauses in switch statements
   * - Short-circuit logical operators (&&, ||)
   * 
   * @example
   * // Complexity = 1 (base)
   * function simple() { return 42; }
   * 
   * // Complexity = 3 (base + 2 conditions)
   * function moderate(x) {
   *   if (x > 0) {          // +1
   *     return x > 10;      // +1 (for the logical comparison)
   *   }
   *   return false;
   * }
   * 
   * @theoretical-foundation
   * Based on control flow graph analysis. Each decision point creates
   * a new path through the code, increasing testing complexity.
   * The metric counts linearly independent paths.
   * 
   * @implementation-details
   * This implementation includes:
   * - Traditional control structures (if, loops, switch cases)
   * - Exception handling (try-catch, throw)
   * - Logical operators with short-circuit evaluation (&&, ||)
   * - Ternary conditional operator (?:)
   * 
   * @implementation-variations
   * Tools may differ in counting:
   * - ESLint: Counts logical operators by default (as implemented here)
   * - JSHint: Optional logical operator counting
   * - PMD: Does not count logical operators
   * - SonarQube: Configurable, defaults similar to this implementation
   * 
   * @reference
   * - McCabe, T. J. (1976). "A Complexity Measure". IEEE Transactions on Software Engineering, SE-2(4), 308-320.
   * - Watson, A. H., & McCabe, T. J. (1996). "Structured Testing: A Testing Methodology 
   *   Using the Cyclomatic Complexity Metric". NIST Special Publication 500-235.
   * - ISO/IEC 25023:2016 - Software product quality metrics
   * - Chidamber & Kemerer (1994) - A Metrics Suite for Object Oriented Design
   * 
   * @param node - The function node to analyze
   * @returns Cyclomatic complexity score (minimum 1)
   */
  calculateFunctionComplexity(node: Node): number {
    let cc = 1; // Base complexity (single entry/exit path)
    
    node.forEachDescendant((n, traversal) => {
      // Critical: Skip nested functions to avoid double-counting
      // Each function's complexity is calculated independently
      if (n !== node && isFunctionLike(n)) {
        traversal.skip();
        return;
      }
      
      const kind = n.getKind();
      switch (kind) {
        // Conditional branching: creates two paths (true/false)
        case SyntaxKind.IfStatement:
          cc++;
          break;
          
        // Iteration constructs: create back-edge in control flow graph
        case SyntaxKind.WhileStatement:
        case SyntaxKind.DoStatement:
        case SyntaxKind.ForStatement:
        case SyntaxKind.ForInStatement:
        case SyntaxKind.ForOfStatement:
          cc++;
          break;
          
        // Exception handling: creates alternate execution path
        case SyntaxKind.CatchClause:
          cc++;
          break;
          
        // Ternary operator: inline conditional branching
        case SyntaxKind.ConditionalExpression:
          cc++;
          break;
          
        // Switch cases: each case is a distinct execution path
        // Common practice: count cases but not the switch statement itself
        case SyntaxKind.CaseClause:
        case SyntaxKind.DefaultClause:
          cc++;
          break;
          
        // Exception throwing: creates exit point
        case SyntaxKind.ThrowStatement:
          cc++;
          break;
          
        // Short-circuit evaluation: creates implicit branches
        // (a && b) has paths: a=false OR (a=true AND evaluate b)
        // (a || b) has paths: a=true OR (a=false AND evaluate b)
        case SyntaxKind.BinaryExpression: {
          const binExpr = n.asKindOrThrow(SyntaxKind.BinaryExpression);
          const op = binExpr.getOperatorToken().getKind();
          if (op === SyntaxKind.AmpersandAmpersandToken ||
              op === SyntaxKind.BarBarToken) {
            cc++;
          }
          break;
        }
      }
    });
    
    return cc;
  }

  private classifyFileType(filePath: string): 'production' | 'test' | 'example' | 'utility' | 'config' {
    // filePath is already normalized and relative
    const relativePath = filePath.toLowerCase();
    
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
   * Extract issues based on complexity and size thresholds
   * 
   * @description
   * Detects code quality issues by comparing metrics against configurable thresholds.
   * Issues are categorized by type (Complexity, Size) and severity (Critical, High, Medium).
   * 
   * @approach
   * Uses configuration-based thresholds that vary by file type:
   * - Production files: Stricter thresholds
   * - Test files: More lenient thresholds
   * - Utility/Config files: Moderate thresholds
   * 
   * @param sf - Source file for function-level issue detection
   * @param fileComplexity - Total file complexity score
   * @param fileLOC - File lines of code count
   * @param fileType - Classification of file type
   * @returns Array of detected issues
   */
  private extractIssues(sf: SourceFile, fileComplexity: number, fileLOC: number, fileType: string): Issue[] {
    const issues: Issue[] = [];
    const thresholds = getConfig();
    
    // Get thresholds for this file type
    const complexityThresholds = thresholds.complexity[fileType as keyof typeof thresholds.complexity] || thresholds.complexity.production;
    const sizeThresholds = thresholds.size[fileType as keyof typeof thresholds.size] || thresholds.size.production;
    
    // File-level complexity issues
    if (complexityThresholds.critical && fileComplexity > complexityThresholds.critical) {
      issues.push({
        type: IssueType.Complexity,
        severity: Severity.Critical,
        line: 1,
        threshold: complexityThresholds.critical,
        excessRatio: fileComplexity / complexityThresholds.critical
      });
    } else if (fileComplexity > complexityThresholds.high) {
      issues.push({
        type: IssueType.Complexity,
        severity: Severity.High,
        line: 1,
        threshold: complexityThresholds.high,
        excessRatio: fileComplexity / complexityThresholds.high
      });
    } else if (fileComplexity > complexityThresholds.medium) {
      issues.push({
        type: IssueType.Complexity,
        severity: Severity.Medium,
        line: 1,
        threshold: complexityThresholds.medium,
        excessRatio: fileComplexity / complexityThresholds.medium
      });
    }
    
    // File-level size issues
    if (sizeThresholds.critical && fileLOC > sizeThresholds.critical) {
      issues.push({
        type: IssueType.Size,
        severity: Severity.Critical,
        line: 1,
        threshold: sizeThresholds.critical,
        excessRatio: fileLOC / sizeThresholds.critical
      });
    } else if (fileLOC > sizeThresholds.high) {
      issues.push({
        type: IssueType.Size,
        severity: Severity.High,
        line: 1,
        threshold: sizeThresholds.high,
        excessRatio: fileLOC / sizeThresholds.high
      });
    } else if (fileLOC > sizeThresholds.medium) {
      issues.push({
        type: IssueType.Size,
        severity: Severity.Medium,
        line: 1,
        threshold: sizeThresholds.medium,
        excessRatio: fileLOC / sizeThresholds.medium
      });
    }

    // Function-level complexity issues (additional detection)
    sf.forEachDescendant(node => {
      if (node.getKind() === SyntaxKind.FunctionDeclaration) {
        const fn = node.asKind(SyntaxKind.FunctionDeclaration);
        if (fn) {
          const fnComplexity = this.calculateFunctionComplexity(fn);
          
          // Use same thresholds but scaled down for individual functions
          const fnThreshold = Math.max(10, Math.floor(complexityThresholds.high / 2));
          
          if (fnComplexity > fnThreshold) {
            issues.push({
              type: IssueType.Complexity,
              severity: fnComplexity > fnThreshold * 1.5 ? Severity.High : Severity.Medium,
              line: fn.getStartLineNumber(),
              threshold: fnThreshold,
              excessRatio: fnComplexity / fnThreshold,
              function: fn.getName() || 'anonymous'
            });
          }
        }
      }
    });

    return issues;
  }
}

/**
 * Default file detail builder instance
 */
export const fileDetailBuilder = new FileDetailBuilder();

/**
 * Utility function to calculate function complexity - exposed for reuse in other modules
 */
export function calculateFunctionComplexity(node: Node): number {
  return fileDetailBuilder.calculateFunctionComplexity(node);
}
