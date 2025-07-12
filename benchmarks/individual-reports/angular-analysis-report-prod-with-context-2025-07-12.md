# InsightCode Analysis Report: angular

## Project Information

- **Name:** angular
- **Type:** UI framework
- **Repository:** https://github.com/angular/angular.git
- **Version:** 19.2.14
- **Stars:** 98k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-12T21:46:36.258Z
- **Duration:** 29.80s
- **Files Analyzed:** 1744
- **Tool Version:** 0.6.1

## Quality Overview

### Grade: ⚠️ **C**

**532 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 55/100 | 🔴 Critical |
| Duplication | 99/100 (3.7% detected) | 🟢 Excellent |
| Maintainability | 70/100 | 🟡 Good |
| **Overall** | **71/100** | **🟡 Good** |

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
| Total Files | 1744 |
| Total Lines of Code | 194,063 |
| Average Complexity | 19.3 |
| Average LOC per File | 111 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 1013 | 58% |
| 🟡 Good (70-89) | 142 | 8% |
| 🟠 Moderate (50-69) | 57 | 3% |
| 🔴 Poor (<50) | 532 | 31% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| common/locales/closure-locale.ts | 0% | 10 (2 crit, 8 high) | Extreme complexity (548) |
| compiler-cli/src/ngtsc/annotations/directive/src/shared.ts | 0% | 8 (2 crit, 6 high) | Extreme complexity (264) |
| compiler/src/template/pipeline/ir/src/expression.ts | 0% | 4 (2 crit, 2 high) | Extreme complexity (311) |
| compiler/src/template/pipeline/src/ingest.ts | 0% | 3 (2 crit, 1 high) | Extreme complexity (255) |
| compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (451) |
| compiler/src/output/output_ast.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (391) |
| compiler/src/ml_parser/lexer.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (322) |
| compiler-cli/src/ngtsc/annotations/component/src/handler.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (306) |
| compiler/src/expression_parser/parser.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (248) |
| animations/browser/src/render/transition_animation_engine.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (240) |

*⭐ indicates emblematic/core files*

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

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 489 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🟠 High | 394 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🟡 Medium | 434 | core/src/render3/instructions, core/src/render3 |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 951 | 2.2x threshold |
| Size | 261 | 1.5x threshold |
| Duplication | 105 | 1.5x threshold |

## Actionable Recommendations

### 🟠 Priority 2: Stabilize High-Impact Files

These files are heavily used but highly unstable, propagating change risks:

- **File:** `core/schematics/migrations/signal-queries-migration/migration.ts` (Instability: 0.75, Used by: 8)
  - **Suggestion:** Reduce outgoing dependencies (current: 24). Apply Dependency Inversion Principle.

- **File:** `core/src/render3/view_ref.ts` (Instability: 0.71, Used by: 7)
  - **Suggestion:** Reduce outgoing dependencies (current: 17). Apply Dependency Inversion Principle.

- **File:** `core/src/render3/component_ref.ts` (Instability: 0.88, Used by: 6)
  - **Suggestion:** Reduce outgoing dependencies (current: 43). Apply Dependency Inversion Principle.


### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `core/src/util/ng_server_mode.ts` (Duplication: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce duplication - achievable in under an hour.

- **File:** `compiler-cli/src/perform_compile.ts` (Size: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `router/src/provide_router.ts` (Size: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `core/src/render3/node_selector_matcher.ts` (Size: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `language-service/src/refactorings/convert_to_signal_queries/apply_query_refactoring.ts` (Duplication: 147% over threshold)
  - **Suggestion:** Quick refactor to reduce duplication - achievable in under an hour.


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
