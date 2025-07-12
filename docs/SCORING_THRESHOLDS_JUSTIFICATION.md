# InsightCode Scoring Thresholds: Justification - v0.6.1

## Executive Summary

This document provides comprehensive justification for the scoring thresholds and methodology used in InsightCode v0.6.1. Our approach implements **industry best practices** following the **Rules of the Art**: Linear → Quadratic → Exponential progression, validated against empirical data from 9 popular open-source projects representing over 670,000 lines of production code.

## Methodology Overview - v0.6.1

InsightCode v0.6.1 implements a **research-based weighted scoring model** that respects fundamental software engineering principles:

### 🏛️ **Foundational Principles**
1. **Pareto Principle (80/20)**: 20% of code causes 80% of problems - extreme complexity receives extreme penalties
2. **ISO/IEC 25010 Maintainability**: Complexity violations clearly identified without masking
3. **Fowler Technical Debt**: Debt must be visible and quantifiable - no logarithmic scaling
4. **McCabe Research**: Complexity ≤10 threshold for maintainable code

### 📊 **Health Score Methodology (v0.6.1)**
- **Direct penalty summation**: Health Score = 100 - (complexity penalty + duplication penalty + size penalty + issues penalty)
- **No weighting applied**: Each penalty type contributes directly to the total
- **Progressive scaling**: Individual penalties use research-based curves

**Note**: The weighting factors (0.45/0.30/0.25) mentioned in architecture docs are for overall project scoring, not individual file health scores.

### 🚫 **Anti-Patterns Eliminated**
- **No penalty caps**: Individual penalties can exceed 100 points for extreme cases, but the final health score is bounded between 0 and 100
- **No logarithmic scaling**: Raw values used to prevent masking of outliers
- **No debt masking**: Progressive penalties without upper limits ensure technical debt visibility

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

### v0.6.0 Rules of the Art Implementation

**Methodology**: Linear → Quadratic → Exponential progression following industry best practices

#### **Phase 1: Excellent (≤10)**
- **Score**: 100 points
- **Rationale**: McCabe's original threshold for maintainable code
- **Research**: Strong empirical validation across 40+ years of studies

#### **Phase 2: Linear Degradation (10-20)**  
- **Score**: 100 → 70 points (3 points penalty per unit)
- **Rationale**: Industry standard for acceptable complexity increase
- **Research**: Defect probability remains manageable in this range

#### **Phase 3: Quadratic Penalty (20-50)**
- **Score**: 70 → 30 points (quadratic progression)  
- **Rationale**: Reflects exponentially growing maintenance burden
- **Research**: Strong correlation with maintainability degradation

#### **Phase 4: Exponential Penalty (>50)**
- **Score**: 30 → 0 points (exponential decay)
- **Rationale**: Extreme complexity = extreme penalties (Pareto principle)
- **Research**: Critical threshold where systems become unmaintainable

#### **Real-World Validation**
| Complexity Range | McCabe Classification | Score | Impact |
|---|---|---|---|
| ≤10 | Excellent (McCabe 1976) | 100 | Excellent maintainability |
| 11-15 | Good (NASA current: ≤15 for critical) | 97-85 | Good maintainability |  
| 16-20 | Acceptable (Beyond NASA threshold) | 82-70 | Degrading maintainability |
| 20-50 | Poor (Empirical studies) | 70-30 | Poor maintainability |
| 50+ | Critical (Research consensus) | 30-0 | **Catastrophic** |
| 1000+ | createTypeChecker(979) | 0 | **Catastrophic** |
| 16000+ | createTypeChecker(16081) | 0 | **Unmaintainable** |

### Explicit `calculateComplexityScore` Implementation

The complexity scoring function follows industry-validated phases:

#### **Phase-by-Phase Implementation**
```typescript
function calculateComplexityScore(complexity: number): number {
  // Phase 1: McCabe "excellent" threshold (≤10)
  if (complexity <= 10) return 100;
  
  // Phase 2: Linear degradation (10-20)
  if (complexity <= 20) {
    return Math.round(100 - (complexity - 10) * 3); // 3 points per unit
  }
  
  // Phase 3: Quadratic penalty (20-50)
  if (complexity <= 50) {
    const base = 70;
    const range = complexity - 20; // 0-30 range
    const quadraticPenalty = Math.pow(range / 30, 2) * 40;
    return Math.round(base - quadraticPenalty);
  }
  
  // Phase 4: Exponential penalty (>50)
  const base = 30;
  const range = complexity - 50;
  const exponentialPenalty = Math.pow(range / 50, 1.8) * 30;
  return Math.max(0, Math.round(base - exponentialPenalty));
}
```

