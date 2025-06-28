# InsightCode Benchmarks - Real World Projects

## Methodology
- **Date**: 2025-06-26
- **InsightCode Version**: 0.1.0
- **Total Projects Analyzed**: 19
- **Analysis Method**: Fresh clone, default settings, no modifications

## Results Summary

| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |
|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|
| ms | 4.8k | small | 6 | 878 | **64** | **D** | 10.8 | 0% | 0.9s |
| classnames | 17k | small | 12 | 604 | **79** | **C** | 4.6 | 11.5% | 0.8s |
| is-promise | 0.3k | small | 4 | 69 | **73** | **C** | 3 | 32.3% | 0.7s |
| debounce | 1.1k | small | 2 | 399 | **62** | **D** | 8.5 | 1% | 0.7s |
| uuid | 14k | small | 79 | 2,808 | **80** | **B** | 2.7 | 17.7% | 1.0s |
| dotenv | 19k | small | 14 | 1,077 | **76** | **C** | 7.3 | 2.6% | 1.0s |
| axios | 104k | medium | 162 | 12,371 | **72** | **C** | 8.1 | 6.4% | 1.2s |
| chalk | 21k | medium | 15 | 978 | **76** | **C** | 8.9 | 0.3% | 1.0s |
| commander | 26k | medium | 165 | 14,311 | **80** | **C** | 4.7 | 4.1% | 1.0s |
| yargs | 11k | medium | 39 | 5,592 | **42** | **F** | 19.9 | 6.7% | 1.1s |
| joi | 21k | medium | 67 | 41,576 | **27** | **F** | 27.1 | 4.7% | 1.3s |
| date-fns | 34k | medium | 1535 | 78,569 | **78** | **C** | 2.5 | 20.3% | 1.9s |
| zod | 33k | medium | 339 | 46,000 | **53** | **F** | 10.9 | 19.1% | 1.7s |
| nest | 65k | large | 1611 | 83,442 | **75** | **C** | 2.6 | 23.5% | 2.0s |
| express | 64k | large | 142 | 15,603 | **75** | **C** | 4.6 | 7.2% | 1.0s |
| prettier | 49k | large | 5014 | 105,549 | **89** | **B** | 3.2 | 4.7% | 3.4s |
| eslint | 25k | large | 1431 | 463,573 | **34** | **F** | 12.1 | 19.8% | 3.7s |

## Detailed Analysis

### Small Projects

#### ms (⭐ 4.8k)
- **Score**: D (64/100)
- **Files**: 6 files, 878 lines
- **Complexity**: 10.8 average
- **Duplication**: 0%
- **Top Issues**:
  - `src/index.ts`: High complexity: 55 (recommended: < 20)
  - `src/index.test.ts`: File getting large: 230 lines

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
- **Score**: C (76/100)
- **Files**: 14 files, 1,077 lines
- **Complexity**: 7.3 average
- **Duplication**: 2.6%
- **Top Issues**:
  - `lib/main.js`: High complexity: 67 (recommended: < 20)
  - `lib/main.js`: File getting large: 278 lines
  - `tests/test-config-vault.js`: Medium complexity: 12 (recommended: < 10)


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

#### nest (⭐ 65k)
- **Score**: C (75/100)
- **Files**: 1611 files, 83,442 lines
- **Complexity**: 2.6 average
- **Duplication**: 23.5%
- **Top Issues**:
  - `packages/microservices/listeners-controller.ts`: Large file: 321 lines (recommended: < 300)
  - `packages/microservices/nest-microservice.ts`: High complexity: 27 (recommended: < 20)
  - `packages/core/metadata-scanner.ts`: High complexity: 21 (recommended: < 20)

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
- **Files**: 5014 files, 105,549 lines
- **Complexity**: 3.2 average
- **Duplication**: 4.7%
- **Top Issues**:
  - `eslint.config.js`: Large file: 451 lines (recommended: < 300)
  - `src/standalone.js`: High duplication: 30% of code is duplicated
  - `scripts/generate-changelog.js`: High complexity: 31 (recommended: < 20)

#### eslint (⭐ 25k)
- **Score**: F (34/100)
- **Files**: 1431 files, 463,573 lines
- **Complexity**: 12.1 average
- **Duplication**: 19.8%
- **Top Issues**:
  - `Makefile.js`: High complexity: 67 (recommended: < 20)
  - `Makefile.js`: Large file: 794 lines (recommended: < 300)
  - `eslint.config.js`: Large file: 314 lines (recommended: < 300)

## Key Findings

### Average Scores by Project Size

- **small** projects: Average score 72/100, complexity 6.1
- **medium** projects: Average score 61/100, complexity 11.7
- **large** projects: Average score 68/100, complexity 5.6

### Performance Statistics

- **Total lines analyzed**: 873,399
- **Total analysis time**: 24.4s
- **Average speed**: 35,846 lines/second

## Validation for InsightCode

### Grade Distribution

- **B**: 2 project(s) - uuid, prettier
- **C**: 9 project(s) - classnames, is-promise, dotenv, axios, chalk, commander, date-fns, nest, express
- **D**: 2 project(s) - ms, debounce
- **F**: 4 project(s) - yargs, joi, zod, eslint

### Key Insights

- **Best score**: prettier with B (89/100)
- **Worst score**: joi with F (27/100)

### Performance Validation

- ✅ **Speed confirmed**: 35,846 lines/second average
- ✅ **Scalability proven**: Successfully analyzed projects from 69 to 463,573 lines
- ✅ **Large project handling**: eslint (463,573 lines) in 3.7s

## Analysis Errors

- **typescript**: Command failed: insightcode analyze "~/dev/insightcode-cli/temp-analysis" --json
spawnSync /bin/sh ENOBUFS
- **webpack**: Command failed: insightcode analyze "~/dev/insightcode-cli/temp-analysis" --json
spawnSync /bin/sh ENOBUFS
