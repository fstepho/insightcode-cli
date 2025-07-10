# InsightCode Benchmark Report (Production Code Analysis)

> Generated on 2025-07-10T17:30:40.282Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 10.16s |
| **Total Lines of Code** | 667,289 |
| **Analysis Speed** | 65,697 lines/sec |

## Benchmark Leaderboard

| Category | Champion 🏆 | Challenger ⚠️ | Metric |
|---|---|---|---|
| **Best Score** | `uuid` (97/100) | `lodash` (39/100) | Overall Score |
| **Lowest Complexity** | `uuid` (4.30) | `typescript` (94.70) | Avg. Complexity |
| **Lowest Duplication** | `lodash` (0.00%) | `uuid` (0.62%) | Avg. Duplication |

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

### chalk (⭐ 22.3k) - Grade: B (81/100)

- **Description**: Terminal string styling library
- **Files**: 4 files, 386 lines
- **Avg Complexity**: 8.30 (StdDev: 8.70)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `source/index.js`
    - **File Path**: source/index.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 60
    - **Issues**: 1
    - **Complexity**: 23
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `source/utilities.js`
    - **File Path**: source/utilities.js
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 100
    - **Issues**: 0
    - **Complexity**: 6
    - **Duplication**: 0%

---
### eslint (⭐ 26k) - Grade: D (66/100)

- **Description**: JavaScript linter
- **Files**: 414 files, 63,339 lines
- **Avg Complexity**: 23.40 (StdDev: 34.54)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `lib/linter/linter.js`
    - **File Path**: lib/linter/linter.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 261
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `lib/eslint/eslint.js`
    - **File Path**: lib/eslint/eslint.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 101
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `lib/cli-engine/cli-engine.js`
    - **File Path**: lib/cli-engine/cli-engine.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 106
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `lib/rule-tester/rule-tester.js`
    - **File Path**: lib/rule-tester/rule-tester.js
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 127
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `lib/linter/code-path-analysis/code-path-analyzer.js`
    - **File Path**: lib/linter/code-path-analysis/code-path-analyzer.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 167
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `lib/config/flat-config-array.js`
    - **File Path**: lib/config/flat-config-array.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 79
    - **Issues**: 1
    - **Complexity**: 11
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `lib/linter/code-path-analysis/code-path-analyzer.js` (Usage Count: 0, Health Score: 30)
  - `lib/linter/code-path-analysis/code-path-state.js` (Usage Count: 0, Health Score: 30)
  - `lib/languages/js/source-code/source-code.js` (Usage Count: 0, Health Score: 30)
  - `lib/languages/js/source-code/token-store/index.js` (Usage Count: 0, Health Score: 30)
  - `lib/rules/yoda.js` (Usage Count: 0, Health Score: 39)

---
### express (⭐ 66.2k) - Grade: D (60/100)

- **Description**: Fast web framework for Node.js
- **Files**: 7 files, 1,130 lines
- **Avg Complexity**: 33.00 (StdDev: 34.83)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `lib/application.js`
    - **File Path**: lib/application.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 38
    - **Issues**: 2
    - **Complexity**: 42
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `lib/express.js`
    - **File Path**: lib/express.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 100
    - **Issues**: 0
    - **Complexity**: 1
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `lib/view.js`
    - **File Path**: lib/view.js
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 70
    - **Issues**: 1
    - **Complexity**: 17
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `lib/utils.js`
    - **File Path**: lib/utils.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 60
    - **Issues**: 1
    - **Complexity**: 29
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `lib/request.js`
    - **File Path**: lib/request.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 60
    - **Issues**: 1
    - **Complexity**: 30
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `lib/response.js`
    - **File Path**: lib/response.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 111
    - **Duplication**: 0%

---
### jest (⭐ 44.8k) - Grade: C (71/100)

