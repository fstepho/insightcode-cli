// File: src/analyzer.ts - Analysis orchestrator with pipeline architecture

import * as path from 'path';
import { 
  AnalysisResult, 
  FileDetail,
  Context,
  Overview,
  AnalysisOptions,
  validateScore
} from './types';

// Export AnalysisOptions for other modules
export { AnalysisOptions } from './types';
import { astBuilder, ASTBuildOptions, ASTBuildResult } from './ast-builder';
import { fileDetailBuilder, FileDetailBuildOptions } from './file-detail-builder';
import { detectDuplication } from './duplication';
import { UniversalDependencyAnalyzer } from './dependency-analyzer';
import { calculateFileHealthScore } from './scoring';
// createDuplicationConfig removed - use mode string directly
// config.manager removed - using global configurations from scoring.utils.ts
import { OverviewCalculator } from './analyzer/OverviewCalculator';
import { ContextGenerator } from './analyzer/ContextGenerator';
import { ProjectDiscovery } from './analyzer/ProjectDiscovery';


/**
 * Analysis context shared across pipeline steps
 */
class AnalysisContext {
  constructor(
    public readonly inputPath: string,
    public readonly options: AnalysisOptions,
    public readonly startTime: number = Date.now()
  ) {}
  
  // Results from each step
  astData?: ASTBuildResult;
  rawFileDetails?: FileDetail[];
  processedFileDetails?: FileDetail[];
  overview?: Overview;
  context?: Context;
}

/**
 * Main analysis orchestrator with pipeline architecture
 * 
 * Flow:
 * 1. Build AST from source files
 * 2. Extract file details from AST
 * 3. Process metrics (duplication, dependencies, file health scores)
 * 4. Calculate overview scores
 * 5. Generate context metadata
 * 6. Assemble final result
 */
export async function analyze(
  inputPath: string,
  options: AnalysisOptions
): Promise<AnalysisResult> {
  const context = new AnalysisContext(inputPath, options);
  
  try {
    // Execute pipeline steps
    await executeASTBuildStep(context);
    await executeFileDetailStep(context);
    await executeMetricsProcessingStep(context);
    await executeOverviewCalculationStep(context);
    await executeContextGenerationStep(context);
    
    return assembleResult(context);
    
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

/**
 * Step 1: Build AST from source files
 */
async function executeASTBuildStep(context: AnalysisContext): Promise<void> {  
  const astBuildOptions: ASTBuildOptions = {
    production: context.options.production
  };
  
  context.astData = await astBuilder.build(context.inputPath, astBuildOptions);
  if (context.options.format === 'terminal') {
    console.log(`📁 Found ${context.astData.totalFiles} files`);
  }
}

/**
 * Step 2: Extract file details from AST
 */
async function executeFileDetailStep(context: AnalysisContext): Promise<void> {
  if (context.options.format === 'terminal') {
    console.log('📊 Extracting file details...');
  }

  if (!context.astData) throw new Error('AST data not available');
  const options: FileDetailBuildOptions = {
    projectPath: context.inputPath
  };
  context.rawFileDetails = await fileDetailBuilder.build(context.astData, options);
}

/**
 * Step 3: Process metrics (duplication, dependencies, file health scores)
 * 
 * Processing flow:
 * 1. Detect duplication using 8-line sliding window algorithm
 * 2. Analyze dependencies with universal resolver and circular detection
 * 3. Calculate file health scores using progressive penalties (no artificial caps)
 */
async function executeMetricsProcessingStep(context: AnalysisContext): Promise<void> {
  if (context.options.format === 'terminal') {
    console.log('⚙️  Processing metrics...');
  }

  if (!context.rawFileDetails || !context.astData) {
    throw new Error('Raw file details or AST data not available');
  }
  
  // 1. Detect duplication
  const duplicationMode = context.options.strictDuplication ? 'strict' : 'legacy';
  const filesWithDuplication = detectDuplication(context.rawFileDetails, duplicationMode);
  
  // 2. Analyze dependencies  
  // Use ProjectDiscovery only if the input path doesn't have its own project markers
  const resolvedInputPath = path.resolve(context.inputPath);
  const discoveredRoot = ProjectDiscovery.findProjectRoot(context.inputPath);
  
  // If user explicitly specified a path different from the discovered root,
  // respect their choice (they might want to analyze a specific subfolder)
  const analysisProjectRoot = (discoveredRoot === resolvedInputPath) 
                              ? discoveredRoot 
                              : resolvedInputPath;
  
  const dependencyAnalyzer = new UniversalDependencyAnalyzer({
    projectRoot: analysisProjectRoot,
    analyzeCircularDependencies: true,
    analyzeDynamicImports: true,
    cache: true,
    timeout: 90000,
    logResolutionErrors: false
  });
  
  const dependencyAnalysisResult = await dependencyAnalyzer.analyze(filesWithDuplication, context.astData);
  
  // 3. Update dependencies and calculate file health scores
  context.processedFileDetails = filesWithDuplication.map(file => {
    const dependencies = dependencyAnalysisResult.fileAnalyses.get(file.file) || {
      incomingDependencies: 0,
      outgoingDependencies: 0,
      instability: 0,
      cohesionScore: 0,
      percentileUsageRank: 0,
      isInCycle: false
    };
    
    const healthScore = validateScore(calculateFileHealthScore(file, duplicationMode));
    
    return {
      ...file,
      dependencies,
      healthScore
    };
  });
}

/**
 * Step 4: Calculate overview scores using criticism-based weighted methodology
 * 
 * Methodology:
 * - Files with higher "criticism scores" get more weight in final calculations
 * - Follows Pareto principle (20% of files cause 80% of problems)
 * - Three-dimensional scoring: Complexity (45%) + Maintainability (30%) + Duplication (25%)
 * - No outlier masking - extreme values receive extreme penalties
 */
async function executeOverviewCalculationStep(context: AnalysisContext): Promise<void> {
  if (context.options.format === 'terminal') {
    console.log('📈 Calculating overview...');
  }

  if (!context.processedFileDetails) {
    throw new Error('Processed file details not available');
  }
  
  const duplicationMode = context.options.strictDuplication ? 'strict' : 'legacy';
  context.overview = OverviewCalculator.calculate(context.processedFileDetails, duplicationMode);
}


/**
 * Step 6: Generate analysis context metadata
 */
async function executeContextGenerationStep(context: AnalysisContext): Promise<void> {
  if (!context.processedFileDetails) {
    throw new Error('Processed file details not available');
  }
  
  const duplicationMode = context.options.strictDuplication ? 'strict' : 'legacy';
  context.context = ContextGenerator.generate(
    context.options.projectPath,
    context.processedFileDetails,
    context.startTime,
    duplicationMode
  );
}

/**
 * Assembles final analysis result
 */
function assembleResult(context: AnalysisContext): AnalysisResult {
  if (!context.processedFileDetails || !context.overview || !context.context) {
    throw new Error('Required analysis data not available');
  }
  
  return {
    details: context.processedFileDetails,
    overview: context.overview,
    context: context.context
  };
}
