# InsightCode Analysis Report: angular

## Project Information

- **Name:** angular
- **Type:** UI framework
- **Repository:** https://github.com/angular/angular.git
- **Version:** 19.2.14
- **Stars:** 98k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-21T22:20:39.414Z
- **Duration:** 234.89s
- **Files Analyzed:** 5895
- **Tool Version:** 0.7.0

## Quality Summary

### Grade: ✅ **B**

**🚨 Primary Concern:** Extreme complexity (4269) in `.github/actions/deploy-docs-site/main.js`.

**🎯 Priority Action:** See function-level analysis for specific improvements.

**📊 Additional Context:** 5 other files require attention.


| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 83/100 | 🟢 Good |
| Duplication | 93/100 (6.1% detected) | 🟢 Exceptional |
| Maintainability | 86/100 | 🟢 Good |
| **Overall** | **86/100** | **🟢 Good** |

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
| Total Files | 5895 |
| Total Lines of Code | 686,811 |
| Average Complexity | 9.4 |
| Average LOC per File | 117 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 4313 | 73% |
| 🟢 Very Good (B: 80-89) | 182 | 3% |
| 🟡 Good (C: 70-79) | 158 | 3% |
| 🟠 Moderate (D: 60-69) | 170 | 3% |
| 🔴 Poor (F: <60) | 1072 | 18% |

## Critical Files Requiring Attention

| File | Health | Primary Concern |
|------|--------|-----------------|
| .github/actions/deploy-docs-site/main.js | 0% | Extreme complexity (4269) |
| packages/common/locales/closure-locale.ts | 0% | Extreme complexity (548) |
| packages/compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts | 0% | Extreme complexity (451) |
| packages/compiler/src/output/output_ast.ts | 0% | Extreme complexity (391) |
| packages/compiler/src/ml_parser/lexer.ts | 0% | Extreme complexity (322) |
| packages/compiler/src/template/pipeline/ir/src/expression.ts | 0% | Extreme complexity (311) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues (Implications) |
|:---|:---|:---|:---|:---|
| `stringifyPair` | `.github/actions/deploy-docs-site/main.js` | **89** | 121 | **critical-complexity** (Severely impacts maintainability)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns) |
| `reifyCreateOperations` | `packages/compiler/src/template/pipeline/src/phases/reify.ts` | **86** | 359 | **critical-complexity** (Severely impacts maintainability)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test)<br/>**multiple-responsibilities** (Clean separation of concerns) |
| `simpleSubset` | `.github/actions/deploy-docs-site/main.js` | **84** | 112 | **critical-complexity** (Severely impacts maintainability)<br/>**long-function** (Should be split into smaller functions)<br/>**deep-nesting** (Hard to read and test) |
| `resolve` | `packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts` | **84** | 501 | **critical-complexity** (Severely impacts maintainability)<br/>**long-function** (Should be split into smaller functions)<br/>**multiple-responsibilities** (Clean separation of concerns)<br/>**deep-nesting** (Hard to read and test)<br/>**impure-function** (Side effects make testing harder) |
| `getDateFormatter` | `packages/common/src/i18n/format_date.ts` | **82** | 309 | **critical-complexity** (Severely impacts maintainability)<br/>**long-function** (Should be split into smaller functions)<br/>**multiple-responsibilities** (Clean separation of concerns) |

## Dependency Analysis

### Hub Files (High Impact)

*No significant hub files detected*

### Highly Unstable Files

*All files show good stability*

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 701 | 696 | 5 | packages/core/test/acceptance, packages/compiler/src/template/pipeline/src/phases |
| 🔴 High | 547 | 541 | 6 | packages/core/test/acceptance, packages/compiler-cli/test/ngtsc |
| 🟠 Medium | 497 | 490 | 7 | packages/core/test/acceptance, packages/compiler/src/template/pipeline/src/phases |
| 🟡 Low | 498 | 497 | 1 | packages/compiler-cli/test/compliance/test_cases/r3_view_compiler_control_flow, packages/zone.js/test/rxjs |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Complexity | 1035 | 0.6x threshold | File is hard to understand and maintain |
| Size | 692 | 1.7x threshold | File should be split into smaller modules |
| Duplication | 497 | 4.6x threshold | Refactor to reduce code duplication |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| Critical-complexity | 5 | `stringifyPair`, `reifyCreateOperations`... | Severely impacts maintainability |
| Long-function | 5 | `stringifyPair`, `reifyCreateOperations`... | Should be split into smaller functions |
| Deep-nesting | 4 | `stringifyPair`, `reifyCreateOperations`... | Hard to read and test |
| Multiple-responsibilities | 4 | `stringifyPair`, `reifyCreateOperations`... | Clean separation of concerns |
| Impure-function | 1 | `resolve` | Side effects make testing harder |

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
