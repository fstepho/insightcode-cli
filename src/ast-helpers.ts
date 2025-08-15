// File: src/ast-helpers.ts
import { Node, Symbol as MorphSymbol } from 'ts-morph';
import * as ts from 'typescript';

// Performance timing utilities
class PerformanceTimer {
  private timings = new Map<string, { total: number; count: number; max: number }>();

  time<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    const existing = this.timings.get(label) || { total: 0, count: 0, max: 0 };
    this.timings.set(label, {
      total: existing.total + duration,
      count: existing.count + 1,
      max: Math.max(existing.max, duration)
    });
    
    return result;
  }

  getStats(): Map<string, { avg: number; total: number; count: number; max: number }> {
    const stats = new Map();
    this.timings.forEach((timing, label) => {
      stats.set(label, {
        avg: timing.total / timing.count,
        total: timing.total,
        count: timing.count,
        max: timing.max
      });
    });
    return stats;
  }

  logStats(): void {
    const stats = Array.from(this.getStats().entries())
      .sort((a, b) => b[1].total - a[1].total);
    
    console.log('\n=== AST-HELPERS PERFORMANCE STATS ===');
    stats.forEach(([label, stat]) => {
      console.log(`${label}: ${stat.total.toFixed(2)}ms total (${stat.count} calls, avg: ${stat.avg.toFixed(2)}ms, max: ${stat.max.toFixed(2)}ms)`);
    });
    console.log('=====================================\n');
  }
}

const perfTimer = new PerformanceTimer();

// Export performance monitoring functions
export function logASTPerformanceStats(): void {
  perfTimer.logStats();
}

export function getASTPerformanceStats() {
  return perfTimer.getStats();
}

interface ResponsibilityAnalysis {
  responsibilities: Set<string>;
  operationCounts: Map<string, number>;
}

// ========== CACHE SYSTEMS ==========
class ASTCache {
  private lineCountCache = new WeakMap<Node, number>();
  private sourceFileCache = new WeakMap<Node, ReturnType<Node['getSourceFile']>>();
  private functionNameCache = new WeakMap<Node, string>();
  private maxNestingCache = new WeakMap<Node, number>();
  private symbolCache = new WeakMap<Node, MorphSymbol | null>();
  private textCache = new WeakMap<Node, string>();
  
  getLineCount(node: Node): number {
    if (!this.lineCountCache.has(node)) {
      const sourceFile = this.getSourceFile(node);
      // Try to use function body for more accurate line count
      let target = node;
      if ((Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node) || 
           Node.isFunctionExpression(node) || Node.isArrowFunction(node)) && node.getBody) {
        const body = node.getBody();
        if (body) target = body;
      }
      const start = sourceFile.getLineAndColumnAtPos(target.getStart());
      const end = sourceFile.getLineAndColumnAtPos(target.getEnd());
      this.lineCountCache.set(node, end.line - start.line + 1);
    }
    return this.lineCountCache.get(node)!;
  }
  
  getSourceFile(node: Node) {
    if (!this.sourceFileCache.has(node)) {
      this.sourceFileCache.set(node, node.getSourceFile());
    }
    return this.sourceFileCache.get(node)!;
  }
  
  getFunctionName(node: Node): string {
    if (!this.functionNameCache.has(node)) {
      this.functionNameCache.set(node, extractFunctionName(node));
    }
    return this.functionNameCache.get(node)!;
  }
  
  getMaxNesting(node: Node): number {
    if (!this.maxNestingCache.has(node)) {
      const result = perfTimer.time('calculateMaxNestingDepth', () => calculateMaxNestingDepth(node));
      this.maxNestingCache.set(node, result);
    }
    return this.maxNestingCache.get(node)!;
  }
  
  getSymbol(node: Node): MorphSymbol | null {
    if (!this.symbolCache.has(node)) {
      this.symbolCache.set(node, node.getSymbol() || null);
    }
    return this.symbolCache.get(node)!;
  }
  
  getText(node: Node): string {
    if (!this.textCache.has(node)) {
      this.textCache.set(node, node.getText());
    }
    return this.textCache.get(node)!;
  }
  
  clear() {
    this.lineCountCache = new WeakMap();
    this.sourceFileCache = new WeakMap();
    this.functionNameCache = new WeakMap();
    this.maxNestingCache = new WeakMap();
    this.symbolCache = new WeakMap();
    this.textCache = new WeakMap();
  }
}

// Global cache instance
const cache = new ASTCache();

// ========== CONSTANT LOOKUPS OPTIMIZATION ==========
const FUNCTION_KINDS = new Set([
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.Constructor,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.SetAccessor
]);

const NESTING_KINDS = new Set([
  ts.SyntaxKind.IfStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.SwitchStatement,
  ts.SyntaxKind.TryStatement,
  // CatchClause removed to avoid double-counting with TryStatement
  ts.SyntaxKind.ConditionalExpression
]);

const ASSIGNMENT_KINDS = new Set([
  ts.SyntaxKind.EqualsToken,
  ts.SyntaxKind.PlusEqualsToken,
  ts.SyntaxKind.MinusEqualsToken,
  ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken,
  ts.SyntaxKind.PercentEqualsToken,
  ts.SyntaxKind.AsteriskAsteriskEqualsToken,
  ts.SyntaxKind.AmpersandEqualsToken,
  ts.SyntaxKind.BarEqualsToken,
  ts.SyntaxKind.CaretEqualsToken,
  ts.SyntaxKind.LessThanLessThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanEqualsToken,
  ts.SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken
]);

const COMPARISON_KINDS = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
  ts.SyntaxKind.LessThanToken,
  ts.SyntaxKind.GreaterThanToken,
  ts.SyntaxKind.LessThanEqualsToken,
  ts.SyntaxKind.GreaterThanEqualsToken
]);

