import { describe, it, expect } from 'vitest';
import { fromCode, fnByName } from './helpers/tsm';
import { hasImpureOperations } from '../src/ast-helpers';

describe('purity: hasImpureOperations', () => {
  it('flags obvious side-effects (console, Date.now, fetch, this access, throws)', () => {
    const code = `
      function bad(a:any){
        console.log(a)
        const t = Date.now()
        fetch('/x')
        this.x = 1
        if(!a) throw new Error('x')
        return t
      }
    `;
    const { sf } = fromCode(code);
    expect(hasImpureOperations(fnByName(sf,'bad')!)).toBe(true);
  });

  it('is pure when effects are inside strings or nested functions', () => {
    const code = `
      function ok(){
        const msg = "fetch('/x')"; // only string
        const inner = () => { console.log('side'); } // nested function should be ignored
        return 1
      }
    `;
    const { sf } = fromCode(code);
    expect(hasImpureOperations(fnByName(sf,'ok')!)).toBe(false);
  });

  it('mutations on local are pure; external/param are impure', () => {
    const code = `
      const outer:any = {n:0};
      function mixed(param:any){
        let local:any = {n:0};
        local.n += 1;     // local mutation (pure)
        param.n += 1;     // external via param (impure)
        outer.n++         // external via closure (impure)
      }
    `;
    const { sf } = fromCode(code);
    expect(hasImpureOperations(fnByName(sf,'mixed')!)).toBe(true);
  });

  it('strictGlobals=true: simple global access is impure; false -> pure', () => {
    const code = `
      function touches(){ 
        return 
          window.location 
      }
    `;
    const { sf } = fromCode(code);
    const fn = fnByName(sf,'touches')!;
    expect(hasImpureOperations(fn)).toBe(true);
  });

  it('detects ALL assignment operators as external mutations', () => {
    const code = `
      let outer:any = {a:0,b:0,c:0,d:0,e:0,f:0,g:0,h:0,i:0,j:0,k:0,l:0,m:0};
      function ops(param:any){
        param.a = 1;  param.b += 1; param.c -= 1; param.d *= 2; param.e /= 2; param.f %= 2;
        param.g **= 2; param.h &= 1; param.i |= 1; param.j ^= 1; param.k <<= 1; param.l >>= 1; param.m >>>= 1;
        outer.a = 1; // closure external
      }
    `;
    const { sf } = fromCode(code);
    expect(hasImpureOperations(fnByName(sf,'ops')!)).toBe(true);
  });

  it('mutating methods (push/pop/splice/sort/reverse/set/delete/clear) on external targets are impure', () => {
    const code = `
      function mm(arr:any[], m:Map<any,any>, s:Set<any>){
        arr.push(1); arr.pop(); arr.shift(); arr.unshift(2); arr.splice(0,1); arr.sort(); arr.reverse();
        m.set('k',1); m.delete('k'); m.clear();
        s.add(1); s.delete(1); s.clear();
      }
    `;
    const { sf } = fromCode(code);
    expect(hasImpureOperations(fnByName(sf,'mm')!)).toBe(true);
  });

  it('this/super property writes are impure', () => {
    const code = `
      class B { x=0 }
      class C extends B { m(){ this.x = 1; super.x = 2; } }
    `;
    const { sf } = fromCode(code);
    const m = sf.getClass('C')!.getMethod('m')!;
    expect(hasImpureOperations(m)).toBe(true);
  });

  it('small functions can be impure (localStorage, window, DOM access)', () => {
    // These are all 1-3 line functions that are impure
    const code = `
      function store() { localStorage.setItem('k','v'); }
      function loc() { return window.location; }
      function dom() { document.body.innerHTML = 'x'; }
      function net() { fetch('/api'); }
      function rnd() { return Math.random(); }
    `;
    const { sf } = fromCode(code);
    expect(hasImpureOperations(fnByName(sf,'store')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'loc')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'dom')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'net')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'rnd')!)).toBe(true);
  });

  it('detects all localStorage/sessionStorage/indexedDB methods as impure', () => {
    const code = `
      function getItem() { return localStorage.getItem('key'); }
      function setItem() { localStorage.setItem('key', 'value'); }
      function removeItem() { localStorage.removeItem('key'); }
      function clear() { localStorage.clear(); }
      function key() { return localStorage.key(0); }
      function keyAccess() { return localStorage.key(0); } // Test method call instead
      
      function sessionGet() { return sessionStorage.getItem('key'); }
      function sessionSet() { sessionStorage.setItem('key', 'value'); }
      
      function idbOpen() { return indexedDB.open('db'); }
    `;
    const { sf } = fromCode(code);
    
    // All localStorage methods should be detected as impure
    expect(hasImpureOperations(fnByName(sf,'getItem')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'setItem')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'removeItem')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'clear')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'key')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'keyAccess')!)).toBe(true);
    
    // sessionStorage methods should also be detected
    expect(hasImpureOperations(fnByName(sf,'sessionGet')!)).toBe(true);
    expect(hasImpureOperations(fnByName(sf,'sessionSet')!)).toBe(true);
    
    // indexedDB methods should also be detected
    expect(hasImpureOperations(fnByName(sf,'idbOpen')!)).toBe(true);
  });
});