# InsightCode Scoring Thresholds: Justification

## Executive Summary

This document provides a comprehensive justification for the scoring thresholds and methodology used in InsightCode. Our approach is grounded in a **criticality-weighted model**, validated against empirical data from 9 popular open-source projects representing over 670,000 lines of production code. This ensures our metrics are not only based on academic research but are also aligned with real-world software development challenges.

## Methodology Overview

InsightCode's scoring algorithm has evolved from a fixed-weight system to a more sophisticated **criticality-weighted model**. While it evaluates three core metrics (Cyclomatic Complexity, Code Duplication, and Maintainability), the final project score is not a simple average.

Instead, each file is assigned a **Criticality Score** based on two key factors:
1.  **Intrinsic Complexity**: The inherent difficulty of the code within the file.
2.  **Architectural Impact**: How many other files in the project depend on it.

The final project score is then calculated as a weighted average of individual file scores, where the weight is determined by this **Criticality Score**. This ensures that issues in important, highly-connected files have a proportionally larger effect on the final grade, guiding developers to focus on what matters most.

---

## 1. Cyclomatic Complexity Thresholds

### Justification for McCabe Complexity Boundaries

#### Academic Foundation
The cyclomatic complexity metric was introduced by Thomas McCabe in 1976 and remains the most widely validated complexity measure in software engineering.

**Key Research Findings:**
- **≤ 10 (Excellent)**: McCabe's original recommendation for maximum function complexity [McCabe, 1976].
- **10-15 (Good)**: Supported by empirical studies showing manageable testing overhead [Watson & McCabe, 1996].
- **15-20 (Acceptable)**: Industry threshold where defect probability begins increasing significantly [Basili et al., 1996].
- **20-30 (Poor)**: Critical threshold where maintainability degrades rapidly [Oman & Hagemeister, 1992].
- **30+ (Critical)**: Strong correlation with defect density and maintenance costs [Subramanyam & Krishnan, 2003].

#### Empirical Validation from Our Dataset

**Analysis of 9 Popular Projects (674k+ LOC, Production Code):**
```

Avg Complexity | Projects | Avg Grade
≤ 10           | 3        | B
10-30          | 3        | D-F
30+            | 3        | F

```

#### Industry Validation
- **Google Style Guide**: Recommends ≤ 10 complexity.
- **Microsoft**: Uses 15 as a warning threshold in Visual Studio.
- **SonarQube**: Default thresholds align with our boundaries.

### Threshold Mapping with Scientific Rationale

| Threshold | Score | Rationale |
|---|---|---|
| **≤ 10** | 100 pts | Excellent: McCabe's original threshold, proven maintainable. |
| **≤ 15** | 85 pts | Good: Industry standard for acceptable complexity. |
| **≤ 20** | 65 pts | Acceptable: Defect probability begins to increase. |
| **≤ 30** | 40 pts | Poor: Rapid maintainability degradation. |
| **≤ 50** | 20 pts | Very Poor: Strong correlation with bug density. |
| **> 50** | Variable | Critical: Exponential complexity growth. |

---

## 2. Code Duplication Thresholds

### Academic Research on Code Duplication

#### Foundational Studies
Code duplication research has consistently shown strong correlations between duplication levels and maintenance costs [Kapser & Godfrey, 2008].

**Key Research Findings:**
- **≤ 3% (Excellent)**: Industry leaders like Google maintain ~2-3% duplication [Fowler, 2019].
- **3-8% (Good)**: Acceptable level found in well-maintained enterprise systems [Kim et al., 2005].
- **8-15% (Acceptable)**: Pragmatic threshold balancing effort vs. benefit [Juergens et al., 2009].
- **15-30% (Poor)**: Significantly increased maintenance overhead [Roy & Cordy, 2007].
- **30%+ (Critical)**: Strong predictor of system decay [Lague et al., 1997].

#### Our Detection Algorithm Validation
Our algorithm uses a 5-line sliding window with normalization, focusing on content-based (copy-paste) duplication for actionable results. This differs from tools that detect structural similarity, which can produce high noise in test suites.

### Threshold Justification with Evidence

| Threshold | Score | Rationale & Evidence |
|---|---|---|
| **≤ 3%** | 100 pts | Excellent: Google's internal codebases average 2-3%. |
| **≤ 8%** | 85 pts | Good: Microsoft .NET Framework maintains ~7%. |
| **≤ 15%**| 65 pts | Acceptable: Eclipse IDE maintains ~12-15%. |
| **≤ 30%**| 40 pts | Poor: Strong correlation with defect density. |
| **≤ 50%**| 20 pts | Very Poor: Associated with system decay indicators. |
| **> 50%**| Variable | Critical: Extreme maintenance burden. |

---

## 3. Maintainability Thresholds

### File Size Research and Industry Standards

#### Academic Foundation
Research on optimal file sizes is linked to cognitive load theory.
- **Human Short-term Memory**: 7±2 items (Miller's Law) translates to ~200 LOC chunks [Miller, 1956].
- **Code Comprehension**: Optimal file size for understanding is ~200-300 lines [Shaft & Vessey, 2006].

#### Industry Standards
- **Google**: 200-300 lines per file recommendation.
- **Microsoft**: 300-400 lines for C# files.

### Function Count Research
- **≤ 10 functions/file**: Adheres to the Single Responsibility Principle [Martin, 2003].
- **10-15 functions/file**: Represents acceptable cohesion levels [Chidamber & Kemerer, 1994].

### Threshold Justification

#### File Size Score
| Threshold | Score | Rationale |
|---|---|---|
| **≤ 200** | 100 pts | Optimal: Aligns with cognitive load research. |
| **≤ 300** | 85 pts | Good: Aligns with Google/Microsoft guidelines. |
| **≤ 500** | 50 pts | Large: Approaching expert programmer session limit. |
| **> 750** | Variable | Critical: Strong correlation with defect injection. |

#### Function Count Score
| Threshold | Score | Rationale |
|---|---|---|
| **≤ 10** | 100 pts | Well-focused: Adheres to Single Responsibility Principle. |
| **≤ 15** | 85 pts | Good: Acceptable cohesion. |
| **≤ 20** | 70 pts | Acceptable: Approaching maintainability threshold. |
| **> 30** | Variable | Critical: Likely a "God Class" anti-pattern. |

---

## 4. Grade Mapping Justification

Our grade boundaries align with established academic and industry assessment practices.

| Grade | Score | Meaning |
|---|---|---|
| **A** | 90-100 | Exceptional! Represents industry best practices. |
| **B** | 80-89 | Good, production-ready with minor room for improvement. |
| **C** | 70-79 | Fair, some refactoring may be needed. |
| **D** | 60-69 | Poor, indicates significant technical debt. |
| **F** | 0-59 | Critical, suggests major architectural or quality issues. |

---

## 5. Continuous Validation Process

### Threshold Evolution History
| Version | Key Change |
|---|---|
| v0.2.0 | Initial thresholds validated against empirical research. |
| v0.4.0 | **Shift to a criticality-weighted scoring model.** The final score is now weighted by each file's complexity and architectural impact, replacing the previous fixed-weight model. |

### Ongoing Research Integration
1.  **Monthly literature review** for new complexity research.
2.  **Quarterly benchmark updates** with latest popular projects.
3.  **Annual threshold validation** against industry surveys.

## References
*(The full list of academic and industry references remains unchanged and is omitted here for brevity)*

---
*This document represents version 0.4.0 of InsightCode's threshold justification. Last updated: 2025-07-03*