# InsightCode Analysis Report: uuid

## Project Information

- **Name:** uuid
- **Type:** utility library
- **Repository:** https://github.com/uuidjs/uuid.git
- **Version:** v11.1.0
- **Stars:** 15k
- **Category:** small

## Analysis Context

- **Timestamp:** 2025-07-21T14:25:33.524Z
- **Duration:** 258.78s
- **Files Analyzed:** 79
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: 🌟 **A**

**🚨 Primary Concern:** Very High complexity (22) in `test/browser/browser.spec.js`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 93/100 | 🟢 Exceptional |
| Duplication | 95/100 (7.3% detected) | 🟢 Exceptional |
| Maintainability | 98/100 | 🟢 Exceptional |
| **Overall** | **95/100** | **🟢 Exceptional** |

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
| Total Files | 79 |
| Total Lines of Code | 2,808 |
| Average Complexity | 2.8 |
| Average LOC per File | 36 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 66 | 84% |
| 🟢 Very Good (B: 80-89) | 3 | 4% |
| 🟡 Good (C: 70-79) | 1 | 1% |
| 🟠 Moderate (D: 60-69) | 0 | 0% |
| 🔴 Poor (F: <60) | 9 | 11% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| test/browser/browser.spec.js | 50% | Very High complexity (22) |
| src/v1.ts | 50% | Very High complexity (21) |
| src/md5-browser.ts | 70% | Multiple quality issues |
| examples/browser-esmodules/example.js | 0% | Extreme duplication (78%) |
| examples/browser-rollup/example-all.js | 0% | Extreme duplication (100%) |
| examples/browser-webpack/example-all-require.js | 0% | Extreme duplication (100%) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `v4` | `src/v4.ts` | **13** | 36 | **high-complexity** (Error-prone and hard to maintain)<br/>**deep-nesting** (Hard to read and test)<br/>**single-responsibility** (Clean separation of concerns)<br/>**well-named** (Self-documenting code) |
| `v35` | `src/v35.ts` | **9** | 42 | **deep-nesting** (Hard to read and test)<br/>**single-responsibility** (Clean separation of concerns) |
| `v1Bytes` | `src/v1.ts` | **8** | 61 | **long-function** (Should be split into smaller functions)<br/>**too-many-params** (Consider using object parameters)<br/>**deep-nesting** (Hard to read and test)<br/>**single-responsibility** (Clean separation of concerns)<br/>**pure-function** (Predictable and testable) |
| `sha1` | `src/sha1-browser.ts` | **7** | 89 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |
| `v1` | `src/v1.ts` | **7** | 53 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**pure-function** (Predictable and testable)<br/>**well-named** (Self-documenting code) |

## Dependency Analysis

### Hub Files (High Impact)

*No significant hub files detected*

### Highly Unstable Files

*All files show good stability*

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 2 | 2 | 0 | src, test/browser |
| 🔴 High | 1 | 1 | 0 | src |
| 🟠 Medium | 19 | 6 | 13 | src, src/test |
| 🟡 Low | 11 | 7 | 4 | src, examples/browser-webpack |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 7 | 0.7x threshold | File is hard to understand and maintain |
| Duplication | 7 | 5.5x threshold | Refactor to reduce code duplication |
| Size | 2 | 1.1x threshold | File should be split into smaller modules |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| Deep-nesting | 5 | `v4`, `v35`... | Hard to read and test |
| Single-responsibility | 3 | `v4`, `v35`... | Clean separation of concerns |
| Long-function | 3 | `v1Bytes`, `sha1`... | Should be split into smaller functions |
| Well-named | 2 | `v4`, `v1` | Self-documenting code |
| Pure-function | 2 | `v1Bytes`, `v1` | Predictable and testable |

## 📈 Pattern Analysis

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Single Responsibility | 3 | Clean separation of concerns |
| Well Named | 2 | Self-documenting code |
| Pure Function | 2 | Predictable and testable |


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
