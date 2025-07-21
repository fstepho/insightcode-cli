# InsightCode Analysis Report: angular

## Project Information

- **Name:** angular
- **Type:** UI framework
- **Repository:** https://github.com/angular/angular.git
- **Version:** 19.2.14
- **Stars:** 98k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-21T16:18:24.474Z
- **Duration:** 70.31s
- **Files Analyzed:** 1744
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: ✅ **B**

**🚨 Primary Concern:** Extreme complexity (548) in `common/locales/closure-locale.ts`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 73/100 | 🟡 Acceptable |
| Duplication | 97/100 (2.8% detected) | 🟢 Exceptional |
| Maintainability | 85/100 | 🟢 Good |
| **Overall** | **83/100** | **🟢 Good** |

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
| Total Files | 1744 |
| Total Lines of Code | 194,063 |
| Average Complexity | 19.3 |
| Average LOC per File | 111 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 1040 | 60% |
| 🟢 Very Good (B: 80-89) | 84 | 5% |
| 🟡 Good (C: 70-79) | 50 | 3% |
| 🟠 Moderate (D: 60-69) | 64 | 4% |
| 🔴 Poor (F: <60) | 506 | 29% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| common/locales/closure-locale.ts | 0% | Extreme complexity (548) |
| compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts | 0% | Extreme complexity (451) |
| compiler/src/output/output_ast.ts | 0% | Extreme complexity (391) |
| compiler/src/ml_parser/lexer.ts | 0% | Extreme complexity (322) |
| compiler/src/template/pipeline/ir/src/expression.ts | 0% | Extreme complexity (311) |
| compiler-cli/src/ngtsc/annotations/component/src/handler.ts | 0% | Extreme complexity (306) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `reifyCreateOperations` | `compiler/src/template/pipeline/src/phases/reify.ts` | **86** | 359 | **long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `resolve` | `compiler-cli/src/ngtsc/annotations/component/src/handler.ts` | **84** | 501 | **long-function** (Should be split into smaller functions)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `getDateFormatter` | `common/src/i18n/format_date.ts` | **82** | 309 | **long-function** (Should be split into smaller functions)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `transformExpressionsInOp` | `compiler/src/template/pipeline/ir/src/expression.ts` | **72** | 152 | **long-function** (Should be split into smaller functions)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**high-complexity** (Error-prone and hard to maintain) |
| `analyze` | `compiler-cli/src/ngtsc/annotations/component/src/handler.ts` | **59** | 487 | **long-function** (Should be split into smaller functions)<br/>**god-function** (Violates Single Responsibility)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder)<br/>**high-complexity** (Error-prone and hard to maintain) |

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
| core/index.ts | 1.00 | 1/0 |
| compiler-cli/index.ts | 0.86 | 12/2 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 455 | 450 | 5 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🔴 High | 255 | 246 | 9 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🟠 Medium | 252 | 246 | 6 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🟡 Low | 80 | 78 | 2 | core/schematics/migrations/signal-migration/src/passes, core/src/render3/instructions |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 681 | 0.6x threshold | File is hard to understand and maintain |
| Size | 261 | 1.5x threshold | File should be split into smaller modules |
| Duplication | 78 | 3.8x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| High-complexity | 5 | `reifyCreateOperations`, `resolve`... | Error-prone and hard to maintain |
| Long-function | 5 | `reifyCreateOperations`, `resolve`... | Should be split into smaller functions |
| Multiple-responsibilities | 5 | `reifyCreateOperations`, `resolve`... | Clean separation of concerns |
| Deep-nesting | 4 | `reifyCreateOperations`, `resolve`... | Hard to read and test |
| Impure-function | 2 | `resolve`, `analyze` | Side effects make testing harder |

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
