/**
 * Utilitaires partagés pour la génération de rapports
 */

import { 
    FunctionPatternType, 
    QualityPattern, 
    ArchitecturePattern, 
    PerformancePattern,
    SecurityPattern,
    TestingPattern 
} from './types';

// Utility functions
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Formats a large number into a 'k' (thousands) format.
 */
export function formatK(num: number): string {
    return num > 999 ? `${(num / 1000).toFixed(0)}k` : `${num}`;
}

/**
 * Truncates and formats a file path for concise display.
 */
export function truncatePath(filePath: string, maxLength: number): string {
    if (filePath.length <= maxLength) {
        return filePath;
    }
    const parts = filePath.split('/');
    if (parts.length > 2) {
        const end = parts.pop() || '';
        const start = parts.shift() || '';
        const shortPath = `${start}/.../${end}`;
        if (shortPath.length <= maxLength) return shortPath;
    }
    return '...' + filePath.slice(-maxLength + 3);
}

/**
 * Pads a string with trailing spaces to a specific length, ignoring ANSI codes.
 */
export function padEnd(str: string, length: number): string {
    const visibleLength = str.replace(/\x1b\[[0-9;]*m/g, '').length;
    return str + ' '.repeat(Math.max(0, length - visibleLength));
}

export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export function getTopAffectedAreas(issues: Array<{ file: string; [key: string]: unknown }>): string {
    const fileCounts = new Map<string, number>();
    issues.forEach(issue => {
        const dir = issue.file.split('/').slice(0, -1).join('/') || 'root';
        fileCounts.set(dir, (fileCounts.get(dir) || 0) + 1);
    });
    
    return Array.from(fileCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([dir]) => dir)
        .join(', ');
}


export function generatePatternTable(patterns: Map<string, number>, category: string): string {
    let markdown = `| Pattern | Occurrences | Implication |\n`;
    markdown += `|---------|-------------|-------------|\n`;
    
    Array.from(patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
            markdown += `| ${formatPatternName(pattern)} | ${count} | ${getPatternImplication(pattern, category)} |\n`;
        });
    
    markdown += `\n`;
    return markdown;
}

export function formatPatternName(pattern: string): string {
    return pattern.split('-').map(capitalize).join(' ');
}

export function getPatternImplication(pattern: FunctionPatternType | string, _category: string): string {
    const implications: Partial<Record<FunctionPatternType, string>> = {
        // Quality patterns
        'deep-nesting': 'Hard to read and test',
        'long-function': 'Should be split into smaller functions',
        'high-complexity': 'Error-prone and hard to maintain',
        'too-many-params': 'Consider using object parameters',
        'god-function': 'Violates Single Responsibility',
        'single-responsibility': 'Clean separation of concerns',
        'pure-function': 'Predictable and testable',
        'well-named': 'Self-documenting code',
        
        // Architecture patterns
        'async-heavy': 'Ensure proper error handling',
        'error-handling': 'Good defensive programming',
        'type-safe': 'Reduces runtime errors',
        
        // Performance patterns
        'memory-intensive': 'Monitor for memory leaks',
        'io-heavy': 'Consider caching strategies',
        'caching': 'Improves response times',
        
        // Security patterns
        'input-validation': 'Security-conscious code',
        'auth-check': 'Proper access control',
        
        // Testing patterns
        'test-file': 'Good test coverage',
        'mock-heavy': 'Isolated unit testing'
    };
    
    return implications[pattern as FunctionPatternType] || 'Review for best practices';
}

// Pattern type guards - these check if a string is a valid pattern of a specific category
export function isQualityPattern(pattern: string): pattern is QualityPattern {
    const qualityPatterns: readonly QualityPattern[] = [
        'deep-nesting', 'long-function', 'high-complexity', 'too-many-params',
        'god-function', 'single-responsibility', 'pure-function', 'well-named'
    ];
    return qualityPatterns.includes(pattern as QualityPattern);
}

export function isArchitecturePattern(pattern: string): pattern is ArchitecturePattern {
    const architecturePatterns: readonly ArchitecturePattern[] = [
        'async-heavy', 'error-handling', 'type-safe', 'dependency-injection',
        'factory-pattern', 'observer-pattern'
    ];
    return architecturePatterns.includes(pattern as ArchitecturePattern);
}

export function isPerformancePattern(pattern: string): pattern is PerformancePattern {
    const performancePatterns: readonly PerformancePattern[] = [
        'memory-intensive', 'cpu-intensive', 'io-heavy', 'caching', 'lazy-loading'
    ];
    return performancePatterns.includes(pattern as PerformancePattern);
}

export function isSecurityPattern(pattern: string): pattern is SecurityPattern {
    const securityPatterns: readonly SecurityPattern[] = [
        'input-validation', 'sql-injection-risk', 'xss-risk', 'auth-check', 'sanitization'
    ];
    return securityPatterns.includes(pattern as SecurityPattern);
}

export function isTestingPattern(pattern: string): pattern is TestingPattern {
    const testingPatterns: readonly TestingPattern[] = [
        'test-file', 'mock-heavy', 'integration-test', 'unit-test'
    ];
    return testingPatterns.includes(pattern as TestingPattern);
}

export type PatternCategory = 'quality' | 'architecture' | 'performance' | 'security' | 'testing';

/**
 * Get the category of a pattern (quality, architecture, performance, etc.)
 */
export function getPatternCategory(pattern: string): PatternCategory | null {
    if (isQualityPattern(pattern)) {
        return 'quality';
    }
    if (isArchitecturePattern(pattern)) {
        return 'architecture';
    }
    if (isPerformancePattern(pattern)) {
        return 'performance';
    }
    if (isSecurityPattern(pattern)) {
        return 'security';
    }
    if (isTestingPattern(pattern)) {
        return 'testing';
    }
    return null;
}

export function inferFileRole(filePath: string): string {
    const fileName = filePath.split('/').pop()?.toLowerCase() || '';
    
    if (fileName.includes('index')) return 'Entry point';
    if (fileName.includes('config')) return 'Configuration';
    if (fileName.includes('util') || fileName.includes('helper')) return 'Utilities';
    if (fileName.includes('type') || fileName.includes('interface')) return 'Type definitions';
    if (fileName.includes('router') || fileName.includes('route')) return 'Routing';
    if (fileName.includes('controller')) return 'Controller';
    if (fileName.includes('service')) return 'Service layer';
    if (fileName.includes('model')) return 'Data model';
    
    return 'Core module';
}


export function generateSection(title: string, content: string | string[]): string {
    const contentStr = Array.isArray(content) ? content.join('\n') : content;
    return `## ${title}\n\n${contentStr}\n\n`;
}