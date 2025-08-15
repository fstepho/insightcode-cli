// File: src/file-detail-builder.ts - FileDetail Construction Module

import * as path from 'path';
import { FileDetail, FileIssue } from './types';
import { ASTBuildResult } from './ast-builder';
import { COMPLEXITY_CONFIG, getComplexityConfig } from './scoring.utils';
import { FILE_SIZE_THRESHOLDS } from './thresholds.constants';
import { SourceFile, SyntaxKind, Node } from 'ts-morph';
import { isFunctionLike } from './ast-helpers';
import { functionAnalyzer } from './function-analyzer';

export interface FileDetailBuildOptions {
  projectPath: string;
}

// ========== PERFORMANCE OPTIMIZATION: CONSTANTS ==========
const FILE_TYPE_PATTERNS = {
  test: /\/(test|tests|__tests__|spec)\/|\.(?:test|spec|bench)\./i,
  example: /\/(example|demo|fixtures|mocks)\//i,
  utility: /\/(scripts|tools|utils|benchmark)\/|^(gulpfile|webpack|rollup|vite|makefile)\.|\.config\.(js|ts|mjs)$/i,
  config: /\.(config|rc)\.(js|ts|json)$|eslint\.config|prettier\.config|tsconfig|package\.json/i
} as const;

const SYNTAX_KIND_COMPLEXITY_MAP = new Map([
  [SyntaxKind.IfStatement, 1],
  [SyntaxKind.WhileStatement, 1],
  [SyntaxKind.DoStatement, 1],
  [SyntaxKind.ForStatement, 1],
  [SyntaxKind.ForInStatement, 1],
  [SyntaxKind.ForOfStatement, 1],
  [SyntaxKind.CatchClause, 1],
  [SyntaxKind.ConditionalExpression, 1],
  [SyntaxKind.CaseClause, 1],
  [SyntaxKind.DefaultClause, 1],
  [SyntaxKind.ThrowStatement, 1]
]);

const LOGICAL_OPERATORS = new Set([
  SyntaxKind.AmpersandAmpersandToken,
  SyntaxKind.BarBarToken
]);

// Cache for file type classification
const fileTypeCache = new Map<string, 'production' | 'test' | 'example' | 'utility' | 'config'>();

/**
 * Extracts FileDetail information from AST data
 */
class FileDetailBuilder {
  // Cache for repeated calculations
  private functionComplexityCache = new WeakMap<Node, number>();
  private processedFunctions = new WeakSet<Node>();
  private sourceFileMetricsCache = new WeakMap<SourceFile, { complexity: number; functionCount: number }>();

  async build(astData: ASTBuildResult, options: FileDetailBuildOptions): Promise<FileDetail[]> {
    const fileDetails: FileDetail[] = [];
    
    // Process files in parallel batches for better performance
    const batchSize = 10;
    for (let i = 0; i < astData.files.length; i += batchSize) {
      const batch = astData.files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(fileData => this.buildFileDetailSafe(fileData, options))
      );
      
      // Filter out null results from failed builds
      fileDetails.push(...batchResults.filter((detail): detail is FileDetail => detail !== null));
    }

    // Clear caches after processing to free memory
    this.clearCaches();

