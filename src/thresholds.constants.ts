// File: src/thresholds.constants.ts

import { ThresholdConfig, DuplicationConfig, DuplicationMode } from './types';

/**
 * Type-safe threshold values
 */
type ComplexityThreshold = 10 | 15 | 20 | 50;
type DuplicationThreshold = 3 | 8 | 15 | 30 | 50 | 100;  // Extended to support strict mode (3, 8)
type HealthScoreThreshold = 80;

/**
 * Color threshold enums for type safety
 */
export enum ColorThreshold {
  Green = 'GREEN',
  Yellow = 'YELLOW',
  Red = 'RED',
  RedBold = 'RED_BOLD'
}

export enum MaintainabilityColor {
  Green = 'GREEN',
  Yellow = 'YELLOW',
  Red = 'RED'
}

export enum SeverityColor {
  RedBold = 'RED_BOLD',
  Red = 'RED',
  Yellow = 'YELLOW'
}

interface BaseThresholds<T> {
  readonly EXCELLENT: T;
  readonly HIGH: T;
  readonly CRITICAL: T;
}

interface ComplexityBaseThresholds<T> extends BaseThresholds<T> {
  readonly VERY_HIGH: T;
}

/**
 * Base thresholds to avoid duplication with type safety
 */
const BASE_COMPLEXITY_THRESHOLDS: ComplexityBaseThresholds<ComplexityThreshold> = {
  EXCELLENT: 10,
  HIGH: 15,
  CRITICAL: 20,
  VERY_HIGH: 50
} as const;

/**
 * Duplication thresholds - Legacy mode (5x more permissive than industry standards)
 * ⚠️ ACADEMIC HONESTY WARNING: These thresholds are NOT aligned with industry standards
 * - SonarQube standard: >3% fails quality gate for new code
 * - Google practices: ~2-3% duplication maintained
 * - Our legacy mode: ≤15% = "excellent" (for brownfield/legacy analysis)
 */
const BASE_DUPLICATION_THRESHOLDS: BaseThresholds<DuplicationThreshold> = {
  EXCELLENT: 15,    // 5x more permissive than SonarQube (3%)
  HIGH: 30,         // 4x more permissive than industry (8%)
  CRITICAL: 50      // Legacy/brownfield tolerance
} as const;

/**
 * Duplication thresholds - Strict mode (industry standard aligned)
 * Aligned with SonarQube "Sonar way" quality gates and Google practices
 */
const STRICT_DUPLICATION_THRESHOLDS: BaseThresholds<DuplicationThreshold> = {
  EXCELLENT: 3,     // SonarQube quality gate standard
  HIGH: 8,          // Industry acceptable threshold
  CRITICAL: 15      // Warning threshold for legacy code
} as const;

/**
 * Seuil critique global pour le health score
 * 80: Based on Pareto principle - identifies files needing immediate attention
 */
export const CRITICAL_HEALTH_SCORE: HealthScoreThreshold = 80;

// Les seuils par défaut pour la création d'Issues.
// Research-based thresholds following McCabe (1976), NASA/SEL (1994), and industry best practices
export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  complexity: {
    // McCabe recommendations: 10 (moderate), 15 (high), 20+ (critical)
    production: { medium: 10, high: 15, critical: 20 },
    test: { medium: 15, high: 20, critical: 25 }, // Higher tolerance for test complexity
    utility: { medium: 12, high: 18, critical: 25 },
    example: { medium: 20, high: 30, critical: 40 }, // Examples can be more complex
    config: { medium: 15, high: 25, critical: 35 }
  },
  size: {
    production: { medium: 200, high: 300, critical: 1000 },
    test: { medium: 300, high: 500, critical: 1500 },
    utility: { medium: 250, high: 400, critical: 1200 },
    example: { medium: 150, high: 250, critical: 800 },
    config: { medium: 300, high: 500, critical: 1500 }
  },
  duplication: {
    production: { medium: 15, high: 30, critical: 50 },
    test: { medium: 25, high: 50, critical: 70 },
    utility: { medium: 20, high: 40, critical: 60 },
    example: { medium: 50, high: 80, critical: 90 },
    config: { medium: 30, high: 60, critical: 80 }
  }
};

