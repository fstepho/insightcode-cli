/**
 * Utilitaires partagés pour la génération de rapports
 */

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


export function getTopAffectedAreas(issues: any[]): string {
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

export function getPatternImplication(pattern: string, _category: string): string {
    const implications = {
        'deep-nesting': 'Hard to read and test',
        'long-function': 'Should be split into smaller functions',
        'high-complexity': 'Error-prone and hard to maintain',
        'too-many-params': 'Consider using object parameters',
        'god-function': 'Violates Single Responsibility',
        'async-heavy': 'Ensure proper error handling',
        'error-handling': 'Good defensive programming',
        'type-safe': 'Reduces runtime errors',
        'memory-intensive': 'Monitor for memory leaks',
        'io-heavy': 'Consider caching strategies',
        'input-validation': 'Security-conscious code',
        'test-file': 'Good test coverage'
    };
    
    return implications[pattern as keyof typeof implications] || 'Review for best practices';
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