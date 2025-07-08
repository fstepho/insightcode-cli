# InsightCode Benchmark Report (Full Project Analysis)

> Generated on 2025-07-08T22:37:31.314Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 78.83s |
| **Total Lines of Code** | 4,080,821 |
| **Analysis Speed** | 51,767 lines/sec |

## Benchmark Leaderboard

| Category | Champion 🏆 | Challenger ⚠️ | Metric |
|---|---|---|---|
| **Best Score** | `uuid` (89/100) | `lodash` (33/100) | Overall Score |
| **Lowest Complexity** | `uuid` (2.60) | `lodash` (170.90) | Avg. Complexity |
| **Lowest Duplication** | `chalk` (4.30%) | `typescript` (63.70%) | Avg. Duplication |

## Complexity Distribution: The "Monolith" Indicator

A high Standard Deviation (StdDev) indicates that complexity is heavily concentrated in a few "monolith" files.

| Project | Avg Complexity | StdDev | Profile |
|---|---|---|---|
| `lodash` | 170.90 | **579.56** | Concentrated 🌋 |
| `typescript` | 4.90 | **89.71** | Concentrated 🌋 |
| `eslint` | 12.00 | **82.80** | Concentrated 🌋 |
| `react` | 10.90 | **45.90** | Concentrated 🌋 |
| `vue` | 18.50 | **42.74** | Concentrated 🌋 |
| `jest` | 4.50 | **14.50** | Concentrated 🌋 |
| `chalk` | 8.90 | **13.70** | Evenly Distributed |
| `express` | 4.60 | **10.46** | Concentrated 🌋 |
| `uuid` | 2.60 | **3.02** | Evenly Distributed |

## Code Context Insights for LLM Analysis

### Architecture Overview

| Project | Async Usage | Error Handling | TypeScript | JSX | Test Coverage |
|---|---|---|---|---|---|
| `lodash` | 0/5 | 5/5 | 0/5 | 0/5 | 5/5 |
| `typescript` | 0/5 | 2/5 | 5/5 | 0/5 | 5/5 |
| `eslint` | 1/8 | 8/8 | 0/8 | 0/8 | 7/8 |
| `react` | 0/8 | 6/8 | 0/8 | 0/8 | 7/8 |
| `vue` | 0/5 | 2/5 | 5/5 | 0/5 | 3/5 |
| `jest` | 3/5 | 4/5 | 5/5 | 0/5 | 5/5 |
| `chalk` | 0/5 | 0/5 | 0/5 | 0/5 | 2/5 |
| `express` | 0/5 | 1/5 | 0/5 | 0/5 | 3/5 |
| `uuid` | 0/5 | 0/5 | 4/5 | 0/5 | 2/5 |

### Most Complex Functions Across Projects

| Project | File | Function | Complexity | Lines | Async | Error Handling |
|---|---|---|---|---|---|---|
| `typescript` | `temp-analysis/typescript/src/compiler/checker.ts` | `createTypeChecker` | 16081 | 51349 |  | ✓ |
| `lodash` | `temp-analysis/lodash/vendor/firebug-lite/src/firebug-lite-debug.js` | `<anonymous>` | 3556 | 31176 |  | ✓ |
| `eslint` | `temp-analysis/eslint/tests/performance/jshint.js` | `<anonymous>` | 2164 | 15210 |  | ✓ |
| `eslint` | `temp-analysis/eslint/tests/bench/large.js` | `<anonymous>` | 2079 | 19497 |  | ✓ |
| `lodash` | `temp-analysis/lodash/lodash.js` | `<anonymous>` | 1659 | 17201 |  | ✓ |
| `lodash` | `temp-analysis/lodash/lodash.js` | `runInContext` | 1547 | 15730 |  | ✓ |
| `eslint` | `temp-analysis/eslint/tests/bench/large.js` | `<anonymous>` | 1263 | 6820 |  | ✓ |
| `eslint` | `temp-analysis/eslint/tests/bench/large.js` | `<anonymous>` | 1261 | 6761 |  | ✓ |
| `typescript` | `temp-analysis/typescript/src/compiler/checker.ts` | `createNodeBuilder` | 1228 | 4410 |  |  |
| `lodash` | `temp-analysis/lodash/test/test.js` | `<anonymous>` | 1179 | 27077 |  | ✓ |

### Code Complexity Samples for LLM Analysis

#### lodash

**<anonymous>** (Complexity: 3556)
```typescript
function(){

/*!*************************************************************
 *
 *    Firebug Lite 1.4.0
 *
 *      Copyright (c) 2007, Parakey Inc.
 *      Released under BSD license.
 *      More information: http://getfirebug.com/firebuglite
 *
    // ... more code ...
```

