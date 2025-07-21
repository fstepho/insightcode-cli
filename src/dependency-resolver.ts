// File: src/dependency-resolver.ts

import { SourceFile, ts, Node } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { CachedInputFileSystem, Resolver, ResolverFactory } from 'enhanced-resolve';
import { normalizePath } from './utils';

export interface ImportInfo {
  importPath: string;
  resolved: string | null;
}

interface ResolverConfig {
  extensions: string[];
  aliases: Record<string, string>;
  followSymlinks: boolean;
  logResolutionErrors: boolean;
}

/**
 * Résolution de modules avec cache et debug amélioré.
 */
export class DependencyResolver {
  private readonly moduleResolver: Resolver;
  private readonly resolveCache = new Map<string, string | null>();
  private readonly config: ResolverConfig;
  private readonly projectRoot: string;

  constructor(projectRoot: string, config: ResolverConfig) {
    this.projectRoot = projectRoot;
    this.config = config;
    
    // Configuration avancée du résolveur avec support des workspaces
    this.moduleResolver = ResolverFactory.createResolver({
      fileSystem: new CachedInputFileSystem(fs, 60000), // Cache 60s pour améliorer les perfs
      extensions: config.extensions,
      exportsFields: ['exports'],
      mainFields: ['main', 'module', 'browser'],
      alias: Object.entries(config.aliases).map(([key, value]) => ({
        name: key,
        alias: value,
        onlyModule: false,
      })),
      modules: ['node_modules'],
      symlinks: config.followSymlinks,
      preferRelative: true,
      conditionNames: ['node', 'import', 'require', 'default'],
    });
  }

  /**
   * Résout un import et retourne le chemin résolu.
   */
  async resolveImport(importPath: string, fromFile: string): Promise<string | null> {
    const cacheKey = `${fromFile}:${importPath}`;
    
    if (this.resolveCache.has(cacheKey)) {
      return this.resolveCache.get(cacheKey)!;
    }
    
    const result = await this.resolveModulePath(importPath, fromFile);
    
    // Log spécial pour les imports suspects
    if (this.config.logResolutionErrors && importPath.includes('types')) {
      console.log(`📍 Resolution: "${importPath}" from "${fromFile}" => ${result || 'NOT FOUND'}`);
    }
    
    this.resolveCache.set(cacheKey, result);
    return result;
  }

  /**
   * Extrait tous les imports d'un fichier source.
   */
  extractImports(sourceFile: SourceFile): ImportInfo[] {
    const importSpecifiers = new Set<string>();

    // Imports statiques
    sourceFile.getImportDeclarations().forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      if (moduleSpecifier) {
        importSpecifiers.add(moduleSpecifier);
      }
    });

    // Export re-exports
    sourceFile.getExportDeclarations().forEach(exportDecl => {
      const moduleSpecifier = exportDecl.getModuleSpecifierValue();
      if (moduleSpecifier) {
        importSpecifiers.add(moduleSpecifier);
      }
    });

    // Imports dynamiques
    this.extractDynamicImports(sourceFile, importSpecifiers);

    // Conversion en ImportInfo avec résolution lazy
    return Array.from(importSpecifiers).map(importPath => ({
      importPath,
      resolved: null // Will be resolved when needed
    }));
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
        const relativePath = normalizePath(path.relative(this.projectRoot, result));
        resolve(relativePath);
      });
    });
  }

  /**
   * Extrait les imports dynamiques du fichier.
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

  private getAbsolutePath(filePath: string): string {
    return path.isAbsolute(filePath) ? filePath : path.join(this.projectRoot, filePath);
  }

  getCacheHitRate(): number {
    return this.resolveCache.size > 0 ? 1 : 0;
  }

  clearCache(): void {
    this.resolveCache.clear();
  }
}