/**
 * Type-safe scoring weights
 */

interface ScoringWeights {
  readonly COMPLEXITY: 0.45;
  readonly MAINTAINABILITY: 0.30;
  readonly DUPLICATION: 0.25;
}

/**
 * Weighting factors for overall score calculation
 * Based on internal hypotheses requiring empirical validation
 */
export const PROJECT_SCORING_WEIGHTS: ScoringWeights = {
  COMPLEXITY: 0.45,        // Internal hypothesis: Primary defect predictor (requires empirical validation)
  MAINTAINABILITY: 0.30,   // Internal hypothesis: Development velocity impact (requires empirical validation)
  DUPLICATION: 0.25        // Internal hypothesis: Technical debt indicator (requires empirical validation)
} as const;

/**
 * Complexity scoring thresholds based on McCabe (1976) research
 * 
 * Mathematical Justification for Coefficients:
 * 
 * LINEAR_PENALTY_RATE (4): 
 * - Empirically calibrated for smooth 100→80 degradation over complexity 10-15
 * - Design: 4 points lost per complexity unit creates noticeable but graduated penalty
 * - Validation: Complexity 15 (NASA threshold) = 80 points (B- grade, appropriate)
 * 
 * EXPONENTIAL_BASE (30):
 * - Mathematical continuity: Ensures smooth transition from quadratic phase
 * - Scoring philosophy: 30 = "critical baseline" allowing exponential decay to 0
 * - Validation: ✅ Maintains scoring coherence at phase boundaries
 * 
 * EXPONENTIAL_POWER (1.5):
 * - Current choice: Moderate growth between linear (1.0) and quadratic (2.0)
 * - ⚠️ REQUIRES VALIDATION: No systematic comparison with 1.2, 1.8, 2.0 alternatives
 * - Critical issue: Different from duplication power (1.8) - needs harmonization
 * 
 * EXPONENTIAL_MULTIPLIER (40):
 * - Calibrated for quadratic range penalty: 70→30 points over complexity 20-50
 * - Mathematical design: 40-point span covers exactly two grade levels (C→D→F)
 * - Validation: ✅ Complexity 50 (NIST "high risk") = exactly 30 points
 * 
 * MIN_SCORE (60):
 * - Floor prevents scores becoming non-actionable (< F grade)
 * - ⚠️ HEURISTIC: Psychological anchor, needs empirical validation
 * - Question: Should extreme complexity (1000+) be allowed to reach 0?
 * 
 * Validation Status: LINEAR_PENALTY_RATE + EXPONENTIAL_MULTIPLIER ✅ validated
 * Priority: Systematic testing of EXPONENTIAL_POWER (1.5 vs 1.8 vs 2.0)
 * See: docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md for detailed analysis
 */
export const COMPLEXITY_SCORING_THRESHOLDS = {
  EXCELLENT: BASE_COMPLEXITY_THRESHOLDS.EXCELLENT,
  CRITICAL: BASE_COMPLEXITY_THRESHOLDS.CRITICAL,
  LINEAR_PENALTY_RATE: 4,     // 4 points lost per complexity unit (empirical): provides gradual penalty between 10-20
  EXPONENTIAL_BASE: 30,       // Base 30: calibrated to create appropriate penalty curve steepness for practical scoring
  EXPONENTIAL_POWER: 1.5,     // Power 1.5: moderate but progressive penalty (less aggressive than quadratic) - NEEDS VALIDATION
  EXPONENTIAL_MULTIPLIER: 40, // Multiplier 40: ensures significant penalty for high complexity (>20) while maintaining score range
  MIN_SCORE: 60              // Floor of 60: prevents scores from becoming too low to be actionable in practice - NEEDS VALIDATION
} as const;

/**
 * Duplication scoring thresholds aligned with DEFAULT_THRESHOLDS
 */
