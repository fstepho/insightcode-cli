# InsightCode Scoring Architecture - v0.7.0

## Architecture Overview

The unified architecture distributes scoring concerns across specialized files for optimal maintainability while ensuring consistency through centralized constants and automated validation.

```
src/
├── thresholds.constants.ts:448      # 🎯 CONSTANTS: Raw threshold values & penalties
├── scoring.ts:364                   # 🧮 CALCULATIONS: Primary scoring functions  
├── scoring.utils.ts:74              # ⚙️ CONFIGURATIONS: Grade configs & utilities
├── analyzer/OverviewCalculator.ts   # 📊 PROJECT: Two-step weighted scoring
└── types.ts:406                     # 📝 INTERFACES: TypeScript definitions
```

## Architectural Evolution (v0.7.0)

### 🎯 **3-Layer Architecture Principle**

```typescript
// LAYER 1: Raw Constants (thresholds.constants.ts)
export const COMPLEXITY_SCORING_THRESHOLDS = {
  EXCELLENT: 10,               // ≤10: Phase 1 threshold (McCabe excellent)
  CRITICAL: 20,                // ≤20: End of Phase 2 linear degradation  
  LINEAR_PENALTY_RATE: 3,      // Phase 2: 3 points lost per complexity unit
  EXPONENTIAL_BASE: 30,        // Phase 4: Base score for exponential decay
  EXPONENTIAL_POWER: 1.8,      // Phase 4: Harmonized exponential power  
  EXPONENTIAL_MULTIPLIER: 40   // Phase 3: Quadratic penalty magnitude (20-50)
} as const;

// LAYER 2: Rich Configurations (scoring.utils.ts)
export const COMPLEXITY_CONFIG = [
  { maxThreshold: 10, label: 'Low', color: 'green', severity: 'low' },
  { maxThreshold: 15, label: 'Medium', color: 'yellow', severity: 'medium' },
  { maxThreshold: 20, label: 'High', color: 'red', severity: 'high' },
  { maxThreshold: 50, label: 'Very High', color: 'redBold', severity: 'critical' },
  { maxThreshold: Infinity, label: 'Extreme', color: 'redBold', severity: 'critical' }
] as const;

export const GRADE_CONFIG = [
  { grade: 'A', threshold: 90, category: 'excellent', emoji: '🟢', range: '90-100' },
  { grade: 'B', threshold: 80, category: 'very-good', emoji: '🔵', range: '80-89' },
  { grade: 'C', threshold: 70, category: 'good', emoji: '🟡', range: '70-79' },
  { grade: 'D', threshold: 60, category: 'needs-improvement', emoji: '🟠', range: '60-69' },
  { grade: 'F', threshold: 0, category: 'critical', emoji: '🔴', range: '0-59' }
] as const;

// LAYER 3: Implementation (scoring.ts) - 4-Phase Complexity Scoring
export function calculateComplexityScore(complexity: number): number {
  if (complexity <= 10) return 100;                    // Phase 1: Excellent
  
  if (complexity <= 20) {                             // Phase 2: Linear degradation
    return Math.round(100 - (complexity - 10) * 3);   // Uses LINEAR_PENALTY_RATE=3
  }
  
  if (complexity <= 50) {                             // Phase 3: Quadratic 
    const base = 70;                                   // 100 - (20-10)*3 = 70
    const range = complexity - 20;
    const quadraticPenalty = Math.pow(range / 30, 2) * 40; // Uses EXPONENTIAL_MULTIPLIER=40
    return Math.round(base - quadraticPenalty);
  }
  
  // Phase 4: Exponential (>50)
  const base = 30;                                     // Uses EXPONENTIAL_BASE=30
  const range = complexity - 50;
  const exponentialPenalty = Math.pow(range / 50, 1.8) * 30; // Uses EXPONENTIAL_BASE=30
  return Math.max(0, Math.round(base - exponentialPenalty));
}
```

## Core Components

### **1. Threshold Constants** (`thresholds.constants.ts`)

```typescript
// Complexity scoring thresholds - McCabe-aligned phases
export const COMPLEXITY_SCORING_THRESHOLDS = {
  EXCELLENT: 10,               // ≤10: Excellent threshold (McCabe)
  CRITICAL: 20,                // ≤20: End of linear degradation phase
  LINEAR_PENALTY_RATE: 3,      // Phase 2: Points lost per unit (10-20)
  EXPONENTIAL_BASE: 30,        // Phase 4: Base score AND multiplier for exponential
  EXPONENTIAL_POWER: 1.8,      // Phase 4: Exponential power (harmonized)
  EXPONENTIAL_MULTIPLIER: 40   // Phase 3: Quadratic penalty multiplier (20-50)
} as const;

// Project scoring weights - Apply ONLY to project-level aggregation
export const PROJECT_SCORING_WEIGHTS = {
  COMPLEXITY: 0.45,      // Internal hypothesis - NOT industry standard
  MAINTAINABILITY: 0.30, // Internal hypothesis - NOT industry standard
  DUPLICATION: 0.25      // Internal hypothesis - NOT industry standard
} as const;

// Health score penalties - Progressive without caps
export const HEALTH_PENALTY_CONSTANTS = {
  COMPLEXITY: {
    EXPONENTIAL_POWER: 1.8,      // Harmonized with all penalties
    EXPONENTIAL_MULTIPLIER: 50   // Extreme complexity penalty (>100)
  },
  ISSUES: {
    CRITICAL_PENALTY: 20,        // 20 points per critical issue
    HIGH_PENALTY: 12,            // 12 points per high issue
    MEDIUM_PENALTY: 6,           // 6 points per medium issue
    LOW_PENALTY: 2               // 2 points per low issue
  }
} as const;
```

