# InsightCode Analysis Report: angular

## Project Information

- **Name:** angular
- **Type:** UI framework
- **Repository:** https://github.com/angular/angular.git
- **Version:** 19.2.14
- **Stars:** 98k
- **Category:** large

## Quality Summary

### Grade: ⚠️ **C**

With a grade of **C**, **angular-srcs** is a **maintainable but improvable** project. Our analysis identifies the **`compiler`** module as the primary technical debt concentration. Key concerns include `compiler/src/output/output_ast.ts` (health score: 0%) and `compiler/src/template/pipeline/src/compilation.ts` (health score: 6%). The most prevalent issues are **god functions** (48% of all issues) followed by **poorly named**. 

**🎯 Strategic recommendation:** Focus Phase 1 efforts on stabilizing the `compiler` module. Prioritize implementing **Split this 240 LOC file into smaller modules (medium size issue)** on `core/src/render3/instructions/style_prop_interpolation.ts` and refactoring the high-complexity function **`reifyCreateOperations`** (complexity: 86) for maximum impact.

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 72/100 | 🟡 Acceptable |
| Duplication | 97/100 (2.8% detected) | 🟢 Exceptional |
| Maintainability | 77/100 | 🟡 Acceptable |
| Reliability | 49/100 | 🔴 Critical |
| **Overall** | **74/100** | **🟡 Acceptable** |
## 🚀 Quick Wins Analysis

**Summary:**
- **Total potential score gain:** +13457 points
- **Quick wins identified:** 2180
- **Immediate wins (< 30min):** 574
- **Estimated total effort:** 3634.5 hours

### 📊 ROI Methodology
**ROI Definition**: Return on Investment for code quality improvements
- **Formula**: ROI = Health Score Points ÷ Implementation Hours
- **Unit**: Health Points per Hour (HPH)
- **Examples**: ROI 12 = Simple nesting fix (5 levels), ROI 2.5 = Complex refactoring (15+ levels)
- **Effort Factors**: Complexity depth, architectural criticality, and function length
- **Uncertainty**: Estimates include ±25% to ±55% uncertainty range

### Quick wins Executive Summary

**Total Potential Score Gain: +13457 points**

| Metric | Value |
|--------|-------|
| Quick Wins Identified | 2180 |
| Immediate Wins (< 30min) | 574 |
| Estimated Total Effort | 3634.5 hours |
| Average ROI | 5.5 |

### 🎯 Top 10 Quick Wins by ROI

| Priority | File | Action | Criticality | Score Gain | Effort | ROI (HPH ±%) |
|----------|------|--------|-------------|------------|--------|--------------|
| 🔴 | `.../instructions/style_prop_interpolation.ts` | Split this 240 LOC file into smaller modules (medium size issue) | ⚙️ Config | +81 | ~2h | 40.5 ±50% |
| 🔴 | `.../instructions/class_map_interpolation.ts` | Split this 208 LOC file into smaller modules (medium size issue) | ⭐ Feature | +67 | ~2h | 33.5 ±50% |
| 🔴 | `.../instructions/style_map_interpolation.ts` | Split this 207 LOC file into smaller modules (medium size issue) | 🔌 API | +66 | ~2h | 33.0 ±50% |
| 🔴 | `.../browser/browser.ts` | Split this 259 LOC file into smaller modules (medium size issue) | ⭐ Feature | +64 | ~2h | 32.0 ±50% |
| 🔴 | `.../src/upgrade_adapter.ts` | Split this 279 LOC file into smaller modules (medium size issue) | 🔌 API | +44 | ~2h | 22.0 ±50% |
| 🔴 | `.../instructions/text_interpolation.ts` | Split this 242 LOC file into smaller modules (medium size issue) | ⭐ Feature | +43 | ~2h | 21.5 ±50% |
| 🔴 | `.../hydration/api.ts` | Split this 254 LOC file into smaller modules (medium size issue) | 🔥 Core | +42 | ~2h | 21.0 ±50% |
| 🔴 | `.../instructions/interpolation.ts` | Split this 243 LOC file into smaller modules (medium size issue) | ⭐ Feature | +42 | ~2h | 21.0 ±50% |
| 🔴 | `.../instructions/template.ts` | Split this 212 LOC file into smaller modules (medium size issue) | 🔥 Core | +42 | ~2h | 21.0 ±50% |
| 🔴 | `.../src/host.ts` | Split this 249 LOC file into smaller modules (medium size issue) | ⭐ Feature | +42 | ~2h | 21.0 ±50% |

