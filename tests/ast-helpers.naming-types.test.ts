import { describe, it, expect } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import { checkFunctionNaming } from '../src/ast-helpers';

describe('naming & inferred/explicit return types (via checkFunctionNaming)', () => {
  it('warns for boolean-returning functions without boolean prefix', () => {
    const code = `
      function ready(){ return true }
    `;
    const { sf } = fromCode(code);
    const msg = checkFunctionNaming(fnByName(sf,'ready')!);
    expect(msg).toMatch(/Boolean function .* should start with is\/has\/should\/can/);
  });

  it('accepts proper boolean prefix', () => {
    const code = `
      function isReady(): boolean { return Math.random() > 0.5 }
    `;
    const { sf } = fromCode(code);
    expect(checkFunctionNaming(fnByName(sf,'isReady')!)).toBeNull();
  });

  it('flags generic or too-short names', () => {
    const code = `
      function fn(){ return 1 }
      function handler(){ return 1 }
      function run(){ return 1 }
      function execute(){ return 1 }
    `;
    const { sf } = fromCode(code);
    expect(checkFunctionNaming(fnByName(sf,'fn')!)).toMatch(/too short|too generic/);
    expect(checkFunctionNaming(fnByName(sf,'handler')!)).toMatch(/too generic/);
    expect(checkFunctionNaming(fnByName(sf,'run')!)).toMatch(/too generic/);
    expect(checkFunctionNaming(fnByName(sf,'execute')!)).toMatch(/too generic/);
  });

  it('flags too long names (> 40 chars)', () => {
    const longName = 'thisFunctionNameIsDefinitelyWayTooLongForOurTasteXYZ';
    const code = `
      function ${longName}(){ return 1 }
    `;
    const { sf } = fromCode(code);
    const msg = checkFunctionNaming(fnByName(sf,longName)!);
    expect(msg).toMatch(/too long/);
  });

  it('boolean inference from comparisons, negation, Array.isArray, includes, property .checked', () => {
    const code = `
      function compare(a:any,b:any){ return a === b }
      function not(a:any){ return !a }
      function isArr(x:any){ return Array.isArray(x) }
      function contains(s:string){ return s.includes('x') }
      function checked(obj:any){ return obj.checked }
    `;
    const { sf } = fromCode(code);
    expect(checkFunctionNaming(fnByName(sf,'compare')!)).toMatch(/Boolean function/);
    expect(checkFunctionNaming(fnByName(sf,'not')!)).toMatch(/Boolean function/);
    // has boolean prefix already -> ok
    expect(checkFunctionNaming(fnByName(sf,'isArr')!)).toBeNull();
    // contains -> should warn (no boolean prefix)
    expect(checkFunctionNaming(fnByName(sf,'contains')!)).toMatch(/Boolean function/);
    expect(checkFunctionNaming(fnByName(sf,'checked')!)).toMatch(/Boolean function/);
  });

  it('void and mixed types edge-cases', () => {
    const code = `
      function doThing(){ if(Math.random()>2){ return; } }
      function maybe(x:boolean){ if(x){ return true } else { return null } }
      function messy(x:any){ if(x){ return 1 } else { return 'a' } }
    `;
    const { sf } = fromCode(code);
    expect(checkFunctionNaming(fnByName(sf,'doThing')!)).toBeNull(); // void -> no naming constraint
    expect(checkFunctionNaming(fnByName(sf,'maybe')!)).toMatch(/Boolean function/); // boolean | null -> boolean
    expect(checkFunctionNaming(fnByName(sf,'messy')!)).toBeNull(); // unknown mix -> no boolean rule
  });
});