# InsightCode Benchmarks - Full Codebase Analysis

## Methodology
- **Date**: 2025-06-28
- **InsightCode Version**: 0.3.0
- **Analysis Type**: Full Codebase Analysis
- **Total Projects Analyzed**: 19
- **Analysis Method**: Fresh clone, default settings, no modifications

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
| debounce | 1.1k | small | 2 | 399 | **82** | **B** | 8.5 | 9% | 0.6s |
| dotenv | 19k | small | 14 | 1,138 | **90** | **B** | 7.5 | 12.6% | 0.7s |
| is-promise | 0.3k | small | 4 | 69 | **76** | **C** | 3 | 34% | 0.6s |
| ms | 4.8k | small | 6 | 878 | **74** | **C** | 10.8 | 12% | 0.7s |
| uuid | 14k | small | 79 | 2,808 | **82** | **B** | 2.7 | 24.4% | 0.8s |
| axios | 104k | medium | 162 | 12,371 | **87** | **B** | 8.1 | 10.9% | 0.9s |
| chalk | 21k | medium | 15 | 978 | **96** | **A** | 8.9 | 4.3% | 0.7s |
| commander | 26k | medium | 165 | 14,311 | **80** | **C** | 4.7 | 18.9% | 0.9s |
| date-fns | 34k | medium | 1535 | 78,569 | **76** | **C** | 2.5 | 36.5% | 1.9s |
| joi | 21k | medium | 67 | 41,576 | **42** | **F** | 27.1 | 14.2% | 1.2s |
| yargs | 11k | medium | 39 | 5,592 | **73** | **C** | 19.9 | 12.4% | 0.8s |
| zod | 33k | medium | 339 | 46,000 | **66** | **D** | 10.9 | 34.6% | 1.5s |
| eslint | 25k | large | 1437 | 463,978 | **66** | **D** | 12.1 | 44.9% | 4.9s |
| express | 64k | large | 142 | 15,616 | **69** | **D** | 4.6 | 33.9% | 0.9s |
| nest | 65k | large | 1611 | 83,442 | **82** | **B** | 2.6 | 29.9% | 1.9s |
| prettier | 49k | large | 5014 | 105,553 | **90** | **B** | 3.2 | 9.8% | 3.3s |
| typescript | 98k | large | 36846 | 2,797,487 | **76** | **C** | 4.9 | 63.7% | 52.9s |
| webpack | 65k | large | 7180 | 180,621 | **82** | **B** | 4.7 | 22.7% | 4.1s |

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
  - `bind.js`: High duplication: 41% of code is duplicated
  - `index.js`: High duplication: 41% of code is duplicated
  - `tests/index.js`: High duplication: 51% of code is duplicated

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
  - `index.js`: Medium complexity: 15 (recommended: < 10)
  - `test.js`: Medium duplication: 18% of code is duplicated

#### uuid (⭐ 14k)
- **Score**: B (82/100)
- **Files**: 79 files, 2,808 lines
- **Complexity**: 2.7 average
- **Duplication**: 24.4%
- **Top Issues**:
  - `src/md5.ts`: High duplication: 83% of code is duplicated
  - `src/sha1.ts`: High duplication: 83% of code is duplicated
  - `src/v1.ts`: High complexity: 21 (recommended: < 20)

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
  - `index.js`: High duplication: 52% of code is duplicated
  - `bin/contributors.js`: High complexity: 30 (recommended: < 20)
  - `lib/utils.js`: High complexity: 109 (recommended: < 20)

#### chalk (⭐ 21k)
- **Score**: A (96/100)
- **Files**: 15 files, 978 lines
- **Complexity**: 8.9 average
- **Duplication**: 4.3%
- **Top Issues**:
  - `source/index.js`: High complexity: 23 (recommended: < 20)
  - `source/vendor/supports-color/index.js`: High complexity: 55 (recommended: < 20)
  - `source/vendor/ansi-styles/index.js`: Medium complexity: 14 (recommended: < 10)

#### commander (⭐ 26k)
- **Score**: C (80/100)
- **Files**: 165 files, 14,311 lines
- **Complexity**: 4.7 average
- **Duplication**: 18.9%
- **Top Issues**:
  - `lib/command.js`: High complexity: 341 (recommended: < 20)
  - `lib/command.js`: Large file: 1547 lines (recommended: < 300)
  - `lib/help.js`: High complexity: 70 (recommended: < 20)

#### yargs (⭐ 11k)
- **Score**: C (73/100)
- **Files**: 39 files, 5,592 lines
- **Complexity**: 19.9 average
- **Duplication**: 12.4%
- **Top Issues**:
  - `deno-types.ts`: High duplication: 67% of code is duplicated
  - `lib/command.ts`: High complexity: 93 (recommended: < 20)
  - `lib/command.ts`: Large file: 766 lines (recommended: < 300)

