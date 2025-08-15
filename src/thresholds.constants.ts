// File: src/thresholds.constants.ts

// ThresholdConfig removed - using scoring.utils.ts configurations instead

/**
 * Type-safe threshold values
 */
type FileHealthScoreThreshold = 80;


// DUPLICATION_STATUS_CONFIG moved to scoring.utils.ts as DUPLICATION_CONFIG_LEGACY/STRICT
// Use those configurations as single source of truth for duplication thresholds

/**
 * File size threshold constants for centralized configuration
 */
export const FILE_SIZE_THRESHOLDS = {
  LARGE: 300,        // Files larger than this are considered large
  VERY_LARGE: 600,   // Files larger than this are considered very large  
  EXTREMELY_LARGE: 1000, // Files larger than this are extremely large
  HUB_FILES_PERCENTILE: 80 // Percentile threshold for hub file detection
} as const;

/**
 * Improvement suggestion threshold constants for centralized configuration
 */
export const IMPROVEMENT_SUGGESTION_THRESHOLDS = {
  AVG_COMPLEXITY: 8,           // Average complexity threshold for improvement suggestions
  DUPLICATION_PERCENTAGE: 3,   // Duplication percentage threshold for improvement suggestions
  HIGH_COMPLEXITY: 20,         // High complexity threshold for recommendations
  DUPLICATION_RATIO: 0.1       // Duplication ratio threshold for recommendations (10%)
} as const;

/**
 * Seuil critique global pour le file health score
 * 80: Based on Pareto principle - identifies files needing immediate attention
 */
export const CRITICAL_FILE_HEALTH_SCORE: FileHealthScoreThreshold = 80;

// DEFAULT_THRESHOLDS removed - use configurations from scoring.utils.ts instead:
// - COMPLEXITY_CONFIG for complexity thresholds
// - DUPLICATION_CONFIG_LEGACY/STRICT for duplication thresholds
// - Individual constants for size and other thresholds

/**
 * Type-safe scoring weights
 */

interface ScoringWeights {
  readonly COMPLEXITY: number;
  readonly MAINTAINABILITY: number;
  readonly DUPLICATION: number;
  readonly RELIABILITY: number;
}

/**
 * Weighting factors for overall score calculation with new Reliability dimension
 * 
 * UPDATED WEIGHTS (4-dimensional scoring):
 * - Complexity: 35% (down from 45%) - Still primary defect predictor
 * - Maintainability: 25% (down from 30%) - Development velocity impact  
 * - Duplication: 20% (down from 25%) - Technical debt indicator
 * - Reliability: 20% (NEW) - Code reliability based on detected issues/defects
 * 
 * Total: 100% (35% + 25% + 20% + 20%)
 * Based on internal hypotheses requiring empirical validation
 */
export const PROJECT_SCORING_WEIGHTS: ScoringWeights = {
  COMPLEXITY: 0.35,        // Primary defect predictor - reduced but still highest weight
  MAINTAINABILITY: 0.25,   // Development velocity impact - balanced weight
  DUPLICATION: 0.20,       // Technical debt indicator - moderate weight
  RELIABILITY: 0.20        // NEW: Code reliability - significant weight for detected defects
} as const;

/**
 * Complexity scoring thresholds based on McCabe (1976) research
 * 
 * Mathematical Justification for Coefficients:
 * 
 * LINEAR_PENALTY_RATE (3): 
 * - ✅ SUPERIOR CALIBRATION from documentation analysis
 * - Design: 3 points lost per complexity unit creates optimal 100→70 progression 
 * - Validation: Complexity 20 (NASA threshold) = 70 points (C grade, appropriate for critical threshold)
 * - Industry alignment: More realistic than aggressive 4-point penalty
 * 
 * EXPONENTIAL_BASE (30):
 * - Mathematical continuity: Ensures smooth transition from quadratic phase
 * - Scoring philosophy: 30 = "critical baseline" allowing exponential decay to 0
 * - Validation: ✅ Maintains scoring coherence at phase boundaries
 * 
 * EXPONENTIAL_POWER (1.8):
 * - ✅ FULLY HARMONIZED across ALL exponential penalties (complexity, duplication, health)
 * - Superior calibration: Provides appropriate penalties for extreme values
 * - Mathematical coherence: Universal 1.8 power creates consistent exponential behavior system-wide
 * 
 * QUADRATIC_PENALTY_MULTIPLIER (40):
 * - Calibrated for quadratic range penalty: 70→30 points over complexity 20-50
 * - Mathematical design: 40-point span covers exactly two grade levels (C→D→F)
 * - Validation: ✅ Complexity 50 (NIST "high risk") = exactly 30 points
 * 
 * Validation Status: LINEAR_PENALTY_RATE + QUADRATIC_PENALTY_MULTIPLIER ✅ validated
 * ✅ EXPONENTIAL_POWER HARMONIZATION COMPLETE: All exponential penalties use 1.8
 * 
 * Philosophy: NO ARTIFICIAL FLOOR - extreme complexity (1000+) can reach 0 score
 * to reflect true technical debt severity and maintain mathematical coherence
 * Mathematical Coherence: Universal 1.8 exponential power across all penalty types
 * See: docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md for detailed analysis
 */
