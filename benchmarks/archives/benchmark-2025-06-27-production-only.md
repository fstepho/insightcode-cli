# InsightCode Benchmarks - Production Code Only

## Methodology
- **Date**: 2025-06-27
- **InsightCode Version**: 0.2.0
- **Analysis Type**: Production Code Only (with --production)
- **Total Projects Analyzed**: 19
- **Analysis Method**: Fresh clone, default settings, no modifications

> ⚠️ **Important Limitation**  
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.

## Results Summary

| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |
|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|
| ms | 4.8k | small | 1 | 178 | **42** | **F** | 55 | 0% | 0.7s |
| classnames | 17k | small | 3 | 129 | **50** | **F** | 14.7 | 27.3% | 0.6s |
| is-promise | 0.3k | small | 4 | 69 | **73** | **C** | 3 | 32.3% | 0.6s |
| debounce | 1.1k | small | 2 | 399 | **62** | **D** | 8.5 | 1% | 0.6s |
| uuid | 14k | small | 29 | 978 | **86** | **B** | 4.5 | 3% | 0.7s |
| dotenv | 19k | small | 4 | 327 | **52** | **F** | 20.5 | 0% | 0.7s |
| axios | 104k | medium | 82 | 4,326 | **70** | **C** | 12 | 0.6% | 0.9s |
| chalk | 21k | medium | 7 | 729 | **58** | **F** | 15.6 | 0% | 0.7s |
| commander | 26k | medium | 11 | 3,004 | **31** | **F** | 43.9 | 2.9% | 0.8s |
| yargs | 11k | medium | 15 | 5,047 | **27** | **F** | 45.7 | 4.8% | 0.8s |
| joi | 21k | medium | 36 | 7,812 | **37** | **F** | 45.3 | 2.1% | 0.8s |
| date-fns | 34k | medium | 1480 | 77,040 | **77** | **C** | 2.5 | 20.6% | 1.6s |
| zod | 33k | medium | 158 | 22,108 | **40** | **F** | 18.5 | 14.3% | 1.2s |
| typescript | 98k | large | 601 | 303,933 | **27** | **F** | 94.1 | 5.4% | 16.1s |
| nest | 65k | large | 1199 | 39,866 | **76** | **C** | 3 | 24.8% | 1.4s |
| express | 64k | large | 7 | 1,128 | **35** | **F** | 32.1 | 14.9% | 0.8s |
| prettier | 49k | large | 312 | 30,648 | **48** | **F** | 22.5 | 3.1% | 2.8s |
| eslint | 25k | large | 414 | 63,692 | **36** | **F** | 23.3 | 14.4% | 1.9s |
| webpack | 65k | large | 620 | 96,189 | **33** | **F** | 38.6 | 18.5% | 2.7s |

## Detailed Analysis

### Small Projects

#### ms (⭐ 4.8k)
- **Score**: F (42/100)
- **Files**: 1 files, 178 lines
- **Complexity**: 55 average
- **Duplication**: 0%
- **Top Issues**:
  - `src/index.ts`: High complexity: 55 (recommended: < 20)

#### classnames (⭐ 17k)
- **Score**: F (50/100)
- **Files**: 3 files, 129 lines
- **Complexity**: 14.7 average
- **Duplication**: 27.3%
- **Top Issues**:
  - `bind.js`: High duplication: 41% of code is duplicated
  - `index.js`: High duplication: 41% of code is duplicated
  - `bind.js`: Medium complexity: 17 (recommended: < 10)

#### is-promise (⭐ 0.3k)
- **Score**: C (73/100)
- **Files**: 4 files, 69 lines
- **Complexity**: 3 average
- **Duplication**: 32.3%
- **Top Issues**:
  - `test.js`: High duplication: 69% of code is duplicated
  - `test-import/test.js`: High duplication: 60% of code is duplicated

