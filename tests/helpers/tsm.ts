// Lightweight helpers around ts-morph for in-memory testing
import { Project, Node, SourceFile } from 'ts-morph';
import * as ts from 'typescript';

export function makeProject() {
  return new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    },
  });
}

export function fromCode(code: string, filePath = "file.ts") {
  const project = makeProject();
  const sf = project.createSourceFile(filePath, code, { overwrite: true });
  return { project, sf };
}

// Find the first function-like node by name (function decl, method, arrow, function expr)
export function fnByName(sf: SourceFile, name: string) {
  // function f() {}
  const fDecl = sf.getFunctions().find(f => f.getName() === name);
  if (fDecl) return fDecl;

  // class C { m(){} } or get/set/constructor
  for (const c of sf.getClasses()) {
    const m = c.getMembers().find((m: any) => m.getName && m.getName() === name);
    if (m) return m as any;
  }

  // const g = () => {}
  for (const v of sf.getVariableDeclarations()) {
    if (v.getName() === name) {
      const init = v.getInitializer();
      if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) return init;
    }
  }

  // const o = { h: () => {} }
  // (no-op) property assignments are handled inline in tests when needed
  // Not strictly needed: we handle property assignments ad-hoc in tests when needed

  // Fallback: any function-like with matching name somewhere
  return sf.forEachDescendant((n) => {
    if (Node.isFunctionDeclaration(n) && n.getName() === name) return n;
    if (Node.isMethodDeclaration(n) && n.getName() === name) return n;
    if (Node.isGetAccessorDeclaration(n) && n.getName() === name) return n;
    if (Node.isSetAccessorDeclaration(n) && n.getName() === name) return n;
    if (Node.isConstructorDeclaration(n) && name === 'constructor') return n;
    if (Node.isPropertyDeclaration(n) && n.getName() === name) return n;
    if (Node.isVariableDeclaration(n) && n.getName() === name) {
      const init = n.getInitializer();
      if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) return init;
    }
    return undefined;
  });
}

export function first<T extends Node>(sf: SourceFile, pred: (n: Node) => n is T): T | undefined {
  return sf.forEachDescendant((n) => (pred(n) ? (n as T) : undefined));
}