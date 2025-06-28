# InsightCode Benchmarks - Production Code Only

## Methodology
- **Date**: 2025-06-28
- **InsightCode Version**: 0.3.0
- **Analysis Type**: Production Code Only (with --exclude-utility)
- **Total Projects Analyzed**: 19
- **Analysis Method**: Fresh clone, default settings, no modifications

## Results Summary

| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |
|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|
| ms | 4.8k | small | 1 | 178 | **68** | **D** | 55 | 2% | 0.7s |
| classnames | 17k | small | 3 | 129 | **76** | **C** | 14.7 | 27.3% | 0.7s |
| is-promise | 0.3k | small | 4 | 69 | **76** | **C** | 3 | 34% | 0.6s |
| debounce | 1.1k | small | 2 | 399 | **82** | **B** | 8.5 | 9% | 0.7s |
| uuid | 14k | small | 29 | 978 | **82** | **B** | 4.5 | 15.6% | 0.8s |
| dotenv | 19k | small | 4 | 327 | **86** | **B** | 20 | 0.8% | 0.7s |
| axios | 104k | medium | 82 | 4,326 | **94** | **A** | 12 | 1.6% | 0.9s |
| chalk | 21k | medium | 7 | 729 | **82** | **B** | 15.6 | 3.1% | 0.7s |
| commander | 26k | medium | 11 | 3,004 | **54** | **F** | 43.9 | 4.2% | 0.8s |
| yargs | 11k | medium | 15 | 5,047 | **52** | **F** | 45.7 | 6.2% | 0.9s |
| joi | 21k | medium | 36 | 7,812 | **57** | **F** | 45.3 | 7.3% | 0.9s |
| date-fns | 34k | medium | 1480 | 77,040 | **76** | **C** | 2.5 | 36.4% | 1.8s |
| zod | 33k | medium | 158 | 22,108 | **60** | **F** | 18.5 | 36.6% | 1.3s |
| typescript | 98k | large | 601 | 303,933 | **28** | **F** | 94.1 | 16.4% | 17.4s |
| nest | 65k | large | 1199 | 39,866 | **76** | **C** | 3 | 30.1% | 1.5s |
| express | 64k | large | 7 | 1,130 | **46** | **F** | 32.1 | 17.9% | 0.8s |
| prettier | 49k | large | 312 | 30,648 | **66** | **D** | 22.5 | 10.4% | 2.4s |
| eslint | 25k | large | 414 | 63,692 | **58** | **F** | 23.3 | 27.8% | 2.2s |
| webpack | 65k | large | 620 | 96,189 | **48** | **F** | 38.6 | 23.4% | 3.3s |

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
- **Score**: B (82/100)
- **Files**: 7 files, 729 lines
- **Complexity**: 15.6 average
- **Duplication**: 3.1%
- **Top Issues**:
  - `source/index.js`: High complexity: 23 (recommended: < 20)
  - `source/vendor/supports-color/index.js`: High complexity: 55 (recommended: < 20)
  - `source/vendor/ansi-styles/index.js`: Medium complexity: 14 (recommended: < 10)

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
  - `src/compiler/binder.ts`: High complexity: 960 (recommended: < 20)
  - `src/compiler/binder.ts`: Large file: 3255 lines (recommended: < 300)
  - `src/compiler/builder.ts`: High complexity: 389 (recommended: < 20)

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
  - `lib/Chunk.js`: High complexity: 91 (recommended: < 20)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 78/100, complexity 17.6
- **medium** projects: Average score 68/100, complexity 26.2
- **large** projects: Average score 54/100, complexity 35.6

### Performance Statistics

- **Total lines analyzed**: 657,604
- **Total analysis time**: 39.2s
- **Average speed**: 16,769 lines/second

## Validation for InsightCode

### Grade Distribution

- **A**: 1 project(s) - axios
- **B**: 4 project(s) - debounce, uuid, dotenv, chalk
- **C**: 4 project(s) - classnames, is-promise, date-fns, nest
- **D**: 2 project(s) - ms, prettier
- **F**: 8 project(s) - commander, yargs, joi, zod, typescript, express, eslint, webpack

### Key Insights

- **Best score**: axios with A (94/100)
- **Worst score**: typescript with F (28/100)

### Performance Validation

- ✅ **Speed confirmed**: 16,769 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 303,933 lines
- ✅ **Large project handling**: typescript (303,933 lines) in 17.4s

### What This Tells Us

- 📊 **Popular ≠ Perfect**: Even projects with 100k+ stars have technical debt
- 🎯 **Realistic scoring**: InsightCode doesn't inflate scores - a C grade is respectable
- ⚡ **Production ready**: Fast enough for CI/CD pipelines and pre-commit hooks
- 🔍 **Actionable insights**: Identified real issues like binder.ts with complexity 960
