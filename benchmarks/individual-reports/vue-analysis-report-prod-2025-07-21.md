# InsightCode Analysis Report: vue

## Project Information

- **Name:** vue
- **Type:** frontend framework
- **Repository:** https://github.com/vuejs/core.git
- **Version:** v3.5.17
- **Stars:** 50.7k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-21T16:18:21.186Z
- **Duration:** 67.03s
- **Files Analyzed:** 253
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: ⚠️ **C**

**🚨 Primary Concern:** Extreme complexity (480) in `compiler-sfc/src/script/resolveType.ts`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 59/100 | 🔴 Critical |
| Duplication | 100/100 (0.9% detected) | 🟢 Exceptional |
| Maintainability | 78/100 | 🟡 Acceptable |
| **Overall** | **75/100** | **🟡 Acceptable** |

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
| Total Files | 253 |
| Total Lines of Code | 43,917 |
| Average Complexity | 30.6 |
| Average LOC per File | 174 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 122 | 48% |
| 🟢 Very Good (B: 80-89) | 7 | 3% |
| 🟡 Good (C: 70-79) | 11 | 4% |
| 🟠 Moderate (D: 60-69) | 9 | 4% |
| 🔴 Poor (F: <60) | 104 | 41% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| compiler-sfc/src/script/resolveType.ts | 0% | Extreme complexity (480) |
| runtime-core/src/renderer.ts | 0% | Extreme complexity (454) |
| compiler-sfc/src/compileScript.ts | 0% | Extreme complexity (293) |
| runtime-core/src/componentOptions.ts | 0% | Extreme complexity (133) |
| compiler-core/src/tokenizer.ts | 0% | Extreme complexity (285) |
| runtime-core/src/hydration.ts | 0% | Extreme complexity (235) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `compileScript` | `compiler-sfc/src/compileScript.ts` | **192** | 892 | **long-function** (Should be split into smaller functions)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `inferRuntimeType` | `compiler-sfc/src/script/resolveType.ts` | **123** | 307 | **long-function** (Should be split into smaller functions)<br/>**god-function** (Violates Single Responsibility)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `buildProps` | `compiler-core/src/transforms/transformElement.ts` | **93** | 458 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `hydrateElement` | `runtime-core/src/hydration.ts` | **60** | 185 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `walk` | `compiler-core/src/transforms/cacheStatic.ts` | **60** | 201 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| runtime-core/src/component.ts | 52 | 100th percentile | Core module |
| runtime-core/src/warning.ts | 35 | 100th percentile | Core module |
| runtime-core/src/vnode.ts | 33 | 99th percentile | Core module |
| compiler-core/src/ast.ts | 25 | 99th percentile | Core module |
| compiler-core/src/transform.ts | 23 | 98th percentile | Core module |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| compiler-core/src/compile.ts | 0.95 | 19/1 |
| compiler-core/src/index.ts | 0.96 | 22/1 |
| compiler-dom/src/index.ts | 1.00 | 13/0 |
| compiler-sfc/src/compileScript.ts | 0.81 | 17/4 |
| compiler-sfc/src/index.ts | 1.00 | 10/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 105 | 100 | 5 | runtime-core/src, compiler-core/src/transforms |
| 🔴 High | 63 | 56 | 7 | runtime-core/src, compiler-core/src/transforms |
| 🟠 Medium | 42 | 36 | 6 | runtime-core/src, reactivity/src |
| 🟡 Low | 6 | 5 | 1 | vue, compiler-core/src |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 128 | 0.5x threshold | File is hard to understand and maintain |
| Size | 64 | 1.5x threshold | File should be split into smaller modules |
| Duplication | 5 | 2.4x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| High-complexity | 5 | `compileScript`, `inferRuntimeType`... | Error-prone and hard to maintain |
| Long-function | 5 | `compileScript`, `inferRuntimeType`... | Should be split into smaller functions |
| Deep-nesting | 5 | `compileScript`, `inferRuntimeType`... | Hard to read and test |
| Multiple-responsibilities | 2 | `compileScript`, `hydrateElement` | Clean separation of concerns |
| Impure-function | 1 | `compileScript` | Side effects make testing harder |

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
