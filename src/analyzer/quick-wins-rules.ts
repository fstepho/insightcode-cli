// src/analyzer/quick-wins-rules.ts

import {
  QuickWin,
  QuickWinType,
  FileDetail,
  FunctionAnalysis,
  FunctionIssue,
  FileIssue,
  EffortLevel,
  FunctionPatternType,
  IssueType
} from '../types';
import {
  COMPLEXITY_SCORING_THRESHOLDS,
  QUICK_WIN_THRESHOLDS,
  FILE_SIZE_THRESHOLDS,
} from '../thresholds.constants';
// import { calculateFileCriticismScore } from '../scoring'; // Not used in rules, used in analyzer

/**
 * Interface pour une règle de Quick Win
 */
export interface QuickWinRule<T extends FileIssue | FunctionIssue = FunctionIssue> {
  issueTypes: IssueType[];
  isApplicable?: (file: FileDetail, item: FileDetail | FunctionAnalysis, issue: T) => boolean;
  create: (file: FileDetail, item: FileDetail | FunctionAnalysis, issue: T, context: QuickWinContext) => Omit<QuickWin, 'id' | 'priority' | 'roi' | 'criticality' | 'criticalityScore' | 'strategicPriority'> | null;
}

/**
 * Contexte pour la création de Quick Wins
 */
export interface QuickWinContext {
  calculateDynamicComplexityGain: (func: FunctionAnalysis, file: FileDetail, excessRatio: number) => number;
  calculateNestingReductionGain: (currentDepth: number) => number;
  calculateDynamicParameterGain: (paramCount: number, excessRatio: number) => number;
  calculateDynamicSizeGain: (file: FileDetail, excessRatio: number) => number;
  calculateDynamicDuplicationGain: (file: FileDetail, excessRatio: number) => number;
  calculateDynamicFileComplexityGain: (file: FileDetail, excessRatio: number) => number;
  estimateComplexityEffort: (complexity: number) => EffortLevel;
  estimateFunctionSplitEffort: (loc: number) => EffortLevel;
  estimateFileSplitEffort: (loc: number) => EffortLevel;
  estimateDuplicationEffort: (ratio: number) => EffortLevel;
  estimateNestingEffort: (depth: number) => EffortLevel;
  generateComplexitySuggestion?: (func: FunctionAnalysis) => QuickWin['suggestion'];
  generateParameterSuggestion?: (func: FunctionAnalysis) => QuickWin['suggestion'];
  generateEarlyReturnSuggestion?: (func: FunctionAnalysis) => QuickWin['suggestion'];
}

/**
 * Règles pour les Quick Wins au niveau fonction
 */
