# InsightCode CLI

> TypeScript code quality analyzer that runs 100% locally. Get actionable metrics in under 30 seconds without sending any code to the cloud.

[![npm version](https://img.shields.io/npm/v/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm downloads](https://img.shields.io/npm/dm/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)

## ✨ Features

- **🔒 100% Local** - Your code never leaves your machine
- **⚡ Fast** - Analyze 100k lines in under 30 seconds  
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

## 🎯 Production Code Analysis

InsightCode can focus on production code quality by excluding test files, examples, and utility scripts:

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

### Why Use `--exclude-utility`?

When analyzing popular projects, we found that including all files can skew metrics:
- **Test files** often have acceptable code duplication (setup/teardown patterns)
- **Example code** intentionally shows repetitive patterns for clarity
- **Build scripts** may have complex logic that's not part of your product

By focusing on production code, you get a clearer picture of your actual product quality.

#### Real-World Impact

When we benchmarked popular projects with `--exclude-utility`:

| Project | Full Analysis | Production Only | Impact |
|---------|---------------|-----------------|--------|
| **Chalk** | C (76) - 15 files | F (58) - 7 files | More accurate quality view |
| **TypeScript** | D (64) - 36k files | F (27) - 601 files | Reveals core complexity |

The production-only analysis shows the true complexity of the core codebase.

## 🎯 What It Measures

### Complexity (40% weight)
Cyclomatic complexity - counts decision points in your code. Lower is better.

### Duplication (30% weight)  
Percentage of duplicated code blocks. Identifies copy-paste code.

### Maintainability (30% weight)
Composite score based on complexity, duplication, and file size.

## 📏 How Metrics Are Calculated

### Cyclomatic Complexity
InsightCode uses McCabe's Cyclomatic Complexity (1976) to measure code complexity:

- **Base complexity**: Every file starts at 1
- **+1 for each decision point**:
  - Control flow: `if`, `else if`, `for`, `while`, `do-while`, `for-in`, `for-of`
  - Switch cases: Each `case` (but not `default`)
  - Exception handling: `catch`
  - Logical operators: `&&`, `||`, `??` (including in return statements)
  - Ternary: `? :`

**Example**:
```javascript
function validate(user) {              // Base: 1
  if (!user) return false;            // +1 for if
  if (user.age < 18) return false;    // +1 for if
  return user.active && user.verified; // +1 for &&
}                                      // Total: 4
```

### Code Duplication
- **Method**: 5-line sliding window with MD5 hashing
- **Detection**: Identifies code blocks that appear 2+ times
- **Accuracy**: ~85% (conservative to avoid false positives)
- **Production Analysis**: Higher precision with `--exclude-utility` by filtering out legitimate test/example patterns

### Maintainability Score
Calculated from three factors:
- **40%** - Complexity score (inverted: lower complexity = higher score)
- **30%** - Duplication score (inverted: less duplication = higher score)
- **30%** - File size score (smaller files = higher score)

## 📐 How Scores Work

- **A** (90-100): Exceptional! Keep it up
- **B** (80-89): Good, minor improvements possible
- **C** (70-79): Fair, consider refactoring
- **D** (60-69): Poor, needs attention
- **F** (0-59): Critical, major refactoring needed

### Smart Thresholds

InsightCode applies different thresholds based on file type:

| File Type | Complexity | File Size | Duplication |
|-----------|------------|-----------|-------------|
| **Production** | Medium: 10<br>High: 20 | Medium: 200<br>High: 300 | Medium: 15%<br>High: 30% |
| **Test Files** | Medium: 15<br>High: 30 | Medium: 300<br>High: 500 | Medium: 25%<br>High: 50% |
| **Utilities** | Medium: 15<br>High: 25 | Medium: 250<br>High: 400 | Medium: 20%<br>High: 40% |
| **Examples** | Medium: 20<br>High: 40 | Medium: 150<br>High: 250 | Medium: 50%<br>High: 80% |
| **Config** | Medium: 20<br>High: 35 | Medium: 300<br>High: 500 | Medium: 30%<br>High: 60% |

This prevents false positives from test setup code or example patterns.

### Real-World Context
Based on our [analysis of 19 popular projects](./docs/benchmarks/):
- Only **11%** achieved B grade (Prettier, UUID)
- **47%** got C grade (including axios, express, nest)
- **21%** got F grade (including ESLint!)
- **No project got an A**

Your C is actually respectable - you're in good company!

## 🔧 CLI Options

```bash
# Exclude patterns
insightcode analyze --exclude "**/*.spec.ts" --exclude "**/vendor/**"

# Exclude utility directories (tests, examples, scripts, etc.)
insightcode analyze --exclude-utility

# JSON output
insightcode analyze --json

# Help
insightcode --help
```

## 🗺️ Roadmap

### v0.2.0 (Current)
- ✅ TypeScript/JavaScript analysis
- ✅ 3 core metrics with smart thresholds
- ✅ Terminal reporter with colors
- ✅ JSON export
- ✅ Exclude patterns
- ✅ Production code analysis (`--exclude-utility`)
- ✅ File type classification (production, test, example, utility, config)
- ✅ Configurable thresholds per file type

### v0.3.0 (Next)
- 📅 Configuration file support (.insightcoderc)
- 📅 More file types (.jsx, .tsx)
- 📅 Improved duplication detection

### v0.4.0 (Future)
- 📅 HTML reports
- 📅 Historical tracking
- 📅 GitHub Actions integration
- 📅 More metrics (test coverage, documentation)

## 🤝 Contributing

Contributions are welcome! This is a solo side project, so please be patient with reviews.

```bash
# Clone the repo
git clone https://github.com/fstepho/insightcode-cli.git

# Install dependencies
npm install

# Run in dev mode
npm run dev -- analyze

# Run tests
npm test

# Build
npm run build
```

### Development Guidelines

- Keep it simple (KISS principle)
- No more than 5 npm dependencies
- Focus on performance and accuracy
- Write tests for critical paths

## 📈 Why InsightCode?

- **Privacy First**: Unlike cloud-based tools, your code stays on your machine
- **Developer Focused**: Built by a developer who was frustrated with complex tools
- **Actionable**: Clear metrics that actually help improve code quality
- **Fast**: No setup, no config, just results

## 🙏 Acknowledgments

Built with:
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) - For accurate AST parsing
- [Commander.js](https://github.com/tj/commander.js/) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal colors
- [Fast-glob](https://github.com/mrmlnc/fast-glob) - File discovery

## 📝 License

MIT - Use it, fork it, improve it!

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/insightcode-cli)
- [Issue Tracker](https://github.com/fstepho/insightcode-cli/issues)
- [Changelog](./CHANGELOG.md)

---

**Status**: 🚀 v0.1.0 Released!

If you find this useful, please ⭐ the repo!