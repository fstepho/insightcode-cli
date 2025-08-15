import { describe, it, expect } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import { SyntaxKind } from 'ts-morph';
import {
  isFunctionLike,
  getFunctionName,
  getFunctionLineCount,
  getFunctionParameterCount,
  clearCache,
} from '../src/ast-helpers';

describe('form: shape/name/params/lines', () => {
  it('isFunctionLike: detects all function-like constructs', () => {
    const code = `
      function f() {}
      class C { m(){} get g(){return 1} set s(v:number){} constructor(){} }
      const a = () => {}
      const b = function() {}
    `;
    const { sf } = fromCode(code);
    const f = fnByName(sf, 'f')!;
    const m = fnByName(sf, 'm')!;
    const g = fnByName(sf, 'g')!;
    const s = fnByName(sf, 's')!;
    const ctor = sf.getClasses()[0].getConstructors()[0];
    const a = fnByName(sf, 'a')!;
    const b = fnByName(sf, 'b')!;

    for (const n of [f, m, g, s, ctor, a, b]) expect(isFunctionLike(n)).toBe(true);
  });

  it('getFunctionName: handles decl/arrow/method/property', () => {
    const code = `
      function f() {}
      const g = () => {}
      const o = { h: () => {} };
      class C { p = () => {} }
      const x = function named(){};
    `;
    const { sf } = fromCode(code);
    const f = fnByName(sf, 'f')!;
    const g = fnByName(sf, 'g')!;

    // class property: we must use the ArrowFunction initializer, not the PropertyDeclaration
    const pDecl = sf.getClass('C')!.getProperty('p')!;
    const p = pDecl.getInitializerIfKindOrThrow(SyntaxKind.ArrowFunction);

    // property assignment name (o.h)
    const propAssign = sf.getDescendantsOfKind(SyntaxKind.PropertyAssignment)[0]!;
    const h = propAssign.getInitializerOrThrow();

    const namedExpr = fnByName(sf, 'x')!; // function expression with name

    expect(getFunctionName(f)).toBe('f');
    expect(getFunctionName(g)).toBe('g');
    expect(getFunctionName(p)).toBe('p');
    expect(getFunctionName(h)).toBe('h');
    expect(getFunctionName(namedExpr)).toBe('named');

    clearCache();
    // After cache clear, values should stay consistent
    expect(getFunctionName(f)).toBe('f');
  });

  it('getFunctionLineCount: counts by function body (inclusive)', () => {
    const code = `
      function multi(){

  const x = 1;
  if(x){
    return x;
  }
}
      const oneLine = () => 42;
      const block = () => {
 return 1; 
};
    `;
    const { sf } = fromCode(code);
    const multi = fnByName(sf, 'multi')!;
    const oneLine = fnByName(sf, 'oneLine')!;
    const block = fnByName(sf, 'block')!;
    expect(getFunctionLineCount(multi)).toBeGreaterThan(1);
    expect(getFunctionLineCount(oneLine)).toBe(1);
    expect(getFunctionLineCount(block)).toBeGreaterThanOrEqual(2);
  });

  it('getFunctionParameterCount: covers decl/method/ctor/get/set/rest/default', () => {
    const code = `
      function f(a,b=1,...c) {}
      class C { constructor(x:number,y?:string){} get g(){return 1} set s(v:number){} m(p:string){} }
      const a = (x:number) => {}
    `;
    const { sf } = fromCode(code);
    expect(getFunctionParameterCount(fnByName(sf,'f')!)).toBe(3);
    const C = sf.getClass('C')!;
    expect(getFunctionParameterCount(C.getConstructors()[0]!)).toBe(2);
    expect(getFunctionParameterCount(C.getGetAccessor('g')!)).toBe(0);
    expect(getFunctionParameterCount(C.getSetAccessor('s')!)).toBe(1);
    expect(getFunctionParameterCount(fnByName(sf,'m')!)).toBe(1);
    expect(getFunctionParameterCount(fnByName(sf,'a')!)).toBe(1);
  });
});