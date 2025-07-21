# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-21T14:25:33.534Z
- **Duration:** 258.77s
- **Files Analyzed:** 1785
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: ⚠️ **C**

**🚨 Primary Concern:** Extreme complexity (330) in `packages/jest-runtime/src/index.ts`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 64/100 | 🟠 Poor |
| Duplication | 97/100 (2.5% detected) | 🟢 Exceptional |
| Maintainability | 77/100 | 🟡 Acceptable |
| **Overall** | **76/100** | **🟡 Acceptable** |

### 📊 Scoring Methodology

InsightCode combines **research-based thresholds** with **criticality-weighted aggregation**, following the **Pareto principle**.

#### 🔧 Overall Score Formula
```
Overall Score = (Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)
```

#### 🧮 Metric Breakdown
| Metric | Weight | Thresholds & Basis |
|--------|--------|---------------------|
| **Complexity** | 45% | McCabe (1976): ≤10 = low, >50 = extreme. Penalized quadratically to exponentially. |
| **Maintainability** | 30% | Clean Code: ≤200 LOC/file preferred. Penalties increase with size. |
| **Duplication** | 25% | ⚠️ Legacy threshold ≤15% considered "excellent" (brownfield projects). |

#### 🧠 Aggregation Strategy
- **File-level health:** 100 - penalties (progressive, no caps or masking).
- **Project-level score:** Weighted by **architectural criticality**, not arithmetic average.

#### 🧭 Architectural Criticality Formula
Each file’s weight is computed as:
```
CriticismScore = (Dependencies × 2.0) + (Complexity × 1.0) + (WeightedIssues × 0.5) + 1
```
- **Dependencies:** incoming + outgoing + cycle penalty (if any)
- **WeightedIssues:** critical×4 + high×3 + medium×2 + low×1
- **Base +1** avoids zero weighting

#### 🎓 Grade Scale
**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 1785 |
| Total Lines of Code | 117,517 |
| Average Complexity | 4.9 |
| Average LOC per File | 66 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 1506 | 84% |
| 🟢 Very Good (B: 80-89) | 44 | 2% |
| 🟡 Good (C: 70-79) | 25 | 1% |
| 🟠 Moderate (D: 60-69) | 39 | 2% |
| 🔴 Poor (F: <60) | 171 | 10% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| packages/jest-runtime/src/index.ts | 0% | Extreme complexity (330) |
| packages/jest-mock/src/index.ts | 0% | Extreme complexity (193) |
| packages/expect/src/spyMatchers.ts | 0% | Extreme complexity (80) |
| packages/expect/src/__tests__/matchers.test.js | 0% | Very High complexity (24) |
| packages/jest-resolve/src/resolver.ts | 0% | Extreme complexity (167) |
| packages/jest-config/src/normalize.ts | 0% | Extreme complexity (146) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `normalize` | `packages/jest-config/src/normalize.ts` | **63** | 698 | **long-function** (Should be split into smaller functions)<br/>**god-function** (Violates Single Responsibility)<br/>**single-responsibility** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**async-heavy** (Ensure proper error handling)<br/>**pure-function** (Predictable and testable)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `eventHandler` | `packages/jest-circus/src/eventHandler.ts` | **49** | 284 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**pure-function** (Predictable and testable) |
| `eq` | `packages/expect-utils/src/jasmineUtils.ts` | **47** | 145 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**well-named** (Self-documenting code) |
| `iterableEquality` | `packages/expect-utils/src/utils.ts` | **39** | 151 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |
| `joinAlignedDiffsNoExpand` | `packages/jest-diff/src/joinAlignedDiffs.ts` | **35** | 172 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |

## Dependency Analysis

### Hub Files (High Impact)

*No significant hub files detected*

### Highly Unstable Files

*All files show good stability*

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 118 | 117 | 1 | packages/jest-reporters/src, packages/expect/src |
| 🔴 High | 111 | 100 | 11 | packages/jest-config/src, e2e/__tests__ |
| 🟠 Medium | 94 | 89 | 5 | e2e/__tests__, packages/jest-circus/src |
| 🟡 Low | 73 | 69 | 4 | e2e/__tests__, e2e/circus-concurrent/__tests__ |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 166 | 0.6x threshold | File is hard to understand and maintain |
| Size | 140 | 1.5x threshold | File should be split into smaller modules |
| Duplication | 69 | 4.1x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| High-complexity | 5 | `normalize`, `eventHandler`... | Error-prone and hard to maintain |
| Long-function | 5 | `normalize`, `eventHandler`... | Should be split into smaller functions |
| Deep-nesting | 5 | `normalize`, `eventHandler`... | Hard to read and test |
| Pure-function | 2 | `normalize`, `eventHandler` | Predictable and testable |
| Async-heavy | 1 | `normalize` | Ensure proper error handling |

## 📈 Pattern Analysis

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Pure Function | 2 | Predictable and testable |
| Single Responsibility | 1 | Clean separation of concerns |
| Well Named | 1 | Self-documenting code |

### 🏗️ Architectural Characteristics

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Async Heavy | 1 | Ensure proper error handling |


---
## 🔬 Technical Notes

### Duplication Detection
- **Algorithm:** Enhanced 8-line literal pattern matching with 8+ token minimum, cross-file exact matches only
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
