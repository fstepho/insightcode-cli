# InsightCode Benchmarks - Real World Projects

## Methodology
- **Date**: 2025-06-27
- **InsightCode Version**: 0.1.0
- **Total Projects Analyzed**: 19
- **Analysis Method**: Fresh clone, default settings, no modifications

> ⚠️ **Important Limitation**  
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.

## Results Summary

| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |
|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|
| ms | 4.8k | small | 6 | 878 | **64** | **D** | 10.8 | 0% | 0.7s |
| classnames | 17k | small | 12 | 604 | **79** | **C** | 4.6 | 11.5% | 0.6s |
| is-promise | 0.3k | small | 4 | 69 | **73** | **C** | 3 | 32.3% | 0.7s |
| debounce | 1.1k | small | 2 | 399 | **62** | **D** | 8.5 | 1% | 0.7s |
| uuid | 14k | small | 79 | 2,808 | **80** | **B** | 2.7 | 17.7% | 0.8s |
| dotenv | 19k | small | 14 | 1,138 | **75** | **C** | 7.6 | 2.5% | 0.7s |
| axios | 104k | medium | 162 | 12,371 | **72** | **C** | 8.1 | 6.4% | 0.9s |
| chalk | 21k | medium | 15 | 978 | **76** | **C** | 8.9 | 0.3% | 0.8s |
| commander | 26k | medium | 165 | 14,311 | **80** | **C** | 4.7 | 4.1% | 0.8s |
| yargs | 11k | medium | 39 | 5,592 | **42** | **F** | 19.9 | 6.7% | 0.8s |
| joi | 21k | medium | 67 | 41,576 | **27** | **F** | 27.1 | 4.7% | 1.0s |
| date-fns | 34k | medium | 1535 | 78,569 | **78** | **C** | 2.5 | 20.3% | 1.5s |
| zod | 33k | medium | 339 | 46,000 | **53** | **F** | 10.9 | 19.1% | 1.4s |
| typescript | 98k | large | 36846 | 2,797,487 | **64** | **D** | 4.9 | 31.1% | 38.3s |
| nest | 65k | large | 1611 | 83,442 | **75** | **C** | 2.6 | 23.5% | 1.7s |
| express | 64k | large | 142 | 15,603 | **75** | **C** | 4.6 | 7.2% | 0.9s |
| prettier | 49k | large | 5014 | 105,553 | **89** | **B** | 3.2 | 4.7% | 2.9s |
| eslint | 25k | large | 1437 | 463,978 | **34** | **F** | 12.1 | 19.8% | 3.3s |
| webpack | 65k | large | 7180 | 180,621 | **80** | **B** | 4.7 | 13.3% | 3.2s |

## Detailed Analysis

### Small Projects

#### ms (⭐ 4.8k)
- **Score**: D (64/100)
- **Files**: 6 files, 878 lines
- **Complexity**: 10.8 average
- **Duplication**: 0%
- **Top Issues**:
  - `src/index.ts`: High complexity: 55 (recommended: < 20)

#### classnames (⭐ 17k)
- **Score**: C (79/100)
- **Files**: 12 files, 604 lines
- **Complexity**: 4.6 average
- **Duplication**: 11.5%
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
- **Score**: B (80/100)
- **Files**: 79 files, 2,808 lines
- **Complexity**: 2.7 average
- **Duplication**: 17.7%
- **Top Issues**:
  - `src/v1.ts`: High complexity: 21 (recommended: < 20)
  - `examples/browser-esmodules/example.js`: High duplication: 82% of code is duplicated
  - `examples/browser-rollup/example-all.js`: High duplication: 100% of code is duplicated

#### dotenv (⭐ 19k)
- **Score**: C (75/100)
- **Files**: 14 files, 1,138 lines
- **Complexity**: 7.6 average
- **Duplication**: 2.5%
- **Top Issues**:
  - `lib/main.js`: High complexity: 71 (recommended: < 20)
  - `lib/main.js`: File getting large: 284 lines


### Medium Projects

#### axios (⭐ 104k)
- **Score**: C (72/100)
- **Files**: 162 files, 12,371 lines
- **Complexity**: 8.1 average
- **Duplication**: 6.4%
- **Top Issues**:
  - `index.js`: High duplication: 48% of code is duplicated
  - `bin/contributors.js`: High complexity: 30 (recommended: < 20)
  - `lib/utils.js`: High complexity: 109 (recommended: < 20)

#### chalk (⭐ 21k)
- **Score**: C (76/100)
- **Files**: 15 files, 978 lines
- **Complexity**: 8.9 average
- **Duplication**: 0.3%
- **Top Issues**:
  - `source/index.js`: High complexity: 23 (recommended: < 20)
  - `source/vendor/supports-color/index.js`: High complexity: 55 (recommended: < 20)
  - `source/vendor/ansi-styles/index.js`: Medium complexity: 14 (recommended: < 10)

#### commander (⭐ 26k)
- **Score**: C (80/100)
- **Files**: 165 files, 14,311 lines
- **Complexity**: 4.7 average
- **Duplication**: 4.1%
- **Top Issues**:
  - `lib/command.js`: High complexity: 341 (recommended: < 20)
  - `lib/command.js`: Large file: 1547 lines (recommended: < 300)
  - `lib/help.js`: High complexity: 70 (recommended: < 20)

