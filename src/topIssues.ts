// src/topIssues.ts

import { AnalysisResult, FileMetrics, FileScore } from './types';

const DEFAULT_COMPLEXITY_THRESHOLD = 20;
const DEFAULT_SIZE_THRESHOLD = 300;


/**
 * Calculate a criticality score for each file based on its issues
 */
export function calculateFileScores(files: FileMetrics[]): FileScore[] {
  const fileScores: FileScore[] = [];
  
  for (const file of files) {
    let totalScore = 0;
    const criticalIssues: FileScore['issues'] = [];
    
    // Skip files without issues
    if (!file.issues || file.issues.length === 0) {
      continue;
    }
    
    // Find complexity issues
    const complexityIssue = file.issues.find(i => i.type === 'complexity' && i.severity === 'high');
    if (complexityIssue) {
      const complexity = file.complexity;
      const ratio = complexity / DEFAULT_COMPLEXITY_THRESHOLD;
      const score = Math.min(ratio * 100, 1000); // Cap at 1000
      totalScore += score;
      
      // Extract the actual complexity value from the message
      const match = complexityIssue.message.match(/complexity: (\d+)/);
      const value = match ? parseInt(match[1]) : complexity;
      
      criticalIssues.push({
        type: 'complexity',
        severity: getSeverityFromRatio(ratio),
        message: complexityIssue.message,
        value,
        ratio
      });
    }
    
    // Find size issues
    const sizeIssue = file.issues.find(i => i.type === 'size');
    if (sizeIssue) {
      const lines = file.loc;
      const ratio = lines / DEFAULT_SIZE_THRESHOLD;
      const score = Math.min(ratio * 50, 500); // Cap at 500
      totalScore += score;
      
      criticalIssues.push({
        type: 'size',
        severity: sizeIssue.severity,
        message: sizeIssue.message,
        value: lines,
        ratio
      });
    }
    
    // Find duplication issues
    const duplicationIssue = file.issues.find(i => i.type === 'duplication' && i.severity !== 'low');
    if (duplicationIssue) {
      const duplication = file.duplication;
      const score = duplication * 2;
      totalScore += score;
      
      criticalIssues.push({
        type: 'duplication',
        severity: duplicationIssue.severity,
        message: duplicationIssue.message,
        value: duplication,
      });
    }
    
    if (totalScore > 0) {
      fileScores.push({
      path: file.path,
      totalScore: Math.round(totalScore),
      complexityRatio: roundOrUndefined(criticalIssues.find(i => i.type === 'complexity')?.ratio),
      sizeRatio: roundOrUndefined(criticalIssues.find(i => i.type === 'size')?.ratio),
      duplicationValue: criticalIssues.find(i => i.type === 'duplication')?.value,
      issues: criticalIssues
    });

    }
  }
  
  // Sort by total score descending
  return fileScores.sort((a, b) => b.totalScore - a.totalScore);
}


function getSeverityFromRatio(ratio: number): 'low' | 'medium' | 'high' {
  if (ratio >= 10) return 'high';
  if (ratio >= 2.5) return 'medium';
  return 'low';
}

function roundOrUndefined(value?: number): number | undefined {
  return typeof value === 'number' ? Math.round(value * 100) / 100 : undefined;
}