#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult, EmblematicFiles, ReportResult, ReportSummary, ThresholdConfig } from '../src/types';
import { analyze, AnalysisOptions } from './analyzer';
import { getConfig } from './config.manager';
import { generateAllIndividualReports, generateMarkdownReport } from './report-generator';
import { execa, ExecaError } from 'execa';

// --- INTERFACES ---
interface Project {
  name: string;
  repo: string;
  description: string;
  type: string;
  category: 'small' | 'medium' | 'large';
  stars: string;
  stableVersion: string;
  sourcePath?: string; // Chemin relatif vers le code source à analyser
  emblematicFiles: EmblematicFiles;
}


// Projects to analyze organized by size
const PROJECTS: Project[] = [
  {
    name: 'lodash',
    repo: 'https://github.com/lodash/lodash.git',
    description: 'JavaScript utility library',
    type: 'utility library',
    stars: '60.6k',
    stableVersion: '4.17.21',
    category: 'small',
    emblematicFiles: {
      coreFiles: [
        'lodash.js',
        'index.js'
      ],
      architecturalFiles: [
        'fp.js',
        'core.js'
      ],
      performanceCriticalFiles: [
        'isEqual.js',
        'cloneDeep.js',
        'debounce.js'
      ],
      complexAlgorithmFiles: [
        'get.js',
        'set.js',
        'merge.js'
      ]
    }
  },
  {
    name: 'chalk',
    repo: 'https://github.com/chalk/chalk.git',
    description: 'Terminal string styling library',
    type: 'utility library',
    stars: '22.3k',
    stableVersion: 'v5.4.1',
    category: 'small',
    emblematicFiles: {
      coreFiles: [
        'source/index.js',
        'index.js'
      ],
      architecturalFiles: [
        'source/templates.js'
      ],
      performanceCriticalFiles: [
        'source/utilities.js'
      ],
      complexAlgorithmFiles: [
        'source/vendor/ansi-styles/index.js'
      ]
    }
  },
  {
    name: 'uuid',
    repo: 'https://github.com/uuidjs/uuid.git',
    description: 'UUID generation library',
    type: 'utility library',
    stars: '15k',
    stableVersion: 'v11.1.0',
    category: 'small',
    emblematicFiles: {
      coreFiles: [
        'dist/index.js',
        'src/index.js'
      ],
      architecturalFiles: [
        'src/v1.js',
        'src/v4.js'
      ],
      performanceCriticalFiles: [
        'src/rng.js'
      ],
      complexAlgorithmFiles: [
        'src/v3.js',
        'src/v5.js'
      ]
    }
  },
  {
    name: 'express',
    repo: 'https://github.com/expressjs/express.git',
    description: 'Fast web framework for Node.js',
    type: 'web framework',
    stars: '66.2k',
    stableVersion: 'v5.1.0',
    category: 'medium',
    emblematicFiles: {
      coreFiles: [
        'lib/application.js',
        'lib/express.js',
        'lib/router/index.js'
      ],
      architecturalFiles: [
        'lib/middleware/init.js',
        'lib/view.js'
      ],
      performanceCriticalFiles: [
        'lib/router/layer.js',
        'lib/router/route.js'
      ],
      complexAlgorithmFiles: [
        'lib/utils.js',
        'lib/request.js',
        'lib/response.js'
      ]
    }
  },
  {
    name: 'vue',
    repo: 'https://github.com/vuejs/core.git',
    description: 'Progressive JavaScript framework',
    type: 'frontend framework',
    stars: '50.7k',
    stableVersion: 'v3.5.17',
    category: 'medium',
    sourcePath: 'packages', // Analyser packages/ au lieu de la racine
    emblematicFiles: {
      coreFiles: [
        'packages/runtime-core/src/component.ts',
        'packages/runtime-core/src/renderer.ts',
        'packages/reactivity/src/reactive.ts'
      ],
      architecturalFiles: [
        'packages/compiler-core/src/compile.ts',
        'packages/runtime-core/src/apiCreateApp.ts'
      ],
      performanceCriticalFiles: [
        'packages/runtime-core/src/scheduler.ts',
        'packages/reactivity/src/effect.ts'
      ],
      complexAlgorithmFiles: [
        'packages/compiler-core/src/transform.ts',
        'packages/runtime-core/src/componentRenderContext.ts'
      ]
    }
  },
  {
    name: 'jest',
    repo: 'https://github.com/jestjs/jest.git',
    description: 'JavaScript testing framework',
    type: 'testing framework',
    stars: '44.8k',
    stableVersion: 'v30.0.4',
    category: 'medium',
    sourcePath: 'packages', // Analyser packages/ au lieu de la racine
    emblematicFiles: {
      coreFiles: [
        'packages/jest-core/src/index.ts',
        'packages/jest-cli/src/index.ts'
      ],
      architecturalFiles: [
        'packages/jest-core/src/config.ts',
        'packages/jest-cli/src/cli.ts'
      ],
      performanceCriticalFiles: [
        'packages/jest-core/src/test_runner.ts',
        'packages/jest-cli/src/reporters.ts'
      ],
      complexAlgorithmFiles: [
        'packages/jest-core/src/transform.ts',
        'packages/jest-cli/src/utils.ts'
      ]
    }
  },
  {
    name: 'angular',
    repo: 'https://github.com/angular/angular.git',
    description: 'Platform for building mobile and desktop web apps',
    type: 'UI framework',
    stars: '98k',
    stableVersion: '19.2.14',
    category: 'large',
    sourcePath: 'packages', // Analyser packages/ au lieu de la racine
    emblematicFiles: {
      coreFiles: [
        'packages/core/src/application/application_ref.ts',
        'packages/core/src/render3/component.ts',
        'packages/core/src/di/injector.ts'
      ],
      architecturalFiles: [
        'packages/core/src/change_detection/change_detection.ts',
        'packages/core/src/render3/view_engine_compatibility.ts',
        'packages/router/src/router.ts'
      ],
      performanceCriticalFiles: [
        'packages/core/src/render3/instructions/shared.ts',
        'packages/core/src/change_detection/differs/default_iterable_differ.ts',
        'packages/platform-browser/src/dom/dom_renderer.ts'
      ],
      complexAlgorithmFiles: [
        'packages/core/src/render3/node_manipulation.ts',
        'packages/common/src/i18n/locale_data_api.ts'
      ]
    }
  },
  {
    name: 'eslint',
    repo: 'https://github.com/eslint/eslint.git',
    description: 'JavaScript linter',
    type: 'code analysis tool',
    stars: '26k',
    stableVersion: 'v9.30.1',
    category: 'large',
    emblematicFiles: {
      coreFiles: [
        'lib/linter/linter.js',
        'lib/eslint/eslint.js',
        'lib/cli-engine/cli-engine.js'
      ],
      architecturalFiles: [
        'lib/config/config-array-factory.js',
        'lib/rule-tester/rule-tester.js'
      ],
      performanceCriticalFiles: [
        'lib/source-code/source-code.js',
        'lib/linter/node-event-generator.js'
      ],
      complexAlgorithmFiles: [
        'lib/linter/code-path-analysis/code-path-analyzer.js',
        'lib/config/flat-config-array.js'
      ]
    }
  },
  {
    name: 'typescript',
    type: 'language compiler',
    repo: 'https://github.com/microsoft/TypeScript.git',
    description: 'TypeScript language compiler',
    stars: '104k',
    stableVersion: 'v5.8.3',
    category: 'large',
    sourcePath: 'src', // Analyser src/ au lieu de la racine
    emblematicFiles: {
      coreFiles: [
        'src/compiler/checker.ts',
        'src/compiler/parser.ts',
        'src/compiler/binder.ts'
      ],
      architecturalFiles: [
        'src/compiler/program.ts',
        'src/compiler/builder.ts',
        'src/services/services.ts'
      ],
      performanceCriticalFiles: [
        'src/compiler/transformers/ts.ts',
        'src/compiler/emitter.ts',
        'src/compiler/scanner.ts'
      ],
      complexAlgorithmFiles: [
        'src/compiler/types.ts',
        'src/compiler/utilities.ts'
      ]
    }
  }
]

