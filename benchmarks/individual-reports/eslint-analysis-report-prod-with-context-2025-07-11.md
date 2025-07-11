# InsightCode Analysis Report: eslint

## Project Information

- **Name:** eslint
- **Type:** code analysis tool
- **Repository:** https://github.com/eslint/eslint.git
- **Version:** v9.30.1
- **Stars:** 26k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-11T18:26:20.579Z
- **Duration:** 21.74s
- **Files Analyzed:** 425
- **Tool Version:** 0.6.0

## Quality Overview

### Grade: ⚠️ **C**

**307 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 58/100 | 🔴 Critical |
| Duplication | 91/100 (18.8% detected) | 🟢 Excellent |
| Maintainability | 73/100 | 🟡 Good |
| **Overall** | **71/100** | **🟡 Good** |

### 📊 Scoring Methodology

InsightCode uses **evidence-based scoring** aligned with academic research and industry standards:

#### Overall Score Formula
`(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)`

| Dimension | Weight | Academic Foundation & Thresholds |
|-----------|--------|----------------------------------|
| **Complexity** | **45%** | **McCabe (1976):** Complexity ≤10 (low), 11-15 (medium), 16-20 (high), 21-50 (very high), >50 (extreme). Primary defect predictor. |
| **Maintainability** | **30%** | **Martin Clean Code (2008):** Files ≤200 LOC ideal. Impact on development velocity and comprehension. |
| **Duplication** | **25%** | **Fowler Refactoring (1999):** Technical debt indicator. ≤15% acceptable, >30% concerning, >50% critical maintenance burden. |

#### Grade Scale (Academic Standard)
**A** (90-100) • **B** (80-89) • **C** (70-79) • **D** (60-69) • **F** (<60)

#### Aggregation Method
- **Project-level:** Architectural criticality weighting WITHOUT outlier masking
- **File-level:** Penalty-based (100 - penalties) with NO CAPS - extreme values get extreme penalties
- **Philosophy:** Pareto principle - identify the 20% of code causing 80% of problems

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 425 |
| Total Lines of Code | 66,827 |
| Average Complexity | 22.8 |
| Average LOC per File | 157 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 99 | 23% |
| 🟡 Good (70-89) | 39 | 9% |
| 🟠 Moderate (50-69) | 38 | 9% |
| 🔴 Poor (<50) | 249 | 59% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| Makefile.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (66) |
| lib/cli.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (110) |
| ⭐ lib/cli-engine/cli-engine.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (106) |
| lib/config/config.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (73) |
| lib/config/flat-config-schema.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (57) |
| lib/eslint/eslint-helpers.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (104) |
| ⭐ lib/eslint/eslint.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (101) |
| lib/eslint/legacy-eslint.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (99) |
| ⭐ lib/rule-tester/rule-tester.js | 0% | 2 (2 crit, 0 high) | Extreme complexity (127) |
| lib/linter/apply-disable-directives.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (52) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `create` | `lib/rules/no-extra-parens.js` | **296** | 1553 | high-complexity, long-function, deep-nesting |
| `create` | `lib/rules/no-unused-vars.js` | **238** | 1602 | high-complexity, long-function, deep-nesting |
| `create` | `lib/rules/indent-legacy.js` | **185** | 1171 | high-complexity, long-function, deep-nesting |
| `create` | `lib/rules/indent.js` | **168** | 1663 | high-complexity, long-function, deep-nesting |
| `create` | `lib/rules/no-shadow.js` | **97** | 514 | high-complexity, long-function, deep-nesting |

## 📈 Code Pattern Analysis

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 242 | Hard to read and test |
| Long Function | 231 | Should be split into smaller functions |
| High Complexity | 151 | Error-prone and hard to maintain |
| Too Many Params | 2 | Consider using object parameters |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Error Handling | 26 | Good defensive programming |
| Async Heavy | 6 | Ensure proper error handling |
| Type Safe | 3 | Reduces runtime errors |



## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| lib/shared/string-utils.js | 7 | 100th percentile | Utilities |
| lib/rules/index.js | 6 | 100th percentile | Entry point |
| lib/config/config.js | 5 | 99th percentile | Configuration |
| lib/shared/assert.js | 5 | 99th percentile | Core module |
| lib/languages/js/source-code/token-store/cursor.js | 5 | 99th percentile | Core module |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| Makefile.js | 1.00 | 3/0 |
| eslint.config.js | 1.00 | 1/0 |
| bin/eslint.js | 1.00 | 1/0 |
| lib/api.js | 1.00 | 5/0 |
| lib/cli.js | 0.91 | 10/1 |

