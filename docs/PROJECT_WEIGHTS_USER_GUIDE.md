# Understanding InsightCode Project Weights: User Guide

## 🎯 Quick Answer

**Current project weights (v0.6.0+):**
- **45%** Complexity (internal hypothesis)
- **30%** Maintainability (internal hypothesis) 
- **25%** Duplication (internal hypothesis)

**⚠️ These are NOT industry standards** - they are internal hypotheses requiring empirical validation.

## 📋 Key Distinctions

### 1. Project Scores vs. File Health Scores

**Project-Level Scoring (Two-Step Process):**

| Step | Process | Formula |
|------|---------|---------|
| **Step 1** | Weight by architectural criticality | `Weighted_Metric = Σ(File_Metric × CriticismScore) / Σ(CriticismScore)` |
| **Step 2** | Combine weighted metrics | `(Weighted_Complexity × 45%) + (Weighted_Maintainability × 30%) + (Weighted_Duplication × 25%)` |

**File Health Scoring (Direct Penalties):**

| Level | Formula | Weights Applied? |
|-------|---------|------------------|
| **File Health** | `100 - (complexity_penalty + size_penalty + duplication_penalty + issues_penalty)` | ❌ No |

### 2. What Users See

**In Project Reports (Two-Step Process):**
```
Step 1: Architectural Criticality Weighting
├── Files with high CriticismScore (dependencies + issues) get more weight
└── Each metric weighted by importance of files contributing to it

Step 2: Final Score Calculation
Overall Score: 73/100 (Grade: C)
├── Weighted_Complexity: 65/100 (45% final weight) = 29.25 points
├── Weighted_Maintainability: 80/100 (30% final weight) = 24.00 points  
└── Weighted_Duplication: 85/100 (25% final weight) = 21.25 points
```

**CriticismScore Example:**
```
File A: complexity=50, deps=10, issues=critical -> CriticismScore = high -> more weight
File B: complexity=50, deps=2, issues=none -> CriticismScore = low -> less weight
Result: File A impacts project scores more than File B despite same complexity
```

**In File Health Scores:**
```
FileA.ts: Health Score 67/100
└── Complexity penalty: -20 points
└── Size penalty: -10 points
└── Duplication penalty: -3 points
└── No weights applied - direct summation
```

## 🚨 Important User Warnings

### Academic Honesty
- **NOT scientifically validated**: Weights are based on internal hypotheses, not peer-reviewed research
- **NOT industry standards**: Different from tools like SonarQube, CodeClimate, etc.
- **Experimental status**: Subject to change based on empirical validation

### Interpretation Guidelines
1. **Use as guidance, not absolute truth**
2. **Consider your project context** (legacy vs. greenfield, team size, domain)
3. **Validate with your team's experience**
4. **Don't make critical decisions based solely on these scores**

## 📊 Why These Specific Weights?

### Two-Step Weighting Process

**Step 1: Architectural Criticality (CriticismScore)**
```
CriticismScore = (Dependencies × 2.0) + (WeightedIssues × 0.5) + 1

Dependencies = incoming + outgoing + cycle_penalty
WeightedIssues = critical×4 + high×3 + medium×2 + low×1
```

**Step 2: Final Dimension Weights (Internal Hypotheses)**

| Weight | Dimension | Hypothesis | Validation Status |
|--------|-----------|------------|-------------------|
| **45%** | Complexity | Primary defect predictor | ⏳ Pending |
| **30%** | Maintainability | Development velocity impact | ⏳ Pending |
| **25%** | Duplication | Technical debt indicator | ⏳ Pending |

**Key Insight:** Architectural criticality ensures that problematic files in critical parts of your codebase (high dependencies, many issues) have more impact on final scores than isolated problematic files.

### Supporting Research (Thresholds Only)
- **Complexity thresholds**: Based on McCabe (1976) - ≤10 recommended
- **File size guidelines**: Inspired by Martin Clean Code (2008) - ≤200 LOC
- **Duplication detection (v0.6.0+)**: Dual-mode system - strict 3%/8%/15% (industry-aligned) or legacy 15%/30%/50% (permissive)

## 🎯 Duplication Mode Impact (v0.6.0+)

### Mode Selection
```bash
# Strict mode (industry standards)
insightcode --strict-duplication

# Legacy mode (permissive, default)
insightcode
```

### Score Impact Example
**Same codebase with 10% duplication:**

| Mode | Duplication Score | Project Impact | When to Use |
|------|------------------|----------------|-------------|
| **Strict** | ~70/100 | Reflects industry expectations | New projects, CI/CD integration |
| **Legacy** | ~100/100 | Tolerant for existing code | Legacy analysis, gradual improvement |

**Note**: Mode choice affects the 25% duplication weight in project scoring, potentially impacting overall project grade.

## 🔄 Weight Evolution History

| Version | Weights | Status | Notes |
|---------|---------|--------|--------|
| v0.2.0-v0.3.0 | 40/30/30 | Legacy | Complexity/Duplication/Maintainability |
| v0.6.0+ | 45/30/25 | Current | Complexity/Maintainability/Duplication |
| Future | TBD | Planned | Empirical validation and user configuration |

## 🛠️ For Advanced Users

### Interpreting Raw Data
If you need unweighted analysis, focus on:
- **Individual file Health Scores** (unweighted)
- **Raw metrics** (complexity numbers, LOC, duplication %)
- **Specific issues and recommendations**

### Custom Analysis
The tool provides raw data for your own weighting schemes:
```javascript
// Access raw scores without weights
const rawComplexity = analysis.overview.scores.complexity;
const rawMaintainability = analysis.overview.scores.maintainability;
const rawDuplication = analysis.overview.scores.duplication;

// Apply your own weights
const customScore = (rawComplexity * 0.60) + (rawMaintainability * 0.25) + (rawDuplication * 0.15);
```

## 🔮 Future Roadmap

### Empirical Validation (Planned)
1. **Data collection** from real projects and defect rates
2. **Correlation analysis** between scores and actual maintenance costs
3. **A/B testing** of different weight combinations
4. **User feedback integration** for domain-specific adjustments

### Configurability (Under Consideration)
- User-configurable project weights
- Domain-specific presets (web apps, libraries, embedded systems)
- Team-specific calibration based on historical data

## 📚 Documentation References

- **CriticismScore Explained**: `/docs/CRITICISM_SCORE_GUIDE.md` ⭐ **New!**
- **Technical Details**: `/docs/SCORING_ARCHITECTURE.md`
- **Coefficient Justification**: `/docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md`
- **Full FAQ**: `/docs/PROJECT_WEIGHTS_FAQ.md`
- **Academic References**: `/docs/SCORING_THRESHOLDS_JUSTIFICATION.md`
- **Duplication Modes**: `/docs/DUPLICATION_MODES_USER_GUIDE.md` (v0.6.0+)

---

**Bottom Line**: Use InsightCode scores as **guidance and trends**, not absolute measures. The weights are internal hypotheses that help aggregate complex information, but they're not scientifically validated industry standards. With v0.6.0+, choose the appropriate duplication mode for your context (strict for new projects, legacy for existing codebases). Always apply your domain knowledge and team experience when interpreting results.
