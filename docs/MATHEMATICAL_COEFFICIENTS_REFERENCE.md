# Mathematical Coefficients Reference - Quick Lookup

## Executive Summary

This document provides a quick reference for all mathematical coefficients used in InsightCode CLI scoring algorithms, with justifications for each value.

---

## 🔢 Key Coefficient Values & Justifications

### **Powers (Exponential Growth Rates)**

| Coefficient | Value | Context | Justification | Status |
|-------------|-------|---------|---------------|---------|
| **Complexity Exponential** | `1.8` | `Math.pow(range/50, 1.8)` | Moderate exponential (80% of quadratic) | ⚠️ Needs validation |
| **Duplication Exponential** | `1.8` | `Math.pow(range/10, 1.8)` (mode-aware) | Same as complexity - mode-specific thresholds | ⚠️ Needs validation |
| **Size Exponential** | `1.8` | `Math.pow(range/1000, 1.8)` | Harmonized with all penalties | ✅ Consistent |
| **Health Score Complexity** | `1.8` | `Math.pow(range/20, 1.8)` | Harmonized growth | ✅ Unified |
| **Quadratic** | `2.0` | `Math.pow(range/30, 2)` | Standard quadratic acceleration | ✅ Mathematical standard |

### **Multipliers (Penalty Magnitudes)**

| Coefficient | Value | Context | Justification | Status |
|-------------|-------|---------|---------------|---------|
| **Quadratic Penalty** | `40` | `* 40` (complexity 20-50) | 40-point span = 2 grade levels | ✅ Calibrated |
| **Exponential Penalty** | `30` | `* 30` (complexity 50+) | Drives scores to 0 for extreme cases | ✅ Calibrated |
| **Linear Complexity** | `3` | `* 3` (complexity 10-20) | 3 points/unit = optimal 100→70 progression | ✅ Validated |
| **Duplication Linear** | `1.5` | `* 1.5` (mode-aware thresholds) | Gentler than complexity (easier to fix) | 🎯 Heuristic |
| **Issue Critical** | `20` | Critical issue penalty | 5 critical issues = 100 points penalty | ✅ Empirical |

### **Base Values (Scoring Anchors)**

| Coefficient | Value | Context | Justification | Status |
|-------------|-------|---------|---------------|---------|
| **Exponential Base** | `30` | Starting point for complexity >50 | Continuity from quadratic phase | ✅ Mathematical |
| **Linear Base** | `70` | Starting point for complexity 20-50 | Smooth transition, B- grade anchor | ✅ Calibrated |
| **Perfect Score** | `100` | Starting score | Standard percentage scale | ✅ Conventional |
| **Min Score** | `60` | Score floor | Prevents non-actionable scores | 🎯 Heuristic |

### **Range Normalizers (Mathematical Scaling)**

| Coefficient | Value | Context | Justification | Status |
|-------------|-------|---------|---------------|---------|
| **Quadratic Range** | `30` | `range/30` (complexity 20-50) | Normalizes 30-unit range to [0,1] | ✅ Mathematical |
| **Exponential Range** | `50` | `range/50` (complexity 50+) | Exponential domain scaling | ⚠️ Arbitrary choice |
| **Duplication Range** | `10` | `range/10` (mode-aware high threshold) | Fast acceleration for high duplication | ⚠️ May be too aggressive |
| **Size Range** | `1000` | `range/1000` (size >500 LOC) | Gentle scaling for large files | ⚠️ May be too forgiving |
| **Cognitive Chunking** | `15` | `range/15` (size >200 LOC) | Miller's 7±2 rule application | 🏛️ Theoretical basis |

---

## 🎯 Priority Validation Targets

### **CRITICAL (Immediate Action Required)**

1. **Power 1.8 Validation**
   - **Issue**: Harmonized across all penalty types - needs validation
   - **Test**: Validate harmonized 1.8 power against expert judgment on 50+ cases
   - **Impact**: Core scoring algorithm accuracy

2. **Range Denominator 50**
   - **Issue**: Arbitrary choice for complexity >50 exponential scaling  
   - **Test**: Validate against NASA/SEL "unmaintainable" threshold data
   - **Impact**: Extreme complexity penalty severity

3. **Duplication Denominator 10**
   - **Issue**: May be too aggressive for brownfield codebases
   - **Test**: Analyze real projects with 40-80% duplication
   - **Impact**: Duplication penalty fairness

### **HIGH (Quarterly Review)**

1. **Power Harmonization**
   - **Status**: ✅ **COMPLETED** - All exponential penalties harmonized to 1.8
   - **Result**: Mathematical consistency achieved across all penalty types
   - **Impact**: Unified exponential behavior system-wide

2. **Size Denominator 1000**
   - **Issue**: May be too forgiving for massive files (2000+ LOC)
   - **Test**: Correlation analysis with maintenance burden
   - **Impact**: Large file penalty effectiveness

### **MEDIUM (Annual Calibration)**

1. **Linear Multipliers**
   - **Issue**: Industry benchmark comparison needed
   - **Test**: Compare with SonarQube, CodeClimate, etc.
   - **Impact**: Industry alignment

---

## 📊 Coefficient Validation Framework

### **Testing Methodology**

```typescript
interface CoefficientTest {
  coefficient: string;
  currentValue: number;
  alternatives: number[];
  testCases: Array<{
    input: number;
    expectedCategory: string;
    description: string;
  }>;
  validationMethod: 'expert-judgment' | 'empirical-data' | 'industry-benchmark';
  confidenceLevel: 'high' | 'medium' | 'low';
}
```

### **Validation Schedule**

- **Monthly**: New project validation against existing coefficients
- **Quarterly**: Systematic A/B testing of flagged coefficients  
- **Annually**: Major recalibration based on accumulated feedback

### **Success Criteria**

- **Accuracy**: 85%+ agreement with expert judgment on test cases
- **Consistency**: Mathematically coherent penalty progressions
- **Industry Alignment**: Within 10% of established tool thresholds
- **User Acceptance**: <15% complaints about scoring "unfairness"

---

## 🧮 Mathematical Properties Summary

### **Well-Designed Aspects**
- ✅ **Smooth continuity**: No scoring discontinuities at threshold boundaries
- ✅ **Proportional penalties**: Higher severity = exponentially higher penalties  
- ✅ **Grade alignment**: Penalties map to recognizable grade levels (A-F)
- ✅ **Bounded scores**: Floor (0/60) and ceiling (100) prevent edge cases

### **Areas for Improvement**
- ⚠️ **Power inconsistency**: Different exponential rates lack systematic justification
- ⚠️ **Range arbitrariness**: Some denominators not empirically validated
- ⚠️ **Industry validation**: Limited comparison with established tools

### **Mathematical Rigor Assessment**
- **Current Score**: 7.5/10 (Good mathematical foundation, needs empirical validation)
- **Target Score**: 9/10 (Systematic validation of all coefficients complete)

---

*Reference document v0.7.0 - Updated with comprehensive coefficient analysis*
*See: `docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md` for detailed analysis*
