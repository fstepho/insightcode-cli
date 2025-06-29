# Changelog

All notable changes to InsightCode CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- File criticality scoring system with new `topIssues.ts` module
- Weighted scoring algorithm prioritizing complexity (heaviest), size (medium), and duplication (lightest)
- JSON output now includes `topFiles` array with top 5 critical files
- Enhanced reporter with criticality-based file ranking system
- File scoring algorithm that prioritizes by total impact (complexity + size + duplication)
- Ratio display for better context (e.g., "813x limit" instead of just "16260")
- Severity labels based on ratios ("Extreme", "Very High", "High", "Medium")
- Actionable improvement suggestions with potential score gains
- Number formatting with thousand separators for better readability

### Changed
- Top Issues now displays the 5 most critical files instead of first 5 issues found
- Issues are grouped by file for better clarity
- Reporter uses scoring functions from `scoring.ts` for consistency
- Improved visual hierarchy in terminal output
- Benchmark scripts now use pre-calculated `topFiles` from analysis results
- Better separation of concerns with dedicated scoring module

### Fixed
- Critical files like `checker.ts` (Typescript project) with extreme complexity (16,260) now properly appear in Top Issues
- Consistent complexity scoring between analyzer and reporter

### Planned
- Configuration file support (.insightcoderc)
- More file types (.jsx, .tsx)
- Framework-specific analysis (React, Angular)

## [0.3.0] - 2025-06-28

### Added
- Enhanced scoring system with graduated thresholds for all metrics
- New `scoring.ts` module for consistent calculations across analyzer and reporter
- Advanced maintainability scoring considering both file size and function count
- Industry-aligned duplication thresholds (3%=excellent, 8%=good, 15%=acceptable)
- Average function count tracking for better maintainability insights
- Penalties for extremely large files (>1000 lines)

### Changed
- Replaced linear complexity scoring with graduated thresholds (10/15/20/30/50+)
- Enhanced duplication scoring with more nuanced industry standards
- Improved maintainability calculation with dual metrics (size + functions)
- All scoring now uses shared functions for perfect consistency
- Updated project self-analysis: B (82/100) full, C (72/100) production-only

### Fixed
- Reporter complexity calculation now matches analyzer perfectly
- Eliminated 0% complexity display bug for high-complexity projects
- Consistent scoring between terminal and JSON output modes

### Technical
- Added 90-line scoring.ts module with comprehensive test coverage
- Updated analyzer.ts to use shared scoring functions
- Enhanced reporter.ts with consistent complexity calculation
- Improved test coverage for new scoring algorithms

## [0.1.1] - 2025-06-27

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
- Fast performance - analyze 100k lines in under 2 seconds (62,761 lines/second benchmarked)

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