# InsightCode Analysis Report: jest

## Project Information

- **Name:** jest
- **Type:** testing framework
- **Repository:** https://github.com/jestjs/jest.git
- **Version:** v30.0.4
- **Stars:** 44.8k
- **Category:** medium

## Quality Summary

### Grade: 🔴 **D**

With a grade of **D**, **@jest/monorepo** is a **requiring immediate attention** project. Our analysis identifies the **`jest-runtime`** module as the primary technical debt concentration. Key concerns include `jest-runtime/src/index.ts` (health score: 0%). The most prevalent issues are **god functions** (54% of all issues) followed by **multiple responsibilities**. 

**🎯 Strategic recommendation:** Focus Phase 1 efforts on stabilizing the `jest-runtime` module. Prioritize implementing **Split this 287 LOC file into smaller modules (medium size issue)** on `jest-core/src/runJest.ts` and refactoring the high-complexity function **`resolveModule`** (complexity: 27) for maximum impact.

| Dimension | Score (Value) | Status |
|:---|:---|:---|
| Complexity | 66/100 | 🟠 Poor |
| Duplication | 98/100 (1.6% detected) | 🟢 Exceptional |
| Maintainability | 61/100 | 🟠 Poor |
| Reliability | 36/100 | 🔴 Critical |
| **Overall** | **65/100** | **🟠 Poor** |
## 🚀 Quick Wins Analysis

**Summary:**
- **Total potential score gain:** +2964 points
- **Quick wins identified:** 440
- **Immediate wins (< 30min):** 79
- **Estimated total effort:** 832.3 hours

### 📊 ROI Methodology
**ROI Definition**: Return on Investment for code quality improvements
- **Formula**: ROI = Health Score Points ÷ Implementation Hours
- **Unit**: Health Points per Hour (HPH)
- **Examples**: ROI 12 = Simple nesting fix (5 levels), ROI 2.5 = Complex refactoring (15+ levels)
- **Effort Factors**: Complexity depth, architectural criticality, and function length
- **Uncertainty**: Estimates include ±25% to ±55% uncertainty range

### Quick wins Executive Summary

**Total Potential Score Gain: +2964 points**

| Metric | Value |
|--------|-------|
| Quick Wins Identified | 440 |
| Immediate Wins (< 30min) | 79 |
| Estimated Total Effort | 832.3 hours |
| Average ROI | 5.2 |

### 🎯 Top 10 Quick Wins by ROI

| Priority | File | Action | Criticality | Score Gain | Effort | ROI (HPH ±%) |
|----------|------|--------|-------------|------------|--------|--------------|
| 🔴 | `jest-core/src/runJest.ts` | Split this 287 LOC file into smaller modules (medium size issue) | 📝 Isolated | +39 | ~2h | 19.5 ±50% |
| 🔴 | `.../crawlers/watchman.ts` | Split this 259 LOC file into smaller modules (medium size issue) | 📝 Isolated | +39 | ~2h | 19.5 ±50% |
| 🔴 | `.../cli/index.ts` | Split this 264 LOC file into smaller modules (medium size issue) | 📝 Isolated | +38 | ~2h | 19.0 ±50% |
| 🔴 | `.../crawlers/node.ts` | Split this 206 LOC file into smaller modules (medium size issue) | 📝 Isolated | +32 | ~2h | 16.0 ±50% |
| 🔴 | `babel-jest/src/index.ts` | Split this 246 LOC file into smaller modules (medium size issue) | 📝 Isolated | +31 | ~2h | 15.5 ±50% |
| 🔴 | `jest-reporters/src/DefaultReporter.ts` | Split this 210 LOC file into smaller modules (medium size issue) | 📝 Isolated | +31 | ~2h | 15.5 ±50% |
| 🔴 | `jest-core/src/SnapshotInteractiveMode.ts` | Split this 204 LOC file into smaller modules (medium size issue) | 📝 Isolated | +30 | ~2h | 15.0 ±50% |
| 🔴 | `jest-haste-map/src/ModuleMap.ts` | Split this 225 LOC file into smaller modules (medium size issue) | 📝 Isolated | +28 | ~2h | 14.0 ±50% |
| 🔴 | `jest-circus/src/index.ts` | Split this 224 LOC file into smaller modules (medium size issue) | 📝 Isolated | +27 | ~2h | 13.5 ±50% |
| 🔴 | `.../legacy-code-todo-rewrite/jestAdapterInit.ts` | Split this 245 LOC file into smaller modules (medium size issue) | 📝 Isolated | +27 | ~2h | 13.5 ±50% |