- **Description**: JavaScript testing framework
- **Files**: 719 files, 48,687 lines
- **Avg Complexity**: 8.90 (StdDev: 21.84)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `packages/jest-core/src/index.ts`
    - **File Path**: packages/jest-core/src/index.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 100
    - **Issues**: 0
    - **Complexity**: 1
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `packages/jest-cli/src/index.ts`
    - **File Path**: packages/jest-cli/src/index.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 100
    - **Issues**: 0
    - **Complexity**: 1
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/jest-jasmine2/src/jasmine/Env.ts` (Usage Count: 0, Health Score: 30)
  - `packages/jest-worker/src/workers/ChildProcessWorker.ts` (Usage Count: 0, Health Score: 30)
  - `packages/jest-worker/src/workers/NodeThreadsWorker.ts` (Usage Count: 0, Health Score: 35)
  - `packages/jest-haste-map/src/crawlers/watchman.ts` (Usage Count: 0, Health Score: 38)
  - `packages/jest-jasmine2/src/jasmine/Spec.ts` (Usage Count: 0, Health Score: 39)

---
### lodash (⭐ 60.6k) - Grade: F (39/100)

- **Description**: JavaScript utility library
- **Files**: 20 files, 8,879 lines
- **Avg Complexity**: 93.90 (StdDev: 361.28)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `lodash.js`
    - **File Path**: lodash.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 1666
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `perf/asset/perf-ui.js` (Usage Count: 0, Health Score: 60)

---
### react (⭐ 235k) - Grade: F (57/100)

- **Description**: JavaScript library for building UIs
- **Files**: 1,381 files, 197,492 lines
- **Avg Complexity**: 21.10 (StdDev: 72.28)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `packages/react-reconciler/src/ReactFiberReconciler.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberReconciler.js
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 101
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `packages/react-reconciler/src/ReactFiberWorkLoop.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberWorkLoop.js
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 630
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `packages/react-reconciler/src/ReactFiberBeginWork.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberBeginWork.js
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 456
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `packages/react-reconciler/src/ReactFiberCompleteWork.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberCompleteWork.js
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 282
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `packages/react-reconciler/src/ReactFiberCommitWork.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberCommitWork.js
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 818
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `packages/react-reconciler/src/ReactFiberHooks.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberHooks.js
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 492
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `packages/react-reconciler/src/ReactChildFiber.js`
    - **File Path**: packages/react-reconciler/src/ReactChildFiber.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 313
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `packages/react-reconciler/src/ReactFiberLane.js`
    - **File Path**: packages/react-reconciler/src/ReactFiberLane.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 189
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/react-devtools-shared/src/devtools/views/Settings/ComponentsSettings.js` (Usage Count: 0, Health Score: 30)
  - `packages/react-devtools-shared/src/devtools/views/Components/InspectedElementHooksTree.js` (Usage Count: 0, Health Score: 30)
  - `packages/react-devtools-shared/src/devtools/views/Components/KeyValue.js` (Usage Count: 0, Health Score: 30)
  - `packages/react-devtools-shared/src/devtools/views/Components/Tree.js` (Usage Count: 0, Health Score: 30)
  - `packages/react-devtools-shared/src/devtools/views/Components/TreeContext.js` (Usage Count: 0, Health Score: 30)

---
### typescript (⭐ 104k) - Grade: F (40/100)

