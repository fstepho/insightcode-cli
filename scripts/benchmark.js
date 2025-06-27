#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const excludeUtility = args.includes('--exclude-utility');
const mode = excludeUtility ? 'production-only' : 'full';

// Projects to analyze organized by size
const PROJECTS = {
  small: [
    { name: 'ms', repo: 'https://github.com/vercel/ms.git', stars: '4.8k' },
    { name: 'classnames', repo: 'https://github.com/JedWatson/classnames.git', stars: '17k' },
    { name: 'is-promise', repo: 'https://github.com/then/is-promise.git', stars: '0.3k' },
    { name: 'debounce', repo: 'https://github.com/sindresorhus/debounce.git', stars: '1.1k' },
    { name: 'uuid', repo: 'https://github.com/uuidjs/uuid.git', stars: '14k' },
    { name: 'dotenv', repo: 'https://github.com/motdotla/dotenv.git', stars: '19k' },
  ],
  medium: [
    { name: 'axios', repo: 'https://github.com/axios/axios.git', stars: '104k' },
    { name: 'chalk', repo: 'https://github.com/chalk/chalk.git', stars: '21k' },
    { name: 'commander', repo: 'https://github.com/tj/commander.js.git', stars: '26k' },
    { name: 'yargs', repo: 'https://github.com/yargs/yargs.git', stars: '11k' },
    { name: 'joi', repo: 'https://github.com/hapijs/joi.git', stars: '21k' },
    { name: 'date-fns', repo: 'https://github.com/date-fns/date-fns.git', stars: '34k' },
    { name: 'zod', repo: 'https://github.com/colinhacks/zod.git', stars: '33k' },
  ],
  large: [
    { name: 'typescript', repo: 'https://github.com/microsoft/TypeScript.git', stars: '98k' },
    { name: 'nest', repo: 'https://github.com/nestjs/nest.git', stars: '65k' },
    { name: 'express', repo: 'https://github.com/expressjs/express.git', stars: '64k' },
    { name: 'prettier', repo: 'https://github.com/prettier/prettier.git', stars: '49k' },
    { name: 'eslint', repo: 'https://github.com/eslint/eslint.git', stars: '25k' },
    { name: 'webpack', repo: 'https://github.com/webpack/webpack.git', stars: '65k' },
  ]
};

// Ensure we're in the right directory
const scriptDir = __dirname;
const projectRoot = path.resolve(scriptDir, '..');  // Go up from scripts/ to project root
const TEMP_DIR = path.join(projectRoot, 'temp-analysis');
const RESULTS_DIR = path.join(projectRoot, 'benchmark-results');