export const COMPLEXITY_SCORING_THRESHOLDS = {
  EXCELLENT: 10,              // McCabe "excellent" threshold
  CRITICAL: 20,               // NASA critical threshold  
  LINEAR_PENALTY_RATE: 3,     // 3 points lost per complexity unit: creates optimal 100→70 progression (superior calibration from documentation)
  EXPONENTIAL_BASE: 30,       // Base 30: calibrated to create appropriate penalty curve steepness for practical scoring
  EXPONENTIAL_POWER: 1.8,     // Power 1.8: harmonized with duplication penalties for mathematical consistency (superior calibration)
  QUADRATIC_PENALTY_MULTIPLIER: 40  // Multiplier 40: ensures significant penalty for high complexity (>20) while maintaining score range
} as const;

/**
 * Maintainability scoring thresholds based on Martin Clean Code (2008)
 */
export const FILE_MAINTAINABILITY_SCORING_THRESHOLDS = {
  OPTIMAL_FILE_SIZE: 200,     // Martin Clean Code: ideal file size for readability and cognitive load
  OPTIMAL_FUNCTION_COUNT: 10, // Industry standard: manageable number of functions per file for navigation
  SIZE_PENALTY_MULTIPLIER: 0.00003,    // 0.00003 (calibrated): gentle penalty progression for file size to avoid harsh penalties for slightly large files
  SIZE_PENALTY_POWER: 2,               // Power 2: quadratic penalty for very large files emphasizes exponential difficulty in maintenance
  FUNCTION_PENALTY_MULTIPLIER: 0.008,  // 0.008 (empirical): moderate penalty for excessive function count balancing flexibility with maintainability
  FUNCTION_PENALTY_POWER: 2            // Power 2: quadratic penalty discourages monolithic files and encourages modular design
} as const;

/**
 * Reliability scoring thresholds for the new Reliability dimension
 * 
 * RELIABILITY SCORING: Converts detected issues/defects into a 0-100 reliability score
 * (Different from FILE_HEALTH_PENALTY_CONSTANTS which are used for health score penalties)
 * 
 * METHODOLOGY:
 * - Progressive severity weighting: Critical issues impact reliability 4x more than low issues
 * - Exponential decay: Multiple issues cause exponentially worse reliability (Pareto principle)
 * - Target ranges: 1-2 minor issues ~80-90, mixed issues ~60-80, many critical issues <50
 */
export const RELIABILITY_SCORING_THRESHOLDS = {
  SEVERITY_WEIGHTS: {
    CRITICAL: 4.0,    // Critical issues have 4x impact on reliability score
    HIGH: 2.5,        // High issues have 2.5x impact on reliability
    MEDIUM: 1.5,      // Medium issues have 1.5x impact on reliability
    LOW: 1.0,         // Low issues have base impact on reliability
    DEFAULT: 1.0      // Default weight for unknown severity
  },
  DECAY_FACTOR: 0.15,        // 0.15: Controls how quickly score degrades with more issues (empirically tuned)
  EXPONENTIAL_POWER: 1.2,    // 1.2: Slight exponential curve for multiple issues (less aggressive than penalties)
  BASE_SCORE: 100            // Perfect score when no issues detected
} as const;


