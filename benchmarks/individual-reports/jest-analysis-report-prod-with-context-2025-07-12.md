# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-12T21:46:35.616Z
- **Duration:** 29.16s
- **Files Analyzed:** 388
- **Tool Version:** 0.6.1

## Quality Overview

### Grade: ⚠️ **C**

**115 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 55/100 | 🔴 Critical |
| Duplication | 99/100 (2.4% detected) | 🟢 Excellent |
| Maintainability | 74/100 | 🟡 Good |
| **Overall** | **72/100** | **🟡 Good** |

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
| Total Files | 388 |
| Total Lines of Code | 44,580 |
| Average Complexity | 16.9 |
| Average LOC per File | 115 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 229 | 59% |
| 🟡 Good (70-89) | 32 | 8% |
| 🟠 Moderate (50-69) | 12 | 3% |
| 🔴 Poor (<50) | 115 | 30% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| jest-mock/src/index.ts | 0% | 3 (2 crit, 1 high) | Extreme complexity (193) |
| jest-runtime/src/index.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (330) |
| expect/src/spyMatchers.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (80) |
| jest-worker/src/workers/processChild.ts | 0% | 2 (2 crit, 0 high) | Very High complexity (43) |
| pretty-format/src/index.ts | 0% | 4 (1 crit, 3 high) | Extreme complexity (119) |
| jest-config/src/normalize.ts | 0% | 3 (1 crit, 2 high) | Extreme complexity (146) |
| jest-diff/src/cleanupSemantic.ts | 0% | 3 (1 crit, 2 high) | Extreme complexity (93) |
| jest-core/src/watch.ts | 0% | 3 (1 crit, 2 high) | Extreme complexity (67) |
| jest-runner/src/runTest.ts | 0% | 3 (1 crit, 2 high) | Very High complexity (40) |
| jest-cli/src/args.ts | 3% | 3 (1 crit, 2 high) | Very High complexity (27) |

*⭐ indicates emblematic/core files*

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| jest-jasmine2/src/types.ts | 12 | 100th percentile | Type definitions |
| jest-worker/src/types.ts | 12 | 100th percentile | Type definitions |
| jest-jasmine2/src/jasmine/Spec.ts | 10 | 99th percentile | Core module |
| jest-reporters/src/types.ts | 9 | 99th percentile | Type definitions |
| pretty-format/src/types.ts | 9 | 99th percentile | Type definitions |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| babel-jest/src/index.ts | 1.00 | 1/0 |
| create-jest/src/index.ts | 1.00 | 1/0 |
| create-jest/src/runCreate.ts | 0.83 | 5/1 |
| expect/src/index.ts | 1.00 | 7/0 |
| jest-changed-files/src/index.ts | 1.00 | 4/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 105 | jest-reporters/src, expect/src |
| 🟠 High | 81 | jest-core/src, jest-config/src |
| 🟡 Medium | 76 | jest-core/src, jest-circus/src |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 186 | 2.1x threshold |
| Size | 58 | 1.5x threshold |
| Duplication | 18 | 1.4x threshold |

## Actionable Recommendations

### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `jest-worker/src/workers/NodeThreadsWorker.ts` (Size: 149% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `jest-environment-node/src/index.ts` (Size: 145% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `jest-core/src/runJest.ts` (Size: 143% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `babel-jest/src/index.ts` (Complexity: 140% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.

- **File:** `jest-console/src/NullConsole.ts` (Complexity: 140% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.


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
