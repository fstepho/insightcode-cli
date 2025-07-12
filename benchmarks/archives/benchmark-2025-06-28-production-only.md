> **⚠️ Historical Document**: This document uses legacy weight system (40/30/30). Current system uses 45/30/25 with internal hypothesis disclaimers. See current documentation for up-to-date information.

# InsightCode Benchmarks - Production Code Analysis

## Methodology
- **Date**: 2025-06-28
- **InsightCode Version**: 0.3.0
- **Analysis Type**: Production Code Analysis
- **Excluded**: Tests, examples, scripts, tools, fixtures, mocks
- **Total Projects Analyzed**: 19
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
| classnames | 17k | small | 3 | 129 | **76** | **C** | 14.7 | 27.3% | 0.6s |
| debounce | 1.1k | small | 2 | 399 | **82** | **B** | 8.5 | 9% | 0.6s |
| dotenv | 19k | small | 4 | 327 | **86** | **B** | 20 | 0.8% | 0.7s |
| is-promise | 0.3k | small | 4 | 69 | **76** | **C** | 3 | 34% | 0.6s |
| ms | 4.8k | small | 1 | 178 | **68** | **D** | 55 | 2% | 0.7s |
| uuid | 14k | small | 29 | 978 | **82** | **B** | 4.5 | 15.6% | 0.8s |
| axios | 104k | medium | 82 | 4,326 | **94** | **A** | 12 | 1.6% | 0.9s |
| chalk | 21k | medium | 4 | 386 | **100** | **A** | 8.3 | 2% | 0.7s |
| commander | 26k | medium | 11 | 3,004 | **54** | **F** | 43.9 | 4.2% | 0.8s |
| date-fns | 34k | medium | 1480 | 77,040 | **76** | **C** | 2.5 | 36.4% | 1.8s |
| joi | 21k | medium | 36 | 7,812 | **57** | **F** | 45.3 | 7.3% | 0.9s |
| yargs | 11k | medium | 15 | 5,047 | **52** | **F** | 45.7 | 6.2% | 0.8s |
| zod | 33k | medium | 158 | 22,108 | **60** | **F** | 18.5 | 36.6% | 1.3s |
| eslint | 25k | large | 414 | 63,692 | **58** | **F** | 23.3 | 27.8% | 2.2s |
| express | 64k | large | 7 | 1,130 | **46** | **F** | 32.1 | 17.9% | 0.8s |
| nest | 65k | large | 1199 | 39,866 | **76** | **C** | 3 | 30.1% | 1.6s |
| prettier | 49k | large | 312 | 30,648 | **66** | **D** | 22.5 | 10.4% | 2.4s |
| typescript | 98k | large | 601 | 303,933 | **28** | **F** | 94.1 | 16.4% | 16.9s |
| webpack | 65k | large | 620 | 96,189 | **48** | **F** | 38.6 | 23.4% | 3.1s |

## Detailed Analysis

### Small Projects

#### ms (⭐ 4.8k)
- **Score**: D (68/100)
- **Files**: 1 files, 178 lines
- **Complexity**: 55 average
- **Duplication**: 2%
- **Top Issues**:
  - `src/index.ts`: High complexity: 55 (recommended: < 20)

#### classnames (⭐ 17k)
- **Score**: C (76/100)
- **Files**: 3 files, 129 lines
- **Complexity**: 14.7 average
- **Duplication**: 27.3%
- **Top Issues**:
  - `bind.js`: High duplication: 41% of code is duplicated
  - `index.js`: High duplication: 41% of code is duplicated
  - `bind.js`: Medium complexity: 17 (recommended: < 10)

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
- **Files**: 29 files, 978 lines
- **Complexity**: 4.5 average
- **Duplication**: 15.6%
- **Top Issues**:
  - `src/md5.ts`: High duplication: 83% of code is duplicated
  - `src/sha1.ts`: High duplication: 83% of code is duplicated
  - `src/v1.ts`: High complexity: 21 (recommended: < 20)

