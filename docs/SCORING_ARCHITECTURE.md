# InsightCode Scoring Architecture - v0.6.1+

## Architecture Overview

The unified architecture centralizes ALL scoring thresholds and constants in a single file to ensure consistency and eliminate redundancy.

```
src/
├── thresholds.constants.ts  # ✨ UNIFIED: All thresholds and constants (configurable + non-configurable)
└── scoring.ts              # Calculation functions (uses thresholds.constants.ts)
```

## Centralization Principle

### ✅ **Before (v0.5.x)** - Problematic dispersion
```typescript
// scoring.ts
if (complexity <= 10) return 'Low';          // Hardcoded
const cleanCodeThreshold = 200;              // Hardcoded

// analyzer.ts  
return sum + (complexityImpact * 0.45);      // Hardcoded

// duplication.ts
const blockSize = 8;                         // Hardcoded
```

### 🎯 **After (v0.6.1+)** - Unified centralization
```typescript
// thresholds.constants.ts - SINGLE SOURCE OF TRUTH FOR EVERYTHING
export const DEFAULT_THRESHOLDS = {
  complexity: { production: { medium: 10, high: 15, critical: 20 } }
  // ... user-configurable thresholds
};

export const PROJECT_SCORING_WEIGHTS = {
  COMPLEXITY: 0.45,        // Internal hypothesis (requires empirical validation)
  MAINTAINABILITY: 0.30,   // Internal hypothesis (requires empirical validation)  
  DUPLICATION: 0.25        // Internal hypothesis (requires empirical validation)
} as const;

// ⚠️ Note: These weights apply to PROJECT-LEVEL scoring only, NOT to individual file Health Scores

// scoring.ts - Uses unified constants
if (complexity <= COMPLEXITY_LABEL_THRESHOLDS.LOW) return 'Low';

// analyzer.ts - Uses unified constants  
return sum + (complexityImpact * PROJECT_SCORING_WEIGHTS.COMPLEXITY);
```

## Types of Constants

### 1. **Project-Level Weighting Factors** (`PROJECT_SCORING_WEIGHTS`)
```typescript
COMPLEXITY: 0.45,        // Internal hypothesis - Primary defect predictor (requires validation)
MAINTAINABILITY: 0.30,   // Internal hypothesis - Development velocity impact (requires validation)
DUPLICATION: 0.25        // Internal hypothesis - Technical debt indicator (requires validation)
```
**Important**: These weights apply to project-level scoring aggregation only. Individual file Health Scores use direct penalty summation without weights.

### 2. **Scoring Thresholds** 
```typescript
COMPLEXITY_SCORING_THRESHOLDS: {
  EXCELLENT: 10,              // <= 10 = 100 points (McCabe "good")
  CRITICAL: 20,               // Transition point for phases
  LINEAR_PENALTY_RATE: 4,     // 4 points lost per complexity unit
  EXPONENTIAL_BASE: 30,       // Base score for exponential phase
  EXPONENTIAL_POWER: 1.5,     // Moderate exponential growth
  EXPONENTIAL_MULTIPLIER: 40, // Penalty magnitude for high complexity
  MIN_SCORE: 60              // Score floor for actionable results
  // Implements Rules of the Art: Linear → Quadratic → Exponential
  // Phase 1 (≤10): Excellent (100 points)
  // Phase 2 (10-20): Linear degradation (100 → 70 points)  
  // Phase 3 (20-50): Quadratic penalty (70 → 30 points)
  // Phase 4 (>50): Exponential penalty (30 → 0 points)
}
```

### 3. **Label & Color Thresholds**
```typescript
COMPLEXITY_LABEL_THRESHOLDS: { 
  LOW: 10, MEDIUM: 15, HIGH: 20, VERY_HIGH: 50 
}
COMPLEXITY_COLOR_THRESHOLDS: { 
  GREEN: 10, YELLOW: 15, RED: 20, RED_BOLD: 50 
}

DUPLICATION_LABEL_THRESHOLDS: { 
  LOW: 15, MEDIUM: 30, HIGH: 50   // Base thresholds (mode-aware)
}
DUPLICATION_COLOR_THRESHOLDS: { 
  GREEN: 15, YELLOW: 30, RED: 50, RED_BOLD: 100  // Mode-aware thresholds
}
```

### 4. **Detection Constants**
```typescript
DUPLICATION_DETECTION_CONSTANTS: {
  BLOCK_SIZE: 8,              // Internal convention (reduces false positives) - not a formal standard
  MIN_TOKENS: 8,              // Internal convention (cognitive load optimization)
  MIN_BLOCK_LENGTH: 50,       // Internal convention (practical detection threshold)
  MIN_CONTENT_LENGTH: 30      // Internal convention (significance threshold for content analysis)
}
```

