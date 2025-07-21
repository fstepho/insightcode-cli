// File: src/function-analyzer.ts - Dedicated Function Analysis Module

import { SourceFile, Node, SyntaxKind } from 'ts-morph';
import { FunctionAnalysis, FunctionIssue } from './types';
import { 
  getFunctionName, 
  getFunctionLineCount, 
  getFunctionParameterCount,
  hasAsyncModifier,
  isNestingNode
} from './ast-helpers';
import { calculateFunctionComplexity } from './file-detail-builder';
import { CONTEXT_EXTRACTION_THRESHOLDS } from './thresholds.constants';
import { COMPLEXITY_LEVELS } from './scoring.utils';

/**
 * Dedicated analyzer for building comprehensive function analysis
 * Centralizes all function-level analysis logic in one place
 */
class FunctionAnalyzer {

  /**
   * Build comprehensive function analysis from source file
   * Combines metrics calculation with issue detection
   */
  buildFunctionAnalysis(sf: SourceFile, filePath: string): FunctionAnalysis[] {
    const functions: FunctionAnalysis[] = [];
    const allFunctions = this.getAllNamedFunctions(sf);

    allFunctions.forEach(node => {
      const name = getFunctionName(node);
      const line = node.getStartLineNumber();
      const endLine = node.getEndLineNumber();
      const complexity = calculateFunctionComplexity(node);
      const loc = getFunctionLineCount(node);
      const parameterCount = getFunctionParameterCount(node);
      
      // Identify all issues for this function
      const issues = this.identifyFunctionIssues(node, complexity, loc, parameterCount, filePath);

      // Only include functions that have issues or are above basic thresholds
      if (issues.length > 0 || this.isFunctionNotable(complexity, loc, parameterCount)) {
        functions.push({
          name,
          line,
          endLine,
          complexity,
          loc,
          parameterCount,
          issues,
          snippet: this.shouldIncludeSnippet(issues) ? this.extractCleanSnippet(node) : undefined
        });
      }
    });

    return functions;
  }

  /**
   * Extract all named functions with implementations from source file
   * Reused from file-detail-builder.ts logic
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
   * Comprehensive function issue identification
   * Reused and adapted from context-builder.ts
   */
  private identifyFunctionIssues(
    node: Node,
    complexity: number,
    lineCount: number,
    parameterCount: number,
    filePath: string
  ): FunctionIssue[] {
    const issues: FunctionIssue[] = [];

    // === QUALITY PATTERNS ===

    // High Complexity Pattern
    if (complexity > (COMPLEXITY_LEVELS.veryHigh.maxThreshold)) {
      issues.push({
        type: 'critical-complexity',
        severity: 'critical',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `Complexity ${complexity} exceeds critical threshold of ${COMPLEXITY_LEVELS.veryHigh.maxThreshold}`,
        threshold: COMPLEXITY_LEVELS.veryHigh.maxThreshold,
        excessRatio: complexity / (COMPLEXITY_LEVELS.veryHigh.maxThreshold)
      });
    } else if (complexity > (COMPLEXITY_LEVELS.high.maxThreshold)) {
      issues.push({
        type: 'high-complexity',
        severity: 'high',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `Complexity ${complexity} exceeds recommended threshold of ${COMPLEXITY_LEVELS.high.maxThreshold}`,
        threshold: COMPLEXITY_LEVELS.high.maxThreshold,
        excessRatio: complexity / (COMPLEXITY_LEVELS.high.maxThreshold)
      });
    } else if (complexity > (COMPLEXITY_LEVELS.low.maxThreshold)) {
      issues.push({
        type: 'medium-complexity',
        severity: 'medium',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `Complexity ${complexity} exceeds medium threshold of ${COMPLEXITY_LEVELS.low.maxThreshold}`,
        threshold: COMPLEXITY_LEVELS.low.maxThreshold,
        excessRatio: complexity / (COMPLEXITY_LEVELS.low.maxThreshold)
      });
    }

    // Long Function Pattern
    if (lineCount > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES * 2) {
      issues.push({
        type: 'long-function',
        severity: 'high',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `Function has ${lineCount} lines, consider breaking into smaller functions`,
        threshold: CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES * 2,
        excessRatio: lineCount / (CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES * 2)
      });
    } else if (lineCount > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES) {
      issues.push({
        type: 'long-function',
        severity: 'medium',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `Function has ${lineCount} lines, consider splitting for better maintainability`,
        threshold: CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES,
        excessRatio: lineCount / CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES
      });
    }

    // Too Many Parameters
    if (parameterCount > CONTEXT_EXTRACTION_THRESHOLDS.PARAMETER_COUNT) {
      issues.push({
        type: 'too-many-params',
        severity: parameterCount > 7 ? 'high' : 'medium',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `${parameterCount} parameters, consider using object parameter or builder pattern`
      });
    }

    // Deep Nesting Pattern
    if (this.hasDeepNestingInFunction(node)) {
      issues.push({
        type: 'deep-nesting',
        severity: 'medium',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: 'Deep nesting detected, consider extracting sub-functions or using early returns'
      });
    }

    // === ADVANCED QUALITY PATTERNS ===

    // Async Pattern Detection
    if (hasAsyncModifier(node)) {
      issues.push({
        type: 'async-heavy',
        severity: 'low',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: 'Function uses async/await pattern'
      });
    }

    // God Function (does too much)
    if (this.isGodFunction(node, complexity, lineCount)) {
      issues.push({
        type: 'god-function',
        severity: 'high',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: 'Function does too much - high complexity, many lines, and multiple responsibilities'
      });
    }

    // Single Responsibility Violation
    const responsibilities = this.countResponsibilities(node);
    if (responsibilities > 1) {
      issues.push({
        type: 'multiple-responsibilities',
        severity: responsibilities > 2 ? 'high' : 'medium',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: `Function has ${responsibilities} distinct responsibilities, violates Single Responsibility Principle`
      });
    }

    // Impure Function (has side effects)
    if (this.hasImpureOperations(node)) {
      issues.push({
        type: 'impure-function',
        severity: 'low',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: 'Function has side effects or depends on external state'
      });
    }

    // Poor Naming
    const namingIssue = this.checkFunctionNaming(node);
    if (namingIssue) {
      issues.push({
        type: 'poorly-named',
        severity: 'low',
        location: {
          file: filePath,
          line: node.getStartLineNumber(),
          function: getFunctionName(node)
        },
        description: namingIssue
      });
    }

    return issues;
  }

