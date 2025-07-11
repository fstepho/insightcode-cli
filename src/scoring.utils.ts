// File: src/scoring.utils.ts

import { CRITICAL_HEALTH_SCORE, GRADE_THRESHOLDS, CONVERSION_CONSTANTS } from './thresholds.constants';

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
  if (score >= GRADE_THRESHOLDS.A) return 'A';
  if (score >= GRADE_THRESHOLDS.B) return 'B';
  if (score >= GRADE_THRESHOLDS.C) return 'C';
  if (score >= GRADE_THRESHOLDS.D) return 'D';
  return 'F';
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