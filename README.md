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

## 🎯 What It Measures

### Complexity (40% weight)
Cyclomatic complexity - counts decision points in your code. Lower is better.

### Duplication (30% weight)  
Percentage of duplicated code blocks. Identifies copy-paste code.

### Maintainability (30% weight)
Composite score based on complexity, duplication, and file size.

## 📐 How Scores Work

- **A** (90-100): Excellent! Keep it up
- **B** (80-89): Good, minor improvements possible
- **C** (70-79): Fair, consider refactoring
- **D** (60-69): Poor, needs attention
- **F** (0-59): Critical, major refactoring needed

## 🔧 CLI Options

```bash
# Exclude patterns
insightcode analyze --exclude "**/*.spec.ts" --exclude "**/vendor/**"

# JSON output
insightcode analyze --json

# Help
insightcode --help
```

## 🗺️ Roadmap

### v0.1.0 (Current)
- ✅ TypeScript/JavaScript analysis
- ✅ 3 core metrics
- ✅ Terminal reporter with colors
- ✅ JSON export
- ✅ Exclude patterns

### v0.2.0 (Next)
- 📅 Configuration file support (.insightcoderc)
- 📅 More file types (.jsx, .tsx)
- 📅 Improved duplication detection

### v0.3.0 (Future)
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