// Ensure we're in the right directory

const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');
const TEMP_DIR = path.join(projectRoot, 'temp-analysis');
const RESULTS_DIR = path.join(projectRoot, 'benchmarks');

// Parse command line arguments
const args = process.argv.slice(2);
const production = args.includes('--production');
const sequential = args.includes('--sequential');

// --- UTILITY FUNCTIONS ---

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}


/**
 * Calculate average duplication from analysis
 */
function getAverageDuplication(analysis: AnalysisResult): number {
  if (analysis.details.length === 0) return 0;
  const totalDup = analysis.details.reduce((sum, d) => sum + d.metrics.duplicationRatio, 0);
  return totalDup / analysis.details.length;
}

/**
 * Prépare le dépôt du projet, en le clonant si nécessaire ou en le mettant à jour.
 * @param project - L'objet projet à préparer.
 * @param projectTempDir - Le répertoire temporaire pour le code source.
 * @param timestamp - Une fonction pour obtenir un timestamp formaté pour les logs.
 */
async function prepareRepository(project: Project, projectTempDir: string, timestamp: () => string): Promise<void> {
  console.log(`  🔄 [${timestamp()}] Preparing repository...`);
  if (fs.existsSync(projectTempDir)) {
    console.log(`  [${timestamp()}] Repository cache found. Fetching latest changes...`);
    try {
      // Utilisation de execa serait préférable ici
      runCommand('git', ['fetch'], { cwd: projectTempDir });
      runCommand('git', ['reset', '--hard', project.stableVersion], { cwd: projectTempDir });
    } catch (error) {
      console.log(`  ⚠️  [${timestamp()}] Git fetch failed, removing cache and cloning fresh...`);
      fs.rmSync(projectTempDir, { recursive: true, force: true });
      runCommand('git', ['clone', '--depth', '1', '--branch', project.stableVersion, project.repo, projectTempDir]);
    }
  } else {
    console.log(`  📥 [${timestamp()}] Cloning repository (${project.stableVersion})...`);
    runCommand('git', ['clone', '--depth', '1', '--branch', project.stableVersion, project.repo, projectTempDir]);
  }
}