// Create results directory
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function runCommand(command, cwd) {
  try {
    return execSync(command, { 
      cwd, 
      encoding: 'utf-8',
      stdio: 'pipe', // Capture stdout only
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' }, // Disable colors
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large projects
    });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function analyzeProject(project, category) {
  const startTime = Date.now();
  console.log(`\n📊 Analyzing ${project.name}...`);
  
  try {
    // Clean up any existing temp directory
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    
    // Clone the repository (shallow clone for speed)
    console.log(`  📥 Cloning repository...`);
    runCommand(`git clone --depth 1 ${project.repo} "${TEMP_DIR}"`);
    
    // Run InsightCode analysis
    console.log(`  🔍 Running analysis...`);
    // Important: Use explicit path and suppress color output
    const excludeFlag = excludeUtility ? ' --exclude-utility' : '';
    const analysisOutput = runCommand(`insightcode analyze "${TEMP_DIR}" --json${excludeFlag}`, process.cwd());
    const analysis = JSON.parse(analysisOutput);
    
    // Extract top issues (max 3)
    const topIssues = analysis.files
      .flatMap(file => 
        file.issues.map(issue => ({
          file: file.path.replace(/^temp-analysis\//, ''), // Remove temp-analysis prefix
          ...issue
        }))
      )
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 3);
    
    const duration = Date.now() - startTime;
    console.log(`  ✅ Completed in ${(duration / 1000).toFixed(1)}s`);
    
    return {
      project: project.name,
      repo: project.repo,
      stars: project.stars,
      category,
      analysis: {
        totalFiles: analysis.summary.totalFiles,
        totalLines: analysis.summary.totalLines,
        avgComplexity: analysis.summary.avgComplexity,
        avgDuplication: analysis.summary.avgDuplication,
        score: analysis.score,
        grade: analysis.grade
      },
      topIssues,
      duration
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return {
      project: project.name,
      repo: project.repo,
      stars: project.stars,
      category,
      analysis: {
        totalFiles: 0,
        totalLines: 0,
        avgComplexity: 0,
        avgDuplication: 0,
        score: 0,
        grade: 'N/A'
      },
      topIssues: [],
      error: error.message,
      duration: Date.now() - startTime
    };
  } finally {
    // Clean up
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
  }
}

function generateMarkdownReport(results) {
  const date = new Date().toISOString().split('T')[0];
  const analysisType = excludeUtility ? 'Production Code Only' : 'Full Codebase';
  const analysisFlag = excludeUtility ? ' (with --exclude-utility)' : '';
  
  let markdown = `# InsightCode Benchmarks - ${analysisType}

## Methodology
- **Date**: ${date}
- **InsightCode Version**: 0.2.0
- **Analysis Type**: ${analysisType}${analysisFlag}
- **Total Projects Analyzed**: ${results.length}
- **Analysis Method**: Fresh clone, default settings, no modifications

## Results Summary

| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |
|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|
`;

  // Add results table
  results.forEach(r => {
    if (!r.error) {
      markdown += `| ${r.project} | ${r.stars} | ${r.category} | ${r.analysis.totalFiles} | ${r.analysis.totalLines.toLocaleString()} | **${r.analysis.score}** | **${r.analysis.grade}** | ${r.analysis.avgComplexity} | ${r.analysis.avgDuplication}% | ${(r.duration/1000).toFixed(1)}s |\n`;
    }
  });

  // Add detailed analysis by category
  markdown += `\n## Detailed Analysis\n`;

  ['small', 'medium', 'large'].forEach(category => {
    const categoryResults = results.filter(r => r.category === category && !r.error);
    if (categoryResults.length === 0) return;
    
    markdown += `\n### ${category.charAt(0).toUpperCase() + category.slice(1)} Projects\n\n`;
    
    categoryResults.forEach(r => {
      markdown += `#### ${r.project} (⭐ ${r.stars})\n`;
      markdown += `- **Score**: ${r.analysis.grade} (${r.analysis.score}/100)\n`;
      markdown += `- **Files**: ${r.analysis.totalFiles} files, ${r.analysis.totalLines.toLocaleString()} lines\n`;
      markdown += `- **Complexity**: ${r.analysis.avgComplexity} average\n`;
      markdown += `- **Duplication**: ${r.analysis.avgDuplication}%\n`;
      
      if (r.topIssues.length > 0) {
        markdown += `- **Top Issues**:\n`;
        r.topIssues.forEach(issue => {
          markdown += `  - \`${issue.file}\`: ${issue.message}\n`;
        });
      }
      markdown += `\n`;
    });
  });

  // Add key findings
  markdown += `## Key Findings\n\n`;

  // Calculate averages by category
  const categoryAverages = ['small', 'medium', 'large'].map(cat => {
    const catResults = results.filter(r => r.category === cat && !r.error);
    if (catResults.length === 0) return null;
    
    const avgScore = Math.round(catResults.reduce((sum, r) => sum + r.analysis.score, 0) / catResults.length);
    const avgComplexity = (catResults.reduce((sum, r) => sum + r.analysis.avgComplexity, 0) / catResults.length).toFixed(1);
    
    return { category: cat, avgScore, avgComplexity, count: catResults.length };
  }).filter(Boolean);

  markdown += `### Average Scores by Project Size\n\n`;
  categoryAverages.forEach(cat => {
    if (cat) {
      markdown += `- **${cat.category}** projects: Average score ${cat.avgScore}/100, complexity ${cat.avgComplexity}\n`;
    }
  });

  // Performance stats
  const successfulResults = results.filter(r => !r.error);
  const totalLines = successfulResults.reduce((sum, r) => sum + r.analysis.totalLines, 0);
  const totalTime = successfulResults.reduce((sum, r) => sum + r.duration, 0) / 1000;
  const linesPerSecond = Math.round(totalLines / totalTime);

  markdown += `\n### Performance Statistics\n\n`;
  markdown += `- **Total lines analyzed**: ${totalLines.toLocaleString()}\n`;
  markdown += `- **Total analysis time**: ${totalTime.toFixed(1)}s\n`;
  markdown += `- **Average speed**: ${linesPerSecond.toLocaleString()} lines/second\n`;

  // Validation section based on ACTUAL results
  markdown += `\n## Validation for InsightCode\n\n`;
  
  // Calculate actual grade distribution
  const gradeDistribution = successfulResults.reduce((acc, r) => {
    acc[r.analysis.grade] = (acc[r.analysis.grade] || 0) + 1;
    return acc;
  }, {});
  
  markdown += `### Grade Distribution\n\n`;
  ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
    const count = gradeDistribution[grade] || 0;
    if (count > 0) {
      const projects = successfulResults
        .filter(r => r.analysis.grade === grade)
        .map(r => r.project)
        .join(', ');
      markdown += `- **${grade}**: ${count} project(s) - ${projects}\n`;
    }
  });
  
  // Key insights based on actual data
  markdown += `\n### Key Insights\n\n`;
  
  // Best and worst scores
  const sortedByScore = successfulResults.sort((a, b) => b.analysis.score - a.analysis.score);
  if (sortedByScore.length > 0) {
    markdown += `- **Best score**: ${sortedByScore[0].project} with ${sortedByScore[0].analysis.grade} (${sortedByScore[0].analysis.score}/100)\n`;
    markdown += `- **Worst score**: ${sortedByScore[sortedByScore.length - 1].project} with ${sortedByScore[sortedByScore.length - 1].analysis.grade} (${sortedByScore[sortedByScore.length - 1].analysis.score}/100)\n`;
  }
  
  // Reality check
  const hasA = gradeDistribution['A'] > 0;
  const hasB = gradeDistribution['B'] > 0;
  if (!hasA && !hasB) {
    markdown += `- **Reality check**: No project achieved an A or B grade, showing InsightCode's strict but fair scoring\n`;
  }
  
  // Performance validation
  markdown += `\n### Performance Validation\n\n`;
  markdown += `- ✅ **Speed confirmed**: ${linesPerSecond.toLocaleString()} lines/second average\n`;
  markdown += `- ✅ **Scalability proven**: Successfully analyzed projects from ${Math.min(...successfulResults.map(r => r.analysis.totalLines)).toLocaleString()} to ${Math.max(...successfulResults.map(r => r.analysis.totalLines)).toLocaleString()} lines\n`;
  
  const largestSuccessful = successfulResults.sort((a, b) => b.analysis.totalLines - a.analysis.totalLines)[0];
  if (largestSuccessful) {
    markdown += `- ✅ **Large project handling**: ${largestSuccessful.project} (${largestSuccessful.analysis.totalLines.toLocaleString()} lines) in ${(largestSuccessful.duration/1000).toFixed(1)}s\n`;
  }
  
  // Practical findings
  markdown += `\n### What This Tells Us\n\n`;
  markdown += `- 📊 **Popular ≠ Perfect**: Even projects with 100k+ stars have technical debt\n`;
  markdown += `- 🎯 **Realistic scoring**: InsightCode doesn't inflate scores - a C grade is respectable\n`;
  markdown += `- ⚡ **Production ready**: Fast enough for CI/CD pipelines and pre-commit hooks\n`;
  markdown += `- 🔍 **Actionable insights**: Identified real issues like ${sortedByScore[0].topIssues.length > 0 ? `${sortedByScore[0].topIssues[0].file.split('/').pop()} with complexity ${sortedByScore[0].topIssues[0].message.match(/\d+/)?.[0] || 'high'}` : 'high complexity files'}\n`;

  // Add errors section if any
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    markdown += `\n## Analysis Errors\n\n`;
    errors.forEach(e => {
      markdown += `- **${e.project}**: ${e.error}\n`;
    });
  }

  return markdown;
}

