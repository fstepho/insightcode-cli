#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult, FileMetrics } from '../src/types';

// --- INTERFACES (inchangées) ---
interface EmblematicFiles {
  coreFiles: string[];
  architecturalFiles: string[];
  performanceCriticalFiles: string[];
  complexAlgorithmFiles: string[];
}

interface Project {
  name: string;
  repo: string;
  description: string;
  type: string;
  category: 'small' | 'medium' | 'large';
  stars: string;
  stableVersion: string;
  emblematicFiles: EmblematicFiles;
}

interface BenchmarkResult {
  project: string;
  repo: string;
  type: string;
  stars: string;
  stableVersion: string;
  description: string;
  category: 'small' | 'medium' | 'large';
  emblematicFiles: EmblematicFiles;
  analysis: AnalysisResult;
  duration: number;
  error?: string;
}

interface Summary {
  totalProjects: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  totalDuration: number;
  totalLines: number;
  avgComplexity: number;
  avgDuplication: number;
  gradeDistribution: Record<string, number>;
  modeCategory: 'production' | 'full';
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
    name: 'react',
    repo: 'https://github.com/facebook/react.git',
    description: 'JavaScript library for building UIs',
    type: 'UI framework',
    stars: '235k',
    stableVersion: 'v19.1.0',
    category: 'large',
    emblematicFiles: {
      coreFiles: [
        'packages/react/src/React.js',
        'packages/react-dom/src/ReactDOM.js',
        'packages/react-reconciler/src/ReactFiberReconciler.js'
      ],
      architecturalFiles: [
        'packages/react-reconciler/src/ReactFiberWorkLoop.js',
        'packages/react-reconciler/src/ReactFiberBeginWork.js',
        'packages/react-reconciler/src/ReactFiberCompleteWork.js'
      ],
      performanceCriticalFiles: [
        'packages/react-reconciler/src/ReactFiberCommitWork.js',
        'packages/react-reconciler/src/ReactFiberHooks.js',
        'packages/scheduler/src/Scheduler.js'
      ],
      complexAlgorithmFiles: [
        'packages/react-reconciler/src/ReactChildFiber.js',
        'packages/react-reconciler/src/ReactFiberLane.js'
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
  },
]

// Ensure we're in the right directory

const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');
const TEMP_DIR = path.join(projectRoot, 'temp-analysis');
const RESULTS_DIR = path.join(projectRoot, 'benchmarks');

// Parse command line arguments
const args = process.argv.slice(2);
const excludeUtility = args.includes('--exclude-utility');
const withContext = args.includes('--with-context');
// --- FONCTIONS UTILITAIRES ---

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function runCommand(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: 'pipe', // Capture stdout only
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, // Disable colors
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large projects
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Command failed: ${command}\n${errorMessage}`);
  }
}
/**
 * Formate un nombre pour l'affichage avec des virgules.
 * @param num Le nombre à formater.
 * @returns Le nombre formaté en chaîne de caractères.
 */
function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Analyse un projet de manière asynchrone.
 * Gère le cache, le clonage, l'analyse et le nettoyage.
 */
async function analyzeProject(project: Project, index: number, total: number): Promise<BenchmarkResult> {
  const startTime = Date.now();
  const projectTempDir = path.join(TEMP_DIR, project.name);
  console.log(`\n📊 [${index}/${total}] Analyzing ${project.name}...`);

  try {
    // **AMÉLIORATION : GESTION DU CACHE**
    if (fs.existsSync(projectTempDir)) {
      console.log(`  🔄 Repository cache found. Fetching latest changes...`);
      runCommand(`git fetch`, projectTempDir);
    } else {
      console.log(`  📥 Cloning repository (${project.stableVersion})...`);
      runCommand(`git clone --depth 1 --branch ${project.stableVersion} ${project.repo} "${projectTempDir}"`);
    }
    // Pas besoin de `git checkout` ici si on clone directement la bonne branche/tag

    console.log(`  🔍 Running analysis...`);
    const flags = ['--json'];
    if (excludeUtility) {
      flags.push('--exclude-utility');
    }
    if (withContext) {
      flags.push('--with-context');
    }
    const command = `node ${path.join(projectRoot, 'dist/cli.js')} analyze "${projectTempDir}" ${flags.join(' ')}`;
    const analysisOutput = runCommand(command, projectRoot);
    const analysis: AnalysisResult = JSON.parse(analysisOutput);

    // On calcule le chemin relatif du dossier temporaire par rapport à la racine du projet.
    // Cela nous donne le préfixe exact à enlever (ex: "temp-analysis/react").
    const prefixToRemove = path.relative(projectRoot, projectTempDir);

    const cleanPath = (p: string) => {
        // On s'assure d'échapper les séparateurs de chemin pour la regex
        const escapedPrefix = prefixToRemove.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return p.replace(new RegExp(`^${escapedPrefix}[\\\/]`), '');
    };
    analysis.files.forEach(file => (file.path = cleanPath(file.path)));
    analysis.topFiles.forEach(file => (file.path = cleanPath(file.path)));
    analysis.silentKillers.forEach(file => (file.path = cleanPath(file.path)));
    
    const duration = Date.now() - startTime;
    console.log(`  ✅ [${index}/${total}] ${project.name} completed in ${(duration / 1000).toFixed(2)}s`);

    return {
      project: project.name,
      repo: project.repo,
      type: project.type,
      stars: project.stars,
      stableVersion: project.stableVersion,
      description: project.description,
      category: project.category,
      emblematicFiles: project.emblematicFiles,
      analysis,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ [${index}/${total}] ${project.name} failed: ${errorMessage.substring(0, 300)}...`);

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
      duration,
      error: errorMessage,
    };
  }
}