export const FUNCTION_QUICK_WIN_RULES: QuickWinRule<FunctionIssue>[] = [
  // Règle pour la complexité élevée
  {
    issueTypes: ['critical-complexity', 'high-complexity', 'medium-complexity'],
    isApplicable: (file, func) => (func as FunctionAnalysis).complexity > COMPLEXITY_SCORING_THRESHOLDS.CRITICAL,
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      const excessRatio = issue.excessRatio || (funcAnalysis.complexity / COMPLEXITY_SCORING_THRESHOLDS.EXCELLENT);
      const potentialGain = context.calculateDynamicComplexityGain(funcAnalysis, file, excessRatio);
      
      if (potentialGain <= 0) return null;
      
      return {
        type: 'extract-function' as QuickWinType,
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        endLine: funcAnalysis.endLine,
        action: `Extract complex logic from ${funcAnalysis.name} (complexity: ${funcAnalysis.complexity})`,
        currentValue: funcAnalysis.complexity,
        targetValue: COMPLEXITY_SCORING_THRESHOLDS.EXCELLENT,
        scoreGain: potentialGain,
        effortEstimate: context.estimateComplexityEffort(funcAnalysis.complexity),
        issueIds: [`${funcAnalysis.name}-${issue.type}`],
        suggestion: context.generateComplexitySuggestion?.(funcAnalysis)
      };
    }
  },

  // Règle pour trop de paramètres
   {
    issueTypes: ['too-many-params'],
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      
      // CORRECTION : Utiliser actualValue si disponible
      const actualParamCount = issue.actualValue || funcAnalysis.parameterCount;
      const excessRatio = issue.excessRatio || (actualParamCount / QUICK_WIN_THRESHOLDS.FUNCTION_PARAMS_TARGET);
      const potentialGain = context.calculateDynamicParameterGain(actualParamCount, excessRatio);
      
      if (potentialGain <= 0) return null;
      
      return {
        type: 'reduce-parameters' as QuickWinType,
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        action: `Use object parameter pattern for ${funcAnalysis.name} (${actualParamCount} parameters)`,
        currentValue: actualParamCount,
        targetValue: QUICK_WIN_THRESHOLDS.FUNCTION_PARAMS_TARGET,
        scoreGain: potentialGain,
        effortEstimate: 'easy' as EffortLevel,
        issueIds: [`${funcAnalysis.name}-${issue.type}`],
        suggestion: context.generateParameterSuggestion?.(funcAnalysis)
      };
    }
  },

  // Règle pour deep nesting
  {
    issueTypes: ['deep-nesting'],
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      
      // CORRECTION : Utiliser actualValue en priorité
      const currentNesting = issue.actualValue || 
        (issue.threshold && issue.excessRatio ? Math.round(issue.threshold * issue.excessRatio) : 
         QUICK_WIN_THRESHOLDS.ASSUMED_NESTING_DEPTH);
      
      const gain = context.calculateNestingReductionGain(currentNesting);
      
      return {
        type: 'add-early-return' as QuickWinType,
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        action: `Reduce nesting in ${funcAnalysis.name} with early returns (current depth: ${currentNesting})`,
        currentValue: currentNesting,
        targetValue: QUICK_WIN_THRESHOLDS.TARGET_NESTING_DEPTH,
        scoreGain: gain,
        effortEstimate: context.estimateNestingEffort(currentNesting),
        issueIds: [`${funcAnalysis.name}-${issue.type}`],
        suggestion: context.generateEarlyReturnSuggestion?.(funcAnalysis)
      };
    }
  },


  // Règle pour fonction trop longue
  {
    issueTypes: ['long-function'],
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      const excessRatio = issue.excessRatio || 1.5;
      const potentialGain = Math.min(
        QUICK_WIN_THRESHOLDS.MAX_GAIN_PER_FUNCTION, 
        Math.round(5 * (excessRatio - 1))
      );
      
      return {
        type: 'extract-function' as QuickWinType,
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        endLine: funcAnalysis.endLine,
        action: `Break down ${funcAnalysis.name} (${funcAnalysis.loc} LOC) into smaller functions`,
        currentValue: funcAnalysis.loc,
        targetValue: QUICK_WIN_THRESHOLDS.FUNCTION_LOC_TARGET,
        scoreGain: potentialGain,
        effortEstimate: context.estimateFunctionSplitEffort(funcAnalysis.loc),
        issueIds: [`${funcAnalysis.name}-${issue.type}`]
      };
    }
  },

  // Règle pour God Function
  {
    issueTypes: ['god-function'],
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      
      // CORRECTION : Utiliser actualValue pour les opérations détectées
      const operationCount = issue.actualValue || 6; // fallback
      const potentialGain = QUICK_WIN_THRESHOLDS.GOD_FUNCTION_GAIN;
      
      return {
        type: 'extract-module' as QuickWinType,
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        endLine: funcAnalysis.endLine,
        action: `Refactor god function ${funcAnalysis.name} into separate modules (${operationCount} distinct operations)`,
        currentValue: operationCount,
        targetValue: 5,
        scoreGain: potentialGain,
        effortEstimate: 'complex' as EffortLevel,
        issueIds: [`${funcAnalysis.name}-${issue.type}`]
      };
    }
  },

  // Règle pour responsabilités multiples
   {
    issueTypes: ['multiple-responsibilities'],
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      
      // CORRECTION : Utiliser actualValue au lieu de threshold
      const actualResponsibilities = issue.actualValue || issue.threshold || 3;
      
      return {
        type: 'extract-function',
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        action: `Split ${funcAnalysis.name} into single-responsibility functions (${actualResponsibilities} responsibilities detected)`,
        currentValue: actualResponsibilities,
        targetValue: 1,
        scoreGain: QUICK_WIN_THRESHOLDS.SPLIT_RESPONSIBILITY_GAIN,
        effortEstimate: 'moderate' as EffortLevel,
        issueIds: [`${funcAnalysis.name}-${issue.type}`]
      };
    }
  },

  // Règle pour noms peu descriptifs
  {
    issueTypes: ['poorly-named'],
    create: (file, func, issue, context) => {
      const funcAnalysis = func as FunctionAnalysis;
      
      // Gain modeste mais important pour la lisibilité
      const potentialGain = 3; // Score fixe modeste pour le nommage
      
      return {
        type: 'improve-naming' as QuickWinType,
        file: file.absolutePath,
        function: funcAnalysis.name,
        line: funcAnalysis.line,
        endLine: funcAnalysis.endLine,
        action: `Rename '${funcAnalysis.name}' to use more descriptive name`,
        currentValue: funcAnalysis.name.length, // Longueur du nom actuel
        targetValue: 0, // Pas de valeur cible spécifique pour le nommage
        scoreGain: potentialGain,
        effortEstimate: 'trivial' as EffortLevel, // Renommer est facile
        issueIds: [`${funcAnalysis.name}-${issue.type}`]
      };
    }
  },
];
/**
 * Règles pour les Quick Wins au niveau fichier
 * Utilise les analyses existantes de FileDetailBuilder
 */
