# Understanding InsightCode Project Weights: User Guide

## 🎯 Quick Answer

**Current project weights (v0.6.1):**
- **45%** Complexity (internal hypothesis)
- **30%** Maintainability (internal hypothesis) 
- **25%** Duplication (internal hypothesis)

**⚠️ These are NOT industry standards** - they are internal hypotheses requiring empirical validation.

## 📋 Key Distinctions

### 1. Project Scores vs. File Health Scores

| Level | Formula | Weights Applied? |
|-------|---------|------------------|
| **Project** | `(Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)` | ✅ Yes |
| **File Health** | `100 - (complexity_penalty + size_penalty + duplication_penalty + issues_penalty)` | ❌ No |

### 2. What Users See

**In Project Reports:**
```
Overall Score: 73/100 (Grade: C)
└── Complexity: 65/100 (45% weight) = 29.25 points
└── Maintainability: 80/100 (30% weight) = 24.00 points  
└── Duplication: 85/100 (25% weight) = 21.25 points
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

### Internal Hypotheses (Requiring Validation)

| Weight | Dimension | Hypothesis | Validation Status |
|--------|-----------|------------|-------------------|
| **45%** | Complexity | Primary defect predictor | ⏳ Pending |
| **30%** | Maintainability | Development velocity impact | ⏳ Pending |
| **25%** | Duplication | Technical debt indicator | ⏳ Pending |

### Supporting Research (Thresholds Only)
- **Complexity thresholds**: Based on McCabe (1976) - ≤10 recommended
- **File size guidelines**: Inspired by Martin Clean Code (2008) - ≤200 LOC
- **Duplication detection (v0.6.1+)**: Dual-mode system - strict 3%/8%/15% (industry-aligned) or legacy 15%/30%/50% (permissive)

## 🎯 Duplication Mode Impact (v0.6.1+)

### Mode Selection
```bash
# Strict mode (industry standards)
insightcode analyze --strict-duplication

# Legacy mode (permissive, default)
insightcode analyze
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

- **Technical Details**: `/docs/SCORING_ARCHITECTURE.md`
- **Coefficient Justification**: `/docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md`
- **Full FAQ**: `/docs/PROJECT_WEIGHTS_FAQ.md`
- **Academic References**: `/docs/SCORING_THRESHOLDS_JUSTIFICATION.md`
- **Duplication Modes**: `/docs/DUPLICATION_MODES_USER_GUIDE.md` (v0.6.1+)

---

**Bottom Line**: Use InsightCode scores as **guidance and trends**, not absolute measures. The weights are internal hypotheses that help aggregate complex information, but they're not scientifically validated industry standards. With v0.6.1+, choose the appropriate duplication mode for your context (strict for new projects, legacy for existing codebases). Always apply your domain knowledge and team experience when interpreting results.
