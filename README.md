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
- **⚡ Fast** - Analyze 100k lines in under 2 seconds (62,761 lines/second!)
- **📊 Simple Metrics** - Focus on what matters: complexity, duplication, maintainability
- **🎯 Zero Config** - Works out of the box with sensible defaults
- **🎨 Beautiful Output** - Clear, colorful terminal reports

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

Real analysis of the TypeScript project using `insightcode analyze --exclude-utility TypeScript`:

```
🔍 Analyzing code quality...

📊 InsightCode Analysis Report

📁 Project:
  Name: typescript
  Version: 5.9.0
  Description: TypeScript is a language for application scale JavaScript development
  Path: TypeScript

Overall Score: F (45/100)

Summary:
  Files analyzed: 601
  Total lines: 302,986

Metrics:
  Complexity      ████████████████████ 93.2 (Very High)
  Duplication     ███░░░░░░░░░░░░░░░░░ 16.4% (Very High)
  Maintainability █████░░░░░░░░░░░░░░░ 27/100 (Very Poor)

⚠️  Top 5 Most Critical Files:

1. TypeScript/src/compiler/binder.ts
   • High complexity: 959 (48x limit)
   • Very large file: 3,255 lines (11x limit)

2. TypeScript/src/compiler/checker.ts
   • Extreme complexity: 16,110 (806x limit)
   • Massive file: 43,108 lines (144x limit)

3. TypeScript/src/compiler/program.ts
   • High complexity: 959 (48x limit)
   • Very large file: 4,234 lines (14x limit)

4. TypeScript/src/harness/fourslashImpl.ts
   • High complexity: 887 (44x limit)
   • Very large file: 4,426 lines (15x limit)

5. TypeScript/src/server/editorServices.ts
   • High complexity: 792 (40x limit)
   • Very large file: 4,383 lines (15x limit)

💡 Quick wins to improve score:

  • Split top 3 complex files into modules (potential +8 points)
  • Break down 5 large files (potential +5 points)
  • Address duplication in 117 files (potential +4 points)

──────────────────────────────────────────────────
✅ Analysis complete! Run regularly to track progress.

```

## 📐 How It Works

### What We Measure

#### 1. Cyclomatic Complexity (40% weight)
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

#### 2. Code Duplication (30% weight)
Detects actual copy-paste duplication using pragmatic content analysis:
- **Algorithm**: 5-line sliding window with normalization
- **Philosophy**: Focus on refactorable duplication, not structural patterns
- **Target**: < 3% excellent, < 8% good

> 💡 **Why we're different**: We report actionable duplication. While tools like SonarQube might show 70% duplication in test files, we focus on actual copy-paste that can be refactored. [Learn more →](./docs/DUPLICATION_DETECTION_PHILOSOPHY.md)

#### 3. Maintainability (30% weight)
Composite score based on file size and function density:
- **File size**: ≤ 200 lines excellent, ≤ 300 good
- **Function count**: ≤ 10 per file excellent, ≤ 15 good
- **Extreme penalty**: Files > 1000 lines get additional penalties

### Scoring System

InsightCode uses graduated thresholds aligned with industry standards:

| Grade | Score   | What it means                          |
|-------|---------|----------------------------------------|
| **A** | 90-100  | Exceptional! Keep it up                |
| **B** | 80-89   | Good, minor improvements possible      |
| **C** | 70-79   | Fair, consider refactoring             |
| **D** | 60-69   | Poor, needs attention                  |
| **F** | 0-59    | Critical, major refactoring needed     |

**Real-World Context**: Based on our [analysis of 19 popular projects](./benchmarks/):
- 16% achieved A (dotenv, chalk, prettier)
- 42% achieved B (axios, commander, express)  
- 21% got C (typescript, ms, debounce)
- 11% got D (yargs, zod)
- 11% got F (joi, eslint)

