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
  // Check bounds first, then handle floating point errors
  if (value < 0 || value > 100.00001) { // Small tolerance for floating point errors
    throw new Error(`Invalid score: ${value}`);
  }
  return Math.round(value) as Score;
}

// ==================== DUPLICATION MODE TYPES ====================

/**
 * Duplication analysis mode
 */
export enum DuplicationMode {
  Legacy = 'legacy',    // Permissive thresholds (15%/30%/50%) for brownfield/legacy analysis
  Strict = 'strict'     // Industry-standard thresholds (3%/8%/15%) aligned with SonarQube/Google
}

/**
 * Duplication mode configuration
 */
export interface DuplicationConfig {
  mode: DuplicationMode;
  thresholds: {
    excellent: number;
    high: number;
    critical: number;
  };
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
 * Root structure returned by analysis - v0.6.0 Pure Data
 * No recommendations - 100% calculable client-side
 */
export interface AnalysisResult {
  context: Context;
  overview: Overview;
  details: FileDetail[];
  codeContext?: CodeContext[];
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
    duplicationMode: DuplicationMode; // Strict or Legacy duplication thresholds
  };
}

/**
 * Overview - WHAT Summary
 */
export interface Overview {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  statistics: {
    totalFiles: number;
    totalLOC: number;
    avgComplexity: number;
    avgLOC: number;
    avgDuplicationRatio?: number; // Average duplication ratio (0-1)
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
  file: string;        // Relative path - SINGLE SOURCE OF TRUTH  
  absolutePath: string; // Absolute path for file operations
  
  metrics: {
    complexity: number;     // Cyclomatic complexity
    loc: number;           // Lines of code
    functionCount: number;  // Number of functions
    duplicationRatio: Ratio;    // Ratio 0-1 (not percentage!)
  };
  
  dependencies: FileDependencyAnalysis
  
  issues: Issue[];
  
  healthScore: Score;   // 0-100 (100 = perfect)
}

/**
 * Issues found in files - Simplified structure for v0.6.0
 * No effortHours - too contextual to calculate automatically
 */
export interface Issue {
  type: IssueType;
  severity: Severity;
  line: number;
  threshold: number;
  excessRatio: number;    // How much over threshold - used for ROI sorting
  
