// File: src/dependency-analyzer.ts

import { Project, SourceFile, SyntaxKind, ts, Node, CallExpression } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { CachedInputFileSystem, Resolver, ResolverFactory } from 'enhanced-resolve';
import { 
  AnalysisError, 
  DependencyAnalysisResult, 
  DependencyAnalyzerConfig, 
  DependencyStatistics, 
  FileDependencyAnalysis, 
  FileDetail,
  FrameworkHint 
} from './types';
import { normalizePath } from './utils';


// Type helper pour la migration
export type DependencyAnalysisFunction = (
  files: FileDetail[], 
  projectRoot?: string
) => Promise<Map<string, number>>;

/**
 * Analyseur universel de dépendances pour projets open source.
 * Supporte tous les écosystèmes JavaScript/TypeScript modernes.
 */
export class UniversalDependencyAnalyzer {
  private readonly projectCache = new Map<string, Project>(); // ✅ Cache par instance au lieu de static
  private readonly config: Required<DependencyAnalyzerConfig>;
  private readonly moduleResolver: Resolver;
  private readonly resolveCache = new Map<string, string | null>();
  private readonly workspaces: string[];
  private readonly frameworkHints: FrameworkHint[];

  constructor(config: DependencyAnalyzerConfig = {}) {
    const projectRoot = config.projectRoot || process.cwd();
    const errors: AnalysisError[] = [];
    
    // Détection automatique des configurations
    this.workspaces = this.detectWorkspaces(projectRoot);
    this.frameworkHints = config.frameworkHints || this.detectFrameworks(projectRoot);
    const aliases = config.aliases || this.detectAliases(projectRoot, errors);

    this.config = {
      projectRoot,
      extensions: config.extensions || [
        '.js', '.jsx', '.mjs', '.cjs',
        '.ts', '.tsx', '.mts', '.cts', '.d.ts',
        '.vue', '.svelte',
        '.json', '.node', '.wasm',
      ],
      indexFiles: config.indexFiles || ['index', 'main'],
      aliases,
      frameworkHints: this.frameworkHints,
      analyzeCircularDependencies: config.analyzeCircularDependencies ?? true,
      analyzeDynamicImports: config.analyzeDynamicImports ?? true,
      followSymlinks: config.followSymlinks ?? true,
      maxFileSize: config.maxFileSize ?? 10 * 1024 * 1024,
      maxDepth: config.maxDepth ?? 100,
      timeout: config.timeout ?? 60000,
      cache: config.cache ?? true,
      hubFileThreshold: config.hubFileThreshold ?? 10,
      logResolutionErrors: config.logResolutionErrors ?? false,
    };
    
    // Configuration avancée du résolveur avec support des workspaces
    this.moduleResolver = ResolverFactory.createResolver({
      fileSystem: new CachedInputFileSystem(fs, 60000), // Cache 60s pour améliorer les perfs
      extensions: this.config.extensions,
      exportsFields: ['exports'],
      mainFields: ['main', 'module', 'browser'],
      alias: Object.entries(this.config.aliases).map(([key, value]) => ({
        name: key,
        alias: value,
        onlyModule: false,
      })),
      modules: this.getModulesDirectories(),
      symlinks: this.config.followSymlinks,
      preferRelative: true,
      conditionNames: ['node', 'import', 'require', 'default'],
    });
  }

