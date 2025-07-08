#!/usr/bin/env node
// File: src/cli.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions } from './types';
import { parseDirectory } from './parser';
import { analyze } from './analyzer';
import { reportToTerminal } from './reporter';
import { getConfig } from './config';
import { analyzeWithContext } from './contextExtractor';

const program = new Command();

program
  .name('insightcode')
  .description('TypeScript code quality analyzer - 100% local')
  .version('0.4.0');

program
  .command('analyze [path]')
  .description('Analyze TypeScript code quality')
  .option('-j, --json', 'Output as JSON')
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
       
      // Analyze metrics
      let results;
      if (options.withContext) {
        results = analyzeWithContext(files, path, thresholds, true);
      } else {
        results = analyze(files, path, thresholds);
      }
      
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        // Use the new reporter
        reportToTerminal(results);
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();