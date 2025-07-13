// File: src/dependency-graph.ts

import { DependencyStatistics, FileDependencyAnalysis, FileDetail } from './types';

/**
 * Gestion du graphe de dépendances et calculs associés.
 */
export class DependencyGraph {
  private readonly dependencyGraph = new Map<string, Set<string>>();
  private readonly incomingDependencyCount = new Map<string, number>();
  private readonly hubFileThreshold: number;
  private readonly logResolutionErrors: boolean;

  constructor(hubFileThreshold = 10, logResolutionErrors = false) {
    this.hubFileThreshold = hubFileThreshold;
    this.logResolutionErrors = logResolutionErrors;
  }

  /**
   * Ajoute un noeud au graphe.
   */
  addNode(file: string): void {
    if (!this.dependencyGraph.has(file)) {
      this.dependencyGraph.set(file, new Set());
    }
    if (!this.incomingDependencyCount.has(file)) {
      this.incomingDependencyCount.set(file, 0);
    }
  }

  /**
   * Ajoute une arête au graphe.
   */
  addEdge(from: string, to: string): void {
    if (from === to) return;

    const dependencies = this.dependencyGraph.get(from);
    if (dependencies && !dependencies.has(to)) {
      dependencies.add(to);
      this.incomingDependencyCount.set(to, (this.incomingDependencyCount.get(to) ?? 0) + 1);
      
      if (this.logResolutionErrors && (from.includes('ReactAct') || to.includes('shared'))) {
        console.log(`🔗 Added dependency: ${from} -> ${to}`);
      }
    }
  }

  /**
   * Détection optimisée des dépendances circulaires.
   */
  detectCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const pathStack: string[] = [];
    const cycleSignatures = new Set<string>();

    const dfs = (node: string): void => {
      visited.add(node);
      recursionStack.add(node);
      pathStack.push(node);

      for (const dep of this.dependencyGraph.get(node) ?? []) {
        if (!visited.has(dep)) {
          dfs(dep);
        } else if (recursionStack.has(dep)) {
          const cycleStart = pathStack.indexOf(dep);
          if (cycleStart !== -1) {
            const cycle = pathStack.slice(cycleStart);
            const signature = this.getCycleSignature(cycle);
            
            if (!cycleSignatures.has(signature)) {
              cycles.push(this.normalizeCycle(cycle));
              cycleSignatures.add(signature);
            }
          }
        }
      }

      recursionStack.delete(node);
      pathStack.pop();
    };

    for (const node of this.dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    
    return cycles;
  }

  /**
   * Calcule l'instabilité d'un noeud (sortant / (sortant + entrant)).
   */
  calculateInstability(node: string): number {
    const outgoing = this.dependencyGraph.get(node)?.size ?? 0;
    const incoming = this.incomingDependencyCount.get(node) ?? 0;
    const total = incoming + outgoing;
    
    return total === 0 ? 0 : outgoing / total;
  }

  /**
   * Retourne les statistiques du graphe.
   */
  getStatistics(): DependencyStatistics {
    const totalFiles = this.dependencyGraph.size;
    let totalImports = 0;
    let maxImports = { file: '', count: 0 };
    const isolatedFiles: string[] = [];
    
    for (const [file, deps] of this.dependencyGraph.entries()) {
      const depsCount = deps.size;
      totalImports += depsCount;
      
      if (depsCount > maxImports.count) {
        maxImports = { file, count: depsCount };
      }
      
      if (depsCount === 0 && (this.incomingDependencyCount.get(file) ?? 0) === 0) {
        isolatedFiles.push(file);
      }
    }
    
    const hubFiles = this.getHubFiles(this.hubFileThreshold);

    return {
      totalFiles,
      totalImports,
      averageImportsPerFile: totalFiles > 0 ? totalImports / totalFiles : 0,
      maxImports,
      isolatedFiles,
      hubFiles,
    };
  }

  /**
   * Retourne les fichiers hub (fortement utilisés).
   */
  getHubFiles(threshold: number): string[] {
    return Array.from(this.incomingDependencyCount.entries())
      .filter(([, score]) => score > threshold)
      .sort(([, a], [, b]) => b - a)
      .map(([file]) => file);
  }

