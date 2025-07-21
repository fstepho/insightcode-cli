# InsightCode Benchmark Report - Full Project

**Generated:** 2025-07-21T22:22:16.307Z
**Tool Version:** v0.7.0
**Analysis Mode:** Full Project

## Executive Summary

### Performance Metrics
- **Projects Analyzed:** 9
- **Success Rate:** 9/9 (100%)
- **Total Lines Analyzed:** 4,205,082
- **Analysis Speed:** 12,690 lines/second
- **Total Duration:** 331.38s

### Quality Distribution

| Grade | Projects | Visual |
|-------|----------|--------|
| A | 4 | ████████ |
| B | 4 | ████████ |
| C | 0 |  |
| D | 1 | ██ |
| F | 0 |  |

## Global Insights

### Key Findings

- **Average Code Quality Score:** 87%
- **Code Duplication Rate:** 7.1%
- **Most Common Issue Type:** Poorly named
- **Critical Issues Found:** 4990

### Highest Quality Projects

1. **uuid** (Grade A, Score: 96/100)
   - UUID generation library
2. **express** (Grade A, Score: 95/100)
   - Fast web framework for Node.js
3. **chalk** (Grade A, Score: 94/100)
   - Terminal string styling library

## Analysis by Project Size

### Small Projects

- **Projects:** lodash, chalk, uuid
- **Average Score:** 86/100
- **Average Complexity:** 29.8

### Medium Projects

- **Projects:** express, vue, jest
- **Average Score:** 90/100
- **Average Complexity:** 8.0

### Large Projects

- **Projects:** angular, eslint, typescript
- **Average Score:** 85/100
- **Average Complexity:** 7.6

## Critical Findings Across All Projects

Found 7751 critical/high severity issues across all projects:

### lodash
- **lodash.js** ⭐: Complexity (100% over threshold)
- **lodash.js** ⭐: Size (597% over threshold)
- **fp/_baseConvert.js**: Complexity (100% over threshold)
- *...and 67 more issues*

### chalk
- **source/index.js** ⭐: Complexity (60% over threshold)
- **source/vendor/supports-color/index.js** ⭐: Complexity (100% over threshold)
- **source/vendor/ansi-styles/index.js** ⭐: Long function in `assembleStyles` (100% over threshold)
- *...and 2 more issues*

### uuid
- **src/md5-browser.ts**: Complexity (80% over threshold)
- **src/v1.ts**: Complexity (42% over threshold)
- **test/browser/browser.spec.js**: Complexity (44% over threshold)
- *...and 1 more issues*

### express
- **lib/response.js** ⭐: Complexity (44% over threshold)
- **lib/response.js** ⭐: Size (156% over threshold)
- **test/Router.js**: Size (168% over threshold)
- *...and 11 more issues*

### vue
- **rollup.config.js**: Complexity (92% over threshold)
- **rollup.config.js**: Size (102% over threshold)
- **scripts/build.js**: Complexity (68% over threshold)
- *...and 420 more issues*

### jest
- **e2e/Utils.ts**: Complexity (98% over threshold)
- **e2e/runJest.ts**: Complexity (54% over threshold)
- **e2e/__tests__/jestChangedFiles.test.ts**: Size (168% over threshold)
- *...and 332 more issues*

### angular
- **scripts/compare-main-to-patch.js**: Complexity (95% over threshold)
- **devtools/src/iframe-message-bus.ts**: Complexity (100% over threshold)
- **.github/actions/deploy-docs-site/main.js**: Complexity (100% over threshold)
- *...and 1821 more issues*

### eslint
- **Makefile.js**: Complexity (96% over threshold)
- **Makefile.js**: Size (261% over threshold)
- **docs/.eleventy.js**: Size (131% over threshold)
- *...and 639 more issues*

### typescript
- **tests/lib/lib.d.ts**: Size (1113% over threshold)
- **tests/lib/react.d.ts**: Size (119% over threshold)
- **tests/lib/react16.d.ts**: Size (196% over threshold)
- *...and 4431 more issues*

## 📈 Pattern Analysis

### Most Common Patterns

#### Quality Patterns
| Pattern | Occurrences | Found In |
|---------|-------------|----------|
| Poorly named | 36686 | lodash, chalk, uuid +6 |
| Impure function | 18219 | lodash, uuid, express +5 |
| Deep nesting | 11814 | lodash, chalk, uuid +6 |
| Long function | 2732 | lodash, chalk, uuid +6 |
| Medium complexity | 1857 | lodash, uuid, vue +4 |

## Project Summaries

### lodash

- **Grade:** D (67/100)
- **Summary:** 21 critical files found requiring attention
- **Files:** 47 | **LOC:** 50,842
- **Avg Complexity:** 80.5
- **⚠️ Critical Issues:** 33

### chalk

- **Grade:** A (94/100)
- **Summary:** 2 critical files found requiring attention
- **Files:** 19 | **LOC:** 1,170
- **Avg Complexity:** 6.0
- **⚠️ Critical Issues:** 2

### uuid

- **Grade:** A (96/100)
- **Summary:** 10 critical files found requiring attention
- **Files:** 79 | **LOC:** 2,808
- **Avg Complexity:** 2.8
- **⚠️ Critical Issues:** 3

### express

- **Grade:** A (95/100)
- **Summary:** 14 critical files found requiring attention
- **Files:** 142 | **LOC:** 15,115
- **Avg Complexity:** 2.0
- **⚠️ Critical Issues:** 14

### vue

- **Grade:** B (82/100)
- **Summary:** 210 critical files found requiring attention
- **Files:** 514 | **LOC:** 122,051
- **Avg Complexity:** 17.1
- **⚠️ Critical Issues:** 246

### jest

- **Grade:** A (92/100)
- **Summary:** 235 critical files found requiring attention
- **Files:** 1785 | **LOC:** 117,517
- **Avg Complexity:** 4.9
- **⚠️ Critical Issues:** 217

### angular

- **Grade:** B (86/100)
- **Summary:** 1400 critical files found requiring attention
- **Files:** 5895 | **LOC:** 686,811
- **Avg Complexity:** 9.4
- **⚠️ Critical Issues:** 1237

### eslint

- **Grade:** B (83/100)
- **Summary:** 710 critical files found requiring attention
- **Files:** 1448 | **LOC:** 444,374
- **Avg Complexity:** 8.4
- **⚠️ Critical Issues:** 479

### typescript

- **Grade:** B (85/100)
- **Summary:** 11726 critical files found requiring attention
- **Files:** 37699 | **LOC:** 2,764,394
- **Avg Complexity:** 5.0
- **⚠️ Critical Issues:** 3248

