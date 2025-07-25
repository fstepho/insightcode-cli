# InsightCode Benchmark Report - Production Code

**Generated:** 2025-07-11T23:16:27.870Z
**Tool Version:** v0.6.0
**Analysis Mode:** Production Code with Code Context

## Executive Summary

### Performance Metrics
- **Projects Analyzed:** 9
- **Success Rate:** 9/9 (100%)
- **Total Lines Analyzed:** 676,820
- **Analysis Speed:** 24,330 lines/second
- **Total Duration:** 27.82s

### Quality Distribution

| Grade | Projects | Visual |
|-------|----------|--------|
| A | 1 | ██ |
| B | 1 | ██ |
| C | 2 | ████ |
| D | 1 | ██ |
| F | 4 | ████████ |

## Global Insights

### Key Findings

- **Average Code Quality Score:** 63%
- **Code Duplication Rate:** 4.4%
- **Most Common Issue Type:** Complexity
- **Critical Issues Found:** 1045

### Highest Quality Projects

1. **uuid** (Grade A, Score: 94/100)
   - UUID generation library
2. **chalk** (Grade B, Score: 88/100)
   - Terminal string styling library
3. **eslint** (Grade C, Score: 71/100)
   - JavaScript linter

## Analysis by Project Size

### Small Projects

- **Projects:** lodash, chalk, uuid
- **Average Score:** 71/100
- **Average Complexity:** 35.0

### Medium Projects

- **Projects:** express, vue, jest
- **Average Score:** 60/100
- **Average Complexity:** 27.0

### Large Projects

- **Projects:** angular, eslint, typescript
- **Average Score:** 58/100
- **Average Complexity:** 39.4

## Critical Findings Across All Projects

Found 1705 critical/high severity issues across all projects:

### lodash
- **lodash.js** ⭐: Complexity (8330% over threshold)
- **lodash.js** ⭐: Size (597% over threshold)
- **fp/_baseConvert.js**: Complexity (430% over threshold)
- *...and 5 more issues*

### chalk
- **source/index.js** ⭐: Complexity (115% over threshold)

### uuid
- **src/md5.ts**: Duplication (167% over threshold)
- **src/sha1.ts**: Duplication (167% over threshold)
- **src/v1.ts**: Complexity (113% over threshold)
- *...and 2 more issues*

### express
- **lib/application.js** ⭐: Complexity (210% over threshold)
- **lib/request.js** ⭐: Complexity (150% over threshold)
- **lib/response.js** ⭐: Complexity (555% over threshold)
- *...and 3 more issues*

### vue
- **packages/vue/jsx.d.ts**: Duplication (140% over threshold)
- **packages/compiler-core/src/ast.ts**: Size (237% over threshold)
- **packages/compiler-core/src/babelUtils.ts**: Complexity (660% over threshold)
- *...and 168 more issues*

### jest
- **packages/babel-plugin-jest-hoist/src/index.ts**: Complexity (245% over threshold)
- **packages/babel-plugin-jest-hoist/src/index.ts**: Size (112% over threshold)
- **packages/create-jest/src/runCreate.ts**: Complexity (127% over threshold)
- *...and 156 more issues*

### angular
- **packages/localize/index.ts**: Duplication (181% over threshold)
- **packages/platform-browser-dynamic/public_api.ts**: Duplication (167% over threshold)
- **packages/animations/src/errors.ts**: Duplication (133% over threshold)
- *...and 637 more issues*

### eslint
- **Makefile.js**: Complexity (330% over threshold)
- **Makefile.js**: Size (260% over threshold)
- **lib/cli.js**: Complexity (550% over threshold)
- *...and 319 more issues*

### typescript
- **src/deprecatedCompat/deprecate.ts**: Complexity (113% over threshold)
- **src/jsTyping/jsTyping.ts**: Complexity (295% over threshold)
- **src/compiler/binder.ts** ⭐: Complexity (4895% over threshold)
- *...and 390 more issues*

## Code Pattern Analysis

### Most Common Patterns

#### Quality Patterns
| Pattern | Occurrences | Found In |
|---------|-------------|----------|
| Deep Nesting | 1087 | lodash, chalk, uuid +6 |
| Long Function | 914 | lodash, uuid, express +5 |
| High Complexity | 614 | lodash, express, vue +4 |
| Too Many Params | 140 | lodash, uuid, vue +4 |

## Project Summaries

### lodash

- **Grade:** F (31/100)
- **Summary:** 5 critical files found requiring attention
- **Files:** 20 | **LOC:** 8,879
- **Avg Complexity:** 93.9
- **⚠️ Critical Issues:** 8

### chalk

- **Grade:** B (88/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 5 | **LOC:** 475
- **Avg Complexity:** 6.8
- **⚠️ Critical Issues:** 1

### uuid

- **Grade:** A (94/100)
- **Summary:** 5 critical files found requiring attention
- **Files:** 29 | **LOC:** 978
- **Avg Complexity:** 4.3
- **⚠️ Critical Issues:** 5

### express

- **Grade:** F (54/100)
- **Summary:** 5 critical files found requiring attention
- **Files:** 7 | **LOC:** 1,130
- **Avg Complexity:** 33.0
- **⚠️ Critical Issues:** 6

### vue

- **Grade:** F (56/100)
- **Summary:** 132 critical files found requiring attention
- **Files:** 253 | **LOC:** 43,916
- **Avg Complexity:** 32.7
- **⚠️ Critical Issues:** 171

### jest

- **Grade:** C (70/100)
- **Summary:** 131 critical files found requiring attention
- **Files:** 388 | **LOC:** 44,567
- **Avg Complexity:** 15.2
- **⚠️ Critical Issues:** 159

### angular

- **Grade:** D (69/100)
- **Summary:** 537 critical files found requiring attention
- **Files:** 1744 | **LOC:** 194,048
- **Avg Complexity:** 15.0
- **⚠️ Critical Issues:** 640

### eslint

- **Grade:** C (71/100)
- **Summary:** 301 critical files found requiring attention
- **Files:** 425 | **LOC:** 66,827
- **Avg Complexity:** 22.8
- **⚠️ Critical Issues:** 322

### typescript

- **Grade:** F (34/100)
- **Summary:** 278 critical files found requiring attention
- **Files:** 697 | **LOC:** 316,000
- **Avg Complexity:** 80.4
- **⚠️ Critical Issues:** 393