/**
 * Détermine le chemin de répertoire à analyser en fonction de la configuration du projet et des options.
 * @param project - L'objet projet.
 * @param projectTempDir - Le répertoire de base du projet cloné.
 * @param production - Flag pour exclure les fichiers utilitaires.
 * @returns Un objet contenant le chemin d'analyse et des informations pour les logs.
 */
function determineAnalysisPath(project: Project, projectTempDir: string, production: boolean): { analysisPath: string, pathInfo: string, pathMode: string } {
  const analysisPath = (production && project.sourcePath)
    ? path.join(projectTempDir, project.sourcePath)
    : projectTempDir;

  const pathInfo = path.relative(projectTempDir, analysisPath) || '.';
  const pathMode = production ?
    (project.sourcePath ? `production scope: ${pathInfo}` : 'production scope: full repo') :
    'full repo (sourcePath ignored)';

  return { analysisPath, pathInfo, pathMode };
}

/**
 * Exécute le moteur d'analyse sur les fichiers d'un projet.
 * @param analysisPath - Le chemin exact du répertoire à analyser.
 * @param projectTempDir - Le chemin de base du projet (pour le contexte de l'analyse).
 * @param thresholds - La configuration des seuils de qualité.
 * @param production - Flag pour exclure les fichiers utilitaires.
 * @param timestamp - Une fonction pour obtenir un timestamp formaté pour les logs.
 * @returns Le résultat brut de l'analyse.
 */
async function runProjectAnalysis(
  analysisPath: string,
  projectTempDir: string,
  thresholds: ThresholdConfig,
  production: boolean,
  timestamp: () => string
): Promise<AnalysisResult> {
  console.log(`  � [${timestamp()}] Building AST and analyzing...`);
  
  const analysisOptions: AnalysisOptions = {
    format: 'markdown', // Default format for CLI
    projectPath: projectTempDir,
    thresholds,
    production,
    strictDuplication: false
  };
  
  const results = await analyze(analysisPath, analysisOptions);
  console.log(`  📊 [${timestamp()}] Analysis completed`);

  return results;
}

/**
 * Orchestre l'analyse complète d'un projet, de la préparation du code à la finalisation des résultats.
 * @param project - Le projet à analyser.
 * @param index - L'index du projet dans la liste totale.
 * @param total - Le nombre total de projets à analyser.
 * @returns Une promesse résolue avec le résultat complet du benchmark pour le projet.
 */
