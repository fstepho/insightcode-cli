# 🧭 How to Use Code Quality Scores Wisely

> An automated score is a starting point, not a final verdict. This is especially true for a deep architectural analysis tool like InsightCode CLI.

## 📊 Understanding InsightCode Scores

InsightCode CLI calculates an **Overall Quality Score** (0-100) using a **criticality-weighted model**. It's based on three core metrics:
- **Cyclomatic Complexity** - The logical complexity of your code.
- **Code Duplication** - The percentage of copy-pasted code.
- **Maintainability** - A score based on file size and function count.

However, the final score is not a simple average. Each file's contribution is weighted by its **Criticality Score**, which is a combination of its own complexity and its architectural **Impact** (how many other files depend on it).

This means a complex but isolated file has less impact on the score than a moderately complex utility file used everywhere.

The overall score translates to a grade:
- **A** (90-100): Exceptional code quality.
- **B** (80-89): Good, production-ready code.
- **C** (70-79): Acceptable, some refactoring may be needed.
- **D** (60-69): Poor, indicates significant technical debt.
- **F** (0-59): Critical, suggests major architectural or quality challenges.

## 🟢 Best Practices with InsightCode CLI

| ✔️ Good Practice | 💡 Why? | 🛠️ InsightCode Command |
|------------------|---------|------------------------|
| **Focus on Criticality** | The tool guides you to the most important files. | Check `Top 5 Critical Files` & `Architectural Risks` first. |
| **Analyze Production Code** | Avoid noise from tests and configuration files. | `insightcode --exclude-utility` |
| **Track Trends Over Time** | See if quality improves or degrades with new features. | Integrate the JSON output in your CI/CD pipeline. |
| **Combine with Human Review** | Context is king! A score can't understand business logic. | The score is a conversation starter, not a judgment. |
| **Justify Outliers** | Not all complexity is bad. | See our [explained benchmarks](./../benchmarks/). |

## 🔴 What to Avoid

| 🚫 Don't Do This | ⚠️ Why Not? | 📊 Real Example |
|------------------|-------------|-----------------|
| **Judge only by the grade** | A low score on a complex system is often expected. | `TypeScript` gets an **F**, but it's a compiler—one of the most complex types of software. |
| **Blindly compare projects** | The nature and size of projects matter immensely. | A utility library (`chalk`: B) cannot be fairly compared to a UI framework (`react`: F). |
| **Refactor just to "improve the score"**| This can harm stability or readability. | Algorithmic complexity is sometimes necessary for performance. |
| **Use for developer evaluation** | It's a tool for understanding code, not people. | Focus on learning and collaborative improvement. |

## 📈 Quick Visual Guide

```text
Low score (<60)?                High score (>80)?
      │                              │
      ▼                              ▼
Check the report for:          Manual review:
- High Complexity?             - Is complexity justified?
- High Duplication?              └─ Yes: Algorithm, parser, compatibility layer
- "Silent Killers"?              └─ No: Spaghetti code, legacy issues
      │                              │
      ▼                              ▼
Action: Review critical files  Action: Team review → 
and architectural risks.       Refactor/Document/Accept
````

## 🛠️ Useful InsightCode Commands

```bash
# Basic analysis with visual score
insightcode

# Focus on production code only
insightcode --exclude-utility

# JSON export for tracking/CI
insightcode --json > quality-report.json

# Exclude specific patterns
insightcode --exclude "**/*.spec.ts,**/vendor/**"
```

## 🎯 When to Take Action

### High Priority (Fix Soon)

  - Files listed in the **Top 5 Critical Files**.
  - Files identified as **Architectural Risks (Silent Killers)**.
  - Duplication \>40% in core production code.

### Medium Priority (Plan Refactoring)

  - Complexity between 20-50 in non-critical paths.
  - Duplication in test setup/teardown that is becoming hard to manage.
  - Large files (\>500 lines) with moderate complexity.

### Low Priority (Monitor or Accept)

  - Justified complexity (algorithms, parsers, compilers).
  - Duplication in generated code or vendored libraries.

## 🏆 Insights from Our Benchmarks

| Project | Grade | Score | Key Insight from InsightCode |
|---|---|---|---|
| **uuid** | B | 88/100 | Clean, focused, and well-structured. A model library. |
| **chalk** | B | 82/100 | Minimal complexity and duplication, a sign of high quality. |
| **jest** | D | 63/100 | The low score is driven by a very high duplication rate (41.9%). |
| **React** | F | 47/100 | Massive duplication (44.2%) and high complexity in core files like the reconciler. |
| **TypeScript** | F | 38/100 | The lowest score, driven by extreme, but justified, complexity in the compiler core (`checker.ts`). |

**Lesson**: An F score doesn't always mean "bad code." It means the code presents a significant maintenance challenge according to our metrics, which is expected for projects like React and TypeScript.

-----

📚 **Learn More**:

  - [Full Benchmark Report](../benchmarks/benchmark-report-production-2025-07-03.md)
  - [Our Duplication Detection Philosophy](./DUPLICATION_DETECTION_PHILOSOPHY.md)
  - [Academic Justification for Our Thresholds](./SCORING_THRESHOLDS_JUSTIFICATION.md)
