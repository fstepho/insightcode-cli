// Types for InsightCode CLI

export interface FileMetrics {
  path: string;
  complexity: number;
  duplication: number;
  functionCount: number; 
  loc: number; // Lines of code
  issues: Issue[];
  fileType?: 'production' | 'test' | 'example' | 'utility' | 'config';
  // Scoring fields
  totalScore: number;
  complexityRatio: number;
  sizeRatio: number;
}

export interface Issue {
  type: 'complexity' | 'duplication' | 'size';
  severity: 'high' | 'medium' | 'low';
  message: string;
  line?: number;
  value: number;
  ratio?: number;
}

export interface AnalysisResult {
  files: FileMetrics[];
  topFiles: FileMetrics[];
  summary: {
    totalFiles: number;
    totalLines: number;
    avgComplexity: number;
    avgDuplication: number;
    avgFunctions: number;
    avgLoc: number;
  };
  scores: {
    complexity: number;      // Individual complexity score (0-100)
    duplication: number;     // Individual duplication score (0-100)  
    maintainability: number; // Individual maintainability score (0-100)
    overall: number;         // Weighted total (0-100)
  };
  score: number; // Kept for backward compatibility
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
  excludeUtility?: boolean;
}

export interface ThresholdConfig {
  complexity: {
    production: { medium: number; high: number };
    test: { medium: number; high: number };
    utility: { medium: number; high: number };
    example?: { medium: number; high: number };
    config?: { medium: number; high: number };
  };
  size: {
    production: { medium: number; high: number };
    test: { medium: number; high: number };
    utility: { medium: number; high: number };
    example?: { medium: number; high: number };
    config?: { medium: number; high: number };
  };
  duplication: {
    production: { medium: number; high: number };
    test: { medium: number; high: number };
    utility: { medium: number; high: number };
    example?: { medium: number; high: number };
    config?: { medium: number; high: number };
  };
}

export interface IssueWithFile extends Issue {
  file: string;
}
