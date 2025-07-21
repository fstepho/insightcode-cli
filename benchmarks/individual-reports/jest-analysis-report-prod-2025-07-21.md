# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-21T16:18:21.832Z
- **Duration:** 67.67s
- **Files Analyzed:** 388
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: ✅ **B**

**🚨 Primary Concern:** Extreme complexity (330) in `jest-runtime/src/index.ts`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 75/100 | 🟡 Acceptable |
| Duplication | 99/100 (1.6% detected) | 🟢 Exceptional |
| Maintainability | 89/100 | 🟢 Good |
| **Overall** | **85/100** | **🟢 Good** |

### 📊 Scoring Methodology

InsightCode combines **research-based thresholds** with **criticality-weighted aggregation**, following the **Pareto principle**.

#### 🔧 Overall Score Formula
```
Overall Score = (Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)
```

#### 🧮 Metric Breakdown
| Metric | Weight | Thresholds & Basis |
|--------|--------|---------------------|
| **Complexity** | 45% | McCabe (1976): ≤10 = low, <= 15 = medium, <= 20 = high, <= 50 = very high, >50 = extreme. Penalized quadratically to exponentially. |
| **Maintainability** | 30% | Clean Code: ≤200 LOC/file preferred. Penalties increase with size. |
| **Duplication** | 25% | ⚠️ Legacy threshold ≤15% considered "excellent" (brownfield projects). |

#### 🧠 Aggregation Strategy
- **File-level health:** 100 - penalties (progressive, no caps or masking).
- **Project-level score:** Weighted by **architectural criticality**, not arithmetic average.

#### 🧭 Architectural Criticality Formula
Each file’s weight is computed as:
```
CriticismScore = (Dependencies × 2.0) + (WeightedIssues × 0.5) + 1
```
- **Dependencies:** incoming + outgoing + cycle penalty (if any)
- **WeightedIssues:** critical×4 + high×3 + medium×2 + low×1
- **Note:** Complexity excluded to avoid double-counting (already weighted at 45%)
- **Base +1** avoids zero weighting

#### 🎓 Grade Scale
**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)

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
| 🟢 Excellent (A: 90-100) | 232 | 60% |
| 🟢 Very Good (B: 80-89) | 21 | 5% |
| 🟡 Good (C: 70-79) | 13 | 3% |
| 🟠 Moderate (D: 60-69) | 14 | 4% |
| 🔴 Poor (F: <60) | 108 | 28% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| jest-runtime/src/index.ts | 0% | Extreme complexity (330) |
| jest-mock/src/index.ts | 0% | Extreme complexity (193) |
| expect/src/spyMatchers.ts | 0% | Extreme complexity (80) |
| jest-resolve/src/resolver.ts | 0% | Extreme complexity (167) |
| jest-config/src/normalize.ts | 0% | Extreme complexity (146) |
| jest-haste-map/src/index.ts | 0% | Extreme complexity (140) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `normalize` | `jest-config/src/normalize.ts` | **63** | 698 | **long-function** (Should be split into smaller functions)<br/>**god-function** (Violates Single Responsibility)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**async-heavy** (Ensure proper error handling)<br/>**impure-function** (Side effects make testing harder)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `eventHandler` | `jest-circus/src/eventHandler.ts` | **49** | 284 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder) |
| `eq` | `expect-utils/src/jasmineUtils.ts` | **47** | 145 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**poorly-named** (Names should be descriptive and meaningful) |
| `iterableEquality` | `expect-utils/src/utils.ts` | **39** | 151 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |
| `joinAlignedDiffsNoExpand` | `jest-diff/src/joinAlignedDiffs.ts` | **35** | 172 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |

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
| 💀 Critical | 102 | 101 | 1 | jest-reporters/src, expect/src |
| 🔴 High | 63 | 52 | 11 | jest-config/src, expect/src |
| 🟠 Medium | 59 | 54 | 5 | jest-circus/src, jest-core/src |
| 🟡 Low | 16 | 12 | 4 | jest-core/src, jest-worker/src/workers |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 149 | 0.6x threshold | File is hard to understand and maintain |
| Size | 58 | 1.5x threshold | File should be split into smaller modules |
| Duplication | 12 | 3.4x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| High-complexity | 5 | `normalize`, `eventHandler`... | Error-prone and hard to maintain |
| Long-function | 5 | `normalize`, `eventHandler`... | Should be split into smaller functions |
| Deep-nesting | 5 | `normalize`, `eventHandler`... | Hard to read and test |
| Impure-function | 2 | `normalize`, `eventHandler` | Side effects make testing harder |
| Async-heavy | 1 | `normalize` | Ensure proper error handling |

## 📈 Pattern Analysis

### 🏗️ Architectural Characteristics

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Async Heavy | 1 | Ensure proper error handling |


---
## 🔬 Technical Notes

### Duplication Detection
- **Algorithm:** Enhanced 8-line literal pattern matching with 20+ token minimum, cross-file exact matches only
- **Focus:** Copy-paste duplication using MD5 hashing of normalized blocks (not structural similarity)
- **Philosophy:** Pragmatic approach using regex normalization - avoids false positives while catching actionable duplication
- **Results:** Typically 0-15% duplication vs ~70% with structural detection tools, filtering imports/trivial declarations

### Complexity Calculation
- **Method:** McCabe Cyclomatic Complexity (1976) + Industry Best Practices
- **Scoring:** Linear (≤10→20) → Quadratic (20→50) → Exponential (>50) - Rules of the Art
- **Research Base:** Internal methodology inspired by Pareto Principle - extreme values dominate

### Health Score Formula
- **Base:** 100 points minus penalties
- **Penalties:** Progressive (linear then exponential) - NO LOGARITHMIC MASKING
- **Caps:** NO CAPS - extreme values receive extreme penalties (following Pareto principle)
- **Purpose:** Identify real problems following Pareto principle (80/20)