export const FILE_QUICK_WIN_RULES: QuickWinRule<FileIssue>[] = [
  // Règle pour fichier trop gros
  {
    issueTypes: ['large-file', 'very-large-file'], // Types d'issues de FileDetailBuilder
    create: (file, _, issue, context) => {
      // Utilise directement les valeurs de l'analyse existante
      const actualSize = issue.actualValue || file.metrics.loc;
      const threshold = issue.threshold || FILE_SIZE_THRESHOLDS.LARGE;
      const excessRatio = issue.excessRatio || (actualSize / threshold);
      const potentialGain = context.calculateDynamicSizeGain(file, excessRatio);
      
      if (potentialGain <= 0) return null;
      
      const severity = issue.severity || 'medium';
      const effortLevel = severity === 'critical' ? 'complex' : 'hard';
      
      return {
        type: 'split-file' as QuickWinType,
        file: file.absolutePath,
        line: 1,
        action: `Split this ${actualSize} LOC file into smaller modules (${severity} size issue)`,
        currentValue: actualSize,
        targetValue: threshold,
        scoreGain: potentialGain,
        effortEstimate: context.estimateFileSplitEffort(actualSize),
        issueIds: [issue.type]
      };
    }
  },

  // Règle pour duplication élevée
  {
    issueTypes: ['high-duplication'], // Type d'issue de FileDetailBuilder
    create: (file, _, issue, context) => {
      // Utilise les métriques calculées par FileDetailBuilder
      const actualRatio = issue.actualValue || file.metrics.duplicationRatio;
      const threshold = issue.threshold || QUICK_WIN_THRESHOLDS.FILE_DUPLICATION_RATIO;
      const excessRatio = issue.excessRatio || (actualRatio / threshold);
      const potentialGain = context.calculateDynamicDuplicationGain(file, excessRatio);
      
      if (potentialGain <= 0) return null;
      
      return {
        type: 'remove-duplication' as QuickWinType,
        file: file.absolutePath,
        line: 1,
        action: `Refactor duplicated code (${(actualRatio * 100).toFixed(1)}% duplication detected)`,
        currentValue: actualRatio * 100,
        targetValue: threshold * 100,
        scoreGain: potentialGain,
        effortEstimate: context.estimateDuplicationEffort(actualRatio),
        issueIds: [issue.type]
      };
    }
  },

  // Règle pour complexité globale élevée
  {
    issueTypes: ['high-file-complexity', 'critical-file-complexity'], // Types de FileDetailBuilder
    create: (file, _, issue, context) => {
      const actualComplexity = issue.actualValue || file.metrics.complexity;
      const threshold = issue.threshold || QUICK_WIN_THRESHOLDS.FILE_COMPLEXITY_HIGH;
      const excessRatio = issue.excessRatio || (actualComplexity / threshold);
      const potentialGain = context.calculateDynamicFileComplexityGain(file, excessRatio);
      
      if (potentialGain <= 0) return null;
      
      return {
        type: 'extract-module' as QuickWinType,
        file: file.absolutePath,
        line: 1,
        action: `Extract high-complexity logic into separate modules (complexity: ${actualComplexity})`,
        currentValue: actualComplexity,
        targetValue: threshold,
        scoreGain: potentialGain,
        effortEstimate: issue.severity === 'critical' ? 'complex' : 'hard',
        issueIds: [issue.type]
      };
    }
  },

  // Règle pour trop de fonctions (God Object pattern)
  {
    issueTypes: ['too-many-functions'], // Nouveau type à ajouter dans FileDetailBuilder
    create: (file, _, issue, context) => {
      const functionCount = issue.actualValue || file.functions?.length || 0;
      const threshold = issue.threshold || QUICK_WIN_THRESHOLDS.FILE_FUNCTION_COUNT;
      const potentialGain = Math.min(
        QUICK_WIN_THRESHOLDS.MAX_GAIN_PER_FILE,
        Math.round(3 * (functionCount / threshold - 1))
      );
      
      if (potentialGain <= 0) return null;
      
      return {
        type: 'split-file' as QuickWinType,
        file: file.absolutePath,
        line: 1,
        action: `Split file with ${functionCount} functions into smaller, focused modules`,
        currentValue: functionCount,
        targetValue: threshold,
        scoreGain: potentialGain,
        effortEstimate: 'hard' as EffortLevel,
        issueIds: [issue.type]
      };
    }
  },

  // Règle pour mauvaise cohésion (fonctions non liées)
  {
    issueTypes: ['low-cohesion'], // Nouveau type à ajouter dans FileDetailBuilder
    create: (file, _, issue, context) => {
      const cohesionScore = issue.actualValue || 0.3; // Score de cohésion (0-1)
      const threshold = issue.threshold || QUICK_WIN_THRESHOLDS.MIN_COHESION_SCORE;
      
      const potentialGain = Math.round((threshold - cohesionScore) * 10);
      
      return {
        type: 'reorganize-code' as QuickWinType,
        file: file.absolutePath,
        line: 1,
        action: `Reorganize file to improve cohesion (current: ${(cohesionScore * 100).toFixed(0)}%)`,
        currentValue: cohesionScore * 100,
        targetValue: threshold * 100,
        scoreGain: potentialGain,
        effortEstimate: 'moderate' as EffortLevel,
        issueIds: [issue.type]
      };
    }
  }
];

/**
 * Helper pour appliquer les règles
 */
export function applyQuickWinRules<T extends FileIssue | FunctionIssue>(
  rules: QuickWinRule<T>[],
  file: FileDetail,
  item: FileDetail | FunctionAnalysis,
  issues: T[],
  context: QuickWinContext
): Array<Omit<QuickWin, 'id' | 'priority' | 'roi' | 'criticality' | 'criticalityScore' | 'strategicPriority'>> {
  const quickWins: Array<Omit<QuickWin, 'id' | 'priority' | 'roi' | 'criticality' | 'criticalityScore' | 'strategicPriority'>> = [];

  issues.forEach(issue => {
    const applicableRules = rules.filter(rule => 
      rule.issueTypes.includes(issue.type) &&
      (!rule.isApplicable || rule.isApplicable(file, item, issue))
    );

    applicableRules.forEach(rule => {
      const quickWin = rule.create(file, item, issue, context);
      if (quickWin && quickWin.scoreGain > 0) {
        quickWins.push(quickWin);
      }
    });
  });

  return quickWins;
}