# InsightCode Analysis Report: vue

## Project Information

- **Name:** vue
- **Type:** frontend framework
- **Repository:** https://github.com/vuejs/core.git
- **Version:** v3.5.17
- **Stars:** 50.7k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-21T14:25:33.528Z
- **Duration:** 258.77s
- **Files Analyzed:** 514
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: 🔴 **D**

**🚨 Primary Concern:** Extreme complexity (454) in `packages/runtime-core/src/renderer.ts` (core file).

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 38/100 | 🔴 Critical |
| Duplication | 100/100 (1.0% detected) | 🟢 Exceptional |
| Maintainability | 59/100 | 🔴 Critical |
| **Overall** | **60/100** | **🟠 Poor** |

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
| Total Files | 514 |
| Total Lines of Code | 122,051 |
| Average Complexity | 17.1 |
| Average LOC per File | 237 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 289 | 56% |
| 🟢 Very Good (B: 80-89) | 15 | 3% |
| 🟡 Good (C: 70-79) | 39 | 8% |
| 🟠 Moderate (D: 60-69) | 34 | 7% |
| 🔴 Poor (F: <60) | 137 | 27% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| ⭐ packages/runtime-core/src/renderer.ts | 0% | Extreme complexity (454) |
| packages/compiler-sfc/src/script/resolveType.ts | 0% | Extreme complexity (480) |
| packages/compiler-sfc/src/compileScript.ts | 0% | Extreme complexity (293) |
| packages/runtime-core/src/componentOptions.ts | 0% | Extreme complexity (133) |
| packages/vue/__tests__/e2e/Transition.spec.ts | 0% | Extreme complexity (65) |
| packages/runtime-core/__tests__/components/BaseTransition.spec.ts | 3% | Very High complexity (30) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `compileScript` | `packages/compiler-sfc/src/compileScript.ts` | **192** | 892 | **long-function** (Should be split into smaller functions)<br/>**single-responsibility** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**pure-function** (Predictable and testable)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `inferRuntimeType` | `packages/compiler-sfc/src/script/resolveType.ts` | **123** | 307 | **long-function** (Should be split into smaller functions)<br/>**god-function** (Violates Single Responsibility)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `buildProps` | `packages/compiler-core/src/transforms/transformElement.ts` | **93** | 458 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `hydrateElement` | `packages/runtime-core/src/hydration.ts` | **60** | 185 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**single-responsibility** (Clean separation of concerns)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `walk` | `packages/compiler-core/src/transforms/cacheStatic.ts` | **60** | 201 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |

## Dependency Analysis

### Hub Files (High Impact)

*No significant hub files detected*

### Highly Unstable Files

*All files show good stability*

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 129 | 124 | 5 | packages/runtime-core/src, packages/compiler-core/src/transforms |
| 🔴 High | 129 | 122 | 7 | packages/runtime-core/__tests__, packages/runtime-core/src |
| 🟠 Medium | 79 | 73 | 6 | packages/runtime-core/src, packages/reactivity/src |
| 🟡 Low | 13 | 12 | 1 | packages/reactivity/__tests__, packages/vue |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Size | 170 | 1.6x threshold | File should be split into smaller modules |
| Complexity | 149 | 0.5x threshold | File is hard to understand and maintain |
| Duplication | 12 | 2.3x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| High-complexity | 5 | `compileScript`, `inferRuntimeType`... | Error-prone and hard to maintain |
| Long-function | 5 | `compileScript`, `inferRuntimeType`... | Should be split into smaller functions |
| Deep-nesting | 5 | `compileScript`, `inferRuntimeType`... | Hard to read and test |
| Single-responsibility | 2 | `compileScript`, `hydrateElement` | Clean separation of concerns |
| Pure-function | 1 | `compileScript` | Predictable and testable |

## 📈 Pattern Analysis

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Single Responsibility | 2 | Clean separation of concerns |
| Pure Function | 1 | Predictable and testable |


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
