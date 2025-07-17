# InsightCode Analysis Report: vue

## Project Information

- **Name:** vue
- **Type:** frontend framework
- **Repository:** https://github.com/vuejs/core.git
- **Version:** v3.5.17
- **Stars:** 50.7k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-14T19:23:02.877Z
- **Duration:** 74.18s
- **Files Analyzed:** 253
- **Tool Version:** 0.6.0

## Executive Summary

**Grade D (63/100)** - Moderate health.

**🚨 Primary Concern:** Extreme complexity (480) in `compiler-sfc/src/script/resolveType.ts`.

**🎯 Priority Action:** Break down into smaller, single-responsibility functions

**📊 Additional Context:** 9 other files require attention.

## Quality Overview

### Grade: 🔴 **D**

**133 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 41/100 | 🔴 Critical |
| Duplication | 100/100 (2.8% detected) | 🟢 Excellent |
| Maintainability | 65/100 | 🟠 Needs Improvement |
| **Overall** | **63/100** | **🟠 Needs Improvement** |

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
| Total Files | 253 |
| Total Lines of Code | 43,917 |
| Average Complexity | 30.6 |
| Average LOC per File | 174 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 115 | 45% |
| 🟢 Very Good (B: 80-89) | 5 | 2% |
| 🟡 Good (C: 70-79) | 13 | 5% |
| 🟠 Moderate (D: 60-69) | 7 | 3% |
| 🔴 Poor (F: <60) | 113 | 45% |

## Critical Files Requiring Attention

| File | Health | Primary Concern & Recommendation |
|------|--------|-----------------------------------|
| compiler-sfc/src/script/resolveType.ts | 0% | Extreme complexity (480) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| runtime-core/src/renderer.ts | 0% | Extreme complexity (454) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-sfc/src/compileScript.ts | 0% | Extreme complexity (293) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| runtime-core/src/componentOptions.ts | 0% | Extreme complexity (133) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-core/src/tokenizer.ts | 0% | Extreme complexity (285) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| runtime-core/src/hydration.ts | 0% | Extreme complexity (235) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-core/src/codegen.ts | 0% | Extreme complexity (218) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-core/src/transforms/transformElement.ts | 0% | Extreme complexity (188) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| runtime-core/src/componentProps.ts | 0% | Extreme complexity (172) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-core/src/parser.ts | 0% | Extreme complexity (165) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `compileScript` | `compiler-sfc/src/compileScript.ts` | **192** | 892 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility, pure-function |
| `inferRuntimeType` | `compiler-sfc/src/script/resolveType.ts` | **123** | 307 | complexity, size, high-complexity, long-function, deep-nesting, god-function |
| `buildProps` | `compiler-core/src/transforms/transformElement.ts` | **93** | 458 | complexity, size, high-complexity, long-function, deep-nesting |
| `hydrateElement` | `runtime-core/src/hydration.ts` | **60** | 185 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility |
| `walk` | `compiler-core/src/transforms/cacheStatic.ts` | **60** | 201 | complexity, size, high-complexity, long-function, deep-nesting |

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
| 🔴 Critical | 164 | 105 | 59 | runtime-core/src, compiler-core/src/transforms |
| 🟠 High | 333 | 61 | 272 | runtime-core/src, compiler-core/src/transforms |
| 🟡 Medium | 1023 | 37 | 986 | runtime-core/src, compiler-core/src |
| 🟢 Low | 201 | 0 | 201 | compiler-core/src, reactivity/src |

### Function-Level Issue Details

| Issue Pattern | Functions Affected | Examples |
|---------------|-------------------|----------|
| Deep nesting | 571 | compileScript (compiler-sfc/src/compileScript.ts), inferRuntimeType (compiler-sfc/src/script/resolveType.ts) +569 more |
| Complexity | 188 | compileScript (compiler-sfc/src/compileScript.ts), inferRuntimeType (compiler-sfc/src/script/resolveType.ts) +186 more |
| Size | 173 | compileScript (compiler-sfc/src/compileScript.ts), inferRuntimeType (compiler-sfc/src/script/resolveType.ts) +171 more |
| Long function | 173 | compileScript (compiler-sfc/src/compileScript.ts), inferRuntimeType (compiler-sfc/src/script/resolveType.ts) +171 more |
| Pure function | 152 | compileScript (compiler-sfc/src/compileScript.ts), parse (compiler-core/src/tokenizer.ts) +150 more |

### File-Level Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 128 | 3.0x threshold |
| Size | 64 | 1.5x threshold |
| Duplication | 11 | 1.5x threshold |

## 📈 Analyse des Patterns

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 571 | Hard to read and test |
| Long Function | 173 | Should be split into smaller functions |
| High Complexity | 103 | Error-prone and hard to maintain |
| Too Many Params | 23 | Consider using object parameters |
| God Function | 3 | Violates Single Responsibility |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Pure Function | 152 | Predictable and testable |
| Single Responsibility | 83 | Clean separation of concerns |
| Well Named | 45 | Self-documenting code |

### 🏗️ Architectural Characteristics

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Async Heavy | 4 | Ensure proper error handling |


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
