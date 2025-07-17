// File: src/scoring.utils.ts

import { CRITICAL_HEALTH_SCORE, CONVERSION_CONSTANTS, FILE_SIZE_THRESHOLDS, IMPROVEMENT_SUGGESTION_THRESHOLDS } from './thresholds.constants';
import { FileDetail, EmblematicFiles, Grade } from './types';

/**
 * Fonction pure pour déterminer si un fichier est critique
 * @param healthScore Score de santé du fichier
 * @param threshold Seuil critique (par défaut: CRITICAL_HEALTH_SCORE)
 * @returns true si le fichier est critique
 */
export function isCriticalFile(healthScore: number, threshold: number = CRITICAL_HEALTH_SCORE): boolean {
  return healthScore < threshold;
}

/**
 * Grade utility functions to centralize grade determination logic
 */

// Centralized grade configuration with all metadata - self-contained
export const GRADE_CONFIG = [
  { 
    grade: 'A' as const, 
    threshold: 90, 
    category: 'excellent' as const,
    label: 'Exceptional',
    emoji: '🟢',
    range: '90-100',
    visualEmoji: '🌟',
    badgeColor: 40,  // Green background
    healthRecommendation: 'Maintain current quality standards'
  },
  { 
    grade: 'B' as const, 
    threshold: 80, 
    category: 'very-good' as const,
    label: 'Good',
    emoji: '🟢',
    range: '80-89',
    visualEmoji: '✅',
    badgeColor: 118,  // Light Green background
    healthRecommendation: 'Minor improvements recommended'
  },
  { 
    grade: 'C' as const, 
    threshold: 70, 
    category: 'good' as const,
    label: 'Acceptable',
    emoji: '🟡',
    range: '70-79',
    visualEmoji: '⚠️',
    badgeColor: 226,  // Yellow background
    healthRecommendation: 'Moderate refactoring needed'
  },
  { 
    grade: 'D' as const, 
    threshold: 60, 
    category: 'moderate' as const,
    label: 'Poor',
    emoji: '🟠',
    range: '60-69',
    visualEmoji: '🔴',
    badgeColor: 208,  // Orange background
    healthRecommendation: 'Significant refactoring required'
  },
  { 
    grade: 'F' as const, 
    threshold: 0, 
    category: 'poor' as const,
    label: 'Critical',
    emoji: '🔴',
    range: '<60',
    visualEmoji: '💀',
    badgeColor: 196,  // Red background
    healthRecommendation: 'Consider major refactoring or rewriting this component'
  }
] as const;

// Derive GRADE_THRESHOLDS from GRADE_CONFIG - single source of truth
export const GRADE_THRESHOLDS = {
  A: GRADE_CONFIG.find(g => g.grade === 'A')!.threshold, // 90
  B: GRADE_CONFIG.find(g => g.grade === 'B')!.threshold, // 80
  C: GRADE_CONFIG.find(g => g.grade === 'C')!.threshold, // 70
  D: GRADE_CONFIG.find(g => g.grade === 'D')!.threshold, // 60
  F: GRADE_CONFIG.find(g => g.grade === 'F')!.threshold  // 0
} as const;

// Centralized complexity configuration with integrated thresholds and scoring parameters
export const COMPLEXITY_CONFIG = [
  { 
    maxThreshold: 10,
    label: 'Low',
    color: 'green' as const,
    emoji: '🟢',
    category: 'excellent' as const,
    severity: 'low' as const,
    scoreRange: [100, 100] as const,  // Perfect score for complexity <= 10
    weight: 0.1,
    order: 3,
    penalty: 2
  },
  { 
    maxThreshold: 15,
    label: 'Medium',
    color: 'yellow' as const,
    emoji: '🟡',
    category: 'good' as const,
    severity: 'medium' as const,
    scoreRange: [85, 99] as const,   // Linear degradation in this range
    weight: 0.3,
    order: 2,
    penalty: 6
  },
  { 
    maxThreshold: 20,
    label: 'High',
    color: 'red' as const,
    emoji: '🔴',
    category: 'poor' as const,
    severity: 'high' as const,
    scoreRange: [70, 84] as const,   // Continues linear degradation
    weight: 0.6,
    order: 1,
    penalty: 12
  },
  { 
    maxThreshold: 50,
    label: 'Very High',
    color: 'redBold' as const,
    emoji: '💀',
    category: 'critical' as const,
    severity: 'critical' as const,
    scoreRange: [30, 69] as const,   // Quadratic penalty in this range
    weight: 1.0,
    order: 0,
    penalty: 20
  },
  { 
    maxThreshold: Infinity,
    label: 'Extreme',
    color: 'redBold' as const,
    emoji: '💀',
    category: 'critical' as const,
    severity: 'critical' as const,
    scoreRange: [0, 29] as const,    // Exponential penalty for extreme complexity
    weight: 1.0,
    order: 0,
    penalty: 20
  }
] as const;

