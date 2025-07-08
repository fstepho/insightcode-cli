# InsightCode Benchmark Report (Production Code Analysis)

> Generated on 2025-07-08T21:21:09.707Z

## Overall Summary

| Metric | Value |
|---|---|
| **Total Projects Analyzed** | 9 / 9 |
| **Total Duration** | 15.29s |
| **Total Lines of Code** | 674,479 |
| **Analysis Speed** | 44,115 lines/sec |

## Benchmark Leaderboard

| Category | Champion 🏆 | Challenger ⚠️ | Metric |
|---|---|---|---|
| **Best Score** | `uuid` (88/100) | `lodash` (36/100) | Overall Score |
| **Lowest Complexity** | `uuid` (4.20) | `lodash` (93.40) | Avg. Complexity |
| **Lowest Duplication** | `chalk` (2.00%) | `react` (44.20%) | Avg. Duplication |

## Complexity Distribution: The "Monolith" Indicator

A high Standard Deviation (StdDev) indicates that complexity is heavily concentrated in a few "monolith" files.

| Project | Avg Complexity | StdDev | Profile |
|---|---|---|---|
| `typescript` | 93.20 | **687.31** | Concentrated 🌋 |
| `lodash` | 93.40 | **359.80** | Concentrated 🌋 |
| `react` | 20.70 | **70.42** | Concentrated 🌋 |
| `vue` | 29.50 | **53.96** | Evenly Distributed |
| `express` | 32.10 | **34.21** | Evenly Distributed |
| `eslint` | 23.20 | **34.18** | Evenly Distributed |
| `jest` | 8.80 | **21.74** | Concentrated 🌋 |
| `chalk` | 8.30 | **8.70** | Evenly Distributed |
| `uuid` | 4.20 | **4.14** | Evenly Distributed |

## Individual Project Analysis

### chalk (⭐ 22.3k) - Grade: B (82/100)

- **Description**: Terminal string styling library
- **Files**: 4 files, 386 lines
- **Avg Complexity**: 8.30 (StdDev: 8.70)
- **Avg Duplication**: 2.00%

- **Emblematic Files Validation**:
  - ✅ `source/index.js` (found in Top 5, expected as core)
  - ✅ `source/utilities.js` (found in Top 5, expected as performanceCritical)

---
### eslint (⭐ 26k) - Grade: F (52/100)

- **Description**: JavaScript linter
- **Files**: 414 files, 63,704 lines
- **Avg Complexity**: 23.20 (StdDev: 34.18)
- **Avg Duplication**: 27.80%

- **Emblematic Files Validation**:
  - ✅ `lib/linter/linter.js` (found in Top 5, expected as core)

---
### express (⭐ 66.2k) - Grade: F (56/100)

- **Description**: Fast web framework for Node.js
- **Files**: 7 files, 1,129 lines
- **Avg Complexity**: 32.10 (StdDev: 34.21)
- **Avg Duplication**: 17.90%

- **Emblematic Files Validation**:
  - ✅ `lib/application.js` (found in Top 5, expected as core)
  - ✅ `lib/view.js` (found in Top 5, expected as architectural)
  - ✅ `lib/utils.js` (found in Top 5, expected as complexAlgorithm)
  - ✅ `lib/request.js` (found in Top 5, expected as complexAlgorithm)
  - ✅ `lib/response.js` (found in Top 5, expected as complexAlgorithm)

---
### jest (⭐ 44.8k) - Grade: D (62/100)

- **Description**: JavaScript testing framework
- **Files**: 719 files, 48,928 lines
- **Avg Complexity**: 8.80 (StdDev: 21.74)
- **Avg Duplication**: 41.90%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the Top 5 critical files list.

---
### lodash (⭐ 60.6k) - Grade: F (36/100)

- **Description**: JavaScript utility library
- **Files**: 20 files, 8,879 lines
- **Avg Complexity**: 93.40 (StdDev: 359.80)
- **Avg Duplication**: 7.80%

- **Emblematic Files Validation**:
  - ✅ `lodash.js` (found in Top 5, expected as core)

---
### react (⭐ 235k) - Grade: F (47/100)

- **Description**: JavaScript library for building UIs
- **Files**: 1,381 files, 197,953 lines
- **Avg Complexity**: 20.70 (StdDev: 70.42)
- **Avg Duplication**: 44.20%

- **Emblematic Files Validation**:
  - ✅ `packages/react-reconciler/src/ReactFiberCommitWork.js` (found in Top 5, expected as performanceCritical)
- **Architectural Risks (Silent Killers)**:
  - `packages/react-reconciler/src/ReactFiberWorkLoop.js` (Impact: 23, Complexity: 621)
  - `packages/react-reconciler/src/ReactFiberLane.js` (Impact: 48, Complexity: 186)
  - `packages/react-reconciler/src/ReactFiberHooks.js` (Impact: 12, Complexity: 491)

---
### typescript (⭐ 104k) - Grade: F (38/100)

- **Description**: TypeScript language compiler
- **Files**: 601 files, 302,986 lines
- **Avg Complexity**: 93.20 (StdDev: 687.31)
- **Avg Duplication**: 16.40%

- **Emblematic Files Validation**:
  - ✅ `src/compiler/checker.ts` (found in Top 5, expected as core)
  - ✅ `src/compiler/parser.ts` (found in Top 5, expected as core)
  - ✅ `src/compiler/emitter.ts` (found in Top 5, expected as performanceCritical)
  - ✅ `src/compiler/utilities.ts` (found in Top 5, expected as complexAlgorithm)

---
### uuid (⭐ 15k) - Grade: B (88/100)

- **Description**: UUID generation library
- **Files**: 29 files, 978 lines
- **Avg Complexity**: 4.20 (StdDev: 4.14)
- **Avg Duplication**: 15.60%

- **Emblematic Files Validation**:
  - ℹ️ No emblematic files were found in the Top 5 critical files list.

---
### vue (⭐ 50.7k) - Grade: F (57/100)

- **Description**: Progressive JavaScript framework
- **Files**: 285 files, 49,536 lines
- **Avg Complexity**: 29.50 (StdDev: 53.96)
- **Avg Duplication**: 10.10%

- **Emblematic Files Validation**:
  - ✅ `packages/runtime-core/src/renderer.ts` (found in Top 5, expected as core)

---
