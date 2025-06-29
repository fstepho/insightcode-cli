# InsightCode Benchmarks - Full Codebase Analysis

## Methodology
- **Date**: 2025-06-29
- **InsightCode Version**: 0.3.0
- **Analysis Type**: Full Codebase Analysis
- **Total Projects Analyzed**: 19
- **Analysis Method**: Fresh clone, default settings, no modifications

> ⚠️ **Important Limitation**  
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.

## Scoring System (v0.3.0+)

InsightCode uses graduated thresholds aligned with industry standards:
...


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
| classnames | 17k | small | 12 | 604 | **82** | **B** | 4.6 | 19.3% | 0.7s |
| debounce | 1.1k | small | 2 | 399 | **82** | **B** | 8.5 | 9% | 0.7s |
| dotenv | 19k | small | 14 | 1,138 | **90** | **B** | 7.5 | 12.6% | 0.7s |
| is-promise | 0.3k | small | 4 | 69 | **76** | **C** | 3 | 34% | 0.6s |
| ms | 4.8k | small | 6 | 878 | **74** | **C** | 10.8 | 12% | 0.8s |
| uuid | 14k | small | 77 | 2,686 | **82** | **B** | 2.6 | 22.2% | 0.8s |
| axios | 104k | medium | 162 | 12,371 | **87** | **B** | 8.1 | 10.9% | 0.9s |
| chalk | 21k | medium | 15 | 978 | **96** | **A** | 8.9 | 4.3% | 0.7s |
| commander | 26k | medium | 165 | 14,311 | **80** | **C** | 4.5 | 18.9% | 0.9s |
| date-fns | 34k | medium | 1535 | 78,569 | **76** | **C** | 2.4 | 36.5% | 1.9s |
| joi | 21k | medium | 67 | 41,576 | **42** | **F** | 27.1 | 14.2% | 1.2s |
| yargs | 11k | medium | 39 | 5,592 | **73** | **C** | 19.7 | 12.4% | 0.9s |
| zod | 33k | medium | 339 | 46,000 | **72** | **C** | 10 | 34.6% | 1.7s |
| eslint | 25k | large | 1437 | 463,978 | **66** | **D** | 12 | 44.9% | 4.7s |
| express | 64k | large | 142 | 15,616 | **69** | **D** | 4.6 | 33.9% | 0.9s |
| nest | 65k | large | 1611 | 83,442 | **82** | **B** | 2.6 | 29.9% | 1.9s |
| prettier | 49k | large | 5014 | 105,553 | **90** | **B** | 3.1 | 9.8% | 3.5s |
| typescript | 98k | large | 36846 | 2,797,487 | **76** | **C** | 4.9 | 63.7% | 51.9s |
| webpack | 65k | large | 7180 | 180,621 | **82** | **B** | 4.7 | 22.7% | 4.0s |

## Detailed Analysis

### Small Projects

#### ms (⭐ 4.8k)
- **Score**: C (74/100)
- **Files**: 6 files, 878 lines
- **Complexity**: 10.8 average
- **Duplication**: 12%
- **Top Issues**:
  - `src/index.ts`: High complexity: 55 (recommended: < 20)
  - `src/parse-strict.test.ts`: Medium duplication: 25% of code is duplicated

#### classnames (⭐ 17k)
- **Score**: B (82/100)
- **Files**: 12 files, 604 lines
- **Complexity**: 4.6 average
- **Duplication**: 19.3%
- **Top Issues**:
  - `tests/index.js`: High duplication: 51% of code is duplicated
  - `bind.js`: High duplication: 41% of code is duplicated
  - `index.js`: High duplication: 41% of code is duplicated

#### is-promise (⭐ 0.3k)
- **Score**: C (76/100)
- **Files**: 4 files, 69 lines
- **Complexity**: 3 average
- **Duplication**: 34%
- **Top Issues**:
  - `test.js`: High duplication: 73% of code is duplicated
  - `test-import/test.js`: High duplication: 63% of code is duplicated

#### debounce (⭐ 1.1k)
- **Score**: B (82/100)
- **Files**: 2 files, 399 lines
- **Complexity**: 8.5 average
- **Duplication**: 9%
- **Top Issues**:
  - `test.js`: Large file: 321 lines (recommended: < 300)
  - `test.js`: Medium duplication: 18% of code is duplicated