// Helper function to get complexity level configuration
export function getComplexityConfig(complexity: number) {
  return COMPLEXITY_CONFIG.find(config => complexity <= config.maxThreshold) || COMPLEXITY_CONFIG[COMPLEXITY_CONFIG.length - 1];
}

// Helper function to get maintainability configuration
export function getMaintainabilityConfig(score: number) {
  return MAINTAINABILITY_CONFIG.find(config => score >= config.minScore) || MAINTAINABILITY_CONFIG[MAINTAINABILITY_CONFIG.length - 1];
}

// Centralized duplication configuration - LEGACY mode (permissive for brownfield)
export const DUPLICATION_CONFIG_LEGACY = [
  { 
    maxThreshold: 15,
    label: 'Excellent',
    color: 'green' as const,
    emoji: '🟢',
    category: 'excellent' as const,
    severity: 'low' as const,
    weight: 0.1,
    order: 3,
    penalty: 2
  },
  { 
    maxThreshold: 25,
    label: 'Good',
    color: 'yellow' as const,
    emoji: '🟡',
    category: 'good' as const,
    severity: 'medium' as const,
    weight: 0.3,
    order: 2,
    penalty: 6
  },
  { 
    maxThreshold: 35,
    label: 'Needs Improvement',
    color: 'orange' as const,
    emoji: '🟠',
    category: 'poor' as const,
    severity: 'high' as const,
    weight: 0.6,
    order: 1,
    penalty: 12
  },
  { 
    maxThreshold: 50,
    label: 'Major',
    color: 'red' as const,
    emoji: '🔴',
    category: 'critical' as const,
    severity: 'critical' as const,
    weight: 1.0,
    order: 0,
    penalty: 20
  },
  { 
    maxThreshold: Infinity,
    label: 'Critical',
    color: 'redBold' as const,
    emoji: '💀',
    category: 'critical' as const,
    severity: 'critical' as const,
    weight: 1.0,
    order: 0,
    penalty: 20
  }
] as const;

// Centralized duplication configuration - STRICT mode (industry standards: SonarQube/Google)
export const DUPLICATION_CONFIG_STRICT = [
  { 
    maxThreshold: 3,
    label: 'Excellent',
    color: 'green' as const,
    emoji: '🟢',
    category: 'excellent' as const,
    severity: 'low' as const,
    weight: 0.1,
    order: 3,
    penalty: 2
  },
  { 
    maxThreshold: 5,
    label: 'Good',
    color: 'yellow' as const,
    emoji: '🟡',
    category: 'good' as const,
    severity: 'medium' as const,
    weight: 0.3,
    order: 2,
    penalty: 6
  },
  { 
    maxThreshold: 10,
    label: 'Needs Improvement',
    color: 'orange' as const,
    emoji: '🟠',
    category: 'poor' as const,
    severity: 'high' as const,
    weight: 0.6,
    order: 1,
    penalty: 12
  },
  { 
    maxThreshold: 20,
    label: 'Major',
    color: 'red' as const,
    emoji: '🔴',
    category: 'critical' as const,
    severity: 'critical' as const,
    weight: 1.0,
    order: 0,
    penalty: 20
  },
  { 
    maxThreshold: Infinity,
    label: 'Critical',
    color: 'redBold' as const,
    emoji: '💀',
    category: 'critical' as const,
    severity: 'critical' as const,
    weight: 1.0,
    order: 0,
    penalty: 20
  }
] as const;

