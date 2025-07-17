# InsightCode Analysis Report: eslint

## Project Information

- **Name:** eslint
- **Type:** code analysis tool
- **Repository:** https://github.com/eslint/eslint.git
- **Version:** v9.30.1
- **Stars:** 26k
- **Category:** large

## Analysis Context

- **Timestamp:** 2025-07-14T19:23:02.668Z
- **Duration:** 73.96s
- **Files Analyzed:** 425
- **Tool Version:** 0.6.0

## Executive Summary

**Grade D (67/100)** - Moderate health.

**🚨 Primary Concern:** Extreme complexity (229) in `lib/linter/linter.js` (core file).

**🎯 Priority Action:** Break down into smaller, single-responsibility functions

**📊 Additional Context:** 9 other files require attention.

## Quality Overview

### Grade: 🔴 **D**

**330 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 52/100 | 🔴 Critical |
| Duplication | 92/100 (17.5% detected) | 🟢 Excellent |
| Maintainability | 69/100 | 🟠 Needs Improvement |
| **Overall** | **67/100** | **🟠 Needs Improvement** |

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
| Total Files | 425 |
| Total Lines of Code | 66,858 |
| Average Complexity | 18.8 |
| Average LOC per File | 157 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 89 | 21% |
| 🟢 Very Good (B: 80-89) | 6 | 1% |
| 🟡 Good (C: 70-79) | 25 | 6% |
| 🟠 Moderate (D: 60-69) | 23 | 5% |
| 🔴 Poor (F: <60) | 282 | 66% |

## Critical Files Requiring Attention

| File | Health | Primary Concern & Recommendation |
|------|--------|-----------------------------------|
| ⭐ lib/linter/linter.js | 0% | Extreme complexity (229) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| ⭐ lib/rule-tester/rule-tester.js | 0% | Extreme complexity (147) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| lib/rules/no-unused-vars.js | 0% | Extreme complexity (247) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| lib/rules/no-extra-parens.js | 0% | Extreme complexity (187) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| lib/rules/indent.js | 0% | Extreme complexity (99) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| lib/rules/array-bracket-spacing.js | 0% | Very High complexity (39) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| lib/rules/id-blacklist.js | 0% | Very High complexity (39) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| lib/rules/id-denylist.js | 0% | Very High complexity (36) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| ⭐ lib/linter/code-path-analysis/code-path-analyzer.js | 0% | Extreme complexity (186) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| ⭐ lib/cli-engine/cli-engine.js | 0% | Extreme complexity (127) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `handleFixes` | `lib/rules/no-unused-vars.js` | **62** | 693 | complexity, size, high-complexity, long-function, deep-nesting |
| `processOptions` | `lib/eslint/eslint-helpers.js` | **48** | 194 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility |
| `collectUnusedVariables` | `lib/rules/no-unused-vars.js` | **48** | 204 | complexity, size, high-complexity, long-function, deep-nesting |
| `processOptions` | `lib/eslint/legacy-eslint.js` | **47** | 188 | complexity, size, high-complexity, long-function, deep-nesting, single-responsibility |
| `checkVariableDeclaration` | `lib/rules/one-var.js` | **42** | 192 | complexity, size, high-complexity, long-function, deep-nesting |

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| lib/shared/string-utils.js | 7 | 100th percentile | Utilities |
| lib/rules/index.js | 6 | 100th percentile | Entry point |
| lib/shared/assert.js | 5 | 99th percentile | Core module |
| lib/languages/js/source-code/token-store/cursor.js | 5 | 99th percentile | Core module |
| lib/languages/js/source-code/token-store/utils.js | 5 | 99th percentile | Utilities |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| Makefile.js | 1.00 | 3/0 |
| lib/api.js | 1.00 | 5/0 |
| lib/cli.js | 0.91 | 10/1 |
| lib/universal.js | 1.00 | 1/0 |
| lib/unsupported-api.js | 1.00 | 4/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 🔴 Critical | 186 | 152 | 34 | lib/rules, lib/linter |
| 🟠 High | 307 | 133 | 174 | lib/rules, lib/linter |
| 🟡 Medium | 1118 | 181 | 937 | lib/rules, lib/linter |
| 🟢 Low | 381 | 0 | 381 | lib/linter/code-path-analysis, lib/linter |

### Function-Level Issue Details

| Issue Pattern | Functions Affected | Examples |
|---------------|-------------------|----------|
| Deep nesting | 505 | handleFixes (lib/rules/no-unused-vars.js), processOptions (lib/eslint/eslint-helpers.js) +503 more |
| Pure function | 244 | <anonymous> (lib/config/config.js), verifyAndFix (lib/linter/linter.js) +242 more |
| Size | 182 | handleFixes (lib/rules/no-unused-vars.js), processOptions (lib/eslint/eslint-helpers.js) +180 more |
| Long function | 182 | handleFixes (lib/rules/no-unused-vars.js), processOptions (lib/eslint/eslint-helpers.js) +180 more |
| Complexity | 141 | handleFixes (lib/rules/no-unused-vars.js), processOptions (lib/eslint/eslint-helpers.js) +139 more |

### File-Level Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Duplication | 192 | 1.4x threshold |
| Complexity | 185 | 2.1x threshold |
| Size | 89 | 1.4x threshold |

## 📈 Analyse des Patterns

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 505 | Hard to read and test |
| Long Function | 182 | Should be split into smaller functions |
| High Complexity | 61 | Error-prone and hard to maintain |
| Too Many Params | 6 | Consider using object parameters |
| God Function | 3 | Violates Single Responsibility |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Pure Function | 244 | Predictable and testable |
| Well Named | 96 | Self-documenting code |
| Single Responsibility | 65 | Clean separation of concerns |

### 🏗️ Architectural Characteristics

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Async Heavy | 41 | Ensure proper error handling |


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