#### joi (⭐ 21k)
- **Score**: F (42/100)
- **Files**: 67 files, 41,576 lines
- **Complexity**: 27.1 average
- **Duplication**: 14.2%
- **Top Issues**:
  - `lib/annotate.js`: High complexity: 32 (recommended: < 20)
  - `lib/base.js`: High complexity: 150 (recommended: < 20)
  - `lib/base.js`: Large file: 716 lines (recommended: < 300)

#### date-fns (⭐ 34k)
- **Score**: C (76/100)
- **Files**: 1535 files, 78,569 lines
- **Complexity**: 2.5 average
- **Duplication**: 36.5%
- **Top Issues**:
  - `docs/config.js`: High duplication: 50% of code is duplicated
  - `src/index.ts`: High duplication: 100% of code is duplicated
  - `examples/cdn/basic.js`: High duplication: 100% of code is duplicated

#### zod (⭐ 33k)
- **Score**: D (66/100)
- **Files**: 339 files, 46,000 lines
- **Complexity**: 10.9 average
- **Duplication**: 34.6%
- **Top Issues**:
  - `packages/bench/array.ts`: High duplication: 58% of code is duplicated
  - `packages/bench/boolean.ts`: High duplication: 56% of code is duplicated
  - `packages/bench/datetime-regex.ts`: High duplication: 75% of code is duplicated


### Large Projects

#### typescript (⭐ 98k)
- **Score**: C (76/100)
- **Files**: 36846 files, 2,797,487 lines
- **Complexity**: 4.9 average
- **Duplication**: 63.7%
- **Top Issues**:
  - `src/deprecatedCompat/deprecate.ts`: High complexity: 21 (recommended: < 20)
  - `src/compiler/binder.ts`: High complexity: 960 (recommended: < 20)
  - `src/compiler/binder.ts`: Large file: 3255 lines (recommended: < 300)

#### nest (⭐ 65k)
- **Score**: B (82/100)
- **Files**: 1611 files, 83,442 lines
- **Complexity**: 2.6 average
- **Duplication**: 29.9%
- **Top Issues**:
  - `packages/core/metadata-scanner.ts`: High complexity: 21 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: High complexity: 23 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: Large file: 340 lines (recommended: < 300)

#### express (⭐ 64k)
- **Score**: D (69/100)
- **Files**: 142 files, 15,616 lines
- **Complexity**: 4.6 average
- **Duplication**: 33.9%
- **Top Issues**:
  - `index.js`: High duplication: 80% of code is duplicated
  - `lib/application.js`: High complexity: 41 (recommended: < 20)
  - `lib/request.js`: High complexity: 29 (recommended: < 20)

#### prettier (⭐ 49k)
- **Score**: B (90/100)
- **Files**: 5014 files, 105,553 lines
- **Complexity**: 3.2 average
- **Duplication**: 9.8%
- **Top Issues**:
  - `eslint.config.js`: Large file: 451 lines (recommended: < 400)
  - `scripts/generate-changelog.js`: High complexity: 31 (recommended: < 25)
  - `scripts/lint-changelog.js`: High complexity: 27 (recommended: < 25)

#### eslint (⭐ 25k)
- **Score**: D (66/100)
- **Files**: 1437 files, 463,978 lines
- **Complexity**: 12.1 average
- **Duplication**: 44.9%
- **Top Issues**:
  - `Makefile.js`: High complexity: 67 (recommended: < 20)
  - `Makefile.js`: Large file: 794 lines (recommended: < 300)
  - `docs/.eleventy.js`: High complexity: 25 (recommended: < 20)

#### webpack (⭐ 65k)
- **Score**: B (82/100)
- **Files**: 7180 files, 180,621 lines
- **Complexity**: 4.7 average
- **Duplication**: 22.7%
- **Top Issues**:
  - `.prettierrc.js`: High duplication: 61% of code is duplicated
  - `jest.config.js`: High duplication: 43% of code is duplicated
  - `hot/dev-server.js`: High duplication: 30% of code is duplicated

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 81/100, complexity 6.2
- **medium** projects: Average score 74/100, complexity 11.7
- **large** projects: Average score 78/100, complexity 5.4

### Performance Statistics

- **Total lines analyzed**: 3,851,990
- **Total analysis time**: 80.1s
- **Average speed**: 48,066 lines/second

## Validation for InsightCode

### Grade Distribution (v0.3.0 Scoring)

- **A**: 1 project(s) (5%) - chalk
- **B**: 8 project(s) (42%) - classnames, debounce, uuid, dotenv, axios, nest, prettier, webpack
- **C**: 6 project(s) (32%) - ms, is-promise, commander, yargs, date-fns, typescript
- **D**: 3 project(s) (16%) - zod, express, eslint
- **F**: 1 project(s) (5%) - joi

### Complexity Distribution

- **Excellent (≤10)**: 14 projects (74%)
- **Good (≤15)**: 3 projects (16%)
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

- ✅ **Speed confirmed**: 48,066 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 2,797,487 lines
- ✅ **Large project handling**: typescript (2,797,487 lines) in 52.9s