**<anonymous>** (Complexity: 666)
```typescript
function() {
// ************************************************************************************************

// ************************************************************************************************
// Constants

var productionDir = "http://getfirebug.com/releases/lite/";
var bookmarkletVersion = 4;

// ************************************************************************************************
    // ... more code ...
```

#### typescript

**createTypeChecker** (Complexity: 16081)
```typescript
export function createTypeChecker(host: TypeCheckerHost): TypeChecker {
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var deferredDiagnosticsCallbacks: (() => void)[] = [];

    var addLazyDiagnostic = (arg: () => void) => {
        deferredDiagnosticsCallbacks.push(arg);
    };

    // ... more code ...
```

**isDefinitelyReferenceToGlobalSymbolObject** (Complexity: 11)
```typescript
function isDefinitelyReferenceToGlobalSymbolObject(node: Node): boolean {
        if (!isPropertyAccessExpression(node)) return false;
        if (!isIdentifier(node.name)) return false;
        if (!isPropertyAccessExpression(node.expression) && !isIdentifier(node.expression)) return false;
        if (isIdentifier(node.expression)) {
            // Exactly `Symbol.something` and `Symbol` either does not resolve or definitely resolves to the global Symbol
            return idText(node.expression) === "Symbol" && getResolvedSymbol(node.expression) === (getGlobalSymbol("Symbol" as __String, SymbolFlags.Value | SymbolFlags.ExportValue, /*diagnostic*/ undefined) || unknownSymbol);
        }
        if (!isIdentifier(node.expression.expression)) return false;
        // Exactly `globalThis.Symbol.something` and `globalThis` resolves to the global `globalThis`
    // ... more code ...
```

#### eslint

**<anonymous>** (Complexity: 2164)
```typescript
function () {
	var require;
	require = (function (e, t, n) {
		function i(n, s) {
			if (!t[n]) {
				if (!e[n]) {
					var o = typeof require == "function" && require;
					if (!s && o) return o(n, !0);
					if (r) return r(n, !0);
					throw new Error("Cannot find module '" + n + "'");
    // ... more code ...
```

**<anonymous>** (Complexity: 44)
```typescript
function (require, module, exports) {
					(function (process) {
						if (!process.EventEmitter)
							process.EventEmitter = function () {};

						var EventEmitter = (exports.EventEmitter =
							process.EventEmitter);
						var isArray =
							typeof Array.isArray === "function"
								? Array.isArray
    // ... more code ...
```

#### react

**createRenderState** (Complexity: 34)
```typescript
export function createRenderState(
  resumableState: ResumableState,
  nonce: string | void,
  externalRuntimeConfig: string | BootstrapScriptDescriptor | void,
  importMap: ImportMap | void,
  onHeaders: void | ((headers: HeadersDescriptor) => void),
  maxHeadersLength: void | number,
): RenderState {
  const inlineScriptWithNonce =
    nonce === undefined
    // ... more code ...
```

**getChildFormatContext** (Complexity: 20)
```typescript
export function getChildFormatContext(
  parentContext: FormatContext,
  type: string,
  props: Object,
): FormatContext {
  switch (type) {
    case 'noscript':
      return createFormatContext(
        HTML_MODE,
        null,
    // ... more code ...
```

#### vue

**innerResolveTypeElements** (Complexity: 41)
```typescript
function innerResolveTypeElements(
  ctx: TypeResolveContext,
  node: Node,
  scope: TypeScope,
  typeParameters?: Record<string, Node>,
): ResolvedElements {
  if (
    node.leadingComments &&
    node.leadingComments.some(c => c.value.includes('@vue-ignore'))
  ) {
    // ... more code ...
```

**typeElementsToMap** (Complexity: 11)
```typescript
function typeElementsToMap(
  ctx: TypeResolveContext,
  elements: TSTypeElement[],
  scope = ctxToScope(ctx),
  typeParameters?: Record<string, Node>,
): ResolvedElements {
  const res: ResolvedElements = { props: {} }
  for (const e of elements) {
    if (e.type === 'TSPropertySignature' || e.type === 'TSMethodSignature') {
      // capture generic parameters on node's scope
    // ... more code ...
```

#### jest

