> **⚠️ Historical Document**: This document uses legacy weight system (40/30/30). Current system uses 45/30/25 with internal hypothesis disclaimers. See current documentation for up-to-date information.

# InsightCode Benchmarks - Full codebase including tests/examples

## Methodology
- **Date**: 2025-06-29
- **InsightCode Version**: 0.3.0
- **Analysis Context**: Full codebase including tests/examples
- **Total Projects Analyzed**: 9
- **Analysis Method**: Fresh clone, default settings, no modifications
> ⚠️ **Important Limitation**
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.


## Scoring System (v0.3.0+)

InsightCode uses graduated thresholds aligned with industry standards:

### Complexity (45% weight - internal hypothesis)
- ≤10: 100 points (Excellent)
- ≤15: 85 points (Good)
- ≤20: 65 points (Acceptable)
- ≤30: 40 points (Poor)
- ≤50: 20 points (Very Poor)
- >50: Graduated penalty

### Duplication (25% weight - internal hypothesis)
- ≤3%: 100 points (Industry leader)
- ≤8%: 85 points (Industry standard)
- ≤15%: 65 points (Acceptable)
- ≤30%: 40 points (Poor)
- ≤50%: 20 points (Very Poor)

### Maintainability (30% weight)
- Based on file size (≤200 lines = 100 points) and function count
- Additional penalties for files >1000 lines

## Results Summary

| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |
|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|
| chalk | 21k | small | 15 | 978 | **96** | **A** | 8.9 | 4.3% | 0.7s |
| lodash | 59k | small | 47 | 64,669 | **29** | **F** | 170.9 | 11.1% | 1.6s |
| uuid | 14k | small | 77 | 2,686 | **82** | **B** | 2.6 | 22.2% | 0.8s |
| express | 65k | medium | 142 | 15,616 | **69** | **D** | 4.6 | 33.9% | 0.9s |
| jest | 44k | medium | 1781 | 118,178 | **76** | **C** | 4.5 | 47% | 3.4s |
| vue | 46k | medium | 504 | 122,336 | **58** | **F** | 18.5 | 15.1% | 2.1s |
| eslint | 25k | large | 1437 | 463,978 | **66** | **D** | 12 | 44.9% | 4.6s |
| react | 227k | large | 4144 | 535,754 | **68** | **D** | 11.1 | 41.6% | 7.1s |
| typescript | 98k | large | 36846 | 2,797,487 | **76** | **C** | 4.9 | 63.7% | 52.8s |

## Detailed Analysis

### Small Projects

#### lodash (⭐ 59k)
- **Score**: F (29/100)
- **Files**: 47 files, 64,669 lines
- **Complexity**: 170.9 average
- **Duplication**: 11.1%
- **Top Issues**:
  - `lodash.js`: High complexity: 1659 (recommended: < 20)
  - `lodash.js`: Large file: 5970 lines (recommended: < 300)
  - `test/test.js`: High complexity: 1179 (recommended: < 30)

#### chalk (⭐ 21k)
- **Score**: A (96/100)
- **Files**: 15 files, 978 lines
- **Complexity**: 8.9 average
- **Duplication**: 4.3%
- **Top Issues**:
  - `source/vendor/supports-color/index.js`: High complexity: 55 (recommended: < 20)
  - `source/index.js`: High complexity: 23 (recommended: < 20)

#### uuid (⭐ 14k)
- **Score**: B (82/100)
- **Files**: 77 files, 2,686 lines
- **Complexity**: 2.6 average
- **Duplication**: 22.2%
- **Top Issues**:
  - `examples/browser-rollup/example-all.js`: High duplication: 100% of code is duplicated
  - `examples/browser-rollup/example-v1.js`: High duplication: 100% of code is duplicated
  - `examples/browser-rollup/example-v4.js`: High duplication: 100% of code is duplicated


### Medium Projects

#### express (⭐ 65k)
- **Score**: D (69/100)
- **Files**: 142 files, 15,616 lines
- **Complexity**: 4.6 average
- **Duplication**: 33.9%
- **Top Issues**:
  - `lib/response.js`: High complexity: 109 (recommended: < 20)
  - `lib/response.js`: Large file: 468 lines (recommended: < 300)
  - `test/express.urlencoded.js`: Large file: 701 lines (recommended: < 500)

