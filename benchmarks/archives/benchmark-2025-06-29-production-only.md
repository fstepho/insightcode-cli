# InsightCode Benchmarks - Production code only

## Methodology
- **Date**: 2025-06-29
- **InsightCode Version**: 0.3.0
- **Analysis Context**: Production code only
- **Excluded**: Tests, examples, scripts, tools, fixtures, mocks
- **Total Projects Analyzed**: 9
- **Analysis Method**: Fresh clone, default settings, no modifications
> ⚠️ **Important Limitation**
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.


## Scoring System (v0.3.0+)

InsightCode uses graduated thresholds aligned with industry standards:

### Complexity (40% weight)
- ≤10: 100 points (Excellent)
- ≤15: 85 points (Good)
- ≤20: 65 points (Acceptable)
- ≤30: 40 points (Poor)
- ≤50: 20 points (Very Poor)
- >50: Graduated penalty

### Duplication (30% weight)
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
| chalk | 21k | small | 4 | 386 | **100** | **A** | 8.3 | 2% | 0.8s |
| lodash | 59k | small | 20 | 8,879 | **44** | **F** | 93.4 | 7.8% | 1.2s |
| uuid | 14k | small | 29 | 978 | **82** | **B** | 4.2 | 15.6% | 0.9s |
| express | 65k | medium | 7 | 1,130 | **46** | **F** | 32.1 | 17.9% | 0.9s |
| jest | 44k | medium | 719 | 48,897 | **76** | **C** | 8.8 | 41.8% | 2.7s |
| vue | 46k | medium | 285 | 49,536 | **66** | **D** | 29.5 | 10.1% | 1.7s |
| eslint | 25k | large | 414 | 63,692 | **58** | **F** | 23.2 | 27.8% | 2.2s |
| react | 227k | large | 1428 | 215,616 | **52** | **F** | 22 | 43.7% | 4.7s |
| typescript | 98k | large | 601 | 303,933 | **28** | **F** | 93.5 | 16.4% | 17.5s |

## Detailed Analysis

### Small Projects

#### lodash (⭐ 59k)
- **Score**: F (44/100)
- **Files**: 20 files, 8,879 lines
- **Complexity**: 93.4 average
- **Duplication**: 7.8%
- **Top Issues**:
  - `lodash.js`: High complexity: 1659 (recommended: < 20)
  - `lodash.js`: Large file: 5970 lines (recommended: < 300)
  - `perf/perf.js`: High complexity: 55 (recommended: < 20)

#### chalk (⭐ 21k)
- **Score**: A (100/100)
- **Files**: 4 files, 386 lines
- **Complexity**: 8.3 average
- **Duplication**: 2%
- **Top Issues**:
  - `source/index.js`: High complexity: 23 (recommended: < 20)

#### uuid (⭐ 14k)
- **Score**: B (82/100)
- **Files**: 29 files, 978 lines
- **Complexity**: 4.2 average
- **Duplication**: 15.6%
- **Top Issues**:
  - `src/md5.ts`: High duplication: 83% of code is duplicated
  - `src/sha1.ts`: High duplication: 83% of code is duplicated
  - `src/v3.ts`: High duplication: 70% of code is duplicated


### Medium Projects

#### express (⭐ 65k)
- **Score**: F (46/100)
- **Files**: 7 files, 1,130 lines
- **Complexity**: 32.1 average
- **Duplication**: 17.9%
- **Top Issues**:
  - `lib/response.js`: High complexity: 109 (recommended: < 20)
  - `lib/response.js`: Large file: 468 lines (recommended: < 300)
  - `lib/application.js`: High complexity: 41 (recommended: < 20)

#### vue (⭐ 46k)
- **Score**: D (66/100)
- **Files**: 285 files, 49,536 lines
- **Complexity**: 29.5 average
- **Duplication**: 10.1%
- **Top Issues**:
  - `packages/runtime-core/src/renderer.ts`: High complexity: 419 (recommended: < 20)
  - `packages/runtime-core/src/renderer.ts`: Large file: 2155 lines (recommended: < 300)
  - `packages/compiler-sfc/src/script/resolveType.ts`: High complexity: 443 (recommended: < 20)

