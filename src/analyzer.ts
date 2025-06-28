import * as crypto from 'crypto';
import { FileMetrics, AnalysisResult, ThresholdConfig } from './types';
import { DEFAULT_THRESHOLDS } from './parser';
import { calculateScore, getGrade } from './scoring';

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

  // Calculate average function count
  const avgFunctions = totalFiles > 0
    ? filesWithDuplication.reduce((sum, f) => sum + (f.functionCount || 0), 0) / totalFiles
    : 0;
  
  // Calculate average lines of code (LOC)
  const avgLoc = totalFiles > 0 ? totalLines / totalFiles : 0;

  // Calculate score (0-100)
  const score = calculateScore(avgComplexity, avgDuplication, avgLoc, avgFunctions);
  const finalScore = isNaN(score) ? 0 : Math.round(score);
  const grade = getGrade(score);
  
  return {
    files: filesWithDuplication,
    summary: {
      totalFiles,
      totalLines,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      avgDuplication: Math.round(avgDuplication * 10) / 10,
      avgFunctions: Math.round(avgFunctions * 10) / 10,
      avgLoc: Math.round(avgLoc)
    },
    score: finalScore,
    grade
  };
}

/**
 * Normalize code block to reduce false positives in duplication detection
 * Removes variable names, normalizes whitespace, and standardizes syntax
 */
function normalizeBlock(block: string): string {
  return block
    // Normalise variable names (replace with VAR)
    .replace(/\b(const|let|var)\s+\w+/g, 'VAR')
    // Normalise function declarations (replace with FUNCTION)
    .replace(/\bfunction\s+\w+/g, 'function')
    // Normalize method calls (keep the method but not the object)
    .replace(/\b\w+\.([\w]+)/g, '.$1')
    // Normalise string literals (replace with STRING)
    .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, 'STRING')
    // Normalise numbers (replace with NUM)
    .replace(/\b\d+(\.\d+)?\b/g, 'NUM')
    // Normalize property assignments (replace with PROP =)
    .replace(/\b(\w+)\s*[:=]\s*/g, 'PROP = ')
    // Remove comments
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detect code duplication using normalized block hashing
 */
function detectDuplication(files: FileMetrics[], thresholds: ThresholdConfig = DEFAULT_THRESHOLDS): FileMetrics[] {
  const blockSize = 5;
  const allBlocks = new Map<string, { count: number; original: string }>(); // hash -> {count, original example}
  const fileBlocks = new Map<string, Set<string>>(); // filepath -> set of hashes
  
  // First pass: collect all blocks
  for (const file of files) {
    const content = getFileContent(file.path);
    if (!content) continue;
    
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const blocks = new Set<string>();
    
    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block = lines.slice(i, i + blockSize).join('\n');
      const normalizedBlock = normalizeBlock(block);
      
      // Skip blocks that are too simple after normalization
      if (normalizedBlock.length < 20 || normalizedBlock.split(' ').length < 5) {
        continue;
      }
      
      const hash = crypto.createHash('md5').update(normalizedBlock).digest('hex');
      
      blocks.add(hash);
      const existing = allBlocks.get(hash) || { count: 0, original: block };
      allBlocks.set(hash, { 
        count: existing.count + 1,
        original: existing.original 
      });
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
      (allBlocks.get(hash)?.count || 0) > 1
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