/**
 * Generates the full Markdown report with all advanced sections.
 * @param results - The array of successful benchmark results.
 * @param summary - The calculated summary object.
 * @returns A string containing the full Markdown report.
 */
function generateMarkdownReport(results: BenchmarkResult[], summary: Summary): string {
    const timestamp = new Date().toISOString();
    const mode = excludeUtility ? 'Production Code' : 'Full Project';

    let markdown = `# InsightCode Benchmark Report (${mode} Analysis)\n\n`;
    markdown += `> Generated on ${timestamp}\n\n`;

    // --- 1. Summary Section ---
    markdown += `## Overall Summary\n\n`;
    markdown += `| Metric | Value |\n|---|---|\n`;
    markdown += `| **Total Projects Analyzed** | ${summary.successfulAnalyses} / ${summary.totalProjects} |\n`;
    markdown += `| **Total Duration** | ${(summary.totalDuration / 1000).toFixed(2)}s |\n`;
    markdown += `| **Total Lines of Code** | ${formatNumber(summary.totalLines)} |\n`;
    markdown += `| **Analysis Speed** | ${formatNumber(Math.round(summary.totalLines / (summary.totalDuration / 1000)))} lines/sec |\n`;

    // --- 2. Leaderboard Section ---
    markdown += `\n## Benchmark Leaderboard\n\n`;
    markdown += `| Category | Champion 🏆 | Challenger ⚠️ | Metric |\n|---|---|---|---|\n`;
    const sortedByScore = [...results].sort((a, b) => b.analysis.score - a.analysis.score);
    const sortedByComplexity = [...results].sort((a, b) => a.analysis.summary.avgComplexity - b.analysis.summary.avgComplexity);
    const sortedByDuplication = [...results].sort((a, b) => a.analysis.summary.avgDuplication - b.analysis.summary.avgDuplication);
    markdown += `| **Best Score** | \`${sortedByScore[0].project}\` (${sortedByScore[0].analysis.score}/100) | \`${sortedByScore[sortedByScore.length - 1].project}\` (${sortedByScore[sortedByScore.length - 1].analysis.score}/100) | Overall Score |\n`;
    markdown += `| **Lowest Complexity** | \`${sortedByComplexity[0].project}\` (${sortedByComplexity[0].analysis.summary.avgComplexity.toFixed(2)}) | \`${sortedByComplexity[sortedByComplexity.length - 1].project}\` (${sortedByComplexity[sortedByComplexity.length - 1].analysis.summary.avgComplexity.toFixed(2)}) | Avg. Complexity |\n`;
    markdown += `| **Lowest Duplication** | \`${sortedByDuplication[0].project}\` (${sortedByDuplication[0].analysis.summary.avgDuplication.toFixed(2)}%) | \`${sortedByDuplication[sortedByDuplication.length - 1].project}\` (${sortedByDuplication[sortedByDuplication.length - 1].analysis.summary.avgDuplication.toFixed(2)}%) | Avg. Duplication |\n`;

    // --- 3. Complexity Distribution Section ---
    markdown += `\n## Complexity Distribution: The "Monolith" Indicator\n\n`;
    markdown += `A high Standard Deviation (StdDev) indicates that complexity is heavily concentrated in a few "monolith" files.\n\n`;
    markdown += `| Project | Avg Complexity | StdDev | Profile |\n|---|---|---|---|\n`;
    results.sort((a, b) => b.analysis.complexityStdDev - a.analysis.complexityStdDev).forEach(r => {
        const profile = r.analysis.complexityStdDev > r.analysis.summary.avgComplexity * 2 ? 'Concentrated 🌋' : 'Evenly Distributed';
        markdown += `| \`${r.project}\` | ${r.analysis.summary.avgComplexity.toFixed(2)} | **${r.analysis.complexityStdDev.toFixed(2)}** | ${profile} |\n`;
    });

    // --- 4. Code Context Section ---
    // Add new Code Context Insights section if available
    if (withContext && results.some(r => r.analysis.codeContext)) {
        markdown += `\n## Code Context Insights for LLM Analysis\n\n`;
        
        const projectsWithContext = results.filter(r => r.analysis.codeContext && !r.error);
        
        // Architecture Overview
        markdown += `### Architecture Overview\n\n`;
        markdown += `| Project | Async Usage | Error Handling | TypeScript | JSX | Test Coverage |\n|---|---|---|---|---|---|\n`;
        
        projectsWithContext.forEach(r => {
            const ctx = r.analysis.codeContext!.summary.patterns;
            const total = r.analysis.codeContext!.contexts.length;
            markdown += `| \`${r.project}\` | ${ctx.asyncUsage}/${total} | ${ctx.errorHandling}/${total} | ${ctx.typeScriptUsage}/${total} | ${ctx.jsxUsage}/${total} | ${ctx.testFiles}/${total} |\n`;
        });
        
        // Most Complex Functions Across All Projects
        markdown += `\n### Most Complex Functions Across Projects\n\n`;
        const allComplexFunctions = projectsWithContext
            .flatMap(r => r.analysis.codeContext!.contexts
                .flatMap(c => c.complexityBreakdown.functions
                    .map(f => ({ project: r.project, file: c.path, ...f }))
                )
            )
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, 10);
            
        markdown += `| Project | File | Function | Complexity | Lines | Async | Error Handling |\n|---|---|---|---|---|---|---|\n`;
        allComplexFunctions.forEach(f => {
            markdown += `| \`${f.project}\` | \`${f.file}\` | \`${f.name}\` | ${f.complexity} | ${f.lineCount} | ${f.isAsync ? '✓' : ''} | ${f.hasErrorHandling ? '✓' : ''} |\n`;
        });
        
        // Code Samples for LLM
        markdown += `\n### Code Complexity Samples for LLM Analysis\n\n`;
        projectsWithContext.forEach(r => {
            const samples = r.analysis.codeContext!.contexts
                .flatMap(c => c.samples.complexFunctions)
                .slice(0, 2);
                
            if (samples.length > 0) {
                markdown += `#### ${r.project}\n\n`;
                samples.forEach(sample => {
                    markdown += `**${sample.name}** (Complexity: ${sample.complexity})\n`;
                    markdown += '```typescript\n';
                    markdown += sample.snippet;
                    markdown += '\n```\n\n';
                });
            }
        });
    }

    // --- 5. Individual Project Analysis Section ---
    markdown += `\n## Individual Project Analysis\n\n`;
    for (const result of results.sort((a, b) => a.project.localeCompare(b.project))) {
        if (result.error) continue;
        const analysis = result.analysis;
        
        markdown += `### ${result.project} (⭐ ${result.stars}) - Grade: ${analysis.grade} (${analysis.score}/100)\n\n`;
        markdown += `- **Description**: ${result.description}\n`;
        markdown += `- **Files**: ${formatNumber(analysis.summary.totalFiles)} files, ${formatNumber(analysis.summary.totalLines)} lines\n`;
        markdown += `- **Avg Complexity**: ${analysis.summary.avgComplexity.toFixed(2)} (StdDev: ${analysis.complexityStdDev.toFixed(2)})\n`;
        markdown += `- **Avg Duplication**: ${analysis.summary.avgDuplication.toFixed(2)}%\n\n`;

         // Add code context summary if available
        if (withContext && analysis.codeContext) {
            markdown += `- **Code Context Summary**:\n`;
            const ctx = analysis.codeContext.summary;
            markdown += `  - Architecture: ${ctx.architecture.totalClasses} classes, ${ctx.architecture.totalFunctions} functions, ${ctx.architecture.totalInterfaces} interfaces\n`;
            markdown += `  - Complexity: ${ctx.complexity.filesWithHighComplexity} files with high complexity, deepest nesting: ${ctx.complexity.deepestNesting}\n`;

            const externalDeps = ctx.dependencies.mostUsedExternal
                .map(dep => `${dep.name} (${dep.count})`)
                .slice(0, 3)
                .join(', ') || 'None';
            markdown += `  - Dependencies: Most used external: ${externalDeps}\n`;
        }
        
        // --- 5a. Emblematic Files Validation ---
        if (result.emblematicFiles) {
            markdown += `- **Emblematic Files Validation**:\n`;
            const topFilePaths = new Set(analysis.topFiles.map(f => f.path));
            let foundCount = 0;
            for (const [category, files] of Object.entries(result.emblematicFiles)) {
                for (const emblematicFile of files) {
                    if (topFilePaths.has(emblematicFile)) {
                        const categoryName = category.replace('Files', '');
                        markdown += `  - ✅ \`${emblematicFile}\` (found in Top 5, expected as ${categoryName})\n`;
                        foundCount++;
                    }
                }
            }
            if (foundCount === 0) {
                markdown += `  - ℹ️ No emblematic files were found in the Top 5 critical files list.\n`;
            }
        }

        // --- 4b. Silent Killers Section ---
        if (analysis.silentKillers.length > 0) {
            markdown += `- **Architectural Risks (Silent Killers)**:\n`;
            analysis.silentKillers.forEach(file => {
                markdown += `  - \`${file.path}\` (Impact: ${file.impact}, Complexity: ${file.complexity})\n`;
            });
        }
        markdown += `\n---\n`;
    }
    return markdown;
}