### **2. Configuration Objects** (`scoring.utils.ts`)

```typescript
// Dynamic configurations with metadata
export const GRADE_CONFIG = [...] as const;
export const COMPLEXITY_CONFIG = [...] as const;
export const DUPLICATION_CONFIG_LEGACY = [...] as const;
export const DUPLICATION_CONFIG_STRICT = [...] as const;

// Helper functions using configurations
export function getComplexityConfig(complexity: number) {
  return COMPLEXITY_CONFIG.find(config => complexity <= config.maxThreshold) || 
         COMPLEXITY_CONFIG[COMPLEXITY_CONFIG.length - 1];
}

export function getGradeInfo(score: number) {
  return GRADE_CONFIG.find(grade => score >= grade.threshold) || 
         GRADE_CONFIG[GRADE_CONFIG.length - 1];
}
```

### **3. Scoring Implementation** (`scoring.ts`)

```typescript
// 4-Phase Complexity Scoring Implementation
export function calculateComplexityScore(complexity: number): number {
  // Phase 1 (≤10): Excellent - McCabe threshold
  if (complexity <= EXCELLENT) return 100;
  
  // Phase 2 (10-20): Linear degradation - ends at CRITICAL=20
  if (complexity <= CRITICAL) {
    return Math.round(100 - (complexity - EXCELLENT) * LINEAR_PENALTY_RATE);
  }
  
  // Phase 3 (20-50): Quadratic penalty - uses EXPONENTIAL_MULTIPLIER=40
  if (complexity <= 50) {
    const base = 100 - (CRITICAL - EXCELLENT) * LINEAR_PENALTY_RATE; // 70
    const range = complexity - CRITICAL; // 0-30 range
    const quadraticPenalty = Math.pow(range / 30, 2) * EXPONENTIAL_MULTIPLIER; // 40
    return Math.round(base - quadraticPenalty);
  }
  
  // Phase 4 (>50): Exponential penalty - uses EXPONENTIAL_BASE=30
  const base = EXPONENTIAL_BASE; // 30
  const range = complexity - 50;
  const exponentialPenalty = Math.pow(range / 50, EXPONENTIAL_POWER) * EXPONENTIAL_BASE; // 30
  return Math.max(0, Math.round(base - exponentialPenalty));
}

// Health score calculation - DIRECT PENALTIES, NO WEIGHTS
export function calculateHealthScore(file: FileDetail, duplicationMode?: string): number {
  const complexityPenalty = getComplexityPenalty(file.metrics.complexity);
  const duplicationPenalty = getDuplicationPenalty(file.metrics.duplicationRatio, duplicationMode);
  const sizePenalty = getSizePenalty(file.metrics.loc);
  const issuesPenalty = getIssuesPenalty(file.issues);
  
  const totalPenalty = complexityPenalty + duplicationPenalty + sizePenalty + issuesPenalty;
  
  // Direct penalty summation - NO WEIGHTS APPLIED
  return Math.max(0, Math.round(100 - totalPenalty));
}
```

### **4. Project-Level Scoring** (`analyzer/OverviewCalculator.ts`)

```typescript
// Two-step weighted aggregation for project scores
export class OverviewCalculator {
  static calculate(fileDetails: FileDetail[]): Overview {
    // Step 1: Weight by architectural criticality (CriticismScore)
    const weightedMetrics = this.calculateWeightedMetrics(fileDetails);
    
    // Step 2: Apply PROJECT_SCORING_WEIGHTS (45/30/25)
    const overallScore = 
      (weightedMetrics.complexity * PROJECT_SCORING_WEIGHTS.COMPLEXITY) +
      (weightedMetrics.maintainability * PROJECT_SCORING_WEIGHTS.MAINTAINABILITY) +
      (weightedMetrics.duplication * PROJECT_SCORING_WEIGHTS.DUPLICATION);
    
    return {
      grade: getGrade(overallScore),
      scores: {
        complexity: weightedMetrics.complexity,
        maintainability: weightedMetrics.maintainability,
        duplication: weightedMetrics.duplication,
        overall: overallScore
      },
      statistics: this.calculateStatistics(fileDetails),
      summary: this.generateSummary(overallScore, criticalCount)
    };
  }
}
```