async function analyzeProject(project: Project, index: number, total: number): Promise<ReportResult> {
  const startTime = Date.now();
  const projectTempDir = path.join(TEMP_DIR, project.name);
  const timestamp = () => new Date().toISOString().substring(11, 23); // HH:mm:ss.sss

  console.log(`\n📊 [${index}/${total}] [${timestamp()}] Starting ${project.name}...`);

  try {
    // 1. Préparation du code source
    await prepareRepository(project, projectTempDir, timestamp);

    // 2. Détermination des chemins et configuration
    console.log(`  🔍 [${timestamp()}] Starting direct analysis...`);
    const thresholds = getConfig();
    const { analysisPath, pathInfo, pathMode } = determineAnalysisPath(project, projectTempDir, production);
    console.log(`  📁 [${timestamp()}] Analysis path: ${pathInfo} (${pathMode})`);

    // 3. Exécution du moteur d'analyse
    const analysisResult = await runProjectAnalysis(
      analysisPath,
      projectTempDir,
      thresholds,
      production,
      timestamp
    );

    // 4. Nettoyage des résultats
    const analysis = analysisResult; // Paths are already normalized at source

    const duration = Date.now() - startTime;
    console.log(`  ✅ [${index}/${total}] [${timestamp()}] ${project.name} completed in ${(duration / 1000).toFixed(2)}s`);

    // 5. Construction de l'objet de résultat final
    return {
      project: project.name,
      repo: project.repo,
      type: project.type,
      stars: project.stars,
      stableVersion: project.stableVersion,
      description: project.description,
      category: project.category,
      emblematicFiles: project.emblematicFiles,
      analysis: analysis as AnalysisResult, // L'alias AnalysisResult peut être supprimé
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ [${index}/${total}] [${timestamp()}] ${project.name} failed: ${errorMessage.substring(0, 300)}...`);

    // Retourner un objet d'erreur cohérent
    return {
      project: project.name,
      repo: project.repo,
      type: project.type,
      stars: project.stars,
      stableVersion: project.stableVersion,
      description: project.description,
      category: project.category,
      emblematicFiles: project.emblematicFiles,
      analysis: {} as AnalysisResult,
      durationMs: duration,
      error: errorMessage,
    };
  }
}

async function main(): Promise<void> {
  console.log(`\n🚀 InsightCode Benchmark Tool`);
  console.log(`📊 Analyzing ${Object.values(PROJECTS).flat().length} popular JavaScript/TypeScript projects`);

  if (production) {
    console.log(`⚙️  Mode: Production Only (excluding test/utility files)`);
  } else {
    console.log(`⚙️  Mode: Full Analysis (all files)`);
  }
  console.log(`🧠 Code Context: Enabled (extracting detailed AST data)`);
  
  if (sequential) {
    console.log(`🔄 Execution Mode: Sequential (one project at a time)`);
  } else {
    console.log(`⚡ Execution Mode: Parallel (all projects simultaneously)`);
  }

  console.log(`📁 Results will be saved to: ${RESULTS_DIR}\n`);

  let settledResults: PromiseSettledResult<ReportResult>[];

  if (sequential) {
    // Sequential execution
    console.log(`🔄 Running projects sequentially...`);
    const results: ReportResult[] = [];
    for (let i = 0; i < PROJECTS.length; i++) {
      const project = PROJECTS[i];
      try {
        const result = await analyzeProject(project, i + 1, PROJECTS.length);
        results.push(result);
      } catch (error) {
        console.error(`❌ Critical error in sequential execution for ${project.name}:`, error);
        results.push({
          project: project.name,
          repo: project.repo,
          type: project.type,
          stars: project.stars,
          stableVersion: project.stableVersion,
          description: project.description,
          category: project.category,
          emblematicFiles: project.emblematicFiles,
          analysis: {} as AnalysisResult,
          durationMs: 0,
          error: 'Critical failure in sequential execution'
        });
      }
    }
    settledResults = results.map(r => ({ status: 'fulfilled' as const, value: r }));
  } else {
    // Parallel execution
    console.log(`⚡ Running projects in parallel...`);
    const analysisPromises = PROJECTS.map((project, index) => analyzeProject(project, index + 1, PROJECTS.length));
    settledResults = await Promise.allSettled(analysisPromises);
  }

  const results: ReportResult[] = settledResults.map((res, index) => {
    const project = PROJECTS[index]; // Récupérer le projet correspondant
    if (res.status === 'fulfilled') {
      return res.value;
    }
    // If promise was rejected, log error and return error object
    console.error(`❌ A critical error occurred during analysis of ${project.name}:`, res.reason);
    // Reconstruct a partial ReportResult object for the report
    return {
      project: project.name,
      repo: project.repo,
      type: project.type,
      stars: project.stars,
      stableVersion: project.stableVersion,
      description: project.description,
      category: project.category,
      emblematicFiles: project.emblematicFiles,
      analysis: {} as AnalysisResult,
      durationMs: 0,
      error: 'Critical failure in promise'
    } as ReportResult;
  });

  const now = new Date();
  const dateSuffix = '-' + now.toISOString().slice(0, 10);
  const modeSuffix = production ? '-prod' : '-full';
  
   // Save individual results
  results.forEach(result => {
    if(!result.project || result.project === 'Unknown') return;
    const resultFilename = `${result.project}-analysis-result${modeSuffix}${dateSuffix}.json`;
    fs.writeFileSync(path.join(RESULTS_DIR + '/individual-reports', resultFilename), 
    JSON.stringify(result, function(_key, val) {
      return val && val.toFixed ? Number(val.toFixed(2)) : val;
    }, 2));
  });

  // Calculate summary
  const successfulResults = results.filter(r => !r.error);
  const summary: ReportSummary = {
    totalProjects: results.length,
    successfulAnalyses: successfulResults.length,
    failedAnalyses: results.filter(r => r.error).length,
    totalDuration: results.reduce((sum, r) => sum + r.durationMs, 0), // Temps cumulé
    realDuration: Math.max(...results.map(r => r.durationMs)), // Temps réel parallèle
    totalLines: successfulResults.reduce((sum, r) => sum + r.analysis.overview.statistics.totalLOC, 0),
    avgComplexity: successfulResults.reduce((sum, r) => sum + r.analysis.overview.statistics.avgComplexity, 0) / successfulResults.length,
    avgDuplication: successfulResults.reduce((sum, r) => sum + getAverageDuplication(r.analysis), 0) / successfulResults.length,
    gradeDistribution: successfulResults.reduce((dist, r) => {
      dist[r.analysis.overview.grade] = (dist[r.analysis.overview.grade] || 0) + 1;
      return dist;
    }, {} as Record<string, number>),
    modeCategory: production ? 'production' : 'full'
  };


  // Generate and save markdown report
  const markdown = generateMarkdownReport(results, summary, production);
  const markdownFilename = `benchmark-report${modeSuffix}${dateSuffix}.md`;
  fs.writeFileSync(
    path.join(RESULTS_DIR, markdownFilename),
    markdown
  );

  // NOUVEAU : Générer les rapports individuels
  console.log(`\n📝 Generating individual project reports...`);
  generateAllIndividualReports(results, RESULTS_DIR + '/individual-reports', production);

  // Save summary
  const summaryFilename = `benchmark-summary${modeSuffix}${dateSuffix}.json`;
  fs.writeFileSync(
    path.join(RESULTS_DIR, summaryFilename),
    JSON.stringify(summary, function (_key, val) {
      return val && val.toFixed ? Number(val.toFixed(2)) : val;
    }, 2)
  );

  // Print summary
  console.log(`\n✅ Benchmark completed!`);
  console.log(`📊 Summary:`);
  console.log(`  - Success rate: ${summary.successfulAnalyses}/${summary.totalProjects}`);
  console.log(`  - Total lines analyzed: ${formatNumber(summary.totalLines)}`);
  console.log(`  - Real duration: ${(summary.realDuration / 1000).toFixed(2)}s`);
  console.log(`  - Analysis speed: ${formatNumber(Math.round(summary.totalLines / (summary.realDuration / 1000)))} lines/second`);
  console.log(`  - Average complexity: ${summary.avgComplexity.toFixed(2)}`);
  console.log(`  - Average duplication: ${(summary.avgDuplication * 100).toFixed(2)}%`);
  console.log(`  - Grade distribution: ${Object.entries(summary.gradeDistribution).map(([g, c]) => `${g}:${c}`).join(', ')}`);
  console.log(`\n📁 Results saved to: ${RESULTS_DIR}`);
}

async function runCommand(command: string, args: string[], options?: { cwd: string }): Promise<string> {
  try {
    const { stdout } = await execa(command, args, options);
    return stdout;
  } catch (error) {
    if (error instanceof ExecaError) {
      throw new Error(`Command failed: ${command} ${args.join(' ')}\n${error.shortMessage}\n${error.stderr}`);
    }
    throw error;
  }
}

/**
 * Format a number for display with commas.
 */
function formatNumber(num: number): string {
  return num.toLocaleString();
}


// Run the benchmark
main();