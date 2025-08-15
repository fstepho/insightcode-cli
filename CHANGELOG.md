# Changelog

All notable changes to InsightCode CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.0] - 2025-08-15

### 🚨 Breaking Changes
- **Four-Dimensional Scoring System**: Project scores have changed due to new weight distribution
  - **Old (0.7.1)**: 3 dimensions - Complexity (45%), Maintainability (30%), Duplication (25%)
  - **New (0.8.0)**: 4 dimensions - Complexity (35%), Maintainability (25%), Duplication (20%), **Reliability (20%)**
  - Projects may show different overall grades due to weight redistribution

### ✨ Major New Features
- **Reliability Score**: Fourth scoring dimension measuring code robustness
  - Detects potential defects based on code quality issues and patterns
  - Progressive penalty system for critical/high/medium/low severity issues
  - Visible in CLI terminal output and all report formats
  - 20% weight in overall project score calculation

- **Quick Wins Analysis**: Strategic improvement recommendations
  - Identifies high-ROI code improvements (high impact, low effort)
  - Categorizes by strategic priority and estimated effort hours
  - ROI calculations with actionable recommendations
  - Helps teams prioritize the most valuable refactoring work

- **Quality Patterns Section**: Enhanced analysis in Markdown reports
  - Identifies anti-patterns and architectural issues
  - Categorizes by quality vs architecture patterns
  - Provides context for understanding code quality problems

### 🚀 Performance Improvements
- **Function Analysis Optimization**:
  - Batching: Process functions in batches of 50 for memory management
  - Caching: WeakMap caching to avoid redundant analysis
  - Smart timeouts: 30s timeout per file with partial completion
  - Memory management: Periodic cache clearing during analysis

- **AST Performance Enhancements**:
  - Pre-compiled regex patterns for faster pattern matching
  - Optimized global variable lookups with Set data structure
  - Performance timing utilities and monitoring
  - Reduced redundant getText() calls with caching

### 🔧 Algorithm Improvements
- **Enhanced Function Issue Detection**:
  - New "God Function" detection using multiple metrics (operations, complexity, lines)
  - Improved deep nesting analysis with performance guards
  - Better responsibility analysis (IO, validation, transformation patterns)
  - Enhanced purity detection for functional programming analysis

- **Smarter File Prioritization**:
  - Files sorted by architectural importance (criticism score)
  - Focus on most critical files first in reports

- **Improved Maintainability Scoring**:
  - Enhanced cohesion and coupling analysis
  - Better dependency stability metrics integration

### 📊 User Experience Enhancements
- **Enhanced CLI Output**:
  - Reliability score display in terminal overview
  - Improved file sorting by architectural importance
  - Better legend and formatting in risky files table

- **Improved Markdown Reports**:
  - Quick Wins section with comprehensive ROI analysis
  - Enhanced quality patterns breakdown
  - Better narrative generation with problem pattern identification
  - Strategic recommendations based on detected issues

- **Performance Logging**: Better visibility into analysis performance and project identification

### 🛠️ Technical Improvements
- **Test Coverage**: Comprehensive integration tests for CLI functionality and scoring consistency
- **Code Organization**: Extracted Quick Wins utilities and rules into dedicated modules
- **Type Safety**: Enhanced TypeScript types for function vs file-level issues
- **Memory Management**: Improved cache clearing and memory usage optimization

## [0.7.1] - 2025-08-02

### Added
- **Benchmark Comparison Script**: Comprehensive benchmarking tool to compare InsightCode and SonarQube analysis across multiple projects
- **Enhanced Benchmarking Infrastructure**: New setup documentation and automated comparison reporting in Markdown format
- **excludePatterns Option**: Added excludePatterns to AnalysisOptions for more flexible file exclusion

### Changed
- **Production Mode Improvements**: Enhanced minified file pattern detection for better production code analysis
- **Documentation Updates**: Improved clarity in architectural metrics terminology and code quality guides
- **Harmonized Exclusion Patterns**: Consistent exclusion patterns between InsightCode and SonarQube for fair comparisons