async function main(): Promise<void> {
  console.log(`\n🚀 InsightCode Benchmark Tool`);
  console.log(`📊 Analyzing ${Object.values(PROJECTS).flat().length} popular JavaScript/TypeScript projects`);

  if (excludeUtility) {
    console.log(`⚙️  Mode: Production Only (excluding test/utility files)`);
  } else {
    console.log(`⚙️  Mode: Full Analysis (all files)`);
  }
  if (withContext) {
    console.log(`🧠 Code Context: Enabled (extracting detailed AST data)`);
  }

  console.log(`📁 Results will be saved to: ${RESULTS_DIR}\n`);

  // **AMÉLIORATION : Exécution en parallèle**
  const analysisPromises = PROJECTS.map((project, index) => analyzeProject(project, index + 1, PROJECTS.length));

  // Utiliser Promise.allSettled pour continuer même si une analyse échoue
  const settledResults = await Promise.allSettled(analysisPromises);

  const results: BenchmarkResult[] = settledResults.map(res => {
    if (res.status === 'fulfilled') {
      return res.value;
    }
    // Si la promesse a été rejetée, on log l'erreur et on retourne un objet d'erreur
    console.error(`❌ A critical error occurred during analysis:`, res.reason);
    // On doit reconstruire un objet BenchmarkResult partiel pour le rapport
    return { project: 'Unknown', error: 'Critical failure in promise',} as BenchmarkResult;
  });

  // Sauvegarder les résultats individuels
  results.forEach(result => {
    if(!result.project || result.project === 'Unknown') return;
    const resultFilename = `${result.project}-${excludeUtility ? 'prod' : 'full'}.json`;
    fs.writeFileSync(path.join(RESULTS_DIR, resultFilename), 
    JSON.stringify(result, function(key, val) {
      return val.toFixed ? Number(val.toFixed(2)) : val;
    }, 2));
  });


  // Calculate summary
  const successfulResults = results.filter(r => !r.error);
  const summary: Summary = {
    totalProjects: results.length,
    successfulAnalyses: successfulResults.length,
    failedAnalyses: results.filter(r => r.error).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    totalLines: successfulResults.reduce((sum, r) => sum + r.analysis.summary.totalLines, 0),
    avgComplexity: successfulResults.reduce((sum, r) => sum + r.analysis.summary.avgComplexity, 0) / successfulResults.length,
    avgDuplication: (successfulResults.reduce((sum, r) => sum + r.analysis.summary.avgDuplication, 0) / successfulResults.length),
    gradeDistribution: successfulResults.reduce((dist, r) => {
      dist[r.analysis.grade] = (dist[r.analysis.grade] || 0) + 1;
      return dist;
    }, {} as Record<string, number>),
    modeCategory: excludeUtility ? 'production' : 'full'
  };

  // Save summary
  const summaryFilename = excludeUtility ? 'benchmark-summary-production.json' : 'benchmark-summary.json';
  fs.writeFileSync(
    path.join(RESULTS_DIR, summaryFilename),
    JSON.stringify(summary, function(key, val) {
      return val.toFixed ? Number(val.toFixed(2)) : val;
    }, 2)
  );

  // Generate and save markdown report
  const markdown = generateMarkdownReport(results, summary);
  const now = new Date();
  const dateSuffix = now.toISOString().slice(0, 10); // e.g. "2024-06-07"
  const contextSuffix = withContext ? '-with-context' : '';
  const markdownFilename = excludeUtility
    ? `benchmark-report-production${contextSuffix}-${dateSuffix}.md`
    : `benchmark-report${contextSuffix}-${dateSuffix}.md`;
  fs.writeFileSync(
    path.join(RESULTS_DIR, markdownFilename),
    markdown
  );

  // Print summary
  console.log(`\n✅ Benchmark completed!`);
  console.log(`📊 Summary:`);
  console.log(`  - Success rate: ${summary.successfulAnalyses}/${summary.totalProjects}`);
  console.log(`  - Total lines analyzed: ${formatNumber(summary.totalLines)}`);
  console.log(`  - Analysis speed: ${formatNumber(Math.round(summary.totalLines / (summary.totalDuration / 1000)))} lines/second`);
  console.log(`  - Average complexity: ${summary.avgComplexity.toFixed(2)}`);
  console.log(`  - Average duplication: ${summary.avgDuplication.toFixed(2)}%`);
  console.log(`  - Grade distribution: ${Object.entries(summary.gradeDistribution).map(([g, c]) => `${g}:${c}`).join(', ')}`);
  console.log(`\n📁 Results saved to: ${RESULTS_DIR}`);
}

// Run the benchmark
main();