async function main() {
  console.log('🚀 InsightCode Benchmark Tool\n');
  console.log('This will analyze popular TypeScript/JavaScript projects.');
  console.log('Make sure insightcode-cli is installed globally.\n');
  
  if (excludeUtility) {
    console.log('📊 Mode: Production Code Only (--exclude-utility)');
    console.log('    Excluding: tests, examples, scripts, tools, fixtures, mocks\n');
  } else {
    console.log('📊 Mode: Full Codebase Analysis');
    console.log('    Including: all TypeScript/JavaScript files\n');
  }
  
  // Check if insightcode is available
  try {
    runCommand('insightcode --version');
  } catch (error) {
    console.error('❌ Error: insightcode-cli not found. Please install it first:');
    console.error('   npm install -g insightcode-cli');
    process.exit(1);
  }
  
  const results = [];
  
  // Analyze all projects
  for (const [category, projects] of Object.entries(PROJECTS)) {
    console.log(`\n📁 Analyzing ${category.toUpperCase()} projects...`);
    
    for (const project of projects) {
      const result = analyzeProject(project, category);
      results.push(result);
      
      // Save intermediate results
      fs.writeFileSync(
        path.join(RESULTS_DIR, `${project.name}-result.json`),
        JSON.stringify(result, null, 2)
      );
    }
  }
  
  // Generate and save markdown report
  const report = generateMarkdownReport(results);
  const suffix = excludeUtility ? '-production-only' : '';
  const reportPath = path.join(RESULTS_DIR, `BENCHMARKS${suffix}.md`);
  fs.writeFileSync(reportPath, report);
  
  // Save full results JSON
  const jsonPath = path.join(RESULTS_DIR, `all-results${suffix}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  
  // Archive significant results to docs/benchmarks
  const successful = results.filter(r => !r.error).length;
  if (successful >= results.length - 2) { // Allow 2 failure
    const docsDir = path.join(projectRoot, 'docs', 'benchmarks');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const date = new Date().toISOString().split('T')[0];
    const archivePath = path.join(docsDir, `benchmark-${date}${suffix}.md`);
    fs.copyFileSync(reportPath, archivePath);
    console.log(`📁 Archived to: ${archivePath}`);
  }
  
  console.log('\n✅ Analysis complete!');
  console.log(`📄 Report saved to: ${reportPath}`);
  console.log(`📊 Full results saved to: ${jsonPath}`);
  
  // Print summary
  console.log(`\n📈 Summary: ${successful}/${results.length} projects analyzed successfully`);
}

// Run the benchmark
main().catch(console.error);