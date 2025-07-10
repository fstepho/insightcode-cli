# InsightCode Benchmark Report (Production Code Analysis)

> Generated on 2025-07-09T23:27:32.441Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 17.98s |
| **Total Lines of Code** | 667,289 |
| **Analysis Speed** | 37,115 lines/sec |

## Benchmark Leaderboard

| Category | Champion 🏆 | Challenger ⚠️ | Metric |
|---|---|---|---|
| **Best Score** | `uuid` (84/100) | `lodash` (30/100) | Overall Score |
| **Lowest Complexity** | `uuid` (4.30) | `typescript` (94.70) | Avg. Complexity |
| **Lowest Duplication** | `chalk` (8.00%) | `react` (55.04%) | Avg. Duplication |

## Complexity Distribution: The "Monolith" Indicator

A high Standard Deviation (StdDev) indicates that complexity is heavily concentrated in a few "monolith" files.

| Project | Avg Complexity | StdDev | Profile |
|---|---|---|---|
| `typescript` | 94.70 | **694.31** | Concentrated 🌋 |
| `lodash` | 93.90 | **361.28** | Concentrated 🌋 |
| `react` | 21.10 | **72.28** | Concentrated 🌋 |
| `vue` | 29.70 | **54.45** | Evenly Distributed |
| `express` | 33.00 | **34.83** | Evenly Distributed |
| `eslint` | 23.40 | **34.54** | Evenly Distributed |
| `jest` | 8.90 | **21.84** | Concentrated 🌋 |
| `chalk` | 8.30 | **8.70** | Evenly Distributed |
| `uuid` | 4.30 | **4.27** | Evenly Distributed |

## Individual Project Analysis

### chalk (⭐ 22.3k) - Grade: C (76/100)

- **Description**: Terminal string styling library
- **Files**: 4 files, 386 lines
- **Avg Complexity**: 8.30 (StdDev: 8.70)
- **Avg Duplication**: 8.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `source/index.js`
    - **File Path**: source/index.js
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 59
    - **Issues**: 1
    - **Complexity**: 23
    - **Duplication**: 3%
  - ✅ Found emblematic file in performanceCritical: `source/utilities.js`
    - **File Path**: source/utilities.js
    - **Category**: performanceCritical
    - **Usage Count**: 1
    - **Health Score**: 98
    - **Issues**: 0
    - **Complexity**: 6
    - **Duplication**: 13%
- **Architectural Risks (High Impact, Low Health)**:
  - `source/index.js` (Usage Count: 1, Health Score: 59)

---
### eslint (⭐ 26k) - Grade: F (48/100)

- **Description**: JavaScript linter
- **Files**: 414 files, 63,339 lines
- **Avg Complexity**: 23.40 (StdDev: 34.54)
- **Avg Duplication**: 37.98%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `lib/linter/linter.js`
    - **File Path**: lib/linter/linter.js
    - **Category**: core
    - **Usage Count**: 2
    - **Health Score**: 21
    - **Issues**: 3
    - **Complexity**: 261
    - **Duplication**: 19%
  - ✅ Found emblematic file in core: `lib/eslint/eslint.js`
    - **File Path**: lib/eslint/eslint.js
    - **Category**: core
    - **Usage Count**: 4
    - **Health Score**: 14
    - **Issues**: 3
    - **Complexity**: 101
    - **Duplication**: 32%
  - ✅ Found emblematic file in core: `lib/cli-engine/cli-engine.js`
    - **File Path**: lib/cli-engine/cli-engine.js
    - **Category**: core
    - **Usage Count**: 2
    - **Health Score**: 13
    - **Issues**: 3
    - **Complexity**: 106
    - **Duplication**: 35%
  - ✅ Found emblematic file in architectural: `lib/rule-tester/rule-tester.js`
    - **File Path**: lib/rule-tester/rule-tester.js
    - **Category**: architectural
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 127
    - **Duplication**: 11%
  - ✅ Found emblematic file in complexAlgorithm: `lib/linter/code-path-analysis/code-path-analyzer.js`
    - **File Path**: lib/linter/code-path-analysis/code-path-analyzer.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 1
    - **Health Score**: 22
    - **Issues**: 3
    - **Complexity**: 167
    - **Duplication**: 17%
  - ✅ Found emblematic file in complexAlgorithm: `lib/config/flat-config-array.js`
    - **File Path**: lib/config/flat-config-array.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 3
    - **Health Score**: 77
    - **Issues**: 1
    - **Complexity**: 11
    - **Duplication**: 9%
