#!/usr/bin/env node
// File: src/cli.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions, AnalysisResult, FileDetail, CiFormat, QuickWinsAnalysis } from './types';
import { analyze, AnalysisOptions } from './analyzer';
import { isCriticalFile, isPassingScore } from './scoring.utils';
import { generateProjectReport } from './project-report-generator';
// config.manager removed - using global configurations from scoring.utils.ts
import { generateCliOutput } from './reporter';
import { defaultJsonReplacer } from './json-utils';
import { QuickWinsReporter } from './quick-wins-reporter';

/**
 * Wrapper helper pour vérifier si un fichier est critique
 */
function isFileCritical(file: FileDetail): boolean {
  return isCriticalFile(file.healthScore);
}

const program = new Command();

// Format output functions
function outputCiFormat(results: AnalysisResult): void {
  const ciResult : CiFormat = {
    passed: isPassingScore(results.overview.scores.overall),
    grade: results.overview.grade,
    score: results.overview.scores.overall,
    issues: results.details.reduce((total, file) => total + file.issues.length, 0),
    critical: results.details.filter(f => isFileCritical(f)).length,
  };
  
  console.log(JSON.stringify(ciResult, null, 2));
  
  // Exit with non-zero code if CI fails
  if (!ciResult.passed) {
    process.exit(1);
  }
}

function outputCriticalFormat(results: AnalysisResult): void {
  const criticalResult = {
    ...results,
    details: results.details.filter(f => isFileCritical(f))
  };
  
  console.log(JSON.stringify(criticalResult, defaultJsonReplacer, 2));
}

function outputSummaryFormat(results: AnalysisResult): void {
  console.log('InsightCode Analysis Summary');
  console.log('===========================');
  console.log(`Grade: ${results.overview.grade} (${results.overview.scores.overall}/100)`);
  console.log(`Files: ${results.overview.statistics.totalFiles}`);
  console.log(`Issues: ${results.details.reduce((total, file) => total + file.issues.length, 0)}`);
  
  const criticalFiles = results.details.filter(f => isFileCritical(f));
  if (criticalFiles.length > 0) {
    console.log('\nCritical Files:');
    criticalFiles.forEach((file, index) => {
      const mainIssue = file.issues[0];
      const issueText = mainIssue ? 
        `${mainIssue.type} (${mainIssue.severity})` : 
        `Health: ${file.healthScore}/100`;
      console.log(`${index + 1}. ${file.file} - ${issueText}`);
    });
  }
  
  console.log('\nRun with --format=json for full details.');
}

function outputReportFormat(results: AnalysisResult, projectPath: string): void {
  // Create a ReportResult-like structure for generateProjectReport
  const reportResult = {
    project: projectPath.split('/').pop() || 'project',
    type: 'analysis',
    repo: 'local',
    stableVersion: 'latest',
    stars: '0',
    category: 'medium' as 'small' | 'medium' | 'large',
    description: 'Local project analysis',
    durationMs: 0, // We don't track this in CLI mode
    analysis: results,
    emblematicFiles: {
      coreFiles: [],
      architecturalFiles: [],
      performanceCriticalFiles: [],
      complexAlgorithmFiles: []
    }
  };
  
  const report = generateProjectReport(reportResult);
  console.log(report);
}

program
  .name('insightcode')
  .description('TypeScript code quality analyzer - 100% local')
  .version('0.7.1')
  .argument('[path]', 'Path to analyze (default: current directory)', '.')
  .option('-j, --json', 'Output as JSON')
  .option('-f, --format <format>', 'Output format: json, ci, critical, summary, markdown (default: terminal)')
  .option('-e, --exclude <patterns...>', 'Exclude patterns (e.g., "**/*.spec.ts")')
  .option('--production', 'Exclude test, example, and utility directories from analysis')
  .option('--strict-duplication', 'Use strict duplication thresholds (3%/8%/15%) aligned with industry standards (SonarQube, Google). Default uses legacy permissive thresholds (15%/30%/50%)')
  .action(async (path: string, options: CliOptions) => {
    // Implement the default analyze action
    await runAnalysis(path, options);
  });

// Extract common analysis logic into a function
async function runAnalysis(path: string, options: CliOptions) {
  try {
    // check if options.format not terminal 
    if (!options.json && !options.format) {
      console.log(chalk.blue('🔍 Analyzing code quality...'));
    }
    // thresholds removed - using global configurations from scoring.utils.ts
    
    const format = options.format || (options.json ? 'json' : 'terminal');
    

    // Create analysis options
    const analysisOptions: AnalysisOptions = {
      format: format,
      projectPath: path,
      production: options.production,
      strictDuplication: options.strictDuplication,
      includeQuickWins: true
    };
    
    // Analyze using new flow
    const results = await analyze(path, analysisOptions);
    
   
     // Create a ReportResult-like structure for generateProjectReport
      const reportResult = {
        project: path.split('/').pop() || 'project',
        type: 'analysis',
        repo: 'local',
        stableVersion: 'latest',
        stars: '0',
        category: 'medium' as 'small' | 'medium' | 'large',
        description: 'Local project analysis',
        durationMs: 0, // We don't track this in CLI mode
        analysis: results,
        emblematicFiles: {
          coreFiles: [],
          architecturalFiles: [],
          performanceCriticalFiles: [],
          complexAlgorithmFiles: []
        }
      };

    // Handle output format
    switch (format) {
      case 'json':
        console.log(JSON.stringify(results, defaultJsonReplacer, 2));
        break;
      case 'ci':
        outputCiFormat(results);
        break;
      case 'critical':
        outputCriticalFormat(results);
        break;
      case 'summary':
        outputSummaryFormat(results);
        break;
      case 'markdown':
        outputReportFormat(results, path);
        break;
      default:
        // Use the new reporter for terminal output
        generateCliOutput(reportResult);
        if (results.quickWinsAnalysis && results.quickWinsAnalysis.quickWins.length > 0) {
          outputQuickWinsFormat(results, options, inputPath);
        }
        break;
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
  process.exit(0);
}


// AJOUT: Fonction pour afficher les Quick Wins
function outputQuickWinsFormat(results: AnalysisResult, options: CliOptions, analysisPath: string): void {
  if (!results.quickWinsAnalysis || results.quickWinsAnalysis.quickWins.length === 0) {
    console.log(chalk.yellow('No quick wins found or analysis not enabled.'));
    return;
  }
  
  // CORRECTION : Commander.js transforme --no-links en links: false
  const enableLinks = options.links !== false; // Par défaut true, false seulement si --no-links est utilisé
  
  const quickWinsReporter = new QuickWinsReporter({
    ide: (options.ide as any) || IdeLinkGenerator.detectIDE(),
    projectRoot: path.resolve(analysisPath),
    enableLinks: enableLinks
  });
  
  console.log(quickWinsReporter.generateTerminalReport(results.quickWinsAnalysis));
}

program.parse();