### Removed
- **Obsolete Scripts**: Removed obsolete weight reference script and associated documentation

### Fixed
- **GitIgnore Updates**: Added benchmark details to .gitignore for cleaner repository structure
- **Documentation Consistency**: Updated references in CODE_QUALITY_GUIDE for clearer critical file identification

## [0.7.0] - 2025-07-25

### Added
- **Enhanced Report Generator**: Function-level critical issue tracking with centralized config
- **Improved Markdown Generation**: Better insights and findings presentation
- **Centralized Grading Config**: Introduced GRADE_CONFIG for consistency across components
- **Unified Grade Type**: Added type-safe Grade type definition
- **Function-Level Analysis**: Enhanced complexity metrics with distinct operation counting and severity-based sorting
- **Strict Duplication Mode**: Added strict duplication detection with rigorous thresholds
- **Enhanced Scoring Utilities**: New centralized scoring functions and utilities with deprecated comment removal
- **CriticismScore Documentation**: New comprehensive guide for project scoring methodology
- **Updated Benchmarks**: Fresh benchmark data for 2025-07-21 across all test projects

### Changed
- **Refactored Reporter and Scoring Modules**: Improved structure and harmonization for better maintainability
- **Terminology Harmonization**: Updated scoring and analysis terminology for clarity and consistency
- **Configuration Tests**: Refactored duplication mode tests to use new scoring utilities and configurations
- **Dependencies Update**: Updated package.json and package-lock.json for improved dependencies and features
- **Removed Legacy Configs**: Simplified codebase for clarity and reduced technical debt
- **Aligned Grading**: Grading now aligned with industry standards
- **Improved Type Definitions**: Separated file-level vs. function-level issues
- **Scoring Constants Refinement**: Renamed `EXPONENTIAL_MULTIPLIER` to `QUADRATIC_PENALTY_MULTIPLIER` for mathematical precision
- **Centralized Labeling Functions**: Moved labeling functions to scoring.utils.ts for better organization
- **Enhanced Documentation**: Updated scoring methodology across multiple technical documentation files

### Fixed
- **Commit Message Handling**: Improved processing and validation of commit messages
- **Session Log Updates**: Enhanced session logging with recent terminology changes


## [0.6.0] - 2025-07-13

### Added
- Dual-mode duplication analysis (strict vs legacy thresholds)
- Comprehensive documentation validation system (79+ examples across 11 files)
- Enhanced development workflow commands (`npm run typecheck`, `npm run qa`, `npm run validate-docs`)
- Automated pattern-based validation to prevent documentation drift
- Industry-standard strict duplication thresholds option (`--strict-duplication`)
- Mathematical validation system ensuring 100% accuracy of documented formulas and constants
- Configuration file exclusion and license header filtering in duplication detection

### Changed
- CLI interface: analysis is now the default action (no more `analyze` subcommand required)
- Flag renamed: `--exclude-utility` to `--production` for clarity
- **Modular architecture**: Major refactoring with extraction of specialized components
  - `DependencyResolver` and `DependencyGraph` extracted as standalone modules (~500 lines reduction)
  - `FileDetailBuilder` class for encapsulated file detail construction
  - New `src/analyzer/` directory with 3 specialized modules (`ContextGenerator`, `OverviewCalculator`, `ProjectDiscovery`)
- Enhanced error handling and logging throughout dependency analyzer
- Improved TypeScript coverage and type safety
- Enhanced 8-line sliding window duplication detection algorithm
- Scoring weights adjusted for better complexity/duplication balance
- CLI formatting and color-coded severity indicators improved

### Removed
- `analyze` subcommand (analysis is now the default action)
- `--with-context` flag (functionality integrated into core analysis)
- Monolithic `parser.ts` file (replaced by modular `FileDetailBuilder` class)
- Unused variables and obsolete methods throughout codebase

### Fixed
- Silent error returns in dependency analyzer
- Documentation inconsistencies between examples and implementation
- JSON output formatting with absolutePath filtering