- **Architectural Risks (High Impact, Low Health)**:
  - `lib/eslint/legacy-eslint.js` (Usage Count: 3, Health Score: 11)
  - `lib/cli-engine/cli-engine.js` (Usage Count: 2, Health Score: 13)
  - `lib/eslint/eslint-helpers.js` (Usage Count: 3, Health Score: 13)
  - `lib/eslint/eslint.js` (Usage Count: 4, Health Score: 14)
  - `lib/config/flat-config-schema.js` (Usage Count: 3, Health Score: 21)

---
### express (⭐ 66.2k) - Grade: F (50/100)

- **Description**: Fast web framework for Node.js
- **Files**: 7 files, 1,130 lines
- **Avg Complexity**: 33.00 (StdDev: 34.83)
- **Avg Duplication**: 24.57%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `lib/application.js`
    - **File Path**: lib/application.js
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 36
    - **Issues**: 2
    - **Complexity**: 42
    - **Duplication**: 9%
  - ✅ Found emblematic file in core: `lib/express.js`
    - **File Path**: lib/express.js
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 91
    - **Issues**: 1
    - **Complexity**: 1
    - **Duplication**: 18%
  - ✅ Found emblematic file in architectural: `lib/view.js`
    - **File Path**: lib/view.js
    - **Category**: architectural
    - **Usage Count**: 1
    - **Health Score**: 67
    - **Issues**: 1
    - **Complexity**: 17
    - **Duplication**: 14.000000000000002%
  - ✅ Found emblematic file in complexAlgorithm: `lib/utils.js`
    - **File Path**: lib/utils.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 7
    - **Health Score**: 51
    - **Issues**: 2
    - **Complexity**: 29
    - **Duplication**: 20%
  - ✅ Found emblematic file in complexAlgorithm: `lib/request.js`
    - **File Path**: lib/request.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 1
    - **Health Score**: 57
    - **Issues**: 1
    - **Complexity**: 30
    - **Duplication**: 15%
  - ✅ Found emblematic file in complexAlgorithm: `lib/response.js`
    - **File Path**: lib/response.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 111
    - **Duplication**: 10%
- **Architectural Risks (High Impact, Low Health)**:
  - `lib/utils.js` (Usage Count: 7, Health Score: 51)

---
### jest (⭐ 44.8k) - Grade: F (59/100)