  // Optional enriched location for certain issue types
  endLine?: number;
  column?: number;
  function?: string;
}

/**
 * Code context focused on critical functions and patterns
 */
export interface CodeContext {
  file: string;
  criticalFunctions: FunctionContext[];
  patterns: FilePatterns;
}

export interface FunctionContext {
  name: string;
  complexity: number;
  lineCount: number;
  parameterCount: number;
  snippet: string;
  issues: QualityIssue[];
}

export interface FilePatterns {
  quality: QualityPattern[];
  architecture: ArchitecturePattern[];
  performance: PerformancePattern[];
  security: SecurityPattern[];
  testing: TestingPattern[];
}

export type QualityPattern = 
  | 'deep-nesting'
  | 'long-function' 
  | 'high-complexity'
  | 'too-many-params'
  | 'god-function'
  | 'single-responsibility'
  | 'pure-function'
  | 'well-named';

export type ArchitecturePattern =
  | 'async-heavy'
  | 'error-handling'
  | 'type-safe'
  | 'dependency-injection'
  | 'factory-pattern'
  | 'observer-pattern';

export type PerformancePattern =
  | 'memory-intensive'
  | 'cpu-intensive'
  | 'io-heavy'
  | 'caching'
  | 'lazy-loading';

export type SecurityPattern =
  | 'input-validation'
  | 'sql-injection-risk'
  | 'xss-risk'
  | 'auth-check'
  | 'sanitization';

export type TestingPattern =
  | 'test-file'
  | 'mock-heavy'
  | 'integration-test'
  | 'unit-test';

export interface QualityIssue {
  type: QualityPattern;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

// ==================== CLI & CONFIGURATION ====================

/**
 * Analysis options for the analyzer
 */
export interface AnalysisOptions {
  format: 'json' | 'ci' | 'critical' | 'summary' | 'markdown' | 'terminal';
  projectPath: string;
  thresholds: ThresholdConfig;
  withContext?: boolean;
  excludeUtility?: boolean;
  strictDuplication?: boolean;
}

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
  excludeUtility?: boolean;
  withContext?: boolean;
  format?: 'json' | 'ci' | 'critical' | 'summary' | 'markdown' | 'terminal';
  strictDuplication?: boolean;
}

/**
 * Configuration thresholds for issue detection
 */
export interface ThresholdConfig {
  complexity: {
    production: { medium: number; high: number; critical?: number };
    test: { medium: number; high: number; critical?: number };
    utility: { medium: number; high: number; critical?: number };
    example?: { medium: number; high: number; critical?: number };
    config?: { medium: number; high: number; critical?: number };
  };
  size: {
    production: { medium: number; high: number; critical?: number };
    test: { medium: number; high: number; critical?: number };
    utility: { medium: number; high: number; critical?: number };
    example?: { medium: number; high: number; critical?: number };
    config?: { medium: number; high: number; critical?: number };
  };
  duplication: {
    production: { medium: number; high: number; critical?: number };
    test: { medium: number; high: number; critical?: number };
    utility: { medium: number; high: number; critical?: number };
    example?: { medium: number; high: number; critical?: number };
    config?: { medium: number; high: number; critical?: number };
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



/**
 * Configuration pour l'analyse universelle de dépendances.
 */
export interface DependencyAnalyzerConfig {
  projectRoot?: string; // Chemin racine du projet absolu
  extensions?: string[];
  indexFiles?: string[];
  aliases?: Record<string, string>;
  frameworkHints?: FrameworkHint[];
  analyzeCircularDependencies?: boolean;
  analyzeDynamicImports?: boolean;
  followSymlinks?: boolean;
  maxFileSize?: number;
  maxDepth?: number;
  timeout?: number;
  cache?: boolean;
  hubFileThreshold?: number; // Seuil d'impact pour qu'un fichier soit considéré comme un "hub"
  logResolutionErrors?: boolean; // Log des erreurs de résolution d'import
}

export interface FrameworkHint {
  name: 'vue' | 'react' | 'angular' | 'svelte' | 'next' | 'nuxt' | 'gatsby' | 'custom';
  importPatterns?: RegExp[];
  filePatterns?: RegExp[];
  resolver?: (importPath: string, context: ResolverContext) => string | null;
}

export interface ResolverContext {
  importingFile: string;
  projectRoot: string;
}

export interface DependencyAnalysisResult {
  incomingDependencyCount: Map<string, number>;
  dependencyGraph: Map<string, Set<string>>;
  circularDependencies: string[][];
  errors: AnalysisError[];
  statistics: DependencyStatistics;
}

export interface AnalysisError {
  file: string;
  error: string;
  phase: 'read' | 'parse' | 'analyze' | 'config';
}

export interface DependencyStatistics {
  totalFiles: number;
  totalImports: number;
  averageImportsPerFile: number;
  maxImports: { file: string; count: number };
  isolatedFiles: string[];
  hubFiles: string[];
}
/**
 * Contient les métriques et analyses détaillées pour un seul fichier.
 */
export interface FileDependencyAnalysis {
  outgoingDependencies: number; // Outgoing dependencies (efferent coupling)
  incomingDependencies: number; // Incoming dependencies (afferent coupling / impact)
  cohesionScore: number; // Cohesion (0 = weak, 1 = strong) cohesion score based on dependency proximity.
  instability: number;          // Instability (0 = stable, 1 = unstable). I = outgoing / (incoming + outgoing) - Robert C. Martin's principle
  percentileUsageRank: number;  // Usage rank (percentile 0-100)
  isInCycle: boolean;           // Indicates if the file is part of a cycle
}

/**
 * The complete analysis result, now with per-file metrics.
 */
export interface DependencyAnalysisResult {
  incomingDependencyCount: Map<string, number>;
  dependencyGraph: Map<string, Set<string>>;
  circularDependencies: string[][];
  errors: AnalysisError[];
  statistics: DependencyStatistics;
  fileAnalyses: Map<string, FileDependencyAnalysis>; // ✅ Nouvelle propriété
}
export interface EmblematicFiles {
  coreFiles: string[];
  architecturalFiles: string[];
  performanceCriticalFiles: string[];
  complexAlgorithmFiles: string[];
}
export interface ReportResult {
  project: string;
  repo: string;
  type: string;
  stars: string;
  stableVersion: string;
  description: string;
  category: 'small' | 'medium' | 'large';
  emblematicFiles?: EmblematicFiles;
  analysis: AnalysisResult;
  durationMs: number;
  error?: string;
}


export interface ReportSummary {
  totalProjects: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  totalDuration: number; // Temps cumulé (pour les stats)
  realDuration: number;  // Temps réel d'exécution parallèle
  totalLines: number;
  avgComplexity: number;
  avgDuplication: number;
  gradeDistribution: Record<string, number>;
  modeCategory: 'production' | 'full';
}