#### dotenv (⭐ 19k)
- **Score**: B (86/100)
- **Files**: 4 files, 327 lines
- **Complexity**: 20 average
- **Duplication**: 0.8%
- **Top Issues**:
  - `lib/main.js`: High complexity: 69 (recommended: < 20)
  - `lib/main.js`: File getting large: 284 lines


### Medium Projects

#### axios (⭐ 104k)
- **Score**: A (94/100)
- **Files**: 82 files, 4,326 lines
- **Complexity**: 12 average
- **Duplication**: 1.6%
- **Top Issues**:
  - `index.js`: High duplication: 52% of code is duplicated
  - `bin/contributors.js`: High complexity: 30 (recommended: < 20)
  - `lib/utils.js`: High complexity: 109 (recommended: < 20)

#### chalk (⭐ 21k)
- **Score**: A (100/100)
- **Files**: 4 files, 386 lines
- **Complexity**: 8.3 average
- **Duplication**: 2%
- **Top Issues**:
  - `source/index.js`: High complexity: 23 (recommended: < 20)

#### commander (⭐ 26k)
- **Score**: F (54/100)
- **Files**: 11 files, 3,004 lines
- **Complexity**: 43.9 average
- **Duplication**: 4.2%
- **Top Issues**:
  - `lib/command.js`: High complexity: 341 (recommended: < 20)
  - `lib/command.js`: Large file: 1547 lines (recommended: < 300)
  - `lib/help.js`: High complexity: 70 (recommended: < 20)

#### yargs (⭐ 11k)
- **Score**: F (52/100)
- **Files**: 15 files, 5,047 lines
- **Complexity**: 45.7 average
- **Duplication**: 6.2%
- **Top Issues**:
  - `deno-types.ts`: High duplication: 67% of code is duplicated
  - `lib/command.ts`: High complexity: 93 (recommended: < 20)
  - `lib/command.ts`: Large file: 766 lines (recommended: < 300)

#### joi (⭐ 21k)
- **Score**: F (57/100)
- **Files**: 36 files, 7,812 lines
- **Complexity**: 45.3 average
- **Duplication**: 7.3%
- **Top Issues**:
  - `lib/annotate.js`: High complexity: 32 (recommended: < 20)
  - `lib/base.js`: High complexity: 150 (recommended: < 20)
  - `lib/base.js`: Large file: 716 lines (recommended: < 300)

#### date-fns (⭐ 34k)
- **Score**: C (76/100)
- **Files**: 1480 files, 77,040 lines
- **Complexity**: 2.5 average
- **Duplication**: 36.4%
- **Top Issues**:
  - `src/index.ts`: High duplication: 100% of code is duplicated
  - `src/compareAsc/index.ts`: High duplication: 38% of code is duplicated
  - `src/compareDesc/index.ts`: High duplication: 38% of code is duplicated

#### zod (⭐ 33k)
- **Score**: F (60/100)
- **Files**: 158 files, 22,108 lines
- **Complexity**: 18.5 average
- **Duplication**: 36.6%
- **Top Issues**:
  - `packages/bench/array.ts`: High duplication: 58% of code is duplicated
  - `packages/bench/boolean.ts`: High duplication: 56% of code is duplicated
  - `packages/bench/datetime.ts`: High duplication: 56% of code is duplicated


### Large Projects

#### typescript (⭐ 98k)
- **Score**: F (28/100)
- **Files**: 601 files, 303,933 lines
- **Complexity**: 94.1 average
- **Duplication**: 16.4%
- **Top Issues**:
  - `src/deprecatedCompat/deprecate.ts`: High complexity: 21 (recommended: < 20)
  - `src/compiler/binder.ts`: High complexity: 960 (recommended: < 20)
  - `src/compiler/binder.ts`: Large file: 3255 lines (recommended: < 300)