Your C is respectable - you're in good company with TypeScript itself!

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
  "projectInfo": {
    "name": "insightcode-cli",
    "version": "0.3.0",
    "description": "TypeScript code quality analyzer that runs 100% locally",
    "path": "src"
  },
  "summary": {
    "totalFiles": 8,
    "totalLines": 1375,
    "avgComplexity": 14.1,
    "avgDuplication": 1.6,
    "avgFunctions": 6.1,
    "avgLoc": 171.9
  },
  "score": 69,
  "grade": "D",
  "files": [
    {
      "path": "src/analyzer.ts",
      "complexity": 24,
      "duplication": 0,
      "functionCount": 11,
      "loc": 289,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 24 (recommended: < 20)",
          "value": 24,
          "ratio": 1.2
        }
      ],
      "fileType": "production",
      "totalScore": 120,
      "complexityRatio": 1.2,
      "sizeRatio": 0.96
    },
    {
      "path": "src/cli.ts",
      "complexity": 6,
      "duplication": 3,
      "functionCount": 1,
      "loc": 51,
      "issues": [],
      "fileType": "production",
      "totalScore": 100,
      "complexityRatio": 0.3,
      "sizeRatio": 0.17
    },
    {
      "path": "src/parser.ts",
      "complexity": 33,
      "duplication": 0,
      "functionCount": 14,
      "loc": 340,
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
          "message": "File getting large: 340 lines",
          "value": 340,
          "ratio": 1.13
        }
      ],
      "fileType": "production",
      "totalScore": 233,
      "complexityRatio": 1.65,
      "sizeRatio": 1.13
    },
    {
      "path": "src/reporter.ts",
      "complexity": 44,
      "duplication": 9,
      "functionCount": 10,
      "loc": 126,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 44 (recommended: < 20)"
        }
      ],
      "fileType": "production"
    },
    {
      "path": "src/scoring.ts",
      "complexity": 26,
      "duplication": 0,
      "functionCount": 5,
      "loc": 57,
      "issues": [
        {
          "type": "complexity",
          "severity": "high",
          "message": "High complexity: 26 (recommended: < 20)"
        }
      ],
      "fileType": "production"
    },
    {
      "path": "src/topIssues.ts",
      "complexity": 14,
      "duplication": 11,
      "functionCount": 10,
      "loc": 88,
      "issues": [
        {
          "type": "complexity",
          "severity": "medium",
          "message": "Medium complexity: 14 (recommended: < 10)"
        }
      ],
      "fileType": "production"
    },
    {
      "path": "src/types.ts",
      "complexity": 1,
      "duplication": 19,
      "functionCount": 0,
      "loc": 57,
      "issues": [
        {
          "type": "duplication",
          "severity": "medium",
          "message": "Medium duplication: 19% of code is duplicated"
        }
      ],
      "fileType": "production"
    }
  ],
  "topFiles": [
    {
      "path": "src/parser.ts",
      "totalScore": 233,
      "complexityRatio": 1.65,
      "sizeRatio": 1.13,
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
          "message": "File getting large: 340 lines",
          "value": 340,
          "ratio": 1.13
        }
      ]
    },
    {
      "path": "src/reporter.ts",
      "totalScore": 220,
      "complexityRatio": 2.2,
      "issues": [
        {
          "type": "complexity",
          "severity": "low",
          "message": "High complexity: 44 (recommended: < 20)",
          "value": 44,
          "ratio": 2.2
        }
      ]
    },
    {
      "path": "src/scoring.ts",
      "totalScore": 130,
      "complexityRatio": 1.3,
      "issues": [
        {
          "type": "complexity",
          "severity": "low",
          "message": "High complexity: 26 (recommended: < 20)",
          "value": 26,
          "ratio": 1.3
        }
      ]
    },
    {
      "path": "src/analyzer.ts",
      "totalScore": 110,
      "complexityRatio": 1.1,
      "issues": [
        {
          "type": "complexity",
          "severity": "low",
          "message": "High complexity: 22 (recommended: < 20)",
          "value": 22,
          "ratio": 1.1
        }
      ]
    },
    {
      "path": "src/types.ts",
      "totalScore": 38,
      "duplicationValue": 19,
      "issues": [
        {
          "type": "duplication",
          "severity": "medium",
          "message": "Medium duplication: 19% of code is duplicated",
          "value": 19
        }
      ]
    }
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

### v0.3.0 ✅ Released
- File criticality scoring with weighted algorithm
- Top 5 critical files in JSON output
- Criticality-based file ranking in reporter
- Enhanced scoring with graduated thresholds
- Smart file type classification
- Production-only analysis (`--exclude-utility`)
- Industry-aligned metrics

### v0.4.0 🚀 Ready for Release
- Configurable thresholds with `insightcode.config.json`
- Enhanced file scoring with issue ratios and criticality scoring
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

### v0.6.0 🔮 Future
- GitHub Actions integration
- Test coverage metrics
- Multi-language support (Python, Java)
- Performance optimization features

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