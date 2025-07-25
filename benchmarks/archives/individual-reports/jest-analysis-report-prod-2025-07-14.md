# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-14T19:23:03.558Z
- **Duration:** 74.86s
- **Files Analyzed:** 388
- **Tool Version:** 0.6.0

## Executive Summary

**Grade C (71/100)** - Good health.

**🚨 Primary Concern:** Extreme complexity (330) in `jest-runtime/src/index.ts`.

**🎯 Priority Action:** Break down into smaller, single-responsibility functions

**📊 Additional Context:** 9 other files require attention.

## Quality Overview

### Grade: ⚠️ **C**

**141 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 55/100 | 🔴 Critical |
| Duplication | 98/100 (2.4% detected) | 🟢 Excellent |
| Maintainability | 74/100 | 🟡 Good |
| **Overall** | **71/100** | **🟡 Good** |

### 📊 Scoring Methodology

InsightCode uses **internal hypothesis-based scoring** requiring empirical validation:

#### Overall Score Formula
`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)`

| Dimension | Weight | Foundation & Thresholds |
|-----------|--------|--------------------------|
| **Complexity** | **45%** | **McCabe (1976) thresholds:** ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Weight = internal hypothesis. |
| **Maintainability** | **30%** | **File size impact hypothesis:** ≤200 LOC ideal. Weight = internal hypothesis (requires validation). |
| **Duplication** | **25%** | **Industry-standard thresholds:** ≤3% "excellent" aligned with SonarQube. Weight = internal hypothesis. |

#### ⚠️ Important Disclaimers
**Project weights (45/30/25) are internal hypotheses requiring empirical validation, NOT industry standards.** These weights apply only to project-level aggregation. File Health Scores use unweighted penalty summation.

#### Grade Scale (Academic Standard)
**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)

#### Aggregation Method
- **Project-level:** Architectural criticality weighting WITHOUT outlier masking
- **File-level:** Penalty-based (100 - penalties) with NO CAPS - extreme values get extreme penalties
- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 388 |
| Total Lines of Code | 44,580 |
| Average Complexity | 16.9 |
| Average LOC per File | 115 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 226 | 58% |
| 🟢 Very Good (B: 80-89) | 21 | 5% |
| 🟡 Good (C: 70-79) | 12 | 3% |
| 🟠 Moderate (D: 60-69) | 12 | 3% |
| 🔴 Poor (F: <60) | 117 | 30% |

## Critical Files Requiring Attention

| File | Health | Primary Concern & Recommendation |
|------|--------|-----------------------------------|
| jest-runtime/src/index.ts | 0% | Extreme complexity (330) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| jest-mock/src/index.ts | 0% | Extreme complexity (193) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| expect/src/spyMatchers.ts | 0% | Extreme complexity (80) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| jest-worker/src/workers/processChild.ts | 0% | Very High complexity (43) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| jest-resolve/src/resolver.ts | 0% | Extreme complexity (167) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| jest-config/src/normalize.ts | 0% | Extreme complexity (146) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| jest-haste-map/src/index.ts | 0% | Extreme complexity (140) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| jest-transform/src/ScriptTransformer.ts | 0% | Extreme complexity (135) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| expect-utils/src/utils.ts | 0% | Extreme complexity (121) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| pretty-format/src/index.ts | 0% | Extreme complexity (119) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `normalize` | `jest-config/src/normalize.ts` | **63** | 698 | complexity, size, high-complexity, long-function, deep-nesting, async-heavy, god-function, single-responsibility, pure-function |
| `eventHandler` | `jest-circus/src/eventHandler.ts` | **49** | 284 | complexity, size, high-complexity, long-function, deep-nesting, pure-function |
| `eq` | `expect-utils/src/jasmineUtils.ts` | **47** | 145 | complexity, size, high-complexity, long-function, deep-nesting, well-named |
| `iterableEquality` | `expect-utils/src/utils.ts` | **39** | 151 | complexity, size, high-complexity, long-function, deep-nesting |
| `joinAlignedDiffsNoExpand` | `jest-diff/src/joinAlignedDiffs.ts` | **35** | 172 | complexity, size, high-complexity, long-function, deep-nesting |

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| pretty-format/src/types.ts | 9 | 99th percentile | Type definitions |
| expect/src/types.ts | 7 | 97th percentile | Type definitions |
| pretty-format/src/collections.ts | 4 | 93th percentile | Core module |
| expect-utils/src/jasmineUtils.ts | 3 | 85th percentile | Utilities |
| expect-utils/src/types.ts | 3 | 85th percentile | Type definitions |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| expect/src/index.ts | 1.00 | 7/0 |
| expect-utils/src/index.ts | 1.00 | 3/0 |
| pretty-format/src/index.ts | 1.00 | 8/0 |
| test-utils/src/index.ts | 1.00 | 4/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 🔴 Critical | 129 | 105 | 24 | jest-config/src, jest-reporters/src |
| 🟠 High | 262 | 61 | 201 | jest-core/src, jest-reporters/src |
| 🟡 Medium | 1016 | 59 | 957 | jest-reporters/src, expect/src |
| 🟢 Low | 1210 | 0 | 1210 | jest-core/src, jest-runtime/src |

