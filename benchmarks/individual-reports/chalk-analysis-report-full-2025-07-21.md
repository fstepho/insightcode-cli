# InsightCode Analysis Report: chalk

## Project Information

- **Name:** chalk
- **Type:** utility library
- **Repository:** https://github.com/chalk/chalk.git
- **Version:** v5.4.1
- **Stars:** 22.3k
- **Category:** small

## Analysis Context

- **Timestamp:** 2025-07-21T14:25:33.526Z
- **Duration:** 258.79s
- **Files Analyzed:** 19
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: ✅ **B**

**🚨 Primary Concern:** Extreme complexity (51) in `source/vendor/supports-color/index.js` (core file).

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 1 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 64/100 | 🟠 Poor |
| Duplication | 100/100 (0.0% detected) | 🟢 Exceptional |
| Maintainability | 100/100 | 🟢 Exceptional |
| **Overall** | **84/100** | **🟢 Good** |

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
| Total Files | 19 |
| Total Lines of Code | 1,170 |
| Average Complexity | 6.0 |
| Average LOC per File | 62 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 17 | 89% |
| 🟢 Very Good (B: 80-89) | 0 | 0% |
| 🟡 Good (C: 70-79) | 0 | 0% |
| 🟠 Moderate (D: 60-69) | 0 | 0% |
| 🔴 Poor (F: <60) | 2 | 11% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| ⭐ source/vendor/supports-color/index.js | 10% | Extreme complexity (51) |
| ⭐ source/index.js | 46% | Very High complexity (30) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `_supportsColor` | `source/vendor/supports-color/index.js` | **36** | 107 | **high-complexity** (Error-prone and hard to maintain)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**well-named** (Self-documenting code) |
| `applyOptions` | `source/index.js` | **8** | 9 | **single-responsibility** (Clean separation of concerns) |
| `applyStyle` | `source/index.js` | **8** | 33 | **deep-nesting** (Hard to read and test) |
| `hasFlag` | `source/vendor/supports-color/index.js` | **6** | 6 | _None_ |
| `rainbow` | `examples/rainbow.js` | **5** | 20 | **deep-nesting** (Hard to read and test) |

## Dependency Analysis

### Hub Files (High Impact)

*No significant hub files detected*

### Highly Unstable Files

*All files show good stability*

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 2 | 2 | 0 | source, source/vendor/supports-color |
| 🔴 High | 2 | 0 | 2 | source/vendor/supports-color |
| 🟠 Medium | 4 | 0 | 4 | source, source/vendor/supports-color |
| 🟡 Low | 1 | 0 | 1 | source/vendor/supports-color |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 2 | 0.3x threshold | File is hard to understand and maintain |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| Deep-nesting | 3 | `_supportsColor`, `applyStyle`... | Hard to read and test |
| High-complexity | 1 | `_supportsColor` | Error-prone and hard to maintain |
| Long-function | 1 | `_supportsColor` | Should be split into smaller functions |
| Well-named | 1 | `_supportsColor` | Self-documenting code |
| Single-responsibility | 1 | `applyOptions` | Clean separation of concerns |

## 📈 Pattern Analysis

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Well Named | 1 | Self-documenting code |
| Single Responsibility | 1 | Clean separation of concerns |


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
