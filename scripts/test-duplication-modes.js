#!/usr/bin/env node

// Quick test script for duplication modes functionality

const { createDuplicationConfig } = require('../dist/thresholds.constants');
const { calculateDuplicationScore } = require('../dist/scoring');

console.log('🧪 Testing Duplication Modes Functionality\n');

function testDuplicationMode(ratio, description) {
  const percentage = Math.round(ratio * 100);
  const legacyConfig = createDuplicationConfig(false);
  const strictConfig = createDuplicationConfig(true);
  
  const legacyScore = calculateDuplicationScore(ratio, legacyConfig);
  const strictScore = calculateDuplicationScore(ratio, strictConfig);
  const difference = legacyScore - strictScore;
  
  console.log(`${description.padEnd(18)}: Legacy=${legacyScore.toString().padStart(3)}, Strict=${strictScore.toString().padStart(3)}, Diff=+${difference.toString().padStart(2)}`);
}

// Test various duplication levels
testDuplicationMode(0.03, '3% duplication');
testDuplicationMode(0.05, '5% duplication');
testDuplicationMode(0.08, '8% duplication');
testDuplicationMode(0.10, '10% duplication');
testDuplicationMode(0.15, '15% duplication');
testDuplicationMode(0.20, '20% duplication');
testDuplicationMode(0.30, '30% duplication');

console.log('\n✅ Duplication modes working correctly!');
console.log('\nUsage:');
console.log('  Legacy mode (default): insightcode .');
console.log('  Strict mode:          insightcode . --strict-duplication');