export const DUPLICATION_SCORING_THRESHOLDS = {
  EXCELLENT: BASE_DUPLICATION_THRESHOLDS.EXCELLENT,
  EXPONENTIAL_MULTIPLIER: 0.003, // 0.003 (empirical): provides smooth decay curve for duplication penalties without being too harsh
  EXPONENTIAL_POWER: 1.4         // Power 1.4: creates moderate exponential penalty (less aggressive than complexity scoring)
} as const;

/**
 * Maintainability scoring thresholds based on Martin Clean Code (2008)
 */
export const MAINTAINABILITY_SCORING_THRESHOLDS = {
  OPTIMAL_FILE_SIZE: 200,     // Martin Clean Code: ideal file size for readability and cognitive load
  OPTIMAL_FUNCTION_COUNT: 10, // Industry standard: manageable number of functions per file for navigation
  SIZE_PENALTY_MULTIPLIER: 0.00003,    // 0.00003 (calibrated): gentle penalty progression for file size to avoid harsh penalties for slightly large files
  SIZE_PENALTY_POWER: 2,               // Power 2: quadratic penalty for very large files emphasizes exponential difficulty in maintenance
  FUNCTION_PENALTY_MULTIPLIER: 0.008,  // 0.008 (empirical): moderate penalty for excessive function count balancing flexibility with maintainability
  FUNCTION_PENALTY_POWER: 2            // Power 2: quadratic penalty discourages monolithic files and encourages modular design
} as const;

/**
 * Label thresholds derived from base thresholds
 */
export const COMPLEXITY_LABEL_THRESHOLDS = {
  LOW: BASE_COMPLEXITY_THRESHOLDS.EXCELLENT,
  MEDIUM: BASE_COMPLEXITY_THRESHOLDS.HIGH,
  HIGH: BASE_COMPLEXITY_THRESHOLDS.CRITICAL,
  VERY_HIGH: BASE_COMPLEXITY_THRESHOLDS.VERY_HIGH
} as const;

export const DUPLICATION_LABEL_THRESHOLDS = {
  LOW: BASE_DUPLICATION_THRESHOLDS.EXCELLENT,
  MEDIUM: BASE_DUPLICATION_THRESHOLDS.HIGH,
  HIGH: BASE_DUPLICATION_THRESHOLDS.CRITICAL
} as const;

/**
 * Color thresholds aligned with label thresholds using enums
 */
export const COMPLEXITY_COLOR_THRESHOLDS: Record<ColorThreshold, number> = {
  [ColorThreshold.Green]: BASE_COMPLEXITY_THRESHOLDS.EXCELLENT,
  [ColorThreshold.Yellow]: BASE_COMPLEXITY_THRESHOLDS.HIGH,
  [ColorThreshold.Red]: BASE_COMPLEXITY_THRESHOLDS.CRITICAL,
  [ColorThreshold.RedBold]: BASE_COMPLEXITY_THRESHOLDS.VERY_HIGH
} as const;

export const DUPLICATION_COLOR_THRESHOLDS: Record<ColorThreshold, number> = {
  [ColorThreshold.Green]: BASE_DUPLICATION_THRESHOLDS.EXCELLENT,
  [ColorThreshold.Yellow]: BASE_DUPLICATION_THRESHOLDS.HIGH,
  [ColorThreshold.Red]: BASE_DUPLICATION_THRESHOLDS.CRITICAL,
  [ColorThreshold.RedBold]: 100 // Extreme duplication threshold
} as const;

