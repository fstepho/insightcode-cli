# InsightCode CLI

> TypeScript code quality analyzer that runs 100% locally. Get actionable metrics in seconds without sending any code to the cloud.

[![npm version](https://img.shields.io/npm/v/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)

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

```
📊 InsightCode Analysis Report

Overall Score: B (82/100)

Summary:
  Files analyzed: 23
  Total lines: 3,456
  Avg complexity: 8.2
  Code duplication: 7%

Metrics:
  Complexity      ████████████████░░░░ 82%
  Duplication     ██████████████████░░ 93%
  Maintainability ███████████████░░░░░ 78%

⚠️ Top Issues:

❌ src/utils/validator.ts
   High complexity: 34 (recommended: < 20)

⚠️ src/services/user.service.ts
   Medium duplication: 15% of code is duplicated

💡 Tips to improve:
  • Break down complex functions into smaller ones
  • Extract common code into shared utilities

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

**Real-World Context**: Based on our [analysis of 19 popular projects](./docs/benchmarks/):
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

| Project | Full Analysis | Production Only | Impact |
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

## 🗺️ Roadmap

### v0.3.0 ✅ Current
- Enhanced scoring with graduated thresholds
- Smart file type classification
- Production-only analysis (`--exclude-utility`)
- Industry-aligned metrics

### v0.4.0 📅 Next
- Configuration file support (.insightcoderc)
- JSX/TSX support
- Improved duplication detection algorithm

### v0.5.0 🔮 Future
- HTML reports with charts
- Historical tracking
- GitHub Actions integration
- Test coverage metrics

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

**Latest**: v0.3.0 | **Downloads**: [![npm](https://img.shields.io/npm/dm/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli) | **Stars**: ⭐ the repo if you find it useful!