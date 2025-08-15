import { describe, it, expect } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import { SyntaxKind } from 'ts-morph';
import { analyzeResponsibilities, isValidationOperation } from '../src/ast-helpers';

function respSet(node: any) {
  const res = analyzeResponsibilities(node);
  return res.responsibilities;
}

describe('responsibilities (aggregate categories)', () => {
  it('detects IO, transformation (incl. chaining), presentation, business-logic, state-mutation, error-handling', () => {
    const code = `
      async function combo(param:any){
        try {
          const res = await fetch('/api');           // io
          const xs = [1,2,3].map(x=>x*2).filter(x=>x>2).reduce((a,b)=>a+b,0); // transformation (chained)
          const total = calculateTotal(xs);          // business-logic
          param.items.push(total);                   // state-mutation (param)
          document.body.innerHTML = '<div/>'         // presentation via property assignment
        } catch (e) { const x=1; return x }         // error-handling (substantial)
      }
      function calculateTotal(n:number){ return n }
    `;
    const { sf } = fromCode(code);
    const set = respSet(fnByName(sf,'combo')!);
    expect(set.has('io')).toBe(true);
    expect(set.has('transformation')).toBe(true);
    expect(set.has('business-logic')).toBe(true);
    expect(set.has('state-mutation')).toBe(true);
    expect(set.has('presentation')).toBe(true);
    expect(set.has('error-handling')).toBe(true);
  });

  it('detects DB and storage IO (prisma.*, localStorage)', () => {
    const code = `
      async function db(){ return prisma.user.findMany() }
      function storage(){ return localStorage.setItem('k','v') }
    `;
    const { sf } = fromCode(code);
    expect(respSet(fnByName(sf,'db')!).has('io')).toBe(true);
    expect(respSet(fnByName(sf,'storage')!).has('io')).toBe(true);
  });

  it('detects presentation via JSX and transformation inside JSX', () => {
    const code = `
      const Comp = () => <div>{[1,2,3].map(x=>x+1)}</div>;
    `;
    const { sf } = fromCode(code, 'file.tsx');
    const comp = fnByName(sf,'Comp')!;
    const set = respSet(comp);
    expect(set.has('presentation')).toBe(true);
    expect(set.has('transformation')).toBe(true);
  });

  it('ignores strings and nested functions', () => {
    const code = `
      function safe(){
        const s = "fetch('/x')"; // only a string, should be ignored
        const inner = () => { localStorage.setItem('k','v'); } // nested, should be ignored
      }
    `;
    const { sf } = fromCode(code);
    const set = respSet(fnByName(sf,'safe')!);
    expect(set.size).toBe(0);
  });
});

describe('isValidationOperation (direct tests)', () => {
  it('recognizes schema libs and methods', () => {
    const code = `
      function v1(){ return zod.object({}).parse({}) }
      function v2(){ return schema.validate(data) }
      function v3(){ return validator.isEmail('a@b.com') }
      function v4(){ return validateEmail('x') }
    `;
    const { sf } = fromCode(code);
    // v1: any call within should be recognized (zod.object or .parse)
    {
      const fn = fnByName(sf,'v1')!;
      const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);
      expect(calls.some(c => isValidationOperation(c.getText(), c.getExpression()))).toBe(true);
    }
    // v2: schema.validate
    {
      const fn = fnByName(sf,'v2')!;
      const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);
      expect(calls.some(c => isValidationOperation(c.getText(), c.getExpression()))).toBe(true);
    }
    // v3: validator.isEmail
    {
      const fn = fnByName(sf,'v3')!;
      const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);
      expect(calls.some(c => isValidationOperation(c.getText(), c.getExpression()))).toBe(true);
    }
    // v4: validateEmail helper
    {
      const fn = fnByName(sf,'v4')!;
      const calls = fn.getDescendantsOfKind(SyntaxKind.CallExpression);
      expect(calls.some(c => isValidationOperation(c.getText(), c.getExpression()))).toBe(true);
    }
  });

  it('returns false for unrelated calls', () => {
    const code = `
      function nope(){ return parseInt('1',10) }
      function notSchema(){ return service.validate(x) }
    `;
    const { sf } = fromCode(code);
    const calls = sf.getDescendantsOfKind(SyntaxKind.CallExpression);
    // both should be false
    for (const call of calls) {
      expect(isValidationOperation(call.getText(), call.getExpression())).toBe(false);
    }
  });
});