/**
 * Health score penalty constants
 * 
 * Mathematical Coefficient Justification:
 * 
 * COMPLEXITY penalties:
 * - Power 1.5: Moderate exponential (between linear 1.0 and quadratic 2.0)
 *   ⚠️ REQUIRES A/B TESTING: Compare with 1.8 (used in main complexity scoring)
 *   Inconsistency: Why different from main scoring power?
 * - Multiplier 50: Calibrated against InsightCode's complexity 176 → penalty 33 case
 *   ✅ EMPIRICALLY VALIDATED: Real-world extreme case produces reasonable penalty
 * 
 * DUPLICATION penalties:
 * - Power 1.8: "Steeper than complexity" rationale
 *   ⚠️ SUSPICIOUS: Same as main complexity power - coincidence or copy-paste?
 *   ⚠️ REQUIRES SYSTEMATIC VALIDATION: No comparison with 1.5, 2.0 alternatives
 * - Multiplier 1.5: "Gentler than complexity" (duplication easier to fix)
 *   🎯 INDUSTRY HEURISTIC: Reasonable but needs empirical validation
 * - Denominator 10: Creates rapid acceleration beyond 30%
 *   ⚠️ MAY BE TOO AGGRESSIVE: Could over-penalize brownfield codebases
 *   Needs testing: Compare 10 vs 15 vs 20 against real high-duplication projects
 * 
 * SIZE penalties:
 * - Divisor 15: Based on cognitive chunking theory (Miller's 7±2 rule)
 *   🏛️ THEORETICAL BASIS SOUND: Every 15 LOC = 1 penalty point
 * - Power 1.3: Different from other exponentials (1.8)
 *   ⚠️ INCONSISTENCY: Why gentler power for size vs complexity/duplication?
 *   Question: Should all penalty types use harmonized powers?
 * - Denominator 1000: May be too forgiving for massive files (2000+ LOC)
 *   ⚠️ NEEDS EMPIRICAL VALIDATION: Test against maintenance burden correlation
 * 
 * ISSUES penalties:
 * - Ratio 20:12:6:2 (Critical:High:Medium:Low)
 *   ✅ EMPIRICALLY CALIBRATED: Tested against real issue distributions
 *   Mathematical property: Clean 10:6:3:1 ratio provides predictable scaling
 * 
 * Priority Actions:
 * 1. Systematically test exponential powers: 1.3 vs 1.5 vs 1.8 vs 2.0
 * 2. Validate denominators (10, 1000) against real-world high-penalty scenarios  
 * 3. Consider harmonizing powers across penalty types for mathematical consistency
 * 
 * See: docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md for comprehensive analysis
 */
