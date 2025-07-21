// File: src/types.ts

// ==================== VALIDATION TYPES ====================

/**
 * Centralized Grade type for all code quality grades
 */
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Ratio value constrained to 0-1 range
 */
export type Ratio = number;

/**
 * Score value constrained to 0-100 range
 */
export type Score = number;

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
export type DuplicationMode = 'legacy' | 'strict';


// ==================== ENUMS ====================


export enum Severity {
  Critical = 'critical',
  High = 'high',
  Medium = 'medium',
  Low = 'low'
}

// ==================== CORE INTERFACES ====================

/**
 * Root structure returned by analysis
 * No recommendations - 100% calculable client-side
 */
export interface AnalysisResult {
  context: Context;
  overview: Overview;
  details: FileDetail[];
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
  grade: Grade;
  
  statistics: {
    totalFiles: number;
    totalLOC: number;
    avgComplexity: number;
    avgLOC: number;
    avgDuplicationRatio?: Ratio; // Average duplication ratio (0-1) - consistent with FileDetail
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
  
  issues: FileIssue[];              // Issues niveau fichier SEULEMENT
  functions?: FunctionAnalysis[];    // REMPLACE functionIssues
  
  healthScore: Score;   // 0-100 (100 = perfect)
}

/**
 * Base issue types that apply to both files and functions
 */
export type BaseIssueType = 
  | 'complexity' 
  | 'duplication' 
  | 'size';

/**
 * Pattern types specific to functions only
 */
export type FunctionPatternType = 
  | QualityPattern
  | ArchitecturePattern  
  | PerformancePattern
  | SecurityPattern
  | TestingPattern;

/**
 * File-level issue types (only base metrics)
 */
export type FileIssueType = BaseIssueType;

/**
 * Function-level issue types (base metrics + patterns)
 */
export type FunctionIssueType = FunctionPatternType;

/**
 * All possible issue types in the unified architecture
 */
export type IssueType = FileIssueType | FunctionIssueType;

/**
 * File-level issue for base metrics (complexity, duplication, size) at file scope
 */
export interface FileIssue {
  type: FileIssueType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    file: string;
    line: number;
    column?: number;
    endLine?: number;
  };
  description: string;
  threshold?: number; // For metric-based issues
  excessRatio?: number; // How much over threshold - used for ROI sorting
}

/**
 * Function-level issue for base metrics + patterns within specific functions
 */
export interface FunctionIssue {
  type: FunctionIssueType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    file: string;
    line: number;
    column?: number;
    endLine?: number;
    function: string; // Required for function-level issues
  };
  description: string;
  threshold?: number; // For metric-based issues (complexity, size thresholds)
  excessRatio?: number; // How much over threshold - used for ROI sorting
}

/**
 * Detailed analysis of a single function
 */
export interface FunctionAnalysis {
  name: string;
  line: number;
  endLine?: number;
  complexity: number;
  loc: number;
  parameterCount: number;
  issues: FunctionIssue[];  // Les issues de cette fonction
  snippet?: string;         // Code snippet pour fonctions critiques
}

/**
 * Unified issue interface for both file-level and function-level issues
 * Maintains backward compatibility while supporting the new separation
 */
export interface FunctionQualityIssue {
  type: IssueType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: {
    file: string;
    line: number;
    column?: number;
    endLine?: number;
    function?: string; // Optional for backward compatibility
  };
  description: string;
  threshold?: number; // For metric-based issues
  excessRatio?: number; // How much over threshold - used for ROI sorting
}


export type QualityPattern = 
  | 'deep-nesting'
  | 'long-function' 
  | 'critical-complexity'
  | 'high-complexity'
  | 'medium-complexity'
  | 'too-many-params'
  | 'god-function'
  | 'multiple-responsibilities'
  | 'impure-function'
  | 'poorly-named';

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

// ==================== CLI & CONFIGURATION ====================

/**
 * Analysis options for the analyzer
 */
export interface AnalysisOptions {
  format: 'json' | 'ci' | 'critical' | 'summary' | 'markdown' | 'terminal';
  projectPath: string;
  // thresholds removed - using global configurations from scoring.utils.ts instead
  production?: boolean;
  strictDuplication?: boolean;
}

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
  production?: boolean;
  format?: 'json' | 'ci' | 'critical' | 'summary' | 'markdown' | 'terminal';
  strictDuplication?: boolean;
}

/**
 * Configuration thresholds for issue detection
 */
// ThresholdConfig removed - using table-driven configurations from scoring.utils.ts instead

// ==================== OUTPUT FORMATS ====================

/**
 * CI format output
 */
export interface CiFormat {
  passed: boolean;
  grade: Grade;
  score: Score;
  issues: number;
  critical: number;
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
  avgDuplication: Ratio; // Average duplication ratio (0-1) - consistent with FileDetail
  gradeDistribution: Record<string, number>;
  modeCategory: 'production' | 'full';
}