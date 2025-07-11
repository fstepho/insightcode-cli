# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Analysis Context

- **Timestamp:** 2025-07-11T18:26:23.149Z
- **Duration:** 24.10s
- **Files Analyzed:** 388
- **Tool Version:** 0.6.0

## Quality Overview

### Grade: ⚠️ **C**

**136 critical files found requiring attention**

### Quality Scores

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 57/100 | 🔴 Critical |
| Duplication | 97/100 (3.6% detected) | 🟢 Excellent |
| Maintainability | 66/100 | 🟠 Needs Improvement |
| **Overall** | **70/100** | **🟡 Good** |

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
| Total Files | 388 |
| Total Lines of Code | 44,567 |
| Average Complexity | 15.2 |
| Average LOC per File | 115 |

## File Health Distribution

| Health Status | Count | Percentage |
|---------------|-------|------------|
| 🟢 Excellent (90-100) | 234 | 60% |
| 🟡 Good (70-89) | 38 | 10% |
| 🟠 Moderate (50-69) | 17 | 4% |
| 🔴 Poor (<50) | 99 | 26% |

## Critical Files Requiring Attention

| File | Health | Issues (Crit/High) | Primary Concern |
|------|--------|--------------------|----------------|
| packages/babel-plugin-jest-hoist/src/index.ts | 0% | 2 (1 crit, 1 high) | Very High complexity (49) |
| packages/diff-sequences/src/index.ts | 0% | 2 (1 crit, 1 high) | Extreme complexity (73) |
| packages/expect/src/asymmetricMatchers.ts | 0% | 2 (1 crit, 1 high) | Extreme complexity (60) |
| packages/expect/src/matchers.ts | 0% | 2 (1 crit, 1 high) | Extreme complexity (90) |
| packages/expect/src/spyMatchers.ts | 0% | 2 (2 crit, 0 high) | Extreme complexity (169) |
| packages/expect/src/toThrowMatchers.ts | 0% | 2 (1 crit, 1 high) | Extreme complexity (90) |
| packages/expect-utils/src/utils.ts | 0% | 2 (1 crit, 1 high) | Extreme complexity (107) |
| packages/jest-config/src/normalize.ts | 0% | 2 (1 crit, 1 high) | Extreme complexity (257) |
| packages/jest-core/src/TestNamePatternPrompt.ts | 0% | 1 (1 crit, 0 high) | Extreme duplication (61%) |
| packages/jest-core/src/TestPathPatternPrompt.ts | 0% | 1 (1 crit, 0 high) | Extreme duplication (61%) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues |
|:---|:---|:---|:---|:---|
| `normalize` | `packages/jest-config/src/normalize.ts` | **197** | 698 | high-complexity, long-function, deep-nesting |
| `<anonymous>` | `packages/jest-config/src/normalize.ts` | **138** | 397 | high-complexity, long-function, deep-nesting |
| `jasmineEnv` | `packages/jest-jasmine2/src/jasmine/Env.ts` | **52** | 661 | high-complexity, long-function, deep-nesting |
| `eventHandler` | `packages/jest-circus/src/eventHandler.ts` | **51** | 284 | high-complexity, long-function, deep-nesting |
| `eq` | `packages/expect-utils/src/jasmineUtils.ts` | **47** | 145 | high-complexity, long-function, deep-nesting |

## 📈 Code Pattern Analysis

### ❗ Anti-Patterns & Code Smells

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 103 | Hard to read and test |
| Long Function | 76 | Should be split into smaller functions |
| High Complexity | 46 | Error-prone and hard to maintain |
| Too Many Params | 10 | Consider using object parameters |

### ✅ Good Practices Detected

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Type Safe | 132 | Reduces runtime errors |
| Error Handling | 51 | Good defensive programming |
| Async Heavy | 32 | Ensure proper error handling |



## Dependency Analysis

### Hub Files (High Impact)