- **Description**: JavaScript testing framework
- **Files**: 719 files, 48,687 lines
- **Avg Complexity**: 8.90 (StdDev: 21.84)
- **Avg Duplication**: 51.69%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `packages/jest-core/src/index.ts`
    - **File Path**: packages/jest-core/src/index.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 80
    - **Issues**: 1
    - **Complexity**: 1
    - **Duplication**: 50%
  - ✅ Found emblematic file in core: `packages/jest-cli/src/index.ts`
    - **File Path**: packages/jest-cli/src/index.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 77
    - **Issues**: 1
    - **Complexity**: 1
    - **Duplication**: 67%
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/jest-cli/src/args.ts` (Usage Count: 2, Health Score: 18)
  - `packages/jest-resolve/src/resolver.ts` (Usage Count: 3, Health Score: 20)
  - `packages/expect/src/asymmetricMatchers.ts` (Usage Count: 3, Health Score: 28)
  - `packages/jest-circus/src/utils.ts` (Usage Count: 6, Health Score: 28)
  - `packages/jest-config/src/normalize.ts` (Usage Count: 2, Health Score: 28)

---
### lodash (⭐ 60.6k) - Grade: F (30/100)

- **Description**: JavaScript utility library
- **Files**: 20 files, 8,879 lines
- **Avg Complexity**: 93.90 (StdDev: 361.28)
- **Avg Duplication**: 17.55%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `lodash.js`
    - **File Path**: lodash.js
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 1666
    - **Duplication**: 11%

---
### react (⭐ 235k) - Grade: F (42/100)

- **Description**: JavaScript library for building UIs
- **Files**: 1,381 files, 197,492 lines
- **Avg Complexity**: 21.10 (StdDev: 72.28)
- **Avg Duplication**: 55.04%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `packages/react-reconciler/src/ReactFiberReconciler.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberReconciler.js
    - **Category**: core
    - **Usage Count**: 3
    - **Health Score**: 19
    - **Issues**: 3
    - **Complexity**: 101
    - **Duplication**: 30%
  - ✅ Found emblematic file in architectural: `packages/react-reconciler/src/ReactFiberWorkLoop.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberWorkLoop.js
    - **Category**: architectural
    - **Usage Count**: 23
    - **Health Score**: 21
    - **Issues**: 3
    - **Complexity**: 630
    - **Duplication**: 21%
  - ✅ Found emblematic file in architectural: `packages/react-reconciler/src/ReactFiberBeginWork.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberBeginWork.js
    - **Category**: architectural
    - **Usage Count**: 3
    - **Health Score**: 19
    - **Issues**: 3
    - **Complexity**: 456
    - **Duplication**: 28.999999999999996%
  - ✅ Found emblematic file in architectural: `packages/react-reconciler/src/ReactFiberCompleteWork.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberCompleteWork.js
    - **Category**: architectural
    - **Usage Count**: 1
    - **Health Score**: 13
    - **Issues**: 3
    - **Complexity**: 282
    - **Duplication**: 33%
  - ✅ Found emblematic file in performanceCritical: `packages/react-reconciler/src/ReactFiberCommitWork.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberCommitWork.js
    - **Category**: performanceCritical
    - **Usage Count**: 1
    - **Health Score**: 20
    - **Issues**: 3
    - **Complexity**: 818
    - **Duplication**: 27%
  - ✅ Found emblematic file in performanceCritical: `packages/react-reconciler/src/ReactFiberHooks.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberHooks.js
    - **Category**: performanceCritical
    - **Usage Count**: 12
    - **Health Score**: 14
    - **Issues**: 3
    - **Complexity**: 492
    - **Duplication**: 32%
  - ✅ Found emblematic file in complexAlgorithm: `packages/react-reconciler/src/ReactChildFiber.js`
    - **File Path**: packages/react-reconciler/src/ReactChildFiber.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 3
    - **Health Score**: 13
    - **Issues**: 3
    - **Complexity**: 313
    - **Duplication**: 33%
  - ✅ Found emblematic file in complexAlgorithm: `packages/react-reconciler/src/ReactFiberLane.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberLane.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 48
    - **Health Score**: 27
    - **Issues**: 2
    - **Complexity**: 189
    - **Duplication**: 13%
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/react-server-dom-turbopack/src/ReactFlightTurbopackReferences.js` (Usage Count: 5, Health Score: 6)
  - `packages/react-server-dom-webpack/src/ReactFlightWebpackReferences.js` (Usage Count: 5, Health Score: 6)
  - `packages/react-native-renderer/src/ReactFiberConfigFabric.js` (Usage Count: 4, Health Score: 11)
  - `packages/react-reconciler/src/ReactFiberCommitViewTransitions.js` (Usage Count: 4, Health Score: 12)
  - `packages/react-reconciler/src/ReactFiberDevToolsHook.js` (Usage Count: 11, Health Score: 13)

---
### typescript (⭐ 104k) - Grade: F (34/100)

- **Description**: TypeScript language compiler
- **Files**: 601 files, 296,975 lines
- **Avg Complexity**: 94.70 (StdDev: 694.31)
- **Avg Duplication**: 29.68%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `src/compiler/checker.ts`
    - **File Path**: src/compiler/checker.ts
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 29
    - **Issues**: 2
    - **Complexity**: 16253
    - **Duplication**: 5%
  - ✅ Found emblematic file in core: `src/compiler/parser.ts`
    - **File Path**: src/compiler/parser.ts
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 2178
    - **Duplication**: 9%
  - ✅ Found emblematic file in core: `src/compiler/binder.ts`
    - **File Path**: src/compiler/binder.ts
    - **Category**: core
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 979
    - **Duplication**: 10%
  - ✅ Found emblematic file in architectural: `src/compiler/program.ts`
    - **File Path**: src/compiler/program.ts
    - **Category**: architectural
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 967
    - **Duplication**: 8%
  - ✅ Found emblematic file in architectural: `src/compiler/builder.ts`
    - **File Path**: src/compiler/builder.ts
    - **Category**: architectural
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 386
    - **Duplication**: 8%
  - ✅ Found emblematic file in architectural: `src/services/services.ts`
    - **File Path**: src/services/services.ts
    - **Category**: architectural
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 506
    - **Duplication**: 9%
  - ✅ Found emblematic file in performanceCritical: `src/compiler/transformers/ts.ts`
    - **File Path**: src/compiler/transformers/ts.ts
    - **Category**: performanceCritical
    - **Usage Count**: 1
    - **Health Score**: 20
    - **Issues**: 3
    - **Complexity**: 370
    - **Duplication**: 23%
  - ✅ Found emblematic file in performanceCritical: `src/compiler/emitter.ts`
    - **File Path**: src/compiler/emitter.ts
    - **Category**: performanceCritical
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 1215
    - **Duplication**: 10%
  - ✅ Found emblematic file in performanceCritical: `src/compiler/scanner.ts`
    - **File Path**: src/compiler/scanner.ts
    - **Category**: performanceCritical
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 946
    - **Duplication**: 11%
  - ✅ Found emblematic file in complexAlgorithm: `src/compiler/types.ts`
    - **File Path**: src/compiler/types.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 1
    - **Health Score**: 69
    - **Issues**: 1
    - **Complexity**: 2
    - **Duplication**: 6%
  - ✅ Found emblematic file in complexAlgorithm: `src/compiler/utilities.ts`
    - **File Path**: src/compiler/utilities.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 1
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 3015
    - **Duplication**: 11%
- **Architectural Risks (High Impact, Low Health)**:
  - `src/testRunner/unittests/helpers/noEmit.ts` (Usage Count: 4, Health Score: 13)
  - `src/harness/harnessLanguageService.ts` (Usage Count: 4, Health Score: 28)
  - `src/harness/incrementalUtils.ts` (Usage Count: 7, Health Score: 28)
  - `src/services/refactors/moveToFile.ts` (Usage Count: 4, Health Score: 28)
  - `src/testRunner/unittests/helpers/baseline.ts` (Usage Count: 19, Health Score: 29)

---
### uuid (⭐ 15k) - Grade: B (84/100)

- **Description**: UUID generation library
- **Files**: 29 files, 978 lines
- **Avg Complexity**: 4.30 (StdDev: 4.27)
- **Avg Duplication**: 22.31%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.

---
### vue (⭐ 50.7k) - Grade: F (51/100)

- **Description**: Progressive JavaScript framework
- **Files**: 285 files, 49,423 lines
- **Avg Complexity**: 29.70 (StdDev: 54.45)
- **Avg Duplication**: 17.88%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `packages/runtime-core/src/component.ts`
    - **File Path**: packages/runtime-core/src/component.ts
    - **Category**: core
    - **Usage Count**: 56
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 119
    - **Duplication**: 9%
  - ✅ Found emblematic file in core: `packages/runtime-core/src/renderer.ts`
    - **File Path**: packages/runtime-core/src/renderer.ts
    - **Category**: core
    - **Usage Count**: 13
    - **Health Score**: 27
    - **Issues**: 2
    - **Complexity**: 420
    - **Duplication**: 13%
  - ✅ Found emblematic file in core: `packages/reactivity/src/reactive.ts`
    - **File Path**: packages/reactivity/src/reactive.ts
    - **Category**: core
    - **Usage Count**: 6
    - **Health Score**: 40
    - **Issues**: 2
    - **Complexity**: 31
    - **Duplication**: 10%
  - ✅ Found emblematic file in architectural: `packages/compiler-core/src/compile.ts`
    - **File Path**: packages/compiler-core/src/compile.ts
    - **Category**: architectural
    - **Usage Count**: 2
    - **Health Score**: 59
    - **Issues**: 1
    - **Complexity**: 24
    - **Duplication**: 4%
  - ✅ Found emblematic file in architectural: `packages/runtime-core/src/apiCreateApp.ts`
    - **File Path**: packages/runtime-core/src/apiCreateApp.ts
    - **Category**: architectural
    - **Usage Count**: 11
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 47
    - **Duplication**: 10%
  - ✅ Found emblematic file in performanceCritical: `packages/runtime-core/src/scheduler.ts`
    - **File Path**: packages/runtime-core/src/scheduler.ts
    - **Category**: performanceCritical
    - **Usage Count**: 12
    - **Health Score**: 40
    - **Issues**: 2
    - **Complexity**: 58
    - **Duplication**: 7.000000000000001%
  - ✅ Found emblematic file in performanceCritical: `packages/reactivity/src/effect.ts`
    - **File Path**: packages/reactivity/src/effect.ts
    - **Category**: performanceCritical
    - **Usage Count**: 6
    - **Health Score**: 28
    - **Issues**: 2
    - **Complexity**: 69
    - **Duplication**: 10%
  - ✅ Found emblematic file in complexAlgorithm: `packages/compiler-core/src/transform.ts`
    - **File Path**: packages/compiler-core/src/transform.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 23
    - **Health Score**: 27
    - **Issues**: 2
    - **Complexity**: 64
    - **Duplication**: 13%
  - ✅ Found emblematic file in complexAlgorithm: `packages/runtime-core/src/componentRenderContext.ts`
    - **File Path**: packages/runtime-core/src/componentRenderContext.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 12
    - **Health Score**: 71
    - **Issues**: 1
    - **Complexity**: 15
    - **Duplication**: 8%
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/compiler-core/src/utils.ts` (Usage Count: 17, Health Score: 22)
  - `packages/runtime-core/src/components/Suspense.ts` (Usage Count: 11, Health Score: 22)
  - `packages/compiler-core/src/transform.ts` (Usage Count: 23, Health Score: 27)
  - `packages/runtime-core/src/componentOptions.ts` (Usage Count: 12, Health Score: 27)
  - `packages/runtime-core/src/componentProps.ts` (Usage Count: 9, Health Score: 27)

---