/**
 * File health score penalty constants
 * 
 * Mathematical Coefficient Justification:
 * 
 * COMPLEXITY penalties:
 * - Power 1.8: Harmonized with all exponential penalties
 *   ✅ MATHEMATICAL CONSISTENCY: Unified exponential behavior across all penalty types
 * - Multiplier 50: Calibrated against InsightCode's complexity 176 → penalty 31 case
 *   ✅ EMPIRICALLY VALIDATED: Real-world extreme case produces reasonable penalty
 * 
 * DUPLICATION penalties:
 * - Power 1.8: Harmonized with all exponential penalties
 *   ✅ MATHEMATICAL CONSISTENCY: Same exponential growth rate system-wide
 * - Multiplier 1.5: "Gentler than complexity" (duplication easier to fix)
 *   🎯 INDUSTRY HEURISTIC: Reasonable but needs empirical validation
 * - Denominator 10: Creates rapid acceleration beyond 30%
 *   ⚠️ MAY BE TOO AGGRESSIVE: Could over-penalize brownfield codebases
 *   Needs testing: Compare 10 vs 15 vs 20 against real high-duplication projects
 * 
 * SIZE penalties:
 * - Divisor 15: Based on cognitive chunking theory (Miller's 7±2 rule)
 *   🏛️ THEORETICAL BASIS SOUND: Every 15 LOC = 1 penalty point
 * - Power 1.8: Harmonized with all exponential penalties
 *   ✅ MATHEMATICAL CONSISTENCY: Unified exponential behavior across all penalty types
 * - Denominator 1000: May be too forgiving for massive files (2000+ LOC)
 *   ⚠️ NEEDS EMPIRICAL VALIDATION: Test against maintenance burden correlation
 * 
 * ISSUES penalties:
 * - Ratio 20:12:6:2 (Critical:High:Medium:Low)
 *   ✅ EMPIRICALLY CALIBRATED: Tested against real issue distributions
 *   Mathematical property: Clean 10:6:3:1 ratio provides predictable scaling
 * 
 * Priority Actions:
 * 1. Validate harmonized 1.8 power against diverse real-world cases
 * 2. Validate denominators (10, 1000) against real-world high-penalty scenarios  
 * 3. ✅ COMPLETED: Powers harmonized to 1.8 across all penalty types
 * 
 * See: docs/MATHEMATICAL_COEFFICIENTS_JUSTIFICATION.md for comprehensive analysis
 */


