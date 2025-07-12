# InsightCode Analysis Report: uuid

## Project Information

- **Name:** uuid
- **Type:** utility library
- **Repository:** https://github.com/uuidjs/uuid.git
- **Version:** v11.1.0
- **Stars:** 15k
- **Category:** small

## Analysis Context

- **Timestamp:** 2025-07-12T21:46:31.874Z
- **Duration:** 25.43s
- **Files Analyzed:** 29
- **Tool Version:** 0.6.1

## Quality Overview

### Grade: 🌟 **A**

**5 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 95/100 | 🟢 Excellent |
| Duplication | 95/100 (8.3% detected) | 🟢 Excellent |
| Maintainability | 100/100 | 🟢 Excellent |
| **Overall** | **97/100** | **🟢 Excellent** |

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
| Total Files | 29 |
| Total Lines of Code | 978 |
| Average Complexity | 4.6 |
| Average LOC per File | 34 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 20 | 69% |
| 🟡 Good (70-89) | 4 | 14% |
| 🟠 Moderate (50-69) | 0 | 0% |
| 🔴 Poor (<50) | 5 | 17% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| src/v3.ts | 0% | 1 (1 crit, 0 high) | Extreme duplication (69%) |
| src/v5.ts | 0% | 1 (1 crit, 0 high) | Extreme duplication (69%) |
| src/v1.ts | 50% | 1 (1 crit, 0 high) | Very High complexity (21) |
| src/md5.ts | 31% | 1 (0 crit, 1 high) | Extreme duplication (50%) |
| src/sha1.ts | 31% | 1 (0 crit, 1 high) | Extreme duplication (50%) |
| src/md5-browser.ts | 70% | 1 (0 crit, 1 high) | Multiple quality issues |

*⭐ indicates emblematic/core files*

## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| src/types.ts | 10 | 100th percentile | Type definitions |
| src/stringify.ts | 8 | 96th percentile | Core module |
| src/parse.ts | 4 | 89th percentile | Core module |
| src/validate.ts | 4 | 89th percentile | Core module |
| src/rng.ts | 3 | 82th percentile | Core module |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| src/index.ts | 1.00 | 15/0 |
| src/uuid-bin.ts | 1.00 | 6/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 3 | src |
| 🟠 High | 3 | src |
| 🟡 Medium | 5 | src |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 7 | 1.2x threshold |
| Duplication | 4 | 1.5x threshold |

## Actionable Recommendations

### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `src/sha1-browser.ts` (Complexity: 130% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.

- **File:** `src/v4.ts` (Complexity: 130% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.

- **File:** `src/v7.ts` (Complexity: 120% over threshold)
  - **Suggestion:** Quick refactor to reduce complexity - achievable in under an hour.

- **File:** `src/v35.ts` (Complexity: 110% over threshold)
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
