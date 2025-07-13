// analyzer/ContextGenerator.ts - Analysis context generation

import { Context, FileDetail, DuplicationConfig } from '../types';
import { getProjectInfo } from '../projectInfo';
import { normalizeProjectPath } from '../utils';

/**
 * Generates analysis context metadata
 */
export class ContextGenerator {
  
  static generate(
    projectPath: string,
    fileDetails: FileDetail[],
    startTime: number,
    duplicationConfig: DuplicationConfig
  ): Context {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const projectInfo = this.getProjectInfo(projectPath);
    
    return {
      project: {
        name: projectInfo.name,
        path: projectPath,
        version: projectInfo.version,
        repository: projectInfo.repository
      },
      analysis: this.getAnalysisMetadata(fileDetails, duration, duplicationConfig)
    };
  }
  
  /**
   * Retrieves project information
   */
  private static getProjectInfo(projectPath: string) {
    try {
      const info = getProjectInfo(projectPath);
      return {
        name: info.name,
        version: info.packageJson?.version || 'unknown',
        repository: typeof info.packageJson?.repository === 'string' 
          ? info.packageJson.repository 
          : info.packageJson?.repository?.url
      };
    } catch (error) {
      // Fallback project info if package.json is missing or corrupted
      return {
        name: normalizeProjectPath(projectPath),
        version: 'unknown',
        repository: undefined
      };
    }
  }
  
  /**
   * Creates analysis metadata
   */
  private static getAnalysisMetadata(
    fileDetails: FileDetail[],
    duration: number,
    duplicationConfig: DuplicationConfig
  ) {
    return {
      timestamp: new Date().toISOString(),
      durationMs: duration,
      toolVersion: require('../../package.json').version,
      filesAnalyzed: fileDetails.length,
      duplicationMode: duplicationConfig.mode
    };
  }
  
}