  /**
   * Determine if function is notable enough to include in analysis
   */
  private isFunctionNotable(complexity: number, loc: number, parameterCount: number): boolean {
    return complexity > 5 || 
           loc > 20 || 
           parameterCount > 3;
  }

  /**
   * Determine if snippet should be included based on issue severity
   */
  private shouldIncludeSnippet(issues: FunctionIssue[]): boolean {
    return issues.some(issue => issue.severity === 'critical' || issue.severity === 'high');
  }

  /**
   * Extract a clean, focused snippet of a function
   */
  private extractCleanSnippet(node: Node): string {
    const fullText = node.getText();
    const lines = fullText.split('\n')
      .filter(line => line.trim() && !line.trim().startsWith('//'))
      .slice(0, CONTEXT_EXTRACTION_THRESHOLDS.SNIPPET_LINES);

    if (fullText.split('\n').length > CONTEXT_EXTRACTION_THRESHOLDS.SNIPPET_THRESHOLD) {
      lines.push('  // ... more code ...');
    }

    return lines.join('\n');
  }

  /**
   * Check for deep nesting within a function
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


  /**
   * Detect if function is a "God Function" (does too much)
   */
  private isGodFunction(node: Node, complexity: number, lineCount: number): boolean {
    // God function = high complexity + many lines + multiple operations
    const highComplexity = complexity > (COMPLEXITY_LEVELS.high.maxThreshold);
    const manyLines = lineCount > CONTEXT_EXTRACTION_THRESHOLDS.FUNCTION_LINES;
    const multipleOperations = this.countDistinctOperations(node) > 5;

    return highComplexity && manyLines && multipleOperations;
  }

  /**
   * Count distinct responsibilities in a function
   */
  private countResponsibilities(node: Node): number {
    const responsibilities = new Set<string>();

    node.forEachDescendant(child => {
      // IO operations
      if (Node.isCallExpression(child)) {
        const text = child.getText();
        if (/\b(read|write|fetch|save|load)\b/i.test(text)) {
          responsibilities.add('io');
        }
        if (/\b(validate|check|verify)\b/i.test(text)) {
          responsibilities.add('validation');
        }
        if (/\b(transform|convert|map|format)\b/i.test(text)) {
          responsibilities.add('transformation');
        }
        if (/\b(calculate|compute|derive)\b/i.test(text)) {
          responsibilities.add('calculation');
        }
        if (/\b(render|display|show)\b/i.test(text)) {
          responsibilities.add('presentation');
        }
      }

      // Error handling
      if (Node.isTryStatement(child) || Node.isThrowStatement(child)) {
        responsibilities.add('error-handling');
      }

      // State mutation
      if (Node.isBinaryExpression(child) && child.getOperatorToken().getText() === '=') {
        const left = child.getLeft();
        if (Node.isPropertyAccessExpression(left) || Node.isElementAccessExpression(left)) {
          responsibilities.add('state-mutation');
        }
      }
    });

    return responsibilities.size;
  }

