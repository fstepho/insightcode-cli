import { describe, it, expect } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import { getMaxNestingDepth } from '../src/ast-helpers';

describe('nesting depth', () => {
  it('counts control-structure depth, ignores nested functions', () => {
    const code = `
      function depth(){
        if (true) {
          for (let i=0;i<1;i++) {
            const inner = () => { if(false){ while(false){} } }; // should be ignored
          }
        }
      }
    `;
    const { sf } = fromCode(code);
    expect(getMaxNestingDepth(fnByName(sf,'depth')!)).toBe(2);
  });

  it('handles switch, try, and conditional expression (?:)', () => {
    const code = `
      function structures(x:number){
        try {
          switch(x){ case 1: break; default: break; }
          const y = x > 0 ? 1 : 0;
        } catch(e) {}
      }
    `;
    const { sf } = fromCode(code);
    // try/switch/conditional present sequentially -> depth >= 1
    const code2 = `
      function nested(){
        try { if(true){ while(false){} } } catch(e) {}
      }
    `;
    const { sf: sf2 } = fromCode(code2);
    expect(getMaxNestingDepth(fnByName(sf,'structures')!)).toBeGreaterThanOrEqual(1);
    // try -> 1, if -> 2, while -> 3
    expect(getMaxNestingDepth(fnByName(sf2,'nested')!)).toBe(3);
  });

  it('recognizes for..of and for..in', () => {
    const code = `
      function loops(o:any){
        for (const k in o) { if(k){} }
        for (const v of [1,2]) { if(v){} }
      }
    `;
    const { sf } = fromCode(code);
    expect(getMaxNestingDepth(fnByName(sf,'loops')!)).toBe(2);
  });

  it('ternary expressions impact on nesting depth', () => {
    // Simple ternary - should this count as nesting depth 1?
    const simpleTernary = `
      function simple() {
        const x = condition ? valueA : valueB;
        return x;
      }
    `;
    
    // Equivalent if-else - clearly depth 1
    const equivalentIf = `
      function equivalent() {
        let x;
        if (condition) {
          x = valueA;
        } else {
          x = valueB;
        }
        return x;
      }
    `;
    
    // Nested ternary - this gets complex
    const nestedTernary = `
      function nested() {
        const x = a ? (b ? c : d) : e;
        return x;
      }
    `;

    const { sf: sf1 } = fromCode(simpleTernary);
    const { sf: sf2 } = fromCode(equivalentIf);
    const { sf: sf3 } = fromCode(nestedTernary);
    
    const simpleTernaryDepth = getMaxNestingDepth(fnByName(sf1,'simple')!);
    const ifElseDepth = getMaxNestingDepth(fnByName(sf2,'equivalent')!);
    const nestedTernaryDepth = getMaxNestingDepth(fnByName(sf3,'nested')!);
    
    console.log('Simple ternary depth:', simpleTernaryDepth);
    console.log('If-else depth:', ifElseDepth);  
    console.log('Nested ternary depth:', nestedTernaryDepth);
    
    // New behavior - simple ternary doesn't count as nesting, only nested ones do
    expect(simpleTernaryDepth).toBe(0); // Simple ternary no longer counts
    expect(ifElseDepth).toBe(1);        // If-else still counts
    expect(nestedTernaryDepth).toBe(1); // Only the outer nested conditional counts
  });
});