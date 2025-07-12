# InsightCode Benchmark Report - Full Project

**Generated:** 2025-07-11T16:15:46.498Z
**Tool Version:** v0.6.0
**Analysis Mode:** Full Project with Code Context

## Executive Summary

### Performance Metrics
- **Projects Analyzed:** 9
- **Success Rate:** 9/9 (100%)
- **Total Lines Analyzed:** 4,221,759
- **Analysis Speed:** 24,939 lines/second
- **Total Duration:** 169.28s

### Quality Distribution

| Grade | Projects | Visual |
|-------|----------|--------|
| A | 1 | ██ |
| B | 2 | ████ |
| C | 2 | ████ |
| D | 1 | ██ |
| F | 3 | ██████ |

## Global Insights

### Key Findings

- **Average Code Quality Score:** 69%
- **Code Duplication Rate:** 0.0%
- **Most Common Issue Type:** Size
- **Critical Issues Found:** 2017

### Highest Quality Projects

1. **uuid** (Grade A, Score: 98/100)
   - UUID generation library
2. **chalk** (Grade B, Score: 82/100)
   - Terminal string styling library
3. **express** (Grade B, Score: 81/100)
   - Fast web framework for Node.js

## Analysis by Project Size

### Small Projects

- **Projects:** lodash, chalk, uuid
- **Average Score:** 69/100
- **Average Complexity:** 60.6

### Medium Projects

- **Projects:** express, vue, jest
- **Average Score:** 71/100
- **Average Complexity:** 9.2

### Large Projects

- **Projects:** angular, eslint, typescript
- **Average Score:** 67/100
- **Average Complexity:** 8.2

## Critical Findings Across All Projects

Found 4095 critical/high severity issues across all projects:

### lodash
- **lodash.js** ⭐: Complexity (8330% over threshold)
- **lodash.js** ⭐: Size (597% over threshold)
- **fp/_baseConvert.js**: Complexity (430% over threshold)
- *...and 30 more issues*

### chalk
- **source/index.js** ⭐: Complexity (115% over threshold)
- **source/vendor/supports-color/index.js** ⭐: Complexity (280% over threshold)

### uuid
- **src/v1.ts**: Complexity (113% over threshold)

### express
- **lib/application.js** ⭐: Complexity (210% over threshold)
- **lib/request.js** ⭐: Complexity (150% over threshold)
- **lib/response.js** ⭐: Complexity (555% over threshold)
- *...and 9 more issues*

### vue
- **rollup.config.js**: Complexity (212% over threshold)
- **rollup.dts.config.js**: Complexity (140% over threshold)
- **scripts/build.js**: Complexity (112% over threshold)
- *...and 218 more issues*

### jest
- **e2e/Utils.ts**: Complexity (155% over threshold)
- **e2e/runJest.ts**: Complexity (113% over threshold)
- **e2e/__tests__/jestChangedFiles.test.ts**: Size (101% over threshold)
- *...and 185 more issues*

### angular
- **.github/actions/deploy-docs-site/main.js**: Complexity (31680% over threshold)
- **.github/actions/deploy-docs-site/main.js**: Size (2945% over threshold)
- **adev/shared-docs/utils/navigation.utils.ts**: Complexity (122% over threshold)
- *...and 863 more issues*

### eslint
- **Makefile.js**: Complexity (330% over threshold)
- **Makefile.js**: Size (260% over threshold)
- **docs/.eleventy.js**: Complexity (125% over threshold)
- *...and 447 more issues*

### typescript
- **src/compiler/binder.ts** ⭐: Complexity (4895% over threshold)
- **src/compiler/binder.ts** ⭐: Size (326% over threshold)
- **src/compiler/builder.ts** ⭐: Complexity (1930% over threshold)
- *...and 2319 more issues*

## Code Pattern Analysis

### Most Common Patterns

#### Quality Patterns
| Pattern | Occurrences | Found In |
|---------|-------------|----------|
| Deep Nesting | 1979 | lodash, chalk, uuid +6 |
| Long Function | 1409 | lodash, chalk, uuid +6 |
| High Complexity | 867 | lodash, chalk, express +5 |
| Too Many Params | 161 | lodash, uuid, vue +4 |

## Project Summaries

### lodash

- **Grade:** F (28/100)
- **Summary:** 21 critical files found requiring attention
- **Files:** 47 | **LOC:** 50,800
- **Avg Complexity:** 171.9
- **⚠️ Critical Issues:** 33

### chalk

- **Grade:** B (82/100)
- **Summary:** 2 critical files found requiring attention
- **Files:** 19 | **LOC:** 1,170
- **Avg Complexity:** 7.3
- **⚠️ Critical Issues:** 2

### uuid

- **Grade:** A (98/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 79 | **LOC:** 2,808
- **Avg Complexity:** 2.6
- **⚠️ Critical Issues:** 1

### express

- **Grade:** B (81/100)
- **Summary:** 16 critical files found requiring attention
- **Files:** 142 | **LOC:** 15,093
- **Avg Complexity:** 4.7
- **⚠️ Critical Issues:** 12

### vue

- **Grade:** F (56/100)
- **Summary:** 186 critical files found requiring attention
- **Files:** 514 | **LOC:** 122,032
- **Avg Complexity:** 18.3
- **⚠️ Critical Issues:** 221

### jest

- **Grade:** C (77/100)
- **Summary:** 154 critical files found requiring attention
- **Files:** 1785 | **LOC:** 117,482
- **Avg Complexity:** 4.6
- **⚠️ Critical Issues:** 188

### angular

- **Grade:** D (68/100)
- **Summary:** 751 critical files found requiring attention
- **Files:** 5895 | **LOC:** 686,697
- **Avg Complexity:** 7.6
- **⚠️ Critical Issues:** 866

### eslint

- **Grade:** F (58/100)
- **Summary:** 415 critical files found requiring attention
- **Files:** 1448 | **LOC:** 444,017
- **Avg Complexity:** 12.1
- **⚠️ Critical Issues:** 450

### typescript

- **Grade:** C (74/100)
- **Summary:** 2465 critical files found requiring attention
- **Files:** 37701 | **LOC:** 2,781,660
- **Avg Complexity:** 4.8
- **⚠️ Critical Issues:** 2322

