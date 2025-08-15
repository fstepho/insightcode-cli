import { describe, it, expect } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import { countDistinctOperations } from '../src/ast-helpers';

describe('countDistinctOperations', () => {
  it('counts calls, assign/inc, control flow, await, new, return', () => {
    const code = `
      async function ops(){
        let a=0; a+=1; a++;
        if(a>0){ for(const x of [1]){ await fetch('/x') } }
        try { const y = new Date(); } catch(e) { }
        foo(); obj.m(); ((()=>foo()))();
        return a;
      }
      function foo(){}
      const obj = { m(){}};
    `;
    const { sf } = fromCode(code);
    const n = countDistinctOperations(fnByName(sf,'ops')!);
    expect(n).toBeGreaterThanOrEqual(11); // 11–12 attendus
  });


  it('dedupes identifier and method calls by name', () => {
    const code = `
      function calls(){ foo(); foo(); obj.m(); obj.m(); }
      function foo(){}
      const obj = { m(){}};
    `;
    const { sf } = fromCode(code);
    const n = countDistinctOperations(fnByName(sf,'calls')!);
    // only two unique call kinds: func:foo and method:m
    expect(n).toBe(2);
  });

  it('ignores operations inside nested functions', () => {
    const code = `
      function parent(){ function inner(){ foo(); } foo(); }
      function foo(){}
    `;
    const { sf } = fromCode(code);
    const n = countDistinctOperations(fnByName(sf,'parent')!);
    // only the outer foo() should count
    expect(n).toBe(1);
  });
});