// Duplication scoring parameters (from DUPLICATION_SCORING_THRESHOLDS)
export const DUPLICATION_SCORING = {
  EXPONENTIAL_MULTIPLIER: 0.003, // 0.003 (empirical): provides smooth decay curve for duplication penalties without being too harsh
  EXPONENTIAL_POWER: 1.8         // Power 1.8: harmonized with all other exponential penalties for mathematical consistency
} as const;

// Maintainability configuration following GRADE_CONFIG pattern
export const MAINTAINABILITY_CONFIG = [
  {
    minScore: 80,
    label: 'Excellent',
    color: 'green' as const,
    emoji: '🟢',
    category: 'excellent' as const,
    severity: 'low' as const
  },
  {
    minScore: 60,
    label: 'Good',
    color: 'yellow' as const,
    emoji: '🟡',
    category: 'good' as const,
    severity: 'medium' as const
  },
  {
    minScore: 40,
    label: 'Poor',
    color: 'red' as const,
    emoji: '🔴',
    category: 'poor' as const,
    severity: 'high' as const
  },
  {
    minScore: 0,
    label: 'Critical',
    color: 'redBold' as const,
    emoji: '💀',
    category: 'critical' as const,
    severity: 'critical' as const
  }
] as const;

export function getComplexityInfo(complexity: number) {
  return COMPLEXITY_CONFIG.find(config => complexity <= config.maxThreshold) || COMPLEXITY_CONFIG[COMPLEXITY_CONFIG.length - 1];
}

export function getDuplicationInfo(duplication: number, mode: 'strict' | 'legacy' = 'legacy') {
  const config = mode === 'strict' ? DUPLICATION_CONFIG_STRICT : DUPLICATION_CONFIG_LEGACY;
  return config.find(item => duplication <= item.maxThreshold) || config[config.length - 1];
}

// Helper function to get duplication threshold based on mode
export function getDuplicationThreshold(mode: 'strict' | 'legacy' = 'legacy') {
  return mode === 'strict' ? DUPLICATION_LEVELS.strict.excellent : DUPLICATION_LEVELS.legacy.excellent;
}

// Examples of direct usage:
// const complexityInfo = getComplexityInfo(15);
// const label = complexityInfo.label;           // Instead of getComplexityLabel(15)
// const color = complexityInfo.color;           // Instead of getComplexityColor(15)
// const emoji = complexityInfo.emoji;           // Instead of getComplexityEmoji(15)

// Direct semantic access to configuration levels - more maintainable than array indices or functions
export const COMPLEXITY_LEVELS = {
  low: COMPLEXITY_CONFIG[0],      // Low complexity (≤10)
  medium: COMPLEXITY_CONFIG[1],   // Medium complexity (11-15) 
  high: COMPLEXITY_CONFIG[2],     // High complexity (16-20)
  veryHigh: COMPLEXITY_CONFIG[3], // Very high complexity (21-50)
  extreme: COMPLEXITY_CONFIG[4]   // Extreme complexity (>50)
} as const;

export const DUPLICATION_LEVELS = {
  legacy: {
    excellent: DUPLICATION_CONFIG_LEGACY[0],      // Excellent (≤15%)
    good: DUPLICATION_CONFIG_LEGACY[1],           // Good (≤25%)
    needsImprovement: DUPLICATION_CONFIG_LEGACY[2], // Needs Improvement (≤35%)
    major: DUPLICATION_CONFIG_LEGACY[3],          // Major (≤50%)
    critical: DUPLICATION_CONFIG_LEGACY[4]        // Critical (>50%)
  },
  strict: {
    excellent: DUPLICATION_CONFIG_STRICT[0],      // Excellent (≤3%)
    good: DUPLICATION_CONFIG_STRICT[1],           // Good (≤5%)
    needsImprovement: DUPLICATION_CONFIG_STRICT[2], // Needs Improvement (≤10%)
    major: DUPLICATION_CONFIG_STRICT[3],          // Major (≤20%)
    critical: DUPLICATION_CONFIG_STRICT[4]        // Critical (>20%)
  }
} as const;

