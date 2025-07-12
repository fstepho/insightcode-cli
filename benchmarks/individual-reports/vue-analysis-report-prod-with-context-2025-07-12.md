# InsightCode Analysis Report: vue

## Project Information

- **Name:** vue
- **Type:** frontend framework
- **Repository:** https://github.com/vuejs/core.git
- **Version:** v3.5.17
- **Stars:** 50.7k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-12T21:46:34.593Z
- **Duration:** 28.14s
- **Files Analyzed:** 253
- **Tool Version:** 0.6.1

## Quality Overview

### Grade: 🔴 **D**

**112 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 41/100 | 🔴 Critical |
| Duplication | 100/100 (2.8% detected) | 🟢 Excellent |
| Maintainability | 64/100 | 🟠 Needs Improvement |
| **Overall** | **63/100** | **🟠 Needs Improvement** |

### 📊 Scoring Methodology

InsightCode uses **internal hypothesis-based scoring** requiring empirical validation:

#### Overall Score Formula
`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)`

| Dimension | Weight | Foundation & Thresholds |
|-----------|--------|--------------------------|
| **Complexity** | **45%** | **McCabe (1976) thresholds:** ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Weight = internal hypothesis. |
| **Maintainability** | **30%** | **File size impact hypothesis:** ≤200 LOC ideal. Weight = internal hypothesis (requires validation). |
| **Duplication** | **25%** | **⚠️ LEGACY thresholds (5x more permissive than industry):** ≤15% "excellent" vs SonarQube ≤3%. Weight = internal hypothesis. |

#### ⚠️ Important Disclaimers
**Project weights (45/30/25) are internal hypotheses requiring empirical validation, NOT industry standards.** These weights apply only to project-level aggregation. File Health Scores use unweighted penalty summation.

**Duplication thresholds are 5x more permissive than industry standards** (≤15% = "excellent" vs SonarQube ≤3%). Scores may appear inflated compared to standard tools.

#### Grade Scale (Academic Standard)
**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)

#### Aggregation Method
- **Project-level:** Architectural criticality weighting WITHOUT outlier masking
- **File-level:** Penalty-based (100 - penalties) with NO CAPS - extreme values get extreme penalties
- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems

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
| 🟢 Excellent (90-100) | 114 | 45% |
| 🟡 Good (70-89) | 19 | 8% |
| 🟠 Moderate (50-69) | 8 | 3% |
| 🔴 Poor (<50) | 112 | 44% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| compiler-sfc/src/script/resolveType.ts | 0% | 11 (2 crit, 9 high) | Extreme complexity (480) |
| compiler-sfc/src/compileScript.ts | 0% | 5 (2 crit, 3 high) | Extreme complexity (293) |
| runtime-core/src/componentOptions.ts | 0% | 4 (2 crit, 2 high) | Extreme complexity (133) |
| runtime-core/src/renderer.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (454) |
| runtime-core/src/componentProps.ts | 0% | 6 (1 crit, 5 high) | Extreme complexity (172) |
| compiler-core/src/parser.ts | 0% | 5 (1 crit, 4 high) | Extreme complexity (165) |
| runtime-core/src/vnode.ts | 0% | 5 (1 crit, 4 high) | Extreme complexity (149) |
| compiler-core/src/codegen.ts | 0% | 4 (1 crit, 3 high) | Extreme complexity (218) |
| compiler-core/src/transforms/transformElement.ts | 0% | 4 (1 crit, 3 high) | Extreme complexity (188) |
| compiler-core/src/utils.ts | 0% | 4 (1 crit, 3 high) | Extreme complexity (135) |

*⭐ indicates emblematic/core files*

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
| compiler-ssr/src/index.ts | 1.00 | 10/0 |
| reactivity/src/baseHandlers.ts | 0.86 | 6/1 |

## Issue Analysis

### Issue Summary

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 105 | runtime-core/src, compiler-core/src/transforms |
| 🟠 High | 139 | runtime-core/src, compiler-core/src |
| 🟡 Medium | 98 | runtime-core/src, reactivity/src |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 267 | 2.6x threshold |
| Size | 64 | 1.5x threshold |
| Duplication | 11 | 1.5x threshold |

## Actionable Recommendations

### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `reactivity/src/watch.ts` (Size: 150% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `runtime-core/src/apiSetupHelpers.ts` (Size: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `compiler-sfc/src/compileTemplate.ts` (Size: 147% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `compiler-sfc/src/rewriteDefault.ts` (Complexity: 140% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.

- **File:** `server-renderer/src/render.ts` (Complexity: 140% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.


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
