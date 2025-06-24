# InsightCode CLI

> TypeScript code quality analyzer that runs 100% locally. Get actionable metrics in under 30 seconds without sending any code to the cloud.

[![npm version](https://img.shields.io/npm/v/insightcode-cli.svg)](https://www.npmjs.com/package/insightcode-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

## 📊 Example Output

```
📊 InsightCode Analysis Report

Overall Score: B (78/100)

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
   Complexité élevée: 34 (max recommandé: 20)

⚠️ src/services/user.service.ts
   Code dupliqué: 23%
```

## 🎯 What It Measures

### Complexity (40% weight)
Cyclomatic complexity - counts decision points in your code. Lower is better.

### Duplication (30% weight)  
Percentage of duplicated code blocks. Identifies copy-paste code.

### Maintainability (30% weight)
Composite score based on complexity, duplication, and file size.

## 🔧 Configuration (Optional)

Create `.insightcoderc` in your project root:

```json
{
  "exclude": [
    "**/*.spec.ts",
    "**/generated/**"
  ],
  "thresholds": {
    "complexity": 20,
    "duplication": 15
  }
}
```

## 🗺️ Roadmap

### v1.0 (Current)
- ✅ TypeScript/JavaScript analysis
- ✅ 3 core metrics
- ✅ Terminal reporter
- ✅ JSON export

### v1.1 (Coming Soon)
- 🔄 Configuration file support
- 🔄 HTML reports
- 🔄 More file types (.jsx, .tsx)
- 🔄 GitHub Actions integration

### v1.2 (Future)
- 📅 React/Vue/Angular specific rules
- 📅 Historical tracking
- 📅 VS Code extension
- 📅 Team dashboards

## 🤝 Contributing

Contributions are welcome! This is a solo side project, so please be patient with reviews.

```bash
# Clone the repo
git clone https://github.com/[username]/insightcode-cli.git

# Install dependencies
npm install

# Run in dev mode
npm run dev

# Run tests
npm test
```

## 📈 Why InsightCode?

- **Privacy First**: Unlike cloud-based tools, your code stays on your machine
- **Developer Focused**: Built by a developer who was frustrated with complex tools
- **Actionable**: Clear metrics that actually help improve code quality
- **Fast**: No setup, no config, just results

## 🙏 Acknowledgments

Built with:
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [Commander.js](https://github.com/tj/commander.js/)
- [Chalk](https://github.com/chalk/chalk)

## 📝 License

MIT - Use it, fork it, improve it!

## 📁 Project Documentation

- `docs/AI_CONTEXT.md` - Project context for AI pair programming
- `docs/CURRENT_TASK.md` - Current development focus
- `docs/DECISIONS.md` - Architecture decision records

---

**Status**: 🚧 Active Development (v1.0 coming soon)

If you find this useful, please ⭐ the repo!