// Centralized issue severity configuration - direct access without []
export const ISSUE_SEVERITY = {
  low: {
    severity: 'low' as const,
    emoji: '🟡',
    color: 'yellow' as const,
    ansiColorCode: 220,
    weight: 0.1,
    order: 3,
    penalty: 2,
    label: 'Low',
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'A')!.badgeColor
  },
  medium: {
    severity: 'medium' as const,
    emoji: '🟠',
    color: 'orange' as const,
    ansiColorCode: 208,
    weight: 0.3,
    order: 2,
    penalty: 6,
    label: 'Medium',
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'C')!.badgeColor
  },
  high: {
    severity: 'high' as const,
    emoji: '🔴',
    color: 'red' as const,
    ansiColorCode: 196,
    weight: 0.6,
    order: 1,
    penalty: 12,
    label: 'High',
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'D')!.badgeColor
  },
  critical: {
    severity: 'critical' as const,
    emoji: '💀',
    color: 'redBold' as const,
    ansiColorCode: 196,
    weight: 1.0,
    order: 0,
    penalty: 20,
    label: 'Critical',
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'F')!.badgeColor
  }
} as const;

// Direct usage examples:
// ISSUE_SEVERITY.high.penalty      // Instead of getSeverityPenalty('high')
// ISSUE_SEVERITY.critical.emoji    // Instead of getSeverityEmoji('critical')
// ISSUE_SEVERITY.low.getBadgeColor() // Instead of getSeverityColorCode('low')

// NOTE: Use direct access instead:
// COMPLEXITY_LEVELS.high.maxThreshold
// DUPLICATION_LEVELS.low.maxThreshold

// Prefer direct access instead of getter functions:
// ISSUE_SEVERITY.high.penalty instead of getSeverityPenalty('high')
// ISSUE_SEVERITY.critical.emoji instead of getSeverityEmoji('critical')
// ISSUE_SEVERITY.low.getBadgeColor() instead of getSeverityColorCode('low')

// Temporary compatibility function - prefer direct access ISSUE_SEVERITY[severity].emoji
export function getSeverityEmoji(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  return ISSUE_SEVERITY[severity].emoji;
}

// Temporary compatibility export - prefer DUPLICATION_CONFIG_LEGACY or DUPLICATION_CONFIG_STRICT
export const DUPLICATION_CONFIG = DUPLICATION_CONFIG_LEGACY;

export function getGradeInfo(score: number) {
  return GRADE_CONFIG.find(config => score >= config.threshold) || GRADE_CONFIG[GRADE_CONFIG.length - 1];
}

export function getGradeInfoByGrade(grade: Grade) {
  return GRADE_CONFIG.find(config => config.grade === grade) || GRADE_CONFIG[GRADE_CONFIG.length - 1];
}

export function getGrade(score: number): Grade {
  return getGradeInfo(score).grade;
}

export function getScoreStatus(score: number): string {
  const gradeInfo = getGradeInfo(score);
  return `${gradeInfo.emoji} ${gradeInfo.label}`;
}

export function getDuplicationStatus(dupPct: number, mode: 'strict' | 'legacy' = 'legacy'): string {
  // Use table-driven approach with mode-specific configuration
  const duplicationInfo = getDuplicationInfo(dupPct, mode);
  return `${duplicationInfo.emoji} ${duplicationInfo.label}`;
}


export function isPassingScore(score: number): boolean {
  return score >= GRADE_THRESHOLDS.C;
}

// NOTE: Use direct access instead:
// const gradeInfo = GRADE_CONFIG.find(g => score >= g.threshold)!;
// Then use: gradeInfo.category, gradeInfo.grade, etc.

/**
 * Utility functions for ratio/percentage conversions
 */
export function ratioToPercentage(ratio: number): number {
  return ratio * CONVERSION_CONSTANTS.RATIO_TO_PERCENTAGE;
}

export function percentageToRatio(percentage: number): number {
  return percentage * CONVERSION_CONSTANTS.PERCENTAGE_TO_RATIO;
}

export function msToSeconds(milliseconds: number): number {
  return milliseconds / CONVERSION_CONSTANTS.MS_TO_SECONDS;
}

export function formatPercentage(ratio: number, decimals: number = 1): string {
  return (ratioToPercentage(ratio)).toFixed(decimals) + '%';
}

