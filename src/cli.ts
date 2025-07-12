#!/usr/bin/env node
// File: src/cli.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions, AnalysisResult, FileDetail } from './types';
import { parseDirectory } from './parser';
import { analyze } from './analyzer';
import { reportToTerminal } from './reporter';
import { isCriticalFile, isPassingScore } from './scoring.utils';
import { generateProjectReport } from './report-generator';
import { getConfig } from './config.manager';

/**
 * Wrapper helper pour vérifier si un fichier est critique
 */
function isFileCritical(file: FileDetail): boolean {
  return isCriticalFile(file.healthScore);
}

const program = new Command();

// Format output functions
function outputCiFormat(results: AnalysisResult): void {
  const ciResult = {
    passed: isPassingScore(results.overview.scores.overall),
    grade: results.overview.grade,
    score: results.overview.scores.overall,
    issues: results.details.reduce((total, file) => total + file.issues.length, 0),
    critical: results.details.filter(f => isFileCritical(f)).length
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
  
  console.log(JSON.stringify(criticalResult, null, 2));
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
  .version('0.6.1');

program
  .command('analyze [path]')
  .description('Analyze TypeScript code quality')
  .option('-j, --json', 'Output as JSON')
  .option('-f, --format <format>', 'Output format: json, ci, critical, summary, report (default: terminal)')
  .option('-e, --exclude <patterns...>', 'Exclude patterns (e.g., "**/*.spec.ts")')
  .option('--exclude-utility', 'Exclude test, example, and utility directories from analysis')
  .option('--with-context', 'Include detailed code context for LLM analysis')
  .option('--strict-duplication', 'Use strict duplication thresholds (3%/8%/15%) aligned with industry standards (SonarQube, Google). Default uses legacy permissive thresholds (15%/30%/50%)')
  .action(async (path = '.', options: CliOptions) => {
    try {
      // check if options.format not terminal 
      if (!options.json && !options.format) {
        console.log(chalk.blue('🔍 Analyzing code quality...'));
      }
      const thresholds = getConfig();
      // Parse files
      const files = await parseDirectory(path, options.exclude, options.excludeUtility);
      
      if (files.length === 0) {
        console.error(chalk.red('\n❌ No TypeScript/JavaScript files found!'));
        process.exit(1);
      }
      
      // Analyze metrics
      const results = await analyze(files, path, thresholds, options.withContext, options.strictDuplication);
      
      // Handle output format
      const format = options.format || (options.json ? 'json' : 'terminal');
      
      switch (format) {
        case 'json':
          console.log(JSON.stringify(results, function(key, val) {
            return val && val.toFixed ? Number(val.toFixed(2)) : val;
          }, 2));
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
        case 'report':
          outputReportFormat(results, path);
          break;
        default:
          // Use the new reporter for terminal output
          reportToTerminal(results);
          break;
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
    process.exit(0);
  });

program.parse();