// Types for InsightCode CLI

export interface FileMetrics {
  path: string;
  complexity: number;
  duplication: number;
  loc: number; // Lines of code
  issues: Issue[];
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
  };
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
}