#### debounce (⭐ 1.1k)
- **Score**: D (62/100)
- **Files**: 2 files, 399 lines
- **Complexity**: 8.5 average
- **Duplication**: 1%
- **Top Issues**:
  - `test.js`: Large file: 321 lines (recommended: < 300)
  - `index.js`: Medium complexity: 15 (recommended: < 10)

#### uuid (⭐ 14k)
- **Score**: B (86/100)
- **Files**: 29 files, 978 lines
- **Complexity**: 4.5 average
- **Duplication**: 3%
- **Top Issues**:
  - `src/v1.ts`: High complexity: 21 (recommended: < 20)
  - `src/md5.ts`: Medium duplication: 17% of code is duplicated
  - `src/sha1-browser.ts`: Medium complexity: 11 (recommended: < 10)

#### dotenv (⭐ 19k)
- **Score**: F (52/100)
- **Files**: 4 files, 327 lines
- **Complexity**: 20.5 average
- **Duplication**: 0%
- **Top Issues**:
  - `lib/main.js`: High complexity: 71 (recommended: < 20)
  - `lib/main.js`: File getting large: 284 lines


### Medium Projects

#### axios (⭐ 104k)
- **Score**: C (70/100)
- **Files**: 82 files, 4,326 lines
- **Complexity**: 12 average
- **Duplication**: 0.6%
- **Top Issues**:
  - `index.js`: High duplication: 48% of code is duplicated
  - `bin/contributors.js`: High complexity: 30 (recommended: < 20)
  - `lib/utils.js`: High complexity: 109 (recommended: < 20)

#### chalk (⭐ 21k)
- **Score**: F (58/100)
- **Files**: 7 files, 729 lines
- **Complexity**: 15.6 average
- **Duplication**: 0%
- **Top Issues**:
  - `source/index.js`: High complexity: 23 (recommended: < 20)
  - `source/vendor/supports-color/index.js`: High complexity: 55 (recommended: < 20)
  - `source/vendor/ansi-styles/index.js`: Medium complexity: 14 (recommended: < 10)

#### commander (⭐ 26k)
- **Score**: F (31/100)
- **Files**: 11 files, 3,004 lines
- **Complexity**: 43.9 average
- **Duplication**: 2.9%
- **Top Issues**:
  - `lib/command.js`: High complexity: 341 (recommended: < 20)
  - `lib/command.js`: Large file: 1547 lines (recommended: < 300)
  - `lib/help.js`: High complexity: 70 (recommended: < 20)

#### yargs (⭐ 11k)
- **Score**: F (27/100)
- **Files**: 15 files, 5,047 lines
- **Complexity**: 45.7 average
- **Duplication**: 4.8%
- **Top Issues**:
  - `deno-types.ts`: High duplication: 67% of code is duplicated
  - `lib/command.ts`: High complexity: 93 (recommended: < 20)
  - `lib/command.ts`: Large file: 766 lines (recommended: < 300)

#### joi (⭐ 21k)
- **Score**: F (37/100)
- **Files**: 36 files, 7,812 lines
- **Complexity**: 45.3 average
- **Duplication**: 2.1%
- **Top Issues**:
  - `lib/annotate.js`: High complexity: 32 (recommended: < 20)
  - `lib/base.js`: High complexity: 150 (recommended: < 20)
  - `lib/base.js`: Large file: 716 lines (recommended: < 300)

#### date-fns (⭐ 34k)
- **Score**: C (77/100)
- **Files**: 1480 files, 77,040 lines
- **Complexity**: 2.5 average
- **Duplication**: 20.6%
- **Top Issues**:
  - `src/format/index.ts`: High complexity: 25 (recommended: < 20)
  - `src/format/test.ts`: High complexity: 29 (recommended: < 20)
  - `src/format/test.ts`: Large file: 879 lines (recommended: < 300)

