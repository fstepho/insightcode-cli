# InsightCode Analysis Report: uuid

## Project Information

- **Name:** uuid
- **Type:** utility library
- **Repository:** https://github.com/uuidjs/uuid.git
- **Version:** v11.1.0
- **Stars:** 15k
- **Category:** small

## Analysis Context

- **Timestamp:** 2025-07-14T19:23:00.429Z
- **Duration:** 71.74s
- **Files Analyzed:** 29
- **Tool Version:** 0.6.0

## Executive Summary

**Grade A (96/100)** - Excellent health.

**🚨 Primary Concern:** Extreme duplication (69%) in `src/v3.ts`.

**🎯 Priority Action:** Extract common code into reusable utilities

**📊 Additional Context:** 5 other files require attention.

## Quality Overview

### Grade: 🌟 **A**

**6 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 95/100 | 🟢 Excellent |
| Duplication | 94/100 (8.3% detected) | 🟢 Excellent |
| Maintainability | 100/100 | 🟢 Excellent |
| **Overall** | **96/100** | **🟢 Excellent** |

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
| Total Files | 29 |
| Total Lines of Code | 978 |
| Average Complexity | 4.6 |
| Average LOC per File | 34 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (A: 90-100) | 20 | 69% |
| 🟢 Very Good (B: 80-89) | 3 | 10% |
| 🟡 Good (C: 70-79) | 1 | 3% |
| 🟠 Moderate (D: 60-69) | 0 | 0% |
| 🔴 Poor (F: <60) | 5 | 17% |

## Critical Files Requiring Attention

| File | Health | Primary Concern & Recommendation |
|------|--------|-----------------------------------|
| src/v3.ts | 0% | Extreme duplication (69%) <br/> 🎯 **Action:** Extract common code into reusable utilities |
| src/v5.ts | 0% | Extreme duplication (69%) <br/> 🎯 **Action:** Extract common code into reusable utilities |
| src/v1.ts | 50% | Very High complexity (21) <br/> 🎯 **Action:** Break down into smaller, single-responsibility functions |
| src/md5.ts | 0% | Extreme duplication (50%) <br/> 🎯 **Action:** Extract common code into reusable utilities |
| src/sha1.ts | 0% | Extreme duplication (50%) <br/> 🎯 **Action:** Extract common code into reusable utilities |
| src/md5-browser.ts | 70% | Multiple quality issues <br/> 🎯 **Action:** Apply Single Responsibility Principle to decompose this file |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `v4` | `src/v4.ts` | **13** | 36 | complexity, deep-nesting, single-responsibility, well-named |
| `v35` | `src/v35.ts` | **9** | 42 | deep-nesting, single-responsibility |
| `v1Bytes` | `src/v1.ts` | **8** | 61 | size, long-function, too-many-params, deep-nesting, single-responsibility, pure-function |
| `sha1` | `src/sha1-browser.ts` | **7** | 89 | size, long-function, deep-nesting |
| `v1` | `src/v1.ts` | **7** | 53 | size, long-function, deep-nesting, pure-function, well-named |

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

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 🔴 Critical | 3 | 3 | 0 | src |
| 🟠 High | 3 | 3 | 0 | src |
| 🟡 Medium | 39 | 4 | 35 | src |
| 🟢 Low | 15 | 0 | 15 | src |

### Function-Level Issue Details

| Issue Pattern | Functions Affected | Examples |
|---------------|-------------------|----------|
| Deep nesting | 12 | v4 (src/v4.ts), v35 (src/v35.ts) +10 more |
| Well named | 10 | v4 (src/v4.ts), v1 (src/v1.ts) +8 more |
| Single responsibility | 7 | v4 (src/v4.ts), v35 (src/v35.ts) +5 more |
| Size | 5 | v1Bytes (src/v1.ts), sha1 (src/sha1-browser.ts) +3 more |
| Long function | 5 | v1Bytes (src/v1.ts), sha1 (src/sha1-browser.ts) +3 more |

### File-Level Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 6 | 1.2x threshold |
| Duplication | 4 | 1.5x threshold |

## 📈 Analyse des Patterns

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 12 | Hard to read and test |
| Long Function | 5 | Should be split into smaller functions |
| Too Many Params | 5 | Consider using object parameters |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Well Named | 10 | Self-documenting code |
| Single Responsibility | 7 | Clean separation of concerns |
| Pure Function | 5 | Predictable and testable |


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
