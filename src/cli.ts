#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CliOptions } from './types';
import { parseDirectory } from './parser';
import { analyze } from './analyzer';

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
      
      // Analyze metrics
      const results = analyze(files);
      
      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
      } else {
        // Display summary
        console.log(chalk.bold('📊 Summary:'));
        console.log(`  Total files: ${results.summary.totalFiles}`);
        console.log(`  Total lines: ${results.summary.totalLines}`);
        console.log(`  Avg complexity: ${results.summary.avgComplexity}`);
        console.log(`  Avg duplication: ${results.summary.avgDuplication}%`);
        
        // Display score and grade
        console.log('\n' + chalk.bold('📈 Score:'));
        const gradeColor = results.grade === 'A' ? 'green' : 
                          results.grade === 'B' ? 'blue' :
                          results.grade === 'C' ? 'yellow' :
                          results.grade === 'D' ? 'magenta' : 'red';
        console.log(`  ${chalk[gradeColor].bold(results.grade)} (${results.score}/100)`);
        
        // Display top issues
        const allIssues = results.files.flatMap(f => 
          f.issues.map(i => ({ ...i, file: f.path }))
        );
        const topIssues = allIssues
          .sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
          })
          .slice(0, 5);
        
        if (topIssues.length > 0) {
          console.log('\n' + chalk.bold('⚠️  Top issues:'));
          for (const issue of topIssues) {
            const color = issue.severity === 'high' ? 'red' : 
                         issue.severity === 'medium' ? 'yellow' : 'gray';
            console.log(`  ${chalk[color](`[${issue.severity}]`)} ${issue.file}`);
            console.log(`    ${issue.message}`);
          }
        }
        
        console.log(chalk.green('\n✅ Analysis complete!'));
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();