export function calculateExcessPercentage(excessRatio: number): number {
  return ratioToPercentage(excessRatio) - CONVERSION_CONSTANTS.RATIO_TO_PERCENTAGE;
}

/**
 * Severity and status utility functions
 * NOTE: getSeverityEmoji moved to centralized SEVERITY_LEVELS configuration above
 */

export function getAverageExcessRatio(issues: Array<{ excessRatio: number }>): string {
  if (issues.length === 0) return '0';
  const avg = issues.reduce((sum, i) => sum + i.excessRatio, 0) / issues.length;
  return avg.toFixed(1);
}

/**
 * Health assessment functions
 */
export function getPrimaryConcern(file: FileDetail, duplicationMode: 'strict' | 'legacy' = 'legacy'): string {
  // Priorité 1: Complexité extrême
  if (file.metrics.complexity > IMPROVEMENT_SUGGESTION_THRESHOLDS.HIGH_COMPLEXITY) {
    const complexityInfo = getComplexityInfo(file.metrics.complexity);
    return `${complexityInfo.label} complexity (${file.metrics.complexity})`;
  }
  
  // Priorité 2: Taille de fichier
  if (file.metrics.loc > FILE_SIZE_THRESHOLDS.LARGE) {
    const severity = file.metrics.loc > FILE_SIZE_THRESHOLDS.EXTREMELY_LARGE ? 'Extremely large' : 
                    file.metrics.loc > FILE_SIZE_THRESHOLDS.VERY_LARGE ? 'Very large' : 'Large';
    return `${severity} file (${file.metrics.loc} LOC)`;
  }
  
  // Priorité 3: Duplication
  if (file.metrics.duplicationRatio > IMPROVEMENT_SUGGESTION_THRESHOLDS.DUPLICATION_RATIO) {
    const duplicationPercentage = file.metrics.duplicationRatio * 100;
    const duplicationInfo = getDuplicationInfo(duplicationPercentage, duplicationMode);
    // Add more granularity for extreme cases - use mode-appropriate threshold
    const goodThreshold = duplicationMode === 'strict' 
      ? DUPLICATION_LEVELS.strict.good.maxThreshold 
      : DUPLICATION_LEVELS.legacy.good.maxThreshold;
    const finalLabel = duplicationPercentage > goodThreshold ? 'Extreme' : duplicationInfo.label;
    return `${finalLabel} duplication (${Math.round(duplicationPercentage)}%)`;
  }
  
  // Priorité 4: Instabilité
  if (file.dependencies.instability > 0.8) {
    const severity = file.dependencies.instability > 0.95 ? 'Extreme' : 'High';
    return `${severity} instability (${file.dependencies.instability.toFixed(2)})`;
  }
  
  // Priorité 5: Score de santé très bas
  const gradeInfo = getGradeInfo(file.healthScore);
  if (gradeInfo.grade === 'F') {
    return `${gradeInfo.label} health score (${file.healthScore}%)`;
  }
  
  return 'Multiple quality issues';
}

export function getRecommendationForFile(file: FileDetail): string {
  // Priority 1: Complexité extrême
  if (file.metrics.complexity > IMPROVEMENT_SUGGESTION_THRESHOLDS.HIGH_COMPLEXITY) {
    return 'Break down into smaller, single-responsibility functions';
  }
  
  // Priority 2: Taille de fichier
  if (file.metrics.loc > FILE_SIZE_THRESHOLDS.LARGE) {
    return 'Split into multiple modules following SRP (Single Responsibility Principle)';
  }
  
  // Priority 3: Duplication
  if (file.metrics.duplicationRatio > IMPROVEMENT_SUGGESTION_THRESHOLDS.DUPLICATION_RATIO) {
    return 'Extract common code into reusable utilities';
  }
  
  // Priority 4: Instabilité
  if (file.dependencies.instability > 0.8) {
    return 'Apply Dependency Inversion Principle to reduce coupling';
  }
  
  // Priority 5: Score de santé - use table-driven approach
  const gradeInfo = getGradeInfo(file.healthScore);
  if (gradeInfo.grade === 'F') {
    return gradeInfo.healthRecommendation;
  }
  
  // Enhanced fallback recommendations based on file metrics
  let recommendation = 'Apply Single Responsibility Principle to decompose this file';
  
  // Add specific guidance based on dependency patterns
  if (file.dependencies.outgoingDependencies > 10) {
    recommendation += '. High outgoing dependencies suggest tight coupling - consider dependency injection';
  } else if (file.dependencies.incomingDependencies > 8) {
    recommendation += '. High incoming dependencies suggest this is a central component - ensure it has a clear, stable interface';
  }
  
  // Add guidance based on file size vs complexity relationship
  if (file.metrics.loc > 150 && file.metrics.complexity < COMPLEXITY_LEVELS.low.maxThreshold) {
    recommendation += '. Large file with low complexity suggests poor cohesion - split by functional concerns';
  } else if (file.metrics.loc < 100 && file.metrics.complexity > COMPLEXITY_LEVELS.medium.maxThreshold) {
    recommendation += '. High complexity in small file suggests algorithmic complexity - consider extracting business logic';
  }
  
  return recommendation;
}

