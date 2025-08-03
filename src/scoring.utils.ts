// File: src/scoring.utils.ts

import { CRITICAL_FILE_HEALTH_SCORE, CONVERSION_CONSTANTS, FILE_SIZE_THRESHOLDS, IMPROVEMENT_SUGGESTION_THRESHOLDS } from './thresholds.constants';
import { FileDetail, EmblematicFiles, Grade } from './types';

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
const GRADE_THRESHOLDS = {
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
    severity: 'low' as const,
  },
  { 
    maxThreshold: 15,
    label: 'Medium',
    color: 'yellow' as const,
    severity: 'medium' as const,
  },
  { 
    maxThreshold: 20,
    label: 'High',
    color: 'red' as const,
    severity: 'high' as const,
  },
  { 
    maxThreshold: 50,
    label: 'Very High',
    color: 'redBold' as const,
    severity: 'critical' as const,
  },
  { 
    maxThreshold: Infinity,
    label: 'Extreme',
    color: 'redBold' as const,
    severity: 'critical' as const,
  }
] as const;

// Helper function to get complexity level configuration
export function getComplexityConfig(complexity: number) {
  return COMPLEXITY_CONFIG.find(config => complexity <= config.maxThreshold) || COMPLEXITY_CONFIG[COMPLEXITY_CONFIG.length - 1];
}

// Centralized duplication configuration - LEGACY mode (permissive for brownfield)
export const DUPLICATION_CONFIG_LEGACY = [
  { 
    maxThreshold: 15,
    label: 'Excellent',
    category: 'excellent' as const,
  },
  { 
    maxThreshold: 25,
    label: 'Good',
    category: 'good' as const,
  },
  { 
    maxThreshold: 35,
    label: 'Needs Improvement',
    category: 'poor' as const,
  },
  { 
    maxThreshold: 50,
    label: 'Major',
    category: 'critical' as const,
  },
  { 
    maxThreshold: Infinity,
    label: 'Critical',
    category: 'critical' as const,
  }
] as const;

// Centralized duplication configuration - STRICT mode (industry standards: SonarQube/Google)
export const DUPLICATION_CONFIG_STRICT = [
  { 
    maxThreshold: 3,
    label: 'Excellent',
    category: 'excellent' as const,
  },
  { 
    maxThreshold: 5,
    label: 'Good',
    category: 'good' as const,
  },
  { 
    maxThreshold: 10,
    label: 'Needs Improvement',
    category: 'poor' as const,
  },
  { 
    maxThreshold: 20,
    label: 'Major',
    category: 'critical' as const,
  },
  { 
    maxThreshold: Infinity,
    label: 'Critical',
    category: 'critical' as const,

  }
] as const;

// Duplication scoring parameters - centralized in scoring.utils.ts
export const DUPLICATION_SCORING = {
  EXPONENTIAL_MULTIPLIER: 0.003, // 0.003 (empirical): provides smooth decay curve for duplication penalties without being too harsh
  EXPONENTIAL_POWER: 1.8         // Power 1.8: harmonized with all other exponential penalties for mathematical consistency
} as const;

function getComplexityInfo(complexity: number) {
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
    emoji: '🟡',
    color: 'yellow' as const,
    ansiColorCode: 220,
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'A')!.badgeColor
  },
  medium: {
    emoji: '🟠',
    color: 'orange' as const,
    ansiColorCode: 208,
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'C')!.badgeColor
  },
  high: {
    emoji: '🔴',
    color: 'red' as const,
    ansiColorCode: 196,
    getBadgeColor: () => GRADE_CONFIG.find(g => g.grade === 'D')!.badgeColor
  },
  critical: {
    emoji: '💀',
    color: 'redBold' as const,
    ansiColorCode: 196,
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

// Helper functions for getting thresholds
export function getDuplicationThresholds(mode: 'strict' | 'legacy' = 'legacy') {
  return mode === 'strict' ? DUPLICATION_CONFIG_STRICT : DUPLICATION_CONFIG_LEGACY;
}

function getGradeInfo(score: number) {
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

export function formatPercentage(ratio: number, decimals: number = 1): string {
  return (ratioToPercentage(ratio)).toFixed(decimals) + '%';
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
export function getFilePrimaryConcern(file: FileDetail, duplicationMode: 'strict' | 'legacy' = 'legacy'): string {
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
    return `${gradeInfo.label} file health score (${file.healthScore}%)`;
  }
  
  return 'Multiple quality issues';
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
  // Import the criticism score calculation
  const { calculateFileCriticismScore } = require('./scoring');
  
  return details
    .filter(d => d.healthScore < GRADE_THRESHOLDS.C || d.issues.some(i => i.severity === 'critical' || i.severity === 'high'))
    .sort((a, b) => {
      // Priority 0: Calculate criticism scores for architectural importance
      const aCriticismScore = calculateFileCriticismScore(a);
      const bCriticismScore = calculateFileCriticismScore(b);
      
      // Priority 1: Files with critical issues AND high architectural impact
      const aCriticalCount = a.issues.filter(i => i.severity === 'critical').length;
      const bCriticalCount = b.issues.filter(i => i.severity === 'critical').length;
      
      // If both have critical issues, sort by criticism score (architectural impact)
      if (aCriticalCount > 0 && bCriticalCount > 0) {
        if (aCriticismScore !== bCriticismScore) {
          return bCriticismScore - aCriticismScore;
        }
      }
      
      // If only one has critical issues, it comes first
      if (aCriticalCount !== bCriticalCount) {
        return bCriticalCount - aCriticalCount;
      }
      
      // Priority 2: For files without critical issues, sort by criticism score
      // This ensures architectural hubs like view.ts are prioritized
      if (aCriticismScore !== bCriticismScore) {
        return bCriticismScore - aCriticismScore;
      }
      
      // Priority 3: High issues count (descending)
      const aHighCount = a.issues.filter(i => i.severity === 'high').length;
      const bHighCount = b.issues.filter(i => i.severity === 'high').length;
      if (aHighCount !== bHighCount) {
        return bHighCount - aHighCount;
      }
      
      // Priority 4: File health score (ascending - worst first)
      if (a.healthScore !== b.healthScore) {
        return a.healthScore - b.healthScore;
      }
      
      // Priority 5: Complexity (descending) as final tiebreaker
      return b.metrics.complexity - a.metrics.complexity;
    })
    .slice(0, 10);
}


export function generateFileHealthDistribution(details: FileDetail[]): string {
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

/**
 * Fonction pure pour déterminer si un fichier est critique
 * @param healthScore Score de santé du fichier
 * @param threshold Seuil critique (par défaut: CRITICAL_FILE_HEALTH_SCORE)
 * @returns true si le fichier est critique
 */
export function isCriticalFile(healthScore: number, threshold: number = CRITICAL_FILE_HEALTH_SCORE): boolean {
  return healthScore < threshold;
}