## 📊 Problem Patterns Breakdown

### • God Functions (238 wins, 54%)

Functions handling multiple distinct responsibilities (thresholds: 1-689)

**Statistics:**
- Count: 238 wins
- Total potential gain: +1201 points
- Average gain per fix: +5 points
- Average effort: [37mModerate[39m

**Most affected files:**
- `jest-runtime/src/index.ts`
- `jest-transform/src/ScriptTransformer.ts`
- `jest-haste-map/src/index.ts`

**Strategic implication:** 238 issues spread across various file types indicate systemic code quality concerns.

---

### • Multiple Responsibilities (60 wins, 14%)

Code mixing different concerns or domains (thresholds: 5-226)

**Statistics:**
- Count: 60 wins
- Total potential gain: +798 points
- Average gain per fix: +13 points
- Average effort: [31m[1mComplex[22m[39m

**Most affected files:**
- `jest-runtime/src/index.ts`
- `diff-sequences/src/index.ts`
- `jest-diff/src/cleanupSemantic.ts`

**Strategic implication:** 60 issues spread across various file types indicate systemic code quality concerns.

---

### • Large Files (55 wins, 13%)

Files exceeding optimal size thresholds (thresholds: 15-999)

**Statistics:**
- Count: 55 wins
- Total potential gain: +657 points
- Average gain per fix: +12 points
- Average effort: [31mHard[39m

**Most affected files:**
- `jest-environment-node/src/index.ts`
- `jest-core/src/runJest.ts`
- `jest-haste-map/src/crawlers/watchman.ts`

**Strategic implication:** 55 issues spread across various file types indicate systemic code quality concerns.

---

### • Poorly Named (59 wins, 13%)

Code quality improvement opportunity (thresholds: 0-43)

**Statistics:**
- Count: 59 wins
- Total potential gain: +177 points
- Average gain per fix: +3 points
- Average effort: [32mTrivial[39m

**Most affected files:**
- `expect/src/asymmetricMatchers.ts`
- `jest-reporters/src/GitHubActionsReporter.ts`
- `jest-environment-node/src/index.ts`

**Strategic implication:** 59 issues spread across various file types indicate systemic code quality concerns.

---

### • Parameter Overload (17 wins, 4%)

Functions with excessive parameter count (thresholds: 3-11)

**Statistics:**
- Count: 17 wins
- Total potential gain: +57 points
- Average gain per fix: +3 points
- Average effort: [33mEasy[39m

**Most affected files:**
- `diff-sequences/src/index.ts`
- `pretty-format/src/plugins/Immutable.ts`
- `jest-core/src/runJest.ts`

**Strategic implication:** 17 issues spread across various file types indicate systemic code quality concerns.

---

### • Control Flow Complexity (11 wins, 3%)

Nested control structures reducing readability (thresholds: 3-13)

**Statistics:**
- Count: 11 wins
- Total potential gain: +74 points
- Average gain per fix: +7 points
- Average effort: [37mModerate[39m

**Most affected files:**
- `jest-mock/src/index.ts`
- `expect/src/spyMatchers.ts`
- `jest-config/src/normalize.ts`

**Strategic implication:** 11 issues spread across various file types indicate systemic code quality concerns.

---


## ✅ Standard Quick Wins
*Good ROI improvements on moderate impact files - ideal for new contributors*

#### 1. Split this 287 LOC file into smaller modules (medium size issue)

- **Location**: `jest-core/src/runJest.ts` (line 1)
- **Current**: 287 → **Target**: 200
- **Score Gain**: +39 points
- **Effort**: ~2h
- **ROI**: 19.5 HPH (±50%)

#### 2. Split this 259 LOC file into smaller modules (medium size issue)

- **Location**: `jest-haste-map/src/crawlers/watchman.ts` (line 1)
- **Current**: 259 → **Target**: 200
- **Score Gain**: +39 points
- **Effort**: ~2h
- **ROI**: 19.5 HPH (±50%)

#### 3. Split this 264 LOC file into smaller modules (medium size issue)

- **Location**: `jest-core/src/cli/index.ts` (line 1)
- **Current**: 264 → **Target**: 200
- **Score Gain**: +38 points
- **Effort**: ~2h
- **ROI**: 19.0 HPH (±50%)

#### 4. Split this 206 LOC file into smaller modules (medium size issue)

- **Location**: `jest-haste-map/src/crawlers/node.ts` (line 1)
- **Current**: 206 → **Target**: 200
- **Score Gain**: +32 points
- **Effort**: ~2h
- **ROI**: 16.0 HPH (±50%)

#### 5. Split this 246 LOC file into smaller modules (medium size issue)

- **Location**: `babel-jest/src/index.ts` (line 1)
- **Current**: 246 → **Target**: 200
- **Score Gain**: +31 points
- **Effort**: ~2h
- **ROI**: 15.5 HPH (±50%)


## 📅 Implementation Roadmap

### Phase 1: Quick Wins (79 tasks, ~19.8h)
**Potential gain: +251 points**

Focus on:
- [ ] Rename 'asymmetricMatch' to use more descriptive name in `expect/src/asymmetricMatchers.ts` (+3)
- [ ] Rename 'asymmetricMatch' to use more descriptive name in `expect/src/asymmetricMatchers.ts` (+3)
- [ ] Rename 'asymmetricMatch' to use more descriptive name in `expect/src/asymmetricMatchers.ts` (+3)
- [ ] Rename 'asymmetricMatch' to use more descriptive name in `expect/src/asymmetricMatchers.ts` (+3)
- [ ] Rename 'emptyObject' to use more descriptive name in `expect-utils/src/utils.ts` (+3)

### Phase 2: Medium Effort (155 tasks, ~155h)
**Potential gain: +820 points**

Key refactorings:
- [ ] Split runCreate into single-responsibility functions (3 responsibilities detected) in `create-jest/src/runCreate.ts` (+8)
- [ ] Split getObjectSubset into single-responsibility functions (2 responsibilities detected) in `expect-utils/src/utils.ts` (+8)
- [ ] Split readConfigs into single-responsibility functions (2 responsibilities detected) in `jest-config/src/index.ts` (+8)
- [ ] Split setupPreset into single-responsibility functions (3 responsibilities detected) in `jest-config/src/normalize.ts` (+8)
- [ ] Split normalizeRootDir into single-responsibility functions (2 responsibilities detected) in `jest-config/src/normalize.ts` (+8)

### Phase 3: Major Refactorings (206 tasks, ~618h)
**Potential gain: +1893 points**

Strategic improvements:
- [ ] Split this 287 LOC file into smaller modules (medium size issue) in `jest-core/src/runJest.ts` (+39)
- [ ] Split this 259 LOC file into smaller modules (medium size issue) in `.../crawlers/watchman.ts` (+39)
- [ ] Split this 264 LOC file into smaller modules (medium size issue) in `.../cli/index.ts` (+38)
## Analysis Context

- **Timestamp:** 2025-08-15T09:55:33.795Z
- **Duration:** 288.80s
- **Files Analyzed:** 388
- **Tool Version:** 0.8.0

## Key Statistics

| Metric | Value |
|--------|-------|
| Total Files | 388 |
| Total Lines of Code | 44,953 |
| Average Complexity | 17.5 |
| Average LOC per File | 116 |

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
| 🟢 Excellent (A: 90-100) | 218 | 56% |
| 🟢 Very Good (B: 80-89) | 21 | 5% |
| 🟡 Good (C: 70-79) | 15 | 4% |
| 🟠 Moderate (D: 60-69) | 9 | 2% |
| 🔴 Poor (F: <60) | 125 | 32% |

## Critical Files Requiring Attention

| File | Health | Criticism | Primary Concern |
|------|--------|-----------|------------------|
| jest-runtime/src/index.ts | 0% | 🟢 Low | Extreme complexity (336) |
| jest-mock/src/index.ts | 0% | 🟢 Low | Extreme complexity (195) |
| expect/src/spyMatchers.ts | 0% | 🟢 Low | Extreme complexity (80) |
| jest-resolve/src/resolver.ts | 0% | 🟢 Low | Extreme complexity (167) |
| jest-haste-map/src/index.ts | 0% | 🟢 Low | Extreme complexity (140) |
| jest-transform/src/ScriptTransformer.ts | 0% | 🟢 Low | Extreme complexity (135) |

*⭐ indicates emblematic/core files*

## 🎯 Deep Dive: Key Function Analysis

| Function | File | Complexity | Lines | Key Issues|
|:---|:---|:---|:---|:---|
| `normalize` | `jest-config/src/normalize.ts` | **63** | 689 | **critical-complexity** : Complexity 63 exceeds critical threshold of 50<br/>**long-function** : Function has 689 lines, consider breaking into smaller functions |
| `eventHandler` | `jest-circus/src/eventHandler.ts` | **49** | 284 | **high-complexity** : Complexity 49 exceeds recommended threshold of 20<br/>**long-function** : Function has 284 lines, consider breaking into smaller functions<br/>**god-function** : Function does too much - Operations: 60 (complexity: 49, lines: 284) |
| `eq` | `expect-utils/src/jasmineUtils.ts` | **47** | 138 | **high-complexity** : Complexity 47 exceeds recommended threshold of 20<br/>**long-function** : Function has 138 lines, consider breaking into smaller functions<br/>**god-function** : Function does too much - Operations: 65 (complexity: 47, lines: 138) |
| `iterableEquality` | `expect-utils/src/utils.ts` | **39** | 144 | **high-complexity** : Complexity 39 exceeds recommended threshold of 20<br/>**long-function** : Function has 144 lines, consider breaking into smaller functions<br/>**god-function** : Function does too much - Operations: 60 (complexity: 39, lines: 144)<br/>**deep-nesting** : Deep nesting detected (depth: 8), consider extracting sub-functions or using early returns |
| `joinAlignedDiffsNoExpand` | `jest-diff/src/joinAlignedDiffs.ts` | **35** | 169 | **high-complexity** : Complexity 35 exceeds recommended threshold of 20<br/>**long-function** : Function has 169 lines, consider breaking into smaller functions<br/>**god-function** : Function does too much - Operations: 73 (complexity: 35, lines: 169)<br/>**deep-nesting** : Deep nesting detected (depth: 6), consider extracting sub-functions or using early returns |

## Dependency Analysis

### Hub Files (High Impact)

*No significant hub files detected*

### Highly Unstable Files

*All files show good stability*

## Issue Analysis

### Issue Summary

| Severity | Count | File-Level | Function-Level | Top Affected Areas |
|----------|-------|------------|----------------|-------------------|
| 💀 Critical | 108 | 107 | 1 | jest-reporters/src, expect/src |
| 🔴 High | 215 | 64 | 151 | jest-core/src, jest-runtime/src |
| 🟠 Medium | 293 | 69 | 224 | jest-core/src, expect/src |
| 🟡 Low | 1039 | 12 | 1027 | jest-core/src, jest-runtime/src |

### File-Level Issue Types

| Issue Type | Occurrences | Threshold Excess | Implication |
|------------|-------------|------------------|-------------|
| Critical-file-complexity | 104 | 0.5x threshold | Review for best practices |
| Large-file | 55 | 1.5x threshold | Review for best practices |
| Complexity | 31 | 0.9x threshold | File is hard to understand and maintain |
| Too-many-functions | 30 | 1.8x threshold | Review for best practices |
| High-file-complexity | 17 | 0.9x threshold | Review for best practices |

### Function-Level Issue Types

| Issue Pattern | Occurrences | Most Affected Functions | Implication |
|---------------|-------------|-------------------------|-------------|
| Impure-function | 968 | `assertLoadedBabelConfig`, `getCacheKeyFromConfig`... | Side effects make testing harder |
| Long-function | 168 | `createTransformer`, `jestHoist`... | Should be split into smaller functions |
| Multiple-responsibilities | 81 | `runCreate`, `getObjectSubset`... | Clean separation of concerns |
| Poorly-named | 59 | `asymmetricMatch`, `asymmetricMatch`... | Names should be descriptive and meaningful |
| God-function | 49 | `createTransformer`, `runCreate`... | Violates Single Responsibility |

## 📈 Pattern Analysis

### 🎯 Quality Patterns

| Pattern | Occurrences | Implication |
|---------|-------------|-------------|
| Impure Function | 968 | Side effects make testing harder |
| Long Function | 168 | Should be split into smaller functions |
| Multiple Responsibilities | 81 | Clean separation of concerns |
| Poorly Named | 59 | Names should be descriptive and meaningful |
| God Function | 49 | Violates Single Responsibility |
| Medium Complexity | 26 | Consider refactoring for clarity |
| High Complexity | 23 | Error-prone and hard to maintain |
| Too Many Params | 17 | Consider using object parameters |
| Deep Nesting | 11 | Hard to read and test |
| Critical Complexity | 1 | Severely impacts maintainability |


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
