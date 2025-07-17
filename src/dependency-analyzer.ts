// File: src/dependency-analyzer.ts

import { Project, SourceFile } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { 
  AnalysisError, 
  DependencyAnalysisResult, 
  DependencyAnalyzerConfig, 
  FileDetail,
  FrameworkHint 
} from './types';
import { DependencyResolver } from './dependency-resolver';
import { DependencyGraph } from './dependency-graph';

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
  private readonly projectCache = new Map<string, Project>();
  private readonly config: Required<DependencyAnalyzerConfig>;
  private readonly resolver: DependencyResolver;
  private readonly graph: DependencyGraph;
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
    
    // Initialiser les composants
    this.resolver = new DependencyResolver(projectRoot, {
      extensions: this.config.extensions,
      aliases: this.config.aliases,
      followSymlinks: this.config.followSymlinks,
      logResolutionErrors: this.config.logResolutionErrors,
    });
    
    this.graph = new DependencyGraph(
      this.config.hubFileThreshold,
      this.config.logResolutionErrors
    );
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
      const analysisError: AnalysisError = {
        file: 'global',
        error: error instanceof Error ? error.message : String(error),
        phase: 'analyze',
      };

      return {
        incomingDependencyCount: new Map(),
        dependencyGraph: new Map(),
        statistics: this.getEmptyStatistics(),
        fileAnalyses: new Map(),
        circularDependencies: [],
        errors: [analysisError],
      };
    }
  }

  /**
   * Logique d'analyse principale, optimisée pour les gros projets.
   */
  private async performAnalysis(files: FileDetail[], astData: import('./ast-builder').ASTBuildResult): Promise<DependencyAnalysisResult> {
    const startTime = Date.now();
    const errors: AnalysisError[] = [];
    
    // ✅ Filtrage des fichiers valides - basé sur la liste fournie
    const validFiles = files.filter(file => {
      const filePath = file.file;
      
      if (this.isGeneratedFile(filePath)) {
        if (this.config.logResolutionErrors) {
          console.log(`🚫 Skipping generated file: ${filePath}`);
        }
        return false;
      }
      
      // Vérifier que le fichier existe physiquement et respecte la taille max
      try {
        const absolutePath = path.isAbsolute(filePath) 
          ? filePath 
          : path.join(this.config.projectRoot, filePath);
        const stats = fs.statSync(absolutePath);
        
        if (stats.size > this.config.maxFileSize) {
          errors.push({
            file: filePath,
            error: `File too large: ${Math.round(stats.size / 1024)}KB > ${Math.round(this.config.maxFileSize / 1024)}KB`,
            phase: 'read',
          });
          return false;
        }
        
        return true;
      } catch (e) {
        errors.push({
          file: filePath,
          error: `File access error: ${(e as Error).message}`,
          phase: 'read',
        });
        return false;
      }
    });

    // Normaliser tous les chemins de fichiers dans un Set pour la recherche rapide
    const filePaths = new Set(validFiles.map(f => f.file)); // Already normalized

    if (this.config.logResolutionErrors) {
      console.log(`\n🔍 Starting dependency analysis for ${validFiles.length} files...`);
      console.log(`   Total files available in AST: ${astData.files.length}`);
    }

    // Construire le project et analyser les fichiers
    const sourceFiles = astData.files.map(f => f.sourceFile);
    
    // Initialiser le graphe avec tous les fichiers valides
    for (const file of validFiles) {
      this.graph.addNode(file.file);
    }

    // Analyser les fichiers en chunks pour éviter la surcharge mémoire
    const chunkSize = Math.max(1, Math.min(50, Math.ceil(validFiles.length / 10)));
    const chunks = this.chunkArray(validFiles, chunkSize);
    
    let processedFiles = 0;
    
    if (this.config.logResolutionErrors) {
      console.log(`🔄 Processing ${chunks.length} chunks of ~${chunkSize} files each...`);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      if (this.config.logResolutionErrors && chunks.length > 5) {
        console.log(`  📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} files)`);
      }
      
      try {
        const chunkResults = await this.analyzeChunk(chunk, sourceFiles, filePaths, errors);
        processedFiles += chunkResults;
      } catch (error) {
        errors.push({
          file: `chunk-${i}`,
          error: error instanceof Error ? error.message : String(error),
          phase: 'analyze',
        });
      }
    }

    // Calculer les dépendances circulaires
    const circularDependencies = this.config.analyzeCircularDependencies 
      ? this.graph.detectCycles()
      : [];


    return {
      incomingDependencyCount: this.graph.getIncomingDependencyCount(),
      dependencyGraph: this.graph.getDependencyGraph(),
      statistics: this.graph.getStatistics(),
      fileAnalyses: this.graph.calculateFileAnalyses(validFiles, circularDependencies),
      circularDependencies,
      errors,
    };
  }

  /**
   * Analyse un chunk de fichiers de manière parallèle.
   */
  private async analyzeChunk(
    files: FileDetail[], 
    sourceFiles: SourceFile[], 
    filePaths: Set<string>, 
    errors: AnalysisError[]
  ): Promise<number> {
    let processedCount = 0;
    
    const analysisPromises = files.map(async (file) => {
      try {
        await this.analyzeSourceFile(file, sourceFiles, filePaths, errors);
        processedCount++;
      } catch (error) {
        errors.push({
          file: file.file,
          error: error instanceof Error ? error.message : String(error),
          phase: 'analyze',
        });
      }
    });
    
    await Promise.all(analysisPromises);
    return processedCount;
  }

  /**
   * Analyse un fichier source et construit le graphe de dépendances.
   */
  private async analyzeSourceFile(
    file: FileDetail, 
    sourceFiles: SourceFile[], 
    filePaths: Set<string>, 
    errors: AnalysisError[]
  ): Promise<void> {
    const filePath = file.file; // Already normalized
    
    // Trouver le SourceFile correspondant
    const sourceFile = sourceFiles.find(sf => {
      const sfPath = sf.getFilePath();
      const relativePath = path.relative(this.config.projectRoot, sfPath).replace(/\\\\/g, '/');
      return relativePath === filePath;
    });
    
    if (!sourceFile) {
      errors.push({
        file: filePath,
        error: 'Source file not found in AST',
        phase: 'parse',
      });
      return;
    }

    // Extraire les imports
    const imports = this.resolver.extractImports(sourceFile);
    
    // Résoudre tous les imports
    const resolutionPromises = imports.map(async importInfo => {
      try {
        const resolved = await this.resolver.resolveImport(importInfo.importPath, filePath);
        
        if (resolved && filePaths.has(resolved)) {
          // ✅ C'est un fichier de notre projet
          this.graph.addEdge(filePath, resolved);
        } else if (resolved && !filePaths.has(resolved)) {
          // Import résolu mais vers un fichier externe au scope analysé
          if (this.config.logResolutionErrors) {
            const similar = Array.from(filePaths).filter(f => f.includes(path.basename(resolved)));
            if (similar.length > 0) {
              console.log(`🔍 External resolved import \"${importInfo.importPath}\" => \"${resolved}\" (not in scope)`);
              console.log(`   Similar files in scope: ${similar.slice(0, 3).join(', ')}`);
            }
          }
        } else if (!resolved) {
          // Import non résolu - essayer de trouver des fichiers similaires
          if (this.config.logResolutionErrors) {
            console.log(`❌ Unresolved import \"${importInfo.importPath}\" from \"${filePath}\"`);
            
            // Chercher des fichiers similaires pour aider au debug
            const importBasename = path.basename(importInfo.importPath).replace(/\\.(js|ts|jsx|tsx)$/, '');
            
            if (importBasename.length > 2) {
              const similar = Array.from(filePaths).filter(fp => 
                path.basename(fp).toLowerCase().includes(importBasename.toLowerCase()) ||
                importBasename.toLowerCase().includes(path.basename(fp, path.extname(fp)).toLowerCase())
              );
              
              if (similar.length > 0) {
                console.log(`   💡 Similar files found: ${similar.slice(0, 3).join(', ')}`);
                
                // Si on trouve exactement un match, créer la dépendance
                if (similar.length === 1) {
                  console.log(`   ✅ Auto-linking to: ${similar[0]}`);
                  this.graph.addEdge(filePath, similar[0]);
                }
              }
            }
          }
        }
      } catch (error) {
        errors.push({
          file: filePath,
          error: `Failed to resolve \"${importInfo.importPath}\": ${(error as Error).message}`,
          phase: 'analyze',
        });
      }
    });
    
    await Promise.all(resolutionPromises);
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
          workspaces.push(...rush.projects.map((p: { projectFolder: string }) => p.projectFolder));
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
   * Divise un tableau en chunks pour le traitement parallèle.
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private getEmptyStatistics() {
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
    this.resolver.clearCache();
  }
}