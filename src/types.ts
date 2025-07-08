// File: src/types.ts

/**
 * Représente toutes les métriques et scores calculés pour un seul fichier.
 */
export interface FileMetrics {
  path: string;
  // Métriques brutes extraites par le parser
  complexity: number;
  duplication: number;
  functionCount: number; 
  loc: number; // Lignes de code
  fileType?: 'production' | 'test' | 'example' | 'utility' | 'config';
  // Données enrichies par l'analyseur
  issues: Issue[];
  impact: number;           // Nombre de fichiers qui dépendent de celui-ci.
  criticismScore: number;   // Score de criticité final du fichier (utilisé pour le poids).
  context?: CodeContext;
}

/**
 * Represents extracted context from a code file for LLM analysis
 * (imported from codeContextExtractor.ts)
 */
/**
 * Summary of code contexts for high-level insights
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
 * Représente un problème unique identifié dans un fichier.
 */
export interface Issue {
  type: 'complexity' | 'duplication' | 'size';
  severity: 'high' | 'medium' | 'low';
  message: string;
  value: number; // La valeur brute de la métrique (ex: complexité de 50)
  line?: number;
  ratio?: number; // Le rapport par rapport au seuil (ex: 2.5x au-dessus de la limite)
}

/**
 * L'objet complet retourné par une analyse, contenant tous les résultats.
 */
export interface AnalysisResult {
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
  score: number; // Identique à scores.overall, pour la compatibilité.
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  // Métriques d'analyse avancées
  complexityStdDev: number;     // Écart-type, pour détecter les monolithes.
  silentKillers: FileMetrics[]; // Fichiers à risque architectural.
  // Listes de fichiers
  files: FileMetrics[];
  topFiles: FileMetrics[];
  // Contexte de code optionnel pour analyse LLM
  codeContext?: {
    contexts: CodeContext[];
    summary: CodeContextSummary;
  };
}

export interface CliOptions {
  path: string;
  json?: boolean;
  exclude?: string[];
  excludeUtility?: boolean;
  withContext?: boolean;
}

/**
 * Définit les seuils (medium/high) pour la création d'Issues.
 * C'est la seule partie de la logique qui est configurable par l'utilisateur.
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
