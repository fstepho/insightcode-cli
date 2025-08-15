// src/analyzer/quick-wins-analyzer.ts

import { 
  AnalysisResult, 
  FileDetail, 
  QuickWin, 
  QuickWinsAnalysis, 
  EffortLevel,
  QuickWinType,
  FunctionAnalysis,
  ArchitecturalCriticality,
  Score,
  FileIssue
} from '../types';
import { getQuickWinCategory } from '../quick-wins-utils';
import { calculateFileHealthScore, calculateFileCriticismScore } from '../scoring';
import { 
  COMPLEXITY_SCORING_THRESHOLDS,
  FILE_SIZE_THRESHOLDS,
  FILE_HEALTH_PENALTY_CONSTANTS,
  QUICK_WIN_THRESHOLDS
} from '../thresholds.constants';
import {
  QuickWinContext,
  FUNCTION_QUICK_WIN_RULES,
  FILE_QUICK_WIN_RULES,
  applyQuickWinRules
} from './quick-wins-rules';

export class QuickWinsAnalyzer {
  private quickWinId = 0;
  private context: QuickWinContext;
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
    // Créer le contexte avec toutes les méthodes utilitaires
    this.context = {
      calculateDynamicComplexityGain: this.calculateDynamicComplexityGain.bind(this),
      calculateNestingReductionGain: this.calculateNestingReductionGain.bind(this),
      calculateDynamicParameterGain: this.calculateDynamicParameterGain.bind(this),
      calculateDynamicSizeGain: this.calculateDynamicSizeGain.bind(this),
      calculateDynamicDuplicationGain: this.calculateDynamicDuplicationGain.bind(this),
      calculateDynamicFileComplexityGain: this.calculateDynamicFileComplexityGain.bind(this),
      estimateComplexityEffort: this.estimateComplexityEffort.bind(this),
      estimateFunctionSplitEffort: this.estimateFunctionSplitEffort.bind(this),
      estimateFileSplitEffort: this.estimateFileSplitEffort.bind(this),
      estimateDuplicationEffort: this.estimateDuplicationEffort.bind(this),
      estimateNestingEffort: this.estimateNestingEffort.bind(this),
      generateComplexitySuggestion: this.generateComplexitySuggestion.bind(this),
      generateParameterSuggestion: this.generateParameterSuggestion.bind(this),
      generateEarlyReturnSuggestion: this.generateEarlyReturnSuggestion.bind(this)
    };
  }

  /**
   * Analyse complète pour identifier les Quick Wins
   */
  analyzeQuickWins(details: FileDetail[]): QuickWinsAnalysis {
    const allQuickWins: QuickWin[] = [];

    // Analyser chaque fichier
    details.forEach(file => {
      // Quick wins au niveau fichier - Utiliser le système de règles
      const fileWins = this.analyzeFileQuickWins(file);
      allQuickWins.push(...fileWins);

      // Quick wins au niveau fonction - Utiliser le système de règles
      if (file.functions) {
        const functionWins = this.analyzeFunctionQuickWins(file, file.functions);
        allQuickWins.push(...functionWins);
      }
    });

    // Calculer le ROI et trier
    const winsWithRoi = allQuickWins.map(win => ({
      ...win,
      roi: this.calculateROI(win)
    }));

    // Trier par ROI décroissant
    winsWithRoi.sort((a, b) => b.roi - a.roi);

   // Assigner les priorités et convertir les chemins en relatifs
    const prioritizedWins = this.assignPriorities(winsWithRoi).map(win => ({
      ...win,
      file: this.makePathRelative(win.file) // AJOUT : Convertir en chemin relatif
    }));

    // Grouper par priorité (utiliser des IDs)
    const byPriority = {
      high: prioritizedWins.filter(w => w.priority === 1).map(w => w.id),
      medium: prioritizedWins.filter(w => w.priority === 2).map(w => w.id),
      low: prioritizedWins.filter(w => w.priority === 3).map(w => w.id)
    };

    // Grouper par valeur stratégique (utiliser des IDs)
    const byStrategicValue = this.groupByStrategicValue(prioritizedWins);

    const problemPatterns = this.analyzeProblemPatterns(prioritizedWins);

    // Calculer le résumé
    const summary = this.calculateSummary(prioritizedWins);

    return {
      totalPotentialGain: prioritizedWins.reduce((sum, w) => sum + w.scoreGain, 0),
      quickWins: prioritizedWins,
      byPriority,
      byStrategicValue,
      problemPatterns,
      summary
    };
  }

  /**
   * Analyser les quick wins au niveau fichier en utilisant les règles
   */
  private analyzeFileQuickWins(file: FileDetail): QuickWin[] {
    // Appliquer les règles pour les issues du fichier
    const quickWinDrafts = applyQuickWinRules(
      FILE_QUICK_WIN_RULES,
      file,
      file,
      file.issues,
      this.context
    );

    // Convertir en QuickWins complets avec accès aux données du fichier
    return quickWinDrafts.map(draft => this.createQuickWin(draft, file));
  }

  /**
   * Analyser les quick wins au niveau fonction en utilisant les règles
   */
  private analyzeFunctionQuickWins(file: FileDetail, functions: FunctionAnalysis[]): QuickWin[] {
    const wins: QuickWin[] = [];

    functions.forEach(func => {
      // Appliquer les règles pour les issues de la fonction
      const quickWinDrafts = applyQuickWinRules(
        FUNCTION_QUICK_WIN_RULES,
        file,
        func,
        func.issues,
        this.context
      );

      // Convertir en QuickWins complets avec accès aux données du fichier
      const functionWins = quickWinDrafts.map(draft => this.createQuickWin(draft, file));
      wins.push(...functionWins);
    });

    return wins;
  }

  /**
   * Calculer le ROI d'un Quick Win
   * 
   * ROI Definition: Return on Investment for code quality improvements
   * Formula: ROI = Health Score Points / Implementation Hours
   * Unit: Health Points per Hour (HPH)
   * 
   * Examples (realistic after effort modulation):
   * - ROI 12: Simple nesting fix (5 levels) = 6 points in 30 min = 12 HPH
   * - ROI 2.5: Complex refactoring (15+ levels) = 10 points in 4 hours = 2.5 HPH
   * 
   * Effort Factors:
   * - Complexity depth: Higher nesting/complexity = more effort
   * - Architectural criticality: Hub files require more testing = more effort  
   * - Function length: Longer functions harder to understand = more effort
   * 
   * Uncertainty bounds (not displayed but inherent):
   * - Trivial tasks: ±25% uncertainty
   * - Complex tasks: ±55% uncertainty
   */
  private calculateROI(win: QuickWin): number {
    const effortFactors = QUICK_WIN_THRESHOLDS.EFFORT_HOURS;
    const effortHours = effortFactors[win.effortEstimate];
    
    // ROI = Health Points per Hour (HPH)
    const roi = win.scoreGain / effortHours;
    
    // Round to 1 decimal place for readability
    return Math.round(roi * 10) / 10;
  }

  /**
   * Assigner les priorités basées sur le ROI
   */
  private assignPriorities(wins: QuickWin[]): QuickWin[] {
    return wins.map((win) => ({
      ...win,
      priority: win.roi > QUICK_WIN_THRESHOLDS.ROI_HIGH_PRIORITY ? 1 : 
                win.roi > QUICK_WIN_THRESHOLDS.ROI_MEDIUM_PRIORITY ? 2 : 3
    }));
  }

  /**
   * Calculer le gain de réduction de taille
   */
  private calculateSizeReductionGain(file: FileDetail): number {
    const currentScore = file.healthScore;
    const estimatedNewSize = FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXCELLENT_THRESHOLD;
    
    // Simuler le nouveau score avec la taille réduite
    const newMetrics = {
      ...file.metrics,
      loc: estimatedNewSize
    };
    
    const newScore = this.simulateHealthScore(file, { metrics: newMetrics });
    return Math.max(0, newScore - currentScore);
  }

  /**
   * Calculer le gain de réduction de duplication
   */
  private calculateDuplicationReductionGain(file: FileDetail): number {
    const currentScore = file.healthScore;
    const targetDuplication = 0.05; // 5%
    
    const newMetrics = {
      ...file.metrics,
      duplicationRatio: targetDuplication
    };
    
    const newScore = this.simulateHealthScore(file, { metrics: newMetrics });
    return Math.max(0, newScore - currentScore);
  }

  /**
   * Calculer le gain de réduction de complexité
   */
  private calculateComplexityReductionGain(file: FileDetail): number {
    const currentScore = file.healthScore;
    const targetComplexity = 50;
    
    const newMetrics = {
      ...file.metrics,
      complexity: targetComplexity  // 'complexity' est le nom correct dans FileDetail
    };
    
    const newScore = this.simulateHealthScore(file, { metrics: newMetrics });
    return Math.max(0, newScore - currentScore);
  }

  /**
   * Calculer le gain pour une fonction
   */
  private calculateFunctionComplexityGain(func: FunctionAnalysis, file: FileDetail): number {
    // Impact estimé sur le score du fichier
    const complexityReduction = func.complexity - COMPLEXITY_SCORING_THRESHOLDS.EXCELLENT;
    const fileComplexityImpact = complexityReduction / file.metrics.complexity;
    
    // Gain estimé (proportionnel à l'impact sur le fichier)
    return Math.round(fileComplexityImpact * QUICK_WIN_THRESHOLDS.MAX_GAIN_PER_FUNCTION);
  }

  /**
   * Calculer le gain de réduction de paramètres
   */
  private calculateParameterReductionGain(func: FunctionAnalysis, file: FileDetail): number {
    // Gain modeste pour la lisibilité
    return Math.min(5, func.parameterCount - QUICK_WIN_THRESHOLDS.FUNCTION_PARAMS_TARGET);
  }

  /**
   * Calculer le gain dynamique basé sur l'excessRatio
   */
  private calculateDynamicComplexityGain(func: FunctionAnalysis, file: FileDetail, excessRatio: number): number {
    // Plus l'excès est important, plus le gain est élevé
    const baseGain = 5;
    const excessMultiplier = Math.min(3, excessRatio); // Cap à 3x
    const gain = Math.round(baseGain * excessMultiplier);
    
    // Limiter au gain maximum par fonction
    return Math.min(QUICK_WIN_THRESHOLDS.MAX_GAIN_PER_FUNCTION, gain);
  }

  /**
   * Calculer le gain de réduction de nesting
   */
  private calculateNestingReductionGain(currentDepth: number): number {
    // Plus le nesting est profond, plus le gain est important
    const depthOverTarget = currentDepth - QUICK_WIN_THRESHOLDS.TARGET_NESTING_DEPTH;
    return Math.min(10, QUICK_WIN_THRESHOLDS.BASE_READABILITY_GAIN + depthOverTarget);
  }

  /**
   * Calculer le gain dynamique pour les paramètres
   */
  private calculateDynamicParameterGain(paramCount: number, excessRatio: number): number {
    // Base gain + bonus pour l'excès
    const baseGain = 2;
    const excessBonus = Math.round((excessRatio - 1) * 3);
    return Math.min(8, baseGain + excessBonus);
  }

  /**
   * Estimer l'effort pour diviser un fichier
   */
  private estimateFileSplitEffort(lineCount: number): EffortLevel {
    if (lineCount < FILE_SIZE_THRESHOLDS.LARGE) return 'moderate' as EffortLevel;
    if (lineCount < FILE_SIZE_THRESHOLDS.VERY_LARGE) return 'hard' as EffortLevel;
    return 'complex' as EffortLevel;
  }

  /**
   * Estimer l'effort pour réduire la duplication
   */
  private estimateDuplicationEffort(ratio: number): EffortLevel {
    if (ratio < QUICK_WIN_THRESHOLDS.EFFORT_DUPLICATION_EASY) return 'easy' as EffortLevel;
    if (ratio < QUICK_WIN_THRESHOLDS.EFFORT_DUPLICATION_MODERATE) return 'moderate' as EffortLevel;
    return 'hard' as EffortLevel;
  }

  /**
   * Estimer l'effort pour réduire la complexité avec facteurs modulatoires
   */
  private estimateComplexityEffort(complexity: number, criticalityScore?: number, functionLoc?: number): EffortLevel {
    // Base effort estimation
    let baseEffort: EffortLevel;
    if (complexity < QUICK_WIN_THRESHOLDS.EFFORT_COMPLEXITY_EASY) baseEffort = 'easy';
    else if (complexity < QUICK_WIN_THRESHOLDS.EFFORT_COMPLEXITY_MODERATE) baseEffort = 'moderate';
    else if (complexity < QUICK_WIN_THRESHOLDS.EFFORT_COMPLEXITY_HARD) baseEffort = 'hard';
    else baseEffort = 'complex';

    return this.modulateEffortByFactors(baseEffort, complexity, criticalityScore, functionLoc);
  }

  /**
   * Estimer l'effort pour diviser une fonction avec facteurs modulatoires
   */
  private estimateFunctionSplitEffort(loc: number, criticalityScore?: number, functionComplexity?: number): EffortLevel {
    // Base effort estimation
    let baseEffort: EffortLevel;
    if (loc < QUICK_WIN_THRESHOLDS.EFFORT_FUNCTION_LOC_EASY) baseEffort = 'easy';
    else if (loc < QUICK_WIN_THRESHOLDS.EFFORT_FUNCTION_LOC_MODERATE) baseEffort = 'moderate';
    else baseEffort = 'hard';

    return this.modulateEffortByFactors(baseEffort, functionComplexity || 10, criticalityScore, loc);
  }

  /**
   * Estimer l'effort pour réduire le nesting basé sur la profondeur
   * Plus le nesting est profond, plus l'effort est important
   * Aligné avec les catégories du mapping unifié QUICKWIN_TO_PATTERN_MAPPING
   */
  private estimateNestingEffort(depth: number): EffortLevel {
    // Gérer les cas limites
    const safeDepth = Math.max(0, Math.round(depth || 0));
    
    // Effort aligné avec les catégories de nesting et les constantes centralisées
    if (safeDepth <= QUICK_WIN_THRESHOLDS.NESTING_MINIMAL_MAX) return 'trivial';  // Nesting minimal (1-2)
    if (safeDepth <= QUICK_WIN_THRESHOLDS.NESTING_LIGHT_MAX) return 'easy';       // Nesting léger (3-4)
    if (safeDepth <= QUICK_WIN_THRESHOLDS.NESTING_MODERATE_MAX) return 'moderate'; // Nesting modéré (5-7)
    if (safeDepth <= QUICK_WIN_THRESHOLDS.NESTING_DEEP_MAX) return 'hard';        // Nesting profond (8-12)
    return 'complex';                                                              // Nesting extrême (13+)
  }

  /**
   * Moduler l'effort basé sur les facteurs de complexité, criticité et taille
   * 
   * Facteurs d'ajustement:
   * - Complexité: Plus profonde = plus d'effort (15 niveaux > 5 niveaux)
   * - Criticité: Hub files = plus de risque = plus d'effort de test
   * - Taille: Fonctions longues = plus difficiles à comprendre avant refactoring
   */
  private modulateEffortByFactors(
    baseEffort: EffortLevel, 
    complexity: number, 
    criticalityScore?: number, 
    functionLoc?: number
  ): EffortLevel {
    const effortLevels: EffortLevel[] = ['trivial', 'easy', 'moderate', 'hard', 'complex'];
    let currentEffortIndex = effortLevels.indexOf(baseEffort);
    
    // Facteur de complexité: Plus c'est complexe, plus l'effort augmente
    const complexityMultiplier = this.calculateComplexityMultiplier(complexity);
    
    // Facteur de criticité: Hub files nécessitent plus de tests
    const criticalityMultiplier = this.calculateCriticalityMultiplier(criticalityScore || 1);
    
    // Facteur de taille: Fonctions longues sont plus difficiles à analyser
    const lengthMultiplier = this.calculateLengthMultiplier(functionLoc || 50);
    
    // Calculer l'ajustement total (moyenne pondérée)
    const totalMultiplier = (complexityMultiplier * 0.5) + (criticalityMultiplier * 0.3) + (lengthMultiplier * 0.2);
    
    // Ajuster l'index d'effort
    const adjustmentSteps = Math.round((totalMultiplier - 1) * 2); // Conversion en steps discrets
    const newEffortIndex = Math.max(0, Math.min(effortLevels.length - 1, currentEffortIndex + adjustmentSteps));
    
    return effortLevels[newEffortIndex];
  }

  /**
   * Calculer le multiplicateur basé sur la profondeur de complexité
   * Plus la complexité est élevée, plus l'effort nécessaire augmente
   */
  private calculateComplexityMultiplier(complexity: number): number {
    if (complexity <= 5) return 0.8;   // Complexité faible = effort réduit
    if (complexity <= 10) return 1.0;  // Complexité normale = effort standard
    if (complexity <= 15) return 1.2;  // Complexité élevée = +20% effort
    if (complexity <= 25) return 1.5;  // Très complexe = +50% effort
    return 2.0; // Extrêmement complexe (15+ niveaux) = +100% effort
  }

  /**
   * Calculer le multiplicateur basé sur la criticité architecturale
   * Hub files nécessitent plus de tests de non-régression
   */
  private calculateCriticalityMultiplier(criticalityScore: number): number {
    if (criticalityScore <= 5) return 0.9;   // Fichier isolé = effort réduit
    if (criticalityScore <= 10) return 1.0;  // Criticité normale = effort standard
    if (criticalityScore <= 20) return 1.1;  // Criticité élevée = +10% effort
    if (criticalityScore <= 50) return 1.3;  // Hub important = +30% effort
    return 1.6; // Hub critique = +60% effort (beaucoup de dépendances)
  }

  /**
   * Calculer le multiplicateur basé sur la longueur de fonction
   * Fonctions longues sont plus difficiles à comprendre avant refactoring
   */
  private calculateLengthMultiplier(functionLoc: number): number {
    if (functionLoc <= 20) return 0.9;   // Fonction courte = effort réduit
    if (functionLoc <= 50) return 1.0;   // Taille normale = effort standard
    if (functionLoc <= 100) return 1.1;  // Fonction longue = +10% effort
    if (functionLoc <= 200) return 1.3;  // Très longue = +30% effort
    return 1.5; // Fonction massive = +50% effort
  }

  private createQuickWin(partial: {
    type: QuickWinType;
    file: string;
    function?: string;
    line: number;
    endLine?: number;
    action: string;
    currentValue: number;
    targetValue: number;
    scoreGain: number;
    effortEstimate: EffortLevel;
    issueIds: string[];
    dependencies?: string[];
    suggestion?: QuickWin['suggestion'];
  }, fileDetail?: FileDetail): QuickWin {
    // Réutiliser les données existantes du fichier ou valeurs par défaut
    const criticalityScore = fileDetail ? this.getCriticalityScore(fileDetail) : 1;
    const criticality = this.mapCriticalityScore(criticalityScore);
    
    // Appliquer la modulation d'effort basée sur la complexité, criticité et taille
    let modulatedEffort = partial.effortEstimate;
    if (fileDetail) {
      // Trouver les détails de la fonction si applicable
      const funcDetail = partial.function && fileDetail.functions 
        ? fileDetail.functions.find(f => f.name === partial.function)
        : undefined;
      
      // Moduler l'effort basé sur les facteurs réalistes
      modulatedEffort = this.modulateEffortByFactors(
        partial.effortEstimate,
        partial.currentValue, // La complexité/taille actuelle
        criticalityScore,
        funcDetail?.loc
      );
    }
    
    return {
      ...partial,
      id: `qw-${++this.quickWinId}`,
      priority: 1 as 1 | 2 | 3, // Sera recalculé
      roi: 0, // Sera calculé
      criticality,
      criticalityScore,
      strategicPriority: 'standard', // Sera recalculé
      effortEstimate: modulatedEffort // Utiliser l'effort modulé
    };
  }

  /**
   * Réutiliser le calcul de CriticismScore existant
   */
  private getCriticalityScore(fileDetail: FileDetail): number {
    return calculateFileCriticismScore(fileDetail);
  }

  /**
   * Mapper le score numérique vers une catégorie de criticité
   */
  private mapCriticalityScore(score: number): ArchitecturalCriticality {
    if (score > 50) return 'core';       // Hub critique avec beaucoup de dépendances
    if (score > 20) return 'feature';    // Fichier de fonctionnalité importante  
    if (score > 10) return 'api';        // Interface ou API
    if (score > 5) return 'config';      // Configuration
    return 'isolated';                   // Fichier isolé ou test
  }

  /**
   * Grouper les Quick Wins par valeur stratégique (ROI + criticité)
   */
  private groupByStrategicValue(wins: QuickWin[]): QuickWinsAnalysis['byStrategicValue'] {
    const strategic: string[] = [];
    const standard: string[] = [];
    const maintenance: string[] = [];

    wins.forEach(win => {
      // Calculer la priorité stratégique avec une logique plus inclusive
      const isHighROI = win.roi > QUICK_WIN_THRESHOLDS.ROI_HIGH_PRIORITY;
      const isMediumROI = win.roi > QUICK_WIN_THRESHOLDS.ROI_MEDIUM_PRIORITY;
      const isHighCriticality = win.criticality === 'core' || win.criticality === 'api';
      const isMediumCriticality = win.criticality === 'feature';

      // Strategic: High ROI + High criticality, OU High ROI + Medium criticality avec gain élevé
      if ((isHighROI && isHighCriticality) || (isHighROI && isMediumCriticality && win.scoreGain >= 10)) {
        win.strategicPriority = 'strategic';
        strategic.push(win.id);
      }
      // Standard: High ROI (même avec faible criticité), OU Medium ROI + High/Medium criticality  
      else if (isHighROI || (isMediumROI && (isHighCriticality || isMediumCriticality))) {
        win.strategicPriority = 'standard'; 
        standard.push(win.id);
      }
      // Maintenance: le reste
      else {
        win.strategicPriority = 'low';
        maintenance.push(win.id);
      }
    });

    return { strategic, standard, maintenance };
  }

  /**
   * Simuler le health score avec des métriques modifiées
   */
  private simulateHealthScore(file: FileDetail, changes: Partial<FileDetail>): Score {
    const simulatedFile = { ...file, ...changes };
    
    // Utiliser directement calculateFileHealthScore avec le bon format
    return calculateFileHealthScore({
      metrics: simulatedFile.metrics,
      issues: simulatedFile.issues
    }, 'legacy'); // Mode par défaut
  }

  /**
   * Calculer le résumé des Quick Wins
   */
  private calculateSummary(wins: QuickWin[]): QuickWinsAnalysis['summary'] {
    const immediateWins = wins.filter(w => 
      w.effortEstimate === 'trivial' || w.effortEstimate === 'easy'
    );

    const estimatedHours = wins.reduce(
      (sum, w) => sum + QUICK_WIN_THRESHOLDS.EFFORT_HOURS[w.effortEstimate], 
      0
    );

    // Top files avec le plus de wins
    const fileWinCounts = new Map<string, number>();
    wins.forEach(w => {
      fileWinCounts.set(w.file, (fileWinCounts.get(w.file) || 0) + 1);
    });
    
    const topFiles = Array.from(fileWinCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([file]) => file);

    return {
      totalWins: wins.length,
      immediateWins: immediateWins.length,
      estimatedHours,
      topFiles
    };
  }

  /**
   * Calculer le gain dynamique pour la taille du fichier
   */
  private calculateDynamicSizeGain(file: FileDetail, excessRatio: number): number {
    // Simuler avec la nouvelle taille
    const targetSize = FILE_HEALTH_PENALTY_CONSTANTS.SIZE.EXCELLENT_THRESHOLD;
    const newMetrics = { ...file.metrics, loc: targetSize };
    const newScore = this.simulateHealthScore(file, { metrics: newMetrics });
    
    // Bonus pour les fichiers très gros
    const sizeBonus = excessRatio > 3 ? 5 : 0;
    
    return Math.max(0, newScore - file.healthScore + sizeBonus);
  }

  /**
   * Calculer le gain dynamique pour la duplication
   */
  private calculateDynamicDuplicationGain(file: FileDetail, excessRatio: number): number {
    // Plus l'excès est grand, plus le gain est important
    const baseGain = this.calculateDuplicationReductionGain(file);
    const excessBonus = Math.round((excessRatio - 1) * 5);
    
    return Math.min(30, baseGain + excessBonus); // Cap à 30 points
  }

  /**
   * Calculer le gain dynamique pour la complexité du fichier
   */
  private calculateDynamicFileComplexityGain(file: FileDetail, excessRatio: number): number {
    const baseGain = this.calculateComplexityReductionGain(file);
    
    // Bonus significatif pour les fichiers très complexes
    const complexityBonus = excessRatio > 2 ? Math.round((excessRatio - 1) * 10) : 0;
    
    return Math.min(40, baseGain + complexityBonus); // Cap à 40 points
  }

  /**
   * Générer des suggestions de code
   */
  private generateComplexitySuggestion(func: FunctionAnalysis): QuickWin['suggestion'] | undefined {
    if (!func.snippet) return undefined;

    return {
      before: func.snippet,
      after: `// Extract complex conditions into named functions
function ${func.name}() {
  // Early return for edge cases
  if (!isValid()) return null;
  
  // Extract complex logic
  const result = processMainLogic();
  
  // Handle special cases
  return handleSpecialCases(result);
}

function isValid() { /* ... */ }
function processMainLogic() { /* ... */ }
function handleSpecialCases(result) { /* ... */ }`,
      explanation: 'Breaking down complex functions improves readability and testability'
    };
  }

  private generateParameterSuggestion(func: FunctionAnalysis): QuickWin['suggestion'] | undefined {
    return {
      before: `function ${func.name}(param1, param2, param3, param4, param5, param6) { }`,
      after: `interface ${func.name}Options {
  param1: string;
  param2: number;
  param3?: boolean;
  // ... other params
}

function ${func.name}(options: ${func.name}Options) {
  const { param1, param2, param3 = true } = options;
  // ...
}`,
      explanation: 'Object parameters are easier to use and maintain'
    };
  }

  private generateEarlyReturnSuggestion(func: FunctionAnalysis): QuickWin['suggestion'] | undefined {
    return {
      before: `function ${func.name}() {
  if (condition1) {
    if (condition2) {
      if (condition3) {
        // nested logic
      }
    }
  }
}`,
      after: `function ${func.name}() {
  if (!condition1) return;
  if (!condition2) return;
  if (!condition3) return;
  
  // main logic without nesting
}`,
      explanation: 'Early returns reduce cognitive complexity'
    };
  }

  /**
   * AJOUT : Convertir un chemin absolu en chemin relatif
   */
  private makePathRelative(absolutePath: string): string {
    const path = require('path');
    
    try {
      // Si le chemin est déjà relatif, le retourner tel quel
      if (!path.isAbsolute(absolutePath)) {
        return absolutePath;
      }
      
      // Calculer le chemin relatif par rapport au projet
      const relativePath = path.relative(this.projectPath, absolutePath);
      
      // Si le chemin relatif commence par '../', utiliser juste le nom de fichier
      if (relativePath.startsWith('../')) {
        return path.basename(absolutePath);
      }
      
      // Normaliser les séparateurs pour la portabilité (toujours utiliser '/')
      return relativePath.replace(/\\/g, '/');
      
    } catch (error) {
      // En cas d'erreur, retourner juste le nom de fichier
      return require('path').basename(absolutePath);
    }
  }


  /**
   * NOUVEAU : Analyser les patterns de problèmes pour l'insight stratégique
   */
  private analyzeProblemPatterns(wins: QuickWin[]): QuickWinsAnalysis['problemPatterns'] {
    const patterns = new Map<string, {
      category: string;
      wins: QuickWin[];
      totalGain: number;
      averageEffort: number;
      description: string;
      strategicImplications: string;
      thresholdRanges: { min: number; max: number }[];
    }>();

    // Catégoriser chaque quick win par type de problème
    wins.forEach(win => {
      const category = getQuickWinCategory(win);
      if (!patterns.has(category.key)) {
        patterns.set(category.key, {
          category: category.name,
          wins: [],
          totalGain: 0,
          averageEffort: 0,
          description: category.description,
          strategicImplications: '', // Will be computed after all wins are collected
          thresholdRanges: []
        });
      }
      
      const pattern = patterns.get(category.key)!;
      pattern.wins.push(win);
      pattern.totalGain += win.scoreGain;
      
      // Track threshold ranges
      if (!pattern.thresholdRanges.find(r => r.min === win.currentValue)) {
        pattern.thresholdRanges.push({ min: win.currentValue, max: win.currentValue });
      }
    });

    // Calculer les statistiques pour chaque pattern
    const problemPatternsArray = Array.from(patterns.entries()).map(([key, pattern]) => {
      const effortValues = pattern.wins.map(w => this.getEffortNumericValue(w.effortEstimate));
      pattern.averageEffort = effortValues.reduce((a, b) => a + b, 0) / effortValues.length;
      
      // Consolidate threshold ranges
      if (pattern.thresholdRanges.length > 0) {
        const minThreshold = Math.min(...pattern.wins.map(w => w.targetValue));
        const maxThreshold = Math.max(...pattern.wins.map(w => w.currentValue));
        
        // Add threshold info to description if meaningful
        if (minThreshold !== maxThreshold) {
          pattern.description = `${pattern.description} (thresholds: ${minThreshold}-${maxThreshold})`;
        }
      }
      
      // Générer des insights stratégiques basés sur l'analyse des fichiers
      pattern.strategicImplications = this.generateStrategicInsights(key, pattern.wins);
      
      return pattern;
    });

    // Trier par impact (nombre de wins * gain total)
    problemPatternsArray.sort((a, b) => (b.wins.length * b.totalGain) - (a.wins.length * a.totalGain));

    const totalWins = wins.length;
    
    return problemPatternsArray.map(pattern => ({
      category: pattern.category,
      count: pattern.wins.length,
      percentage: Math.round((pattern.wins.length / totalWins) * 100),
      totalGain: pattern.totalGain,
      averageGain: Math.round(pattern.totalGain / pattern.wins.length),
      averageEffort: pattern.averageEffort,
      description: pattern.description,
      strategicImplications: pattern.strategicImplications,
      topFiles: this.getTopFilesForPattern(pattern.wins)
    }));
  }


  /**
   * NOUVEAU : Obtenir la valeur numérique de l'effort pour les calculs
   */
  private getEffortNumericValue(effort: EffortLevel): number {
    const effortValues = {
      'trivial': 1,
      'easy': 2,
      'moderate': 3,
      'hard': 4,
      'complex': 5
    };
    return effortValues[effort] || 3;
  }

  /**
   * NOUVEAU : Obtenir les fichiers les plus problématiques pour un pattern
   */
  private getTopFilesForPattern(wins: QuickWin[]): string[] {
    const fileWinCounts = new Map<string, number>();
    wins.forEach(win => {
      fileWinCounts.set(win.file, (fileWinCounts.get(win.file) || 0) + 1);
    });
    
    return Array.from(fileWinCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([file]) => file);
  }

  /**
   * Générer des insights stratégiques spécifiques basés sur l'analyse des fichiers
   */
  private generateStrategicInsights(patternKey: string, wins: QuickWin[]): string {
    const files = wins.map(w => w.file);
    const uniqueFiles = Array.from(new Set(files));
    
    // Analyser les types de fichiers affectés
    const fileTypeAnalysis = this.analyzeFileTypes(uniqueFiles);
    const functionAnalysis = this.analyzeFunctionNames(wins);
    
    switch (patternKey) {
      case 'nesting': {
        if (fileTypeAnalysis.dominantTypes.length > 0) {
          const types = fileTypeAnalysis.dominantTypes.join(', ');
          const percentage = Math.round((fileTypeAnalysis.affectedCount / uniqueFiles.length) * 100);
          return `Deep nesting is concentrated in ${types} files (${percentage}% of affected files). ${functionAnalysis.insight || 'This suggests control flow complexity in your business logic.'}`;
        }
        return 'Deep nesting across various file types indicates a need for control flow simplification patterns.';
      }
      
      case 'srp-violations': {
        if (fileTypeAnalysis.dominantTypes.length > 0) {
          const types = fileTypeAnalysis.dominantTypes.join(' and ');
          return `SRP violations are concentrated in ${types} files, indicating these modules are handling multiple concerns. ${functionAnalysis.insight || 'Consider splitting by domain boundaries.'}`;
        }
        return 'SRP violations across the codebase suggest architectural boundaries need clarification.';
      }
      
      case 'high-complexity': {
        if (fileTypeAnalysis.dominantTypes.length > 0) {
          const types = fileTypeAnalysis.dominantTypes.join(', ');
          return `High complexity is concentrated in ${types} files. ${functionAnalysis.insight || 'These areas likely contain core business logic that would benefit from decomposition.'}`;
        }
        return 'Complex functions distributed across the codebase indicate algorithmic challenges.';
      }
      
      case 'duplication': {
        const fileGroups = this.groupFilesByDirectory(uniqueFiles);
        if (fileGroups.topDirectories.length > 0) {
          const dirs = fileGroups.topDirectories.slice(0, 2).join(' and ');
          return `Duplication is concentrated in ${dirs} directories, suggesting missing shared abstractions or utilities in these areas.`;
        }
        return 'Code duplication patterns suggest opportunities for shared utilities or base classes.';
      }
      
      case 'api-design': {
        if (fileTypeAnalysis.hasServiceFiles || fileTypeAnalysis.hasApiFiles) {
          return `API design issues in ${fileTypeAnalysis.dominantTypes.join(', ')} suggest inconsistent interface patterns. Review parameter consistency and return type contracts.`;
        }
        return 'Function signature issues indicate a need for API design guidelines.';
      }
      
      default:
        return this.generateGenericInsight(fileTypeAnalysis, wins.length);
    }
  }
  
  /**
   * Analyser les types de fichiers pour identifier des patterns
   */
  private analyzeFileTypes(files: string[]): {
    dominantTypes: string[];
    affectedCount: number;
    hasServiceFiles: boolean;
    hasApiFiles: boolean;
  } {
    const typeCount = new Map<string, number>();
    let hasServiceFiles = false;
    let hasApiFiles = false;
    
    files.forEach(file => {
      const basename = require('path').basename(file).toLowerCase();
      
      // Identifier le type de fichier
      if (basename.includes('service') || basename.includes('svc')) {
        hasServiceFiles = true;
        typeCount.set('service', (typeCount.get('service') || 0) + 1);
      } else if (basename.includes('handler')) {
        typeCount.set('handler', (typeCount.get('handler') || 0) + 1);
      } else if (basename.includes('parser') || basename.includes('parse')) {
        typeCount.set('parser', (typeCount.get('parser') || 0) + 1);
      } else if (basename.includes('controller') || basename.includes('ctrl')) {
        typeCount.set('controller', (typeCount.get('controller') || 0) + 1);
      } else if (basename.includes('api') || basename.includes('endpoint')) {
        hasApiFiles = true;
        typeCount.set('api', (typeCount.get('api') || 0) + 1);
      } else if (basename.includes('util') || basename.includes('helper')) {
        typeCount.set('utility', (typeCount.get('utility') || 0) + 1);
      } else if (basename.includes('model') || basename.includes('entity')) {
        typeCount.set('model', (typeCount.get('model') || 0) + 1);
      } else if (basename.includes('repository') || basename.includes('repo')) {
        typeCount.set('repository', (typeCount.get('repository') || 0) + 1);
      } else if (basename.includes('validator') || basename.includes('validation')) {
        typeCount.set('validator', (typeCount.get('validator') || 0) + 1);
      } else if (basename.includes('analyzer')) {
        typeCount.set('analyzer', (typeCount.get('analyzer') || 0) + 1);
      } else if (basename.includes('builder')) {
        typeCount.set('builder', (typeCount.get('builder') || 0) + 1);
      } else if (basename.includes('reporter')) {
        typeCount.set('reporter', (typeCount.get('reporter') || 0) + 1);
      }
    });
    
    // Trouver les types dominants
    const sortedTypes = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count >= Math.ceil(files.length * 0.3)); // Au moins 30% des fichiers
    
    return {
      dominantTypes: sortedTypes.map(([type]) => type),
      affectedCount: sortedTypes.reduce((sum, [_, count]) => sum + count, 0),
      hasServiceFiles,
      hasApiFiles
    };
  }
  
  /**
   * Analyser les noms de fonctions pour des insights supplémentaires
   */
  private analyzeFunctionNames(wins: QuickWin[]): { insight: string | null } {
    const functionNames = wins
      .filter(w => w.function)
      .map(w => w.function!.toLowerCase());
    
    if (functionNames.length === 0) return { insight: null };
    
    // Patterns communs dans les noms de fonctions
    const hasHandlers = functionNames.filter(n => n.includes('handle') || n.includes('process')).length;
    const hasGetters = functionNames.filter(n => n.startsWith('get') || n.startsWith('fetch')).length;
    const hasValidators = functionNames.filter(n => n.includes('valid') || n.includes('check')).length;
    const hasTransformers = functionNames.filter(n => n.includes('transform') || n.includes('convert') || n.includes('map')).length;
    const hasAnalyzers = functionNames.filter(n => n.includes('analyze') || n.includes('detect')).length;
    
    if (hasHandlers > functionNames.length * 0.4) {
      return { insight: 'Many affected functions are handlers/processors, suggesting event-driven or pipeline architecture issues.' };
    }
    if (hasGetters > functionNames.length * 0.4) {
      return { insight: 'Many affected functions are data accessors, indicating potential data flow complexity.' };
    }
    if (hasValidators > functionNames.length * 0.4) {
      return { insight: 'Validation logic appears complex - consider a validation framework or schema-based approach.' };
    }
    if (hasTransformers > functionNames.length * 0.4) {
      return { insight: 'Data transformation logic is complex - consider using mapping libraries or clearer data contracts.' };
    }
    if (hasAnalyzers > functionNames.length * 0.4) {
      return { insight: 'Analysis functions show complexity - consider breaking down analysis steps or using visitor patterns.' };
    }
    
    return { insight: null };
  }
  
  /**
   * Grouper les fichiers par répertoire
   */
  private groupFilesByDirectory(files: string[]): { topDirectories: string[] } {
    const dirCount = new Map<string, number>();
    
    files.forEach(file => {
      const parts = file.split('/');
      if (parts.length > 1) {
        const dir = parts[parts.length - 2]; // Répertoire parent
        dirCount.set(dir, (dirCount.get(dir) || 0) + 1);
      }
    });
    
    const topDirs = Array.from(dirCount.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count >= 2) // Au moins 2 fichiers
      .map(([dir]) => dir);
    
    return { topDirectories: topDirs };
  }
  
  /**
   * Générer un insight générique mais contextuel
   */
  private generateGenericInsight(fileTypeAnalysis: ReturnType<typeof this.analyzeFileTypes>, winCount: number): string {
    if (fileTypeAnalysis.dominantTypes.length > 0) {
      const types = fileTypeAnalysis.dominantTypes.join(' and ');
      return `Issues concentrated in ${types} files (${winCount} occurrences) suggest these modules need focused refactoring.`;
    }
    return `${winCount} issues spread across various file types indicate systemic code quality concerns.`;
  }
}