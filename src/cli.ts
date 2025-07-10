#!/usr/bin/env node
// File: src/cli.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions, AnalysisResult } from './types';
import { parseDirectory } from './parser';
import { analyze } from './analyzer';
import { reportToTerminal } from './reporter';
import { getConfig } from './config';
import { analyzeWithContext } from './contextExtractor';

const program = new Command();

// Format output functions
function outputCiFormat(results: AnalysisResult): void {
  const ciResult = {
    passed: results.overview.scores.overall >= 70,
    grade: results.overview.grade,
    score: results.overview.scores.overall,
    issues: results.details.reduce((total, file) => total + file.issues.length, 0),
    critical: results.details.filter(f => f.isCritical).length
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
    details: results.details.filter(f => f.isCritical)
  };
  
  console.log(JSON.stringify(criticalResult, null, 2));
}

function outputSummaryFormat(results: AnalysisResult): void {
  console.log('InsightCode Analysis Summary');
  console.log('===========================');
  console.log(`Grade: ${results.overview.grade} (${results.overview.scores.overall}/100)`);
  console.log(`Health: ${results.overview.health}`);
  console.log(`Files: ${results.overview.statistics.totalFiles}`);
  console.log(`Issues: ${results.details.reduce((total, file) => total + file.issues.length, 0)}`);
  
  const criticalFiles = results.details.filter(f => f.isCritical);
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

program
  .name('insightcode')
  .description('TypeScript code quality analyzer - 100% local')
  .version('0.5.0');

program
  .command('analyze [path]')
  .description('Analyze TypeScript code quality')
  .option('-j, --json', 'Output as JSON')
  .option('-f, --format <format>', 'Output format: json, ci, critical, summary (default: terminal)')
  .option('-e, --exclude <patterns...>', 'Exclude patterns (e.g., "**/*.spec.ts")')
  .option('--exclude-utility', 'Exclude test, example, and utility directories from analysis')
  .option('--with-context', 'Include detailed code context for LLM analysis')
  .action(async (path = '.', options: CliOptions) => {
    try {
      if (!options.json) {
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
      let results;
      if (options.withContext) {
        results = analyzeWithContext(files, path, thresholds, true);
      } else {
        results = analyze(files, path, thresholds);
      }
      
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
        default:
          // Use the new reporter for terminal output
          reportToTerminal(results);
          break;
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();