#### jest (⭐ 44k)
- **Score**: C (76/100)
- **Files**: 719 files, 48,897 lines
- **Complexity**: 8.8 average
- **Duplication**: 41.8%
- **Top Issues**:
  - `packages/jest-runtime/src/index.ts`: High complexity: 242 (recommended: < 20)
  - `packages/jest-runtime/src/index.ts`: Large file: 2172 lines (recommended: < 300)
  - `packages/jest-config/src/normalize.ts`: High complexity: 256 (recommended: < 20)


### Large Projects

#### react (⭐ 227k)
- **Score**: F (52/100)
- **Files**: 1428 files, 215,616 lines
- **Complexity**: 22 average
- **Duplication**: 43.7%
- **Top Issues**:
  - `packages/react-dom-bindings/src/client/ReactDOMComponent.js`: High complexity: 817 (recommended: < 20)
  - `packages/react-dom-bindings/src/client/ReactDOMComponent.js`: Large file: 2952 lines (recommended: < 300)
  - `packages/react-dom-bindings/src/client/ReactDOMComponent.js`: Medium duplication: 27% of code is duplicated

#### eslint (⭐ 25k)
- **Score**: F (58/100)
- **Files**: 414 files, 63,692 lines
- **Complexity**: 23.2 average
- **Duplication**: 27.8%
- **Top Issues**:
  - `lib/linter/linter.js`: High complexity: 259 (recommended: < 20)
  - `lib/linter/linter.js`: Large file: 1811 lines (recommended: < 300)
  - `lib/rules/indent.js`: High complexity: 187 (recommended: < 20)

#### typescript (⭐ 98k)
- **Score**: F (28/100)
- **Files**: 601 files, 303,933 lines
- **Complexity**: 93.5 average
- **Duplication**: 16.4%
- **Top Issues**:
  - `src/compiler/binder.ts`: High complexity: 959 (recommended: < 20)
  - `src/compiler/binder.ts`: Large file: 3255 lines (recommended: < 300)
  - `src/compiler/checker.ts`: High complexity: 16260 (recommended: < 20)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 75/100, complexity 35.3
- **medium** projects: Average score 63/100, complexity 23.5
- **large** projects: Average score 46/100, complexity 46.2

### Performance Statistics

- **Total lines analyzed**: 693,047
- **Total analysis time**: 32.7s
- **Average speed**: 21,179 lines/second

## Validation for InsightCode

### Grade Distribution (v0.3.0 Scoring)

- **A**: 1 project(s) (11%) - chalk
- **B**: 1 project(s) (11%) - uuid
- **C**: 1 project(s) (11%) - jest
- **D**: 1 project(s) (11%) - vue
- **F**: 5 project(s) (56%) - lodash, express, react, eslint, typescript

### Complexity Distribution

- **Excellent (≤10)**: 3 projects (33%)
- **Poor (≤30)**: 3 projects (33%)
- **Very Poor (≤50)**: 1 projects (11%)
- **Critical (>50)**: 2 projects (22%)

### Score Extremes

- **Best score**: chalk with A (100/100)
- **Worst score**: typescript with F (28/100)

### Scoring Breakdown Examples

**chalk** (Best):
- Complexity: 8.3 → ~85-100 points
- Duplication: 2% → ~85-100 points
- Final: 100/100

**typescript** (Worst):
- Complexity: 93.5 → ~5-20 points
- Duplication: 16.4% → ~20-65 points
- Final: 28/100

### Performance Validation

- ✅ **Speed confirmed**: 21,179 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 386 to 303,933 lines
- ✅ **Large project handling**: typescript (303,933 lines) in 17.5s
- 🔍 **Actionable insights**: Identified real issues like src/compiler/checker.ts with complexity 16260
