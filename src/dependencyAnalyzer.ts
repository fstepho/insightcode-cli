// File: src/dependencyAnalyzer.ts

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { FileMetrics } from './types';

/**
 * Analyse les dépendances d'un projet pour calculer l'impact de chaque fichier.
 * L'impact correspond au nombre de fois qu'un fichier est importé par d'autres.
 * @param files - La liste des fichiers du projet.
 * @returns Une Map<filePath, impactScore>.
 */
export function analyzeDependencies(files: FileMetrics[]): Map<string, number> {
  const filePaths = new Set(files.map(f => f.path));
  const impactScores = new Map<string, number>();
  files.forEach(f => impactScores.set(f.path, 0)); // Initialise l'impact à 0

  for (const file of files) {
    const sourceFile = ts.createSourceFile(
      file.path,
      fs.readFileSync(file.path, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );

    const visit = (node: ts.Node) => {
      // Gère `import ... from '...'` et `export ... from '...'`
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          resolveAndIncrementImpact(node.moduleSpecifier.text, file.path);
        }
      }
      // Gère `const ... = require('...')`
      if (ts.isCallExpression(node) && node.expression.getText() === 'require' && node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
        resolveAndIncrementImpact(node.arguments[0].text, file.path);
      }
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
  }
  
  /**
   * Tente de résoudre le chemin d'un module importé et incrémente son score d'impact.
   * @param importPath - Le chemin du module tel qu'il apparaît dans l'import (ex: './utils').
   * @param importingFile - Le chemin du fichier qui effectue l'import.
   */
  function resolveAndIncrementImpact(importPath: string, importingFile: string): void {
    try {
      const resolvedPath = require.resolve(importPath, {
        paths: [path.dirname(importingFile)],
      });
      const relativePath = path.relative(process.cwd(), resolvedPath);
      
      // On incrémente seulement si le fichier fait partie du projet analysé
      if (filePaths.has(relativePath)) {
        impactScores.set(relativePath, (impactScores.get(relativePath) ?? 0) + 1);
      }
    } catch (e) {
      // Ignore les modules non résolus (ex: 'react', 'fs', etc.)
    }
  }

  return impactScores;
}