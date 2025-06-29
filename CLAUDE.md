# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InsightCode CLI is a TypeScript code quality analyzer that runs 100% locally. It's a published NPM package (`insightcode-cli` v0.3.0) designed for zero-config analysis of TypeScript/JavaScript codebases.

## Development Commands

```bash
# Development
npm run dev          # Start development server with tsx watch, do not use in claude code prompts because it requires a terminal to watch files 
npm run start -- analyze  # Run CLI on current directory (equivalent to `insightcode analyze .`)
# Testing  
npm test            # Run Vitest test suite (27 tests)
npm test -- --coverage  # Run tests with coverage report

# Building
npm run build       # Compile TypeScript to dist/
npm run prepublishOnly  # Auto-run before npm publish

# Validation & Benchmarking
npm run benchmark   # Analyze 19 popular open-source projects (enhanced reporting with v0.3.0+ scoring)
npm run benchmark:production  # Production-only analysis with --exclude-utility
node scripts/validate.js  # Verify calculation accuracy (100% validated)

# Local Installation Testing
npm link           # Install CLI globally for testing
insightcode analyze  # Test the installed CLI
```

## Architecture

### Core Philosophy
- **KISS Principle**: Keep It Stupid Simple
- **Maximum 5 dependencies** (currently 4)
- **Zero configuration** for basic usage
- **100% local analysis** - never sends code to cloud
- **Stateless architecture** - no database, no persistent cache

### Codebase Structure (1,671 lines total)
```
src/                    # ~738 lines - all core logic
├── cli.ts              # Commander.js CLI entry point  
├── parser.ts           # TypeScript AST parsing with ts.createSourceFile()
├── analyzer.ts         # Calculate 3 core metrics with file type classification
├── reporter.ts         # Terminal output with chalk colors & ASCII bars
└── types.ts            # TypeScript interfaces

tests/                  # ~900 lines
├── parser.test.ts      # Parser unit tests
├── analyzer.test.ts    # Analyzer unit tests  
└── integration.test.ts # End-to-end CLI tests

scripts/                # Validation & benchmarking
├── benchmark.js        # Analyze popular projects with --exclude-utility support
└── validate.js         # Prove 100% calculation accuracy
```

### Dependencies (Minimalist Stack)
- `commander`: CLI framework
- `typescript`: Compiler API for AST parsing
- `chalk`: Terminal colors
- `fast-glob`: File pattern matching

## Core Algorithms

### 1. Cyclomatic Complexity (40% weight)
Uses extended McCabe's algorithm (including && and || operators) with TypeScript Compiler API. Counts decision points:
- Control flow: `if`, `for`, `while`, `switch case`
- Logical operators: `&&`, `||`
- Ternary operators: `? :`
- Exception handling: `catch`

**100% validated accuracy** through extensive testing.

### 2. Code Duplication (30% weight)  
Pragmatic content-based detection using 5-line sliding window with normalization. Focuses on actual copy-paste rather than structural similarity (~85% accuracy, avoids false positives).

**Philosophy**: Content over structure - reports 6% duplication on benchmark files vs SonarQube's 70%, focusing on actionable refactoring opportunities.

### 3. Maintainability Score (30% weight)
Composite score (0-100) with A-F grading based on complexity, duplication, and file size.

## Test Framework

Uses **Vitest** with Node.js environment:
- 27 tests total, 100% passing
- Test files in `tests/` directory  
- Coverage reporting available
- Integration tests validate full CLI workflow

## Development Guidelines

### Code Style
- Prefer functions over classes
- Functional programming patterns
- Explicit over clever code
- No comments unless absolutely necessary
- TypeScript strict mode enabled

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
- `scripts/benchmark.js` - Enhanced validation against 19 popular projects with v0.3.0+ scoring
- `scripts/validate.js` - Proves 100% calculation accuracy

### Documentation
- `docs/AI_CONTEXT.md` - Complete project context and development history
- `docs/DUPLICATION_DETECTION_PHILOSOPHY.md` - Pragmatic vs structural approach (vs SonarQube)
- `docs/SCORING_THRESHOLDS_JUSTIFICATION.md` - Academic justification for all thresholds
- `docs/benchmarks/` - Real-world validation results
- `README.md` - User documentation with methodology

## Current Status

- **Version**: 0.2.0 published on NPM
- **Self-analysis score**: C (80/100) - stable after complexity display fix
- **Performance**: 62,761 lines/second analysis speed (latest full benchmark)
- **Production analysis**: 18,490 lines/second with `--exclude-utility` flag
- **Project grade among peers**: 16% achieve A grade, 42% achieve B grade among popular projects
- **Zero critical bugs** reported since publication
- **Recent fix**: Reporter complexity calculation now matches analyzer logic (2025-06-28)

## CLI Usage

```bash
# Basic analysis
insightcode analyze [path]

# JSON output for CI/CD
insightcode analyze --json

# Production-only analysis (exclude tests, examples, configs)
insightcode analyze --exclude-utility

# Exclude patterns  
insightcode analyze --exclude "**/*.spec.ts" --exclude "**/vendor/**"
```

## When Making Changes

1. **Run tests first**: `npm test` 
2. **Validate with benchmarks**: `npm run benchmark`
3. **Test CLI locally**: `npm link && insightcode analyze`
4. **Check self-analysis score**: Should remain stable at C (80/100)
5. **Build before commit**: `npm run build`

## 📚 Extended Documentation

For detailed information, refer to:
- `docs/AI_CONTEXT.md` - Full project history, metrics, session logs
- `docs/DUPLICATION_DETECTION_PHILOSOPHY.md` - Why our approach differs from SonarQube
- `docs/SCORING_THRESHOLDS_JUSTIFICATION.md` - Academic research behind thresholds
- `docs/CURRENT_TASK.md` - Active development task and checklist
- `docs/DECISIONS.md` - Architectural decisions with rationale
- `docs/DOC_MAINTENANCE_CHECKLIST.md` - Documentation update process
- `docs/AI_PROMPTS.md` - Reusable AI prompts

## 🎯 Quick Task Reference

Before starting work:
1. Check `docs/CURRENT_TASK.md` for active tasks
2. Review recent decisions in `docs/DECISIONS.md`
3. Update progress in `docs/AI_CONTEXT.md` after sessions

The project prioritizes simplicity, accuracy, and user experience over complex features.