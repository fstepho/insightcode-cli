// analyzer/ProjectDiscovery.ts - Project root discovery

import * as path from 'path';
import * as fs from 'fs';

/**
 * Project root discovery markers in order of priority
 */
const PROJECT_MARKERS = [
  // Workspace/Monorepo markers (highest priority)
  { file: 'pnpm-workspace.yaml', priority: 100 },
  { file: 'lerna.json', priority: 95 },
  { file: 'rush.json', priority: 95 },
  
  // Git repository marker
  { file: '.git', priority: 90, isDirectory: true },
  
  // Package managers
  { file: 'pnpm-lock.yaml', priority: 85 },
  { file: 'yarn.lock', priority: 80 },
  { file: 'package-lock.json', priority: 75 },
  
  // Configuration files
  { file: 'package.json', priority: 70 },
  { file: 'tsconfig.json', priority: 65 },
  { file: 'jsconfig.json', priority: 60 },
];

interface ProjectRoot {
  path: string;
  marker: string;
  priority: number;
  isMonorepo: boolean;
}

/**
 * Discovers project root with intelligent prioritization
 */
export class ProjectDiscovery {
  
  /**
   * Finds the most likely project root for the given path
   */
  static findProjectRoot(analysisPath: string): string {
    const discovered = this.discoverAllRoots(analysisPath);
    
    if (discovered.length === 0) {
      return path.resolve(analysisPath);
    }
    
    // Return highest priority root
    const bestMatch = discovered.sort((a, b) => b.priority - a.priority)[0];
    return bestMatch.path;
  }
  
  /**
   * Discovers all potential project roots with their priorities
   */
  static discoverAllRoots(analysisPath: string): ProjectRoot[] {
    const roots: ProjectRoot[] = [];
    let currentPath = path.resolve(analysisPath);
    const rootPath = path.parse(currentPath).root;
    
    while (currentPath !== rootPath) {
      for (const marker of PROJECT_MARKERS) {
        const markerPath = path.join(currentPath, marker.file);
        
        if (this.pathExists(markerPath, marker.isDirectory)) {
          roots.push({
            path: currentPath,
            marker: marker.file,
            priority: marker.priority,
            isMonorepo: this.isMonorepoMarker(marker.file)
          });
        }
      }
      
      currentPath = path.dirname(currentPath);
    }
    
    return roots;
  }
  
  /**
   * Checks if a marker indicates a monorepo structure
   */
  private static isMonorepoMarker(markerFile: string): boolean {
    return [
      'pnpm-workspace.yaml',
      'lerna.json', 
      'rush.json'
    ].includes(markerFile);
  }
  
  /**
   * Checks if a path exists with optional directory requirement
   */
  private static pathExists(targetPath: string, mustBeDirectory: boolean = false): boolean {
    try {
      const stats = fs.statSync(targetPath);
      return mustBeDirectory ? stats.isDirectory() : true;
    } catch {
      return false;
    }
  }
}