- **Description**: TypeScript language compiler
- **Files**: 601 files, 296,975 lines
- **Avg Complexity**: 94.70 (StdDev: 694.31)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `src/compiler/checker.ts`
    - **File Path**: src/compiler/checker.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 16253
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `src/compiler/parser.ts`
    - **File Path**: src/compiler/parser.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 2178
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `src/compiler/binder.ts`
    - **File Path**: src/compiler/binder.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 979
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `src/compiler/program.ts`
    - **File Path**: src/compiler/program.ts
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 967
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `src/compiler/builder.ts`
    - **File Path**: src/compiler/builder.ts
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 386
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `src/services/services.ts`
    - **File Path**: src/services/services.ts
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 506
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `src/compiler/transformers/ts.ts`
    - **File Path**: src/compiler/transformers/ts.ts
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 370
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `src/compiler/emitter.ts`
    - **File Path**: src/compiler/emitter.ts
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 1215
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `src/compiler/scanner.ts`
    - **File Path**: src/compiler/scanner.ts
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 946
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `src/compiler/types.ts`
    - **File Path**: src/compiler/types.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 70
    - **Issues**: 1
    - **Complexity**: 2
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `src/compiler/utilities.ts`
    - **File Path**: src/compiler/utilities.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 3015
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `src/testRunner/unittests/tsserver/projectReferences.ts` (Usage Count: 0, Health Score: 30)
  - `src/testRunner/unittests/tsserver/projectReferencesSourcemap.ts` (Usage Count: 0, Health Score: 30)
  - `src/testRunner/unittests/tsserver/plugins.ts` (Usage Count: 0, Health Score: 49)
  - `src/testRunner/unittests/tsserver/versionCache.ts` (Usage Count: 0, Health Score: 51)
  - `src/testRunner/unittests/tsserver/getEditsForFileRename.ts` (Usage Count: 0, Health Score: 60)

---
### uuid (⭐ 15k) - Grade: A (97/100)

- **Description**: UUID generation library
- **Files**: 29 files, 978 lines
- **Avg Complexity**: 4.30 (StdDev: 4.27)
- **Avg Duplication**: 0.62%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.

---
### vue (⭐ 50.7k) - Grade: D (60/100)

- **Description**: Progressive JavaScript framework
- **Files**: 285 files, 49,423 lines
- **Avg Complexity**: 29.70 (StdDev: 54.45)
- **Avg Duplication**: 0.00%

- **Emblematic Files Validation**:
  - ✅ Found emblematic file in core: `packages/runtime-core/src/component.ts`
    - **File Path**: packages/runtime-core/src/component.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 119
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `packages/runtime-core/src/renderer.ts`
    - **File Path**: packages/runtime-core/src/renderer.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 420
    - **Duplication**: 0%
  - ✅ Found emblematic file in core: `packages/reactivity/src/reactive.ts`
    - **File Path**: packages/reactivity/src/reactive.ts
    - **Category**: core
    - **Usage Count**: 0
    - **Health Score**: 42
    - **Issues**: 2
    - **Complexity**: 31
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `packages/compiler-core/src/compile.ts`
    - **File Path**: packages/compiler-core/src/compile.ts
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 60
    - **Issues**: 1
    - **Complexity**: 24
    - **Duplication**: 0%
  - ✅ Found emblematic file in architectural: `packages/runtime-core/src/apiCreateApp.ts`
    - **File Path**: packages/runtime-core/src/apiCreateApp.ts
    - **Category**: architectural
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 47
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `packages/runtime-core/src/scheduler.ts`
    - **File Path**: packages/runtime-core/src/scheduler.ts
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 41
    - **Issues**: 2
    - **Complexity**: 58
    - **Duplication**: 0%
  - ✅ Found emblematic file in performanceCritical: `packages/reactivity/src/effect.ts`
    - **File Path**: packages/reactivity/src/effect.ts
    - **Category**: performanceCritical
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 69
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `packages/compiler-core/src/transform.ts`
    - **File Path**: packages/compiler-core/src/transform.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 30
    - **Issues**: 2
    - **Complexity**: 64
    - **Duplication**: 0%
  - ✅ Found emblematic file in complexAlgorithm: `packages/runtime-core/src/componentRenderContext.ts`
    - **File Path**: packages/runtime-core/src/componentRenderContext.ts
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 73
    - **Issues**: 1
    - **Complexity**: 15
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/runtime-dom/src/components/Transition.ts` (Usage Count: 0, Health Score: 30)
  - `packages/runtime-dom/src/directives/vModel.ts` (Usage Count: 0, Health Score: 30)
  - `packages/runtime-core/src/helpers/useModel.ts` (Usage Count: 0, Health Score: 60)
  - `packages/runtime-dom/src/components/TransitionGroup.ts` (Usage Count: 0, Health Score: 60)
  - `packages/runtime-dom/src/directives/vOn.ts` (Usage Count: 0, Health Score: 60)

---
