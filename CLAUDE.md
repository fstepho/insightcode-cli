# Claude Code Assistant Guide

When working on InsightCode CLI, read `.ai.md` first for current context.

## 🏗️ Architecture Map

### Source Code Structure
```
src/                           # ~1,400 lines total
├── cli.ts:51                  # CLI entry point - Commander.js setup
├── parser.ts:340              # TypeScript AST parsing - complexity calculation
├── analyzer.ts:151            # Core analysis - criticality-weighted scoring
├── reporter.ts:187            # Terminal output - colored results with chalk
├── scoring.ts:152             # Scoring functions - 40/30/30 weight distribution
├── dependencyAnalyzer.ts:50   # Dependency graph - architectural impact
├── duplication.ts:100         # Duplication detection - 5-line sliding window
├── config.ts:125              # Configuration - JSON config file support
├── projectInfo.ts:25          # Project info - package.json extraction
└── types.ts:89                # TypeScript types - all interfaces
```

### Test Structure
```
tests/                         # ~1,479 lines total
├── parser.test.ts             # AST parsing validation
├── analyzer.test.ts           # Core algorithm tests
├── integration.test.ts        # End-to-end CLI tests
└── config.test.ts             # Configuration system tests
```

### Scripts & Tools
```
scripts/
├── benchmark.ts               # Analyze 9 popular projects
└── validate.js                # Validate accuracy against test cases
```

### Key Files by Complexity
```
1. parser.ts:340          ⭐⭐⭐⭐⭐  Most complex - AST traversal
2. reporter.ts:187        ⭐⭐⭐⭐   Terminal formatting logic
3. analyzer.ts:151        ⭐⭐⭐⭐   Core scoring algorithm
4. scoring.ts:152         ⭐⭐⭐    Pure math functions
5. config.ts:125          ⭐⭐⭐    JSON validation
6. duplication.ts:100     ⭐⭐⭐    Hash comparison
7. types.ts:89            ⭐⭐     Just interfaces
8. dependencyAnalyzer.ts:50 ⭐⭐   Import regex
9. cli.ts:51              ⭐      Simple setup
10. projectInfo.ts:25     ⭐      JSON reading
```

### Dependency Tree (Runtime)
```
insightcode-cli
├── commander@13.1.0      # CLI framework
├── typescript@5.8.3      # AST parsing
├── chalk@4.1.2          # Terminal colors
└── fast-glob@3.3.3      # File matching
```

### Data Flow
```
CLI Command → cli.ts
    ↓
File Discovery → fast-glob
    ↓
Parse Files → parser.ts (TypeScript AST)
    ↓
Calculate Metrics → analyzer.ts
    ├── Complexity → parser.ts
    ├── Duplication → duplication.ts
    └── Dependencies → dependencyAnalyzer.ts
    ↓
Score Calculation → scoring.ts (40/30/30)
    ↓
Output → reporter.ts (terminal) or JSON
```

### Critical Implementation Points
- **parser.ts:127** - Cyclomatic complexity visitor
- **analyzer.ts:108** - Criticality weighting logic
- **scoring.ts:45** - 40/30/30 weight distribution
- **duplication.ts:73** - Block normalization
- **reporter.ts:156** - Top files ranking

## 💡 Code Style for Claude

### Comments Philosophy
```typescript
// ❌ Bad: Redundant
// Increment counter
counter++;

// ✅ Good: Explains WHY
// 50MB buffer prevents ENOBUFS on TypeScript repo
const maxBuffer = 1024 * 1024 * 50;
```

### Self-Documenting Code
- Descriptive names > comments
- Explicit > clever
- Structure tells the story

## 🔧 Key Algorithms

### Criticality Scoring
```typescript
criticality = complexity + architectural_impact
weight = criticality / total_criticality
final_score = Σ(file_score * weight)
```

### Duplication Detection
- 5-line sliding window
- Content-based, not structural
- Pragmatic over academic

## 🚫 Constraints
- Max 5 NPM dependencies (currently 4)
- No DI, no complex abstractions
- 100% local, zero network calls
- Maintenance < 1h/week

## 🎯 When Modifying
1. Check `.ai.md` for current metrics
2. Run `npm test` before changes
3. Use `git ai "message"` for commits
4. Keep it SIMPLE