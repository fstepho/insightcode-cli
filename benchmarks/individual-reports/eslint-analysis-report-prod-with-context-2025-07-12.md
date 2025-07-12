# InsightCode Analysis Report: eslint

## Project Information

- **Name:** eslint
- **Type:** code analysis tool
- **Repository:** https://github.com/eslint/eslint.git
- **Version:** v9.30.1
- **Stars:** 26k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-12T21:46:35.039Z
- **Duration:** 28.58s
- **Files Analyzed:** 425
- **Tool Version:** 0.6.1

## Quality Overview

### Grade: 🔴 **D**

**193 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 52/100 | 🔴 Critical |
| Duplication | 97/100 (17.5% detected) | 🟢 Excellent |
| Maintainability | 69/100 | 🟠 Needs Improvement |
| **Overall** | **68/100** | **🟠 Needs Improvement** |

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
| Total Files | 425 |
| Total Lines of Code | 66,858 |
| Average Complexity | 18.8 |
| Average LOC per File | 157 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 122 | 29% |
| 🟡 Good (70-89) | 64 | 15% |
| 🟠 Moderate (50-69) | 46 | 11% |
| 🔴 Poor (<50) | 193 | 45% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| ⭐ lib/rule-tester/rule-tester.js | 0% | 4 (2 crit, 2 high) | Extreme complexity (147) |
| ⭐ lib/linter/linter.js | 0% | 2 (2 crit, 0 high) | Extreme complexity (229) |
| lib/rules/no-unused-vars.js | 0% | 4 (2 crit, 2 high) | Extreme complexity (247) |
| lib/rules/no-extra-parens.js | 0% | 4 (2 crit, 2 high) | Extreme complexity (187) |
| lib/rules/array-bracket-spacing.js | 0% | 3 (2 crit, 1 high) | Very High complexity (39) |
| lib/rules/indent.js | 0% | 2 (2 crit, 0 high) | Extreme complexity (99) |
| lib/rules/id-blacklist.js | 0% | 2 (2 crit, 0 high) | Very High complexity (39) |
| lib/rules/id-denylist.js | 0% | 2 (2 crit, 0 high) | Very High complexity (36) |
| ⭐ lib/linter/code-path-analysis/code-path-analyzer.js | 0% | 6 (1 crit, 5 high) | Extreme complexity (186) |
| ⭐ lib/cli-engine/cli-engine.js | 0% | 2 (1 crit, 1 high) | Extreme complexity (127) |

*⭐ indicates emblematic/core files*

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
| 🔴 Critical | 152 | lib/rules, lib/linter |
| 🟠 High | 184 | lib/rules, lib/linter/code-path-analysis |
| 🟡 Medium | 247 | lib/rules, lib/linter |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 302 | 2.0x threshold |
| Duplication | 192 | 1.4x threshold |
| Size | 89 | 1.4x threshold |

## Actionable Recommendations

### 🔴 Priority 1: Refactor High-Complexity Core Functions

These emblematic files have very high complexity that impacts maintainability:

- **File:** `lib/linter/linter.js` (Complexity: 229)
  - **Suggestion:** Apply the Single Responsibility Principle to decompose this file into smaller modules.

- **File:** `lib/linter/code-path-analysis/code-path-analyzer.js` (Complexity: 186)
  - **Suggestion:** Apply the Single Responsibility Principle to decompose this file into smaller modules.

- **File:** `lib/rule-tester/rule-tester.js` (Complexity: 147)
  - **Suggestion:** Apply the Single Responsibility Principle to decompose this file into smaller modules.


### 🟠 Priority 2: Stabilize High-Impact Files

These files are heavily used but highly unstable, propagating change risks:

- **File:** `lib/rules/index.js` (Instability: 0.98, Used by: 6)
  - **Suggestion:** Reduce outgoing dependencies (current: 291). Apply Dependency Inversion Principle.

- **File:** `lib/cli-engine/cli-engine.js` (Instability: 0.78, Used by: 2)
  - **Suggestion:** Reduce outgoing dependencies (current: 7). Apply Dependency Inversion Principle.

- **File:** `lib/linter/linter.js` (Instability: 0.92, Used by: 2)
  - **Suggestion:** Reduce outgoing dependencies (current: 24). Apply Dependency Inversion Principle.


### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `lib/rules/curly.js` (Size: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `lib/rules/no-extra-boolean-cast.js` (Size: 145% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `lib/rules/comma-style.js` (Size: 144% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `lib/rules/no-useless-call.js` (Duplication: 144% over threshold)
  - **Suggestion:** Quick refactor to reduce duplication - achievable in under an hour.

- **File:** `lib/rules/prefer-rest-params.js` (Duplication: 144% over threshold)
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
