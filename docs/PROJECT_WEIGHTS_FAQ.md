# Project Scoring Weights FAQ

## ❓ What are the current project scoring weights?

**Current weights (v0.6.1+):**
- **45%** Complexity 
- **30%** Maintainability
- **25%** Duplication (with mode-aware thresholds)

**Note**: v0.6.1 introduced dual-mode duplication thresholds - see below for details.

## ❓ Are these industry standard weights?

**No.** These weights are **internal hypotheses** that require empirical validation. They are NOT industry standards or scientifically validated coefficients.

## ❓ Why don't these weights apply to file Health Scores?

**Project weights vs. File Health Scores are different:**

- **Project-level scoring**: Uses weighted aggregation (45/30/25) for overall project assessment
- **File-level Health Scores**: Use direct penalty summation without weights

```
Project Score = (Complexity × 45%) + (Maintainability × 30%) + (Duplication × 25%)
File Health Score = 100 - (complexity_penalty + size_penalty + duplication_penalty + issues_penalty)
```

## ❓ Why did the weights change from 40/30/30 to 45/30/25?

**Timeline:**
- **v0.2.0-v0.3.0**: Used 40/30/30 (legacy)
- **v0.4.0+**: Updated to 45/30/25 (current)

**Rationale**: Internal hypothesis that complexity is the primary defect predictor deserves higher weight.

## ❓ How do I know which weights apply where?

**Clear indicators:**
- **Project reports**: Show weighted scores (45/30/25)
- **File Health Scores**: Show unweighted penalties
- **Documentation**: Always specifies which system applies

## ❓ When will these weights be validated?

**Ongoing research plan:**
1. Quarterly data collection from user feedback
2. Annual empirical validation against defect prediction
3. Comparison with industry research on software quality metrics

## ❓ Can I configure these weights?

**Project weights**: Currently no. The weights are hardcoded as internal hypotheses. Future versions may support user-configurable project weights based on specific project contexts.

**Duplication thresholds**: Yes! (v0.6.1+) Use `--strict-duplication` for industry-aligned thresholds or default legacy mode for permissive analysis.

## ❓ What's the duplication dual-mode system? (v0.6.1+)

**Two threshold modes:**
- **Strict mode** (`--strict-duplication`): 3%/8%/15% thresholds aligned with SonarQube/industry standards  
- **Legacy mode** (default): 15%/30%/50% permissive thresholds for existing codebase analysis

**Impact on project scoring:**
Same codebase can receive different duplication scores (and thus project grades) depending on selected mode.

## ⚠️ User Warning

**When using InsightCode results:**
- Project weights (45/30/25) are internal hypotheses, not scientific standards
- Duplication mode choice significantly affects scoring - choose appropriately for your context
- Use results as guidance, not absolute truth
- Consider your specific project context and requirements
- Validate findings against your team's experience

---

*Last updated: v0.6.1 - This FAQ will be updated as we gather more empirical data.*