#### zod (⭐ 33k)
- **Score**: F (40/100)
- **Files**: 158 files, 22,108 lines
- **Complexity**: 18.5 average
- **Duplication**: 14.3%
- **Top Issues**:
  - `packages/bench/array.ts`: High duplication: 33% of code is duplicated
  - `packages/bench/boolean.ts`: High duplication: 44% of code is duplicated
  - `packages/bench/datetime.ts`: High duplication: 44% of code is duplicated


### Large Projects

#### typescript (⭐ 98k)
- **Score**: F (27/100)
- **Files**: 601 files, 303,933 lines
- **Complexity**: 94.1 average
- **Duplication**: 5.4%
- **Top Issues**:
  - `src/deprecatedCompat/deprecate.ts`: High complexity: 21 (recommended: < 20)
  - `src/compiler/binder.ts`: High complexity: 960 (recommended: < 20)
  - `src/compiler/binder.ts`: Large file: 3255 lines (recommended: < 300)

#### nest (⭐ 65k)
- **Score**: C (76/100)
- **Files**: 1199 files, 39,866 lines
- **Complexity**: 3 average
- **Duplication**: 24.8%
- **Top Issues**:
  - `packages/core/metadata-scanner.ts`: High complexity: 21 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: High complexity: 23 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: Large file: 340 lines (recommended: < 300)

#### express (⭐ 64k)
- **Score**: F (35/100)
- **Files**: 7 files, 1,128 lines
- **Complexity**: 32.1 average
- **Duplication**: 14.9%
- **Top Issues**:
  - `index.js`: High duplication: 80% of code is duplicated
  - `lib/application.js`: High complexity: 41 (recommended: < 20)
  - `lib/request.js`: High complexity: 29 (recommended: < 20)

#### prettier (⭐ 49k)
- **Score**: F (48/100)
- **Files**: 312 files, 30,648 lines
- **Complexity**: 22.5 average
- **Duplication**: 3.1%
- **Top Issues**:
  - `eslint.config.js`: Large file: 451 lines (recommended: < 400)
  - `src/standalone.js`: High duplication: 30% of code is duplicated
  - `packages/plugin-hermes/index.js`: High duplication: 50% of code is duplicated

#### eslint (⭐ 25k)
- **Score**: F (36/100)
- **Files**: 414 files, 63,692 lines
- **Complexity**: 23.3 average
- **Duplication**: 14.4%
- **Top Issues**:
  - `Makefile.js`: High complexity: 67 (recommended: < 20)
  - `Makefile.js`: Large file: 794 lines (recommended: < 300)
  - `lib/cli.js`: High complexity: 110 (recommended: < 20)

#### webpack (⭐ 65k)
- **Score**: F (33/100)
- **Files**: 620 files, 96,189 lines
- **Complexity**: 38.6 average
- **Duplication**: 18.5%
- **Top Issues**:
  - `schemas/WebpackOptions.check.js`: High complexity: 6208 (recommended: < 20)
  - `schemas/WebpackOptions.check.js`: High duplication: 50% of code is duplicated
  - `lib/Chunk.js`: High complexity: 91 (recommended: < 20)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 61/100, complexity 17.7
- **medium** projects: Average score 49/100, complexity 26.2
- **large** projects: Average score 43/100, complexity 35.6

### Performance Statistics

- **Total lines analyzed**: 657,602
- **Total analysis time**: 36.4s
- **Average speed**: 18,042 lines/second

## Validation for InsightCode

### Grade Distribution

- **B**: 1 project(s) - uuid
- **C**: 4 project(s) - is-promise, axios, date-fns, nest
- **D**: 1 project(s) - debounce
- **F**: 13 project(s) - ms, classnames, dotenv, chalk, commander, yargs, joi, zod, typescript, express, prettier, eslint, webpack

### Key Insights

- **Best score**: uuid with B (86/100)
- **Worst score**: typescript with F (27/100)

### Performance Validation

- ✅ **Speed confirmed**: 18,042 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 303,933 lines
- ✅ **Large project handling**: typescript (303,933 lines) in 16.1s
