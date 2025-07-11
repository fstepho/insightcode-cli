// File: src/thresholds.constants.ts

import { ThresholdConfig } from './types';

/**
 * Type-safe threshold values
 */
type ComplexityThreshold = 10 | 15 | 20 | 50;
type DuplicationThreshold = 15 | 30 | 50 | 100;
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

const BASE_DUPLICATION_THRESHOLDS: BaseThresholds<DuplicationThreshold> = {
  EXCELLENT: 15,
  HIGH: 30,
  CRITICAL: 50
} as const;

/**
 * Seuil critique global pour le health score
 * 80: Based on Pareto principle - identifies files needing immediate attention
 */
export const CRITICAL_HEALTH_SCORE: HealthScoreThreshold = 80;

// Les seuils par défaut pour la création d'Issues.
// Research-based thresholds following McCabe (1976), IEEE standards, and industry best practices
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
 * Based on academic research and industry standards
 */
export const SCORING_WEIGHTS: ScoringWeights = {
  COMPLEXITY: 0.45,        // McCabe (1976) - Strong correlation with defect rate
  MAINTAINABILITY: 0.30,   // Martin Clean Code (2008) - Impact on development velocity
  DUPLICATION: 0.25        // Fowler Refactoring (1999) - Technical debt indicator
} as const;

/**
 * Complexity scoring thresholds based on McCabe (1976) research
 */
export const COMPLEXITY_SCORING_THRESHOLDS = {
  EXCELLENT: BASE_COMPLEXITY_THRESHOLDS.EXCELLENT,
  CRITICAL: BASE_COMPLEXITY_THRESHOLDS.CRITICAL,
  LINEAR_PENALTY_RATE: 4,     // 4 points lost per complexity unit (empirical): provides gradual penalty between 10-20
  EXPONENTIAL_BASE: 30,       // Base 30: calibrated to create appropriate penalty curve steepness for practical scoring
  EXPONENTIAL_POWER: 1.5,     // Power 1.5: moderate but progressive penalty (less aggressive than quadratic)
  EXPONENTIAL_MULTIPLIER: 40, // Multiplier 40: ensures significant penalty for high complexity (>20) while maintaining score range
  MIN_SCORE: 60              // Floor of 60: prevents scores from becoming too low to be actionable in practice
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
 */
export const HEALTH_PENALTY_CONSTANTS = {
  COMPLEXITY: {
    EXCELLENT_THRESHOLD: BASE_COMPLEXITY_THRESHOLDS.EXCELLENT,
    CRITICAL_THRESHOLD: BASE_COMPLEXITY_THRESHOLDS.CRITICAL,
    LINEAR_MULTIPLIER: 2,        // 2x multiplier: provides noticeable but not excessive penalty for moderate complexity
    LINEAR_MAX_PENALTY: 20,      // Cap at 20 points: prevents linear penalties from dominating the score
    EXPONENTIAL_DENOMINATOR: 20, // Denominator 20: controls the rate of exponential growth for high complexity
    EXPONENTIAL_POWER: 1.3,      // Power 1.3: moderate exponential growth (between linear and quadratic)
    EXPONENTIAL_MULTIPLIER: 25,  // Multiplier 25: ensures significant penalties for extreme complexity while maintaining score range
    // SOFT_CAP removed - extreme complexity should receive extreme penalties (Pareto principle)
  },
  DUPLICATION: {
    EXCELLENT_THRESHOLD: BASE_DUPLICATION_THRESHOLDS.EXCELLENT,
    HIGH_THRESHOLD: BASE_DUPLICATION_THRESHOLDS.HIGH,
    LINEAR_MULTIPLIER: 1.5,      // 1.5x multiplier: gentler than complexity as duplication is often easier to fix
    LINEAR_MAX_PENALTY: 22.5,    // Cap at 22.5 points: slightly higher than complexity to account for maintenance burden
    EXPONENTIAL_DENOMINATOR: 10, // Denominator 10: faster exponential growth for high duplication (maintenance nightmare)
    EXPONENTIAL_POWER: 1.8,      // Power 1.8: steeper than complexity as duplication compounds maintenance issues
    EXPONENTIAL_MULTIPLIER: 10   // Multiplier 10: strong penalty for excessive duplication
  },
  SIZE: {
    EXCELLENT_THRESHOLD: 200,    // 200 LOC: Martin Clean Code recommendation for readable files
    HIGH_THRESHOLD: 500,         // 500 LOC: threshold where files become difficult to navigate
    LINEAR_DIVISOR: 15,          // Divisor 15: gentle penalty progression for moderately large files
    LINEAR_MAX_PENALTY: 20,      // Cap at 20 points: consistent with complexity penalties
    EXPONENTIAL_DENOMINATOR: 1000, // Denominator 1000: exponential penalties start at very large files (1000+ LOC)
    EXPONENTIAL_POWER: 1.3,      // Power 1.3: moderate exponential growth similar to complexity
    EXPONENTIAL_MULTIPLIER: 8    // Multiplier 8: lower than complexity/duplication as size alone is less critical
  },
  ISSUES: {
    CRITICAL_PENALTY: 20,        // 20 points: significant penalty for critical issues requiring immediate attention
    HIGH_PENALTY: 12,           // 12 points: substantial penalty for high-priority issues
    MEDIUM_PENALTY: 6,          // 6 points: moderate penalty for medium-priority issues
    LOW_PENALTY: 2,             // 2 points: minimal penalty for low-priority issues (still tracked)
    DEFAULT_PENALTY: 6          // 6 points: default for unclassified issues (medium severity assumption)
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
} as const;