#### uuid (⭐ 14k)
- **Score**: B (82/100)
- **Files**: 77 files, 2,686 lines
- **Complexity**: 2.6 average
- **Duplication**: 22.2%
- **Top Issues**:
  - `examples/browser-rollup/example-all.js`: High duplication: 100% of code is duplicated
  - `examples/browser-rollup/example-v1.js`: High duplication: 100% of code is duplicated
  - `examples/browser-rollup/example-v4.js`: High duplication: 100% of code is duplicated

#### dotenv (⭐ 19k)
- **Score**: B (90/100)
- **Files**: 14 files, 1,138 lines
- **Complexity**: 7.5 average
- **Duplication**: 12.6%
- **Top Issues**:
  - `lib/main.js`: High complexity: 69 (recommended: < 20)
  - `lib/main.js`: File getting large: 284 lines
  - `tests/test-cli-options.js`: Medium duplication: 44% of code is duplicated


### Medium Projects

#### axios (⭐ 104k)
- **Score**: B (87/100)
- **Files**: 162 files, 12,371 lines
- **Complexity**: 8.1 average
- **Duplication**: 10.9%
- **Top Issues**:
  - `lib/adapters/http.js`: High complexity: 140 (recommended: < 20)
  - `lib/adapters/http.js`: Large file: 524 lines (recommended: < 300)
  - `lib/utils.js`: High complexity: 109 (recommended: < 20)

#### chalk (⭐ 21k)
- **Score**: A (96/100)
- **Files**: 15 files, 978 lines
- **Complexity**: 8.9 average
- **Duplication**: 4.3%
- **Top Issues**:
  - `source/vendor/supports-color/index.js`: High complexity: 55 (recommended: < 20)
  - `source/index.js`: High complexity: 23 (recommended: < 20)

#### commander (⭐ 26k)
- **Score**: C (80/100)
- **Files**: 165 files, 14,311 lines
- **Complexity**: 4.5 average
- **Duplication**: 18.9%
- **Top Issues**:
  - `lib/command.js`: High complexity: 326 (recommended: < 20)
  - `lib/command.js`: Large file: 1547 lines (recommended: < 300)
  - `lib/help.js`: High complexity: 65 (recommended: < 20)

#### yargs (⭐ 11k)
- **Score**: C (73/100)
- **Files**: 39 files, 5,592 lines
- **Complexity**: 19.7 average
- **Duplication**: 12.4%
- **Top Issues**:
  - `lib/yargs-factory.ts`: High complexity: 276 (recommended: < 20)
  - `lib/yargs-factory.ts`: Large file: 2159 lines (recommended: < 300)
  - `lib/usage.ts`: High complexity: 120 (recommended: < 20)

#### joi (⭐ 21k)
- **Score**: F (42/100)
- **Files**: 67 files, 41,576 lines
- **Complexity**: 27.1 average
- **Duplication**: 14.2%
- **Top Issues**:
  - `lib/types/keys.js`: High complexity: 167 (recommended: < 20)
  - `lib/types/keys.js`: Large file: 790 lines (recommended: < 300)
  - `lib/base.js`: High complexity: 150 (recommended: < 20)

#### date-fns (⭐ 34k)
- **Score**: C (76/100)
- **Files**: 1535 files, 78,569 lines
- **Complexity**: 2.4 average
- **Duplication**: 36.5%
- **Top Issues**:
  - `src/_lib/format/formatters/index.ts`: High complexity: 124 (recommended: < 20)
  - `src/_lib/format/formatters/index.ts`: Large file: 567 lines (recommended: < 300)
  - `src/_lib/format/formatters/index.ts`: High duplication: 35% of code is duplicated

#### zod (⭐ 33k)
- **Score**: C (72/100)
- **Files**: 339 files, 46,000 lines
- **Complexity**: 10 average
- **Duplication**: 34.6%
- **Top Issues**:
  - `packages/zod/src/v3/types.ts`: High complexity: 419 (recommended: < 20)
  - `packages/zod/src/v3/types.ts`: Large file: 4170 lines (recommended: < 300)
  - `packages/zod/src/v4/core/schemas.ts`: High complexity: 257 (recommended: < 20)


### Large Projects

#### typescript (⭐ 98k)
- **Score**: C (76/100)
- **Files**: 36846 files, 2,797,487 lines
- **Complexity**: 4.9 average
- **Duplication**: 63.7%
- **Top Issues**:
  - `tests/baselines/reference/enumLiteralsSubtypeReduction.js`: High complexity: 1026 (recommended: < 30)
  - `tests/baselines/reference/enumLiteralsSubtypeReduction.js`: Large file: 4109 lines (recommended: < 500)
  - `tests/baselines/reference/enumLiteralsSubtypeReduction.js`: High duplication: 67% of code is duplicated

