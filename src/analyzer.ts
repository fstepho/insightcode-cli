import * as crypto from 'crypto';
import { FileMetrics, AnalysisResult, Issue, ThresholdConfig } from './types';
import { DEFAULT_THRESHOLDS } from './parser';

/**
 * Analyze code metrics and calculate scores
 */
export function analyze(files: FileMetrics[], thresholds: ThresholdConfig = DEFAULT_THRESHOLDS): AnalysisResult {
  // Calculate duplication for all files
  const filesWithDuplication = detectDuplication(files, thresholds);
  
  // Calculate aggregate metrics
  const totalFiles = filesWithDuplication.length;
  const totalLines = filesWithDuplication.reduce((sum, f) => sum + f.loc, 0);
  const avgComplexity = totalFiles > 0 
    ? filesWithDuplication.reduce((sum, f) => sum + f.complexity, 0) / totalFiles 
    : 0;
  const avgDuplication = totalFiles > 0
    ? filesWithDuplication.reduce((sum, f) => sum + f.duplication, 0) / totalFiles
    : 0;
  
  // Calculate score (0-100)
  const score = calculateScore(avgComplexity, avgDuplication, totalLines / totalFiles);
  const grade = getGrade(score);
  
  return {
    files: filesWithDuplication,
    summary: {
      totalFiles,
      totalLines,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      avgDuplication: Math.round(avgDuplication * 10) / 10
    },
    score: Math.round(score),
    grade
  };
}

/**
 * Detect code duplication using block hashing
 */
function detectDuplication(files: FileMetrics[], thresholds: ThresholdConfig = DEFAULT_THRESHOLDS): FileMetrics[] {
  const blockSize = 5;
  const allBlocks = new Map<string, number>(); // hash -> count
  const fileBlocks = new Map<string, Set<string>>(); // filepath -> set of hashes
  
  // First pass: collect all blocks
  for (const file of files) {
    const content = getFileContent(file.path);
    if (!content) continue;
    
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const blocks = new Set<string>();
    
    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block = lines.slice(i, i + blockSize).join('\n');
      const hash = crypto.createHash('md5').update(block).digest('hex');
      
      blocks.add(hash);
      allBlocks.set(hash, (allBlocks.get(hash) || 0) + 1);
    }
    
    fileBlocks.set(file.path, blocks);
  }
  
  // Second pass: calculate duplication percentage
  return files.map(file => {
    const blocks = fileBlocks.get(file.path);
    if (!blocks || blocks.size === 0) {
      return { ...file, duplication: 0 };
    }
    
    // Count duplicated blocks (appearing more than once across all files)
    const duplicatedBlocks = Array.from(blocks).filter(hash => 
      (allBlocks.get(hash) || 0) > 1
    ).length;
    
    const duplicationPercentage = (duplicatedBlocks / blocks.size) * 100;
    
    // Get appropriate duplication thresholds for this file type
    const fileType = file.fileType || 'production';
    const duplicationThresholds = thresholds.duplication[fileType as keyof typeof thresholds.duplication] || thresholds.duplication.production;
    
    // Add duplication issues with file-type specific thresholds
    const issues = [...file.issues];
    if (duplicationPercentage > duplicationThresholds.high) {
      issues.push({
        type: 'duplication',
        severity: 'high',
        message: `High duplication: ${Math.round(duplicationPercentage)}% of code is duplicated`
      });
    } else if (duplicationPercentage > duplicationThresholds.medium) {
      issues.push({
        type: 'duplication',
        severity: 'medium',
        message: `Medium duplication: ${Math.round(duplicationPercentage)}% of code is duplicated`
      });
    }
    
    return {
      ...file,
      duplication: Math.round(duplicationPercentage),
      issues
    };
  });
}

/**
 * Calculate overall score based on metrics (0-100, higher is better)
 */
function calculateScore(complexity: number, duplication: number, avgLoc: number): number {
  // Normalize metrics to 0-100 scale (inverted, lower is better for raw metrics)
  const complexityScore = Math.max(0, 100 - complexity * 5); // 20+ complexity = 0 score
  const duplicationScore = Math.max(0, 100 - duplication * 2); // 50%+ duplication = 0 score
  const maintainabilityScore = Math.max(0, 100 - (avgLoc / 3)); // 300+ LOC = 0 score
  
  // Weighted average (40% complexity, 30% duplication, 30% maintainability)
  return complexityScore * 0.4 + duplicationScore * 0.3 + maintainabilityScore * 0.3;
}

/**
 * Get letter grade from score
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Simple file reader (in real app, should be in parser)
 */
function getFileContent(filepath: string): string | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const absolutePath = path.isAbsolute(filepath) 
      ? filepath 
      : path.join(process.cwd(), filepath);
    return fs.readFileSync(absolutePath, 'utf-8');
  } catch {
    return null;
  }
}