# InsightCode Scoring Architecture - v0.6.0

## Architecture Overview

The unified architecture centralizes ALL scoring thresholds and constants in a single file to ensure consistency and eliminate redundancy.

```
src/
├── config.ts              # ✨ UNIFIED: All thresholds and constants (configurable + non-configurable)
└── scoring.ts              # Calculation functions (uses config.ts)
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

### 🎯 **After (v0.6.0)** - Unified centralization
```typescript
// config.ts - SINGLE SOURCE OF TRUTH FOR EVERYTHING
export const DEFAULT_THRESHOLDS = {
  complexity: { production: { medium: 10, high: 15, critical: 20 } }
  // ... user-configurable thresholds
};

export const COMPLEXITY_LABEL_THRESHOLDS = {
  LOW: 10,      // Same as production thresholds
  MEDIUM: 15,   // Same as production thresholds  
  HIGH: 20      // Same as production thresholds
} as const;

// scoring.ts - Uses unified constants
if (complexity <= COMPLEXITY_LABEL_THRESHOLDS.LOW) return 'Low';

// analyzer.ts - Uses unified constants  
return sum + (complexityImpact * SCORING_WEIGHTS.COMPLEXITY);
```

## Types of Constants

### 1. **Weighting Factors** (`SCORING_WEIGHTS`)
```typescript
COMPLEXITY: 0.45,        // McCabe (1976)
MAINTAINABILITY: 0.30,   // Martin Clean Code (2008) 
DUPLICATION: 0.25        // Fowler Refactoring (1999)
```

### 2. **Scoring Thresholds** 
```typescript
COMPLEXITY_SCORING_THRESHOLDS: {
  EXCELLENT: 10,    // <= 10 = 100 points (McCabe "good")
  CRITICAL: 20,     // Transition point for phases
  // Implements Rules of the Art: Linear → Quadratic → Exponential
  // Phase 1 (≤10): Excellent (100 points)
  // Phase 2 (10-20): Linear degradation (100 → 70 points)  
  // Phase 3 (20-50): Quadratic penalty (70 → 30 points)
  // Phase 4 (>50): Exponential penalty (30 → 0 points)
}
```

### 3. **Label & Color Thresholds**
```typescript
COMPLEXITY_LABEL_THRESHOLDS: { LOW: 10, MEDIUM: 15, HIGH: 20 }
COMPLEXITY_COLOR_THRESHOLDS: { GREEN: 10, YELLOW: 15, RED: 20 }
```

### 4. **Detection Constants**
```typescript
DUPLICATION_DETECTION_CONSTANTS: {
  BLOCK_SIZE: 8,
  MIN_TOKENS: 8,
  MIN_BLOCK_LENGTH: 50
}
```

### 5. **Health Score Penalties**
```typescript
HEALTH_PENALTY_CONSTANTS: {
  COMPLEXITY: { 
    EXCELLENT_THRESHOLD: 10,
    CRITICAL_THRESHOLD: 20,
    // NO CAPS - extreme complexity gets extreme penalties (Pareto principle)
  },
  DUPLICATION: { /* no caps - progressive penalties */ },
  SIZE: { /* no caps - progressive penalties */ }
}
```

## Guaranteed Consistency

### ✅ All systems aligned
- **Config thresholds** (issues): 10/15/20, 15/30/50
- **Labels & colors**: 10/15/20, 15/30/50  
- **Scoring functions**: 10/15/20, 15/30/50
- **Penalty functions**: 10/15/20, 15/30/50

### ✅ Automatically consistent documentation
Notes in `report-generator.ts` reference the same thresholds as the implementation.

### ✅ Simplified maintenance
One threshold change = one modification in `config.ts`.

## Usage Guide

### To modify a threshold
1. ✅ **DO**: Modify in `config.ts`
2. ❌ **DON'T**: Hardcode in `scoring.ts` or elsewhere

### To add a new constant
1. Add to appropriate section in `config.ts`
2. Import in the file that uses it
3. Use the constant instead of hardcoded value

### To verify consistency
1. Search for hardcoded values: `grep -r "= 10\|= 15\|= 20" src/`
2. Ensure they all reference `config.ts`

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

# Centralize them in config.ts
# Replace with references
```

## Key Improvements in v0.6.0

### 📉 **Eliminated Redundancy**
- **Before**: Two files (`config.ts` + `scoringConstants.ts`) with overlapping thresholds
- **After**: Single file (`config.ts`) with ALL constants unified

### 🎯 **Guaranteed Alignment** 
- Labels, colors, and penalties automatically use same base thresholds
- No risk of inconsistency between configurable and non-configurable constants

### 🔧 **Simplified Architecture**
- Fewer files to maintain
- Clear single source of truth
- Easier onboarding for new developers

### 🏛️ **Industry Standards Compliance**
- **Pareto Principle (80/20)**: Extreme values (complexity 16,000+) receive extreme penalties
- **ISO/IEC 25010**: Maintainability violations clearly identified and quantified
- **Fowler Technical Debt**: No logarithmic masking - debt is visible and measurable
- **McCabe Research**: Complexity ≤10 threshold for good code maintained
- **Rules of the Art**: Linear → Quadratic → Exponential progression implemented

### 🚫 **Anti-Patterns Eliminated**
- **No artificial caps**: Removed all soft-caps that masked extreme complexity
- **No logarithmic scaling**: Raw values used to prevent masking of outliers
- **No debt masking**: Progressive penalties without upper limits

This unified architecture guarantees long-term consistency of InsightCode's scoring system with zero redundancy while respecting all industry best practices and research-based standards.