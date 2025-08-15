# InsightCode Benchmark Report - Production Code

**Generated:** 2025-08-15T09:55:42.147Z
**Tool Version:** v0.8.0
**Analysis Mode:** Production Code

## Executive Summary

### Performance Metrics
- **Projects Analyzed:** 9
- **Success Rate:** 9/9 (100%)
- **Total Lines Analyzed:** 728,756
- **Analysis Speed:** 2,453 lines/second
- **Total Duration:** 297.04s

### Quality Distribution

| Grade | Projects | Visual |
|-------|----------|--------|
| A | 0 |  |
| B | 1 | ██ |
| C | 3 | ██████ |
| D | 3 | ██████ |
| F | 2 | ████ |

## Global Insights

### Key Findings

- **Average Code Quality Score:** 68%
- **Code Duplication Rate:** 1.7%
- **Most Common Issue Type:** Impure function
- **Critical Issues Found:** 3298

### Highest Quality Projects

1. **uuid** (Grade B, Score: 83/100)
   - UUID generation library
2. **chalk** (Grade C, Score: 76/100)
   - Terminal string styling library
3. **express** (Grade C, Score: 76/100)
   - Fast web framework for Node.js

## Analysis by Project Size

### Small Projects

- **Projects:** lodash, chalk, uuid
- **Average Score:** 75/100
- **Average Complexity:** 37.4

### Medium Projects

- **Projects:** express, vue, jest
- **Average Score:** 66/100
- **Average Complexity:** 19.5

### Large Projects

- **Projects:** angular, eslint, typescript
- **Average Score:** 63/100
- **Average Complexity:** 44.8

## Critical Findings Across All Projects

Found 4167 critical/high severity issues across all projects:

### lodash
- **lodash.js** ⭐: Critical file-complexity (100% over threshold)
- **lodash.js** ⭐: Very large-file (597% over threshold)
- **lodash.js** ⭐: Too many-functions (3287% over threshold)
- *...and 24 more issues*

### chalk
- **source/index.js** ⭐: Critical file-complexity (72% over threshold)

### uuid
- **src/md5-browser.ts**: High file-complexity (80% over threshold)
- **src/v1.ts**: Critical file-complexity (42% over threshold)

### express
- **lib/response.js** ⭐: Critical file-complexity (44% over threshold)
- **lib/response.js** ⭐: Large file (156% over threshold)

### vue
- **compiler-dom/src/parserOptions.ts**: High file-complexity (90% over threshold)
- **compiler-sfc/src/compileScript.ts**: Critical file-complexity (100% over threshold)
- **compiler-sfc/src/compileScript.ts**: Very large-file (110% over threshold)
- *...and 380 more issues*

### jest
- **babel-jest/src/index.ts**: Critical file-complexity (44% over threshold)
- **babel-plugin-jest-hoist/src/index.ts**: Critical file-complexity (68% over threshold)
- **babel-plugin-jest-hoist/src/index.ts**: Large file (113% over threshold)
- *...and 320 more issues*

### angular
- **animations/src/animation_builder.ts**: Critical file-complexity (66% over threshold)
- **animations/src/animation_builder.ts**: Too many-functions (153% over threshold)
- **common/locales/closure-locale.ts**: Critical file-complexity (100% over threshold)
- *...and 1399 more issues*

### eslint
- **Makefile.js**: Critical file-complexity (96% over threshold)
- **Makefile.js**: Large file (265% over threshold)
- **Makefile.js**: Too many-functions (193% over threshold)
- *...and 407 more issues*

### typescript
- **deprecatedCompat/deprecate.ts**: Critical file-complexity (44% over threshold)
- **compiler/binder.ts**: Critical file-complexity (100% over threshold)
- **compiler/binder.ts**: Very large-file (356% over threshold)
- *...and 1614 more issues*

## 📈 Pattern Analysis

### Most Common Patterns

#### Quality Patterns
| Pattern | Occurrences | Found In |
|---------|-------------|----------|
| Impure function | 11027 | lodash, chalk, uuid +6 |
| Long function | 2012 | lodash, uuid, express +5 |
| Poorly named | 1585 | lodash, uuid, vue +4 |
| Multiple responsibilities | 1217 | lodash, uuid, express +5 |
| God function | 593 | lodash, vue, jest +3 |

## Project Summaries

### lodash

- **Grade:** D (65/100)
- **Summary:** 4 critical files found requiring attention
- **Files:** 20 | **LOC:** 8,882
- **Avg Complexity:** 98.3
- **⚠️ Critical Issues:** 8

### chalk

- **Grade:** C (76/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 5 | **LOC:** 476
- **Avg Complexity:** 9.2
- **⚠️ Critical Issues:** 1

### uuid

- **Grade:** B (83/100)
- **Summary:** 5 critical files found requiring attention
- **Files:** 29 | **LOC:** 979
- **Avg Complexity:** 4.6
- **⚠️ Critical Issues:** 2

### express

- **Grade:** C (76/100)
- **Summary:** Good overall health with 1 file requiring attention
- **Files:** 7 | **LOC:** 1,136
- **Avg Complexity:** 7.4
- **⚠️ Critical Issues:** 2

### vue

- **Grade:** F (58/100)
- **Summary:** 133 critical files found requiring attention
- **Files:** 253 | **LOC:** 43,928
- **Avg Complexity:** 33.6
- **⚠️ Critical Issues:** 180

### jest

- **Grade:** D (65/100)
- **Summary:** 149 critical files found requiring attention
- **Files:** 388 | **LOC:** 44,953
- **Avg Complexity:** 17.5
- **⚠️ Critical Issues:** 171

### angular

- **Grade:** C (74/100)
- **Summary:** 691 critical files found requiring attention
- **Files:** 1744 | **LOC:** 195,842
- **Avg Complexity:** 19.5
- **⚠️ Critical Issues:** 829

### eslint

- **Grade:** D (62/100)
- **Summary:** 227 critical files found requiring attention
- **Files:** 425 | **LOC:** 67,609
- **Avg Complexity:** 27.1
- **⚠️ Critical Issues:** 273

### typescript

- **Grade:** F (54/100)
- **Summary:** 293 critical files found requiring attention
- **Files:** 697 | **LOC:** 364,951
- **Avg Complexity:** 87.9
- **⚠️ Critical Issues:** 526