export const FILE_HEALTH_PENALTY_CONSTANTS = {
  COMPLEXITY: {
    EXPONENTIAL_POWER: 1.8,      // Power 1.8: harmonized with complexity scoring for mathematical consistency,
    EXPONENTIAL_MULTIPLIER: 50,   // Multiplier 50: calibrated against InsightCode's complexity 176 → penalty 31 case
  },
  DUPLICATION: {
    LINEAR_MULTIPLIER: 1.5,      // 1.5x multiplier: gentler than complexity as duplication is often easier to fix - INDUSTRY HEURISTIC
    LINEAR_MAX_PENALTY: 22.5,    // Cap at 22.5 points: slightly higher than complexity to account for maintenance burden
    EXPONENTIAL_DENOMINATOR: 10, // Denominator 10: faster exponential growth for high duplication - MAY BE TOO AGGRESSIVE
    EXPONENTIAL_POWER: 1.8,      // Power 1.8: harmonized with all other exponential penalties for mathematical consistency
    EXPONENTIAL_MULTIPLIER: 10   // Multiplier 10: strong penalty for excessive duplication
  },
  SIZE: {
    EXCELLENT_THRESHOLD: 200,    // 200 LOC: Internal convention inspired by Martin Clean Code (2008), not a formal standard
    HIGH_THRESHOLD: 500,         // 500 LOC: threshold where files become difficult to navigate
    LINEAR_DIVISOR: 15,          // Divisor 15: gentle penalty progression based on cognitive chunking theory (Miller's 7±2)
    LINEAR_MAX_PENALTY: 20,      // Cap at 20 points: consistent with complexity penalties
    EXPONENTIAL_DENOMINATOR: 1000, // Denominator 1000: may be too forgiving for massive files - NEEDS VALIDATION
    EXPONENTIAL_POWER: 1.8,      // Power 1.8: harmonized with all other exponential penalties for mathematical consistency
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
 * Aligned with industry standards (SonarQube, PMD CPD)
 */
export const DUPLICATION_DETECTION_CONSTANTS = {
  BLOCK_SIZE: 8,              // 8 lines per block: balanced detection (SonarQube: 10 lines, PMD: 5-10 lines)
  MIN_TOKENS: 20,             // 20 minimum tokens: realistic for 8-line blocks (PMD default: 100, but for larger blocks)
  MIN_BLOCK_LENGTH: 40,       // 40 characters minimum: ensures meaningful code blocks are considered
  MIN_CONTENT_LENGTH: 25      // 25 characters minimum: significance threshold for content analysis
} as const;

// GRADE_THRESHOLDS moved to scoring.utils.ts as single source of truth
// Derived from GRADE_CONFIG to avoid desynchronization

/**
 * Context extraction and function analysis thresholds
 */
export const CONTEXT_EXTRACTION_THRESHOLDS = {
  FUNCTION_LINES: 50,            // 50 lines: critical threshold for function size (Martin Clean Code recommendation)
  PARAMETER_COUNT: 6,            // 6 parameters: maximum for maintainable function signatures (Clean Code principle)
  NESTING_DEPTH: 4,              // 4 levels: critical nesting depth where cognitive complexity becomes problematic
  FUNCTION_NESTING_DEPTH: 5,     // 5 levels: updated from 3 - more realistic threshold for modern codebases
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
 * Quick Wins threshold constants for centralized configuration
 * These values determine when to suggest specific improvements
 */
export const QUICK_WIN_THRESHOLDS = {
  // File-level thresholds
  FILE_DUPLICATION_RATIO: 0.15,      // 15% - Suggest duplication removal
  FILE_COMPLEXITY_HIGH: 100,         // Total complexity threshold
  FILE_TARGET_COMPLEXITY: 50,        // Target complexity after refactoring
  FILE_TARGET_DUPLICATION: 0.05,     // 5% - Target duplication percentage
  FILE_COMPLEXITY_CRITICAL: 100,
  FILE_FUNCTION_COUNT: 15, // Max functions per file
  MIN_COHESION_SCORE: 0.6, // Minimum cohesion score (0-1)

  // Function-level thresholds
  FUNCTION_PARAMS_HIGH: 5,           // Suggest object parameter pattern
  FUNCTION_PARAMS_VERY_HIGH: 7,      // Critical parameter count
  FUNCTION_PARAMS_TARGET: 3,         // Target parameter count
  FUNCTION_LOC_HIGH: 50,             // Suggest function splitting
  FUNCTION_LOC_TARGET: 30,           // Target function size
  FUNCTION_COMPLEXITY_TARGET: 10,    // Target function complexity (McCabe)
  
  // Deep nesting - centralized thresholds aligned with analyzer logic
  NESTING_MINIMAL_MAX: 2,            // 1-2 levels = minimal (well structured)
  NESTING_LIGHT_MAX: 4,              // 3-4 levels = light (guard clauses)
  NESTING_MODERATE_MAX: 7,           // 5-7 levels = moderate (early returns)
  NESTING_DEEP_MAX: 12,              // 8-12 levels = deep (serious refactoring)
  NESTING_EXTREME_MIN: 13,           // 13+ levels = extreme (architectural)
  ASSUMED_NESTING_DEPTH: 5,          // Conservative default when depth unknown
  TARGET_NESTING_DEPTH: 3,           // Target nesting after refactoring
  
  // ROI calculation thresholds
  ROI_HIGH_PRIORITY: 10,             // ROI > 10 = high priority
  ROI_MEDIUM_PRIORITY: 5,            // ROI 5-10 = medium priority
  
  // Score gain constants
  MAX_GAIN_PER_FUNCTION: 20,         // Maximum score gain per function
  BASE_READABILITY_GAIN: 3,          // Base gain for readability improvements
  GOD_FUNCTION_GAIN: 15,             // Gain for refactoring god functions
  SPLIT_RESPONSIBILITY_GAIN: 8,      // Gain for single responsibility
  MAX_GAIN_PER_FILE: 25,              // Maximum score gain per file

  // Effort estimation thresholds
  EFFORT_COMPLEXITY_EASY: 25,        // Complexity < 25 = easy
  EFFORT_COMPLEXITY_MODERATE: 40,    // Complexity < 40 = moderate
  EFFORT_COMPLEXITY_HARD: 60,        // Complexity < 60 = hard
  
  EFFORT_DUPLICATION_EASY: 0.2,      // Duplication < 20% = easy
  EFFORT_DUPLICATION_MODERATE: 0.3,  // Duplication < 30% = moderate
  
  EFFORT_FUNCTION_LOC_EASY: 75,      // Function < 75 LOC = easy to split
  EFFORT_FUNCTION_LOC_MODERATE: 150, // Function < 150 LOC = moderate
  
  // Effort time factors (in hours)
  EFFORT_HOURS: {
    trivial: 0.25,   // 15 minutes
    easy: 0.5,       // 30 minutes
    moderate: 1,     // 1 hour
    hard: 2,         // 2 hours
    complex: 4       // 4 hours
  }
} as const;

// Type export for type safety
export type QuickWinThresholdsType = typeof QUICK_WIN_THRESHOLDS;