#### **Comprehensive Mapping Table**
| Complexity | Phase | Formula | Score | Research Basis |
|------------|-------|---------|-------|----------------|
| 1-10 | Excellent | `100` | 100 | McCabe (1976) "excellent code" |
| 11 | Linear | `100-(11-10)×3=97` | 97 | NASA acceptable (≤15 for critical software) |
| 15 | Linear | `100-(15-10)×3=85` | 85 | NASA critical threshold |
| 20 | Linear | `100-(20-10)×3=70` | 70 | Above NASA threshold (Internally Acceptable) |
| 25 | Quadratic | `70-((25-20)/30)²×40=69` | 69 | High risk zone |
| 30 | Quadratic | `70-((30-20)/30)²×40=66` | 66 | Maintenance burden |
| 40 | Quadratic | `70-((40-20)/30)²×40=52` | 52 | Poor maintainability |
| 50 | Quadratic | `70-((50-20)/30)²×40=30` | 30 | Critical threshold |
| 60 | Exponential | `30-((60-50)/50)^1.8×30=28` | 28 | Unmaintainable |
| 100 | Exponential | `30-((100-50)/50)^1.8×30=0` | 0 | NASA/SEL critical |
| 176 | Exponential | `30-((176-50)/50)^1.8×30=0` | 0 | Catastrophic |

**Research Sources:**
- **McCabe, T.J. (1976)**: "A Complexity Measure", IEEE Trans. Software Eng., Vol. 2, No. 4, pp. 308-320 (≤10 threshold)
- **NASA Current Standard (NPR 7150.2D, 2022)**: Critical software requires ≤15 complexity
- **NASA/SEL Historical Study (1994)**: Classified >100 complexity as unmaintainable (historical reference for extreme cases)
- **NIST SP 500-235 (1996)**: "Structured Testing: A Testing Methodology Using the Cyclomatic Complexity Metric" (testing guide, not risk thresholds)
- **Basili, V.R. et al. (1996)**: "A Validation of Object-Oriented Design Metrics", IEEE Trans. Software Eng., Vol. 22, No. 10

**Mathematical Justification:**
- **Linear Phase (10-20)**: Gradual penalty reflecting manageable complexity growth
- **Quadratic Phase (20-50)**: Accelerated penalty reflecting exponential maintenance burden
- **Exponential Phase (>50)**: Extreme penalty implementing Pareto principle

---

## 2. Code Duplication Thresholds (Dual-Mode v0.6.1+)

### Academic Research on Code Duplication

#### Foundational Studies
Code duplication research has consistently shown strong correlations between duplication levels and maintenance costs [Kapser & Godfrey, 2008].

**Key Research Findings:**
- **≤ 3% (Excellent)**: Industry leaders like Google maintain ~2-3% duplication [Fowler, 2019]; SonarQube "Sonar way" quality gate fails at >3% for new code
- **3-8% (Good)**: Acceptable level found in well-maintained enterprise systems [Kim et al., 2005]
- **8-15% (Acceptable)**: Pragmatic threshold for legacy systems balancing effort vs. benefit [Juergens et al., 2009]
- **15-30% (Poor)**: Significantly increased maintenance overhead [Roy & Cordy, 2007]
- **30%+ (Critical)**: Strong predictor of system decay [Lague et al., 1997]

#### v0.6.1+ Dual-Mode System
InsightCode now supports **dual duplication threshold modes** to address the academic and practical gap between industry standards and legacy codebase realities:

**STRICT MODE** (`--strict-duplication`): Industry-aligned thresholds
- **≤ 3%**: Excellent - Aligns with SonarQube and modern industry standards
- **3-8%**: Good - Enterprise-grade maintenance standards  
- **8-15%**: Acceptable - Balanced threshold for active maintenance
- **15%+**: Progressive penalties

**LEGACY MODE** (default): Permissive thresholds for existing codebases
- **≤ 15%**: Excellent - Tolerant for existing code analysis
- **15-30%**: Good - Pragmatic for legacy system assessment
- **30-50%**: Acceptable - Maintenance overhead threshold
- **50%+**: Progressive penalties