| File | Incoming Deps | Usage Rank | Role |
|------|---------------|------------|------|
| packages/jest-jasmine2/src/types.ts | 12 | 100th percentile | Type definitions |
| packages/jest-worker/src/types.ts | 12 | 100th percentile | Type definitions |
| packages/jest-jasmine2/src/jasmine/Spec.ts | 10 | 99th percentile | Core module |
| packages/jest-reporters/src/types.ts | 9 | 99th percentile | Type definitions |
| packages/pretty-format/src/types.ts | 9 | 99th percentile | Type definitions |

### Highly Unstable Files

| File | Instability | Outgoing/Incoming |
|------|-------------|-------------------|
| packages/babel-jest/src/index.ts | 1.00 | 1/0 |
| packages/create-jest/src/index.ts | 1.00 | 1/0 |
| packages/create-jest/src/runCreate.ts | 0.83 | 5/1 |
| packages/expect/src/index.ts | 1.00 | 7/0 |
| packages/expect-utils/src/index.ts | 1.00 | 3/0 |

## Issue Analysis

### Issue Summary

| Severity | Count | Top Affected Areas |
|----------|-------|-------------------|
| 🔴 Critical | 92 | packages/jest-core/src, packages/jest-reporters/src |
| 🟠 High | 73 | packages/jest-config/src, packages/jest-core/src |
| 🟡 Medium | 58 | packages/jest-core/src, packages/jest-jasmine2/src/jasmine |

### Most Common Issue Types

| Issue Type | Occurrences | Typical Threshold Excess |
|------------|-------------|-------------------------|
| Complexity | 137 | 2.0x threshold |
| Size | 58 | 1.5x threshold |
| Duplication | 28 | 1.3x threshold |

## Code Quality Patterns

### Detected Patterns Summary

#### Quality Patterns
| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Deep Nesting | 103 | Hard to read and test |
| Long Function | 76 | Should be split into smaller functions |
| High Complexity | 46 | Error-prone and hard to maintain |
| Too Many Params | 10 | Consider using object parameters |

#### Architecture Patterns
| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Type Safe | 132 | Reduces runtime errors |
| Error Handling | 51 | Good defensive programming |
| Async Heavy | 32 | Ensure proper error handling |

### Most Complex Functions

| Function | Complexity | Lines | Issues |
|----------|------------|-------|--------|
| normalize | 197 | 698 | high-complexity, long-function, deep-nesting |
| <anonymous> | 138 | 397 | high-complexity, long-function, deep-nesting |
| jasmineEnv | 52 | 661 | high-complexity, long-function, deep-nesting |
| eventHandler | 51 | 284 | high-complexity, long-function, deep-nesting |
| eq | 47 | 145 | high-complexity, long-function, deep-nesting |

## Actionable Recommendations

### 🟢 Quick Wins (< 1 hour each)

These issues are relatively simple to fix and will quickly improve overall quality:

- **File:** `packages/jest-worker/src/workers/NodeThreadsWorker.ts` (Size: 149% over threshold)
  - 🎯 **Focus Function:** `initialize` (Complexity: 12)
  - **Suggestion:** Addressing this function will help reduce the file's size issues.

- **File:** `packages/jest-jasmine2/src/jasmine/SpyStrategy.ts` (Duplication: 148% over threshold)
  - **Suggestion:** Quick refactor to reduce duplication - achievable in under an hour.

- **File:** `packages/jest-environment-node/src/index.ts` (Size: 145% over threshold)
  - **Suggestion:** Quick refactor to reduce size - achievable in under an hour.

- **File:** `packages/jest-core/src/runJest.ts` (Size: 143% over threshold)
  - 🎯 **Focus Function:** `runJest` (Complexity: 22)
  - **Suggestion:** Addressing this function will help reduce the file's size issues.

- **File:** `packages/jest-haste-map/src/worker.ts` (Complexity: 140% over threshold)
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
- **Research Base:** ISO/IEC 25010, Fowler Technical Debt, Pareto Principle - extreme values dominate

### Health Score Formula
- **Base:** 100 points minus penalties
- **Penalties:** Progressive (linear then exponential) - NO LOGARITHMIC MASKING
- **Caps:** NO CAPS - extreme values receive extreme penalties (following Pareto principle)
- **Purpose:** Identify real problems following Pareto principle (80/20)
