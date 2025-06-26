#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions } from './types';
import { parseDirectory } from './parser';
import { analyze } from './analyzer';
import { reportToTerminal } from './reporter';

const program = new Command();

program
  .name('insightcode')
  .description('TypeScript code quality analyzer - 100% local')
  .version('0.1.0');

program
  .command('analyze [path]')
  .description('Analyze TypeScript code quality')
  .option('-j, --json', 'Output as JSON')
  .option('-e, --exclude <patterns...>', 'Exclude patterns (e.g., "**/*.spec.ts")')
  .action(async (path = '.', options: CliOptions) => {
    try {
      if (!options.json) {
        console.log(chalk.blue('🔍 Analyzing code quality...'));
      }
      
      // Parse files
      const files = await parseDirectory(path, options.exclude);
      
      if (files.length === 0) {
        console.error(chalk.red('\n❌ No TypeScript/JavaScript files found!'));
        process.exit(1);
      }
      
      // Analyze metrics
      const results = analyze(files);
      
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