#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult } from '../src/types';

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
  embematicFiles: EmblematicFiles;
}

interface BenchmarkResult {
  project: string;
  repo: string;
  type: string;
  stars: string;
  stableVersion: string;
  description: string;
  category: 'small' | 'medium' | 'large';
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

// Parse command line arguments
const args = process.argv.slice(2);
const excludeUtility = args.includes('--exclude-utility');

// Projects to analyze organized by size
const PROJECTS: Project[] = [
  {
    name: 'lodash',
    repo: 'https://github.com/lodash/lodash.git',
    description: 'JavaScript utility library',
    type: 'utility library',
    stars: '59k',
    stableVersion: '4.17.21',
    category: 'small',
    embematicFiles: {
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
    stars: '21k',
    stableVersion: 'v5.3.0',
    category: 'small',
    embematicFiles: {
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
    stars: '14k',
    stableVersion: 'v9.0.1',
    category: 'small',
    embematicFiles: {
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
    stars: '65k',
    stableVersion: '4.19.2',
    category: 'medium',
    embematicFiles: {
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
    stars: '46k',
    stableVersion: 'v3.4.21',
    category: 'medium',
    embematicFiles: {
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
    stars: '44k',
    stableVersion: 'v29.7.0',
    category: 'medium',
    embematicFiles: {
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
    stars: '227k',
    stableVersion: 'v18.2.0',
    category: 'large',
    embematicFiles: {
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
    stars: '25k',
    stableVersion: 'v8.57.0',
    category: 'large',
    embematicFiles: {
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
    stars: '98k',
    stableVersion: 'v5.4.5',
    category: 'large',
    embematicFiles: {
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
const projectRoot = path.resolve(scriptDir, '..');  // Go up from scripts/ to project root
const TEMP_DIR = path.join(projectRoot, 'temp-analysis');
const RESULTS_DIR = path.join(projectRoot, 'benchmark-results');

// Create results directory
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

function analyzeProject(project: Project): BenchmarkResult {
  const startTime = Date.now();
  console.log(`\n📊 Analyzing ${project.name}...`);

  try {
    // Clean up any existing temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }

    // Clone the repository at specific version tag (shallow clone for speed)
    console.log(`  📥 Cloning repository (${project.stableVersion})...`);
    runCommand(`git clone --depth 1 --branch ${project.stableVersion} ${project.repo} "${TEMP_DIR}"`);

    // Run InsightCode analysis
    console.log(`  🔍 Running analysis...`);

    // Build command with proper flag handling
    const flags = ['--json'];
    if (excludeUtility) {
      flags.push('--exclude-utility');
    }
    const command = `insightcode analyze "${TEMP_DIR}" ${flags.join(' ')}`;

    const analysisOutput = runCommand(command, process.cwd());
    const analysis: AnalysisResult = JSON.parse(analysisOutput);

    const duration = Date.now() - startTime;
    console.log(`  ✅ Completed in ${(duration / 1000).toFixed(1)}s`);

    return {
      project: project.name,
      repo: project.repo,
      type: project.type,
      stars: project.stars,
      stableVersion: project.stableVersion,
      description: project.description,
      category: project.category,
      analysis,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`  ❌ Failed: ${errorMessage}`);

    return {
      project: project.name,
      repo: project.repo,
      type: project.type,
      stars: project.stars,
      stableVersion: project.stableVersion,
      description: project.description,
      category: project.category,
      analysis: {} as AnalysisResult,
      duration,
      error: errorMessage
    };
  } finally {
    // Clean up
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function generateMarkdownReport(results: BenchmarkResult[], summary: Summary): string {
  const timestamp = new Date().toISOString();
  const mode = excludeUtility ? 'Production' : 'Full';

  let markdown = `# InsightCode Benchmark Report (${mode} Analysis)\n\n`;
  markdown += `> Generated on ${timestamp}\n\n`;

  markdown += `## Summary\n\n`;
  markdown += `- **Total Projects**: ${summary.totalProjects}\n`;
  markdown += `- **Successful**: ${summary.successfulAnalyses}\n`;
  markdown += `- **Failed**: ${summary.failedAnalyses}\n`;
  markdown += `- **Total Duration**: ${(summary.totalDuration / 1000).toFixed(1)}s\n`;
  markdown += `- **Total Lines Analyzed**: ${formatNumber(summary.totalLines)}\n`;
  markdown += `- **Analysis Speed**: ${formatNumber(Math.round(summary.totalLines / (summary.totalDuration / 1000)))} lines/second\n`;
  markdown += `- **Average Complexity**: ${summary.avgComplexity.toFixed(1)}\n`;
  markdown += `- **Average Duplication**: ${summary.avgDuplication.toFixed(1)}%\n\n`;

  markdown += `### Grade Distribution\n\n`;
  markdown += `| Grade | Count | Percentage |\n`;
  markdown += `|-------|-------|------------|\n`;

  const grades = ['A', 'B', 'C', 'D', 'F'];
  for (const grade of grades) {
    const count = summary.gradeDistribution[grade] || 0;
    const percentage = ((count / summary.successfulAnalyses) * 100).toFixed(0);
    markdown += `| ${grade} | ${count} | ${percentage}% |\n`;
  }

  markdown += `\n## Individual Results\n`;

  for (const project of PROJECTS) {

    const result = results.find(r => r.project === project.name);
    if (!result || result.error) continue;

    const analysis = result.analysis;
    markdown += `#### ${project.name} (⭐ ${project.stars})\n`;
    markdown += `- **Description**: ${project.description}\n`;
    markdown += `- **Type**: ${project.type}\n`;
    markdown += `- **Category**: ${result.category}\n`;
    markdown += `- **Repo**: [${project.repo}](${project.repo})\n`;
    markdown += `- **Version**: ${project.stableVersion}\n`;
    markdown += `- **Score**: ${analysis.grade} (${analysis.score}/100)\n`;
    markdown += `- **Files**: ${analysis.summary.totalFiles.toLocaleString()} files, ${analysis.summary.totalLines.toLocaleString()} lines\n`;
    markdown += `- **Complexity**: ${analysis.summary.avgComplexity.toFixed(1)} average\n`;
    markdown += `- **Duplication**: ${analysis.summary.avgDuplication.toFixed(1)}%\n`;

    // Extract top 3 issues from topFiles
    const topIssues: Array<{ file: string, message: string }> = [];
    for (const file of analysis.topFiles || []) {
      for (const issue of file.issues) {
        if (topIssues.length >= 3) break;
        topIssues.push({
          file: file.path.replace(/^temp-analysis\//, ''),
          message: issue.message
        });
      }
      if (topIssues.length >= 3) break;
    }

    if (topIssues.length > 0) {
      markdown += `- **Top Issues**:\n`;
      topIssues.forEach(issue => {
        markdown += `  - \`${issue.file}\`: ${issue.message}\n`;
      });
    }

    markdown += `\n`;
  }

  return markdown;
}

function main(): void {
  console.log(`\n🚀 InsightCode Benchmark Tool`);
  console.log(`📊 Analyzing ${Object.values(PROJECTS).flat().length} popular JavaScript/TypeScript projects`);

  if (excludeUtility) {
    console.log(`⚙️  Mode: Production Only (excluding test/utility files)`);
  } else {
    console.log(`⚙️  Mode: Full Analysis (all files)`);
  }

  console.log(`📁 Results will be saved to: ${RESULTS_DIR}\n`);

  // Check if insightcode is installed
  try {
    runCommand('insightcode --version');
  } catch {
    console.error('❌ Error: insightcode is not installed or not in PATH');
    console.error('Please run: npm install -g insightcode-cli');
    process.exit(1);
  }

  const results: BenchmarkResult[] = [];

  // Analyze all projects
  for (const project of Object.values(PROJECTS).flat()) {
    const result = analyzeProject(project);
    results.push(result);

    // Save intermediate results
    const resultFilename = excludeUtility
      ? `${project.name}-production-result.json`
      : `${project.name}-result.json`;

    fs.writeFileSync(
      path.join(RESULTS_DIR, resultFilename),
      JSON.stringify(result, null, 2)
    );
  }

  // Calculate summary
  const successfulResults = results.filter(r => !r.error);
  const summary: Summary = {
    totalProjects: results.length,
    successfulAnalyses: successfulResults.length,
    failedAnalyses: results.filter(r => r.error).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
    totalLines: successfulResults.reduce((sum, r) => sum + r.analysis.summary.totalLines, 0),
    avgComplexity: successfulResults.reduce((sum, r) => sum + r.analysis.summary.avgComplexity, 0) / successfulResults.length,
    avgDuplication: successfulResults.reduce((sum, r) => sum + r.analysis.summary.avgDuplication, 0) / successfulResults.length,
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
    JSON.stringify(summary, null, 2)
  );

  // Generate and save markdown report
  const markdown = generateMarkdownReport(results, summary);
  const markdownFilename = excludeUtility ? 'benchmark-report-production.md' : 'benchmark-report.md';
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
  console.log(`  - Average complexity: ${summary.avgComplexity.toFixed(1)}`);
  console.log(`  - Average duplication: ${summary.avgDuplication.toFixed(1)}%`);
  console.log(`  - Grade distribution: ${Object.entries(summary.gradeDistribution).map(([g, c]) => `${g}:${c}`).join(', ')}`);
  console.log(`\n📁 Results saved to: ${RESULTS_DIR}`);
}

// Run the benchmark
main();