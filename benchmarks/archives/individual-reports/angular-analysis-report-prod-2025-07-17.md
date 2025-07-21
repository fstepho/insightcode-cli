# InsightCode Analysis Report: angular

## Project Information

- **Name:** angular
- **Type:** UI framework
- **Repository:** https://github.com/angular/angular.git
- **Version:** 19.2.14
- **Stars:** 98k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-17T18:54:59.220Z
- **Duration:** 70.36s
- **Files Analyzed:** 1744
- **Tool Version:** 0.7.0

## Executive Summary

**Grade C (70/100)** - Acceptable.

**🚨 Primary Concern:** Extreme complexity (548) in `common/locales/closure-locale.ts`.

**🎯 Priority Action:** Break down into smaller, single-responsibility functions

**📊 Additional Context:** 9 other files require attention.

## Quality Overview

### Grade: ⚠️ **C**

**650 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 55/100 | 🔴 Critical |
| Duplication | 97/100 (2.8% detected) | 🟢 Exceptional |
| Maintainability | 70/100 | 🟡 Acceptable |
| **Overall** | **70/100** | **🟡 Acceptable** |

### 📊 Scoring Methodology

InsightCode combines **research-based thresholds** with **hypothesis-driven weighting**:

#### Overall Score Formula
`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)`

| Dimension | Weight | Foundation & Thresholds |
|-----------|--------|--------------------------|
| **Complexity** | **45%** | **McCabe (1976) thresholds:** ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Weight = internal hypothesis. |
| **Maintainability** | **30%** | **File size impact:** ≤200 LOC ideal (Clean Code principles). Weight = internal hypothesis. |
| **Duplication** | **25%** | **Industry-standard thresholds:** ≤3% "excellent" aligned with SonarQube. Weight = internal hypothesis. |

#### 📊 Score Interpretation
**Important:** Project scores use architectural criticality weighting, not simple averages. Here's why extreme complexity can still yield moderate project scores:

**Example - Lodash Case:**
- **lodash.js:** Complexity 1818 → Individual score 0, but CriticismScore ~1823
- **19 other files:** Complexity ~5 → Individual scores ~100, CriticismScore ~12 each
- **Weighted result:** (0×89%) + (100×11%) = ~7 final score

**Key Distinctions:**
- **Raw Metrics:** Average complexity, total LOC (arithmetic means)
- **Weighted Scores:** Architectural importance influences final project scores
- **Individual Files:** Use penalty-based health scores (0-100)

#### ⚠️ Methodology Notes
- **Thresholds:** Research-based (McCabe 1976, Clean Code, SonarQube standards)
- **Weights:** Internal hypotheses (45/30/25) requiring empirical validation
- **Aggregation:** Criticality-weighted to identify architecturally important files

#### Grade Scale (Academic Standard)
**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)

#### Aggregation Method
- **Project-level:** Architectural criticality weighting identifies most impactful files
- **File-level:** Penalty-based (100 - penalties) with progressive penalties for extreme values
- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems

#### 🔍 Architectural Criticality Formula
Each file receives a "criticism score" that determines its weight in final project scores:

```
CriticismScore = (Dependencies × 2.0) + (Complexity × 1.0) + (WeightedIssues × 0.5) + 1
```

**Components:**
- **Dependencies:** incomingDeps + outgoingDeps + (isInCycle ? 5 : 0)
- **Complexity:** File cyclomatic complexity
- **WeightedIssues:** (critical×4) + (high×3) + (medium×2) + (low×1)
- **Base:** +1 to avoid zero weights

**Final Project Score:** Each dimension is weighted by file criticality, then combined using 45/30/25 weights.

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 1744 |
| Total Lines of Code | 194,063 |
| Average Complexity | 19.3 |
| Average LOC per File | 111 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 1020 | 58% |
| 🟢 Very Good (B: 80-89) | 74 | 4% |
| 🟡 Good (C: 70-79) | 54 | 3% |
| 🟠 Moderate (D: 60-69) | 62 | 4% |
| 🔴 Poor (F: <60) | 534 | 31% |

## Critical Files Requiring Attention