## 📊 Problem Patterns Breakdown

### • God Functions (1044 wins, 48%)

Functions handling multiple distinct responsibilities (thresholds: 1-842)

**Statistics:**
- Count: 1044 wins
- Total potential gain: +5771 points
- Average gain per fix: +6 points
- Average effort: [37mModerate[39m

**Most affected files:**
- `compiler/src/template/pipeline/src/ingest.ts`
- `compiler/src/template/pipeline/ir/src/expression.ts`
- `compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts`

**Strategic implication:** 1044 issues spread across various file types indicate systemic code quality concerns.

---

### • Large Files (269 wins, 12%)

Files exceeding optimal size thresholds (thresholds: 15-2130)

**Statistics:**
- Count: 269 wins
- Total potential gain: +2703 points
- Average gain per fix: +10 points
- Average effort: [31m[1mComplex[22m[39m

**Most affected files:**
- `compiler/src/ml_parser/ast.ts`
- `compiler/src/i18n/i18n_ast.ts`
- `compiler-cli/src/ngtsc/typecheck/extended/api/api.ts`

**Strategic implication:** 269 issues spread across various file types indicate systemic code quality concerns.

---

### • Multiple Responsibilities (207 wins, 9%)

Code mixing different concerns or domains (thresholds: 5-282)

**Statistics:**
- Count: 207 wins
- Total potential gain: +2503 points
- Average gain per fix: +12 points
- Average effort: [31m[1mComplex[22m[39m

**Most affected files:**
- `compiler-cli/src/ngtsc/annotations/directive/src/shared.ts`
- `zone.js/lib/common/events.ts`
- `compiler/src/template/pipeline/src/ingest.ts`

**Strategic implication:** 207 issues spread across various file types indicate systemic code quality concerns.

---

### • Poorly Named (375 wins, 17%)

Code quality improvement opportunity (thresholds: 0-48)

**Statistics:**
- Count: 375 wins
- Total potential gain: +1125 points
- Average gain per fix: +3 points
- Average effort: [32mTrivial[39m

**Most affected files:**
- `compiler-cli/src/ngtsc/typecheck/src/expression.ts`
- `compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts`
- `router/src/url_tree.ts`

**Strategic implication:** 375 issues spread across various file types indicate systemic code quality concerns.

---

### • Parameter Overload (218 wins, 10%)

Functions with excessive parameter count (thresholds: 3-43)

**Statistics:**
- Count: 218 wins
- Total potential gain: +876 points
- Average gain per fix: +4 points
- Average effort: [33mEasy[39m

**Most affected files:**
- `compiler/src/render3/r3_ast.ts`
- `core/src/render3/pure_function.ts`
- `compiler/src/template_parser/binding_parser.ts`

**Strategic implication:** 218 issues spread across various file types indicate systemic code quality concerns.

---

### • Control Flow Complexity (67 wins, 3%)

Nested control structures reducing readability (thresholds: 3-23)

**Statistics:**
- Count: 67 wins
- Total potential gain: +479 points
- Average gain per fix: +7 points
- Average effort: [37mModerate[39m

**Most affected files:**
- `compiler-cli/src/ngtsc/typecheck/src/type_check_block.ts`
- `compiler-cli/src/ngtsc/partial_evaluator/src/interpreter.ts`
- `compiler/src/ml_parser/lexer.ts`

**Strategic implication:** 67 issues spread across various file types indicate systemic code quality concerns.

---


## 🚀 Strategic Quick Wins
*High ROI improvements on architecturally critical files - maximum impact*

#### 1. Split this 208 LOC file into smaller modules (medium size issue)

- **Location**: `core/src/render3/instructions/class_map_interpolation.ts` (line 1)
- **Current**: 208 → **Target**: 200
- **Score Gain**: +67 points
- **Effort**: ~2h
- **ROI**: 33.5 HPH (±50%)

#### 2. Split this 207 LOC file into smaller modules (medium size issue)

- **Location**: `core/src/render3/instructions/style_map_interpolation.ts` (line 1)
- **Current**: 207 → **Target**: 200
- **Score Gain**: +66 points
- **Effort**: ~2h
- **ROI**: 33.0 HPH (±50%)

#### 3. Split this 259 LOC file into smaller modules (medium size issue)

- **Location**: `zone.js/lib/browser/browser.ts` (line 1)
- **Current**: 259 → **Target**: 200
- **Score Gain**: +64 points
- **Effort**: ~2h
- **ROI**: 32.0 HPH (±50%)

#### 4. Split this 279 LOC file into smaller modules (medium size issue)

- **Location**: `upgrade/src/dynamic/src/upgrade_adapter.ts` (line 1)
- **Current**: 279 → **Target**: 200
- **Score Gain**: +44 points
- **Effort**: ~2h
- **ROI**: 22.0 HPH (±50%)

#### 5. Split this 242 LOC file into smaller modules (medium size issue)

- **Location**: `core/src/render3/instructions/text_interpolation.ts` (line 1)
- **Current**: 242 → **Target**: 200
- **Score Gain**: +43 points
- **Effort**: ~2h
- **ROI**: 21.5 HPH (±50%)


## ✅ Standard Quick Wins
*Good ROI improvements on moderate impact files - ideal for new contributors*

#### 1. Split this 240 LOC file into smaller modules (medium size issue)

- **Location**: `core/src/render3/instructions/style_prop_interpolation.ts` (line 1)
- **Current**: 240 → **Target**: 200
- **Score Gain**: +81 points
- **Effort**: ~2h
- **ROI**: 40.5 HPH (±50%)

#### 2. Split this 244 LOC file into smaller modules (medium size issue)

- **Location**: `zone.js/lib/jest/jest.ts` (line 1)
- **Current**: 244 → **Target**: 200
- **Score Gain**: +31 points
- **Effort**: ~2h
- **ROI**: 15.5 HPH (±50%)

#### 3. Use object parameter pattern for ɵɵclassMapInterpolate7 (15 parameters)

- **Location**: `core/src/render3/instructions/class_map_interpolation.ts` → `ɵɵclassMapInterpolate7()` (line 332)
- **Current**: 15 → **Target**: 3
- **Score Gain**: +7 points
- **Effort**: ~30min
- **ROI**: 14.0 HPH (±30%)

<details>
<summary>💡 Code Suggestion</summary>

**Object parameters are easier to use and maintain**

Before:
```typescript
function ɵɵclassMapInterpolate7(param1, param2, param3, param4, param5, param6) { }
```

After:
```typescript
interface ɵɵclassMapInterpolate7Options {
  param1: string;
  param2: number;
  param3?: boolean;
  // ... other params
}

function ɵɵclassMapInterpolate7(options: ɵɵclassMapInterpolate7Options) {
  const { param1, param2, param3 = true } = options;
  // ...
}
```
</details>

#### 4. Use object parameter pattern for ɵɵpropertyInterpolate6 (15 parameters)

- **Location**: `core/src/render3/instructions/property_interpolation.ts` → `ɵɵpropertyInterpolate6()` (line 484)
- **Current**: 15 → **Target**: 3
- **Score Gain**: +7 points
- **Effort**: ~30min
- **ROI**: 14.0 HPH (±30%)

<details>
<summary>💡 Code Suggestion</summary>

**Object parameters are easier to use and maintain**

Before:
```typescript
function ɵɵpropertyInterpolate6(param1, param2, param3, param4, param5, param6) { }
```

After:
```typescript
interface ɵɵpropertyInterpolate6Options {
  param1: string;
  param2: number;
  param3?: boolean;
  // ... other params
}

function ɵɵpropertyInterpolate6(options: ɵɵpropertyInterpolate6Options) {
  const { param1, param2, param3 = true } = options;
  // ...
}
```
</details>

#### 5. Use object parameter pattern for ɵɵstylePropInterpolate6 (15 parameters)

- **Location**: `core/src/render3/instructions/style_prop_interpolation.ts` → `ɵɵstylePropInterpolate6()` (line 307)
- **Current**: 15 → **Target**: 3
- **Score Gain**: +7 points
- **Effort**: ~30min
- **ROI**: 14.0 HPH (±30%)

<details>
<summary>💡 Code Suggestion</summary>

**Object parameters are easier to use and maintain**

Before:
```typescript
function ɵɵstylePropInterpolate6(param1, param2, param3, param4, param5, param6) { }
```

After:
```typescript
interface ɵɵstylePropInterpolate6Options {
  param1: string;
  param2: number;
  param3?: boolean;
  // ... other params
}

function ɵɵstylePropInterpolate6(options: ɵɵstylePropInterpolate6Options) {
  const { param1, param2, param3 = true } = options;
  // ...
}
```
</details>


## 📅 Implementation Roadmap

### Phase 1: Quick Wins (574 tasks, ~143.5h)
**Potential gain: +1863 points**

Focus on:
- [ ] Use object parameter pattern for ɵɵclassMapInterpolate7 (15 parameters) in `.../instructions/class_map_interpolation.ts` (+7)
- [ ] Use object parameter pattern for ɵɵpropertyInterpolate6 (15 parameters) in `.../instructions/property_interpolation.ts` (+7)
- [ ] Use object parameter pattern for ɵɵstyleMapInterpolate7 (15 parameters) in `.../instructions/style_map_interpolation.ts` (+7)
- [ ] Use object parameter pattern for ɵɵstylePropInterpolate6 (15 parameters) in `.../instructions/style_prop_interpolation.ts` (+7)
- [ ] Use object parameter pattern for ɵɵtextInterpolate7 (15 parameters) in `.../instructions/text_interpolation.ts` (+7)

### Phase 2: Medium Effort (827 tasks, ~827h)
**Potential gain: +4844 points**

Key refactorings:
- [ ] Split _getLiteralFactory into single-responsibility functions (2 responsibilities detected) in `compiler/src/constant_pool.ts` (+8)
- [ ] Split convertDirectiveFacadeToMetadata into single-responsibility functions (2 responsibilities detected) in `compiler/src/jit_compiler_facade.ts` (+8)
- [ ] Split convertDeclareComponentFacadeToMetadata into single-responsibility functions (2 responsibilities detected) in `compiler/src/jit_compiler_facade.ts` (+8)
- [ ] Split compileInjectable into single-responsibility functions (2 responsibilities detected) in `compiler/src/jit_compiler_facade.ts` (+8)
- [ ] Split compileInjectableDeclaration into single-responsibility functions (2 responsibilities detected) in `compiler/src/jit_compiler_facade.ts` (+8)

### Phase 3: Major Refactorings (779 tasks, ~2337h)
**Potential gain: +6750 points**

Strategic improvements:
- [ ] Split this 240 LOC file into smaller modules (medium size issue) in `.../instructions/style_prop_interpolation.ts` (+81)
- [ ] Split this 208 LOC file into smaller modules (medium size issue) in `.../instructions/class_map_interpolation.ts` (+67)
- [ ] Split this 207 LOC file into smaller modules (medium size issue) in `.../instructions/style_map_interpolation.ts` (+66)
## Analysis Context

- **Timestamp:** 2025-08-15T09:55:42.035Z
- **Duration:** 297.04s
- **Files Analyzed:** 1744
- **Tool Version:** 0.8.0

## Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 1744 |
| Total Lines of Code | 195,842 |
| Average Complexity | 19.5 |
| Average LOC per File | 112 |

### 📊 Scoring Methodology

InsightCode combines **research-based thresholds** with **criticality-weighted aggregation**, following the **Pareto principle**.

#### 🔧 Overall Score Calculation
InsightCode uses a **two-step weighted aggregation** process:

**Step 1:** Each metric is weighted by architectural criticality:
```
Weighted_Complexity = Σ(File_Complexity × CriticismScore) / Σ(CriticismScore)
Weighted_Maintainability = Σ(File_Maintainability × CriticismScore) / Σ(CriticismScore)
Weighted_Duplication = Σ(File_Duplication × CriticismScore) / Σ(CriticismScore)
Weighted_Reliability = Σ(File_Reliability × CriticismScore) / Σ(CriticismScore)
```

**Step 2:** Final score combines weighted metrics:
```
Overall Score = (Weighted_Complexity × 35%) + (Weighted_Maintainability × 25%) + (Weighted_Duplication × 20%) + (Weighted_Reliability × 20%)
```

#### 🧮 Metric Configuration
| Metric | Final Weight | Thresholds & Research Basis |
|--------|--------------|-----------------------------|
| **Complexity** | 35% | McCabe (1976): ≤10 = low, ≤15 = medium, ≤20 = high, ≤50 = very high, >50 = extreme |
| **Maintainability** | 25% | Clean Code principles: ≤200 LOC/file preferred, progressive penalties |
| **Duplication** | 20% | Legacy threshold: ≤15% considered excellent for brownfield projects |
| **Reliability** | 20% | Based on detected issues: deep nesting, long functions, complex conditions |

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

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 978 | 56% |
| 🟢 Very Good (B: 80-89) | 75 | 4% |
| 🟡 Good (C: 70-79) | 60 | 3% |
| 🟠 Moderate (D: 60-69) | 47 | 3% |
| 🔴 Poor (F: <60) | 584 | 33% |

## Critical Files Requiring Attention

| File | Health | Criticism | Primary Concern |
|------|--------|-----------|------------------|
| compiler/src/output/output_ast.ts | 0% | 🔥 Critical | Extreme complexity (391) |
| core/src/render3/state.ts | 0% | 🔥 Critical | Extreme complexity (95) |
| core/src/util/assert.ts | 16% | 🔥 Critical | Very High complexity (43) |
| compiler/src/template/pipeline/src/compilation.ts | 6% | 🔥 Critical | Very High complexity (23) |
| core/src/render3/util/view_utils.ts | 0% | 🔥 Critical | Extreme complexity (67) |
| compiler/src/template/pipeline/src/emit.ts | 30% | 🔥 Critical | Very High complexity (30) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues|
|:---|:---|:---|:---|:---|
| `reifyCreateOperations` | `.../phases/reify.ts` | **86** | 359 | **critical-complexity** : Complexity 86 exceeds critical threshold of 50<br/>**long-function** : Function has 359 lines, consider breaking into smaller functions |
| `resolve` | `.../src/handler.ts` | **84** | 497 | **critical-complexity** : Complexity 84 exceeds critical threshold of 50<br/>**long-function** : Function has 497 lines, consider breaking into smaller functions |
| `getDateFormatter` | `common/src/i18n/format_date.ts` | **82** | 309 | **critical-complexity** : Complexity 82 exceeds critical threshold of 50<br/>**long-function** : Function has 309 lines, consider breaking into smaller functions |
| `transformExpressionsInOp` | `.../src/expression.ts` | **72** | 148 | **critical-complexity** : Complexity 72 exceeds critical threshold of 50<br/>**long-function** : Function has 148 lines, consider breaking into smaller functions |
| `analyze` | `.../src/handler.ts` | **59** | 484 | **critical-complexity** : Complexity 59 exceeds critical threshold of 50<br/>**long-function** : Function has 484 lines, consider breaking into smaller functions |

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
| language-service/plugin-factory.ts | 1.00 | 1/0 |
| common/http/public_api.ts | 0.95 | 18/1 |
| benchpress/src/runner.ts | 0.95 | 18/1 |
| zone.js/zone.ts | 1.00 | 3/0 |
| common/locales/closure-locale.ts | 1.00 | 1/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 461 | 453 | 8 | compiler/src/template/pipeline/src/phases, core/src/render3 |
| 🔴 High | 941 | 376 | 565 | core/src/render3/instructions, compiler/src/template/pipeline/src/phases |
| 🟠 Medium | 1427 | 316 | 1111 | compiler/src/template/pipeline/src/phases, compiler-cli/src/ngtsc/typecheck/src |
| 🟡 Low | 6246 | 78 | 6168 | compiler-cli/src/ngtsc/typecheck/src, compiler/src/output |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Critical-file-complexity | 439 | 0.4x threshold | Review for best practices |
| Large-file | 248 | 1.5x threshold | Review for best practices |
| Too-many-functions | 197 | 2.2x threshold | Review for best practices |
| Complexity | 136 | 0.9x threshold | File is hard to understand and maintain |
| High-file-complexity | 111 | 0.9x threshold | Review for best practices |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| Impure-function | 5793 | `<anonymous>`, `build`... | Side effects make testing harder |
| Long-function | 576 | `getConstLiteral`, `compileInjectable`... | Should be split into smaller functions |
| Multiple-responsibilities | 488 | `_getLiteralFactory`, `convertDirectiveFacadeToMetadata`... | Clean separation of concerns |
| Poorly-named | 375 | `gc`, `supports`... | Names should be descriptive and meaningful |
| Too-many-params | 218 | `<anonymous>`, `getCompletionEntryDetails`... | Consider using object parameters |

## 📈 Pattern Analysis

### 🎯 Quality Patterns

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Impure Function | 5793 | Side effects make testing harder |
| Long Function | 576 | Should be split into smaller functions |
| Multiple Responsibilities | 488 | Clean separation of concerns |
| Poorly Named | 375 | Names should be descriptive and meaningful |
| Too Many Params | 218 | Consider using object parameters |
| God Function | 144 | Violates Single Responsibility |
| Medium Complexity | 108 | Consider refactoring for clarity |
| High Complexity | 75 | Error-prone and hard to maintain |
| Deep Nesting | 67 | Hard to read and test |
| Critical Complexity | 8 | Severely impacts maintainability |


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