const LOGICAL_KINDS = new Set([
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken
]); // Note: QuestionQuestionToken (nullish coalescing) excluded as it returns RHS value, not boolean
const MUTATING_METHODS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'set', 'delete', 'clear']);
const GENERIC_FUNCTION_NAMES = new Set(['func', 'function', 'method', 'fn', 'cb', 'callback', 'handler', 'util', 'helper', 'process', 'do', 'run', 'execute']);
const BOOLEAN_PROPERTIES = new Set(['checked', 'disabled', 'hidden', 'required', 'readonly']);
const BOOLEAN_METHODS = new Set(['includes', 'some', 'every', 'hasOwnProperty', 'startsWith', 'endsWith', 'test']);

// Optimized globals list with Set for O(1) lookup
const GLOBAL_VARIABLES = new Set([
  // Browser globals
  'window', 'document', 'console', 'localStorage', 'sessionStorage',
  'location', 'navigator', 'history', 'screen', 'performance',
  'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval', 
  'clearTimeout', 'clearInterval', 'requestAnimationFrame',
  'fetch', 'XMLHttpRequest', 'WebSocket', 'URL', 'URLSearchParams',
  'FormData', 'Blob', 'File', 'FileReader', 'Image', 'Audio',
  'crypto', 'btoa', 'atob', 'encodeURIComponent', 'decodeURIComponent',
  // Modern/Worker globals
  'globalThis', 'self', 'queueMicrotask', 'structuredClone',
  // Node.js globals
  'global', 'process', 'Buffer', '__dirname', '__filename',
  'require', 'module', 'exports', 'setImmediate', 'clearImmediate',
  // Testing globals
  'describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach',
  'beforeAll', 'afterAll', 'jest', 'vi', 'cy'
]);

