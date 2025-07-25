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
- **🧬 Rich Context for LLM Analysis** - Provides detailed architectural insights to help LLMs better understand and analyze code structure.
- **🎨 Beautiful Output** - Clear, colorful terminal reports.

## 🚀 Quick Start

```bash
# Install globally
npm install -g insightcode-cli

# Simple analysis (new default behavior)
insightcode

# Analyze specific path
insightcode ./src

# Focus on production code only  
insightcode --production

# Use industry-standard strict duplication thresholds
insightcode --strict-duplication

# Export for CI/CD integration
insightcode --json > report.json

# Multiple format options
insightcode --format=summary    # Brief overview
insightcode --format=critical   # Only critical files
insightcode --format=ci         # CI/CD friendly output
```

## 📋 Requirements

- Node.js 18.0 or higher
- TypeScript/JavaScript projects

## 📊 Example Output

Real analysis of the **Angular** project using `insightcode --production ./angular/packages`:

```
🔍 Analyzing code quality...
📁 Found 4282 files
📊 Extracting file details...
⚙️  Processing metrics...
📈 Calculating overview...
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ packages vlatest (local, 0 stars)                                                                          │
│ Analysis from Jul 25, 2025, took 0.0s                                                                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┬────────────────────────────────────────────────────────────────────┬────────────┐
│ OVERVIEW: GRADE  B  (85) │ 1174 critical files found requiring attention                      │            │
├──────────────────────────┼────────────────────────────────────────────────────────────────────┼────────────┤
│ Complexity               │ ██████████████████████████████████████████████████░░░░░░░░░░░░░░   │ 78         │
│                          │                                                                    │            │
│ Duplication              │ █████████████████████████████████████████████████████████████░░░   │ 96 (5%)    │
│                          │                                                                    │            │
│ Maintainability          │ ██████████████████████████████████████████████████████░░░░░░░░░░   │ 85         │
└──────────────────────────┴────────────────────────────────────────────────────────────────────┴────────────┘

┌─────────────────────────────────────────────────────┬──────────────────────────────────────────────────────┐
│ KEY STATS                                           │ BUSINESS IMPACT                                      │
├─────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ Total Files     4282                                │ 🚨 High Maintenance Cost        885                  │
│ Total LOC       582k                                │ 🐌 Slow to Change Files         556                  │
│ Avg Complexity  10.7                                │ 🔗 Tightly Coupled Files        783                  │
└─────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘

┌ CRITICAL FILES REQUIRING ATTENTION ────────────────────────────────────────────────────────────────────────┐
│ S  │ File Path                                      │ Metrics               │ Primary Issue                │
├────┼────────────────────────────────────────────────┼───────────────────────┼──────────────────────────────┤
│ 0  │ common/locales/closure-locale.ts               │ C:  548 D:  0% L:  1k │ 💀 complexity (critical)     │
│ 0  │ compiler-cli/.../type_check_block.ts           │ C:  451 D:  0% L:  2k │ 💀 complexity (critical)     │
│ 0  │ compiler/src/output/output_ast.ts              │ C:  391 D:  0% L:  2k │ 💀 complexity (critical)     │
│ 0  │ compiler/src/ml_parser/lexer.ts                │ C:  322 D:  8% L:  1k │ 💀 complexity (critical)     │
│ 0  │ compiler/.../expression.ts                     │ C:  311 D:  0% L:  1k │ 💀 complexity (critical)     │
│ 0  │ compiler-cli/.../handler.ts                    │ C:  306 D:  0% L:  2k │ 💀 complexity (critical)     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

DEEP DIVE: KEY FUNCTION ANALYSIS
──────────────────────────────────────────────────────────────────────────────────────────────────────────────

🎯 reifyCreateOperations in compiler/src/template/pipeline/src/phases/reify.ts
   Metrics: Complexity: 86 | Lines: 359 | Params: 2
   Detected Issues:
     - critical-complexity (critical)    : Severely impacts maintainability
     - long-function (high)              : Should be split into smaller functions
     - deep-nesting (medium)             : Hard to read and test
     - multiple-responsibilities (medium): Clean separation of concerns
· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · 

🎯 resolve in compiler-cli/.../handler.ts
   Metrics: Complexity: 84 | Lines: 501 | Params: 3
   Detected Issues:
     - critical-complexity (critical)  : Severely impacts maintainability
     - long-function (high)            : Should be split into smaller functions
     - multiple-responsibilities (high): Clean separation of concerns
     - deep-nesting (medium)           : Hard to read and test
     - impure-function (low)           : Side effects make testing harder
· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · 

🎯 getDateFormatter in common/src/i18n/format_date.ts
   Metrics: Complexity: 82 | Lines: 309 | Params: 1
   Detected Issues:
     - critical-complexity (critical)    : Severely impacts maintainability
     - long-function (high)              : Should be split into smaller functions
     - multiple-responsibilities (medium): Clean separation of concerns
· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · 

🎯 transformExpressionsInOp in compiler/.../expression.ts
   Metrics: Complexity: 72 | Lines: 152 | Params: 3
   Detected Issues:
     - critical-complexity (critical)  : Severely impacts maintainability
     - long-function (high)            : Should be split into smaller functions
     - multiple-responsibilities (high): Clean separation of concerns
     - deep-nesting (medium)           : Hard to read and test
· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · 

🎯 analyze in compiler-cli/.../handler.ts
   Metrics: Complexity: 59 | Lines: 487 | Params: 2
   Detected Issues:
     - critical-complexity (critical)  : Severely impacts maintainability
     - long-function (high)            : Should be split into smaller functions
     - god-function (high)             : Violates Single Responsibility
     - multiple-responsibilities (high): Clean separation of concerns
     - deep-nesting (medium)           : Hard to read and test
     - impure-function (low)           : Side effects make testing harder
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
- **Algorithm**: 8-line sliding window with normalization
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
insightcode --production

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
# Analysis modes
insightcode                    # Default: analyze current directory
insightcode ./src             # Analyze specific path
insightcode --production      # Focus on production code only

# Duplication analysis modes (v0.6.0+)
insightcode --strict-duplication    # Industry standards (3%/8%/15%)
insightcode                         # Legacy mode (15%/30%/50%) - default

# Output formats
insightcode --json                  # Full JSON output
insightcode --format=summary        # Brief overview
insightcode --format=critical       # Only critical files  
insightcode --format=ci             # CI/CD optimized output
insightcode --format=markdown       # Markdown report

# Filtering
insightcode --exclude "**/*.spec.ts" --exclude "**/vendor/**"

# Get help
insightcode --help
```

