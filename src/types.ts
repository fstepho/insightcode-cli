// File: src/types.ts - v0.6.0 Type Definitions

// ==================== VALIDATION TYPES ====================

/**
 * Ratio value constrained to 0-1 range
 */
export type Ratio = number;

/**
 * Score value constrained to 0-100 range
 */
export type Score = number;

/**
 * Count value constrained to >= 0
 */
export type Count = number;

/**
 * Validates and returns a ratio (0-1)
 */
export function validateRatio(value: number): Ratio {
  if (value < 0 || value > 1) {
    throw new Error(`Invalid ratio: ${value}`);
  }
  return value as Ratio;
}

/**
 * Validates and returns a score (0-100)
 */
export function validateScore(value: number): Score {
  if (value < 0 || value > 100) {
    throw new Error(`Invalid score: ${value}`);
  }
  return Math.round(value) as Score;
}

// ==================== ENUMS ====================

export enum IssueType {
  Complexity = 'complexity',
  Duplication = 'duplication',
  Size = 'size'
}

export enum Severity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// ==================== CORE INTERFACES ====================

/**
 * Root structure returned by analysis
 */
export interface AnalysisResult {
  context: Context;
  overview: Overview;
  details: FileDetail[];
  recommendations: Recommendations;
}

/**
 * Context information - WHO, WHEN, HOW
 */
export interface Context {
  project: {
    name: string;
    path: string;
    version?: string;
    repository?: string;
  };
  
  analysis: {
    timestamp: string;      // ISO 8601 format
    durationMs: number;     // Always milliseconds
    toolVersion: string;    // InsightCode version
    filesAnalyzed: number;
  };
}

/**
 * Overview - WHAT Summary
 */
export interface Overview {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  
  statistics: {
    totalFiles: number;
    totalLOC: number;
    avgComplexity: number;
    avgLOC: number;
  };
  
  scores: {
    complexity: Score;      // 0-100
    duplication: Score;     // 0-100
    maintainability: Score; // 0-100
    overall: Score;         // 0-100
  };
  
  summary: string;  // Human-readable one-liner
}

/**
 * Details - WHAT Per File
 */
export interface FileDetail {
  file: string;  // Relative path
  
  metrics: {
    complexity: number;     // Cyclomatic complexity
    loc: number;           // Lines of code
    functionCount: number;  // Number of functions
    duplication: Ratio;    // Ratio 0-1 (not percentage!)
  };
  
  importance: {
    usageCount: number;      // How many files import this
    usageRank: number;       // Percentile 0-100
    isEntryPoint: boolean;   // main.ts, index.ts, app.ts
    isCriticalPath: boolean; // Top 10% by usage
  };
  
  issues: Issue[];
  
  healthScore: Score;   // 0-100 (100 = perfect)
  isCritical: boolean;  // Top 5 problematic files
}

/**
 * Issues found in files
 */
export interface Issue {
  type: IssueType;
  severity: Severity;
  
  location: {
    line: number;
    endLine?: number;
    column?: number;
    function?: string;
  };
  
  context: {
    message: string;
    threshold: number;
    excessRatio: number;    // How much over threshold
    unit: 'count' | 'ratio' | 'lines';
  };
  
  action: {
    description: string;
    impact: string;
    effortHours: number;
  };
}

// ==================== RECOMMENDATIONS ====================

/**
 * Recommendations - WHAT TO DO
 */
export interface Recommendations {
  critical: Action[];
  quickWins: QuickWin[];
  improvements: Improvement[];
}

export interface Action {
  file: string;
  issue: string;
  solution: string;
  effortHours: number;
  impact: string;
  priority: number;  // 1-10
}

export interface QuickWin {
  description: string;
  files: string[];
  effortMinutes: number;  // Always < 60
  scoreImprovement: number;
}

export interface Improvement {
  title: string;
  description: string;
  files: string[];
  approach: string;
  effortDays: number;  // 1-5 days typically
  benefits: string[];
  risks?: string[];
}

// ==================== LEGACY SUPPORT ====================

/**
 * Legacy CodeContext for backward compatibility
 */
