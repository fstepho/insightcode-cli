# Changelog

All notable changes to InsightCode CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Configuration file support (.insightcoderc)
- More file types (.jsx, .tsx)
- Improved duplication detection

## [0.2.0] - 2025-06-27

### Added
- `--exclude-utility` flag to analyze only production code
- Smart file type classification (production, test, example, utility, config)
- Configurable thresholds based on file type
- Better product quality insights by separating concerns

### Changed
- Test files now have more lenient thresholds (complexity < 30, duplication < 50%)
- Example code allows up to 80% duplication
- Utility scripts have balanced thresholds

### Fixed
- ENOBUFS error when analyzing large projects (increased buffer to 50MB)
- All 19 benchmark projects now analyze successfully including TypeScript (2.8M lines)

## [0.1.0] - 2025-06-26

### Added
- Initial release of InsightCode CLI 🎉
- TypeScript/JavaScript code quality analyzer
- 3 core metrics: Complexity, Duplication, Maintainability
- Beautiful terminal output with ASCII progress bars
- Contextual tips for code improvement
- JSON export option for CI/CD integration
- Zero configuration - works out of the box
- 100% local analysis - no cloud dependencies

### Features
- Cyclomatic complexity calculation using TypeScript Compiler API
- Code duplication detection with 5-line block hashing
- Smart scoring system (0-100) with letter grades (A-F)
- Colored output adapted to score quality
- File pattern exclusion support
- Fast performance - analyze 100k lines in under 30 seconds

### Technical Details
- Built with TypeScript
- 4 dependencies only (commander, typescript, chalk, fast-glob)
- Comprehensive test suite (27 tests)
- Total codebase: ~1,300 lines (431 source + 900 tests)
- Compatible with Node.js >=18.0.0
- Package size: 44.6 kB unpacked

### Known Issues
- Our own complexity score is C (73/100) - but it works!
- Empty directories may show NaN score (edge case)

### Installation
```bash
npm install -g insightcode-cli
```

### Usage
```bash
insightcode analyze
insightcode analyze ./src
insightcode analyze --json > report.json
```

---

[Unreleased]: https://github.com/fstepho/insightcode-cli/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fstepho/insightcode-cli/releases/tag/v0.1.0