// Test file to validate our refactoring works correctly
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isFunctionLike, 
  getFunctionName, 
  getFunctionLineCount, 
  getFunctionParameterCount,
  hasAsyncModifier,
  isNestingNode,
  isFunctionNode
} from '../src/ast-helpers';
import { Node, Project, SyntaxKind } from 'ts-morph';

describe('AST Helpers - Refactored utilities', () => {
  let project: Project;

  beforeEach(() => {
    project = new Project({
      compilerOptions: { noLib: true },
      skipAddingFilesFromTsConfig: true
    });
  });

  it('should correctly identify function-like nodes', () => {
    const sourceFile = project.createSourceFile('test1.ts', `
      function regularFunction() {}
      class TestClass {
        method() {}
        get accessor() { return 1; }
        constructor() {}
      }
      const arrowFunc = () => {};
    `);

    const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);
    const arrows = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
    const constructors = sourceFile.getDescendantsOfKind(SyntaxKind.Constructor);
    const getters = sourceFile.getDescendantsOfKind(SyntaxKind.GetAccessor);

    expect(isFunctionLike(functions[0])).toBe(true);
    expect(isFunctionLike(methods[0])).toBe(true);
    expect(isFunctionLike(arrows[0])).toBe(true);
    expect(isFunctionLike(constructors[0])).toBe(true);
    expect(isFunctionLike(getters[0])).toBe(true);
  });

  it('should extract function names correctly', () => {
    const sourceFile = project.createSourceFile('test2.ts', `
      function namedFunction() {}
      class TestClass {
        namedMethod() {}
      }
      const arrowFunc = () => {};
      const obj = {
        methodInObj() {}
      };
    `);

    const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);
    const arrows = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);

    expect(getFunctionName(functions[0])).toBe('namedFunction');
    expect(getFunctionName(methods[0])).toBe('namedMethod');
    expect(getFunctionName(arrows[0])).toBe('arrowFunc');
  });

  it('should count function parameters correctly', () => {
    const sourceFile = project.createSourceFile('test3.ts', `
      function noParams() {}
      function threeParams(a: number, b: string, c: boolean) {}
      class TestClass {
        method(x: number, y: number) {}
      }
    `);

    const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);

    expect(getFunctionParameterCount(functions[0])).toBe(0);
    expect(getFunctionParameterCount(functions[1])).toBe(3);
    expect(getFunctionParameterCount(methods[0])).toBe(2);
  });

  it('should detect async functions correctly', () => {
    const sourceFile = project.createSourceFile('test4.ts', `
      async function asyncFunc() {}
      function syncFunc() {}
      class TestClass {
        async asyncMethod() {}
        syncMethod() {}
      }
    `);

    const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
    const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);

    expect(hasAsyncModifier(functions[0])).toBe(true);
    expect(hasAsyncModifier(functions[1])).toBe(false);
    expect(hasAsyncModifier(methods[0])).toBe(true);
    expect(hasAsyncModifier(methods[1])).toBe(false);
  });

  it('should identify nesting nodes correctly', () => {
    const sourceFile = project.createSourceFile('test5.ts', `
      function test() {
        if (true) {
          for (let i = 0; i < 10; i++) {
            while (true) {
              break;
            }
          }
        }
      }
    `);

    const ifStmt = sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement)[0];
    const forStmt = sourceFile.getDescendantsOfKind(SyntaxKind.ForStatement)[0];
    const whileStmt = sourceFile.getDescendantsOfKind(SyntaxKind.WhileStatement)[0];
    const funcDecl = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)[0];

    expect(isNestingNode(ifStmt)).toBe(true);
    expect(isNestingNode(forStmt)).toBe(true);
    expect(isNestingNode(whileStmt)).toBe(true);
    expect(isNestingNode(funcDecl)).toBe(false);
  });

  it('should calculate function line count correctly', () => {
    const sourceFile = project.createSourceFile('test6.ts', `function test() {
  const a = 1;
  const b = 2;
  return a + b;
}`);

    const func = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration)[0];
    const lineCount = getFunctionLineCount(func);
    
    expect(lineCount).toBe(5); // 5 lines total
  });
});