export interface CodeContext {
  path: string;
  complexity: number;
  
  // File structure overview
  structure: {
    imports: string[];
    exports: string[];
    classes: string[];
    functions: string[];
    interfaces: string[];
    types: string[];
    enums: string[];
    constants: string[];
  };
  
  // Key patterns detected
  patterns: {
    hasAsyncFunctions: boolean;
    hasGenerators: boolean;
    hasDecorators: boolean;
    hasJSX: boolean;
    usesTypeScript: boolean;
    hasErrorHandling: boolean;
    hasTests: boolean;
  };
  
  // Complexity breakdown
  complexityBreakdown: {
    functions: Array<{
      name: string;
      complexity: number;
      lineCount: number;
      parameters: number;
      isAsync: boolean;
      hasErrorHandling: boolean;
    }>;
    highestComplexityFunction: string;
    deepestNesting: number;
  };
  
  // Dependencies analysis
  dependencies: {
    internal: string[];
    external: string[];
    mostImportedFrom: string[];
  };
  
  // Code snippet samples (for LLM understanding)
  samples: {
    complexFunctions: Array<{
      name: string;
      complexity: number;
      snippet: string;
    }>;
  };
}

/**
 * Legacy CodeContextSummary for backward compatibility
 */
export interface CodeContextSummary {
  totalFiles: number;
  patterns: {
    asyncUsage: number;
    errorHandling: number;
    typeScriptUsage: number;
    jsxUsage: number;
    testFiles: number;
    decoratorUsage: number;
    generatorUsage: number;
  };
  architecture: {
    totalClasses: number;
    totalFunctions: number;
    totalInterfaces: number;
    totalTypes: number;
    totalEnums: number;
    avgFunctionsPerFile: number;
    avgImportsPerFile: number;
  };
  complexity: {
    filesWithHighComplexity: number;
    deepestNesting: number;
    avgComplexityPerFunction: number;
    mostComplexFunctions: Array<{
      file: string;
      name: string;
      complexity: number;
      lineCount: number;
    }>;
  };
  dependencies: {
    mostUsedExternal: Array<{ name: string; count: number }>;
    mostImportedInternal: Array<{ name: string; count: number }>;
    avgExternalDepsPerFile: number;
    avgInternalDepsPerFile: number;
  };
  codeQuality: {
    avgFunctionLength: number;
    avgParametersPerFunction: number;
    percentAsyncFunctions: number;
    percentFunctionsWithErrorHandling: number;
  };
}

// ==================== DEPRECATED INTERFACES ====================

/**
 * @deprecated Use FileDetail instead
 */
export interface FileMetrics {
  path: string;
  complexity: number;
  duplication: number;
  functionCount: number; 
  loc: number;
  fileType?: 'production' | 'test' | 'example' | 'utility' | 'config';
  issues: Issue[];
  impact: number;
  criticismScore: number;
  context?: CodeContext;
}

/**
 * @deprecated Use new AnalysisResult structure instead
 */
export interface AnalysisResultV4 {
  project: {
    name: string;
    path: string;
    packageJson?: {
      name?: string;
      version?: string;
      description?: string;
    };
  };
  summary: {
    totalFiles: number;
    totalLines: number;
    avgComplexity: number;
    avgDuplication: number;
    avgFunctions: number;
    avgLoc: number;
  };
  scores: {
    complexity: number;
    duplication: number;
    maintainability: number;
    overall: number;
  };
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  complexityStdDev: number;
  silentKillers: FileMetrics[];
  files: FileMetrics[];
  topFiles: FileMetrics[];
  codeContext?: {
    contexts: CodeContext[];
    summary: CodeContextSummary;
  };
}

// ==================== CLI & CONFIGURATION ====================

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
  excludeUtility?: boolean;
  withContext?: boolean;
  format?: 'json' | 'ci' | 'critical' | 'summary';
}

/**
 * Configuration thresholds for issue detection
 */
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

// ==================== OUTPUT FORMATS ====================

/**
 * CI format output
 */
export interface CiFormat {
  passed: boolean;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: Score;
  criticalCount: number;
}
