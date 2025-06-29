# 🧭 How to Use Code Quality Scores Wisely

> Automated scores are a starting point, not a verdict! Especially important for static analysis tools like InsightCode CLI.

## 📊 Understanding InsightCode Scores

InsightCode CLI calculates an **Overall Quality Score** (0-100) based on three metrics:
- **Cyclomatic Complexity** (40% weight) - Code complexity based on control flow
- **Code Duplication** (30% weight) - Percentage of duplicated code blocks
- **Maintainability** (30% weight) - File size and function count

This overall score translates to a grade:
- **A** (90-100): Excellent code quality
- **B** (80-89): Good code quality  
- **C** (70-79): Acceptable, some refactoring needed
- **D** (60-69): Poor, significant refactoring recommended
- **F** (0-59): Critical, major architectural issues

## 🟢 Best Practices with InsightCode CLI

| ✔️ Good Practice | 💡 Why? | 🛠️ InsightCode Command |
|------------------|---------|------------------------|
| Identify high-complexity files | Focus review efforts | `insightcode analyze --json \| jq '.topFiles'` |
| Analyze production code only | Avoid test/config noise | `insightcode analyze --exclude-utility` |
| Track trends over time | See if quality improves | Integrate in CI/CD with history |
| Combine with human review | Context matters! | Score ≠ whole story |
| Justify outliers | Not all complexity is bad | See our [explained benchmarks](./docs/benchmarks/) |

## 🔴 What to Avoid

| 🚫 Don't Do This | ⚠️ Why Not? | 📊 Real Example |
|------------------|-------------|-----------------|
| Judge only by global score | Complexity ≠ poor engineering | lodash: F (deliberate), React: B (excellent) |
| Blindly compare different projects | Nature/size matters | Utility lib ≠ Framework ≠ Compiler |
| Refactor just to "improve the score" | Can harm stability | Algorithmic complexity is sometimes necessary |
| Use for developer evaluation | Teams are more than a number | Focus on learning |
| Ignore justifiable complexity | Some domains require it | Parsers, algorithms, compatibility |

## 📈 Quick Visual Guide

```text
Low score (<60)?                High score (>80)?
      │                              │
      ▼                              ▼
Quick check:                   Manual review:
- Simple code?                 - Justified complexity?
- Missing tests?                 └─ Yes: Algorithm, parsing, perf
- Duplication?                   └─ No: Spaghetti, legacy
      │                              │
      ▼                              ▼
Action: Add tests              Action: Team review → 
                               Refactor/Document/Accept
```

## 🛠️ Useful InsightCode Commands

```bash
# Basic analysis with visual score
insightcode analyze

# Focus on production code only
insightcode analyze --exclude-utility

# JSON export for tracking/CI
insightcode analyze --json > quality-report.json

# Exclude specific patterns
insightcode analyze --exclude "**/*.spec.ts,**/vendor/**"
```

## 📊 Our Thresholds and Their Justification

- **Cyclomatic Complexity**: >10 = warning, >20 = error ([academic justification](./docs/SCORING_THRESHOLDS_JUSTIFICATION.md))
- **Duplication**: Focus on actual copy-paste, not patterns ([philosophy](./docs/DUPLICATION_DETECTION_PHILOSOPHY.md))
- **Grade A**: Only 16% of popular projects achieve it!

## 💡 Real Example: lodash

```text
lodash: Grade F (16/100)
├─ Complexity: 1659 😱
├─ Duplication: 47%
└─ BUT: Deliberate architecture for universal compatibility
         → Single file = Single <script> tag
         → Assumed trade-off: UX > Maintainability
```

**Lesson**: An F score doesn't always mean bad code. Check our [detailed analyses](./docs/benchmarks/) to understand the context.

## 🎯 When to Take Action

### High Priority (Fix Soon)
- Files with complexity >50 AND high churn rate
- Duplication >40% in production code
- Multiple issues in the same module

### Medium Priority (Plan Refactoring)
- Complexity 20-50 in non-critical paths
- Duplication in test setup/teardown
- Large files (>500 lines) with moderate complexity

### Low Priority (Monitor)
- Justified complexity (algorithms, parsers)
- Test file duplication
- Generated or vendor code

## 🏆 Success Stories from Benchmarks

| Project | Grade | Score | Key Insight |
|---------|-------|-------|-------------|
| chalk | A | 96/100 | Clean, focused purpose |
| axios | B | 87/100 | Well-structured HTTP client |
| React | B | 81/100 | Complex but well-managed |
| TypeScript | F | 4/100 | Compiler complexity justified |

---

📚 **Learn More**: 
- [Benchmarks of 19 Popular Projects](./docs/benchmarks/benchmark-2025-06-28.md)
- [Duplication Detection Philosophy](./docs/DUPLICATION_DETECTION_PHILOSOPHY.md)
- [Academic Threshold Justification](./docs/SCORING_THRESHOLDS_JUSTIFICATION.md)