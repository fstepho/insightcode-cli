import { describe, it, expect } from 'vitest';
import { analyzeDependencies } from '../src/dependencyAnalyzer';
import { FileDetail } from '../src/types';

describe('Dependency Analyzer', () => {
  const createFileDetail = (file: string, content: string): FileDetail => ({
    file,
    metrics: {
      complexity: 1,
      loc: 10,
      functionCount: 1,
      duplication: 0
    },
    importance: {
      usageCount: 0,
      usageRank: 0,
      isEntryPoint: false,
      isCriticalPath: false
    },
    issues: [],
    healthScore: 100,
    isCritical: false,
    // Store the content for dependency analysis
    content
  } as any);

  it('should detect no dependencies for isolated files', () => {
    const files = [
      createFileDetail('isolated1.ts', 'const x = 1; console.log(x);'),
      createFileDetail('isolated2.ts', 'const y = 2; console.log(y);')
    ];

    const result = analyzeDependencies(files);

    files.forEach(file => {
      expect(result.get(file.file)).toBe(0);
    });
  });

  it('should detect import dependencies', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main.ts', 'import { helper } from "./utils"; console.log(helper());')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(1); // utils.ts is used by main.ts
    expect(result.get('main.ts')).toBe(0); // main.ts is not used by others
  });

  it('should detect multiple dependencies', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main1.ts', 'import { helper } from "./utils"; console.log(helper());'),
      createFileDetail('main2.ts', 'import { helper } from "./utils"; console.log(helper());'),
      createFileDetail('main3.ts', 'import { helper } from "./utils"; console.log(helper());')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(3); // utils.ts is used by 3 files
    expect(result.get('main1.ts')).toBe(0);
    expect(result.get('main2.ts')).toBe(0);
    expect(result.get('main3.ts')).toBe(0);
  });

  it('should handle circular dependencies', () => {
    const files = [
      createFileDetail('a.ts', 'import { funcB } from "./b"; export function funcA() { return funcB(); }'),
      createFileDetail('b.ts', 'import { funcA } from "./a"; export function funcB() { return funcA(); }')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('a.ts')).toBe(1); // a.ts is used by b.ts
    expect(result.get('b.ts')).toBe(1); // b.ts is used by a.ts
  });

  it('should handle different import styles', () => {
    const files = [
      createFileDetail('utils.ts', 'export default function main() {} export function helper() {}'),
      createFileDetail('import1.ts', 'import main from "./utils";'),
      createFileDetail('import2.ts', 'import { helper } from "./utils";'),
      createFileDetail('import3.ts', 'import * as utils from "./utils";'),
      createFileDetail('import4.ts', 'import main, { helper } from "./utils";')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(4); // utils.ts is used by 4 different files
  });

  it('should handle dynamic imports', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main.ts', 'const utils = await import("./utils"); console.log(utils.helper());')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(1); // utils.ts is dynamically imported
    expect(result.get('main.ts')).toBe(0);
  });

  it('should handle require statements', () => {
    const files = [
      createFileDetail('utils.js', 'module.exports = { helper: () => "help" };'),
      createFileDetail('main.js', 'const { helper } = require("./utils"); console.log(helper());')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.js')).toBe(1); // utils.js is required by main.js
    expect(result.get('main.js')).toBe(0);
  });

  it('should ignore external dependencies', () => {
    const files = [
      createFileDetail('main.ts', 'import React from "react"; import { helper } from "./utils";'),
      createFileDetail('utils.ts', 'export function helper() { return "help"; }')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(1); // Only local dependency counted
    expect(result.get('main.ts')).toBe(0);
  });

  it('should handle complex dependency chains', () => {
    const files = [
      createFileDetail('a.ts', 'export function a() { return "a"; }'),
      createFileDetail('b.ts', 'import { a } from "./a"; export function b() { return a() + "b"; }'),
      createFileDetail('c.ts', 'import { b } from "./b"; export function c() { return b() + "c"; }'),
      createFileDetail('d.ts', 'import { c } from "./c"; export function d() { return c() + "d"; }'),
      createFileDetail('main.ts', 'import { d } from "./d"; console.log(d());')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('a.ts')).toBe(1); // Used by b.ts
    expect(result.get('b.ts')).toBe(1); // Used by c.ts
    expect(result.get('c.ts')).toBe(1); // Used by d.ts
    expect(result.get('d.ts')).toBe(1); // Used by main.ts
    expect(result.get('main.ts')).toBe(0); // Not used by others
  });

  it('should handle files with no imports or exports', () => {
    const files = [
      createFileDetail('script.ts', 'console.log("Hello world");'),
      createFileDetail('config.ts', 'const CONFIG = { debug: true };')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('script.ts')).toBe(0);
    expect(result.get('config.ts')).toBe(0);
  });

  it('should handle relative path variations', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main1.ts', 'import { helper } from "./utils";'),
      createFileDetail('main2.ts', 'import { helper } from "./utils.ts";')
    ];

    const result = analyzeDependencies(files);

    // Both should be counted as dependencies to utils.ts
    expect(result.get('utils.ts')).toBe(2);
  });

  it('should handle re-exports', () => {
    const files = [
      createFileDetail('base.ts', 'export function baseFunc() { return "base"; }'),
      createFileDetail('utils.ts', 'export { baseFunc } from "./base";'),
      createFileDetail('main.ts', 'import { baseFunc } from "./utils";')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('base.ts')).toBe(1); // Used by utils.ts
    expect(result.get('utils.ts')).toBe(1); // Used by main.ts
    expect(result.get('main.ts')).toBe(0);
  });

  it('should handle type-only imports', () => {
    const files = [
      createFileDetail('types.ts', 'export interface User { name: string; }'),
      createFileDetail('main.ts', 'import type { User } from "./types"; const user: User = { name: "test" };')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('types.ts')).toBe(1); // Type imports should count as dependencies
    expect(result.get('main.ts')).toBe(0);
  });

  it('should handle malformed import statements', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main.ts', 'import { helper } from; // malformed import')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(0); // Malformed import should not count
    expect(result.get('main.ts')).toBe(0);
  });

  it('should handle comments containing import-like text', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main.ts', '// TODO: import { helper } from "./utils"; \nconsole.log("test");')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(0); // Commented imports should not count
    expect(result.get('main.ts')).toBe(0);
  });

  it('should handle string literals containing import-like text', () => {
    const files = [
      createFileDetail('utils.ts', 'export function helper() { return "help"; }'),
      createFileDetail('main.ts', 'const code = "import { helper } from \\"./utils\\";"; console.log(code);')
    ];

    const result = analyzeDependencies(files);

    expect(result.get('utils.ts')).toBe(0); // String literals should not count as imports
    expect(result.get('main.ts')).toBe(0);
  });
});