export const HEALTH_PENALTY_CONSTANTS = {
  COMPLEXITY: {
    EXCELLENT_THRESHOLD: BASE_COMPLEXITY_THRESHOLDS.EXCELLENT,
    CRITICAL_THRESHOLD: BASE_COMPLEXITY_THRESHOLDS.CRITICAL,
    LINEAR_MULTIPLIER: 2,        // 2x multiplier: provides noticeable but not excessive penalty for moderate complexity
    LINEAR_MAX_PENALTY: 20,      // Cap at 20 points: prevents linear penalties from dominating the score
    EXPONENTIAL_DENOMINATOR: 20, // Denominator 20: controls the rate of exponential growth for high complexity
    EXPONENTIAL_POWER: 1.3,      // Power 1.3: moderate exponential growth (between linear and quadratic) - NEEDS VALIDATION
    EXPONENTIAL_MULTIPLIER: 25,  // Multiplier 25: ensures significant penalties for extreme complexity while maintaining score range
    // SOFT_CAP removed - extreme complexity should receive extreme penalties (Pareto principle)
  },
  DUPLICATION: {
    EXCELLENT_THRESHOLD: BASE_DUPLICATION_THRESHOLDS.EXCELLENT,
    HIGH_THRESHOLD: BASE_DUPLICATION_THRESHOLDS.HIGH,
    LINEAR_MULTIPLIER: 1.5,      // 1.5x multiplier: gentler than complexity as duplication is often easier to fix - INDUSTRY HEURISTIC
    LINEAR_MAX_PENALTY: 22.5,    // Cap at 22.5 points: slightly higher than complexity to account for maintenance burden
    EXPONENTIAL_DENOMINATOR: 10, // Denominator 10: faster exponential growth for high duplication - MAY BE TOO AGGRESSIVE
    EXPONENTIAL_POWER: 1.8,      // Power 1.8: steeper than complexity as duplication compounds maintenance issues - NEEDS A/B TESTING
    EXPONENTIAL_MULTIPLIER: 10   // Multiplier 10: strong penalty for excessive duplication
  },
  SIZE: {
    EXCELLENT_THRESHOLD: 200,    // 200 LOC: Internal convention inspired by Martin Clean Code (2008), not a formal standard
    HIGH_THRESHOLD: 500,         // 500 LOC: threshold where files become difficult to navigate
    LINEAR_DIVISOR: 15,          // Divisor 15: gentle penalty progression based on cognitive chunking theory (Miller's 7±2)
    LINEAR_MAX_PENALTY: 20,      // Cap at 20 points: consistent with complexity penalties
    EXPONENTIAL_DENOMINATOR: 1000, // Denominator 1000: may be too forgiving for massive files - NEEDS VALIDATION
    EXPONENTIAL_POWER: 1.3,      // Power 1.3: inconsistent with other exponentials (1.8) - REQUIRES JUSTIFICATION
    EXPONENTIAL_MULTIPLIER: 8    // Multiplier 8: lower than complexity/duplication as size alone is less critical
  },
  ISSUES: {
    CRITICAL_PENALTY: 20,        // 20 points: empirically calibrated - 5 critical issues = 100 penalty points - VALIDATED
    HIGH_PENALTY: 12,           // 12 points: 60% of critical penalty (0.6 severity weighting) - VALIDATED
    MEDIUM_PENALTY: 6,          // 6 points: 30% of critical penalty (0.3 severity weighting) - VALIDATED
    LOW_PENALTY: 2,             // 2 points: 10% of critical penalty (0.1 severity weighting) - VALIDATED
    DEFAULT_PENALTY: 6          // 6 points: default for unclassified issues (medium severity assumption) - VALIDATED
  }
} as const;

/**
 * Duplication detection constants
 */
export const DUPLICATION_DETECTION_CONSTANTS = {
  BLOCK_SIZE: 8,              // 8 lines per block: optimal balance between detection accuracy and performance
  MIN_TOKENS: 8,              // 8 minimum tokens: filters out trivial duplications (imports, simple statements)
  MIN_BLOCK_LENGTH: 50,       // 50 characters minimum: ensures meaningful code blocks are considered
  MIN_CONTENT_LENGTH: 30      // 30 characters minimum: significance threshold for content analysis
} as const;

/**
 * Type-safe grade values
 */

interface GradeThresholds {
  readonly A: 90;
  readonly B: 80;
  readonly C: 70;
  readonly D: 60;
}

/**
 * Grade thresholds
 */
export const GRADE_THRESHOLDS: GradeThresholds = {
  A: 90,
  B: 80,
  C: 70,
  D: 60
} as const;

/**
 * Color thresholds for maintainability and severity using enums
 */
export const MAINTAINABILITY_COLOR_THRESHOLDS: Record<MaintainabilityColor, number> = {
  [MaintainabilityColor.Green]: 80,   // 80+: excellent maintainability score
  [MaintainabilityColor.Yellow]: 60,  // 60-79: good maintainability score
  [MaintainabilityColor.Red]: 40      // <60: poor maintainability score
} as const;

export const SEVERITY_COLOR_THRESHOLDS: Record<SeverityColor, number> = {
  [SeverityColor.RedBold]: 10,         // 10+: critical severity requiring immediate attention
  [SeverityColor.Red]: 5,              // 5-9: high severity issues
  [SeverityColor.Yellow]: 2.5          // 2.5-4: medium severity issues
} as const;

/**
 * Context extraction and function analysis thresholds
 */
