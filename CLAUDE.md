# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InsightCode CLI is a TypeScript code quality analyzer that runs 100% locally. It's a published NPM package (`insightcode-cli`) designed for zero-config analysis of TypeScript/JavaScript codebases. Its key differentiator is a **criticality-weighted scoring model** that prioritizes issues based on code complexity and architectural impact.

## Development Commands

```bash
# Run CLI on current directory
npm start -- analyze .

# Run the full test suite
npm test

# Run tests with coverage report
npm test -- --coverage

# Build for production
npm run build

# Run the full benchmark against 9 popular projects
npm run benchmark

# Run the benchmark on production code only
npm run benchmark:production

# Validate calculation accuracy
node scripts/validate.js

# Test the globally linked CLI
insightcode analyze
````

## Architecture

### Core Philosophy

  * **Criticality-First**: The importance of an issue depends on the file's complexity and its architectural impact.
  * **KISS Principle**: Keep It Stupid Simple.
  * **Maximum 5 dependencies** (currently 4).
  * **100% local analysis**; code never leaves the user's machine.
  * **Stateless architecture**: No database, no persistent cache.

### Codebase Structure

```
src/
├── cli.ts              # Commander.js CLI entry point
├── parser.ts           # TypeScript AST parsing logic
├── analyzer.ts         # CORE: Calculates all metrics, impact, and criticality scores
├── reporter.ts         # Renders terminal output with chalk
├── scoring.ts          # Pure functions to convert raw metrics to scores (0-100)
├── dependencyAnalyzer.ts # AST-based dependency graph analysis to calculate file impact
├── duplication.ts      # Logic for duplication detection
└── types.ts            # All TypeScript interfaces for the project

tests/                  # Vitest test suite
├── parser.test.ts
├── analyzer.test.ts
└── integration.test.ts

scripts/                # Validation & benchmarking
├── benchmark.ts
└── validate.js
```

### Dependencies (Minimalist Stack)

  * `commander`: CLI framework
  * `typescript`: Compiler API for AST parsing
  * `chalk`: Terminal colors
  * `fast-glob`: File pattern matching

## Core Algorithms

### 1\. Cyclomatic Complexity

Uses the extended McCabe's algorithm (including `&&` and `||` operators) via the TypeScript Compiler API.

### 2\. Code Duplication

Pragmatic content-based detection using a 5-line sliding window with normalization. Focuses on actual copy-paste rather than structural similarity, which avoids false positives in test suites.

### 3\. Maintainability (Size & Structure)

Evaluates file maintainability based on lines of code and function count, with different thresholds for production vs. test code.

### Overall Score Calculation

The final project score is a **criticality-weighted average**.

1.  For each file, a **Criticality Score** is calculated (`complexity` + `impact`).
2.  The final score is an average of individual file quality scores, weighted by this `Criticality Score`.
3.  This ensures that issues in complex, highly-interconnected files have a larger impact on the final grade.

## Test Framework

Uses **Vitest** with the Node.js environment. Tests are located in the `tests/` directory and can be run with `npm test`.

## Development Guidelines

### Code Style
- Explicit over clever code
- TypeScript strict mode enabled

- **Comments Philosophy**: 
  - No redundant comments that explain WHAT the code does
  - DO comment WHY when the reason isn't obvious
  - DO comment performance optimizations or workarounds
  - DO comment business logic decisions
  
```typescript
// ❌ Bad: Redundant comment
// Increment counter by 1
counter++;

// ✅ Good: Explains non-obvious decision
// 50MB buffer prevents ENOBUFS on TypeScript repo (2.8M lines)
const maxBuffer = 1024 * 1024 * 50;

// ✅ Good: Documents performance choice
// Pre-compile regex outside loop for 10x performance gain
const IMPORT_REGEX = /^import\s+.+from\s+['"].+['"];?$/;

// ✅ Good: Clarifies business logic
// Industry standard: 15% duplication is acceptable in practice
if (duplication <= 15) return 65;
```

- **Self-Documenting Code First**:
  - Use descriptive variable/function names
  - Prefer explicit over clever
  - Structure code to tell a story
  
- **When Comments ARE Necessary**:
  - Edge cases and workarounds
  - Performance optimizations
  - Business rule justifications  
  - Complex algorithms (with examples)
  - TODO/FIXME with context


### Constraints
- **Never exceed 5 NPM dependencies**
- **No over-engineering** (no DI, no complex abstractions)
- **Performance over premature optimization**
- **Useful error messages** for users
- **No synchronous user support** (automate everything)

## Key Files

### Critical Implementation Files
- `src/parser.ts:127` - TypeScript AST parsing logic
- `src/analyzer.ts:108` - Core metric calculations  
- `src/reporter.ts:103` - Terminal output formatting

### Important Scripts
- `scripts/benchmark.ts` - Enhanced TypeScript benchmark with stable version cloning (19 projects)
- `scripts/validate.js` - Proves 100% calculation accuracy

## Recent Enhancements (v0.4.0)

  * **Shift to Criticality-Weighted Scoring**: Replaced the old fixed-weight model. The final score is now weighted by each file's complexity and architectural **Impact**, providing a more accurate assessment of project health.
  * **Unification of Scoring Logic**: All ranking and scoring logic is now centralized in `src/analyzer.ts`. The redundant `src/fileScoring.ts` module has been **deleted**.
  * **Introduction of Advanced Architectural Metrics**: The analysis now identifies **"Silent Killers"** (high-impact, low-complexity files) and calculates the **Standard Deviation** of complexity to detect code monoliths.

## CLI Usage

```bash
# Basic analysis
insightcode analyze [path]

# JSON output for CI/CD
insightcode analyze --json

# Production-only analysis (excludes tests, examples, etc.)
insightcode analyze --exclude-utility

# Exclude specific patterns
insightcode analyze --exclude "**/*.spec.ts" --exclude "**/vendor/**"

# Custom configuration
insightcode analyze --config ./custom-config.json
```

## When Making Changes

1.  **Run tests first**: `npm test`
2.  **Validate with a quick benchmark run**: `npm run benchmark`
3.  **Check self-analysis score**: `npm start -- analyze .`
4.  **Build before commit**: `npm run build`

## 📚 Extended Documentation

For detailed information, refer to:

  - `docs/DECISIONS.md` - Architectural decisions with rationale.
  - `docs/SCORING_THRESHOLDS_JUSTIFICATION.md` - Academic research behind our metrics.
  - `docs/DUPLICATION_DETECTION_PHILOSOPHY.md` - Why our approach differs from SonarQube.
  - `README.md` - User-facing documentation.
  - `.ai/DOC_MAINTENANCE_CHECKLIST.md` - Documentation update process
- `.ai/AI_PROMPTS.md` - Reusable AI prompts
- `benchmarks/` - Real-world validation results

## 🎯 Quick Task Reference

Before starting work:
1. Check `.ai/CURRENT_TASK.md` for active tasks
2. Review recent decisions in `docs/DECISIONS.md`
3. Update progress in `.ai/AI_CONTEXT.md` after sessions

The project prioritizes simplicity, accuracy, and user experience over complex features.