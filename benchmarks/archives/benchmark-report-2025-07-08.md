# InsightCode Benchmark Report (Full Project Analysis)

> Generated on 2025-07-08T21:23:44.446Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 72.76s |
| **Total Lines of Code** | 4,080,821 |
| **Analysis Speed** | 56,083 lines/sec |

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

## Individual Project Analysis

### chalk (⭐ 22.3k) - Grade: C (79/100)

- **Description**: Terminal string styling library
- **Files**: 15 files, 978 lines
- **Avg Complexity**: 8.90 (StdDev: 13.70)
- **Avg Duplication**: 4.30%

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

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the Top 5 critical files list.

---
### lodash (⭐ 60.6k) - Grade: F (33/100)

- **Description**: JavaScript utility library
- **Files**: 47 files, 64,669 lines
- **Avg Complexity**: 170.90 (StdDev: 579.56)
- **Avg Duplication**: 11.10%

- **Emblematic Files Validation**:
  - ✅ `lodash.js` (found in Top 5, expected as core)

---
### react (⭐ 235k) - Grade: F (50/100)

- **Description**: JavaScript library for building UIs
- **Files**: 3,935 files, 504,543 lines
- **Avg Complexity**: 10.90 (StdDev: 45.90)
- **Avg Duplication**: 41.00%

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

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the Top 5 critical files list.

---
### vue (⭐ 50.7k) - Grade: F (58/100)

- **Description**: Progressive JavaScript framework
- **Files**: 504 files, 122,336 lines
- **Avg Complexity**: 18.50 (StdDev: 42.74)
- **Avg Duplication**: 15.10%

- **Emblematic Files Validation**:
  - ✅ `packages/runtime-core/src/renderer.ts` (found in Top 5, expected as core)

---