#### v0.6.1+ Detection Algorithm vs Industry Standards
Our **pragmatic approach** uses 8-line blocks with literal pattern matching, focusing on actionable copy-paste duplication:

**Key Features:**
- **8-line sliding window** (enhanced from 3-line for meaningful patterns)
- **MD5 hashing** of normalized blocks for exact matching
- **Cross-file detection only** (avoids intra-file false positives)
- **Semantic normalization** (variables, strings, numbers) to catch real duplication

**Comparison with SonarQube:**
- **SonarQube**: 10+ statements/tokens threshold
- **InsightCode**: 8+ lines threshold  
- **Impact**: Our approach may report different percentages due to granularity differences
- **Philosophy**: Avoids false positives in test suites while catching actionable duplication patterns

**Note**: Direct percentage comparison with SonarQube reports may show variations due to different detection algorithms.

### v0.6.1+ Dual-Mode Threshold Justification

**Usage**: Select mode via CLI flag:
```bash
# Strict mode (industry-aligned)
insightcode --strict-duplication

# Legacy mode (default, permissive)  
insightcode
```

#### STRICT MODE Thresholds (Industry-Aligned)
**Methodology:** Exponential decay beyond 3% threshold - aligns with modern CI/CD practices

| Threshold | Score | Rationale |
|---|---|---|
| **≤ 3%** | 100 pts | **Industry standard**: SonarQube "Sonar way" quality gate threshold |
| **3-8%** | 100→70 pts | **Enterprise grade**: Well-maintained enterprise systems |
| **8-15%** | 70→30 pts | **Acceptable**: Balanced threshold for active development |
| **>15%** | 30→0 pts | **Poor to Critical**: Progressive penalty reflects maintenance burden |

#### LEGACY MODE Thresholds (Permissive for Existing Codebases)
**Methodology:** Exponential decay beyond 15% threshold - practical for legacy analysis

| Threshold | Score | Rationale |
|---|---|---|
| **≤ 15%** | 100 pts | **Legacy tolerance**: Practical threshold for existing code analysis |
| **15-30%** | 100→70 pts | **Degrading**: Exponential decay reflects maintenance burden |
| **30-50%** | 70→30 pts | **Poor**: Strong correlation with system decay |
| **>50%** | 30→0 pts | **Critical**: Extreme duplication = extreme penalties (Pareto) |

**Real-World Validation:**
- **TypeScript Compiler**: 0% detected (excellent literal hygiene)
- **Vue Framework**: 0% detected (good modularization)  
- **Industry Average**: 0-3% for modern codebases, 0-15% for legacy systems
- **Mode Selection Impact**: Same codebase will receive different scores based on selected thresholds

---

## 3. File Size Thresholds (Clean Code Convention)

### Internal Convention Based on Clean Code Principles

**Important Note**: Our file size thresholds are **internal conventions** inspired by Clean Code principles, not formal industry standards.

