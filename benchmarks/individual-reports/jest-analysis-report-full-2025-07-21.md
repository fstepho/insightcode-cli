# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-21T22:20:39.410Z
- **Duration:** 234.90s
- **Files Analyzed:** 1785
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: 🌟 **A**

**🚨 Primary Concern:** Extreme complexity (330) in `packages/jest-runtime/src/index.ts`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 90/100 | 🟢 Exceptional |
| Duplication | 96/100 (2.5% detected) | 🟢 Exceptional |
| Maintainability | 92/100 | 🟢 Exceptional |
| **Overall** | **92/100** | **🟢 Exceptional** |

### 📊 Scoring Methodology

InsightCode combines **research-based thresholds** with **criticality-weighted aggregation**, following the **Pareto principle**.

#### 🔧 Overall Score Calculation
InsightCode uses a **two-step weighted aggregation** process:

**Step 1:** Each metric is weighted by architectural criticality:
```
Weighted_Complexity = Σ(File_Complexity × CriticismScore) / Σ(CriticismScore)
Weighted_Maintainability = Σ(File_Maintainability × CriticismScore) / Σ(CriticismScore)
Weighted_Duplication = Σ(File_Duplication × CriticismScore) / Σ(CriticismScore)
```

**Step 2:** Final score combines weighted metrics:
```
Overall Score = (Weighted_Complexity × 45%) + (Weighted_Maintainability × 30%) + (Weighted_Duplication × 25%)
```

#### 🧮 Metric Configuration
| Metric | Final Weight | Thresholds & Research Basis |
|--------|--------------|-----------------------------|
| **Complexity** | 45% | McCabe (1976): ≤10 = low, ≤15 = medium, ≤20 = high, ≤50 = very high, >50 = extreme |
| **Maintainability** | 30% | Clean Code principles: ≤200 LOC/file preferred, progressive penalties |
| **Duplication** | 25% | Legacy threshold: ≤15% considered excellent for brownfield projects |

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
| `normalize` | `packages/jest-config/src/normalize.ts` | **63** | 698 | **critical-complexity** (Severely impacts maintainability)<br/>**long-function** (Should be split into smaller functions)<br/>**god-function** (Violates Single Responsibility)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**async-heavy** (Ensure proper error handling)<br/>**impure-function** (Side effects make testing harder) |
| `eventHandler` | `packages/jest-circus/src/eventHandler.ts` | **49** | 284 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder) |
| `eq` | `packages/expect-utils/src/jasmineUtils.ts` | **47** | 145 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**poorly-named** (Names should be descriptive and meaningful) |
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
| Long-function | 5 | `normalize`, `eventHandler`... | Should be split into smaller functions |
| Deep-nesting | 5 | `normalize`, `eventHandler`... | Hard to read and test |
| High-complexity | 4 | `eventHandler`, `eq`... | Error-prone and hard to maintain |
| Impure-function | 2 | `normalize`, `eventHandler` | Side effects make testing harder |
| Critical-complexity | 1 | `normalize` | Severely impacts maintainability |

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