export function isFileEmblematic(filePath: string, emblematicFiles: EmblematicFiles | undefined): boolean {
  if (!emblematicFiles) return false;
  
  const allEmblematic = [
    ...emblematicFiles.coreFiles,
    ...emblematicFiles.architecturalFiles,
    ...emblematicFiles.performanceCriticalFiles,
    ...emblematicFiles.complexAlgorithmFiles
  ];
  
  return allEmblematic.some(ef => filePath.includes(ef));
}

export function getCriticalFiles(details: FileDetail[], emblematicFiles: EmblematicFiles | undefined): FileDetail[] {
  return details
    .filter(d => d.healthScore < GRADE_THRESHOLDS.C || d.issues.some(i => i.severity === 'critical' || i.severity === 'high'))
    .sort((a, b) => {
      // Priority 0: Emblematic files first within same severity groups
      const aIsEmblematic = isFileEmblematic(a.file, emblematicFiles);
      const bIsEmblematic = isFileEmblematic(b.file, emblematicFiles);
      
      // Priority 1: Critical issues count (descending)
      const aCriticalCount = a.issues.filter(i => i.severity === 'critical').length;
      const bCriticalCount = b.issues.filter(i => i.severity === 'critical').length;
      if (aCriticalCount !== bCriticalCount) {
        return bCriticalCount - aCriticalCount;
      }
      
      // Priority 1.5: Within same critical count, emblematic files first
      if (aCriticalCount === bCriticalCount && aIsEmblematic !== bIsEmblematic) {
        return aIsEmblematic ? -1 : 1;
      }
      
      // Priority 2: High issues count (descending)
      const aHighCount = a.issues.filter(i => i.severity === 'high').length;
      const bHighCount = b.issues.filter(i => i.severity === 'high').length;
      if (aHighCount !== bHighCount) {
        return bHighCount - aHighCount;
      }
      
      // Priority 2.5: Within same high count, emblematic files first
      if (aHighCount === bHighCount && aIsEmblematic !== bIsEmblematic) {
        return aIsEmblematic ? -1 : 1;
      }
      
      // Priority 3: Health score (ascending - worst first)
      if (a.healthScore !== b.healthScore) {
        return a.healthScore - b.healthScore;
      }
      
      // Priority 4: Complexity (descending)
      return b.metrics.complexity - a.metrics.complexity;
    })
    .slice(0, 10);
}


export function generateHealthDistribution(details: FileDetail[]): string {
  const total = details.length;
  
  let markdown = `| Health Status | Count | Percentage |\n`;
  markdown += `|---------------|-------|------------|\n`;
  
  // Generate rows dynamically from GRADE_CONFIG
  GRADE_CONFIG.forEach(gradeConfig => {
    const count = details.filter(d => getGradeInfo(d.healthScore).category === gradeConfig.category).length;
    const percentage = Math.round(count / total * 100);
    const displayLabel = gradeConfig.category === 'very-good' ? 'Very Good' : 
                        gradeConfig.category.charAt(0).toUpperCase() + gradeConfig.category.slice(1);
    
    markdown += `| ${gradeConfig.emoji} ${displayLabel} (${gradeConfig.grade}: ${gradeConfig.range}) | ${count} | ${percentage}% |\n`;
  });
  
  markdown += `\n`;
  return markdown;
}

