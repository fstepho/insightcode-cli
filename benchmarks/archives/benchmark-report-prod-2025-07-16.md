# InsightCode Benchmark Report - Production Code

**Generated:** 2025-07-16T18:42:23.934Z
**Tool Version:** v0.7.0
**Analysis Mode:** Production Code

## Executive Summary

### Performance Metrics
- **Projects Analyzed:** 9
- **Success Rate:** 9/9 (100%)
- **Total Lines Analyzed:** 677,099
- **Analysis Speed:** 8,818 lines/second
- **Total Duration:** 76.78s

### Quality Distribution

| Grade | Projects | Visual |
|-------|----------|--------|
| A | 3 | ██████ |
| B | 0 |  |
| C | 2 | ████ |
| D | 2 | ████ |
| F | 2 | ████ |

## Global Insights

### Key Findings

- **Average Code Quality Score:** 68%
- **Code Duplication Rate:** 4.4%
- **Most Common Issue Type:** Deep nesting
- **Critical Issues Found:** 3683

### Highest Quality Projects

1. **uuid** (Grade A, Score: 95/100)
   - UUID generation library
2. **express** (Grade A, Score: 91/100)
   - Fast web framework for Node.js
3. **chalk** (Grade A, Score: 90/100)
   - Terminal string styling library

## Analysis by Project Size

### Small Projects

- **Projects:** lodash, chalk, uuid
- **Average Score:** 72/100
- **Average Complexity:** 37.0

### Medium Projects

- **Projects:** express, vue, jest
- **Average Score:** 75/100
- **Average Complexity:** 18.3

### Large Projects

- **Projects:** angular, eslint, typescript
- **Average Score:** 58/100
- **Average Complexity:** 43.4

## Critical Findings Across All Projects

Found 4355 critical/high severity issues across all projects:

### lodash
- **lodash.js** ⭐: Complexity (9090% over threshold)
- **lodash.js** ⭐: Size (597% over threshold)
- **fp/_baseConvert.js**: Complexity (365% over threshold)
- *...and 24 more issues*

### chalk
- **source/index.js** ⭐: Complexity (150% over threshold)

### uuid
- **src/md5-browser.ts**: Complexity (107% over threshold)
- **src/md5.ts**: Duplication (167% over threshold)
- **src/sha1.ts**: Duplication (167% over threshold)
- *...and 3 more issues*

### express
- **lib/response.js** ⭐: Complexity (110% over threshold)
- **lib/response.js** ⭐: Size (156% over threshold)

### vue
- **vue/jsx.d.ts**: Duplication (140% over threshold)
- **compiler-dom/src/runtimeHelpers.ts**: Duplication (147% over threshold)
- **compiler-core/src/ast.ts**: Complexity (160% over threshold)
- *...and 397 more issues*

### jest
- **babel-plugin-jest-hoist/src/index.ts**: Complexity (133% over threshold)
- **babel-plugin-jest-hoist/src/index.ts**: Size (112% over threshold)
- **create-jest/src/runCreate.ts**: Complexity (120% over threshold)
- *...and 333 more issues*

### angular
- **localize/index.ts**: Duplication (181% over threshold)
- **platform-browser-dynamic/public_api.ts**: Duplication (167% over threshold)
- **animations/src/animation_builder.ts**: Complexity (165% over threshold)
- *...and 1403 more issues*

### eslint
- **Makefile.js**: Complexity (192% over threshold)
- **Makefile.js**: Size (196% over threshold)
- **lib/cli.js**: Complexity (215% over threshold)
- *...and 428 more issues*

### typescript
- **compiler/binder.ts**: Complexity (5625% over threshold)
- **compiler/binder.ts**: Size (326% over threshold)
- **compiler/builder.ts**: Complexity (1835% over threshold)
- *...and 1743 more issues*

## 📈 Pattern Analysis

### Most Common Patterns

#### Quality Patterns
| Pattern | Occurrences | Found In |
|---------|-------------|----------|
| Deep nesting | 7419 | lodash, chalk, uuid +6 |
| Pure function | 7012 | lodash, uuid, express +5 |
| Well named | 2837 | lodash, chalk, uuid +6 |
| Long function | 2237 | lodash, uuid, express +5 |
| Single responsibility | 1121 | lodash, chalk, uuid +6 |

## Project Summaries

### lodash

- **Grade:** F (31/100)
- **Summary:** 4 critical files found requiring attention
- **Files:** 20 | **LOC:** 8,879
- **Avg Complexity:** 98.3
- **⚠️ Critical Issues:** 7

### chalk

- **Grade:** A (90/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 5 | **LOC:** 475
- **Avg Complexity:** 8.0
- **⚠️ Critical Issues:** 1

### uuid

- **Grade:** A (95/100)
- **Summary:** 6 critical files found requiring attention
- **Files:** 29 | **LOC:** 978
- **Avg Complexity:** 4.6
- **⚠️ Critical Issues:** 6

### express

- **Grade:** A (91/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 7 | **LOC:** 1,135
- **Avg Complexity:** 7.4
- **⚠️ Critical Issues:** 2

### vue

- **Grade:** D (63/100)
- **Summary:** 130 critical files found requiring attention
- **Files:** 253 | **LOC:** 43,917
- **Avg Complexity:** 30.6
- **⚠️ Critical Issues:** 166

### jest

- **Grade:** C (71/100)
- **Summary:** 138 critical files found requiring attention
- **Files:** 388 | **LOC:** 44,580
- **Avg Complexity:** 16.9
- **⚠️ Critical Issues:** 166

### angular

- **Grade:** C (70/100)
- **Summary:** 640 critical files found requiring attention
- **Files:** 1744 | **LOC:** 194,063
- **Avg Complexity:** 19.3
- **⚠️ Critical Issues:** 756

### eslint

- **Grade:** D (67/100)
- **Summary:** 277 critical files found requiring attention
- **Files:** 425 | **LOC:** 66,858
- **Avg Complexity:** 18.8
- **⚠️ Critical Issues:** 285

### typescript

- **Grade:** F (38/100)
- **Summary:** 283 critical files found requiring attention
- **Files:** 697 | **LOC:** 316,214
- **Avg Complexity:** 92.0
- **⚠️ Critical Issues:** 404