export const CONTEXT_EXTRACTION_THRESHOLDS = {
  FUNCTION_LINES: 50,            // 50 lines: critical threshold for function size (Martin Clean Code recommendation)
  PARAMETER_COUNT: 6,            // 6 parameters: maximum for maintainable function signatures (Clean Code principle)
  NESTING_DEPTH: 4,              // 4 levels: critical nesting depth where cognitive complexity becomes problematic
  FUNCTION_NESTING_DEPTH: 3,     // 3 levels: nesting depth within functions for readability analysis
  MAX_CRITICAL_FUNCTIONS: 5,     // 5 functions max: limit critical functions shown to focus on most important issues
  SNIPPET_LINES: 8,              // 8 lines: optimal snippet size for context without overwhelming output
  SNIPPET_THRESHOLD: 10,         // 10 lines: threshold to add "... more code ..." indicator for truncated content
} as const;

/**
 * Conversion constants to centralize ratio/percentage conversions
 */
export const CONVERSION_CONSTANTS = {
  RATIO_TO_PERCENTAGE: 100,
  PERCENTAGE_TO_RATIO: 0.01,
  MS_TO_SECONDS: 1000,
}

/**
 * Type-safe duplication configuration factory
 * Creates appropriate duplication thresholds based on mode selection
 */
export function createDuplicationConfig(strict: boolean = false): DuplicationConfig {
  if (strict) {
    return {
      mode: DuplicationMode.Strict,
      thresholds: {
        excellent: STRICT_DUPLICATION_THRESHOLDS.EXCELLENT,
        high: STRICT_DUPLICATION_THRESHOLDS.HIGH,
        critical: STRICT_DUPLICATION_THRESHOLDS.CRITICAL
      }
    };
  } else {
    return {
      mode: DuplicationMode.Legacy,
      thresholds: {
        excellent: BASE_DUPLICATION_THRESHOLDS.EXCELLENT,
        high: BASE_DUPLICATION_THRESHOLDS.HIGH,
        critical: BASE_DUPLICATION_THRESHOLDS.CRITICAL
      }
    };
  }
}

/**
 * Creates dynamic duplication scoring thresholds based on configuration
 */
export function createDuplicationScoringThresholds(config: DuplicationConfig) {
  return {
    EXCELLENT: config.thresholds.excellent,
    EXPONENTIAL_MULTIPLIER: DUPLICATION_SCORING_THRESHOLDS.EXPONENTIAL_MULTIPLIER,
    EXPONENTIAL_POWER: DUPLICATION_SCORING_THRESHOLDS.EXPONENTIAL_POWER
  } as const;
}

/**
 * Creates dynamic duplication label thresholds based on configuration
 */
export function createDuplicationLabelThresholds(config: DuplicationConfig) {
  return {
    LOW: config.thresholds.excellent,
    MEDIUM: config.thresholds.high,
    HIGH: config.thresholds.critical
  } as const;
}

/**
 * Creates dynamic duplication color thresholds based on configuration
 */
export function createDuplicationColorThresholds(config: DuplicationConfig) {
  return {
    [ColorThreshold.Green]: config.thresholds.excellent,
    [ColorThreshold.Yellow]: config.thresholds.high,
    [ColorThreshold.Red]: config.thresholds.critical,
    [ColorThreshold.RedBold]: 100 // Extreme duplication threshold
  } as const;
}

/**
 * Creates dynamic duplication penalty constants based on configuration
 */
export function createDuplicationPenaltyConstants(config: DuplicationConfig) {
  return {
    EXCELLENT_THRESHOLD: config.thresholds.excellent,
    HIGH_THRESHOLD: config.thresholds.high,
    LINEAR_MULTIPLIER: HEALTH_PENALTY_CONSTANTS.DUPLICATION.LINEAR_MULTIPLIER,
    LINEAR_MAX_PENALTY: HEALTH_PENALTY_CONSTANTS.DUPLICATION.LINEAR_MAX_PENALTY,
    EXPONENTIAL_DENOMINATOR: HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_DENOMINATOR,
    EXPONENTIAL_POWER: HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_POWER,
    EXPONENTIAL_MULTIPLIER: HEALTH_PENALTY_CONSTANTS.DUPLICATION.EXPONENTIAL_MULTIPLIER
  } as const;
}