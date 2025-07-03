# InsightCode CLI

> TypeScript code quality analyzer that runs 100% locally. Get actionable metrics in seconds without sending any code to the cloud.

[![npm version](https://img.shields.io/npm/v/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)

## 📑 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📋 Requirements](#-requirements)
- [📊 Example Output](#-example-output)
- [📐 How It Works](#-how-it-works)
  - [What We Measure](#what-we-measure)
  - [Scoring System](#scoring-system)
  - [Smart Thresholds](#smart-thresholds)
- [🎯 Production Code Analysis](#-production-code-analysis)
- [🔧 CLI Options](#-cli-options)
  - [JSON Output Format](#json-output-format)
- [📚 Best Practices](#-best-practices)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📈 Why InsightCode?](#-why-insightcode)
- [🙏 Acknowledgments](#-acknowledgments)
- [📝 License](#-license)
- [🔗 Links](#-links)

## ✨ Features

- **🔒 100% Local** - Your code never leaves your machine
- **⚡ Fast** - Proven on large codebases (analyzes over 40,000 lines/sec)
- **🧠 Criticality-Aware Scoring** - Prioritizes issues based on file complexity and its architectural impact.
- **🎯 Actionable Metrics** - Focus on what matters: complexity, duplication, and maintainability.
- **🎨 Beautiful Output** - Clear, colorful terminal reports.

## 🚀 Quick Start

```bash
# Install globally
npm install -g insightcode-cli

# Analyze current directory
insightcode analyze

# Analyze specific path
insightcode analyze ./src

# Focus on production code only
insightcode analyze --exclude-utility

# Output JSON for CI/CD
insightcode analyze --json > report.json
```

## 📋 Requirements

- Node.js 18.0 or higher
- TypeScript/JavaScript projects

## 📊 Example Output

Real analysis of the **React** project using `insightcode analyze --exclude-utility react`:

```
🔍 Analyzing code quality...

  ┌──────────────────────────────────────────┐
  │                                          │
  │   📊   InsightCode Analysis Report   📊  │
  │                                          │
  └──────────────────────────────────────────┘
  

╭─ Project Overview ──────────────────────────────────
  Project:     react
  Files:       1381
  Total Lines: 197,953

╭─ Overall Code Quality Score ────────────────────────

    F   47.0/100


╭─ Core Metrics ──────────────────────────────────────
  Complexity:      ███████░░░░░░░░░░░░░  20.7 (High)
  Duplication:     ███████████░░░░░░░░░  44.2% (Very High)
  Maintainability: ███████████░░░░░░░░░  57/100 (Poor)

╭─ ⚠️ Top 5 Critical Files to Address ────────────────

  1. react/packages/react-reconciler/src/ReactFiberBeginWork.js
    Criticity Score: 459  |  Impact: 3 dependents
      🟠 High Complexity: 451 (23x above limit)
      🟠 Very Large File: 3,179 lines (11x above limit)
      🟠 High Duplication: 15.0% detected

  2. react/packages/react-reconciler/src/ReactFiberCommitWork.js
    Criticity Score: 801  |  Impact: 1 dependents
      🟠 High Complexity: 797 (40x above limit)
      🟠 Very Large File: 3,704 lines (12x above limit)

  3. react/packages/react-reconciler/src/ReactFiberWorkLoop.js
    Criticity Score: 669  |  Impact: 23 dependents
      🟠 High Complexity: 621 (31x above limit)
      🟠 Very Large File: 3,570 lines (12x above limit)

  4. react/packages/react-dom-bindings/src/client/ReactFiberConfigDOM.js
    Criticity Score: 747  |  Impact: 8 dependents
      🟠 High Complexity: 729 (36x above limit)
      🟠 Very Large File: 4,273 lines (14x above limit)

  5. react/compiler/packages/babel-plugin-react-compiler/src/HIR/BuildHIR.ts
    Criticity Score: 416  |  Impact: 0 dependents
      🟠 High Complexity: 414 (21x above limit)
      🟠 Very Large File: 3,883 lines (13x above limit)

╭─ 💡 Quick Wins to Improve Score ────────────────────
  › Refactor the 1 most complex file(s) for a potential gain of ~+3 pts.
  › Split the 3 largest file(s) for a potential gain of ~+8 pts.
  › Abstract repeated code in 727 file(s) for a potential gain of ~+6 pts.


──────────────────────────────────────────────────────────
  ✅ Analysis complete! Run regularly to maintain code quality.
     Report generated on 7/3/2025, 9:27:56 PM
```

## 📐 How It Works

InsightCode's analysis is built on a "criticality-first" philosophy. It first measures the fundamentals in each file, then uses project-wide context to weigh them based on their actual importance.

### What We Measure

#### 1. Cyclomatic Complexity
Counts decision points in your code. Based on McCabe's complexity metric (extended to include logical operators):
- **Base complexity**: Every file starts at 1
- **+1 for each**: `if`, `else if`, `for`, `while`, `switch case`, `catch`, `&&`, `||`, `? :`
- **Target**: ≤ 10 excellent, ≤ 15 good

```javascript
function validate(user) {              // Base: 1
  if (!user) return false;            // +1 for if
  if (user.age < 18) return false;    // +1 for if
  return user.active && user.verified; // +1 for &&
}                                      // Total: 4
```
#### 2. Code Duplication
Detects actual copy-paste duplication using pragmatic content analysis:
- **Algorithm**: 5-line sliding window with normalization
- **Philosophy**: Focus on refactorable duplication, not structural patterns
- **Target**: < 3% excellent, < 8% good

#### 3. Maintainability
Composite score based on file size and function density:
- **File size**: ≤ 200 lines excellent, ≤ 300 good
- **Function count**: ≤ 10 per file excellent, ≤ 15 good
- **Extreme penalty**: Files > 1000 lines get additional penalties

### Scoring Philosophy: Criticality Weighting
The final project score is a weighted average of individual file scores.

Instead of a fixed weight, the weight of each file is determined by its Criticality Score. This score is calculated from the file's own complexity combined with its Impact—how many other files in the project depend on it.

This means issues in important, highly-connected files will affect your final grade more, guiding you to fix what truly matters.

### Scoring System

InsightCode uses graduated thresholds aligned with industry standards:

| Grade | Score   | What it means                          |
|-------|---------|----------------------------------------|
| **A** | 90-100  | Exceptional! Keep it up                |
| **B** | 80-89   | Good, minor improvements possible      |
| **C** | 70-79   | Fair, consider refactoring             |
| **D** | 60-69   | Poor, needs attention                  |
| **F** | 0-59    | Critical, major refactoring needed     |

**Real-World Context**: Based on our [analysis of 9 popular projects](./benchmarks/):
- Grade B: Small, focused libraries (uuid, chalk).
- Grade D: Large projects with significant duplication (jest).
- Grade F: Complex frameworks, compilers, or linters (react, typescript, vue, eslint).

A low score doesn't mean the code is "bad," but that it presents significant maintenance challenges according to our metrics.

### Smart Thresholds

Different file types have different standards:

| File Type      | Complexity  | File Size   | Duplication |
|----------------|-------------|-------------|-------------|
| **Production** | ≤10 / ≤20  | ≤200 / ≤300 | ≤15% / ≤30% |
| **Test Files** | ≤15 / ≤30  | ≤300 / ≤500 | ≤25% / ≤50% |
| **Examples**   | ≤20 / ≤40  | ≤150 / ≤250 | ≤50% / ≤80% |

*Format: Medium threshold / High threshold*

## 🎯 Production Code Analysis

Focus on what matters - your actual product code:

```bash
# Analyze only production code
insightcode analyze --exclude-utility

# This excludes:
# - Test files (**/test/**, *.spec.ts, *.test.js)
# - Example code (**/examples/**, **/demo/**)
# - Scripts & tools (**/scripts/**, **/tools/**)
# - Fixtures & mocks (**/fixtures/**, **/mocks/**)
# - Benchmark files (**/benchmark/**)
```

### Why Use Production-Only Analysis?

Test files and examples often have acceptable duplication and complexity that can mask real issues:

| Project | Full Codebase Analysis | Production Only | Impact |
|---------|---------------|-----------------|--------|
| **Chalk** | A (96) | B (82) | Core is more complex than it appears |
| **TypeScript** | C (76) | F (28) | Massive algorithmic complexity in compiler |
| **Commander** | C (80) | F (54) | Command parsing logic needs refactoring |

The production-only analysis gives you the true picture of your codebase health.

## 🔧 CLI Options

```bash
# Exclude patterns
insightcode analyze --exclude "**/*.spec.ts" --exclude "**/vendor/**"

# Exclude utility directories
insightcode analyze --exclude-utility

# JSON output for CI/CD
insightcode analyze --json

# Help
insightcode --help
```

### JSON Output Format

The `--json` flag outputs comprehensive analysis results in a structured format:

```json
{
  "project": {
    "name": "insightcode-cli",
    "path": "src"
  },
  "summary": {
    "totalFiles": 9,
    "totalLines": 1077,
    "avgComplexity": 23.1,
    "avgDuplication": 9.2,
    "avgFunctions": 8.9,
    "avgLoc": 120
  },
  "scores": {
    "complexity": 40,
    "duplication": 77,
    "maintainability": 90,
    "overall": 66
  },
  "complexityStdDev": 19.9,
  "silentKillers": [],
  "score": 66,
  "grade": "D",

  "files": [
    {
      "path": "src/analyzer.ts",
      "complexity": 33,
      "duplication": 2,
      "functionCount": 24,
      "loc": 215,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 33 (recommended: < 20)",
          "value": 33,
          "ratio": 1.65
        },
        {
          "type": "size",
          "severity": "medium",
          "message": "File getting large: 215 lines",
          "value": 215,
          "ratio": 0.7
        }
      ],
      "fileType": "production",
      "totalScore": 58,
      "complexityRatio": 1.65,
      "sizeRatio": 0.72,
      "impact": 1,
      "criticismScore": 37
    },
    {
      "path": "src/parser.ts",
      "complexity": 61,
      "duplication": 11,
      "functionCount": 10,
      "loc": 260,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 61 (recommended: < 20)",
          "value": 61,
          "ratio": 3.05
        },
        {
          "type": "size",
          "severity": "medium",
          "message": "File getting large: 260 lines",
          "value": 260,
          "ratio": 0.8
        }
      ],
      "fileType": "production",
      "totalScore": 55,
      "complexityRatio": 3.05,
      "sizeRatio": 0.87,
      "impact": 3,
      "criticismScore": 69
    },
   
    ...
  ],
  "topFiles": [
    {
      "path": "src/parser.ts",
      "complexity": 61,
      "duplication": 11,
      "functionCount": 10,
      "loc": 260,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 61 (recommended: < 20)",
          "value": 61,
          "ratio": 3.05
        },
        {
          "type": "size",
          "severity": "medium",
          "message": "File getting large: 260 lines",
          "value": 260,
          "ratio": 0.8
        }
      ],
      "fileType": "production",
      "totalScore": 55,
      "complexityRatio": 3.05,
      "sizeRatio": 0.87,
      "impact": 3,
      "criticismScore": 69
    },
    {
      "path": "src/scoring.ts",
      "complexity": 49,
      "duplication": 10,
      "functionCount": 13,
      "loc": 119,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 49 (recommended: < 20)",
          "value": 49,
          "ratio": 2.45
        }
      ],
      "fileType": "production",
      "totalScore": 55,
      "complexityRatio": 2.45,
      "sizeRatio": 0.4,
      "impact": 3,
      "criticismScore": 56.5
    }
  
    ...
  ]
} 
```

## 📚 Best Practices

### Using InsightCode Effectively

1. **Start with production code**: Use `--exclude-utility` to focus on what matters
2. **Track trends**: Run regularly and monitor score changes over time
3. **Focus on top issues**: The tool shows the 5 most critical files - start there
4. **Consider context**: High complexity might be justified (algorithms, parsers)

📖 **[Complete Guide: How to Use Code Quality Scores Wisely](./docs/CODE_QUALITY_GUIDE.md)**

### Common Patterns

| Your Score | What It Means | Action |
|------------|---------------|---------|
| A (90-100) | Excellent code quality | Maintain standards |
| B (80-89) | Good, production-ready | Monitor complexity growth |
| C (70-79) | Typical active project | Review top 5 issues |
| D-F (0-69) | Needs attention | Check if justified or refactor |

## 🗺️ Roadmap

### What's New (v0.4.0) ✅
  - **Advanced Criticality Engine**: Scoring is now weighted by file complexity and architectural impact.
  - **Architectural Analysis**: The tool now detects "Silent Killers" and profiles complexity distribution (StdDev).
  - **Enhanced JSON Output**: The API exposes all advanced metrics for CI/CD and external tools

  - Configurable thresholds with `insightcode.config.json`
  - Project metadata display in analysis reports  
  - Academic best practices for metric aggregation
  - Improved reporting with better metrics display
  - Expanded test coverage (55 tests with comprehensive scenarios)
  - Robust configuration management with validation and defaults
  - Enhanced JSON output format with project information

### v0.5.0 🔮 Future Development
- JSX/TSX support
- Improved duplication detection algorithm
- HTML reports with charts
- Historical tracking capabilities

### Future 🔮
- GitHub Actions integration
- Test coverage metrics
- Multi-language support (Python, Java)
- Performance optimization features
- Historical tracking & trend analysis

## 🤝 Contributing

Contributions welcome! This is a solo side project, so please be patient with reviews.

```bash
# Clone and setup
git clone https://github.com/fstepho/insightcode-cli.git
cd insightcode-cli
npm install

# Development
npm run dev -- analyze     # Run with tsx watch
npm test                   # Run tests
npm run build             # Build for production
```

### Development Guidelines
- Keep it simple (KISS principle)
- Maximum 5 npm dependencies
- Performance and accuracy first
- Test critical paths

## 📈 Why InsightCode?

- **Privacy First**: Your code never leaves your machine
- **Developer Focused**: Built by a developer tired of complex tools
- **Actionable Metrics**: Clear insights that drive improvements
- **Fast & Simple**: No setup, no config, just results

## 🙏 Acknowledgments

Built with:
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) - AST parsing
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal styling
- [Fast-glob](https://github.com/mrmlnc/fast-glob) - File discovery

## 📝 License

MIT - Use it, fork it, improve it!

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/insightcode-cli)
- [GitHub Repository](https://github.com/fstepho/insightcode-cli)
- [Issue Tracker](https://github.com/fstepho/insightcode-cli/issues)
- [Changelog](./CHANGELOG.md)

---

**Latest**: v0.4.0 | **Downloads**: [![npm](https://img.shields.io/npm/dm/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli) | **Stars**: ⭐ the repo if you find it useful!