### 5. **Health Score Penalties (Mode-Aware v0.6.1+)**
```typescript
HEALTH_PENALTY_CONSTANTS: {
  COMPLEXITY: { 
    EXCELLENT_THRESHOLD: 10,
    CRITICAL_THRESHOLD: 20,
    // NO CAPS - extreme complexity gets extreme penalties (Pareto principle)
    // Example: Complexity 176 → Penalty 133 (catastrophic)
  },
  DUPLICATION: { 
    // Mode-aware thresholds (v0.6.1+):
    // STRICT MODE: 3%/8%/15% (industry-aligned)
    // LEGACY MODE: 15%/30%/50% (permissive for legacy codebases)
    // Progressive penalties without caps - extreme duplication devastates score
    // Example: 50% duplication → Penalty 70+ (critical technical debt)
  },
  SIZE: { 
    // Exponential penalties for massive files - following Clean Code principles
    // Example: 834 LOC → Penalty 60+ (very large file)
  }
}
```

**Health Score Formula**: `100 - Σ(all penalties)` where penalties can exceed 100 for extreme cases.

**See also**: [HEALTH_SCORE_METHODOLOGY.md](./HEALTH_SCORE_METHODOLOGY.md) for complete technical details.

## Guaranteed Consistency

### ✅ All systems aligned (Mode-Aware v0.6.1+)
- **Config thresholds** (issues): 10/15/20 (complexity), strict 3/8/15% or legacy 15/30/50% (duplication)
- **Labels & colors**: 10/15/20 (complexity), mode-specific duplication thresholds  
- **Scoring functions**: 10/15/20 (complexity), mode-aware duplication scoring
- **Penalty functions**: 10/15/20 (complexity), mode-aware duplication penalties

**Duplication Mode Selection (v0.6.1+)**: Use `--strict-duplication` flag for industry-aligned 3%/8%/15% thresholds, or default legacy 15%/30%/50% for existing codebases.

### ✅ Automatically consistent documentation
Notes in `report-generator.ts` reference the same thresholds as the implementation.

### ✅ Simplified maintenance
One threshold change = one modification in `thresholds.constants.ts`.

## Usage Guide

### To modify a threshold
1. ✅ **DO**: Modify in `thresholds.constants.ts`
2. ❌ **DON'T**: Hardcode in `scoring.ts` or elsewhere
3. **For duplication**: Consider impact on both strict and legacy modes

### To add a new constant
1. Add to appropriate section in `thresholds.constants.ts`
2. Import in the file that uses it
3. Use the constant instead of hardcoded value
4. For duplication thresholds, ensure both strict and legacy modes are supported

### To verify consistency
1. Search for hardcoded values: `grep -r "= 10\|= 15\|= 20" src/`
2. Ensure they all reference `thresholds.constants.ts`
3. Check duplication mode consistency: both strict and legacy modes should be supported throughout the codebase

## Architecture Benefits

### 🎯 **Single Source of Truth**
- All constants in one place
- Impossible inconsistencies between systems

### 🔧 **Maintainability**
- Threshold modification = one line to change
- Reduced risk of errors during updates

### 📚 **Documentability**
- Constants serve as living documentation
- Centralized explanatory comments

### 🧪 **Testability**
- Constants easily mockable for tests
- Explicit calculation parameters

### 🎨 **Type Safety**
- `as const` ensures immutability
- TypeScript guarantees correct usage

## Migration from old hardcoded values

If you still find hardcoded values:

```bash
# Find dispersed constants
grep -r "= 10\|= 15\|= 20\|= 0\.45\|= 200" src/ 

# Centralize them in thresholds.constants.ts
# Replace with references
# Ensure duplication thresholds support both modes
```

## Key Improvements in v0.6.1+

### 📉 **Eliminated Redundancy**
- **Before**: Two files (`config.ts` + `scoringConstants.ts`) with overlapping thresholds
- **After**: Single file (`thresholds.constants.ts`) with ALL constants unified, including dual-mode duplication support

### 🎯 **Guaranteed Alignment** 
- Labels, colors, and penalties automatically use same base thresholds
- No risk of inconsistency between configurable and non-configurable constants
- Dual-mode duplication thresholds ensure consistency across strict and legacy modes

### 🔧 **Simplified Architecture**
- Fewer files to maintain
- Clear single source of truth
- Easier onboarding for new developers

### 🏛️ **Industry Standards Compliance**
- **Pareto Principle (80/20)**: Extreme values (complexity 16,000+) receive extreme penalties
- **ISO/IEC 25010**: Maintainability violations clearly identified and quantified
- **Fowler Technical Debt**: No logarithmic masking - debt is visible and measurable
- **McCabe Research**: Complexity ≤10 threshold for excellent code maintained
- **Rules of the Art**: Linear → Quadratic → Exponential progression implemented

### 🚫 **Anti-Patterns Eliminated**
- **No artificial caps**: Removed all soft-caps that masked extreme complexity
- **No logarithmic scaling**: Raw values used to prevent masking of outliers
- **No debt masking**: Progressive penalties without upper limits

This unified architecture guarantees long-term consistency of InsightCode's scoring system with zero redundancy while respecting all industry best practices and research-based standards.