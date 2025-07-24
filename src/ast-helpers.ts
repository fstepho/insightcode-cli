// File: src/ast-helpers.ts
import { Node, SyntaxKind } from 'ts-morph';

/**
 * Collection of AST utility functions shared between file-detail-builder.ts
 * This module centralizes common TypeScript AST analysis functions to avoid duplication.
 */

/**
 * Determine if a node represents a function-like construct.
 * 
 * @description
 * Type guard for identifying function-like constructs in TypeScript AST.
 * Covers the main function types used in this analysis.
 * 
 * @rationale
 * Used to prevent traversing into nested functions during complexity calculation,
 * ensuring each function's complexity is calculated independently.
 * 
 * @param node - The AST node to check
 * @returns true if the node is a function-like construct
 */
export function isFunctionLike(node: Node): boolean {
  const kind = node.getKind();
  return kind === SyntaxKind.FunctionDeclaration ||
         kind === SyntaxKind.MethodDeclaration ||
         kind === SyntaxKind.ArrowFunction ||
         kind === SyntaxKind.FunctionExpression ||
         kind === SyntaxKind.Constructor ||
         kind === SyntaxKind.GetAccessor ||
         kind === SyntaxKind.SetAccessor;
}

/**
 * Extract the name of a function from its AST node.
 * 
 * @description
 * Handles various function declaration patterns to extract meaningful names.
 * Falls back to '<anonymous>' for unnamed functions.
 * 
 * @param node - The function node to analyze
 * @returns The function name or '<anonymous>'
 */
export function getFunctionName(node: Node): string {
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
  
  if (Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    const parent = node.getParent();
    if (Node.isVariableDeclaration(parent)) {
      return parent.getName();
    }
    if (Node.isPropertyAssignment(parent)) {
      // In ts-morph, PropertyAssignment has getNameNode() method
      return parent.getNameNode().getText();
    }
  }
  
  return '<anonymous>';
}

/**
 * Calculate the line count of a function.
 * 
 * @description
 * Counts the total lines from function start to end, inclusive.
 * Used for identifying long functions that may need refactoring.
 * 
 * @param node - The function node to analyze
 * @returns Number of lines the function spans
 */
export function getFunctionLineCount(node: Node): number {
  const sourceFile = node.getSourceFile();
  const start = sourceFile.getLineAndColumnAtPos(node.getStart());
  const end = sourceFile.getLineAndColumnAtPos(node.getEnd());
  return end.line - start.line + 1;
}

/**
 * Count the number of parameters in a function.
 * 
 * @description
 * Counts formal parameters to identify functions with too many parameters.
 * Used for detecting code smells related to function complexity.
 * 
 * @param node - The function node to analyze
 * @returns Number of parameters
 */
export function getFunctionParameterCount(node: Node): number {
  if (Node.isFunctionDeclaration(node) || 
      Node.isMethodDeclaration(node) || 
      Node.isArrowFunction(node) || 
      Node.isFunctionExpression(node) || 
      Node.isConstructorDeclaration(node)) {
    return node.getParameters().length;
  }
  return 0;
}

/**
 * Check if a function has async modifier.
 * 
 * @description
 * Detects async functions for architectural pattern analysis.
 * Used in contextExtractor for identifying async-heavy patterns.
 * 
 * @param node - The function node to check
 * @returns true if the function is async
 */
export function hasAsyncModifier(node: Node): boolean {
  if (Node.isFunctionDeclaration(node) || Node.isMethodDeclaration(node) || 
      Node.isArrowFunction(node) || Node.isFunctionExpression(node)) {
    return node.isAsync();
  }
  return false;
}

/**
 * Check if node is a nesting node (block, if, for, while).
 * 
 * @description
 * Identifies control structures that contribute to nesting depth.
 * Used for detecting deep nesting patterns.
 * 
 * @param node - The AST node to check
 * @returns true if the node creates nesting
 */
export function isNestingNode(node: Node): boolean {
  return Node.isBlock(node) || 
         Node.isIfStatement(node) || 
         Node.isForStatement(node) || 
         Node.isWhileStatement(node) ||
         Node.isForInStatement(node) ||
         Node.isForOfStatement(node) ||
         Node.isDoStatement(node);
}

/**
 * Check if node is a function node (any type).
 * 
 * @description
 * Broader check than isFunctionLike, includes all function-related nodes.
 * Used for pattern detection and AST traversal logic.
 * 
 * @param node - The AST node to check
 * @returns true if the node is any type of function
 */
export function isFunctionNode(node: Node): boolean {
  return Node.isFunctionDeclaration(node) || 
         Node.isMethodDeclaration(node) || 
         Node.isArrowFunction(node) || 
         Node.isFunctionExpression(node) ||
         Node.isConstructorDeclaration(node);
}
