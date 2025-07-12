# Changelog

All notable changes to InsightCode CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.1] [Unreleased] - Documentation & QA

### Added
- **Enhanced Documentation**: Comprehensive audit and update of all technical documentation
- **Mathematical Validation**: Verified all scoring formulas and constants match implementation
- **Version Clarity**: Clear distinction between v0.6.0 (major refactor, ready for release) and v0.6.1 (documentation/QA focus)
- **Accuracy Improvements**: Updated all metrics, dependency counts, and technical specifications in documentation

### Changed
- **Documentation Consistency**: All technical docs now accurately reflect current codebase state
- **Version References**: Updated all documentation to use v0.6.1 as current development focus
- **Technical Accuracy**: Synchronized all formulas, constants, and methodology descriptions with actual implementation

### Fixed
- **Documentation Drift**: Eliminated inconsistencies between documentation and code
- **Version Confusion**: Clarified release status and development timeline
- **Technical Accuracy**: Corrected all mathematical formulas and scoring methodology descriptions

## [0.6.0] [Ready for Release] - Major Scoring System Refactor

### ✨ What's New

**Dual-Mode Duplication Analysis**: InsightCode now offers two duplication analysis modes to accommodate different project contexts and quality standards.

### 🎯 Problem Solved

Previous versions used permissive duplication thresholds (≤15% = excellent) that were 5x more lenient than industry standards (SonarQube: ≤3%). This created confusion about actual code quality and made InsightCode incompatible with strict DevOps environments.

### 🔧 New CLI Option

```bash
# Strict mode - Industry standards (SonarQube/Google aligned)
insightcode analyze . --strict-duplication

# Legacy mode - Permissive thresholds (default, maintains compatibility)
insightcode analyze .
```

### 📊 Threshold Comparison

| Mode | Excellent | Acceptable | Critical | Use Case |
|------|-----------|------------|----------|----------|
| **Strict** | ≤3% | ≤8% | ≤15% | New projects, high standards |
| **Legacy** | ≤15% | ≤30% | ≤50% | Brownfield, gradual improvement |

### 🎨 Visual Indicators

Reports now clearly display the active duplication mode:

```
Duplication Score:   88/100  ██████████████████░░
Duplication Mode:   Legacy (Permissive for Brownfield)

Duplication Score:   75/100  ███████████████░░░░░
Duplication Mode:   Strict (Industry Standards: SonarQube/Google)
```

### 📈 Impact Example

For 30% duplication in a project:

- **Legacy Mode**: Score 88/100, Grade A, no critical files
- **Strict Mode**: Score 75/100, Grade A, 2 critical files identified

### 🛠️ Technical Implementation

- **Type-safe configuration**: Full TypeScript support with enums and interfaces
- **Non-breaking change**: Legacy mode remains default
- **Complete propagation**: Mode affects scoring, health calculation, and reporting
- **API persistence**: Mode information included in JSON outputs for CI/CD integration

### 📚 Documentation

- **User Guide**: `/docs/DUPLICATION_MODES_USER_GUIDE.md`
- **Technical Audit**: `DUPLICATION_THRESHOLDS_AUDIT.md`
- **CLI Help**: Option documented in `--help`

### 🧪 Testing

```bash
# Quick test of both modes
npm run test:duplication-modes

# Full validation suite
npm run qa
```

### ⚡ Quick Start

```bash
# Install/update
npm install -g insightcode-cli

# Analyze with industry-standard strict thresholds
insightcode analyze src/ --strict-duplication --format json

# Compare with legacy mode
insightcode analyze src/ --format json
```

### 🎯 Recommendations

- **New projects**: Use `--strict-duplication` for industry-aligned standards
- **Legacy codebases**: Start with default mode, gradually adopt strict
- **CI/CD**: Choose mode based on team maturity and quality goals

### 🔄 Migration Path

1. **Baseline**: Run analysis in legacy mode to establish current state
2. **Assess**: Use strict mode to understand gaps vs industry standards  
3. **Improve**: Address critical issues identified in strict mode
4. **Adopt**: Gradually migrate CI/CD pipelines to strict mode


### 🏆 Benefits

- ✅ **Industry Alignment**: Scores now comparable with SonarQube, CodeClimate
- ✅ **Transparency**: Clear indication of which mode is active
- ✅ **Flexibility**: Choose appropriate strictness for project context
- ✅ **Backward Compatibility**: Existing workflows unchanged
- ✅ **Academic Honesty**: No more misleading "excellent" scores for poor duplication

### 📊 Validation Results

All existing tests pass + 12 new tests specifically for duplication modes. Documentation automatically validated for accuracy.


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
- **Enhanced Reporter**: The terminal output now displays the `Criticism Score`, `Impact`, and a new `Architectural Risks` section.
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
insightcode analyze
insightcode analyze ./src
insightcode analyze --json > report.json
```

---

[Unreleased]: https://github.com/fstepho/insightcode-cli/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/fstepho/insightcode-cli/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/fstepho/insightcode-cli/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/fstepho/insightcode-cli/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/fstepho/insightcode-cli/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fstepho/insightcode-cli/releases/tag/v0.1.0