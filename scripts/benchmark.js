#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const excludeUtility = args.includes('--exclude-utility');

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
    
    // Build command with proper flag handling
    const flags = ['--json'];
    if (excludeUtility) {
      flags.push('--exclude-utility');
    }
    const command = `insightcode analyze "${TEMP_DIR}" ${flags.join(' ')}`;
    
    const analysisOutput = runCommand(command, process.cwd());
    const analysis = JSON.parse(analysisOutput);
    
    // Extract top issues (max 3)
    const topFiles = Array.isArray(analysis.topFiles) ? analysis.topFiles : [];
    const topIssues = [];

    for (const file of topFiles) {
      if (topIssues.length >= 3) break;
      for (const issue of file.issues) {
        if (topIssues.length >= 3) break;
        topIssues.push({
          file: file.path.replace(/^temp-analysis\//, ''), // Remove temp-analysis prefix
          ...issue
        });
      }
    }
    
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
  const analysisType = excludeUtility ? 'Production Code Analysis' : 'Full Codebase Analysis';
  
  let markdown = `# InsightCode Benchmarks - ${analysisType}\n\n`;
  markdown += `## Methodology\n`;
  markdown += `- **Date**: ${date}\n`;
  markdown += `- **InsightCode Version**: ${getInsightCodeVersion()}\n`;
  markdown += `- **Analysis Type**: ${analysisType}\n`;
  if (excludeUtility) {
    markdown += `- **Excluded**: Tests, examples, scripts, tools, fixtures, mocks\n`;
  }
  markdown += `- **Total Projects Analyzed**: ${results.length}\n`;
  markdown += `- **Analysis Method**: Fresh clone, default settings, no modifications\n`;
  
  // New scoring system documentation
  markdown += `\n## Scoring System (v0.3.0+)\n\n`;
  markdown += `InsightCode uses graduated thresholds aligned with industry standards:\n\n`;
  markdown += `### Complexity (40% weight)\n`;
  markdown += `- ≤10: 100 points (Excellent)\n`;
  markdown += `- ≤15: 85 points (Good)\n`;
  markdown += `- ≤20: 65 points (Acceptable)\n`;
  markdown += `- ≤30: 40 points (Poor)\n`;
  markdown += `- ≤50: 20 points (Very Poor)\n`;
  markdown += `- >50: Graduated penalty\n\n`;
  
  markdown += `### Duplication (30% weight)\n`;
  markdown += `- ≤3%: 100 points (Industry leader)\n`;
  markdown += `- ≤8%: 85 points (Industry standard)\n`;
  markdown += `- ≤15%: 65 points (Acceptable)\n`;
  markdown += `- ≤30%: 40 points (Poor)\n`;
  markdown += `- ≤50%: 20 points (Very Poor)\n\n`;
  
  markdown += `### Maintainability (30% weight)\n`;
  markdown += `- Based on file size (≤200 lines = 100 points) and function count\n`;
  markdown += `- Additional penalties for files >1000 lines\n`;
  
  // Results summary table
  markdown += `\n## Results Summary\n\n`;
  markdown += `| Project | Stars | Category | Files | Lines | Score | Grade | Complexity | Duplication | Time |\n`;
  markdown += `|---------|-------|----------|-------|-------|-------|-------|------------|-------------|------|\n`;
  
  const sortedResults = [...results].sort((a, b) => {
    const order = { small: 0, medium: 1, large: 2 };
    if (order[a.category] !== order[b.category]) {
      return order[a.category] - order[b.category];
    }
    return a.project.localeCompare(b.project);
  });
  
  sortedResults.forEach(result => {
    const score = result.analysis.score;
    const grade = result.analysis.grade;
    
    // Highlight scores with bold for emphasis
    const formattedScore = result.error ? 'ERROR' : `**${score}**`;
    const formattedGrade = result.error ? 'N/A' : `**${grade}**`;
    
    markdown += `| ${result.project} | ${result.stars} | ${result.category} | `;
    markdown += `${result.analysis.totalFiles || 'N/A'} | `;
    markdown += `${result.analysis.totalLines ? result.analysis.totalLines.toLocaleString() : 'N/A'} | `;
    markdown += `${formattedScore} | ${formattedGrade} | `;
    markdown += `${result.analysis.avgComplexity || 'N/A'} | `;
    markdown += `${result.analysis.avgDuplication || 'N/A'}% | `;
    markdown += `${(result.duration / 1000).toFixed(1)}s |\n`;
  });
  
  // Detailed analysis for each project
  markdown += `\n## Detailed Analysis\n`;
  
  Object.entries(PROJECTS).forEach(([size, projects]) => {
    markdown += `\n### ${size.charAt(0).toUpperCase() + size.slice(1)} Projects\n\n`;
    
    projects.forEach(project => {
      const result = results.find(r => r.project === project.name);
      if (!result || result.error) return;
      
      const analysis = result.analysis;
      markdown += `#### ${project.name} (⭐ ${project.stars})\n`;
      markdown += `- **Score**: ${analysis.grade} (${analysis.score}/100)\n`;
      markdown += `- **Files**: ${analysis.totalFiles} files, ${analysis.totalLines.toLocaleString()} lines\n`;
      markdown += `- **Complexity**: ${analysis.avgComplexity} average\n`;
      markdown += `- **Duplication**: ${analysis.avgDuplication}%\n`;
      
      if (result.topIssues.length > 0) {
        markdown += `- **Top Issues**:\n`;
        result.topIssues.forEach(issue => {
          markdown += `  - \`${issue.file}\`: ${issue.message}\n`;
        });
      }
      
      markdown += '\n';
    });
  });
  
  // Key findings section
  markdown += `## Key Findings\n\n`;
  
  // Calculate averages by category
  const categoryStats = {};
  ['small', 'medium', 'large'].forEach(cat => {
    const catResults = results.filter(r => r.category === cat && !r.error);
    if (catResults.length > 0) {
      categoryStats[cat] = {
        avgScore: Math.round(catResults.reduce((sum, r) => sum + r.analysis.score, 0) / catResults.length),
        avgComplexity: Math.round(catResults.reduce((sum, r) => sum + r.analysis.avgComplexity, 0) / catResults.length * 10) / 10
      };
    }
  });
  
  markdown += `### Average Scores by Project Size\n\n`;
  Object.entries(categoryStats).forEach(([cat, stats]) => {
    markdown += `- **${cat}** projects: Average score ${stats.avgScore}/100, complexity ${stats.avgComplexity}\n`;
  });
  
  // Performance stats
  const successfulResults = results.filter(r => !r.error);
  const totalLines = successfulResults.reduce((sum, r) => sum + (r.analysis.totalLines || 0), 0);
  const totalTime = successfulResults.reduce((sum, r) => sum + r.duration, 0) / 1000;
  const linesPerSecond = totalTime > 0 ? Math.round(totalLines / totalTime) : 0;

  markdown += `\n### Performance Statistics\n\n`;
  markdown += `- **Total lines analyzed**: ${totalLines.toLocaleString()}\n`;
  markdown += `- **Total analysis time**: ${totalTime.toFixed(1)}s\n`;
  markdown += `- **Average speed**: ${linesPerSecond.toLocaleString()} lines/second\n`;

  // Validation section with new scoring insights
  markdown += `\n## Validation for InsightCode\n\n`;
  
  // Grade distribution with new thresholds
  const gradeDistribution = successfulResults.reduce((acc, r) => {
    acc[r.analysis.grade] = (acc[r.analysis.grade] || 0) + 1;
    return acc;
  }, {});
  
  markdown += `### Grade Distribution (v0.3.0 Scoring)\n\n`;
  ['A', 'B', 'C', 'D', 'F'].forEach(grade => {
    const count = gradeDistribution[grade] || 0;
    if (count > 0) {
      const projects = successfulResults
        .filter(r => r.analysis.grade === grade)
        .map(r => r.project)
        .join(', ');
      const percentage = Math.round((count / successfulResults.length) * 100);
      markdown += `- **${grade}**: ${count} project(s) (${percentage}%) - ${projects}\n`;
    }
  });
  
  // Complexity distribution validation
  markdown += `\n### Complexity Distribution\n\n`;
  const complexityRanges = [
    { max: 10, label: 'Excellent (≤10)' },
    { max: 15, label: 'Good (≤15)' },
    { max: 20, label: 'Acceptable (≤20)' },
    { max: 30, label: 'Poor (≤30)' },
    { max: 50, label: 'Very Poor (≤50)' },
    { max: Infinity, label: 'Critical (>50)' }
  ];
  
  complexityRanges.forEach(range => {
    const count = successfulResults.filter(r => {
      const complexity = r.analysis.avgComplexity;
      const prevMax = complexityRanges[complexityRanges.indexOf(range) - 1]?.max || 0;
      return complexity > prevMax && complexity <= range.max;
    }).length;
    
    if (count > 0) {
      const percentage = Math.round((count / successfulResults.length) * 100);
      markdown += `- **${range.label}**: ${count} projects (${percentage}%)\n`;
    }
  });
  
  // Best and worst scores
  const sortedByScore = successfulResults.sort((a, b) => b.analysis.score - a.analysis.score);
  if (sortedByScore.length > 0) {
    markdown += `\n### Score Extremes\n\n`;
    markdown += `- **Best score**: ${sortedByScore[0].project} with ${sortedByScore[0].analysis.grade} (${sortedByScore[0].analysis.score}/100)\n`;
    markdown += `- **Worst score**: ${sortedByScore[sortedByScore.length - 1].project} with ${sortedByScore[sortedByScore.length - 1].analysis.grade} (${sortedByScore[sortedByScore.length - 1].analysis.score}/100)\n`;
    
    // Show scoring breakdown for best and worst
    const best = sortedByScore[0];
    const worst = sortedByScore[sortedByScore.length - 1];
    
    markdown += `\n### Scoring Breakdown Examples\n\n`;
    markdown += `**${best.project}** (Best):\n`;
    markdown += `- Complexity: ${best.analysis.avgComplexity} → ~85-100 points\n`;
    markdown += `- Duplication: ${best.analysis.avgDuplication}% → ~85-100 points\n`;
    markdown += `- Final: ${best.analysis.score}/100\n\n`;
    
    markdown += `**${worst.project}** (Worst):\n`;
    markdown += `- Complexity: ${worst.analysis.avgComplexity} → ~5-20 points\n`;
    markdown += `- Duplication: ${worst.analysis.avgDuplication}% → ~20-65 points\n`;
    markdown += `- Final: ${worst.analysis.score}/100\n`;
  }
  
  // Performance validation
  markdown += `\n### Performance Validation\n\n`;
  markdown += `- ✅ **Speed confirmed**: ${linesPerSecond.toLocaleString()} lines/second average\n`;
  markdown += `- ✅ **Scalability proven**: Successfully analyzed projects from ${Math.min(...successfulResults.map(r => r.analysis.totalLines))} to ${Math.max(...successfulResults.map(r => r.analysis.totalLines)).toLocaleString()} lines\n`;
  
  const largestProject = sortedResults.find(r => r.analysis.totalLines === Math.max(...successfulResults.map(r => r.analysis.totalLines)));
  if (largestProject) {
    markdown += `- ✅ **Large project handling**: ${largestProject.project} (${largestProject.analysis.totalLines.toLocaleString()} lines) in ${(largestProject.duration / 1000).toFixed(1)}s\n`;
  }
  
  // Find most complex file if available
  const complexFiles = results
    .flatMap(r => r.topIssues || [])
    .filter(issue => issue.severity === 'high' && issue.type === 'complexity')
    .map(issue => {
      const match = issue.message.match(/complexity: (\d+)/);
      return match ? { file: issue.file, complexity: parseInt(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.complexity - a.complexity);
  
  if (complexFiles.length > 0) {
    markdown += `- 🔍 **Actionable insights**: Identified real issues like ${complexFiles[0].file} with complexity ${complexFiles[0].complexity}\n`;
  }
  
  return markdown;
}

// Helper to get InsightCode version
function getInsightCodeVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
    return packageJson.version || '0.3.0';
  } catch {
    return '0.3.0';
  }
}

async function main() {
  console.log('🚀 InsightCode Benchmark Tool\n');
  console.log('This will analyze popular TypeScript/JavaScript projects.');
  console.log('Make sure insightcode-cli is installed globally.\n');
  
  if (excludeUtility) {
    console.log('📊 Mode: Production Code Analysis');
    console.log('    Excluding: tests, examples, scripts, tools, fixtures, mocks\n');
  } else {
    console.log('📊 Mode: Full Codebase Analysis');
    console.log('    Including: all TypeScript/JavaScript files\n');
  }
  
  // Check if insightcode is available
  try {
    const versionOutput = runCommand('insightcode --version', process.cwd());
    console.log(`📦 Using InsightCode ${versionOutput.trim()}\n`);
  } catch (error) {
    console.error('❌ Error: insightcode-cli not found. Please install it first:');
    console.error('   npm install -g insightcode-cli');
    process.exit(1);
  }
  
  // Test if --exclude-utility flag is supported
  if (excludeUtility) {
    try {
      // Test with a simple help command to see if the flag exists
      runCommand('insightcode analyze --help', process.cwd());
      // Note: We can't easily test if --exclude-utility is supported without actually running it
      console.log('⚠️  Note: Make sure your InsightCode version supports --exclude-utility flag\n');
    } catch (error) {
      // Help command failed, but continue anyway
    }
  }
  
  const results = [];
  
  // Analyze all projects
  for (const [category, projects] of Object.entries(PROJECTS)) {
    console.log(`\n📁 Analyzing ${category.toUpperCase()} projects...`);
    
    for (const project of projects) {
      const result = analyzeProject(project, category);
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
  if (successful >= results.length - 2) { // Allow 2 failures
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
  
  // Show mode-specific insights
  if (excludeUtility && successful > 0) {
    const avgScore = Math.round(
      results.filter(r => !r.error).reduce((sum, r) => sum + r.analysis.score, 0) / successful
    );
    console.log(`📉 Average production code score: ${avgScore}/100`);
  }
}

// Run the benchmark
main().catch(console.error);