#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions } from './types.js';

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
      console.log(chalk.blue('📊 InsightCode Analysis\n'));
      console.log(chalk.gray(`Analyzing: ${path}`));
      
      // TODO: Implémenter le parser
      console.log(chalk.yellow('\n⚠️  Parser not implemented yet'));
      
      // TODO: Implémenter l'analyzer
      // TODO: Implémenter le reporter
      
      if (options.json) {
        console.log(JSON.stringify({ status: 'not_implemented' }, null, 2));
      } else {
        console.log(chalk.green('\n✅ Analysis complete!'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();