| File | Health | Primary Concern & Recommendation |
|------|--------|-----------------------------------|
| common/locales/closure-locale.ts | 0% | Extreme complexity (548) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts | 0% | Extreme complexity (451) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler/src/output/output_ast.ts | 0% | Extreme complexity (391) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler/src/ml_parser/lexer.ts | 0% | Extreme complexity (322) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler/src/template/pipeline/ir/src/expression.ts | 0% | Extreme complexity (311) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-cli/src/ngtsc/annotations/component/src/handler.ts | 0% | Extreme complexity (306) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler-cli/src/ngtsc/annotations/directive/src/shared.ts | 0% | Extreme complexity (264) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler/src/template/pipeline/src/ingest.ts | 0% | Extreme complexity (255) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| compiler/src/expression_parser/parser.ts | 0% | Extreme complexity (248) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| animations/browser/src/render/transition_animation_engine.ts | 0% | Extreme complexity (240) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `reifyCreateOperations` | `compiler/src/template/pipeline/src/phases/reify.ts` | **86** | 359 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility |
| `resolve` | `compiler-cli/src/ngtsc/annotations/component/src/handler.ts` | **84** | 501 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility, pure-function |
| `getDateFormatter` | `common/src/i18n/format_date.ts` | **82** | 309 | complexity, size, high-complexity, long-function, single-responsibility |
| `transformExpressionsInOp` | `compiler/src/template/pipeline/ir/src/expression.ts` | **72** | 152 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility |
| `analyze` | `compiler-cli/src/ngtsc/annotations/component/src/handler.ts` | **59** | 487 | complexity, size, high-complexity, long-function, deep-nesting, god-function, single-responsibility, pure-function |

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| core/src/render3/interfaces/view.ts | 112 | 100th percentile | Core module |
| compiler-cli/src/ngtsc/reflection/index.ts | 100 | 100th percentile | Entry point |
| core/src/render3/interfaces/node.ts | 84 | 100th percentile | Core module |
| compiler/src/output/output_ast.ts | 80 | 100th percentile | Core module |
| core/src/util/assert.ts | 79 | 100th percentile | Core module |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| animations/index.ts | 1.00 | 1/0 |
| benchpress/index.ts | 1.00 | 22/0 |
| compiler/index.ts | 1.00 | 1/0 |
| elements/index.ts | 1.00 | 1/0 |
| core/index.ts | 1.00 | 1/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 493 | 485 | 8 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🔴 High | 905 | 263 | 642 | core/src/render3/instructions, compiler/src/template/pipeline/src/phases |
| 🟠 Medium | 4507 | 272 | 4235 | compiler/src/template/pipeline/src/phases, compiler-cli/src/ngtsc/typecheck/src |
| 🟡 Low | 6196 | 0 | 6196 | compiler-cli/src/ngtsc/typecheck/src, compiler/src/output |

### Function-Level Issue Details

| Issue Pattern | Functions Affected | Examples |
|---------------|-------------------|----------|
| Pure function | 4416 | resolve (compiler-cli/src/ngtsc/annotations/component/src/handler.ts), analyze (compiler-cli/src/ngtsc/annotations/component/src/handler.ts) +4414 more |
| Deep nesting | 2343 | reifyCreateOperations (compiler/src/template/pipeline/src/phases/reify.ts), resolve (compiler-cli/src/ngtsc/annotations/component/src/handler.ts) +2341 more |
| Well named | 1604 | <anonymous> (zone.js/lib/zone-impl.ts), _isPixelDimensionStyle (compiler/src/schema/dom_element_schema_registry.ts) +1602 more |
| Size | 642 | reifyCreateOperations (compiler/src/template/pipeline/src/phases/reify.ts), resolve (compiler-cli/src/ngtsc/annotations/component/src/handler.ts) +640 more |
| Long function | 642 | reifyCreateOperations (compiler/src/template/pipeline/src/phases/reify.ts), resolve (compiler-cli/src/ngtsc/annotations/component/src/handler.ts) +640 more |

### File-Level Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 681 | 2.4x threshold |
| Size | 261 | 1.5x threshold |
| Duplication | 78 | 1.6x threshold |

## 📈 Pattern Analysis

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 2343 | Hard to read and test |
| Long Function | 642 | Should be split into smaller functions |
| Too Many Params | 218 | Consider using object parameters |
| High Complexity | 83 | Error-prone and hard to maintain |
| God Function | 4 | Violates Single Responsibility |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Pure Function | 4416 | Predictable and testable |
| Well Named | 1604 | Self-documenting code |
| Single Responsibility | 506 | Clean separation of concerns |

### 🏗️ Architectural Characteristics

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Async Heavy | 176 | Ensure proper error handling |


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