### Function-Level Issue Details

| Issue Pattern | Functions Affected | Examples |
|---------------|-------------------|----------|
| Pure function | 745 | normalize (jest-config/src/normalize.ts), eventHandler (jest-circus/src/eventHandler.ts) +743 more |
| Deep nesting | 469 | normalize (jest-config/src/normalize.ts), eventHandler (jest-circus/src/eventHandler.ts) +467 more |
| Well named | 310 | eq (expect-utils/src/jasmineUtils.ts), _validate (jest-validate/src/validate.ts) +308 more |
| Size | 181 | normalize (jest-config/src/normalize.ts), eventHandler (jest-circus/src/eventHandler.ts) +179 more |
| Long function | 181 | normalize (jest-config/src/normalize.ts), eventHandler (jest-circus/src/eventHandler.ts) +179 more |

### File-Level Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 149 | 2.1x threshold |
| Size | 58 | 1.5x threshold |
| Duplication | 18 | 1.4x threshold |

## 📈 Analyse des Patterns

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 469 | Hard to read and test |
| Long Function | 181 | Should be split into smaller functions |
| High Complexity | 50 | Error-prone and hard to maintain |
| Too Many Params | 17 | Consider using object parameters |
| God Function | 10 | Violates Single Responsibility |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Pure Function | 745 | Predictable and testable |
| Well Named | 310 | Self-documenting code |
| Single Responsibility | 167 | Clean separation of concerns |

### 🏗️ Architectural Characteristics

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Async Heavy | 155 | Ensure proper error handling |


---
## 🔬 Technical Notes

### Duplication Detection
- **Algorithm:** Enhanced 8-line literal pattern matching with 8+ token minimum, cross-file exact matches only
- **Focus:** Copy-paste duplication using MD5 hashing of normalized blocks (not structural similarity)
- **Philosophy:** Pragmatic approach using regex normalization - avoids false positives while catching actionable duplication
- **Mode:** STRICT mode active (≤3% = excellent, industry-standard thresholds)
- **Results:** Typically 0-3% duplication with strict thresholds, aligning with SonarQube standards

### Complexity Calculation
- **Method:** McCabe Cyclomatic Complexity (1976) + Industry Best Practices
- **Scoring:** Linear (≤10→20) → Quadratic (20→50) → Exponential (>50) - Rules of the Art
- **Research Base:** Internal methodology inspired by Pareto Principle - extreme values dominate

### Health Score Formula
- **Base:** 100 points minus penalties
- **Penalties:** Progressive (linear then exponential) - NO LOGARITHMIC MASKING
- **Caps:** NO CAPS - extreme values receive extreme penalties (following Pareto principle)
- **Purpose:** Identify real problems following Pareto principle (80/20)