### Duplication Mode Selection (v0.6.0+)

Choose the appropriate duplication analysis mode for your project context:

| Mode | Thresholds | Best For | Example Usage |
|------|------------|----------|---------------|
| **Legacy** (default) | 15%/30%/50% | Existing codebases, gradual improvement | `insightcode` |
| **Strict** | 3%/8%/15% | New projects, industry alignment | `insightcode --strict-duplication` |

**Strict mode** aligns with industry standards (SonarQube, Google, etc.) while **Legacy mode** provides more permissive thresholds suitable for brownfield projects.

### JSON Output Format

The `--json` flag outputs comprehensive analysis results in a structured format.

## 📚 Best Practices

### Using InsightCode Effectively

1. **Start with production code**: Use `--production` to focus on what matters
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

### What's New (v0.7.0) ✅
- **🔍 Enhanced Function-Level Analysis**: Better complexity breakdown with severity-based sorting to identify the most critical functions
- **🎯 Strict Duplication Mode**: New `--strict-duplication` flag for industry-standard thresholds (3%/8%/15%)
- **📊 Improved Reports**: Better insights and findings presentation with function-level critical issue tracking
- **📚 New Documentation**: Comprehensive CriticismScore guide to help understand project scoring methodology
- **📈 Updated Benchmarks**: Fresh analysis data across popular open-source projects for better context