#### Academic and Industry Guidance
Research on optimal file sizes is linked to cognitive load theory:
- **Human Short-term Memory**: 7±2 items (Miller's Law) translates to ~200 LOC chunks [Miller, 1956]
- **Code Comprehension**: Optimal file size for understanding is ~200-300 lines [Shaft & Vessey, 2006]

#### Industry Recommendations (Not Standards)
- **Google Style Guide**: Suggests 200-300 lines per file as a guideline
- **Microsoft C# Guidelines**: Recommends 300-400 lines for C# files
- **Martin Clean Code (2008)**: Advocates for small files, suggests ~200 LOC maximum

#### InsightCode Internal Thresholds
| Threshold | Score | Internal Rationale |
|---|---|---|
| **≤ 200 LOC** | 100 pts | **Optimal**: Following Clean Code 200 LOC recommendation |
| **200-500 LOC** | Linear penalty | **Acceptable**: Gradual penalty as files grow |
| **500+ LOC** | Exponential penalty | **Large**: Exponential penalty for very large files |

**Source**: Internal convention inspired by Martin (2008) Clean Code, not a formal standard.

---

## 4. Maintainability Scoring Implementation

### Function Count Research and Standards

#### Academic Foundation
- **≤ 10 functions/file**: Adheres to the Single Responsibility Principle [Martin, 2003]
- **10-15 functions/file**: Represents acceptable cohesion levels [Chidamber & Kemerer, 1994]

#### InsightCode Function Count Thresholds
| Threshold | Score | Rationale |
|---|---|---|
| **≤ 10** | 100 pts | **Well-focused**: Adheres to Single Responsibility Principle |
| **≤ 15** | 85 pts | **Good**: Acceptable cohesion levels |
| **≤ 20** | 70 pts | **Acceptable**: Approaching maintainability threshold |
| **> 30** | Variable | **Critical**: Likely a "God Class" anti-pattern |

---

## 5. Grade Mapping Justification

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
| v0.2.0 | Initial thresholds validated against empirical research |
| v0.4.0 | Shift to criticality-weighted scoring model |
| **v0.6.0** | **🏛️ Rules of the Art Implementation: Linear → Quadratic → Exponential** |
| | **🚫 Eliminated all artificial caps and logarithmic scaling** |
| | **✅ Full compliance with Pareto Principle and ISO/IEC 25010** |
| | **📊 Enhanced duplication detection (8-line blocks, literal matching)** |

### Ongoing Research Integration
1.  **Monthly literature review** for new complexity research.
2.  **Quarterly benchmark updates** with latest popular projects.
3.  **Annual threshold validation** against industry surveys.

## ⚠️ **Documentation Quality Assurance**

### Academic Reference Standards
- **All threshold values validated** against actual implementation via automated tests
- **Numerical examples verified** through code execution, not manual calculation
- **References updated** to reflect current standards (NASA NPR 7150.2D vs. outdated SEL)
- **Industry alignment** acknowledged where our thresholds differ from current practice

### Known Limitations & Design Choices
- **Duplication dual-mode system (v0.6.1+)**: Strict mode (3%) aligns with SonarQube, legacy mode (15%) remains permissive for existing codebase analysis
- **8-line detection blocks**: May report different percentages than SonarQube's 10+ statement/token threshold
- **File size conventions**: Internal guidelines inspired by Clean Code, not formal standards
- **Complexity boundaries**: Based on McCabe's original research; NASA current standards are more stringent (≤15)
- **Project weighting factors**: Internal hypotheses (0.45/0.30/0.25) requiring empirical validation

### Strict Mode Considerations
For new code or strict quality gates, consider:
- **Duplication**: 3% threshold (aligned with SonarQube "Sonar way")
- **Complexity**: ≤15 threshold (aligned with NASA NPR 7150.2D)
- **Detection granularity**: Token-based vs line-based algorithms

---

## Bibliography

### Primary Sources
- **McCabe, T.J. (1976)**. "A Complexity Measure". *IEEE Transactions on Software Engineering*, Vol. SE-2, No. 4, pp. 308-320. DOI: [10.1109/TSE.1976.233837](https://doi.org/10.1109/TSE.1976.233837)

- **NASA (2022)**. *NASA Procedural Requirements (NPR) 7150.2D: NASA Software Engineering Requirements*. URL: [https://nodis3.gsfc.nasa.gov/npg_img/N_PR_7150_002D_/](https://nodis3.gsfc.nasa.gov/npg_img/N_PR_7150_002D_/)

- **NIST (1996)**. *Special Publication 500-235: Structured Testing: A Testing Methodology Using the Cyclomatic Complexity Metric*. DOI: [10.6028/NIST.SP.500-235](https://doi.org/10.6028/NIST.SP.500-235)

### Supporting Research
- **Basili, V.R., Briand, L.C., & Melo, W.L. (1996)**. "A Validation of Object-Oriented Design Metrics as Quality Indicators". *IEEE Transactions on Software Engineering*, Vol. 22, No. 10, pp. 751-761. DOI: [10.1109/32.544352](https://doi.org/10.1109/32.544352)

- **Martin, R.C. (2008)**. *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall. ISBN: 978-0132350884.

- **Fowler, M. (2019)**. *Refactoring: Improving the Design of Existing Code* (2nd Edition). Addison-Wesley. ISBN: 978-0134757599.

- **SonarSource (2024)**. *Quality Gates Documentation*. URL: [https://docs.sonarqube.org/latest/user-guide/quality-gates/](https://docs.sonarqube.org/latest/user-guide/quality-gates/)

### Industry Standards
- **Google (2024)**. *Google Style Guides*. URL: [https://google.github.io/styleguide/](https://google.github.io/styleguide/)
- **ISO/IEC 25010:2011**. *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE)*. ISO Store: [https://www.iso.org/standard/35733.html](https://www.iso.org/standard/35733.html)

---
*This document represents **version 0.6.0** of InsightCode's threshold justification. Last updated: 2025-07-11*