#### vue (⭐ 46k)
- **Score**: F (58/100)
- **Files**: 504 files, 122,336 lines
- **Complexity**: 18.5 average
- **Duplication**: 15.1%
- **Top Issues**:
  - `packages/runtime-core/src/renderer.ts`: High complexity: 419 (recommended: < 20)
  - `packages/runtime-core/src/renderer.ts`: Large file: 2155 lines (recommended: < 300)
  - `packages/compiler-sfc/src/script/resolveType.ts`: High complexity: 443 (recommended: < 20)

#### jest (⭐ 44k)
- **Score**: C (76/100)
- **Files**: 1781 files, 118,178 lines
- **Complexity**: 4.5 average
- **Duplication**: 47%
- **Top Issues**:
  - `packages/jest-runtime/src/index.ts`: High complexity: 242 (recommended: < 20)
  - `packages/jest-runtime/src/index.ts`: Large file: 2172 lines (recommended: < 300)
  - `packages/jest-config/src/normalize.ts`: High complexity: 256 (recommended: < 20)


### Large Projects

#### react (⭐ 227k)
- **Score**: D (68/100)
- **Files**: 4144 files, 535,754 lines
- **Complexity**: 11.1 average
- **Duplication**: 41.6%
- **Top Issues**:
  - `scripts/bench/benchmarks/pe-functional-components/benchmark.js`: High complexity: 499 (recommended: < 25)
  - `scripts/bench/benchmarks/pe-functional-components/benchmark.js`: Large file: 4994 lines (recommended: < 400)
  - `scripts/bench/benchmarks/pe-functional-components/benchmark.js`: High duplication: 64% of code is duplicated

#### eslint (⭐ 25k)
- **Score**: D (66/100)
- **Files**: 1437 files, 463,978 lines
- **Complexity**: 12 average
- **Duplication**: 44.9%
- **Top Issues**:
  - `tests/bench/large.js`: High complexity: 2080 (recommended: < 30)
  - `tests/bench/large.js`: Large file: 17139 lines (recommended: < 500)
  - `tests/bench/large.js`: High duplication: 69% of code is duplicated

#### typescript (⭐ 98k)
- **Score**: C (76/100)
- **Files**: 36846 files, 2,797,487 lines
- **Complexity**: 4.9 average
- **Duplication**: 63.7%
- **Top Issues**:
  - `tests/baselines/reference/enumLiteralsSubtypeReduction.js`: High complexity: 1026 (recommended: < 30)
  - `tests/baselines/reference/enumLiteralsSubtypeReduction.js`: Large file: 4109 lines (recommended: < 500)
  - `tests/baselines/reference/enumLiteralsSubtypeReduction.js`: High duplication: 67% of code is duplicated

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 69/100, complexity 60.8
- **medium** projects: Average score 68/100, complexity 9.2
- **large** projects: Average score 70/100, complexity 9.3

### Performance Statistics

- **Total lines analyzed**: 4,121,682
- **Total analysis time**: 74.0s
- **Average speed**: 55,721 lines/second

## Validation for InsightCode

### Grade Distribution (v0.3.0 Scoring)

- **A**: 1 project(s) (11%) - chalk
- **B**: 1 project(s) (11%) - uuid
- **C**: 2 project(s) (22%) - jest, typescript
- **D**: 3 project(s) (33%) - express, react, eslint
- **F**: 2 project(s) (22%) - lodash, vue

### Complexity Distribution

- **Excellent (≤10)**: 5 projects (56%)
- **Good (≤15)**: 2 projects (22%)
- **Acceptable (≤20)**: 1 projects (11%)
- **Critical (>50)**: 1 projects (11%)

### Score Extremes

- **Best score**: chalk with A (96/100)
- **Worst score**: lodash with F (29/100)

### Scoring Breakdown Examples

**chalk** (Best):
- Complexity: 8.9 → ~85-100 points
- Duplication: 4.3% → ~85-100 points
- Final: 96/100

**lodash** (Worst):
- Complexity: 170.9 → ~5-20 points
- Duplication: 11.1% → ~20-65 points
- Final: 29/100

### Performance Validation

- ✅ **Speed confirmed**: 55,721 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 978 to 2,797,487 lines
- ✅ **Large project handling**: typescript (2,797,487 lines) in 52.8s
- 🔍 **Actionable insights**: Identified real issues like tests/bench/large.js with complexity 2080