  /**
   * Analyse principale avec timeout et gestion d'erreurs robuste.
   */
  public async analyze(files: FileDetail[], astData: import('./ast-builder').ASTBuildResult): Promise<DependencyAnalysisResult> {
    const analysisPromise = this.performAnalysis(files, astData);

    const timeoutPromise = new Promise<DependencyAnalysisResult>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Analysis timed out after ${this.config.timeout}ms`)),
        this.config.timeout
      )
    );

    try {
      return await Promise.race([analysisPromise, timeoutPromise]);
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(`❌ Critical analysis error: ${errorMessage}`);
      
      // Log additional context for debugging
      if (this.config.logResolutionErrors) {
        console.error(`   Project root: ${this.config.projectRoot}`);
        console.error(`   Files count: ${files.length}`);
        console.error(`   Error type: ${this.classifyError(error as Error)}`);
      }
      
      // Return partial results with error information for debugging
      const partialResult: DependencyAnalysisResult = {
        incomingDependencyCount: new Map(),
        dependencyGraph: new Map(),
        circularDependencies: [],
        errors: [{
          file: 'global',
          error: errorMessage,
          phase: 'analyze',
        }],
        statistics: this.getEmptyStatistics(),
        fileAnalyses: new Map(),
      };
      
      // In debug mode, still throw to prevent silent failures
      if (this.config.logResolutionErrors) {
        throw new Error(`Analysis failed: ${errorMessage}. Enable logging with --verbose for details.`);
      }
      
      return partialResult;
    }
  }

  /**
   * Logique d'analyse interne optimisée.
   */
  private async performAnalysis(files: FileDetail[], astData: import('./ast-builder').ASTBuildResult): Promise<DependencyAnalysisResult> {
    const startTime = Date.now();
    const errors: AnalysisError[] = [];
    
    if (this.config.logResolutionErrors) {
      console.log(`🚀 Starting dependency analysis for ${files.length} files`);
      console.log(`   Project root: ${this.config.projectRoot}`);
    }

    // Filtrage intelligent des fichiers
    const validFiles = files.filter(file => {
      // Estimation de la taille réelle
      const estimatedSize = file.metrics.loc * 80;
      if (estimatedSize > this.config.maxFileSize) {
        errors.push({
          file: file.file,
          error: `File too large: ${file.metrics.loc} lines (estimated ${(estimatedSize / 1024 / 1024).toFixed(2)}MB)`,
          phase: 'read',
        });
        if (this.config.logResolutionErrors) {
          console.log(`❌ File filtered out (too large): ${file.file}`);
        }
        return false;
      }
      
      if (this.config.logResolutionErrors) {
        console.log(`✅ File passed filter: ${file.file}`);
      }
      
      // Ignorer les fichiers générés
      if (this.isGeneratedFile(file.file)) {
        if (this.config.logResolutionErrors) {
          console.log(`❌ File filtered out (generated): ${file.file}`);
        }
        return false;
      }
      
      return true;
    });

    const filePaths = new Set(validFiles.map(f => f.file)); // Already normalized
    const incomingDependencyCount = new Map<string, number>();
    const dependencyGraph = new Map<string, Set<string>>();
    
    filePaths.forEach(path => {
      incomingDependencyCount.set(path, 0);
      dependencyGraph.set(path, new Set());
    });

    // Reuse existing AST - no re-parsing needed!
    const sourceFiles = astData.files.map(f => f.sourceFile);
    
    // Create simple mapping SourceFile → normalized path
    const pathMap = new Map<SourceFile, string>();
    astData.files.forEach(f => pathMap.set(f.sourceFile, f.relativePath));

    // Analyse parallèle avec gestion de la concurrence
    const concurrency = Math.min(10, sourceFiles.length);
    const chunks = this.chunkArray(sourceFiles, Math.ceil(sourceFiles.length / concurrency));
    
    await Promise.all(chunks.map(chunk =>
      this.analyzeChunk(chunk, pathMap, filePaths, incomingDependencyCount, dependencyGraph, errors)
    ));

    const statistics = this.calculateStatistics(dependencyGraph, incomingDependencyCount);
    const circularDependencies = this.config.analyzeCircularDependencies
      ? this.detectCircularDependencies(dependencyGraph)
      : [];

    const fileAnalyses = this.calculateFileAnalyses(
      validFiles,
      dependencyGraph, 
      incomingDependencyCount, 
      circularDependencies
    );

    const duration = Date.now() - startTime;
    if (this.config.logResolutionErrors) {
      console.log(
        `Analysis completed in ${duration}ms. ` +
        `Analyzed ${sourceFiles.length} files with ${errors.length} errors. ` +
        `Cache hit rate: ${this.getCacheHitRate()}%`
      );
    }

    // Nettoyer le cache de résolution après l'analyse
    this.resolveCache.clear();

    return { 
      incomingDependencyCount, 
      dependencyGraph, 
      circularDependencies, 
      errors, 
      statistics, 
      fileAnalyses 
    };
  }

  /**
   * Analyse un groupe de fichiers sources.
   */
  private async analyzeChunk(
    sourceFiles: SourceFile[],
    pathMap: Map<SourceFile, string>,
    filePaths: Set<string>,
    incomingDependencyCount: Map<string, number>,
    dependencyGraph: Map<string, Set<string>>,
    errors: AnalysisError[]
  ): Promise<void> {
    for (const sourceFile of sourceFiles) {
      try {
        if (this.config.logResolutionErrors) {
          console.log(`🔄 Processing source file: ${sourceFile.getFilePath()}`);
        }
        await this.analyzeSourceFile(sourceFile, pathMap, filePaths, incomingDependencyCount, dependencyGraph);
      } catch (err) {
        const error = err as Error;
        const errorType = this.classifyError(error);
        
        errors.push({
          file: sourceFile.getFilePath(),
          error: `[${errorType}] ${error.message}`,
          phase: 'analyze'
        });
      }
    }
  }

  /**
   * Analyse un fichier source avec extraction complète des dépendances.
   * Amélioré pour capturer tous les types d'imports.
   */
  private async analyzeSourceFile(
    sourceFile: SourceFile,
    pathMap: Map<SourceFile, string>,
    filePaths: Set<string>,
    incomingDependencyCount: Map<string, number>,
    dependencyGraph: Map<string, Set<string>>
  ): Promise<void> {
    // Use normalized path from Single Source of Truth
    const currentFile = pathMap.get(sourceFile) || 'unknown-file';
    const importSpecifiers = new Set<string>();
    
    // Debug: vérifier si le fichier est parsé correctement
    if (this.config.logResolutionErrors) {
      console.log(`📄 Analyzing file: ${currentFile}`);
      console.log(`   Import declarations found: ${sourceFile.getImportDeclarations().length}`);
    }

    // 1. Imports statiques (incluant import type)
    sourceFile.getImportDeclarations().forEach(decl => {
      const specifier = decl.getModuleSpecifierValue();
      importSpecifiers.add(specifier);
      
      // Debug basique - logger TOUS les imports
      if (this.config.logResolutionErrors) {
        console.log(`📂 Import found in ${currentFile}: "${specifier}"`);
      }
      
      // Debug pour les imports de workspace
      if (this.config.logResolutionErrors && (specifier.startsWith('shared/') || specifier.startsWith('react-reconciler/'))) {
        console.log(`🔍 Detected workspace import in ${currentFile}: ${specifier} (type-only: ${decl.isTypeOnly()})`);
      }
      
      // Debug pour les imports de type
      if (this.config.logResolutionErrors && decl.isTypeOnly()) {
        console.log(`📝 Type-only import in ${currentFile}: ${specifier}`);
      }
    });

    // 2. Exports avec source
    sourceFile.getExportDeclarations().forEach(decl => {
      const specifier = decl.getModuleSpecifierValue();
      if (specifier) {
        importSpecifiers.add(specifier);
      }
    });

    // 4. Imports dynamiques et require() si activé
    if (this.config.analyzeDynamicImports) {
      this.extractDynamicImports(sourceFile, importSpecifiers);
    }

    // Log de debug pour les fichiers suspects
    if (this.config.logResolutionErrors && currentFile.includes('types')) {
      console.log(`\n🔍 Analyzing ${currentFile}:`);
      console.log(`  Found ${importSpecifiers.size} import specifiers`);
    }

    // 5. Résolution parallèle avec cache
    const resolutionPromises = Array.from(importSpecifiers).map(async specifier => {
      const resolved = await this.resolveModulePathWithCache(specifier, currentFile);
      
      if (this.config.logResolutionErrors && specifier.startsWith('shared/')) {
        console.log(`🔍 Resolving workspace import "${specifier}": ${resolved ? `"${resolved}"` : 'NOT RESOLVED'}`);
      }
      
      // Debug: log les résolutions pour les fichiers types
      if (this.config.logResolutionErrors && (specifier.includes('types') || resolved?.includes('types'))) {
        console.log(`  📌 "${specifier}" => ${resolved ? `"${resolved}"` : 'NOT RESOLVED'}`);
        if (resolved && !filePaths.has(resolved)) {
          console.log(`    ⚠️  Resolved file NOT in filePaths!`);
          // Chercher des fichiers similaires
          const similar = Array.from(filePaths).filter(f => f.includes(path.basename(resolved)));
          if (similar.length > 0) {
            console.log(`    💡 Similar files in filePaths:`, similar);
          }
        }
      }
      
      return resolved;
    });
    
    const allResolved = await Promise.all(resolutionPromises);
    const resolvedPaths = allResolved
      .filter((p): p is string => p !== null && filePaths.has(p));
    
    // Debug détaillé des chemins pour React
    if (this.config.logResolutionErrors && currentFile.includes('ReactHooks')) {
      console.log(`\n🔍 DETAILED DEBUG for ${currentFile}:`);
      console.log(`   allResolved count: ${allResolved.filter(p => p !== null).length}`);
      console.log(`   filePaths size: ${filePaths.size}`);
      
      allResolved.forEach((resolved, i) => {
        if (resolved && (resolved.includes('shared') || resolved.includes('react-reconciler'))) {
          const inFilePaths = filePaths.has(resolved);
          console.log(`   [${i}] "${resolved}" -> in filePaths: ${inFilePaths}`);
          
          if (!inFilePaths) {
            // Chercher des chemins similaires
            const similar = Array.from(filePaths).filter(fp => 
              fp.includes('shared') && fp.includes(path.basename(resolved))
            );
            if (similar.length > 0) {
              console.log(`       Similar in filePaths: ${similar[0]}`);
            }
          }
        }
      });
      
      console.log(`   Final resolvedPaths: ${resolvedPaths.length}`);
    }

    // 6. Mise à jour du graphe
    for (const resolvedPath of resolvedPaths) {
      this.addDependency(currentFile, resolvedPath, incomingDependencyCount, dependencyGraph);
    }

    // Debug final
    if (this.config.logResolutionErrors && currentFile.includes('types')) {
      const deps = dependencyGraph.get(currentFile) || new Set();
      console.log(`  ✅ Final dependencies from ${currentFile}: ${deps.size} files`);
    }
  }

  /**
   * Extrait les imports dynamiques d'un fichier source.
   */
  private extractDynamicImports(sourceFile: SourceFile, importSpecifiers: Set<string>): void {
    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) return;
      
      const expression = node.getExpression();
      const firstArg = node.getArguments()[0];
      
      if (!Node.isStringLiteral(firstArg)) return;
      
      const isImport = expression.getKind() === ts.SyntaxKind.ImportKeyword;
      const isRequire = Node.isIdentifier(expression) && expression.getText() === 'require';
      
      if (isImport || isRequire) {
        importSpecifiers.add(firstArg.getLiteralValue());
      }
    });
  }

  /**
   * Résolution de module avec cache et debug amélioré.
   */
  private async resolveModulePathWithCache(
    importPath: string, 
    importingFile: string
  ): Promise<string | null> {
    const cacheKey = `${importingFile}:${importPath}`;
    
    if (this.resolveCache.has(cacheKey)) {
      return this.resolveCache.get(cacheKey)!;
    }
    
    const result = await this.resolveModulePath(importPath, importingFile);
    
    // Log spécial pour les imports suspects
    if (this.config.logResolutionErrors && importPath.includes('types')) {
      console.log(`📍 Resolution: "${importPath}" from "${importingFile}" => ${result || 'NOT FOUND'}`);
    }
    
    this.resolveCache.set(cacheKey, result);
    return result;
  }

  /**
   * Résolution de module robuste avec enhanced-resolve.
   */
  private async resolveModulePath(
    importPath: string, 
    importingFile: string
  ): Promise<string | null> {
    // Handle TypeScript imports with .js extension (ESM pattern)
    let adjustedImportPath = importPath;
    if (importPath.endsWith('.js') && importPath.startsWith('.')) {
      // Try without extension first (enhanced-resolve will add extensions)
      adjustedImportPath = importPath.slice(0, -3);
    }
    
    return new Promise((resolve) => {
      const context = {};
      const lookupStartPath = path.dirname(this.getAbsolutePath(importingFile));
      const resolveContext = {};

      this.moduleResolver.resolve(context, lookupStartPath, adjustedImportPath, resolveContext, (err, result) => {
        if (err || typeof result !== 'string') {
          // Logger les erreurs de résolution pour le debug (sauf pour les modules natifs connus)
          const isNodeBuiltin = this.isNodeBuiltinModule(importPath);
          if (!isNodeBuiltin && err && this.config.logResolutionErrors) {
            console.log(`❌ Failed to resolve "${importPath}" from "${importingFile}": ${err.message}`);
          }
          // Debug workspace imports spécifiquement
          if (this.config.logResolutionErrors && (importPath.startsWith('shared/') || importPath.startsWith('react-reconciler/'))) {
            console.log(`🔍 Workspace import "${importPath}" failed from "${importingFile}"`);
            console.log(`   Available aliases:`, Object.keys(this.config.aliases));
          }
          return resolve(null);
        }

        // Vérifier que c'est un fichier réel et non un module natif
        try {
          const stats = fs.statSync(result);
          if (!stats.isFile()) {
            return resolve(null);
          }
        } catch {
          return resolve(null);
        }

        // Convert to relative normalized path
        const relativePath = normalizePath(path.relative(this.config.projectRoot, result));
        resolve(relativePath);
      });
    });
  }

  /**
   * Vérifie si un module est un module natif Node.js.
   */
  private isNodeBuiltinModule(moduleName: string): boolean {
    const builtins = [
      'fs', 'path', 'http', 'https', 'crypto', 'os', 'util', 'stream',
      'buffer', 'events', 'url', 'querystring', 'child_process', 'cluster',
      'dgram', 'dns', 'net', 'readline', 'repl', 'tls', 'tty', 'vm', 'zlib',
      'assert', 'console', 'constants', 'domain', 'punycode', 'process'
    ];
    
    const name = moduleName.startsWith('node:') 
      ? moduleName.slice(5) 
      : moduleName;
    
    return builtins.includes(name);
  }

  /**
   * Ajoute une dépendance au graphe.
   */
  private addDependency(
    from: string, 
    to: string, 
    incomingDependencyCount: Map<string, number>, 
    dependencyGraph: Map<string, Set<string>>
  ): void {
    if (from === to) return;

    const dependencies = dependencyGraph.get(from);
    if (dependencies && !dependencies.has(to)) {
      dependencies.add(to);
      incomingDependencyCount.set(to, (incomingDependencyCount.get(to) ?? 0) + 1);
      
      if (this.config.logResolutionErrors && (from.includes('ReactAct') || to.includes('shared'))) {
        console.log(`🔗 Added dependency: ${from} -> ${to}`);
      }
    }
  }

  /**
   * Détection optimisée des dépendances circulaires.
   */
  private detectCircularDependencies(dependencyGraph: Map<string, Set<string>>): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const pathStack: string[] = [];
    const cycleSignatures = new Set<string>();

    const dfs = (node: string): void => {
      visited.add(node);
      recursionStack.add(node);
      pathStack.push(node);

      for (const dep of dependencyGraph.get(node) ?? []) {
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

    for (const node of dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    
    return cycles;
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
   * Calculate detailed statistics.
   */
  private calculateStatistics(
    dependencyGraph: Map<string, Set<string>>, 
    incomingDependencyCount: Map<string, number>
  ): DependencyStatistics {
    const totalFiles = dependencyGraph.size;
    let totalImports = 0;
    let maxImports = { file: '', count: 0 };
    const isolatedFiles: string[] = [];
    
    for (const [file, deps] of dependencyGraph.entries()) {
      const depsCount = deps.size;
      totalImports += depsCount;
      
      if (depsCount > maxImports.count) {
        maxImports = { file, count: depsCount };
      }
      
      if (depsCount === 0 && (incomingDependencyCount.get(file) ?? 0) === 0) {
        isolatedFiles.push(file);
      }
    }
    
    const hubFiles = Array.from(incomingDependencyCount.entries())
      .filter(([, score]) => score > this.config.hubFileThreshold)
      .sort(([, a], [, b]) => b - a)
      .map(([file]) => file);

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
   * Calcule les métriques détaillées pour chaque fichier.
   * Assure la cohérence entre incomingDependencies et incomingDependencyCount.
   */
  private calculateFileAnalyses(
    files: FileDetail[],
    dependencyGraph: Map<string, Set<string>>,
    incomingDependencyCount: Map<string, number>,
    circularDependencies: string[][]
  ): Map<string, FileDependencyAnalysis> {
    const analyses = new Map<string, FileDependencyAnalysis>();
    
    const usageRanks = this.calculateAllUsageRanks(incomingDependencyCount);
    const filesInCycles = new Set(circularDependencies.flat());

    // Debug: vérifier la cohérence
    if (this.config.logResolutionErrors) {
      console.log('\n📊 Metrics calculation:');
      console.log(`  Total files: ${files.length}`);
      console.log(`  Files in dependency graph: ${dependencyGraph.size}`);
      console.log(`  Files with incoming dependency count: ${incomingDependencyCount.size}`);
    }

    for (const file of files) {
      const filePath = file.file; // Already normalized
      const outgoingDependencies = dependencyGraph.get(filePath)?.size ?? 0;
      
      // Utiliser directement l'impact score comme incoming count
      const incomingDependencies = incomingDependencyCount.get(filePath) ?? 0;
      const totalCoupling = incomingDependencies + outgoingDependencies;

      // Calcul des métriques avancées
      const instability = totalCoupling === 0 ? 0 : outgoingDependencies / totalCoupling;
      const dependencies = dependencyGraph.get(filePath) ?? new Set();
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
      if (this.config.logResolutionErrors && filePath.includes('types')) {
        console.log(`\n  📄 ${filePath}:`);
        console.log(`    Incoming: ${incomingDependencies}`);
        console.log(`    Outgoing: ${outgoingDependencies}`);
        console.log(`    Percentile: ${analysis.percentileUsageRank}%`);
        
        // Lister qui importe ce fichier
        if (incomingDependencies === 0) {
          console.log(`    ⚠️  No incoming dependencies detected!`);
          // Chercher dans le graphe qui pourrait l'importer
          let importers = [];
          for (const [from, deps] of dependencyGraph.entries()) {
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
  private calculateAllUsageRanks(incomingDependencyCount: Map<string, number>): Map<string, number> {
    const ranks = new Map<string, number>();
    
    if (incomingDependencyCount.size === 0) {
      return ranks;
    }

    // Cas spécial : un seul fichier
    if (incomingDependencyCount.size === 1) {
      const filePath = Array.from(incomingDependencyCount.keys())[0];
      ranks.set(filePath, 0);
      return ranks;
    }

    // Trier par score d'impact
    const sortedFiles = Array.from(incomingDependencyCount.entries())
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
    const totalFiles = incomingDependencyCount.size;
    
    for (const [, files] of Array.from(scoreGroups.entries()).sort(([a], [b]) => a - b)) {
      // Tous les fichiers avec le même score ont le même rang
      const percentile = Math.round((currentRank / (totalFiles - 1)) * 100);
      
      for (const file of files) {
        ranks.set(file, percentile);
      }
      
      currentRank += files.length;
    }

    // Debug log pour les fichiers suspects
    if (this.config.logResolutionErrors) {
      const suspiciousFiles = Array.from(ranks.entries())
        .filter(([file, rank]) => {
          const score = incomingDependencyCount.get(file) || 0;
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

  /**
   * Détecte automatiquement les alias depuis tsconfig/jsconfig.
   */
  private detectAliases(projectRoot: string, errors: AnalysisError[]): Record<string, string> {
    const aliases: Record<string, string> = {};
    
    // 1. Ajouter les alias de workspace pour les monorepos
    this.addWorkspaceAliases(aliases, projectRoot);
    
    // 2. Chercher dans l'ordre: tsconfig.json, jsconfig.json
    const configFiles = ['tsconfig.json', 'jsconfig.json'];
    
    for (const configFile of configFiles) {
      const configPath = path.join(projectRoot, configFile);
      if (!fs.existsSync(configPath)) continue;
      
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const compilerOptions = config.compilerOptions || {};
        const baseUrl = compilerOptions.baseUrl 
          ? path.resolve(projectRoot, compilerOptions.baseUrl) 
          : projectRoot;
        
        const paths = compilerOptions.paths || {};
        
        for (const [alias, targets] of Object.entries(paths)) {
          if (Array.isArray(targets) && targets.length > 0) {
            const cleanAlias = alias.replace('/*', '');
            const cleanTarget = (targets[0] as string).replace('/*', '');
            aliases[cleanAlias] = path.resolve(baseUrl, cleanTarget);
          }
        }
      } catch (e) {
        errors.push({
          file: configPath,
          error: `Failed to parse ${configFile}: ${(e as Error).message}`,
          phase: 'config',
        });
      }
    }
    
    return aliases;
  }

  /**
   * Détecte les frameworks utilisés dans le projet.
   */
  private detectFrameworks(projectRoot: string): FrameworkHint[] {
    const hints: FrameworkHint[] = [];
    const packageJsonPath = path.join(projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) return hints;
    
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { 
        ...pkg.dependencies, 
        ...pkg.devDependencies,
        ...pkg.peerDependencies 
      };
      
      const frameworkDetectors: Array<{
        pattern: RegExp;
        name: FrameworkHint['name'];
        importPatterns?: RegExp[];
      }> = [
        { pattern: /^@?vue/, name: 'vue', importPatterns: [/^@?vue/, /\.vue$/] },
        { pattern: /^react(-dom)?$/, name: 'react', importPatterns: [/^react/] },
        { pattern: /^@angular\/core/, name: 'angular', importPatterns: [/^@angular/] },
        { pattern: /^svelte/, name: 'svelte', importPatterns: [/^svelte/, /\.svelte$/] },
        { pattern: /^next$/, name: 'next', importPatterns: [/^next\//] },
        { pattern: /^nuxt/, name: 'nuxt', importPatterns: [/^@?nuxt/] },
        { pattern: /^gatsby/, name: 'gatsby', importPatterns: [/^gatsby/] },
        { pattern: /^@remix-run/, name: 'custom', importPatterns: [/^@remix-run/] },
        { pattern: /^solid-js/, name: 'custom', importPatterns: [/^solid-/] },
        { pattern: /^preact/, name: 'custom', importPatterns: [/^preact/] },
      ];
      
      for (const [dep] of Object.entries(allDeps)) {
        for (const detector of frameworkDetectors) {
          if (detector.pattern.test(dep)) {
            const existingHint = hints.find(h => h.name === detector.name);
            if (!existingHint) {
              hints.push({ 
                name: detector.name,
                importPatterns: detector.importPatterns 
              });
            }
          }
        }
      }
    } catch (e) {
      // Log parsing errors for package.json to aid debugging
      if (this.config.logResolutionErrors) {
        console.warn(`Warning: Could not parse package.json for framework detection: ${(e as Error).message}`);
      }
    }
    
    return hints;
  }

  /**
   * Détecte les workspaces (monorepos).
   */
  private detectWorkspaces(projectRoot: string): string[] {
    const workspaces: string[] = [];
    
    // 1. Yarn/npm workspaces
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (pkg.workspaces) {
          const ws = Array.isArray(pkg.workspaces) 
            ? pkg.workspaces 
            : pkg.workspaces.packages || [];
          workspaces.push(...ws);
        }
      } catch (e) {
        // Log workspace detection errors for debugging
        if (this.config.logResolutionErrors) {
          console.warn(`Warning: Could not parse package.json for workspace detection: ${(e as Error).message}`);
        }
      }
    }
    
    // 2. Lerna
    const lernaPath = path.join(projectRoot, 'lerna.json');
    if (fs.existsSync(lernaPath)) {
      try {
        const lerna = JSON.parse(fs.readFileSync(lernaPath, 'utf8'));
        if (lerna.packages) {
          workspaces.push(...lerna.packages);
        }
      } catch (e) {
        // Log lerna parsing errors for debugging
        if (this.config.logResolutionErrors) {
          console.warn(`Warning: Could not parse lerna.json: ${(e as Error).message}`);
        }
      }
    }
    
    // 4. Rush
    const rushPath = path.join(projectRoot, 'rush.json');
    if (fs.existsSync(rushPath)) {
      try {
        const rush = JSON.parse(fs.readFileSync(rushPath, 'utf8'));
        if (rush.projects) {
          workspaces.push(...rush.projects.map((p: any) => p.projectFolder));
        }
      } catch (e) {
        // Log rush parsing errors for debugging
        if (this.config.logResolutionErrors) {
          console.warn(`Warning: Could not parse rush.json: ${(e as Error).message}`);
        }
      }
    }
    
    return [...new Set(workspaces)]; // Dédupliquer
  }

  /**
   * Ajoute les alias automatiques pour les workspaces monorepo.
   */
  private addWorkspaceAliases(aliases: Record<string, string>, projectRoot: string): void {
    // console.log(`🔧 Detected workspaces:`, this.workspaces);
    
    // Parcourir les workspaces détectés et créer des alias
    for (const workspace of this.workspaces) {
      // Résoudre le pattern de workspace (ex: "packages/*")
      if (workspace.includes('*')) {
        const workspaceDir = workspace.replace('/*', '');
        const workspacePath = path.join(projectRoot, workspaceDir);
        
        if (fs.existsSync(workspacePath)) {
          try {
            const packages = fs.readdirSync(workspacePath);
            for (const pkg of packages) {
              const pkgPath = path.join(workspacePath, pkg);
              const packageJsonPath = path.join(pkgPath, 'package.json');
              
              if (fs.existsSync(packageJsonPath)) {
                try {
                  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                  // Créer un alias: nom du package -> chemin du package
                  if (packageJson.name) {
                    aliases[packageJson.name] = pkgPath;
                  }
                  // Créer aussi un alias basé sur le nom du dossier
                  aliases[pkg] = pkgPath;
                  
                  // console.log(`  ✅ Added alias: ${pkg} -> ${pkgPath}`);
                } catch {
                  // Ignorer les erreurs de parsing package.json
                }
              }
            }
          } catch {
            // Ignorer les erreurs de lecture du répertoire
          }
        }
      } else {
        // Workspace direct (non-pattern)
        const workspacePath = path.join(projectRoot, workspace);
        if (fs.existsSync(workspacePath)) {
          const workspaceName = path.basename(workspace);
          aliases[workspaceName] = workspacePath;
        }
      }
    }
  }

  /**
   * Obtient les répertoires de modules en incluant les workspaces.
   */
  private getModulesDirectories(): string[] {
    const modules = ['node_modules'];
    
    // Ajouter les node_modules des workspaces
    for (const workspace of this.workspaces) {
      const workspaceModules = path.join(workspace, 'node_modules');
      modules.push(workspaceModules);
    }
    
    return modules;
  }

  /**
   * Vérifie si un fichier est généré automatiquement.
   */
  private isGeneratedFile(filePath: string): boolean {
    const generatedPatterns = [
      /\.min\.(js|css)$/,
      /\.bundle\.(js|css)$/,
      /\bdist\b/,
      /\bbuild\b/,
      /\b\.next\b/,
      /\b\.nuxt\b/,
      /\bnode_modules\b/,
      /\bcoverage\b/,
      /\.d\.ts$/,
      /\b__generated__\b/,
    ];
    
    return generatedPatterns.some(pattern => pattern.test(filePath));
  }

  /**
   * Classifie le type d'erreur pour un meilleur debugging.
   */
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (error instanceof SyntaxError) return 'syntax';
    if (message.includes('resolve')) return 'resolution';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('memory')) return 'memory';
    if (message.includes('permission')) return 'permission';
    
    return 'unknown';
  }

  /**
   * Divise un tableau en chunks pour le traitement parallèle.
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Calcule le taux de hit du cache.
   */
  private getCacheHitRate(): number {
    if (this.resolveCache.size === 0) return 0;
    
    let hits = 0;
    for (const value of this.resolveCache.values()) {
      if (value !== null) hits++;
    }
    
    return Math.round((hits / this.resolveCache.size) * 100);
  }

  private getAbsolutePath(filePath: string): string {
    return path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(this.config.projectRoot, filePath);
  }

  private getEmptyStatistics(): DependencyStatistics {
    return {
      totalFiles: 0,
      totalImports: 0,
      averageImportsPerFile: 0,
      maxImports: { file: '', count: 0 },
      isolatedFiles: [],
      hubFiles: [],
    };
  }
  
  /**
   * Nettoie le cache de cette instance.
   */
  public clearCache(): void {
    this.projectCache.clear();
  }
}