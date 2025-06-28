// Types for InsightCode CLI

export interface FileMetrics {
  path: string;
  complexity: number;
  duplication: number;
  functionCount: number; 
  loc: number; // Lines of code
  issues: Issue[];
  fileType?: 'production' | 'test' | 'example' | 'utility' | 'config';
}

export interface Issue {
  type: 'complexity' | 'duplication' | 'size';
  severity: 'high' | 'medium' | 'low';
  message: string;
  line?: number;
}

export interface AnalysisResult {
  files: FileMetrics[];
  summary: {
    totalFiles: number;
    totalLines: number;
    avgComplexity: number;
    avgDuplication: number;
    avgFunctions: number;
    avgLoc: number;
  };
  score: number;
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