// File: src/dependencyAnalyzer.ts

import { Project, SourceFile, SyntaxKind, ts } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs';
import { FileDetail } from './types';
import { normalizePath } from './utils';

/**
 * Analyse les dépendances d'un projet pour calculer l'impact de chaque fichier.
 * L'impact correspond au nombre de fois qu'un fichier est importé par d'autres.
 * Utilise ts-morph pour une analyse TypeScript native et robuste.
 * @param files - La liste des fichiers du projet.
 * @returns Une Map<filePath, impactScore>.
 */
export function analyzeDependencies(files: FileDetail[]): Map<string, number> {
  const filePaths = new Set(files.map(f => f.file));
  const impactScores = new Map<string, number>();
  files.forEach(f => impactScores.set(f.file, 0)); // Initialise l'impact à 0

  // Créer un projet ts-morph avec configuration optimisée
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      noResolve: false,
    }
  });

  // Ajouter tous les fichiers au projet avec chemins absolus
  for (const file of files) {
    try {
      const content = (file as any).content || fs.readFileSync(file.file, 'utf8');
      // Utiliser chemin absolu pour ts-morph
      const absolutePath = path.resolve(file.file);
      project.createSourceFile(absolutePath, content);
    } catch (error) {
      console.warn(`Could not read file ${file.file}:`, error);
    }
  }

  // Analyser les dépendances avec ts-morph
  const sourceFiles = project.getSourceFiles();
  
  for (const sourceFile of sourceFiles) {
    const currentFilePath = normalizeProjectPath(sourceFile.getFilePath());
    
    // Analyser les imports directs
    analyzeImports(sourceFile, currentFilePath, filePaths, impactScores);
    
    // Analyser les exports (re-exports)
    analyzeExports(sourceFile, currentFilePath, filePaths, impactScores);
    
    // Analyser les dynamic imports et require()
    analyzeDynamicImports(sourceFile, currentFilePath, filePaths, impactScores);
  }

  return impactScores;
}

/**
 * Normalise le chemin du fichier pour correspondre aux chemins de FileDetail
 */
function normalizeProjectPath(filePath: string): string {
  return normalizePath(path.relative(process.cwd(), filePath));
}

/**
 * Analyse les déclarations d'import
 */
function analyzeImports(
  sourceFile: SourceFile,
  currentFilePath: string,
  filePaths: Set<string>,
  impactScores: Map<string, number>
): void {
  const imports = sourceFile.getImportDeclarations();
  
  for (const importDecl of imports) {
    try {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      // Skip les modules externes
      if (!moduleSpecifier.startsWith('.')) {
        continue;
      }
      
      // Toujours utiliser la résolution manuelle (plus fiable)
      resolveAndIncrementImpact(moduleSpecifier, currentFilePath, filePaths, impactScores);
    } catch (error) {
      // Ignore les imports dynamiques complexes que ts-morph ne peut pas parser
      continue;
    }
  }
}

/**
 * Analyse les déclarations d'export (re-exports)
 */
function analyzeExports(
  sourceFile: SourceFile,
  currentFilePath: string,
  filePaths: Set<string>,
  impactScores: Map<string, number>
): void {
  const exports = sourceFile.getExportDeclarations();
  
  for (const exportDecl of exports) {
    try {
      const moduleSpecifier = exportDecl.getModuleSpecifierValue();
      
      if (moduleSpecifier && moduleSpecifier.startsWith('.')) {
        resolveAndIncrementImpact(moduleSpecifier, currentFilePath, filePaths, impactScores);
      }
    } catch (error) {
      // Ignore les exports complexes que ts-morph ne peut pas parser
      continue;
    }
  }
}

/**
 * Analyse les imports dynamiques et require()
 */
function analyzeDynamicImports(
  sourceFile: SourceFile,
  currentFilePath: string,
  filePaths: Set<string>,
  impactScores: Map<string, number>
): void {
  // Dynamic imports: import('...')
  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
    try {
      if (callExpr.getExpression().getKind() === SyntaxKind.ImportKeyword) {
        const args = callExpr.getArguments();
        if (args.length > 0) {
          const arg = args[0];
          if (arg.getKind() === SyntaxKind.StringLiteral) {
            const modulePath = arg.getText().slice(1, -1); // Remove quotes
            if (modulePath.startsWith('.')) {
              resolveAndIncrementImpact(modulePath, currentFilePath, filePaths, impactScores);
            }
          }
        }
      }
    } catch (error) {
      // Ignore les dynamic imports complexes
    }
  });
  
  // require() calls
  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(callExpr => {
    try {
      const expr = callExpr.getExpression();
      if (expr.getKind() === SyntaxKind.Identifier && expr.getText() === 'require') {
        const args = callExpr.getArguments();
        if (args.length > 0) {
          const arg = args[0];
          if (arg.getKind() === SyntaxKind.StringLiteral) {
            const modulePath = arg.getText().slice(1, -1); // Remove quotes
            if (modulePath.startsWith('.')) {
              resolveAndIncrementImpact(modulePath, currentFilePath, filePaths, impactScores);
            }
          }
        }
      }
    } catch (error) {
      // Ignore les require() complexes
    }
  });
}


/**
 * Incrémente le score d'impact pour un fichier donné
 */
function incrementImpactScore(
  filePath: string,
  filePaths: Set<string>,
  impactScores: Map<string, number>
): void {
  if (filePaths.has(filePath)) {
    impactScores.set(filePath, (impactScores.get(filePath) ?? 0) + 1);
  }
}

/**
 * Résolution manuelle des chemins (fallback)
 */
function resolveAndIncrementImpact(
  importPath: string,
  importingFile: string,
  filePaths: Set<string>,
  impactScores: Map<string, number>
): void {
  // Skip external modules
  if (!importPath.startsWith('.')) {
    return;
  }
  
  const importingDir = path.dirname(importingFile);
  let resolvedPath = path.resolve(importingDir, importPath);
  resolvedPath = normalizePath(path.relative(process.cwd(), resolvedPath));
  
  // Try exact match first
  if (filePaths.has(resolvedPath)) {
    incrementImpactScore(resolvedPath, filePaths, impactScores);
    return;
  }
  
  // Try different extensions
  const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '/index.ts', '/index.js', '/index.tsx', '/index.jsx'];
  
  for (const ext of possibleExtensions) {
    const pathWithExt = resolvedPath + ext;
    if (filePaths.has(pathWithExt)) {
      incrementImpactScore(pathWithExt, filePaths, impactScores);
      return;
    }
  }
  
  // Special case for TypeScript: .js imports often map to .ts files
  if (importPath.endsWith('.js')) {
    const tsPath = resolvedPath.replace(/\.js$/, '.ts');
    if (filePaths.has(tsPath)) {
      incrementImpactScore(tsPath, filePaths, impactScores);
      return;
    }
  }
}