  /**
   * Check if function has impure operations
   */
  private hasImpureOperations(node: Node): boolean {
    let hasImpurity = false;

    node.forEachDescendant(child => {
      // Check for console operations
      if (Node.isCallExpression(child)) {
        const text = child.getText();
        if (/\bconsole\.\w+/.test(text)) {
          hasImpurity = true;
          return;
        }
      }

      // Check for external state access (this.x or global variables)
      if (Node.isPropertyAccessExpression(child)) {
        const expression = child.getExpression();
        if (Node.isThisExpression(expression)) {
          hasImpurity = true;
          return;
        }
      }

      // Check for Date.now() or Math.random()
      if (Node.isCallExpression(child)) {
        const text = child.getText();
        if (/\b(Date\.now|Math\.random)\b/.test(text)) {
          hasImpurity = true;
          return;
        }
      }

      // Check for DOM manipulation
      if (Node.isCallExpression(child)) {
        const text = child.getText();
        if (/\b(document\.|window\.|querySelector|getElementById)\b/.test(text)) {
          hasImpurity = true;
          return;
        }
      }
    });

    return hasImpurity;
  }

  /**
   * Check function naming conventions
   */
  private checkFunctionNaming(node: Node): string | null {
    const name = getFunctionName(node);
    if (!name || name === 'anonymous') return null;

    // Check length
    if (name.length < 3) {
      return `Function name "${name}" is too short, use descriptive names`;
    }

    if (name.length > 40) {
      return `Function name "${name}" is too long, consider a more concise name`;
    }

    // Check for generic names
    const genericNames = ['func', 'function', 'method', 'fn', 'cb', 'callback', 'handler', 'util', 'helper', 'process', 'do', 'run', 'execute'];
    if (genericNames.includes(name.toLowerCase())) {
      return `Function name "${name}" is too generic, use a more descriptive name`;
    }

    // Check for boolean functions that don't start with is/has/should/can
    const returnType = this.getFunctionReturnType(node);
    if (returnType === 'boolean' && !/^(is|has|should|can|will|does)/.test(name)) {
      return `Boolean function "${name}" should start with is/has/should/can`;
    }

    // Check for verb prefix for action functions
    if (!this.isGetter(node) && !this.isSetter(node) && !/^[a-z][a-zA-Z]*/.test(name)) {
      return `Function name "${name}" should start with a verb in camelCase`;
    }

    return null;
  }

  /**
   * Count distinct operations in a function
   */
  private countDistinctOperations(node: Node): number {
    const operations = new Set<string>();

    node.forEachDescendant(child => {
      if (Node.isCallExpression(child)) {
        operations.add('call');
      }
      if (Node.isIfStatement(child) || Node.isConditionalExpression(child)) {
        operations.add('condition');
      }
      if (Node.isForStatement(child) || Node.isWhileStatement(child) || Node.isForOfStatement(child)) {
        operations.add('loop');
      }
      if (Node.isTryStatement(child)) {
        operations.add('error-handling');
      }
      if (Node.isReturnStatement(child)) {
        operations.add('return');
      }
      if (Node.isAwaitExpression(child)) {
        operations.add('async');
      }
      if (Node.isNewExpression(child)) {
        operations.add('instantiation');
      }
    });

    return operations.size;
  }

  /**
   * Helper to determine function return type
   */
  private getFunctionReturnType(_node: Node): string | null {
    // For now, we can't easily determine return type without TypeChecker
    // This would require a more complex implementation with ts-morph's type system
    // Keeping it simple for naming validation purposes
    return null;
  }

  /**
   * Check if node is a getter
   */
  private isGetter(node: Node): boolean {
    return Node.isGetAccessorDeclaration(node);
  }

  /**
   * Check if node is a setter
   */
  private isSetter(node: Node): boolean {
    return Node.isSetAccessorDeclaration(node);
  }
}

/**
 * Default function analyzer instance
 */
export const functionAnalyzer = new FunctionAnalyzer();