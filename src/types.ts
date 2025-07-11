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
  file: string;  // Relative path
  
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

// ==================== RECOMMENDATIONS REMOVED ====================
// Recommendations removed in v0.6.0 - calculable client-side:
// - criticalFiles = details.sort(healthScore).slice(0,5) 
// - quickWins = details.flatMap(issues).filter(effortHours <= 1)


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


// ==================== DEPRECATED INTERFACES ====================

// FileMetrics interface removed in v0.6.0 - use FileDetail instead


// ==================== CLI & CONFIGURATION ====================

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
  excludeUtility?: boolean;
  withContext?: boolean;
  format?: 'json' | 'ci' | 'critical' | 'summary' | 'report';
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
  outgoingDependencies: number; // Dépendances sortantes (efferent coupling)
  incomingDependencies: number; // Dépendances entrantes (afferent coupling / impact)
  cohesionScore: number; // Cohésion (0 = faible, 1 = forte) score de cohésion basé sur la proximité des dépendances.
  instability: number;          // Instabilité (0 = stable, 1 = instable). I = outgoing / (incoming + outgoing) - Principe de Robert C. Martin
  percentileUsageRank: number;  // Rang d'utilisation (percentile 0-100)
  isInCycle: boolean;           // Indique si le fichier fait partie d'un cycle
}

/**
 * Le résultat complet de l'analyse, maintenant avec les métriques par fichier.
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