## Critical Distinctions

### **Project Weights vs File Health Scores**

| Level | Formula | Weights Applied? | Usage |
|-------|---------|------------------|--------|
| **Project Scoring** | Two-step: (1) CriticismScore weighting → (2) 45/30/25 weights | ✅ YES | Overall project grade |
| **File Health Scores** | `100 - (penalties sum)` | ❌ NO | Individual file assessment |

**Important:** The 45/30/25 weights are **INTERNAL HYPOTHESES**, not industry standards. They require empirical validation.

### **Duplication Mode Architecture (v0.7.0)**

```typescript
// Mode-aware configuration
export const DUPLICATION_LEVELS = {
  strict: {
    excellent: { maxThreshold: 3, label: 'Excellent' },   // Industry standard
    good: { maxThreshold: 8, label: 'Good' },
    needsImprovement: { maxThreshold: 15, label: 'Needs Improvement' }
  },
  legacy: {
    excellent: { maxThreshold: 15, label: 'Excellent' },  // Permissive
    good: { maxThreshold: 30, label: 'Good' },
    needsImprovement: { maxThreshold: 50, label: 'Needs Improvement' }
  }
} as const;

// CLI usage affects project scoring through 25% duplication weight
insightcode --strict-duplication  // Uses strict thresholds
insightcode                      // Uses legacy thresholds (default)
```

## Quality Assurance Architecture

### **Automated Validation System**

The architecture includes validation to prevent doc/code drift:

```bash
# Validation scripts
npm run validate-docs      # Validates numerical examples against actual code
npm run generate-docs      # Generates tables from current implementation
npm run validate-coefficients  # Validates mathematical foundations
npm run qa                 # Full quality assurance suite
```

**Key validation features:**
- **10 regex patterns** detect examples in documentation
- **Real-time validation** against actual `calculateComplexityScore()`, `calculateHealthScore()`, etc.
- **Anti-regression protection** prevents future inconsistencies
- **Auto-generated tables** reflect current code implementation

## Architectural Benefits

### 🎯 **Separation of Concerns**
- **thresholds.constants.ts**: Raw threshold values with clear coefficient usage
- **scoring.utils.ts**: Rich configurations with metadata
- **scoring.ts**: Core algorithm logic with 4-phase implementation
- **OverviewCalculator.ts**: Project-level two-step weighted aggregation

### 🔧 **Maintainability**
- Single source of truth for each concern
- Type-safe configurations with `as const`
- Automated validation prevents documentation drift
- Clear responsibility boundaries

### 🧪 **Testability**
- Constants easily mockable for unit tests
- Configurations provide test data structures
- Validation scripts ensure implementation correctness
- Test coverage for all scoring functions

### 📚 **Documentation Integrity**
- Documentation auto-validated against implementation
- Generated tables always match current code
- Version control for architectural decisions
- Clear upgrade paths documented

## Usage Guidelines

### **To modify a threshold:**
1. ✅ **Change raw value** in `thresholds.constants.ts`
2. ✅ **Run validation** with `npm run validate-docs`
3. ✅ **Update docs** if needed with `npm run generate-docs`
4. ❌ **Don't hardcode** anywhere else

### **To add a new metric:**
1. **Constant** → Add to `thresholds.constants.ts`
2. **Configuration** → Add rich config to `scoring.utils.ts`
3. **Implementation** → Add calculation logic to `scoring.ts`
4. **Integration** → Add to project scoring if needed
5. **Testing** → Add test coverage
6. **Documentation** → Auto-generated with validation

### **To verify consistency:**
```bash
# Find any remaining hardcoded values
grep -r "= 10\|= 15\|= 20" src/

# Validate all examples
npm run validate-docs

# Full validation suite
npm run qa
```

## Industry Standards Compliance

### 🏛️ **Academic Foundation**
- **McCabe (1976)**: Complexity ≤10 threshold maintained
- **NASA NPR 7150.2D (2022)**: ≤15 complexity for critical software
- **Pareto Principle**: 80/20 rule for identifying critical files
- **ISO/IEC 25010**: Maintainability quality model compliance

### ⚠️ **Internal Hypotheses**
- **PROJECT_SCORING_WEIGHTS (45/30/25)**: Internal hypotheses requiring validation
- **Power harmonization (1.8)**: Mathematical consistency across penalty types
- **CriticismScore formula**: Internal architectural weighting system

### 🚫 **Anti-Patterns Eliminated**
- **No artificial caps**: Extreme values receive appropriate penalties
- **No logarithmic masking**: Raw technical debt visible
- **No magic numbers**: All constants documented and justified
- **No data redundancy**: Single source of truth guaranteed