**setupPreset** (Complexity: 16)
```typescript
async (
  options: Config.InitialOptionsWithRootDir,
  optionsPreset: string,
): Promise<Config.InitialOptionsWithRootDir> => {
  let preset: Config.InitialOptions;
  const presetPath = replaceRootDirInPath(options.rootDir, optionsPreset);
  const presetModule = Resolver.findNodeModule(
    presetPath.startsWith('.')
      ? presetPath
      : path.join(presetPath, PRESET_NAME),
    // ... more code ...
```

**setupBabelJest** (Complexity: 11)
```typescript
(options: Config.InitialOptionsWithRootDir) => {
  const transform = options.transform;
  let babelJest;
  if (transform) {
    const customJSPattern = Object.keys(transform).find(pattern => {
      const regex = new RegExp(pattern);
      return regex.test('a.js') || regex.test('a.jsx');
    });
    const customTSPattern = Object.keys(transform).find(pattern => {
      const regex = new RegExp(pattern);
    // ... more code ...
```

#### chalk

**_supportsColor** (Complexity: 36)
```typescript
function _supportsColor(haveStream, {streamIsTTY, sniffFlags = true} = {}) {
	const noFlagForceColor = envForceColor();
	if (noFlagForceColor !== undefined) {
		flagForceColor = noFlagForceColor;
	}

	const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === 0) {
		return 0;
    // ... more code ...
```

**assembleStyles** (Complexity: 14)
```typescript
function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

    // ... more code ...
```

#### express

**send** (Complexity: 24)
```typescript
function send(body) {
  var chunk = body;
  var encoding;
  var req = this.req;
  var type;

  // settings
  var app = this.app;

  switch (typeof chunk) {
    // ... more code ...
```

**sendFile** (Complexity: 13)
```typescript
function sendFile(path, options, callback) {
  var done = callback;
  var req = this.req;
  var res = this;
  var next = req.next;
  var opts = options || {};

  if (!path) {
    throw new TypeError('path argument is required to res.sendFile');
  }
    // ... more code ...
```

#### uuid

**v4** (Complexity: 11)
```typescript
function v4<TBuf extends Uint8Array = Uint8Array>(
  options?: Version4Options,
  buf?: TBuf,
  offset?: number
): UUIDTypes<TBuf> {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }

  options = options || {};
    // ... more code ...
```


## Individual Project Analysis

### chalk (⭐ 22.3k) - Grade: C (79/100)

- **Description**: Terminal string styling library
- **Files**: 15 files, 978 lines
- **Avg Complexity**: 8.90 (StdDev: 13.70)
- **Avg Duplication**: 4.30%

- **Code Context Summary**:
  - Architecture: 1 classes, 41 functions, 0 interfaces
  - Complexity: 2 files with high complexity, deepest nesting: 6
  - Dependencies: Most used external: node:process (2), node:os (1), node:tty (1)
- **Emblematic Files Validation**:
  - ✅ `source/index.js` (found in Top 5, expected as core)
  - ✅ `source/utilities.js` (found in Top 5, expected as performanceCritical)
  - ✅ `source/vendor/ansi-styles/index.js` (found in Top 5, expected as complexAlgorithm)

---
### eslint (⭐ 26k) - Grade: F (47/100)

- **Description**: JavaScript linter
- **Files**: 1,437 files, 463,980 lines
- **Avg Complexity**: 12.00 (StdDev: 82.80)
- **Avg Duplication**: 44.90%

- **Code Context Summary**:
  - Architecture: 4 classes, 1546 functions, 0 interfaces
  - Complexity: 8 files with high complexity, deepest nesting: 23
  - Dependencies: Most used external: None
- **Emblematic Files Validation**:
  - ✅ `lib/rule-tester/rule-tester.js` (found in Top 5, expected as architectural)
- **Architectural Risks (Silent Killers)**:
  - `lib/eslint/eslint.js` (Impact: 7, Complexity: 101)
  - `lib/config/config.js` (Impact: 6, Complexity: 73)
  - `lib/languages/js/index.js` (Impact: 8, Complexity: 34)

---
### express (⭐ 66.2k) - Grade: C (70/100)

- **Description**: Fast web framework for Node.js
- **Files**: 142 files, 15,569 lines
- **Avg Complexity**: 4.60 (StdDev: 10.46)
- **Avg Duplication**: 34.00%

- **Code Context Summary**:
  - Architecture: 0 classes, 100 functions, 0 interfaces
  - Complexity: 4 files with high complexity, deepest nesting: 7
  - Dependencies: Most used external: None
- **Emblematic Files Validation**:
  - ✅ `lib/application.js` (found in Top 5, expected as core)
  - ✅ `lib/utils.js` (found in Top 5, expected as complexAlgorithm)
  - ✅ `lib/request.js` (found in Top 5, expected as complexAlgorithm)
  - ✅ `lib/response.js` (found in Top 5, expected as complexAlgorithm)

