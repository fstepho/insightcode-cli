#!/usr/bin/env node
/**
 * Script to fix obsolete 40/30/30 weight references in benchmark files
 * Updates them to current 45/30/25 system with proper disclaimers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

// Files to update - only archive/legacy files, not current reports
const LEGACY_FILES_TO_UPDATE = [
  'benchmarks/archives/benchmark-2025-06-28.md',
  'benchmarks/archives/benchmark-2025-06-28-production-only.md', 
  'benchmarks/archives/benchmark-2025-06-29.md',
  'benchmarks/archives/benchmark-2025-06-29-production-only.md',
  'benchmarks/archives/benchmark-explanations-comparison-2025-06-28.md',
  'benchmarks/archives/benchmark-explanations-comparison-2025-06-29.md',
  'benchmarks/archives/benchmark-explanations-2025-06-29-production-only.md'
];

function updateFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  // Update 40/30/30 formulas to 45/30/25
  const formula40Pattern = /Score = \(Complexity Score × 40%\) \+ \(Duplication Score × 30%\) \+ \(Maintainability Score × 30%\)/g;
  if (formula40Pattern.test(content)) {
    content = content.replace(formula40Pattern, 
      'Score = (Complexity Score × 45%) + (Maintainability Score × 30%) + (Duplication Score × 25%) [Updated from legacy 40/30/30]');
    updated = true;
  }

  // Update weight descriptions
  const complexityWeightPattern = /#### 1\. Cyclomatic Complexity Score \(40% weight\)/g;
  if (complexityWeightPattern.test(content)) {
    content = content.replace(complexityWeightPattern, 
      '#### 1. Cyclomatic Complexity Score (45% weight - internal hypothesis)');
    updated = true;
  }

  const duplicationWeightPattern = /#### 2\. Code Duplication Score \(30% weight\)/g;
  if (duplicationWeightPattern.test(content)) {
    content = content.replace(duplicationWeightPattern, 
      '#### 2. Code Duplication Score (25% weight - internal hypothesis)');
    updated = true;
  }

  const maintainabilityWeightPattern = /#### 3\. Maintainability Score \(30% weight\)/g;
  if (maintainabilityWeightPattern.test(content)) {
    content = content.replace(maintainabilityWeightPattern, 
      '#### 3. Maintainability Score (30% weight - internal hypothesis)');
    updated = true;
  }

  // Update scoring system headers
  const scoringSystemPattern = /### Complexity \(40% weight\)/g;
  if (scoringSystemPattern.test(content)) {
    content = content.replace(scoringSystemPattern, 
      '### Complexity (45% weight - internal hypothesis)');
    updated = true;
  }

  const duplicationSystemPattern = /### Duplication \(30% weight\)/g;
  if (duplicationSystemPattern.test(content)) {
    content = content.replace(duplicationSystemPattern, 
      '### Duplication (25% weight - internal hypothesis)');
    updated = true;
  }

  // Add historical note at the beginning if this is an archive file
  if (filePath.includes('archives/') && !content.includes('⚠️ Historical Document')) {
    const headerInsert = `> **⚠️ Historical Document**: This document uses legacy weight system (40/30/30). Current system uses 45/30/25 with internal hypothesis disclaimers. See current documentation for up-to-date information.

`;
    content = headerInsert + content;
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing obsolete weight references in legacy benchmark files...\n');
  
  let totalUpdated = 0;
  
  for (const filePath of LEGACY_FILES_TO_UPDATE) {
    if (updateFile(filePath)) {
      totalUpdated++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Files processed: ${LEGACY_FILES_TO_UPDATE.length}`);
  console.log(`- Files updated: ${totalUpdated}`);
  console.log(`- Files unchanged: ${LEGACY_FILES_TO_UPDATE.length - totalUpdated}`);
  
  if (totalUpdated > 0) {
    console.log('\n✅ Weight reference cleanup completed!');
    console.log('📝 Review the changes and commit if satisfied.');
  } else {
    console.log('\nℹ️  All files were already up to date.');
  }
}

if (require.main === module) {
  main();
}
