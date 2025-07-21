# InsightCode Analysis Report: uuid

## Project Information

- **Name:** uuid
- **Type:** utility library
- **Repository:** https://github.com/uuidjs/uuid.git
- **Version:** v11.1.0
- **Stars:** 15k
- **Category:** small

## Analysis Context

- **Timestamp:** 2025-07-21T22:11:02.598Z
- **Duration:** 66.00s
- **Files Analyzed:** 29
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: 🌟 **A**

**🚨 Primary Concern:** Very High complexity (21) in `src/v1.ts`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 3 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 97/100 | 🟢 Exceptional |
| Duplication | 92/100 (3.4% detected) | 🟢 Exceptional |
| Maintainability | 100/100 | 🟢 Exceptional |
| **Overall** | **97/100** | **🟢 Exceptional** |

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
| Total Files | 29 |
| Total Lines of Code | 978 |
| Average Complexity | 4.6 |
| Average LOC per File | 34 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 22 | 76% |
| 🟢 Very Good (B: 80-89) | 3 | 10% |
| 🟡 Good (C: 70-79) | 1 | 3% |
| 🟠 Moderate (D: 60-69) | 0 | 0% |
| 🔴 Poor (F: <60) | 3 | 10% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| src/v1.ts | 50% | Very High complexity (21) |
| src/md5-browser.ts | 70% | Multiple quality issues |
| src/v3.ts | 23% | Extreme duplication (50%) |
| src/v5.ts | 23% | Extreme duplication (50%) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `v4` | `src/v4.ts` | **13** | 36 | **medium-complexity** (Consider refactoring for clarity)<br/>**deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**poorly-named** (Names should be descriptive and meaningful) |
| `v35` | `src/v35.ts` | **9** | 42 | **deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns) |
| `v1Bytes` | `src/v1.ts` | **8** | 61 | **long-function** (Should be split into smaller functions)<br/>**too-many-params** (Consider using object parameters)<br/>**deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**impure-function** (Side effects make testing harder) |
| `sha1` | `src/sha1-browser.ts` | **7** | 89 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |
| `v1` | `src/v1.ts` | **7** | 53 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder)<br/>**poorly-named** (Names should be descriptive and meaningful) |

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| src/types.ts | 10 | 100th percentile | Type definitions |
| src/stringify.ts | 8 | 96th percentile | Core module |
| src/parse.ts | 4 | 89th percentile | Core module |
| src/validate.ts | 4 | 89th percentile | Core module |
| src/rng.ts | 3 | 82th percentile | Core module |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| src/index.ts | 1.00 | 15/0 |
| src/uuid-bin.ts | 1.00 | 6/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 1 | 1 | 0 | src |
| 🔴 High | 1 | 1 | 0 | src |
| 🟠 Medium | 17 | 4 | 13 | src |
| 🟡 Low | 6 | 2 | 4 | src |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 6 | 0.7x threshold | File is hard to understand and maintain |
| Duplication | 2 | 3.3x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| Deep-nesting | 5 | `v4`, `v35`... | Hard to read and test |
| Multiple-responsibilities | 3 | `v4`, `v35`... | Clean separation of concerns |
| Long-function | 3 | `v1Bytes`, `sha1`... | Should be split into smaller functions |
| Poorly-named | 2 | `v4`, `v1` | Names should be descriptive and meaningful |
| Impure-function | 2 | `v1Bytes`, `v1` | Side effects make testing harder |

## 📈 Pattern Analysis


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