## Issue Analysis

### Issue Summary

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 185 | lib/rules, lib/linter |
| 🟠 High | 156 | lib/rules, lib/config |
| 🟡 Medium | 186 | lib/rules, lib/shared |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 234 | 2.1x threshold |
| Duplication | 204 | 1.3x threshold |
| Size | 89 | 1.4x threshold |

## Code Quality Patterns

### Detected Patterns Summary

#### Quality Patterns
| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 242 | Hard to read and test |
| Long Function | 231 | Should be split into smaller functions |
| High Complexity | 151 | Error-prone and hard to maintain |
| Too Many Params | 2 | Consider using object parameters |

#### Architecture Patterns
| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Error Handling | 26 | Good defensive programming |
| Async Heavy | 6 | Ensure proper error handling |
| Type Safe | 3 | Reduces runtime errors |

### Most Complex Functions

| Function | Complexity | Lines | Issues |
|----------|------------|-------|--------|
| create | 296 | 1553 | high-complexity, long-function, deep-nesting |
| create | 238 | 1602 | high-complexity, long-function, deep-nesting |
| create | 185 | 1171 | high-complexity, long-function, deep-nesting |
| create | 168 | 1663 | high-complexity, long-function, deep-nesting |
| create | 97 | 514 | high-complexity, long-function, deep-nesting |

## Actionable Recommendations

### 🔴 Priority 1: Refactor High-Complexity Core Functions

These emblematic files have very high complexity that impacts maintainability:

- **File:** `lib/linter/linter.js` (Complexity: 261)
  - 🎯 **Target Function:** `<anonymous>` (Function Complexity: 31)
  - **Suggestion:** This function is the primary complexity driver. Break it down into smaller, single-responsibility helpers.

- **File:** `lib/linter/code-path-analysis/code-path-analyzer.js` (Complexity: 167)
  - 🎯 **Target Function:** `preprocess` (Function Complexity: 37)
  - **Suggestion:** This function is the primary complexity driver. Break it down into smaller, single-responsibility helpers.

- **File:** `lib/rule-tester/rule-tester.js` (Complexity: 127)
  - 🎯 **Target Function:** `run` (Function Complexity: 91)
  - **Suggestion:** This function is the primary complexity driver. Break it down into smaller, single-responsibility helpers.


### 🟠 Priority 2: Stabilize High-Impact Files

These files are heavily used but highly unstable, propagating change risks:

- **File:** `lib/rules/index.js` (Instability: 0.98, Used by: 6)
  - **Suggestion:** Reduce outgoing dependencies (current: 291). Apply Dependency Inversion Principle.

- **File:** `lib/cli-engine/cli-engine.js` (Instability: 0.78, Used by: 2)
  - 🎯 **Target Function:** `executeOnFiles` (Function Complexity: 18)
  - **Suggestion:** This function likely contains many dependencies. Extract smaller helpers and apply Dependency Inversion.

- **File:** `lib/linter/linter.js` (Instability: 0.92, Used by: 2)
  - 🎯 **Target Function:** `<anonymous>` (Function Complexity: 31)
  - **Suggestion:** This function likely contains many dependencies. Extract smaller helpers and apply Dependency Inversion.


### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `lib/rules/curly.js` (Size: 148% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 41)
  - **Suggestion:** Addressing this function will help reduce the file's size issues.

- **File:** `lib/rules/space-infix-ops.js` (Duplication: 147% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 19)
  - **Suggestion:** Addressing this function will help reduce the file's duplication issues.

- **File:** `lib/rules/max-lines-per-function.js` (Duplication: 146% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 30)
  - **Suggestion:** Addressing this function will help reduce the file's duplication issues.

- **File:** `lib/rules/no-unused-expressions.js` (Duplication: 146% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 15)
  - **Suggestion:** Addressing this function will help reduce the file's duplication issues.

- **File:** `lib/rules/no-mixed-operators.js` (Duplication: 146% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 12)
  - **Suggestion:** Addressing this function will help reduce the file's duplication issues.


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
- **Research Base:** ISO/IEC 25010, Fowler Technical Debt, Pareto Principle - extreme values dominate

### Health Score Formula
- **Base:** 100 points minus penalties
- **Penalties:** Progressive (linear then exponential) - NO LOGARITHMIC MASKING
- **Caps:** NO CAPS - extreme values receive extreme penalties (following Pareto principle)
- **Purpose:** Identify real problems following Pareto principle (80/20)
