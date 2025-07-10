# InsightCode Benchmark Report (Full Project Analysis)

> Generated on 2025-07-09T22:45:13.760Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 310.39s |
| **Total Lines of Code** | 3,956,660 |
| **Analysis Speed** | 12,747 lines/sec |

## Benchmark Leaderboard

| Category | Champion 🏆 | Challenger ⚠️ | Metric |
|---|---|---|---|
| **Best Score** | `uuid` (85/100) | `lodash` (27/100) | Overall Score |
| **Lowest Complexity** | `uuid` (2.60) | `lodash` (171.90) | Avg. Complexity |
| **Lowest Duplication** | `chalk` (13.93%) | `typescript` (77.07%) | Avg. Duplication |

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

### chalk (⭐ 22.3k) - Grade: C (73/100)

- **Description**: Terminal string styling library
- **Files**: 15 files, 978 lines
- **Avg Complexity**: 8.90 (StdDev: 13.93)
- **Avg Duplication**: 13.93%

- **Emblematic Files Validation**:
  - ✅ `source/index.js` (found in critical files, expected as core)
  - ✅ `source/vendor/ansi-styles/index.js` (found in critical files, expected as complexAlgorithm)
- **Architectural Risks (High Impact, Low Health)**:
  - `source/index.js` (Usage Count: 10, Health Score: 59)

---
### eslint (⭐ 26k) - Grade: F (44/100)

- **Description**: JavaScript linter
- **Files**: 1,437 files, 440,529 lines
- **Avg Complexity**: 12.20 (StdDev: 84.06)
- **Avg Duplication**: 55.07%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.
- **Architectural Risks (High Impact, Low Health)**:
  - `lib/rules/array-callback-return.js` (Usage Count: 2, Health Score: 8)
  - `lib/eslint/legacy-eslint.js` (Usage Count: 5, Health Score: 11)
  - `lib/cli-engine/cli-engine.js` (Usage Count: 3, Health Score: 13)
  - `lib/eslint/eslint-helpers.js` (Usage Count: 3, Health Score: 13)
  - `lib/eslint/eslint.js` (Usage Count: 7, Health Score: 14)

---
### express (⭐ 66.2k) - Grade: D (66/100)

- **Description**: Fast web framework for Node.js
- **Files**: 142 files, 15,093 lines
- **Avg Complexity**: 4.70 (StdDev: 10.69)
- **Avg Duplication**: 50.55%

- **Emblematic Files Validation**:
  - ✅ `lib/response.js` (found in critical files, expected as complexAlgorithm)
- **Architectural Risks (High Impact, Low Health)**:
  - `lib/response.js` (Usage Count: 1, Health Score: 28)
  - `lib/application.js` (Usage Count: 1, Health Score: 36)
  - `lib/utils.js` (Usage Count: 12, Health Score: 51)
  - `lib/request.js` (Usage Count: 1, Health Score: 57)
  - `lib/view.js` (Usage Count: 1, Health Score: 67)

---
### jest (⭐ 44.8k) - Grade: D (62/100)

- **Description**: JavaScript testing framework
- **Files**: 1,783 files, 117,474 lines
- **Avg Complexity**: 4.60 (StdDev: 14.57)
- **Avg Duplication**: 59.89%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/expect/src/spyMatchers.ts` (Usage Count: 1, Health Score: 13)
  - `packages/jest-cli/src/args.ts` (Usage Count: 2, Health Score: 17)
  - `packages/expect/src/matchers.ts` (Usage Count: 1, Health Score: 20)
  - `packages/jest-resolve/src/resolver.ts` (Usage Count: 3, Health Score: 20)
  - `packages/expect/src/toThrowMatchers.ts` (Usage Count: 1, Health Score: 21)

---
### lodash (⭐ 60.6k) - Grade: F (27/100)

- **Description**: JavaScript utility library
- **Files**: 47 files, 50,800 lines
- **Avg Complexity**: 171.90 (StdDev: 581.13)
- **Avg Duplication**: 21.09%

- **Emblematic Files Validation**:
  - ✅ `lodash.js` (found in critical files, expected as core)
- **Architectural Risks (High Impact, Low Health)**:
  - `lodash.js` (Usage Count: 4, Health Score: 28)
  - `fp/_baseConvert.js` (Usage Count: 2, Health Score: 28)
  - `fp/_mapping.js` (Usage Count: 3, Health Score: 50)

---
### react (⭐ 235k) - Grade: F (46/100)

- **Description**: JavaScript library for building UIs
- **Files**: 3,935 files, 502,950 lines
- **Avg Complexity**: 11.10 (StdDev: 46.98)
- **Avg Duplication**: 55.29%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/react-native-renderer/src/ReactNativeAttributePayload.js` (Usage Count: 3, Health Score: 1)
  - `packages/react-native-renderer/src/ReactNativeAttributePayloadFabric.js` (Usage Count: 2, Health Score: 3)
  - `packages/react-server-dom-turbopack/src/ReactFlightTurbopackReferences.js` (Usage Count: 5, Health Score: 6)
  - `packages/react-server-dom-webpack/src/ReactFlightWebpackReferences.js` (Usage Count: 5, Health Score: 6)
  - `packages/scheduler/src/forks/Scheduler.js` (Usage Count: 3, Health Score: 6)

---
### typescript (⭐ 104k) - Grade: F (55/100)

- **Description**: TypeScript language compiler
- **Files**: 36,620 files, 2,704,100 lines
- **Avg Complexity**: 4.90 (StdDev: 90.65)
- **Avg Duplication**: 77.07%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.
- **Architectural Risks (High Impact, Low Health)**:
  - `tests/cases/conformance/fixSignatureCaching.ts` (Usage Count: 0, Health Score: 0)
  - `tests/cases/conformance/controlFlow/controlFlowOptionalChain.ts` (Usage Count: 0, Health Score: 0)
  - `tests/cases/conformance/controlFlow/dependentDestructuredVariables.ts` (Usage Count: 0, Health Score: 5)
  - `tests/baselines/reference/tscWatch/emitAndErrorUpdates/assumeChangesOnlyAffectDirectDependenciesAndD/transitive-exports/yes-circular-import/exports.js` (Usage Count: 7, Health Score: 5)
  - `src/compiler/transformers/es2017.ts` (Usage Count: 0, Health Score: 12)

---
### uuid (⭐ 15k) - Grade: B (85/100)

- **Description**: UUID generation library
- **Files**: 79 files, 2,808 lines
- **Avg Complexity**: 2.60 (StdDev: 3.10)
- **Avg Duplication**: 29.91%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.

---
### vue (⭐ 50.7k) - Grade: F (52/100)

- **Description**: Progressive JavaScript framework
- **Files**: 504 files, 121,928 lines
- **Avg Complexity**: 18.60 (StdDev: 43.12)
- **Avg Duplication**: 27.65%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the critical files list.
- **Architectural Risks (High Impact, Low Health)**:
  - `packages/compiler-core/src/transform.ts` (Usage Count: 7, Health Score: 27)
  - `packages/runtime-core/src/componentOptions.ts` (Usage Count: 7, Health Score: 27)
  - `packages/runtime-core/src/componentProps.ts` (Usage Count: 8, Health Score: 27)
  - `packages/runtime-core/src/componentPublicInstance.ts` (Usage Count: 11, Health Score: 27)
  - `packages/runtime-core/src/hydration.ts` (Usage Count: 4, Health Score: 27)

---