## [0.5.0] - 2025-07-09

### Added
- **Rich Context Extraction for LLM Analysis**: Semantic analysis system that extracts detailed architectural insights from TypeScript/JavaScript files to provide better context for LLM-based code analysis
- **Deep Code Analysis**: Function-level complexity breakdown with pattern detection (async/await, error handling, TypeScript usage, JSX, decorators)
- **Enhanced Architectural Insights**: AST-based structure analysis including imports, exports, classes, functions, interfaces, and dependencies
- **Code Context Summaries**: Comprehensive project-level summaries with complexity distribution, dependency analysis, and code quality metrics
- **Intelligent Code Sampling**: Automatic extraction of complex function samples for detailed analysis and reporting

## [0.4.0] - 2025-07-03

### Added
- **Architectural Impact Analysis**: InsightCode now builds a dependency graph to calculate the `impact` of each file.
- **Advanced Architectural Metrics**: The analysis now identifies "Silent Killers" (high-impact, low-complexity files) and calculates `complexityStdDev`.
- **Enhanced Reporter**: The terminal output now displays the File `Criticism Score`, `Impact`, and a new `Architectural Risks` section.
- **Richer Issue Details**: Issues now include a `ratio` display for better context (e.g., "2.5x limit").
- **Actionable Suggestions**: The reporter provides "Quick Wins" with potential score gains to guide refactoring.
- **Improved Readability**: Numbers in the report now have thousand separators.

### Changed
- **BREAKING CHANGE: Complete Scoring System Overhaul.** The scoring model has been rewritten to use a **criticality-weighted model**. The final project score is now a weighted average based on each file's `Criticality Score` (a combination of its complexity and architectural impact), replacing the old fixed-weight model.
- **Centralized Logic**: All analysis orchestration, scoring, and ranking logic is now unified in `analyzer.ts`.
- **Top File Ranking**: The `Top 5` list is now correctly ranked by `criticismScore`, ensuring the most important files always appear first.
- **Scoring Purity**: The `scoring.ts` module now contains pure, non-configurable functions with research-based thresholds.
- **Configuration Focus**: The `config.ts` module now *only* handles user-configurable thresholds for issue generation (`medium`/`high`).

### Removed
- **Deleted `fileScoring.ts` module**: This module's redundant logic has been removed and replaced by the unified system in `analyzer.ts`.
- **Deleted obsolete types**: The unused `ConfigThresholds` interface was removed from `types.ts`.

### Fixed
- **Architectural Inconsistency**: Eliminated the critical flaw of having multiple, competing scoring systems. The tool now has a single, coherent logic for evaluating code quality.
- **Empty Project Bug**: An empty project now correctly returns a perfect score of 100 instead of 0.
- **Test Suite**: All tests have been rewritten to align with the new, unified architecture, ensuring all core logic is validated.

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
- Updated project self-analysis: B (82/100) full codebase, C (72/100) production-only

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
- `--production` flag to analyze only production code
- Smart file type classification (production, test, example, utility, config)
- Configurable thresholds based on file type
- Better product quality insights by separating concerns

### Changed
- Test files now have more lenient thresholds (complexity < 30, duplication < 50%)
- Example code allows up to 80% duplication
- Utility scripts have balanced thresholds

### Fixed
- ENOBUFS error when analyzing large projects (increased buffer to 50MB)
- All 9 benchmark projects now analyze successfully including TypeScript (2.8M lines)

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
insightcode
insightcode ./src
insightcode --json > report.json
```

---

[Unreleased]: https://github.com/fstepho/insightcode-cli/compare/v0.7.1...HEAD
[0.7.1]: https://github.com/fstepho/insightcode-cli/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/fstepho/insightcode-cli/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/fstepho/insightcode-cli/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/fstepho/insightcode-cli/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/fstepho/insightcode-cli/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/fstepho/insightcode-cli/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/fstepho/insightcode-cli/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fstepho/insightcode-cli/releases/tag/v0.1.0