  /**
   * Calcule les métriques détaillées pour chaque fichier.
   */
  calculateFileAnalyses(files: FileDetail[], circularDependencies: string[][]): Map<string, FileDependencyAnalysis> {
    const analyses = new Map<string, FileDependencyAnalysis>();
    
    const usageRanks = this.calculateAllUsageRanks();
    const filesInCycles = new Set(circularDependencies.flat());

    // Debug: vérifier la cohérence
    if (this.logResolutionErrors) {
      console.log('\n📊 Metrics calculation:');
      console.log(`  Total files: ${files.length}`);
      console.log(`  Files in dependency graph: ${this.dependencyGraph.size}`);
      console.log(`  Files with incoming dependency count: ${this.incomingDependencyCount.size}`);
    }

    for (const file of files) {
      const filePath = file.file; // Already normalized
      const outgoingDependencies = this.dependencyGraph.get(filePath)?.size ?? 0;
      
      // Utiliser directement l'impact score comme incoming count
      const incomingDependencies = this.incomingDependencyCount.get(filePath) ?? 0;
      const totalCoupling = incomingDependencies + outgoingDependencies;

      // Calcul des métriques avancées
      const instability = totalCoupling === 0 ? 0 : outgoingDependencies / totalCoupling;
      const dependencies = this.dependencyGraph.get(filePath) ?? new Set();
      const cohesionScore = this.calculateCohesion(filePath, dependencies);

      const analysis: FileDependencyAnalysis = {
        outgoingDependencies: outgoingDependencies,
        incomingDependencies: incomingDependencies, // Directement depuis incomingDependencyCount
        instability: parseFloat(instability.toFixed(2)),
        cohesionScore: parseFloat(cohesionScore.toFixed(2)),
        percentileUsageRank: usageRanks.get(filePath) ?? 0,
        isInCycle: filesInCycles.has(filePath),
      };

      // Debug pour les fichiers suspects
      if (this.logResolutionErrors && filePath.includes('types')) {
        console.log(`\n  📄 ${filePath}:`);
        console.log(`    Incoming: ${incomingDependencies}`);
        console.log(`    Outgoing: ${outgoingDependencies}`);
        console.log(`    Percentile: ${analysis.percentileUsageRank}%`);
        
        // Lister qui importe ce fichier
        if (incomingDependencies === 0) {
          console.log(`    ⚠️  No incoming dependencies detected!`);
          // Chercher dans le graphe qui pourrait l'importer
          let importers = [];
          for (const [from, deps] of this.dependencyGraph.entries()) {
            if (deps.has(filePath)) {
              importers.push(from);
            }
          }
          if (importers.length > 0) {
            console.log(`    🐛 BUG: Found importers not counted:`, importers);
          }
        }
      }

      analyses.set(filePath, analysis);
    }

    return analyses;
  }

  /**
   * Génère une signature unique pour un cycle.
   */
  private getCycleSignature(cycle: string[]): string {
    const normalized = this.normalizeCycle(cycle);
    return normalized.join(' -> ');
  }

  /**
   * Normalise un cycle pour avoir une représentation canonique.
   */
  private normalizeCycle(cycle: string[]): string[] {
    if (cycle.length === 0) return [];
    
    let minIndex = 0;
    for (let i = 1; i < cycle.length; i++) {
      if (cycle[i] < cycle[minIndex]) {
        minIndex = i;
      }
    }
    
    return [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
  }

  /**
   * Calcule le score de cohésion basé sur la proximité des dépendances.
   */
  private calculateCohesion(file: string, dependencies: Set<string>): number {
    if (dependencies.size === 0) return 1;
    
    const fileParts = file.split('/');
    let cohesionSum = 0;
    
    for (const dep of dependencies) {
      const depParts = dep.split('/');
      const commonParts = this.countCommonPathParts(fileParts, depParts);
      cohesionSum += commonParts / Math.max(fileParts.length, depParts.length);
    }
    
    return cohesionSum / dependencies.size;
  }

  /**
   * Compte le nombre de parties communes dans deux chemins.
   */
  private countCommonPathParts(path1: string[], path2: string[]): number {
    let count = 0;
    const minLength = Math.min(path1.length, path2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (path1[i] === path2[i]) {
        count++;
      } else {
        break;
      }
    }
    
    return count;
  }

  /**
   * Calcule les rangs d'utilisation en percentiles.
   * Corrigé pour gérer correctement les scores de 0.
   */
  private calculateAllUsageRanks(): Map<string, number> {
    const ranks = new Map<string, number>();
    
    if (this.incomingDependencyCount.size === 0) {
      return ranks;
    }

    // Cas spécial : un seul fichier
    if (this.incomingDependencyCount.size === 1) {
      const filePath = Array.from(this.incomingDependencyCount.keys())[0];
      ranks.set(filePath, 0);
      return ranks;
    }

    // Trier par score d'impact
    const sortedFiles = Array.from(this.incomingDependencyCount.entries())
      .sort(([, a], [, b]) => a - b);
    
    // Grouper les fichiers par score pour gérer les égalités
    const scoreGroups = new Map<number, string[]>();
    for (const [file, score] of sortedFiles) {
      if (!scoreGroups.has(score)) {
        scoreGroups.set(score, []);
      }
      scoreGroups.get(score)!.push(file);
    }

    // Assigner les rangs en gérant les égalités
    let currentRank = 0;
    const totalFiles = this.incomingDependencyCount.size;
    
    for (const [, files] of Array.from(scoreGroups.entries()).sort(([a], [b]) => a - b)) {
      // Tous les fichiers avec le même score ont le même rang
      const percentile = Math.round((currentRank / (totalFiles - 1)) * 100);
      
      for (const file of files) {
        ranks.set(file, percentile);
      }
      
      currentRank += files.length;
    }

    // Debug log pour les fichiers suspects
    if (this.logResolutionErrors) {
      const suspiciousFiles = Array.from(ranks.entries())
        .filter(([file, rank]) => {
          const score = this.incomingDependencyCount.get(file) || 0;
          return score === 0 && rank > 50;
        });
      
      if (suspiciousFiles.length > 0) {
        console.warn('⚠️  Suspicious percentile ranks detected:');
        suspiciousFiles.forEach(([file, rank]) => {
          console.warn(`  ${file}: rank=${rank}% but score=0`);
        });
      }
    }

    return ranks;
  }

  getDependencyGraph(): Map<string, Set<string>> {
    return this.dependencyGraph;
  }

  getIncomingDependencyCount(): Map<string, number> {
    return this.incomingDependencyCount;
  }
}