// ========== REGEX COMPILATION ==========
// Pre-compile frequently used regexes with performance optimizations
// Using non-capturing groups and word boundaries for better performance
const REGEX_CACHE = {
  // Optimized patterns - keep original behavior but improve performance
  console: /\bconsole\.\w+/,
  logger: /\b(?:logger|log)\.(?:info|error|warn|debug|trace)\b/,
  nonDeterministic: /\b(?:Date\.now|Math\.random|crypto\.getRandomValues|crypto\.randomUUID|performance\.now)\b/,
  dom: /\b(?:document\.|window\.|querySelector|getElementById|addEventListener)|window\.location/,
  network: /\b(?:fetch|XMLHttpRequest|setTimeout|setInterval|requestAnimationFrame)\b/,
  nodejs: /\b(?:process\.|require\(|fs\.|http\.|https\.)/,
  fileSystem: /\b(?:fs\.|readFile|writeFile|createReadStream|createWriteStream)\b/,
  httpRequest: /\b(?:fetch\(|axios\.|http\.|https\.request)/,
  database: /\b(?:query\(|execute\(|findOne|findMany|create\(|update\(|delete\()/,
  dbObject: /\b(?:db|database|model|repository|prisma|knex|mongoose)\b/,
  localStorage: /\b(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem|clear|key)\b/,
  indexedDB: /\b(?:indexedDB)\.(?:open|deleteDatabase|databases)\b/,
  validation: /\b(?:yup|joi|zod|ajv)\.\w+\(/,
  // include isEmail (validator.js or similar) as a recognized validation method
  validationMethod: /\b(?:validate|isValid|verify|isEmail)/,
  validationContext: /\b(?:validator|schema|rules)/,
  validationSpecific: /\b(?:validateEmail|validatePassword|validateInput|isValidDate|isEmail)/,
  arrayMethods: /\b(?:map|filter|reduce|flatMap)\s*\(/,
  transformation: /\b(?:transform|convert|parse|serialize|deserialize|toJSON|fromJSON|normalize|denormalize)/,
  businessLogic: /\b(?:calculate[A-Z]\w*|compute[A-Z]\w*|determine[A-Z]\w*|process[A-Z]\w*|analyze[A-Z]\w*)/,
  presentation: /\b(?:render|createElement|appendChild|innerHTML|classList\.|style\.|setAttribute)/,
  react: /\b(?:React\.|jsx|component)/,
  // These are already anchored properly for function names
  orchestration: /^(?:handle|manage|process|coordinate|orchestrate)/,
  setter: /^(?:set|update|modify|change|toggle|reset)/,
  transformer: /^(?:transform|convert|map|parse|format|serialize)/,
  validator: /^(?:validate|check|verify|ensure|is[A-Z])/,
  booleanPrefix: /^(?:is|has|should|can|will|does)/,
  arrayIsArray: /Array\.isArray\(/,
  thisAccess: /\bthis\./
};

/**
 * Collection of AST utility functions shared between file-detail-builder.ts
 * This module centralizes common TypeScript AST analysis functions to avoid duplication.
 */


/**
 * Traversal helper: visit all descendants of `root` while
 * **skipping the subtrees of nested function-like nodes**.
 */
function forEachDescendantSkippingNested(
  root: Node,
  cb: (n: Node, stop: () => void) => void
): void {
  root.forEachDescendant((n, traversal) => {
    if (n !== root && isFunctionLike(n)) {
      traversal.skip(); // do not descend into nested function bodies
      return;
    }
    cb(n, () => traversal.stop());
  });
}


/**
 * Determine if a node represents a function-like construct.
 */
export function isFunctionLike(node: Node): boolean {
  return FUNCTION_KINDS.has(node.getKind());
}

/**
 * Extract the name of a function from its AST node.
 */
export function getFunctionName(node: Node): string {
  return cache.getFunctionName(node);
}

// Internal implementation
function extractFunctionName(node: Node): string {
  if (Node.isFunctionDeclaration(node)) {
    return node.getName() || '<anonymous>';
  }

  if (Node.isMethodDeclaration(node)) {
    return node.getName() || '<anonymous>';
  }

  if (Node.isFunctionExpression(node)) {
    const name = node.getName();
    if (name) return name;
  }

  if (Node.isArrowFunction(node)) {
    const parent = node.getParent();
    if (Node.isVariableDeclaration(parent)) {
      return parent.getName();
    }
    if (Node.isPropertyAssignment(parent)) {
      const nameNode = parent.getNameNode();
      return nameNode ? cache.getText(nameNode) : '<anonymous>';
    }
    if (Node.isPropertyDeclaration(parent)) {
      return parent.getName(); // Handle class property arrow functions
    }
  }

  return '<anonymous>';
}

/**
 * Calculate the line count of a function.
 */
export function getFunctionLineCount(node: Node): number {
  return cache.getLineCount(node);
}

/**
 * Count the number of parameters in a function.
 */
export function getFunctionParameterCount(node: Node): number {
  if (Node.isFunctionDeclaration(node) ||
      Node.isMethodDeclaration(node) ||
      Node.isArrowFunction(node) ||
      Node.isFunctionExpression(node) ||
      Node.isConstructorDeclaration(node)) {
    return node.getParameters().length;
  }
  
  // Accessors have implicit parameter counts
  if (Node.isSetAccessorDeclaration(node)) {
    return 1; // Setters always have exactly 1 parameter
  }
  
  if (Node.isGetAccessorDeclaration(node)) {
    return 0; // Getters have no parameters
  }
  
  return 0;
}

/**
 * Check if a function has async modifier.
 */
export function hasAsyncModifier(node: Node): boolean {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node) ||
    Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    return node.isAsync();
  }
  return false;
}

export function isInString(node: Node): boolean {
  // Fast path: check direct node first
  if (Node.isStringLiteral(node) || 
      Node.isNoSubstitutionTemplateLiteral(node) ||
      Node.isTemplateHead(node) || 
      Node.isTemplateMiddle(node) || 
      Node.isTemplateTail(node)) {
    return true;
  }
  
  // Traverse parents with early termination
  let current = node.getParent();
  let depth = 0;
  const maxDepth = 10; // Limit traversal depth
  
  while (current && depth < maxDepth) {
    if (Node.isStringLiteral(current) ||
        Node.isNoSubstitutionTemplateLiteral(current) ||
        Node.isTemplateHead(current) || 
        Node.isTemplateMiddle(current) || 
        Node.isTemplateTail(current)) {
      return true;
    }
    
    // Stop at function boundaries
    if (isFunctionLike(current) || Node.isSourceFile(current)) {
      break;
    }
    
    current = current.getParent();
    depth++;
  }
  
  return false;
}

export function isLocalVariable(symbol: MorphSymbol): boolean {
  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) {
    return false;
  }

  // Fast check first declaration only (most common case)
  const firstDecl = declarations[0];
  if (!Node.isVariableDeclaration(firstDecl)) {
    return declarations.some(decl => Node.isVariableDeclaration(decl) && isInLocalScope(decl));
  }
  
  return isInLocalScope(firstDecl);
}

// Helper function to check if declaration is in local scope
function isInLocalScope(decl: Node): boolean {
  let parent = decl.getParent();
  let depth = 0;
  const MAX_DEPTH = 100; // Reasonable limit for scope traversal
  
  while (parent && depth < MAX_DEPTH) {
    if (isFunctionLike(parent) || Node.isBlock(parent)) {
      return true; // Found local scope
    }
    if (Node.isSourceFile(parent)) {
      return false; // Module level
    }
    parent = parent.getParent();
    depth++;
  }
  
  if (depth >= MAX_DEPTH) {
    console.warn(`Scope traversal hit maximum depth (${MAX_DEPTH}) in isInLocalScope`);
  }
  
  return false;
}

export function isParameter(node: Node): boolean {
  if (!Node.isIdentifier(node)) {
    return false;
  }

  const symbol = cache.getSymbol(node);
  if (!symbol) {
    return false;
  }

  const declarations = symbol.getDeclarations();
  return declarations?.some(d => Node.isParameterDeclaration(d)) ?? false;
}

export function isClassMember(node: Node): boolean {
  let parent = node.getParent();
  let depth = 0;
  const MAX_DEPTH = 100; // Reasonable limit for class membership traversal
  
  while (parent && depth < MAX_DEPTH) {
    if (Node.isClassDeclaration(parent) || Node.isClassExpression(parent)) {
      return true;
    }
    // Stop at function boundaries
    if (isFunctionLike(parent)) {
      return false;
    }
    parent = parent.getParent();
    depth++;
  }
  
  if (depth >= MAX_DEPTH) {
    console.warn(`Class membership traversal hit maximum depth (${MAX_DEPTH}) in isClassMember`);
  }
  
  return false;
}

export function isModuleLevel(node: Node): boolean {
  let parent = node.getParent();
  let depth = 0;
  const MAX_DEPTH = 100; // Reasonable limit for module level traversal
  
  while (parent && depth < MAX_DEPTH) {
    // If we find any function-like construct, class, or namespace/module, it's not module level
    if (isFunctionLike(parent) || Node.isClassDeclaration(parent) || Node.isModuleDeclaration(parent)) {
      return false;
    }
    // If we reach the source file, it's module level
    if (Node.isSourceFile(parent)) {
      return true;
    }
    parent = parent.getParent();
    depth++;
  }
  
  if (depth >= MAX_DEPTH) {
    console.warn(`Module level traversal hit maximum depth (${MAX_DEPTH}) in isModuleLevel`);
  }
  
  return false;
}

export function hasSubstantialErrorHandling(node: Node): boolean {
  if (!Node.isTryStatement(node)) {
    return false;
  }

  const catchClause = node.getCatchClause();
  if (!catchClause) {
    return false;
  }

  const catchBlock = catchClause.getBlock();
  const statements = catchBlock.getStatements();

  // Fast path: multiple statements = substantial
  if (statements.length > 1) {
    return true;
  }

  // Single statement checks
  if (statements.length === 1) {
    const statement = statements[0];

    // Just rethrowing
    if (Node.isThrowStatement(statement)) {
      return false;
    }

    // Just logging
    if (Node.isExpressionStatement(statement)) {
      const expression = statement.getExpression();
      if (Node.isCallExpression(expression)) {
        const text = cache.getText(expression);
        return !(REGEX_CACHE.console.test(text) || REGEX_CACHE.logger.test(text));
      }
    }
  }

  return false;
}

/**
 * Check if function has impure operations
 * @param node - The function node to check
 */
export function hasImpureOperations(node: Node): boolean {
  return perfTimer.time('hasImpureOperations', () => hasImpureOperationsImpl(node));
}

function hasImpureOperationsImpl(node: Node): boolean {
  let hasImpurity = false;
  const rootFn = node; // Store the root function for closure detection

  // Removed dangerous fast path optimization that could miss impure operations
  // like localStorage.setItem(), window.location, fetch(), etc.
  // Better to be thorough than fast and wrong.

  let nodeCount = 0;
  const MAX_NODES = 3000; // Even more aggressive limit for purity checks

  forEachDescendantSkippingNested(node, (n, stop) => {
    // Performance guard
    if (++nodeCount > MAX_NODES) {
      hasImpurity = true; // Assume impure if too complex to analyze
      stop(); return;
    }
    // Skip strings (comments are not AST nodes, so no need to check)
    if (isInString(n)) {
      return; // Continue
    }

    // Check for impure operations
    if (Node.isCallExpression(n)) {
      const expression = n.getExpression();
      
      // Direct super() call (constructor)
      if (Node.isSuperExpression(expression)) {
        hasImpurity = true;
        stop(); return;
      }
      
      const text = cache.getText(n);
      
      // Check all impurity patterns (including logger)
      if (REGEX_CACHE.console.test(text) ||
          REGEX_CACHE.logger.test(text) ||
          REGEX_CACHE.nonDeterministic.test(text) ||
          REGEX_CACHE.dom.test(text) ||
          REGEX_CACHE.network.test(text) ||
          REGEX_CACHE.nodejs.test(text) ||
          REGEX_CACHE.localStorage.test(text) ||
          REGEX_CACHE.indexedDB.test(text) ||
          REGEX_CACHE.fileSystem.test(text) ||
          REGEX_CACHE.httpRequest.test(text)) {
        hasImpurity = true;
        stop(); return;
      }
    }

    // Check for new Date() - non-deterministic constructor
    if (Node.isNewExpression(n)) {
      const expression = n.getExpression();
      if (Node.isIdentifier(expression) && cache.getText(expression) === 'Date') {
        hasImpurity = true;
        stop(); return;
      }
    }

    // Check for this/super access and DOM access
    if (Node.isPropertyAccessExpression(n)) {
      const expression = n.getExpression();
      if (Node.isThisExpression(expression) || Node.isSuperExpression(expression)) {
        hasImpurity = true;
        stop(); return;
      }
      
      // Check for DOM access like window.location
      const text = cache.getText(n);
      if (REGEX_CACHE.dom.test(text)) {
        hasImpurity = true;
        stop(); return;
      }
    }

    // Check for state mutation (pass rootFn for proper closure detection)
    if (isSignificantStateMutation(n, rootFn)) {
      hasImpurity = true;
      stop(); return;
    }

    // Check for throw statements
    if (Node.isThrowStatement(n)) {
      hasImpurity = true;
      stop(); return;
    }
  });

  return hasImpurity;
}

/**
 * Check function naming conventions
 */
export function checkFunctionNaming(node: Node): string | null {
  const name = getFunctionName(node);
  if (!name || name === '<anonymous>') return null;

  // Check length
  if (name.length < 3) {
    return `Function name "${name}" is too short, use descriptive names`;
  }

  if (name.length > 40) {
    return `Function name "${name}" is too long, consider a more concise name`;
  }

  // Check for generic names - use lowercase for comparison
  const lowerName = name.toLowerCase();
  if (GENERIC_FUNCTION_NAMES.has(lowerName)) {
    return `Function name "${name}" is too generic, use a more descriptive name`;
  }

  // Check for boolean functions - use ORIGINAL name to preserve case
  const returnType = getFunctionReturnType(node);
  if (returnType === 'boolean' && !REGEX_CACHE.booleanPrefix.test(name)) {
    return `Boolean function "${name}" should start with is/has/should/can`;
  }

  return null;
}

/**
 * Helper to determine function return type
 */
export function getFunctionReturnType(node: Node): string | null {
  // Check explicit return type first
  const returnType = getExplicitReturnType(node);
  if (returnType) {
    return returnType;
  }

  // Analyze return statements
  return inferReturnTypeFromStatements(node);
}

function getExplicitReturnType(node: Node): string | null {
  let typeNode: Node | undefined;

  if (Node.isFunctionDeclaration(node)) {
    typeNode = node.getReturnTypeNode();
  } else if (Node.isMethodDeclaration(node)) {
    typeNode = node.getReturnTypeNode();
  } else if (Node.isArrowFunction(node)) {
    typeNode = node.getReturnTypeNode();
  } else if (Node.isFunctionExpression(node)) {
    typeNode = node.getReturnTypeNode();
  } else if (Node.isGetAccessorDeclaration(node)) {
    typeNode = node.getReturnTypeNode();
  }

  if (typeNode) {
    const typeText = cache.getText(typeNode).toLowerCase();
    
    // Fast path for common types
    switch(typeText) {
      case 'boolean': return 'boolean';
      case 'string': return 'string';
      case 'number': return 'number';
      case 'void': return 'void';
      default:
        return typeText.includes('promise') ? 'promise' : typeText;
    }
  }

  return null;
}

function inferReturnTypeFromStatements(node: Node): string | null {
  const returnTypes = new Set<string>();
  let hasReturnWithoutValue = false;

  forEachDescendantSkippingNested(node, (child) => {
    if (Node.isReturnStatement(child)) {
      const expression = child.getExpression();
      
      if (!expression) {
        hasReturnWithoutValue = true;
        return; // Continue
      }

      const inferredType = inferExpressionType(expression);
      if (inferredType) {
        returnTypes.add(inferredType);
      }
    }
  });

  // Fast paths
  if (returnTypes.size === 0) {
    return hasReturnWithoutValue ? 'void' : null;
  }

  if (returnTypes.size === 1) {
    return Array.from(returnTypes)[0];
  }

  // Mixed boolean/null is still boolean
  if (returnTypes.size === 2 && returnTypes.has('boolean') && 
      (returnTypes.has('null') || returnTypes.has('undefined'))) {
    return 'boolean';
  }

  return null;
}

/**
 * Infer type from expression with depth limit
 */
function inferExpressionType(expression: Node, depth = 0): string | null {
  // Strict depth limit
  if (depth > 3) {
    return null;
  }

  // Fast literal checks using SyntaxKind for better compatibility
  const kind = expression.getKind();
  if (kind === ts.SyntaxKind.TrueKeyword || kind === ts.SyntaxKind.FalseKeyword) {
    return 'boolean';
  }

  // String literals - including NoSubstitutionTemplateLiteral
  if (Node.isStringLiteral(expression) || 
      Node.isNoSubstitutionTemplateLiteral(expression) ||
      Node.isTemplateExpression(expression)) {
    return 'string';
  }

  if (Node.isNumericLiteral(expression)) {
    return 'number';
  }

  if (Node.isNullLiteral(expression)) {
    return 'null';
  }
  
  if (Node.isIdentifier(expression) && cache.getText(expression) === 'undefined') {
    return 'undefined';
  }

  // Binary expressions
  if (Node.isBinaryExpression(expression)) {
    const operatorKind = expression.getOperatorToken().getKind();
    
    // instanceof and in operators return boolean
    if (operatorKind === ts.SyntaxKind.InstanceOfKeyword || 
        operatorKind === ts.SyntaxKind.InKeyword) {
      return 'boolean';
    }
    
    // Comparison operators return boolean
    if (COMPARISON_KINDS.has(operatorKind)) {
      return 'boolean';
    }

    // Logical operators
    if (LOGICAL_KINDS.has(operatorKind)) {
      const leftType = inferExpressionType(expression.getLeft(), depth + 1);
      const rightType = inferExpressionType(expression.getRight(), depth + 1);
      
      if (leftType === 'boolean' && rightType === 'boolean') {
        return 'boolean';
      }
    }
  }

  // Unary expressions
  if (Node.isPrefixUnaryExpression(expression)) {
    const operator = expression.getOperatorToken();
    if (operator === ts.SyntaxKind.ExclamationToken) {
      return 'boolean';
    }
  }

  // Call expressions
  if (Node.isCallExpression(expression)) {
    const callExpression = expression.getExpression();
    
    // Boolean() constructor
    if (Node.isIdentifier(callExpression) && cache.getText(callExpression) === 'Boolean') {
      return 'boolean';
    }
    
    if (Node.isPropertyAccessExpression(callExpression)) {
      const methodName = callExpression.getName();
      if (BOOLEAN_METHODS.has(methodName)) {
        return 'boolean';
      }
    }
    
    if (Node.isIdentifier(callExpression)) {
      const functionName = cache.getText(callExpression);
      if (REGEX_CACHE.booleanPrefix.test(functionName)) {
        return 'boolean';
      }
    }
    
    const callText = cache.getText(expression);
    if (REGEX_CACHE.arrayIsArray.test(callText)) {
      return 'boolean';
    }
  }

  // Property access
  if (Node.isPropertyAccessExpression(expression)) {
    const propName = expression.getName();
    if (BOOLEAN_PROPERTIES.has(propName)) {
      return 'boolean';
    }
  }

  return null;
}

export function isGetter(node: Node): boolean {
  return Node.isGetAccessorDeclaration(node);
}

export function isSetter(node: Node): boolean {
  return Node.isSetAccessorDeclaration(node);
}

/**
 * Get maximum nesting depth within a function
 */
export function getMaxNestingDepth(node: Node): number {
  return cache.getMaxNesting(node);
}

// Internal implementation
function calculateMaxNestingDepth(node: Node): number {
  let maxDepth = 0;

  const visit = (n: Node, currentDepth: number): void => {
    // Skip nested functions - don't traverse into them
    if (n !== node && isFunctionLike(n)) {
      return; // Don't traverse children of nested functions
    }

    // If this is a nesting node, it increases the depth
    if (isNestingNode(n)) {
      currentDepth = currentDepth + 1;
      maxDepth = Math.max(maxDepth, currentDepth);
    }

    // Visit children with current depth
    n.forEachChild(child => visit(child, currentDepth));
  };

  visit(node, 0);
  return maxDepth;
}

export function isNestingNode(node: Node): boolean {
  const kind = node.getKind();
  
  // Handle conditional expressions (ternary) with nuance
  if (kind === ts.SyntaxKind.ConditionalExpression) {
    // Only count nested ternaries as nesting, not simple ones
    return hasNestedConditional(node);
  }
  
  return NESTING_KINDS.has(kind);
}

// Helper to detect if a conditional expression has nested conditionals
function hasNestedConditional(node: Node): boolean {
  if (!Node.isConditionalExpression(node)) return false;
  
  // Check if either the whenTrue or whenFalse expressions contain another conditional
  const whenTrue = node.getWhenTrue();
  const whenFalse = node.getWhenFalse();
  
  return containsConditionalExpression(whenTrue) || containsConditionalExpression(whenFalse);
}

// Helper to check if a node contains conditional expressions
function containsConditionalExpression(node: Node): boolean {
  if (Node.isConditionalExpression(node)) {
    return true;
  }
  
  // Check immediate children only (not deep traversal to avoid performance issues)
  return node.getChildren().some(child => Node.isConditionalExpression(child));
}

export function isSignificantStateMutation(node: Node, rootFn?: Node): boolean {
  // Check assignment operators
  if (Node.isBinaryExpression(node)) {
    const opKind = node.getOperatorToken().getKind();
    if (ASSIGNMENT_KINDS.has(opKind)) {
      return isExternalStateTarget(node.getLeft(), rootFn);
    }
  }

  // Check increment/decrement
  if (Node.isPrefixUnaryExpression(node) || Node.isPostfixUnaryExpression(node)) {
    const operatorToken = node.getOperatorToken();
    if (operatorToken === ts.SyntaxKind.PlusPlusToken ||
        operatorToken === ts.SyntaxKind.MinusMinusToken) {
      return isExternalStateTarget(node.getOperand(), rootFn);
    }
  }

  // Check mutating method calls
  if (Node.isCallExpression(node)) {
    const expression = node.getExpression();
    if (Node.isPropertyAccessExpression(expression)) {
      const methodName = expression.getName();
      if (MUTATING_METHODS.has(methodName)) {
        return isExternalStateTarget(expression.getExpression(), rootFn);
      }
    }
  }

  return false;
}

export function isExternalStateTarget(node: Node, rootFn?: Node): boolean {
  // Property access
  if (Node.isPropertyAccessExpression(node)) {
    const object = node.getExpression();

    // This and super are always external state
    if (Node.isThisExpression(object) || Node.isSuperExpression(object)) {
      return true;
    }

    // Check if object is external (pass rootFn for closure detection)
    if (Node.isIdentifier(object)) {
      return isExternalIdentifier(object, rootFn);
    }

    // Nested property access
    return isExternalStateTarget(object, rootFn);
  }

  // Element access
  if (Node.isElementAccessExpression(node)) {
    return isExternalStateTarget(node.getExpression(), rootFn);
  }

  // Direct identifier
  if (Node.isIdentifier(node)) {
    return isExternalIdentifier(node, rootFn);
  }

  return false;
}

/**
 * Check if a node is descendant of another node
 * Protected against infinite loops with depth limit and cycle detection
 */
function isDescendantOf(node: Node, ancestor: Node): boolean {
  let current = node.getParent();
  let depth = 0;
  const MAX_DEPTH = 1000; // Reasonable limit for AST depth
  const visited = new Set<Node>(); // Cycle detection
  
  while (current && depth < MAX_DEPTH) {
    // Cycle detection - if we've seen this node before, we have a cycle
    if (visited.has(current)) {
      console.warn('Detected circular reference in AST traversal, stopping to prevent infinite loop');
      return false;
    }
    visited.add(current);
    
    if (current === ancestor) {
      return true;
    }
    
    current = current.getParent();
    depth++;
  }
  
  // If we hit the depth limit, log a warning
  if (depth >= MAX_DEPTH) {
    console.warn(`AST traversal hit maximum depth (${MAX_DEPTH}), possible deep nesting or corruption`);
  }
  
  return false;
}

export function isExternalIdentifier(identifier: Node, rootFn?: Node): boolean {
  if (!Node.isIdentifier(identifier)) return false;

  const symbol = cache.getSymbol(identifier);
  if (!symbol) {
    const name = cache.getText(identifier);
    return GLOBAL_VARIABLES.has(name);
  }

  const declarations = symbol.getDeclarations() || [];
  
  // Parameters are external to the function body
  if (declarations.some(d => Node.isParameterDeclaration(d))) {
    return true;
  }

  // If we have the root function, check if variable is declared inside it
  if (rootFn) {
    // Variable is local only if declared within the root function
    const isDeclaredInsideRoot = declarations.some(d => {
      // Check if declaration is the root itself or a descendant of root function
      return d === rootFn || isDescendantOf(d, rootFn);
    });
    return !isDeclaredInsideRoot; // External if NOT declared inside root
  }

  // Fallback to current logic if no root function provided
  return !isLocalVariable(symbol);
}

export function countResponsibilities(node: Node): number {
  const analysis = analyzeResponsibilities(node);
  const responsibilityCount = applyResponsibilityHeuristics(analysis, node);

  // Fast path for tiny functions
  const lineCount = getFunctionLineCount(node);
  if (lineCount < 5 && responsibilityCount === 1) {
    return 1;
  }

  return responsibilityCount;
}

export function analyzeResponsibilities(node: Node): ResponsibilityAnalysis {
  return perfTimer.time('analyzeResponsibilities', () => analyzeResponsibilitiesImpl(node));
}

function analyzeResponsibilitiesImpl(node: Node): ResponsibilityAnalysis {
  const found = new Set<string>();
  const operations = new Map<string, number>();
  const rootFn = node; // Store root function for closure detection

  // Early exit for very large functions to prevent performance issues
  const lineCount = getFunctionLineCount(node);
  if (lineCount > 1000) {
    found.add('god-function');
    operations.set('god-function', Math.floor(lineCount / 100));
    return { responsibilities: found, operationCounts: operations };
  }

  let nodeCount = 0;
  const MAX_NODES = 5000; // Limit analysis depth for performance

  forEachDescendantSkippingNested(node, (child, stop) => {
    // Performance guard: stop if too many nodes
    if (++nodeCount > MAX_NODES) {
      found.add('complex-analysis-skipped');
      stop(); // Stop iteration
      return;
    }
    // Skip strings (comments are not AST nodes)
    if (isInString(child)) {
      return; // Continue
    }

    // Check for JSX elements (presentation layer)
    if (Node.isJsxElement(child) || Node.isJsxSelfClosingElement(child) || Node.isJsxFragment(child)) {
      found.add('presentation');
      operations.set('presentation', (operations.get('presentation') || 0) + 1);
    }

    // Presentation via property assignment like: document.body.innerHTML = ...
    if (Node.isBinaryExpression(child)) {
      const left = child.getLeft();
      if (Node.isPropertyAccessExpression(left)) {
        const prop = left.getName();
        if (prop === 'innerHTML' || prop === 'outerHTML' || prop === 'textContent') {
          found.add('presentation');
          operations.set('presentation', (operations.get('presentation') || 0) + 1);
        }
      }
    }

    if (Node.isCallExpression(child)) {
      const callText = cache.getText(child);
      const expression = child.getExpression();

      // Check categories
      if (isIOOperation(callText, expression)) {
        found.add('io');
        operations.set('io', (operations.get('io') || 0) + 1);
      }

      if (isValidationOperation(callText, expression)) {
        found.add('validation');
        operations.set('validation', (operations.get('validation') || 0) + 1);
      }

      // Pass the CallExpression node for proper chain detection
      if (isTransformationOperation(callText, expression, child)) {
        found.add('transformation');
        operations.set('transformation', (operations.get('transformation') || 0) + 1);
      }

      if (isBusinessLogicOperation(callText)) {
        found.add('business-logic');
        operations.set('business-logic', (operations.get('business-logic') || 0) + 1);
      }

      if (isPresentationOperation(callText)) {
        found.add('presentation');
        operations.set('presentation', (operations.get('presentation') || 0) + 1);
      }
    }

    // State mutation (pass rootFn for proper closure detection)
    if (isSignificantStateMutation(child, rootFn)) {
      found.add('state-mutation');
      operations.set('state-mutation', (operations.get('state-mutation') || 0) + 1);
    }

    // Error handling
    if (hasSubstantialErrorHandling(child)) {
      found.add('error-handling');
      operations.set('error-handling', (operations.get('error-handling') || 0) + 1);
    }
  });

  return { responsibilities: found, operationCounts: operations };
}

export function isIOOperation(callText: string, expression: Node): boolean {
  // File system
  if (REGEX_CACHE.fileSystem.test(callText)) {
    return true;
  }

  // Network
  if (REGEX_CACHE.httpRequest.test(callText)) {
    return true;
  }

  // Database
  if (REGEX_CACHE.database.test(callText)) {
    if (Node.isPropertyAccessExpression(expression)) {
      const obj = cache.getText(expression.getExpression());
      return REGEX_CACHE.dbObject.test(obj);
    }
  }

  // Browser storage
  if (REGEX_CACHE.localStorage.test(callText) || REGEX_CACHE.indexedDB.test(callText)) {
    return true;
  }

  return false;
}

export function isValidationOperation(callText: string, expression: Node): boolean {
  // Schema validation
  if (REGEX_CACHE.validation.test(callText)) {
    return true;
  }

  // Validation methods
  if (REGEX_CACHE.validationMethod.test(callText)) {
    if (Node.isPropertyAccessExpression(expression)) {
      const obj = cache.getText(expression.getExpression());
      return REGEX_CACHE.validationContext.test(obj);
    }
    return REGEX_CACHE.validationSpecific.test(callText);
  }

  return false;
}

export function isTransformationOperation(callText: string, _expression: Node, callNode?: Node): boolean {
  // Array methods chained
  if (REGEX_CACHE.arrayMethods.test(callText)) {
    // Check if this is a chained call
    if (callNode && Node.isCallExpression(callNode)) {
      const expr = callNode.getExpression();
      // Check if the expression is PropertyAccess whose object is a CallExpression (chained)
      if (Node.isPropertyAccessExpression(expr)) {
        const base = expr.getExpression();
        // Check if base is a CallExpression (chained calls)
        if (Node.isCallExpression(base)) {
          return true; // e.g., arr.map(...).filter(...)
        }
      }
    }
    // Consider map/reduce/flatMap as transformations even when not chained
    // but filter alone might just be selection, not transformation
    return /\b(map|reduce|flatMap)\s*\(/.test(callText);
  }

  // Explicit transformation operations
  return REGEX_CACHE.transformation.test(callText);
}

export function isBusinessLogicOperation(callText: string): boolean {
  return REGEX_CACHE.businessLogic.test(callText);
}

export function isPresentationOperation(callText: string): boolean {
  return REGEX_CACHE.presentation.test(callText) || REGEX_CACHE.react.test(callText);
}

export function applyResponsibilityHeuristics(
  analysis: ResponsibilityAnalysis,
  node: Node
): number {
  const { responsibilities, operationCounts } = analysis;
  const originalName = getFunctionName(node);
  const lowerName = originalName.toLowerCase();

  if (responsibilities.size === 0) {
    return 1;
  }

  const totalOps = Array.from(operationCounts.values()).reduce((a, b) => a + b, 0);
  const adjustedResponsibilities = new Set(responsibilities);

  // Error handling filter
  if (adjustedResponsibilities.has('error-handling') && adjustedResponsibilities.size > 1) {
    const errorHandlingCount = operationCounts.get('error-handling') || 0;
    if (totalOps > 0 && errorHandlingCount < totalOps * 0.2) {
      adjustedResponsibilities.delete('error-handling');
    }
  }

  // Pattern-based heuristics
  
  // Orchestration pattern - use lowercase for case-insensitive check
  if (REGEX_CACHE.orchestration.test(lowerName)) {
    if (adjustedResponsibilities.size >= 3 && totalOps > 0) {
      const avgOpsPerResponsibility = totalOps / adjustedResponsibilities.size;
      if (avgOpsPerResponsibility <= 2) {
        return 1;
      }
    }
  }

  // Setter/updater pattern - use lowercase for case-insensitive check
  if (adjustedResponsibilities.has('state-mutation') && adjustedResponsibilities.size <= 3) {
    if (REGEX_CACHE.setter.test(lowerName)) {
      const hasCommonSetterPattern = 
        adjustedResponsibilities.has('validation') ||
        adjustedResponsibilities.has('presentation') ||
        adjustedResponsibilities.size === 1;
      
      if (hasCommonSetterPattern) {
        return 1;
      }
    }
  }

  // Transformer pattern - use lowercase for case-insensitive check
  if (adjustedResponsibilities.has('transformation') && 
      !adjustedResponsibilities.has('io') && 
      adjustedResponsibilities.size <= 3) {
    if (REGEX_CACHE.transformer.test(lowerName)) {
      const hasCommonTransformerPattern = 
        adjustedResponsibilities.has('validation') ||
        adjustedResponsibilities.has('business-logic') ||
        adjustedResponsibilities.size === 1;
      
      if (hasCommonTransformerPattern) {
        return 1;
      }
    }
  }

  // Validator pattern - use ORIGINAL name to preserve case for is[A-Z] pattern
  if (adjustedResponsibilities.has('validation') && adjustedResponsibilities.size <= 3) {
    if (REGEX_CACHE.validator.test(originalName)) {
      const hasCommonValidatorPattern = 
        adjustedResponsibilities.has('business-logic') ||
        adjustedResponsibilities.size === 1;
      
      if (hasCommonValidatorPattern) {
        return 1;
      }
    }
  }

  return Math.max(adjustedResponsibilities.size, 1);
}

/**
 * Count distinct operations in a function
 */
export function countDistinctOperations(node: Node): number {
  const operations = new Set<string>();
  const sourceFile = cache.getSourceFile(node);
  
  // Pre-calculate line mapping function once
  const getLineNumber = (n: Node): number => 
    sourceFile.getLineAndColumnAtPos(n.getStart()).line;

  node.forEachDescendant((child) => {
    // Skip nested functions - PROPERLY stop traversing their subtree
    if (child !== node && isFunctionLike(child)) {
      return false; // This stops traversing into the nested function
    }

    const kind = child.getKind();
    
    // Use switch for better performance
    switch (kind) {
      case ts.SyntaxKind.CallExpression: {
        const expr = (child as any).getExpression();
        if (Node.isIdentifier(expr)) {
          // Use identifier name directly instead of getText()
          operations.add(`func:${expr.getSymbol()?.getName() || cache.getText(expr)}`);
        } else if (Node.isPropertyAccessExpression(expr)) {
          operations.add(`method:${expr.getName()}`);
        } else {
          operations.add(`call:line_${getLineNumber(child)}`);
        }
        break;
      }
      
      case ts.SyntaxKind.BinaryExpression: {
        const binExpr = child as any;
        const opKind = binExpr.getOperatorToken().getKind();
        // Check by kind instead of getText() for performance
        if (ASSIGNMENT_KINDS.has(opKind)) {
          operations.add(`assign:line_${getLineNumber(child)}`);
        }
        break;
      }
      
      case ts.SyntaxKind.PrefixUnaryExpression:
      case ts.SyntaxKind.PostfixUnaryExpression: {
        const tok = (child as any).getOperatorToken();
        const opKind = typeof tok === 'number' ? tok : tok.getKind();
        if (opKind === ts.SyntaxKind.PlusPlusToken || 
            opKind === ts.SyntaxKind.MinusMinusToken) {
          operations.add(`increment:line_${getLineNumber(child)}`);
        }
        break;
      }
      
      case ts.SyntaxKind.IfStatement:
      case ts.SyntaxKind.ConditionalExpression:
        operations.add(`condition:line_${getLineNumber(child)}`);
        break;
      
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.ForInStatement:
        operations.add(`loop:line_${getLineNumber(child)}`);
        break;
      
      case ts.SyntaxKind.TryStatement:
        operations.add(`try:line_${getLineNumber(child)}`);
        break;
      
      case ts.SyntaxKind.ThrowStatement:
        operations.add(`throw:line_${getLineNumber(child)}`);
        break;
      
      case ts.SyntaxKind.AwaitExpression:
        operations.add(`await:line_${getLineNumber(child)}`);
        break;
      
      case ts.SyntaxKind.NewExpression: {
        const newExpr = child as any;
        // Try to get class name from symbol first, fallback to getText()
        const expr = newExpr.getExpression();
        const className = Node.isIdentifier(expr) 
          ? (expr.getSymbol()?.getName() || cache.getText(expr))
          : cache.getText(expr);
        operations.add(`new:${className}`);
        break;
      }
      
      case ts.SyntaxKind.ReturnStatement:
        operations.add(`return:line_${getLineNumber(child)}`);
        break;
    }
  });

  return operations.size;
}

// Export cache clear function for memory management
export function clearCache(): void {
  cache.clear();
}