---
### jest (⭐ 44.8k) - Grade: D (66/100)

- **Description**: JavaScript testing framework
- **Files**: 1,783 files, 118,260 lines
- **Avg Complexity**: 4.50 (StdDev: 14.50)
- **Avg Duplication**: 47.10%

- **Code Context Summary**:
  - Architecture: 5 classes, 403 functions, 6 interfaces
  - Complexity: 5 files with high complexity, deepest nesting: 15
  - Dependencies: Most used external: jest-util (4), path (3), graceful-fs (3)
- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the Top 5 critical files list.

---
### lodash (⭐ 60.6k) - Grade: F (33/100)

- **Description**: JavaScript utility library
- **Files**: 47 files, 64,669 lines
- **Avg Complexity**: 170.90 (StdDev: 579.56)
- **Avg Duplication**: 11.10%

- **Code Context Summary**:
  - Architecture: 0 classes, 5836 functions, 0 interfaces
  - Complexity: 5 files with high complexity, deepest nesting: 27
  - Dependencies: Most used external: None
- **Emblematic Files Validation**:
  - ✅ `lodash.js` (found in Top 5, expected as core)

---
### react (⭐ 235k) - Grade: F (50/100)

- **Description**: JavaScript library for building UIs
- **Files**: 3,935 files, 504,543 lines
- **Avg Complexity**: 10.90 (StdDev: 45.90)
- **Avg Duplication**: 41.00%

- **Code Context Summary**:
  - Architecture: 0 classes, 1440 functions, 2 interfaces
  - Complexity: 8 files with high complexity, deepest nesting: 19
  - Dependencies: Most used external: shared/ReactFeatureFlags (7), shared/ReactTypes (6), shared/CheckStringCoercion (4)
- **Emblematic Files Validation**:
  - ✅ `packages/react-reconciler/src/ReactFiberCommitWork.js` (found in Top 5, expected as performanceCritical)
- **Architectural Risks (Silent Killers)**:
  - `packages/react-reconciler/src/ReactFiberWorkLoop.js` (Impact: 23, Complexity: 621)
  - `packages/react-reconciler/src/ReactFiberLane.js` (Impact: 48, Complexity: 186)
  - `packages/react-reconciler/src/ReactFiberHooks.js` (Impact: 12, Complexity: 491)

---
### typescript (⭐ 104k) - Grade: F (56/100)

- **Description**: TypeScript language compiler
- **Files**: 36,620 files, 2,787,678 lines
- **Avg Complexity**: 4.90 (StdDev: 89.71)
- **Avg Duplication**: 63.70%

- **Code Context Summary**:
  - Architecture: 1 classes, 5776 functions, 52 interfaces
  - Complexity: 5 files with high complexity, deepest nesting: 22
  - Dependencies: Most used external: None
- **Emblematic Files Validation**:
  - ✅ `src/compiler/checker.ts` (found in Top 5, expected as core)
  - ✅ `src/compiler/parser.ts` (found in Top 5, expected as core)
  - ✅ `src/compiler/emitter.ts` (found in Top 5, expected as performanceCritical)
  - ✅ `src/compiler/utilities.ts` (found in Top 5, expected as complexAlgorithm)

---
### uuid (⭐ 15k) - Grade: B (89/100)

- **Description**: UUID generation library
- **Files**: 79 files, 2,808 lines
- **Avg Complexity**: 2.60 (StdDev: 3.02)
- **Avg Duplication**: 24.40%

- **Code Context Summary**:
  - Architecture: 0 classes, 16 functions, 0 interfaces
  - Complexity: 0 files with high complexity, deepest nesting: 5
  - Dependencies: Most used external: assert (1)
- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the Top 5 critical files list.

---
### vue (⭐ 50.7k) - Grade: F (58/100)

- **Description**: Progressive JavaScript framework
- **Files**: 504 files, 122,336 lines
- **Avg Complexity**: 18.50 (StdDev: 42.74)
- **Avg Duplication**: 15.10%

- **Code Context Summary**:
  - Architecture: 2 classes, 271 functions, 13 interfaces
  - Complexity: 5 files with high complexity, deepest nesting: 14
  - Dependencies: Most used external: @vue/shared (4), @babel/parser (3), @babel/types (2)
- **Emblematic Files Validation**:
  - ✅ `packages/runtime-core/src/renderer.ts` (found in Top 5, expected as core)

---
