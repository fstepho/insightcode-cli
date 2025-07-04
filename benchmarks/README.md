# InsightCode Benchmarks Documentation

This directory contains benchmark results and analysis of popular open-source projects.

## 🎯 Purpose

- Validate InsightCode's scoring algorithm
- Demonstrate real-world performance
- Provide reference scores for comparison
- Build credibility through transparent analysis

## 📊 Latest Results

The most recent benchmark results are generated by running:
```bash
npm run benchmark              # Full codebase analysis
npm run benchmark -- --prod    # Production code only
```

Results are saved to `benchmark-results/` and significant results are archived here.

## 📐 Methodology

### Scoring System (v0.3.0+)

InsightCode uses graduated thresholds aligned with industry standards:

#### Complexity (40% weight)
- ≤10: 100 points (Excellent)
- ≤15: 85 points (Good)
- ≤20: 65 points (Acceptable)
- ≤30: 40 points (Poor)
- ≤50: 20 points (Very Poor)
- >50: Graduated penalty

#### Duplication (30% weight)
- ≤3%: 100 points (Industry leader)
- ≤8%: 85 points (Industry standard)
- ≤15%: 65 points (Acceptable)
- ≤30%: 40 points (Poor)
- ≤50%: 20 points (Very Poor)

#### Maintainability (30% weight)
- Based on file size (≤200 lines = 100 points)
- Function count consideration
- Additional penalties for files >1000 lines

### Measurement Accuracy

#### Complexity Calculation
- **Method**: Extended Cyclomatic Complexity (based on McCabe, 1976)
- **Accuracy**: 100% validated with comprehensive test suite
- **Base**: Every file starts at complexity 1
- **+1 for each**:
  - `if`, `else if` (but NOT `else` alone)
  - `for`, `while`, `do-while`, `for-in`, `for-of`
  - `case` in switch (but NOT `default`)
  - `catch` in try-catch
  - `&&`, `||` (logical operators as decision points)*
  - `? :` (ternary operator)
- **Calculation**: Sum of all decision points in the entire file

*Logical operators are counted because they represent implicit branching in the control flow

#### Duplication Detection
- **Method**: 5-line sliding window with content-based detection
- **Philosophy**: Focuses on actual copy-paste, not structural similarity
- **Accuracy**: ~85% conservative approach (prefers false negatives over false positives)
- **Note**: Our approach differs from tools like SonarQube - see examples below

### Analysis Types

#### Full Codebase Analysis
- Includes all files: production, tests, examples, configs
- Provides complete picture of project health
- Best for overall quality assessment

#### Production Code Analysis (--exclude-utility)
- Excludes: tests, examples, scripts, tools, fixtures, mocks
- Focuses on code that runs in production
- Often reveals cleaner metrics as test code tends to have repetition

## 📈 Key Findings (v0.3.0 - June 28, 2025)

### Score Distribution
Based on analysis of 19 popular projects with new graduated scoring:

**Full Codebase Analysis:**
- **1 project** got an A grade (5%) - chalk
- **8 projects** got a B grade (42%)
- **4 projects** got a C grade (21%)
- **2 projects** got a D grade (11%)
- **4 projects** got an F grade (21%)

**Production Code Only:**
- **3 projects** got an A grade (16%) - axios, chalk, prettier
- **4 projects** got a B grade (21%)
- **4 projects** got a C grade (21%)
- **2 projects** got a D grade (11%)
- **6 projects** got an F grade (32%)

### Performance Statistics
- **Full codebase analysis**: 62,761 lines/second average
- **Production only**: 18,490 lines/second average
- **Largest analyzed**: TypeScript (2.8M lines) in 38.3 seconds
- **Total lines analyzed**: 4.8M+ across all benchmarks

### Notable Insights

1. **Chalk** achieves A grade (96/100) in full codebase analysis - exceptional code quality
2. **Axios** jumps from B to A when analyzing production code only
3. **Even popular projects struggle**: ESLint gets D, Joi gets F
4. **Test code impacts scores**: Many projects improve when excluding tests
5. **Size doesn't determine quality**: Small projects can have poor scores too

## 🔍 Understanding the Results: Context Matters

### Case Study: Lodash's Deliberate Monolithic Design

While InsightCode correctly identifies Lodash's main file as having excessive complexity (1659), it's important to understand this is a **deliberate architectural choice**, not poor engineering.

#### Historical Context

Lodash was designed in the early 2010s with specific goals:

1. **Universal Compatibility**
   - Single file works in all environments (browsers, Node.js, Rhino)
   - No module system required (pre-ES6 modules era)
   - One `<script>` tag for browser usage

2. **Performance Optimization**
   - Single file = single HTTP request (critical in 2010-2015)
   - Bundlers were primitive, tree-shaking didn't exist
   - CDN-friendly distribution

3. **Developer Experience First**
   ```javascript
   // The simplicity users love
   <script src="lodash.js"></script>
   // Everything available under _ immediately
   ```

#### The Trade-off

Lodash chose **user simplicity over maintainer convenience**:
- ✅ Zero configuration for users
- ✅ Works everywhere instantly  
- ✅ Backward compatibility maintained
- ❌ High complexity score (1659)
- ❌ Difficult internal navigation
- ❌ Challenging to maintain

#### Modern Alternative

Lodash does offer modular imports:
```javascript
// Modern usage
import map from 'lodash/map'
import filter from 'lodash/filter'
```

But the monolithic build remains for the millions of projects depending on it.

#### Key Insight

**An F score doesn't always mean bad code** - sometimes it reflects deliberate architectural trade-offs. Lodash prioritized:
- User experience > Developer experience  
- Compatibility > Modularity
- Simplicity > Maintainability

When analyzing code quality, consider the historical context and business constraints that shaped these decisions.

> **Important Limitation**  
> The overall score given by InsightCode does not distinguish between avoidable structural complexity (due to poor code organization) and justified complexity (required by the project’s algorithmic, performance, or compatibility needs). This lack of context can unfairly downgrade mature or critical projects and may encourage inappropriate refactoring. To make this benchmark truly reliable and recommendable, it is essential to integrate differentiation or weighting for legitimate complexity, in order to provide a relevant and actionable assessment of code quality.

## 📁 Historical Benchmarks

Significant benchmark results are archived with dates:
- `benchmark-2025-06-28.md` - v0.3.0 full codebase analysis with graduated scoring
- `benchmark-2025-06-28-production-only.md` - Production code analysis
- `benchmark-2025-06-27.md` - v0.1.0 initial benchmarks
- `benchmark-explanations-comparison-2025-06-28.md` - Detailed complexity explanations

## 🔄 Duplication Detection Philosophy

### InsightCode vs SonarQube: A Different Approach

Our duplication detection focuses on **actionable copy-paste problems**, not structural patterns:

| Tool | Approach | lodash/perf.js Result | Philosophy |
|------|----------|----------------------|------------|
| **SonarQube** | Token/Structure-based | 70.4% duplication | "This code has repetitive structure" |
| **InsightCode** | Content-based | 6% duplication | "This code has actual copy-paste" |

Example - benchmark suites naturally have repetitive structure:
```javascript
// This pattern repeated 100+ times is NOT duplication for us
suites.push(Benchmark.Suite('`_.map`'))
suites.push(Benchmark.Suite('`_.filter`'))
// Different methods = different code, even if structure is similar
```

We believe this approach provides more actionable insights for refactoring decisions.

---

*For detailed methodology and academic justification, see [SCORING_THRESHOLDS_JUSTIFICATION.md](../docs/SCORING_THRESHOLDS_JUSTIFICATION.md)*