#### nest (⭐ 65k)
- **Score**: B (82/100)
- **Files**: 1611 files, 83,442 lines
- **Complexity**: 2.6 average
- **Duplication**: 29.9%
- **Top Issues**:
  - `packages/core/injector/injector.ts`: High complexity: 96 (recommended: < 20)
  - `packages/core/injector/injector.ts`: Large file: 890 lines (recommended: < 300)
  - `packages/platform-fastify/adapters/fastify-adapter.ts`: High complexity: 77 (recommended: < 20)

#### express (⭐ 64k)
- **Score**: D (69/100)
- **Files**: 142 files, 15,616 lines
- **Complexity**: 4.6 average
- **Duplication**: 33.9%
- **Top Issues**:
  - `lib/response.js`: High complexity: 109 (recommended: < 20)
  - `lib/response.js`: Large file: 468 lines (recommended: < 300)
  - `test/express.urlencoded.js`: Large file: 701 lines (recommended: < 500)

#### prettier (⭐ 49k)
- **Score**: B (90/100)
- **Files**: 5014 files, 105,553 lines
- **Complexity**: 3.1 average
- **Duplication**: 9.8%
- **Top Issues**:
  - `src/language-js/needs-parens.js`: High complexity: 528 (recommended: < 20)
  - `src/language-js/needs-parens.js`: Large file: 1106 lines (recommended: < 300)
  - `src/language-js/utils/index.js`: High complexity: 260 (recommended: < 25)

#### eslint (⭐ 25k)
- **Score**: D (66/100)
- **Files**: 1437 files, 463,978 lines
- **Complexity**: 12 average
- **Duplication**: 44.9%
- **Top Issues**:
  - `tests/bench/large.js`: High complexity: 2080 (recommended: < 30)
  - `tests/bench/large.js`: Large file: 17139 lines (recommended: < 500)
  - `tests/bench/large.js`: High duplication: 69% of code is duplicated

#### webpack (⭐ 65k)
- **Score**: B (82/100)
- **Files**: 7180 files, 180,621 lines
- **Complexity**: 4.7 average
- **Duplication**: 22.7%
- **Top Issues**:
  - `lib/Compilation.js`: High complexity: 650 (recommended: < 20)
  - `lib/Compilation.js`: Large file: 4082 lines (recommended: < 300)
  - `lib/FileSystemInfo.js`: High complexity: 632 (recommended: < 20)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 81/100, complexity 6.2
- **medium** projects: Average score 75/100, complexity 11.5
- **large** projects: Average score 78/100, complexity 5.3

### Performance Statistics

- **Total lines analyzed**: 3,851,868
- **Total analysis time**: 79.5s
- **Average speed**: 48,469 lines/second

## Validation for InsightCode

### Grade Distribution (v0.3.0 Scoring)

- **A**: 1 project(s) (5%) - chalk
- **B**: 8 project(s) (42%) - classnames, debounce, uuid, dotenv, axios, nest, prettier, webpack
- **C**: 7 project(s) (37%) - ms, is-promise, commander, yargs, date-fns, zod, typescript
- **D**: 2 project(s) (11%) - express, eslint
- **F**: 1 project(s) (5%) - joi

### Complexity Distribution

- **Excellent (≤10)**: 15 projects (79%)
- **Good (≤15)**: 2 projects (11%)
- **Acceptable (≤20)**: 1 projects (5%)
- **Poor (≤30)**: 1 projects (5%)

### Score Extremes

- **Best score**: chalk with A (96/100)
- **Worst score**: joi with F (42/100)

### Scoring Breakdown Examples

**chalk** (Best):
- Complexity: 8.9 → ~85-100 points
- Duplication: 4.3% → ~85-100 points
- Final: 96/100

**joi** (Worst):
- Complexity: 27.1 → ~5-20 points
- Duplication: 14.2% → ~20-65 points
- Final: 42/100

### Performance Validation

- ✅ **Speed confirmed**: 48,469 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 2,797,487 lines
- ✅ **Large project handling**: typescript (2,797,487 lines) in 51.9s
- 🔍 **Actionable insights**: Identified real issues like tests/bench/large.js with complexity 2080
