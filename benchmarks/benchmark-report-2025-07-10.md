# InsightCode Benchmark Report (Full Project Analysis)

> Generated on 2025-07-10T17:29:33.329Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 53.71s |
| **Total Lines of Code** | 3,956,660 |
| **Analysis Speed** | 73,673 lines/sec |

## Benchmark Leaderboard

| Category | Champion 🏆 | Challenger ⚠️ | Metric |
|---|---|---|---|
| **Best Score** | `uuid` (97/100) | `lodash` (38/100) | Overall Score |
| **Lowest Complexity** | `uuid` (2.60) | `lodash` (171.90) | Avg. Complexity |
| **Lowest Duplication** | `lodash` (0.00%) | `uuid` (0.23%) | Avg. Duplication |

## Complexity Distribution: The "Monolith" Indicator

A high Standard Deviation (StdDev) indicates that complexity is heavily concentrated in a few "monolith" files.

| Project | Avg Complexity | StdDev | Profile |
|---|---|---|---|
| `lodash` | 171.90 | **581.13** | Concentrated 🌋 |
| `typescript` | 4.90 | **90.65** | Concentrated 🌋 |
| `eslint` | 12.20 | **84.06** | Concentrated 🌋 |
| `react` | 11.10 | **46.98** | Concentrated 🌋 |
| `vue` | 18.60 | **43.12** | Concentrated 🌋 |
| `jest` | 4.60 | **14.57** | Concentrated 🌋 |
| `chalk` | 8.90 | **13.93** | Evenly Distributed |
| `express` | 4.70 | **10.69** | Concentrated 🌋 |
| `uuid` | 2.60 | **3.10** | Evenly Distributed |

## Individual Project Analysis

### chalk (⭐ 22.3k) - Grade: B (82/100)

- **Description**: Terminal string styling library
- **Files**: 15 files, 978 lines
- **Avg Complexity**: 8.90 (StdDev: 13.93)
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
  - ✅ Found emblematic file in complexAlgorithm: `source/vendor/ansi-styles/index.js`
    - **File Path**: source/vendor/ansi-styles/index.js
    - **Category**: complexAlgorithm
    - **Usage Count**: 0
    - **Health Score**: 74
    - **Issues**: 1
    - **Complexity**: 14
    - **Duplication**: 0%
- **Architectural Risks (High Impact, Low Health)**:
  - `source/vendor/supports-color/index.js` (Usage Count: 0, Health Score: 60)

---
### eslint (⭐ 26k) - Grade: D (61/100)

- **Description**: JavaScript linter
- **Files**: 1,437 files, 440,529 lines
- **Avg Complexity**: 12.20 (StdDev: 84.06)
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
  - `lib/languages/js/source-code/token-store/index.js` (Usage Count: 0, Health Score: 30)
  - `tests/lib/languages/js/source-code/source-code.js` (Usage Count: 0, Health Score: 30)
  - `tests/fixtures/rules/indent/indent-invalid-fixture-1.js` (Usage Count: 0, Health Score: 35)
  - `tests/fixtures/rules/indent/indent-valid-fixture-1.js` (Usage Count: 0, Health Score: 35)
  - `tests/fixtures/rules/indent-legacy/indent-invalid-fixture-1.js` (Usage Count: 0, Health Score: 35)

---
### express (⭐ 66.2k) - Grade: B (81/100)

- **Description**: Fast web framework for Node.js
- **Files**: 142 files, 15,093 lines
- **Avg Complexity**: 4.70 (StdDev: 10.69)
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
### jest (⭐ 44.8k) - Grade: C (77/100)

- **Description**: JavaScript testing framework
- **Files**: 1,783 files, 117,474 lines
- **Avg Complexity**: 4.60 (StdDev: 14.57)
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
  - `packages/jest-worker/src/workers/ChildProcessWorker.ts` (Usage Count: 0, Health Score: 30)
  - `packages/jest-worker/src/workers/NodeThreadsWorker.ts` (Usage Count: 0, Health Score: 35)
  - `packages/jest-worker/src/workers/__tests__/WorkerEdgeCases.test.ts` (Usage Count: 0, Health Score: 46)
  - `packages/jest-worker/src/workers/processChild.ts` (Usage Count: 0, Health Score: 60)
  - `packages/jest-worker/src/workers/threadChild.ts` (Usage Count: 0, Health Score: 60)

---
### lodash (⭐ 60.6k) - Grade: F (38/100)

- **Description**: JavaScript utility library
- **Files**: 47 files, 50,800 lines
- **Avg Complexity**: 171.90 (StdDev: 581.13)
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
  - `vendor/underscore/test/objects.js` (Usage Count: 0, Health Score: 30)
  - `vendor/underscore/test/functions.js` (Usage Count: 0, Health Score: 49)

---
### react (⭐ 235k) - Grade: D (63/100)

- **Description**: JavaScript library for building UIs
- **Files**: 3,935 files, 502,950 lines
- **Avg Complexity**: 11.10 (StdDev: 46.98)
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
  - `compiler/packages/babel-plugin-react-compiler/src/__tests__/fixtures/compiler/rules-of-hooks/rules-of-hooks-c1e8c7f4c191.js` (Usage Count: 0, Health Score: 60)
  - `compiler/packages/babel-plugin-react-compiler/src/__tests__/fixtures/compiler/rules-of-hooks/todo.bail.rules-of-hooks-6949b255e7eb.js` (Usage Count: 0, Health Score: 60)

---
### typescript (⭐ 104k) - Grade: C (73/100)

- **Description**: TypeScript language compiler
- **Files**: 36,620 files, 2,704,100 lines
- **Avg Complexity**: 4.90 (StdDev: 90.65)
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
  - `tests/baselines/reference/tsbuildWatch/projectsBuilding/when-there-are-23-projects-in-a-solution.js` (Usage Count: 0, Health Score: 30)
  - `tests/baselines/reference/tsbuildWatch/projectsBuilding/when-there-are-8-projects-in-a-solution.js` (Usage Count: 0, Health Score: 30)
  - `tests/baselines/reference/tsc/commandLine/help-all.js` (Usage Count: 0, Health Score: 30)
  - `tests/baselines/reference/tscWatch/projectsWithReferences/on-sample-project-with-nodenext.js` (Usage Count: 0, Health Score: 30)
  - `tests/baselines/reference/tsserver/configuredProjects/add-and-then-remove-a-config-file-in-a-folder-with-loose-files.js` (Usage Count: 0, Health Score: 30)

---
### uuid (⭐ 15k) - Grade: A (97/100)

- **Description**: UUID generation library
- **Files**: 79 files, 2,808 lines
- **Avg Complexity**: 2.60 (StdDev: 3.10)
- **Avg Duplication**: 0.23%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.

---
### vue (⭐ 50.7k) - Grade: D (62/100)

- **Description**: Progressive JavaScript framework
- **Files**: 504 files, 121,928 lines
- **Avg Complexity**: 18.60 (StdDev: 43.12)
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
  - `packages/runtime-dom/__tests__/helpers/useCssVars.spec.ts` (Usage Count: 0, Health Score: 40)
  - `packages/vue/__tests__/e2e/Transition.spec.ts` (Usage Count: 0, Health Score: 40)
  - `packages/runtime-core/src/helpers/renderSlot.ts` (Usage Count: 0, Health Score: 60)

---