### v0.6.0 ✅ **Major Release - BREAKING CHANGES**
- **🚨 CLI Interface Redesign**: Analysis is now the default action - `analyze` subcommand removed
- **🚨 Flag Renaming**: `--exclude-utility` → `--production` for better clarity  
- **🚨 Removed Features**: `--with-context` flag no longer available
- **📚 Complete Documentation Audit**: All technical documentation synchronized with implementation (79+ examples validated)
- **🔍 Dual-Mode Duplication Analysis**: Choose between strict (industry standards) and legacy (permissive) thresholds
- **⚡ Enhanced Developer Experience**: Added `npm run typecheck`, improved error handling, unified validation tools
- **🎯 Mathematical Validation**: Every scoring formula and constant verified for 100% accuracy
- **🛡️ Quality Assurance**: Comprehensive validation system prevents documentation drift

### What's New (v0.5.0) ✅
- **Rich Context Extraction**: Detailed architectural insights for LLM analysis and external tools
- **Enhanced Function Analysis**: Deep complexity breakdown with pattern detection
- **Comprehensive Code Context**: Analysis of async patterns, error handling, TypeScript usage

### What's New (v0.4.0) ✅
- **Advanced Criticality Engine**: Scoring weighted by file complexity and architectural impact
- **Architectural Metrics**: Detection of "Silent Killers" and complexity distribution analysis
- **Enhanced JSON Output**: Complete metrics exposure for CI/CD and external tools
- **Academic Methodology**: Research-based best practices for metric aggregation

### v0.8.0 🔮 Future Development
- **Enhanced Duplication Detection**: More sophisticated algorithm with contextual awareness
- **JSX/TSX Support**: Full React/Vue component analysis capabilities  
- **Interactive HTML Reports**: Rich visualizations with architectural diagrams
- **AI-Powered Insights**: Context-aware recommendations using LLM integration
- **Framework-Specific Analysis**: Specialized patterns for React, Vue, Angular, and Node.js
- **Historical Tracking**: Code quality trends over time with regression detection

### Future 🔮
- **Multi-Language Support**: Python, Java, C# analysis capabilities
- **GitHub Actions Integration**: Seamless CI/CD workflow templates
- **VS Code Extension**: Real-time analysis and inline suggestions
- **Team Analytics**: Aggregate metrics across multiple repositories
- **Performance Profiling**: Identify performance bottlenecks alongside quality issues
- **Test Coverage Integration**: Combine quality metrics with coverage data

## 🤝 Contributing

Contributions welcome! This is a solo side project, so please be patient with reviews.

```bash
# Clone and setup
git clone https://github.com/fstepho/insightcode-cli.git
cd insightcode-cli
npm install

# Development
npm run dev              # Run with tsx watch
npm test                   # Run tests
npm run build             # Build for production
```

### Development Guidelines
- Keep it simple (KISS principle)
- Maximum 7 npm dependencies
- Performance and accuracy first
- Test critical paths

## 📈 Why InsightCode?

- **Privacy First**: Your code never leaves your machine
- **Developer Focused**: Built by a developer tired of complex tools
- **Actionable Metrics**: Clear insights that drive improvements
- **Fast & Simple**: No setup, no config, just results

## 🎓 Technical Philosophy

InsightCode uses evidence-based thresholds:
- [Academic justification for our scoring](docs/SCORING_THRESHOLDS_JUSTIFICATION.md)
- [Why our duplication detection is different](docs/DUPLICATION_DETECTION_PHILOSOPHY.md)

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

**Latest**: v0.7.0 | **Downloads**: [![npm](https://img.shields.io/npm/dm/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli) | **Stars**: ⭐ the repo if you find it useful!