#### yargs (⭐ 11k)
- **Score**: F (42/100)
- **Files**: 39 files, 5,592 lines
- **Complexity**: 19.9 average
- **Duplication**: 6.7%
- **Top Issues**:
  - `deno-types.ts`: High duplication: 67% of code is duplicated
  - `lib/command.ts`: High complexity: 93 (recommended: < 20)
  - `lib/command.ts`: Large file: 766 lines (recommended: < 300)

#### joi (⭐ 21k)
- **Score**: F (27/100)
- **Files**: 67 files, 41,576 lines
- **Complexity**: 27.1 average
- **Duplication**: 4.7%
- **Top Issues**:
  - `lib/annotate.js`: High complexity: 32 (recommended: < 20)
  - `lib/base.js`: High complexity: 150 (recommended: < 20)
  - `lib/base.js`: Large file: 716 lines (recommended: < 300)

#### date-fns (⭐ 34k)
- **Score**: C (78/100)
- **Files**: 1535 files, 78,569 lines
- **Complexity**: 2.5 average
- **Duplication**: 20.3%
- **Top Issues**:
  - `examples/node-esm/fp.js`: High duplication: 100% of code is duplicated
  - `examples/rollup/fp.js`: High duplication: 100% of code is duplicated
  - `examples/rollup/misc.js`: High duplication: 100% of code is duplicated

#### zod (⭐ 33k)
- **Score**: F (53/100)
- **Files**: 339 files, 46,000 lines
- **Complexity**: 10.9 average
- **Duplication**: 19.1%
- **Top Issues**:
  - `packages/bench/array.ts`: High duplication: 33% of code is duplicated
  - `packages/bench/boolean.ts`: High duplication: 44% of code is duplicated
  - `packages/bench/datetime-regex.ts`: High duplication: 78% of code is duplicated


### Large Projects

#### typescript (⭐ 98k)
- **Score**: D (64/100)
- **Files**: 36846 files, 2,797,487 lines
- **Complexity**: 4.9 average
- **Duplication**: 31.1%
- **Top Issues**:
  - `src/deprecatedCompat/deprecate.ts`: High complexity: 21 (recommended: < 20)
  - `src/compiler/binder.ts`: High complexity: 960 (recommended: < 20)
  - `src/compiler/binder.ts`: Large file: 3255 lines (recommended: < 300)

#### nest (⭐ 65k)
- **Score**: C (75/100)
- **Files**: 1611 files, 83,442 lines
- **Complexity**: 2.6 average
- **Duplication**: 23.5%
- **Top Issues**:
  - `packages/core/metadata-scanner.ts`: High complexity: 21 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: High complexity: 23 (recommended: < 20)
  - `packages/core/nest-application-context.ts`: Large file: 340 lines (recommended: < 300)

#### express (⭐ 64k)
- **Score**: C (75/100)
- **Files**: 142 files, 15,603 lines
- **Complexity**: 4.6 average
- **Duplication**: 7.2%
- **Top Issues**:
  - `index.js`: High duplication: 80% of code is duplicated
  - `lib/application.js`: High complexity: 41 (recommended: < 20)
  - `lib/request.js`: High complexity: 29 (recommended: < 20)

#### prettier (⭐ 49k)
- **Score**: B (89/100)
- **Files**: 5014 files, 105,553 lines
- **Complexity**: 3.2 average
- **Duplication**: 4.7%
- **Top Issues**:
  - `eslint.config.js`: Large file: 451 lines (recommended: < 400)
  - `scripts/generate-changelog.js`: High complexity: 31 (recommended: < 25)
  - `scripts/lint-changelog.js`: High complexity: 27 (recommended: < 25)

#### eslint (⭐ 25k)
- **Score**: F (34/100)
- **Files**: 1437 files, 463,978 lines
- **Complexity**: 12.1 average
- **Duplication**: 19.8%
- **Top Issues**:
  - `Makefile.js`: High complexity: 67 (recommended: < 20)
  - `Makefile.js`: Large file: 794 lines (recommended: < 300)
  - `docs/.eleventy.js`: High complexity: 25 (recommended: < 20)

#### webpack (⭐ 65k)
- **Score**: B (80/100)
- **Files**: 7180 files, 180,621 lines
- **Complexity**: 4.7 average
- **Duplication**: 13.3%
- **Top Issues**:
  - `schemas/WebpackOptions.check.js`: High complexity: 6208 (recommended: < 20)
  - `schemas/WebpackOptions.check.js`: High duplication: 50% of code is duplicated
  - `tooling/print-cache-file.js`: High complexity: 25 (recommended: < 20)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 72/100, complexity 6.2
- **medium** projects: Average score 61/100, complexity 11.7
- **large** projects: Average score 70/100, complexity 5.4

### Performance Statistics

- **Total lines analyzed**: 3,851,977
- **Total analysis time**: 61.6s
- **Average speed**: 62,555 lines/second

## Validation for InsightCode

### Grade Distribution

- **B**: 3 project(s) - uuid, prettier, webpack
- **C**: 9 project(s) - classnames, is-promise, dotenv, axios, chalk, commander, date-fns, nest, express
- **D**: 3 project(s) - ms, debounce, typescript
- **F**: 4 project(s) - yargs, joi, zod, eslint

### Key Insights

- **Best score**: prettier with B (89/100)
- **Worst score**: joi with F (27/100)

### Performance Validation

- ✅ **Speed confirmed**: 62,555 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 2,797,487 lines
- ✅ **Large project handling**: typescript (2,797,487 lines) in 38.3s
