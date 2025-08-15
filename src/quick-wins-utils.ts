// src/quick-wins-utils.ts

import { 
  QuickWin, 
  QualityPattern, 
  ArchitecturePattern, 
  FileIssueType,
  QUICKWIN_TO_PATTERN_MAPPING 
} from './types.js';

/**
 * Get categorization info for a QuickWin using the unified mapping
 */
export function getQuickWinCategory(win: QuickWin): {
  key: string;
  name: string;
  description: string;
  pattern: QualityPattern | ArchitecturePattern | FileIssueType;
  category: 'quality' | 'architecture' | 'file';
  severity: string;
  severityDesc: string;
  currentValue: number;
} {
  const mapping = QUICKWIN_TO_PATTERN_MAPPING[win.type];
  const { pattern, category, thresholds } = mapping;
  
  // Generate severity-based description
  const currentValue = win.currentValue;
  let severity = 'moderate';
  let severityDesc = '';
  
  if (thresholds.critical && currentValue >= thresholds.critical) {
    severity = 'critical';
    severityDesc = ` (${currentValue} ≥ ${thresholds.critical})`;
  } else if (thresholds.high && currentValue >= thresholds.high) {
    severity = 'high'; 
    severityDesc = ` (${currentValue} ≥ ${thresholds.high})`;
  }
  
  // Pattern-based naming and descriptions
  const categoryInfo = getCategoryInfo(pattern, severity);
  
  return {
    key: pattern, // Use pattern only, not severity-pattern
    name: categoryInfo.name,
    description: categoryInfo.description, // Remove severity from description
    pattern,
    category,
    severity,
    severityDesc,
    currentValue
  };
}

/**
 * Get category information based on pattern type
 */
function getCategoryInfo(pattern: QualityPattern | ArchitecturePattern | FileIssueType, _severity: string) {
  // Quality patterns
  if (['high-complexity', 'critical-complexity', 'medium-complexity'].includes(pattern as string)) {
    return {
      name: 'High Complexity',
      description: 'Complex logic paths requiring simplification'
    };
  }
  
  if (pattern === 'deep-nesting') {
    return {
      name: 'Control Flow Complexity',
      description: 'Nested control structures reducing readability'
    };
  }
  
  if (pattern === 'god-function') {
    return {
      name: 'God Functions',
      description: 'Functions handling multiple distinct responsibilities'
    };
  }
  
  if (pattern === 'too-many-params') {
    return {
      name: 'Parameter Overload',
      description: 'Functions with excessive parameter count'
    };
  }
  
  if (pattern === 'multiple-responsibilities') {
    return {
      name: 'Multiple Responsibilities',
      description: 'Code mixing different concerns or domains'
    };
  }
  
  // File patterns
  if (pattern === 'large-file') {
    return {
      name: 'Large Files',
      description: 'Files exceeding optimal size thresholds'
    };
  }
  
  if (pattern === 'high-duplication') {
    return {
      name: 'Code Duplication',
      description: 'Code repetition reducing maintainability'
    };
  }
  
  // Architecture patterns
  if (pattern === 'async-heavy') {
    return {
      name: 'Performance Optimization',
      description: 'Functions with caching or computation optimization potential'
    };
  }
  
  // Default fallback
  return {
    name: pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: 'Code quality improvement opportunity'
  };
}