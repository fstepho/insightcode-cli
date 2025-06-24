#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions } from './types';
import { parseDirectory } from './parser';

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
      
      // Parse files
      const files = await parseDirectory(path, options.exclude);
      console.log(chalk.gray(`Found ${files.length} files\n`));
      
      // TODO: Implémenter l'analyzer
      // TODO: Implémenter le reporter
      
      if (options.json) {
        console.log(JSON.stringify({ files, status: 'parser_implemented' }, null, 2));
      } else {
        // Temporary output to test parser
        console.log(chalk.yellow('📁 Files analyzed:'));
        for (const file of files.slice(0, 5)) {
          console.log(`  ${file.path} - Complexity: ${file.complexity}, LOC: ${file.loc}`);
        }
        if (files.length > 5) {
          console.log(`  ... and ${files.length - 5} more files`);
        }
        console.log(chalk.green('\n✅ Analysis complete!'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();