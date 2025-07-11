# InsightCode Analysis Report: eslint

## Project Information

- **Name:** eslint
- **Type:** code analysis tool
- **Repository:** https://github.com/eslint/eslint.git
- **Version:** v9.30.1
- **Stars:** 26k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-11T16:14:18.808Z
- **Duration:** 84.77s
- **Files Analyzed:** 1448
- **Tool Version:** 0.6.0

## Quality Overview

### Grade: 💀 **F**

**415 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 40/100 | 🔴 Critical |
| Duplication | 100/100 (0.0% detected) | 🟢 Excellent |
| Maintainability | 51/100 | 🟠 Needs Improvement |
| **Overall** | **58/100** | **🟠 Needs Improvement** |

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
| Total Files | 1448 |
| Total Lines of Code | 444,017 |
| Average Complexity | 12.1 |
| Average LOC per File | 307 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 952 | 66% |
| 🟡 Good (70-89) | 128 | 9% |
| 🟠 Moderate (50-69) | 212 | 15% |
| 🔴 Poor (<50) | 156 | 11% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| Makefile.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (66) |
| lib/cli.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (110) |
| docs/tools/prism-eslint-hook.js | 0% | 1 (1 crit, 0 high) | Extreme complexity (53) |
| ⭐ lib/cli-engine/cli-engine.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (106) |
| lib/config/config.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (73) |
| lib/config/flat-config-schema.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (57) |
| lib/eslint/eslint-helpers.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (104) |
| ⭐ lib/eslint/eslint.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (101) |
| lib/eslint/legacy-eslint.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (99) |
| lib/linter/apply-disable-directives.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (52) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `<anonymous>` | `tests/performance/jshint.js` | **2164** | 15210 | high-complexity, long-function, deep-nesting |
| `<anonymous>` | `tests/bench/large.js` | **2079** | 19497 | high-complexity, long-function, deep-nesting |
| `<anonymous>` | `tests/bench/large.js` | **1263** | 6820 | high-complexity, long-function, deep-nesting |
| `<anonymous>` | `tests/bench/large.js` | **1261** | 6761 | high-complexity, long-function, deep-nesting |
| `<anonymous>` | `tests/performance/jshint.js` | **1165** | 6763 | high-complexity, long-function, deep-nesting |

## 📈 Code Pattern Analysis

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Long Function | 252 | Should be split into smaller functions |
| Deep Nesting | 214 | Hard to read and test |
| High Complexity | 173 | Error-prone and hard to maintain |
| Too Many Params | 4 | Consider using object parameters |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Error Handling | 43 | Good defensive programming |
| Async Heavy | 14 | Ensure proper error handling |
| Type Safe | 3 | Reduces runtime errors |



## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| lib/rule-tester/rule-tester.js | 292 | 100th percentile | Core module |
| lib/rules/utils/ast-utils.js | 186 | 100th percentile | Utilities |
| tests/fixtures/fixture-parser.js | 15 | 100th percentile | Core module |
| lib/rules/index.js | 14 | 100th percentile | Entry point |
| tests/_utils/index.js | 14 | 100th percentile | Entry point |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| Makefile.js | 1.00 | 4/0 |
| eslint.config.js | 1.00 | 2/0 |
| bin/eslint.js | 1.00 | 1/0 |
| docs/.eleventy.js | 1.00 | 4/0 |
| lib/cli.js | 0.83 | 10/2 |

## Issue Analysis

### Issue Summary

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 233 | lib/rules, tests/lib/rules |
| 🟠 High | 217 | tests/lib/rules, lib/rules |
| 🟡 Medium | 170 | lib/rules, tests/lib/rules |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Size | 355 | 1.7x threshold |
| Complexity | 265 | 2.8x threshold |

## Code Quality Patterns

### Detected Patterns Summary

#### Quality Patterns
| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Long Function | 252 | Should be split into smaller functions |
| Deep Nesting | 214 | Hard to read and test |
| High Complexity | 173 | Error-prone and hard to maintain |
| Too Many Params | 4 | Consider using object parameters |

#### Architecture Patterns
| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Error Handling | 43 | Good defensive programming |
| Async Heavy | 14 | Ensure proper error handling |
| Type Safe | 3 | Reduces runtime errors |

### Most Complex Functions

| Function | Complexity | Lines | Issues |
|----------|------------|-------|--------|
| <anonymous> | 2164 | 15210 | high-complexity, long-function, deep-nesting |
| <anonymous> | 2079 | 19497 | high-complexity, long-function, deep-nesting |
| <anonymous> | 1263 | 6820 | high-complexity, long-function, deep-nesting |
| <anonymous> | 1261 | 6761 | high-complexity, long-function, deep-nesting |
| <anonymous> | 1165 | 6763 | high-complexity, long-function, deep-nesting |

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

- **File:** `lib/rules/index.js` (Instability: 0.95, Used by: 14)
  - **Suggestion:** Reduce outgoing dependencies (current: 292). Apply Dependency Inversion Principle.


### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `tests/lib/rules/no-return-await.js` (Size: 149% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `lib/rules/curly.js` (Size: 148% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 41)
  - **Suggestion:** Addressing this function will help reduce the file's size issues.

- **File:** `tests/lib/cli-engine/formatters/stylish.js` (Size: 147% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `tests/fixtures/parsers/unknown-nodes/interface.js` (Size: 146% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `lib/rules/no-extra-boolean-cast.js` (Size: 145% over threshold)
  - 🎯 **Focus Function:** `create` (Complexity: 65)
  - **Suggestion:** Addressing this function will help reduce the file's size issues.


---
## 🔬 Technical Notes

### Duplication Detection
- **Algorithm:** Enhanced 8-line literal pattern matching with 8+ token minimum, cross-file exact matches only
- **Focus:** Copy-paste duplication using MD5 hashing of normalized blocks (not structural similarity)
- **Philosophy:** Pragmatic approach using regex normalization - avoids false positives while catching actionable duplication
- **Results:** Typically 0-15% duplication vs ~70% with structural detection tools, filtering imports/trivial declarations

### Complexity Calculation
- **Method:** McCabe Cyclomatic Complexity (1976)
- **Scoring:** Linear degradation 10→20, then exponential decay beyond critical threshold of 20
- **Research Base:** Strong correlation with defect rate, no artificial caps for extreme values

### Health Score Formula
- **Base:** 100 points minus penalties
- **Penalties:** Progressive (linear then exponential) - NO LOGARITHMIC MASKING
- **Caps:** Complexity soft-capped at 90 penalty, duplication/size uncapped
- **Purpose:** Identify real problems following Pareto principle (80/20)
