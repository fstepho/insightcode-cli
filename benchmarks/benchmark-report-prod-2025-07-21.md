# InsightCode Benchmark Report - Production Code

**Generated:** 2025-07-21T16:18:24.545Z
**Tool Version:** v0.7.0
**Analysis Mode:** Production Code

## Executive Summary

### Performance Metrics
- **Projects Analyzed:** 9
- **Success Rate:** 9/9 (100%)
- **Total Lines Analyzed:** 677,099
- **Analysis Speed:** 9,630 lines/second
- **Total Duration:** 70.31s

### Quality Distribution

| Grade | Projects | Visual |
|-------|----------|--------|
| A | 3 | ██████ |
| B | 4 | ████████ |
| C | 2 | ████ |
| D | 0 |  |
| F | 0 |  |

## Global Insights

### Key Findings

- **Average Code Quality Score:** 86%
- **Code Duplication Rate:** 1.7%
- **Most Common Issue Type:** Deep nesting
- **Critical Issues Found:** 2829

### Highest Quality Projects

1. **uuid** (Grade A, Score: 97/100)
   - UUID generation library
2. **express** (Grade A, Score: 94/100)
   - Fast web framework for Node.js
3. **chalk** (Grade A, Score: 93/100)
   - Terminal string styling library

## Analysis by Project Size

### Small Projects

- **Projects:** lodash, chalk, uuid
- **Average Score:** 91/100
- **Average Complexity:** 37.0

### Medium Projects

- **Projects:** express, vue, jest
- **Average Score:** 85/100
- **Average Complexity:** 18.3

### Large Projects

- **Projects:** angular, eslint, typescript
- **Average Score:** 82/100
- **Average Complexity:** 43.4

## Critical Findings Across All Projects

Found 3385 critical/high severity issues across all projects:

### lodash
- **lodash.js** ⭐: Complexity (100% over threshold)
- **lodash.js** ⭐: Size (597% over threshold)
- **fp/_baseConvert.js**: Complexity (100% over threshold)
- *...and 21 more issues*

### chalk
- **source/index.js** ⭐: Complexity (60% over threshold)

### uuid
- **src/md5-browser.ts**: Complexity (80% over threshold)
- **src/v1.ts**: Complexity (42% over threshold)

### express
- **lib/response.js** ⭐: Complexity (44% over threshold)
- **lib/response.js** ⭐: Size (156% over threshold)

### vue
- **compiler-core/src/ast.ts**: Complexity (64% over threshold)
- **compiler-core/src/ast.ts**: Size (237% over threshold)
- **compiler-core/src/babelUtils.ts**: Complexity (100% over threshold)
- *...and 314 more issues*

### jest
- **babel-plugin-jest-hoist/src/index.ts**: Complexity (100% over threshold)
- **babel-plugin-jest-hoist/src/index.ts**: Size (112% over threshold)
- **create-jest/src/runCreate.ts**: Complexity (48% over threshold)
- *...and 265 more issues*

### angular
- **animations/src/animation_builder.ts**: Complexity (66% over threshold)
- **common/locales/closure-locale.ts**: Complexity (100% over threshold)
- **common/locales/closure-locale.ts**: Size (145% over threshold)
- *...and 1170 more issues*

### eslint
- **Makefile.js**: Complexity (96% over threshold)
- **Makefile.js**: Size (261% over threshold)
- **lib/cli.js**: Complexity (86% over threshold)
- *...and 288 more issues*

### typescript
- **deprecatedCompat/deprecate.ts**: Complexity (44% over threshold)
- **harness/client.ts**: Complexity (100% over threshold)
- **harness/client.ts**: Size (306% over threshold)
- *...and 1304 more issues*

## 📈 Pattern Analysis

### Most Common Patterns

#### Quality Patterns
| Pattern | Occurrences | Found In |
|---------|-------------|----------|
| Deep nesting | 7419 | lodash, chalk, uuid +6 |
| Impure function | 7012 | lodash, uuid, express +5 |
| Poorly named | 2837 | lodash, chalk, uuid +6 |
| Long function | 2237 | lodash, uuid, express +5 |
| High complexity | 2156 | lodash, uuid, vue +4 |

## Project Summaries

### lodash

- **Grade:** B (82/100)
- **Summary:** 4 critical files found requiring attention
- **Files:** 20 | **LOC:** 8,879
- **Avg Complexity:** 98.3
- **⚠️ Critical Issues:** 7

### chalk

- **Grade:** A (93/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 5 | **LOC:** 475
- **Avg Complexity:** 8.0
- **⚠️ Critical Issues:** 1

### uuid

- **Grade:** A (97/100)
- **Summary:** 4 critical files found requiring attention
- **Files:** 29 | **LOC:** 978
- **Avg Complexity:** 4.6
- **⚠️ Critical Issues:** 2

### express

- **Grade:** A (94/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 7 | **LOC:** 1,135
- **Avg Complexity:** 7.4
- **⚠️ Critical Issues:** 2

### vue

- **Grade:** C (75/100)
- **Summary:** 124 critical files found requiring attention
- **Files:** 253 | **LOC:** 43,917
- **Avg Complexity:** 30.6
- **⚠️ Critical Issues:** 156

### jest

- **Grade:** B (85/100)
- **Summary:** 135 critical files found requiring attention
- **Files:** 388 | **LOC:** 44,580
- **Avg Complexity:** 16.9
- **⚠️ Critical Issues:** 153

### angular

- **Grade:** B (83/100)
- **Summary:** 620 critical files found requiring attention
- **Files:** 1744 | **LOC:** 194,063
- **Avg Complexity:** 19.3
- **⚠️ Critical Issues:** 696

### eslint

- **Grade:** B (84/100)
- **Summary:** 171 critical files found requiring attention
- **Files:** 425 | **LOC:** 66,858
- **Avg Complexity:** 18.8
- **⚠️ Critical Issues:** 194

### typescript

- **Grade:** C (78/100)
- **Summary:** 270 critical files found requiring attention
- **Files:** 697 | **LOC:** 316,214
- **Avg Complexity:** 92.0
- **⚠️ Critical Issues:** 381