#### nest (⭐ 65k)
- **Score**: C (76/100)
- **Files**: 1199 files, 39,866 lines
- **Complexity**: 3 average
- **Duplication**: 30.1%
- **Top Issues**:
  - `packages/core/metadata-scanner.ts`: High complexity: 21 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: High complexity: 23 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: Large file: 340 lines (recommended: < 300)

#### express (⭐ 64k)
- **Score**: F (46/100)
- **Files**: 7 files, 1,130 lines
- **Complexity**: 32.1 average
- **Duplication**: 17.9%
- **Top Issues**:
  - `index.js`: High duplication: 80% of code is duplicated
  - `lib/application.js`: High complexity: 41 (recommended: < 20)
  - `lib/request.js`: High complexity: 29 (recommended: < 20)

#### prettier (⭐ 49k)
- **Score**: D (66/100)
- **Files**: 312 files, 30,648 lines
- **Complexity**: 22.5 average
- **Duplication**: 10.4%
- **Top Issues**:
  - `eslint.config.js`: Large file: 451 lines (recommended: < 400)
  - `src/standalone.js`: High duplication: 31% of code is duplicated
  - `packages/plugin-hermes/index.js`: High duplication: 50% of code is duplicated

#### eslint (⭐ 25k)
- **Score**: F (58/100)
- **Files**: 414 files, 63,692 lines
- **Complexity**: 23.3 average
- **Duplication**: 27.8%
- **Top Issues**:
  - `Makefile.js`: High complexity: 67 (recommended: < 20)
  - `Makefile.js`: Large file: 794 lines (recommended: < 300)
  - `lib/cli.js`: High complexity: 110 (recommended: < 20)

#### webpack (⭐ 65k)
- **Score**: F (48/100)
- **Files**: 620 files, 96,189 lines
- **Complexity**: 38.6 average
- **Duplication**: 23.4%
- **Top Issues**:
  - `hot/dev-server.js`: High duplication: 30% of code is duplicated
  - `schemas/WebpackOptions.check.js`: High complexity: 6208 (recommended: < 20)
  - `tooling/print-cache-file.js`: High complexity: 25 (recommended: < 20)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 78/100, complexity 17.6
- **medium** projects: Average score 70/100, complexity 25.2
- **large** projects: Average score 54/100, complexity 35.6

### Performance Statistics

- **Total lines analyzed**: 657,261
- **Total analysis time**: 38.3s
- **Average speed**: 17,165 lines/second

## Validation for InsightCode

### Grade Distribution (v0.3.0 Scoring)

- **A**: 2 project(s) (11%) - axios, chalk
- **B**: 3 project(s) (16%) - debounce, uuid, dotenv
- **C**: 4 project(s) (21%) - classnames, is-promise, date-fns, nest
- **D**: 2 project(s) (11%) - ms, prettier
- **F**: 8 project(s) (42%) - commander, yargs, joi, zod, typescript, express, eslint, webpack

### Complexity Distribution

- **Excellent (≤10)**: 6 projects (32%)
- **Good (≤15)**: 2 projects (11%)
- **Acceptable (≤20)**: 2 projects (11%)
- **Poor (≤30)**: 2 projects (11%)
- **Very Poor (≤50)**: 5 projects (26%)
- **Critical (>50)**: 2 projects (11%)

### Score Extremes

- **Best score**: chalk with A (100/100)
- **Worst score**: typescript with F (28/100)

### Scoring Breakdown Examples

**chalk** (Best):
- Complexity: 8.3 → ~85-100 points
- Duplication: 2% → ~85-100 points
- Final: 100/100

**typescript** (Worst):
- Complexity: 94.1 → ~5-20 points
- Duplication: 16.4% → ~20-65 points
- Final: 28/100

### Performance Validation

- ✅ **Speed confirmed**: 17,165 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 303,933 lines
- ✅ **Large project handling**: typescript (303,933 lines) in 16.9s