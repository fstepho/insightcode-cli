// File: src/scoring.utils.ts

import { CRITICAL_HEALTH_SCORE, GRADE_THRESHOLDS, CONVERSION_CONSTANTS } from './thresholds.constants';
import { FileDetail } from './types';
import { getComplexityLabel, getDuplicationLabel, getMaintainabilityLabel } from './scoring';

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
export function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
}

export function getScoreStatus(score: number): string {
  if (score >= GRADE_THRESHOLDS.A) return '🟢 Excellent';
  if (score >= GRADE_THRESHOLDS.C) return '🟡 Good';
  if (score >= GRADE_THRESHOLDS.D) return '🟠 Needs Improvement';
  return '🔴 Critical';
}

export function getDuplicationStatus(dupPct: number, mode: 'strict' | 'legacy' = 'legacy'): string {
  if (mode === 'strict') {
    if (dupPct < 3)  return '🟢 Excellent';
    if (dupPct < 5)  return '🟡 Good';
    if (dupPct < 10) return '🟠 Needs Improvement';
    if (dupPct < 20) return '🔴 Major';
    return '💀 Critical';
  } else { // legacy – plus permissif
    if (dupPct < 15) return '🟢 Excellent';
    if (dupPct < 25) return '🟡 Good';
    if (dupPct < 35) return '🟠 Needs Improvement';
    if (dupPct < 50) return '🔴 Major';
    return '💀 Critical';
  }
}


export function isPassingScore(score: number): boolean {
  return score >= GRADE_THRESHOLDS.C;
}

export function getHealthCategory(healthScore: number): 'excellent' | 'good' | 'moderate' | 'poor' {
  if (healthScore >= GRADE_THRESHOLDS.A) return 'excellent';
  if (healthScore >= GRADE_THRESHOLDS.C) return 'good';
  if (healthScore >= GRADE_THRESHOLDS.D) return 'moderate';
  return 'poor';
}

export type ScoreColorGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export function getScoreColorGrade(score: number): ScoreColorGrade {
  return getGrade(score);
}

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
 */
export function getSeverityEmoji(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  const emojis = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢'
  };
  return emojis[severity] || '';
}

export function getAverageExcessRatio(issues: Array<{ excessRatio: number }>): string {
  if (issues.length === 0) return '0';
  const avg = issues.reduce((sum, i) => sum + i.excessRatio, 0) / issues.length;
  return avg.toFixed(1);
}

/**
 * Health assessment functions
 */
export function getPrimaryConcern(file: FileDetail): string {
  // Priorité 1: Complexité extrême
  if (file.metrics.complexity > 20) {
    const label = getComplexityLabel(file.metrics.complexity);
    return `${label} complexity (${file.metrics.complexity})`;
  }
  
  // Priorité 2: Taille de fichier
  if (file.metrics.loc > 300) {
    const severity = file.metrics.loc > 1000 ? 'Extremely large' : 
                    file.metrics.loc > 600 ? 'Very large' : 'Large';
    return `${severity} file (${file.metrics.loc} LOC)`;
  }
  
  // Priorité 3: Duplication
  if (file.metrics.duplicationRatio > 0.1) {
    const duplicationPercentage = file.metrics.duplicationRatio * 100;
    const label = getDuplicationLabel(duplicationPercentage);
    // Add more granularity for extreme cases
    const finalLabel = duplicationPercentage > 30 ? 'Extreme' : label;
    return `${finalLabel} duplication (${Math.round(duplicationPercentage)}%)`;
  }
  
  // Priorité 4: Instabilité
  if (file.dependencies.instability > 0.8) {
    const severity = file.dependencies.instability > 0.95 ? 'Extreme' : 'High';
    return `${severity} instability (${file.dependencies.instability.toFixed(2)})`;
  }
  
  // Priorité 5: Score de santé très bas
  if (file.healthScore < 30) {
    const label = getMaintainabilityLabel(file.healthScore);
    return `${label} health score (${file.healthScore}%)`;
  }
  
  return 'Multiple quality issues';
}

export function getRecommendationForFile(file: FileDetail): string {
  // Priority 1: Complexité extrême
  if (file.metrics.complexity > 20) {
    return 'Break down into smaller, single-responsibility functions';
  }
  
  // Priority 2: Taille de fichier
  if (file.metrics.loc > 300) {
    return 'Split into multiple modules following SRP (Single Responsibility Principle)';
  }
  
  // Priority 3: Duplication
  if (file.metrics.duplicationRatio > 0.1) {
    return 'Extract common code into reusable utilities';
  }
  
  // Priority 4: Instabilité
  if (file.dependencies.instability > 0.8) {
    return 'Apply Dependency Inversion Principle to reduce coupling';
  }
  
  // Priority 5: Score de santé très bas
  if (file.healthScore < 30) {
    return 'Consider major refactoring or rewriting this component';
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
  if (file.metrics.loc > 150 && file.metrics.complexity < 10) {
    recommendation += '. Large file with low complexity suggests poor cohesion - split by functional concerns';
  } else if (file.metrics.loc < 100 && file.metrics.complexity > 15) {
    recommendation += '. High complexity in small file suggests algorithmic complexity - consider extracting business logic';
  }
  
  return recommendation;
}

export function isFileEmblematic(filePath: string, emblematicFiles: any): boolean {
  const allEmblematic = [
    ...emblematicFiles.coreFiles,
    ...emblematicFiles.architecturalFiles,
    ...emblematicFiles.performanceCriticalFiles,
    ...emblematicFiles.complexAlgorithmFiles
  ];
  
  return allEmblematic.some(ef => filePath.includes(ef));
}

export function getCriticalFiles(details: FileDetail[], emblematicFiles: any): FileDetail[] {
  return details
    .filter(d => d.healthScore < 70 || d.issues.some(i => i.severity === 'critical' || i.severity === 'high'))
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
  const distribution = {
    excellent: details.filter(d => getHealthCategory(d.healthScore) === 'excellent').length,
    good: details.filter(d => getHealthCategory(d.healthScore) === 'good').length,
    moderate: details.filter(d => getHealthCategory(d.healthScore) === 'moderate').length,
    poor: details.filter(d => getHealthCategory(d.healthScore) === 'poor').length
  };
  
  let markdown = `| Health Status | Count | Percentage |\n`;
  markdown += `|---------------|-------|------------|\n`;
  
  const total = details.length;
  markdown += `| 🟢 Excellent (90-100) | ${distribution.excellent} | ${Math.round(distribution.excellent/total * 100)}% |\n`;
  markdown += `| 🟡 Good (70-89) | ${distribution.good} | ${Math.round(distribution.good/total * 100)}% |\n`;
  markdown += `| 🟠 Moderate (50-69) | ${distribution.moderate} | ${Math.round(distribution.moderate/total * 100)}% |\n`;
  markdown += `| 🔴 Poor (<50) | ${distribution.poor} | ${Math.round(distribution.poor/total * 100)}% |\n\n`;
  
  return markdown;
}