    return fileDetails;
  }

  private async buildFileDetailSafe(
    fileData: ASTBuildResult['files'][0],
    options: FileDetailBuildOptions
  ): Promise<FileDetail | null> {
    try {
      return this.buildFileDetail(fileData, options);
    } catch (error) {
      console.warn(`Warning: Could not build file detail for ${fileData.filePath}:`, 
        error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private buildFileDetail(
    fileData: ASTBuildResult['files'][0], 
    _options: FileDetailBuildOptions
  ): FileDetail {
    const fileStart = performance.now();
    const { filePath, sourceFile, content, relativePath } = fileData;
    
    // Use the already normalized relative path from AST builder
    const normalizedPath = relativePath;
    
    // Optimized calculations with caching
    const loc = this.calculateLOC(content);
    const { complexity, functionCount } = this.getSourceFileMetrics(sourceFile);
    const fileType = this.classifyFileTypeCached(normalizedPath);
    const { fileIssues } = this.extractIssues(sourceFile, complexity, loc, fileType, normalizedPath, functionCount);
    const functions = functionAnalyzer.buildFunctionAnalysis(sourceFile, normalizedPath);

    return {
      file: normalizedPath,
      absolutePath: filePath, // filePath is already absolute from AST builder
      metrics: {
        complexity,
        loc,
        functionCount,
        duplicationRatio: 0, // Calculated later by duplication detection
      },
      issues: fileIssues,
      functions,
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
   * Get complexity and function count with caching
   */
  private getSourceFileMetrics(sf: SourceFile): { complexity: number; functionCount: number } {
    if (this.sourceFileMetricsCache.has(sf)) {
      return this.sourceFileMetricsCache.get(sf)!;
    }

    const allFunctions = this.getAllNamedFunctions(sf);
    
    // Performance guard: Only estimate for EXTREMELY large files to maintain accuracy
    if (allFunctions.length > 500) {
      console.warn(`Extremely large file with ${allFunctions.length} functions, using sampling approach`);
      // Sample first 200 functions to get realistic average, then extrapolate
      const sampleSize = Math.min(200, allFunctions.length);
      let sampleComplexity = 0;
      for (let i = 0; i < sampleSize; i++) {
        sampleComplexity += this.calculateFunctionComplexityCached(allFunctions[i]);
      }
      const avgComplexity = sampleComplexity / sampleSize;
      const estimated = {
        complexity: Math.round(avgComplexity * allFunctions.length),
        functionCount: allFunctions.length
      };
      this.sourceFileMetricsCache.set(sf, estimated);
      return estimated;
    }
    
    // Calculate both metrics in one pass with timeout guard
    let totalComplexity = 0;
    const startTime = performance.now();
    for (let i = 0; i < allFunctions.length; i++) {
      totalComplexity += this.calculateFunctionComplexityCached(allFunctions[i]);
      
      // Smart timeout: use average of processed functions to estimate remaining
      if (i > 20 && (performance.now() - startTime) > 10000) { // 10s timeout, after at least 20 samples
        const avgComplexityPerFunction = totalComplexity / (i + 1);
        const remainingFunctions = allFunctions.length - i - 1;
        const estimatedRemaining = Math.round(avgComplexityPerFunction * remainingFunctions);
        console.warn(`Smart timeout: processed ${i + 1}/${allFunctions.length} functions (avg: ${avgComplexityPerFunction.toFixed(1)}), estimating remaining ${remainingFunctions} functions`);
        totalComplexity += estimatedRemaining;
        break;
      }
    }
    
    const metrics = {
      complexity: Math.max(1, totalComplexity),
      functionCount: allFunctions.length
    };

    this.sourceFileMetricsCache.set(sf, metrics);
    return metrics;
  }

  /**
   * Count lines of code excluding comments and blank lines - Optimized version
   */
  private calculateLOC(content: string): number {
    // Fast path for empty content
    if (!content || content.length === 0) return 1;
    
    let codeLines = 0;
    let inMultiLineComment = false;
    let i = 0;
    
    // Use single pass with character iteration instead of line splitting
    while (i < content.length) {
      // Skip to start of line content
      while (i < content.length && (content[i] === ' ' || content[i] === '\t')) {
        i++;
      }
      
      // Check if we're at end of line or file
      if (i >= content.length || content[i] === '\n') {
        if (i < content.length) i++; // Skip newline
        continue;
      }
      
      // Handle multi-line comment state
      if (inMultiLineComment) {
        // Look for end of comment
        const endIndex = content.indexOf('*/', i);
        if (endIndex !== -1) {
          inMultiLineComment = false;
          i = endIndex + 2;
          // Check if there's code after comment on same line
          while (i < content.length && content[i] !== '\n' && (content[i] === ' ' || content[i] === '\t')) {
            i++;
          }
          if (i < content.length && content[i] !== '\n') {
            codeLines++;
          }
        }
        // Skip to next line
        while (i < content.length && content[i] !== '\n') i++;
        if (i < content.length) i++;
        continue;
      }
      
      // Check for comment starts
      if (content[i] === '/') {
        if (i + 1 < content.length) {
          // Single line comment
          if (content[i + 1] === '/') {
            // Skip to next line
            while (i < content.length && content[i] !== '\n') i++;
            if (i < content.length) i++;
            continue;
          }
          // Multi-line comment start
          else if (content[i + 1] === '*') {
            // Check if there's code before comment
            let hasCodeBefore = false;
            for (let j = Math.max(0, i - 1); j >= 0 && content[j] !== '\n'; j--) {
              if (content[j] !== ' ' && content[j] !== '\t') {
                hasCodeBefore = true;
                break;
              }
            }
            if (hasCodeBefore) {
              codeLines++;
            }
            
            inMultiLineComment = true;
            i += 2;
            continue;
          }
        }
      }
      
      // This is a code line
      codeLines++;
      
      // Skip to next line
      while (i < content.length && content[i] !== '\n') i++;
      if (i < content.length) i++;
    }
    
    return Math.max(1, codeLines);
  }


  /**
   * Extract all named functions with implementations - Optimized version
   */
  private getAllNamedFunctions(sf: SourceFile): Node[] {
    const functions: Node[] = [];
    const processed = new WeakSet<Node>(); // Local set for this call only
    
    // Process all descendants in single pass
    const descendants = sf.getDescendants();
    
    for (const node of descendants) {
      // Skip if already processed
      if (processed.has(node)) continue;
      
      const kind = node.getKind();
      
      // Function declarations
      if (kind === SyntaxKind.FunctionDeclaration) {
        const fn = node as any;
        if (fn.getName && fn.getName() && fn.getBody && fn.getBody()) {
          functions.push(node);
          processed.add(node);
        }
      }
      // Constructors
      else if (kind === SyntaxKind.Constructor) {
        const ctor = node as any;
        if (ctor.getBody && ctor.getBody()) {
          functions.push(node);
          processed.add(node);
        }
      }
      // Methods
      else if (kind === SyntaxKind.MethodDeclaration) {
        const method = node as any;
        // Check if method has implementation (body or is not abstract)
        const hasBody = method.getBody && method.getBody();
        const isAbstract = method.isAbstract && method.isAbstract();
        
        // For methods without explicit body, check if they have braces in their text (one-liners)
        let hasImplementation = hasBody;
        if (!hasBody && !isAbstract) {
          const text = method.getText && method.getText();
          if (text && text.includes('{') && text.includes('}')) {
            hasImplementation = true;
          }
        }
        
        if (hasImplementation && !isAbstract) {
          functions.push(node);
          processed.add(node);
        }
      }
      // Getters
      else if (kind === SyntaxKind.GetAccessor) {
        const getter = node as any;
        if (getter.getBody && getter.getBody()) {
          functions.push(node);
          processed.add(node);
        }
      }
      // Setters
      else if (kind === SyntaxKind.SetAccessor) {
        const setter = node as any;
        if (setter.getBody && setter.getBody()) {
          functions.push(node);
          processed.add(node);
        }
      }
      // Arrow functions and function expressions in variable declarations
      else if (kind === SyntaxKind.VariableDeclaration) {
        const varDecl = node as any;
        const initializer = varDecl.getInitializer && varDecl.getInitializer();
        if (initializer && varDecl.getName && varDecl.getName() && !processed.has(initializer)) {
          const initKind = initializer.getKind();
          if (initKind === SyntaxKind.ArrowFunction || initKind === SyntaxKind.FunctionExpression) {
            functions.push(initializer);
            processed.add(initializer);
          }
        }
      }
    }

    return functions;
  }

  /**
   * Calculate cyclomatic complexity for a single function with caching
   */
  private calculateFunctionComplexityCached(node: Node): number {
    if (this.functionComplexityCache.has(node)) {
      return this.functionComplexityCache.get(node)!;
    }
    
    const complexity = this.calculateFunctionComplexity(node);
    
    this.functionComplexityCache.set(node, complexity);
    return complexity;
  }

  /**
   * Optimized complexity calculation using lookup tables
   */
  public calculateFunctionComplexity(node: Node): number {
    let cc = 1; // Base complexity
    
    // Use iterative traversal with early exit
    const nodesToVisit: Node[] = [node];
    const visited = new Set<Node>();
    
    while (nodesToVisit.length > 0) {
      const current = nodesToVisit.pop()!;
      
      // Skip if already visited
      if (visited.has(current)) continue;
      visited.add(current);
      
      // Skip nested functions
      if (current !== node && isFunctionLike(current)) {
        continue;
      }
      
      const kind = current.getKind();
      
      // Use map lookup for common cases
      const complexityIncrement = SYNTAX_KIND_COMPLEXITY_MAP.get(kind);
      if (complexityIncrement !== undefined) {
        cc += complexityIncrement;
      }
      // Handle binary expressions separately
      else if (kind === SyntaxKind.BinaryExpression) {
        const binExpr = current as any;
        const opKind = binExpr.getOperatorToken().getKind();
        if (LOGICAL_OPERATORS.has(opKind)) {
          cc++;
        }
      }
      
      // Add children to visit
      const children = current.getChildren();
      for (let i = children.length - 1; i >= 0; i--) {
        nodesToVisit.push(children[i]);
      }
    }
    
    return cc;
  }

  /**
   * Classify file type with caching
   */
  private classifyFileTypeCached(filePath: string): 'production' | 'test' | 'example' | 'utility' | 'config' {
    // Check cache first
    if (fileTypeCache.has(filePath)) {
      return fileTypeCache.get(filePath)!;
    }
    
    const fileType = this.classifyFileType(filePath);
    fileTypeCache.set(filePath, fileType);
    return fileType;
  }

  /**
   * Optimized file type classification using pre-compiled regexes
   */
  private classifyFileType(filePath: string): 'production' | 'test' | 'example' | 'utility' | 'config' {
    const lowerPath = filePath.toLowerCase();
    
    // Check patterns in order of likelihood
    if (FILE_TYPE_PATTERNS.test.test(lowerPath)) return 'test';
    if (FILE_TYPE_PATTERNS.config.test(lowerPath)) return 'config';
    if (FILE_TYPE_PATTERNS.utility.test(lowerPath)) return 'utility';
    if (FILE_TYPE_PATTERNS.example.test(lowerPath)) return 'example';
    
    return 'production';
  }

  /**
   * Extract issues based on complexity and size thresholds
   */
  private extractIssues(
    sf: SourceFile, 
    fileComplexity: number, 
    fileLOC: number, 
    fileType: string, 
    filePath: string,
    functionCount: number
  ): { fileIssues: FileIssue[] } {
    const fileIssues: FileIssue[] = [];
    
    // Pre-create location object for reuse
    const location = { file: filePath, line: 1 };
    
    // File-level complexity issues
    if (fileComplexity > COMPLEXITY_CONFIG[0].maxThreshold) {
      const complexityConfig = getComplexityConfig(fileComplexity);
      
      let complexityIssueType: 'critical-file-complexity' | 'high-file-complexity' | 'complexity';
      if (complexityConfig.severity === 'critical') {
        complexityIssueType = 'critical-file-complexity';
      } else if (complexityConfig.severity === 'high') {
        complexityIssueType = 'high-file-complexity';
      } else {
        complexityIssueType = 'complexity';
      }

      fileIssues.push({
        type: complexityIssueType,
        severity: complexityConfig.severity,
        location,
        description: `File complexity ${fileComplexity} exceeds ${complexityConfig.severity} threshold`,
        threshold: complexityConfig.maxThreshold,
        actualValue: fileComplexity,
        excessRatio: fileComplexity / complexityConfig.maxThreshold
      });
    }
    
    // File-level size issues - check from largest to smallest
    if (fileLOC > FILE_SIZE_THRESHOLDS.EXTREMELY_LARGE) {
      fileIssues.push({
        type: 'very-large-file',
        severity: 'critical',
        location,
        description: `File size ${fileLOC} lines exceeds critical threshold`,
        threshold: FILE_SIZE_THRESHOLDS.EXTREMELY_LARGE,
        actualValue: fileLOC,
        excessRatio: fileLOC / FILE_SIZE_THRESHOLDS.EXTREMELY_LARGE
      });
    } else if (fileLOC > FILE_SIZE_THRESHOLDS.LARGE) {
      fileIssues.push({
        type: 'large-file',
        severity: 'high',
        location,
        description: `File size ${fileLOC} lines exceeds high threshold`,
        threshold: FILE_SIZE_THRESHOLDS.LARGE,
        actualValue: fileLOC,
        excessRatio: fileLOC / FILE_SIZE_THRESHOLDS.LARGE
      });
    } else if (fileLOC > 200) {
      fileIssues.push({
        type: 'large-file',
        severity: 'medium',
        location,
        description: `File size ${fileLOC} lines exceeds medium threshold`,
        threshold: 200,
        actualValue: fileLOC,
        excessRatio: fileLOC / 200
      });
    }
    
    // Too many functions issue
    if (functionCount > 15) {
      fileIssues.push({
        type: 'too-many-functions',
        severity: functionCount > 20 ? 'high' : 'medium',
        location,
        description: `Too many functions in file (${functionCount})`,
        threshold: 15,
        actualValue: functionCount,
        excessRatio: functionCount / 15
      });
    }

    return { fileIssues };
  }

  /**
   * Clear all internal caches to free memory
   */
  private clearCaches(): void {
    this.functionComplexityCache = new WeakMap();
    this.processedFunctions = new WeakSet();
    this.sourceFileMetricsCache = new WeakMap();
    // Note: fileTypeCache is global and persists across builds for better performance
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