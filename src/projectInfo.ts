// File: src/projectInfo.ts

import * as fs from 'fs';
import * as path from 'path';

/**
 * Simplified interface for package.json fields we use
 */
interface PackageJson {
  name?: string;
  version?: string;
  description?: string;
  repository?: string | { type?: string; url?: string };
}

/**
 * Get project information from a given directory path.
 * Reads package.json to extract project name, version, and description.
 * @param projectPath The path to the project directory.
 * @returns An object with project information.
 */
export function getProjectInfo(projectPath: string) {
  const absolutePath = path.resolve(projectPath);
  const projectName = path.basename(absolutePath);
  
  // Make path relative to current working directory for cleaner display
  const relativePath = path.relative(process.cwd(), absolutePath) || '.';
  
  let packageJson: PackageJson | undefined;
  try {
    const packagePath = path.join(absolutePath, 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageContent = fs.readFileSync(packagePath, 'utf-8');
      packageJson = JSON.parse(packageContent) as PackageJson;
    }
  } catch (error) {
    // Silently ignore package.json parsing errors
    console.warn(`Warning: Could not parse package.json at ${projectPath}`);
  }

  return {
    name: packageJson?.name || projectName,
    path: relativePath,
    packageJson: packageJson ? {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      repository: packageJson.repository
    } : undefined
  };
}
