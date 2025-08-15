// src/reporter/quick-wins-reporter.ts


import chalk from 'chalk';
import { EffortLevel, QuickWin, QuickWinsAnalysis, ArchitecturalCriticality } from './types';
import { IdeLinkGenerator, IdeLinkOptions } from './ide-links';

export class QuickWinsReporter {

    private linkGenerator: IdeLinkGenerator;
    private enableLinks: boolean;
    constructor(options?: {
        ide?: IdeLinkOptions['ide'];
        projectRoot?: string;
        enableLinks?: boolean;
    }) {
        const ide = options?.ide || IdeLinkGenerator.detectIDE();
        this.enableLinks = options?.enableLinks ?? true;
        this.linkGenerator = new IdeLinkGenerator({
            ide,
            projectRoot: options?.projectRoot
        });
    }

    /**
     * Générer le rapport Quick Wins pour le terminal
     */
    /**
       * Générer le rapport Quick Wins pour le terminal avec liens cliquables
       */
    generateTerminalReport(analysis: QuickWinsAnalysis): string {
        const output: string[] = [];

        // Header styled like DEEP DIVE section
        const TOTAL_WIDTH = 110;
        output.push('');
        output.push(chalk.bold('QUICK WINS ANALYSIS'));
        output.push(chalk.gray('─'.repeat(TOTAL_WIDTH)));
        if (this.enableLinks) {
            output.push(chalk.dim('💡 Tip: Click on file paths to open them in your IDE'));
        }
        output.push('');
        // Summary
        output.push(chalk.bold('Summary:'));
        output.push(`  • Total potential score gain: ${chalk.green(`+${analysis.totalPotentialGain} points`)}`);
        output.push(`  • Quick wins identified: ${chalk.yellow(analysis.quickWins.length)}`);
        output.push(`  • Immediate wins (< 30min): ${chalk.green(analysis.summary.immediateWins)}`);
        output.push(`  • Estimated total effort: ${chalk.yellow(`${analysis.summary.estimatedHours.toFixed(1)} hours`)}`);
        output.push('');

        // Problem Patterns avec liens vers les fichiers les plus affectés
        if (analysis.problemPatterns && analysis.problemPatterns.length > 0) {
            output.push(chalk.bold('📊 Problem Patterns Breakdown:'));

            analysis.problemPatterns.forEach(pattern => {
                const emoji = this.getPatternEmoji(pattern.category);
                const bar = this.createProgressBar(pattern.percentage, 20);

                output.push(`  ${emoji} ${chalk.bold(pattern.category.padEnd(25, ' '))} ${chalk.yellow(pattern.count.toString().padStart(4, ' '))} wins (${chalk.gray(`${pattern.percentage}%`)}) ${bar}`);
                output.push(`    ${chalk.dim('└')} ${chalk.dim(pattern.description)}`);
                output.push(`    ${chalk.dim('└')} Avg gain: ${chalk.green(`+${pattern.averageGain}`)}, Effort: ${this.formatEffortLevel(pattern.averageEffort)}`);

                // Liens conditionnels vers les fichiers les plus affectés
                if (pattern.topFiles.length > 0) {
                    let linkedFiles: string;
                    if (this.enableLinks) {
                        linkedFiles = pattern.topFiles.map(file =>
                            this.linkGenerator.generateTerminalLink(file, undefined, chalk.cyan(this.shortenPath(file)))
                        ).join(', ');
                    } else {
                        linkedFiles = pattern.topFiles.map(file =>
                            chalk.cyan(this.shortenPath(file))
                        ).join(', ');
                    }
                    output.push(`    ${chalk.dim('└')} Top files: ${linkedFiles}`);
                }
                output.push('');
            });

            // Strategic Insights
            output.push(chalk.bold('🎯 Strategic Insights:'));
            const topPattern = analysis.problemPatterns[0];
            if (topPattern) {
                output.push(`  ${chalk.yellow('Primary concern:')} ${topPattern.category} (${topPattern.percentage}% of issues)`);
                output.push(`  ${chalk.blue('Recommendation:')} ${topPattern.strategicImplications}`);
                output.push('');
            }
        }

        // High Priority Wins avec liens cliquables
         output.push(chalk.bold.green('🎯 High Priority (ROI > 10):'));
        if (analysis.byPriority.high.length > 0) {
            const highPriorityWins = this.resolveWinsByIds(analysis.quickWins, analysis.byPriority.high.slice(0, 5));
            output.push(this.formatWinsTableWithLinks(highPriorityWins));
        } else {
            output.push(chalk.dim('  No high priority wins found.\n'));
        }

        // Medium Priority Wins avec liens cliquables

        output.push(chalk.bold.yellow('📊 Medium Priority (ROI 5-10):'));
        if (analysis.byPriority.medium.length > 0) {
            const mediumPriorityWins = this.resolveWinsByIds(analysis.quickWins, analysis.byPriority.medium.slice(0, 3));
            output.push(this.formatWinsTableWithLinks(mediumPriorityWins));
        } else {
            output.push(chalk.dim('  No medium priority wins found.\n'));
        }

        // Low Priority - Higher effort for lower return

        output.push(chalk.bold.red('⚠️ Low Priority (ROI < 5):'));
        // Use byPriority.low to avoid duplicates with high priority section
        if (analysis.byPriority.low.length > 0) {
            const lowPriorityWins = this.resolveWinsByIds(analysis.quickWins, analysis.byPriority.low.slice(0, 2));
            output.push(this.formatWinsTableWithLinks(lowPriorityWins));
        } else {
            output.push(chalk.dim('  No low priority wins found.\n'));
        }

        // Top Files avec liens conditionnels
        if (analysis.summary.topFiles.length > 0) {
            output.push(chalk.bold('\n📁 Focus on these files:'));
            analysis.summary.topFiles.forEach((file, i) => {
                const winCount = analysis.quickWins.filter(w => w.file === file).length;

                let fileDisplay: string;
                if (this.enableLinks) {
                    fileDisplay = this.linkGenerator.generateTerminalLink(file, undefined, chalk.cyan(file));
                } else {
                    fileDisplay = chalk.cyan(file);
                }

                output.push(`  ${i + 1}. ${fileDisplay} (${winCount} wins)`);
            });
        }

        return output.join('\n');
    }

    private formatWinsTableWithLinks(wins: QuickWin[]): string {
        const lines: string[] = [];
        wins.forEach((win, i) => {
            const num = chalk.dim(`${i + 1}.`);
            const gain = chalk.green(`+${win.scoreGain}`);
            const effort = this.colorizeEffort(win.effortEstimate);
            const roi = chalk.bold(`ROI: ${win.roi.toFixed(1)}`);

            lines.push(`  ${num} ${win.action}`);

            // CORRECTION : Utiliser enableLinks pour conditionner l'affichage
            let locationDisplay: string;
            if (this.enableLinks) {
                locationDisplay = this.linkGenerator.generateTerminalLink(
                    win.file,
                    win.line,
                    `${win.file}${win.function ? `#${win.function}` : ''}:${win.line}`
                );
            } else {
                locationDisplay = chalk.cyan(`${win.file}${win.function ? `#${win.function}` : ''}:${win.line}`);
            }

            lines.push(`     ${chalk.dim('Location:')} ${locationDisplay}`);
            lines.push(`     ${chalk.dim('Impact:')} ${gain} points | ${effort} | ${roi}`);
            lines.push('');
        });

        return lines.join('\n');
    }

    /**
     * NOUVEAU : Créer une barre de progression pour visualiser les pourcentages
     */
    private createProgressBar(percentage: number, width: number = 20): string {
        const filled = Math.round((percentage / 100) * width);
        const empty = width - filled;
        return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    }

    /**
     * NOUVEAU : Obtenir l'emoji approprié pour chaque catégorie de pattern
     */
    private getPatternEmoji(category: string): string {
        const emojis: Record<string, string> = {
            'Nesting Issues': '🏗️',
            'SRP Violations': '🎯',
            'High Complexity': '🧠',
            'Code Duplication': '📋',
            'API Design Issues': '🔌',
            'Structural Organization': '📁',
            'Other Issues': '🔧'
        };
        return emojis[category] || '•';
    }

    /**
     * NOUVEAU : Formater le niveau d'effort moyen
     */
    private formatEffortLevel(averageEffort: number): string {
        if (averageEffort < 1.5) return chalk.green('Trivial');
        if (averageEffort < 2.5) return chalk.yellow('Easy');
        if (averageEffort < 3.5) return chalk.white('Moderate');
        if (averageEffort < 4.5) return chalk.red('Hard');
        return chalk.red.bold('Complex');
    }

    /**
       * Générer le rapport Quick Wins pour Markdown avec liens cliquables
       */
    generateMarkdownReport(quickWinsAnalysis: QuickWinsAnalysis): string {
        let markdown = `## 🚀 Quick Wins Analysis\n\n`;

        // Tip conditionnel et explication ROI
        if (this.enableLinks) {
            markdown += `> 💡 **Tip**: Click on file paths to open them directly in your IDE!\n\n`;
        }
        
        markdown += `### 📊 ROI Methodology\n`;
        markdown += `**ROI Definition**: Return on Investment for code quality improvements\n`;
        markdown += `- **Formula**: ROI = Health Score Points ÷ Implementation Hours\n`;
        markdown += `- **Unit**: Health Points per Hour (HPH)\n`;
        markdown += `- **Examples**: ROI 12 = Simple nesting fix (5 levels), ROI 2.5 = Complex refactoring (15+ levels)\n`;
        markdown += `- **Effort Factors**: Complexity depth, architectural criticality, and function length\n`;
        markdown += `- **Uncertainty**: Estimates include ±25% to ±55% uncertainty range\n\n`;

        markdown += `### Quick wins Executive Summary

**Total Potential Score Gain: +${quickWinsAnalysis.totalPotentialGain} points**

| Metric | Value |
|--------|-------|
| Quick Wins Identified | ${quickWinsAnalysis.quickWins.length} |
| Immediate Wins (< 30min) | ${quickWinsAnalysis.summary.immediateWins} |
| Estimated Total Effort | ${quickWinsAnalysis.summary.estimatedHours.toFixed(1)} hours |
| Average ROI | ${(quickWinsAnalysis.quickWins.reduce((sum, w) => sum + w.roi, 0) / quickWinsAnalysis.quickWins.length).toFixed(1)} |

### 🎯 Top 10 Quick Wins by ROI

| Priority | File | Action | Criticality | Score Gain | Effort | ROI (HPH ±%) |
|----------|------|--------|-------------|------------|--------|--------------|
`;

        // Top 10 wins avec liens cliquables
        quickWinsAnalysis.quickWins.slice(0, 10).forEach(win => {
            const priority = this.getPriorityEmoji(win.priority);

            let fileDisplay: string;
            if (this.enableLinks) {
                fileDisplay = this.linkGenerator.generateMarkdownLink(
                    win.file,
                    win.line,
                    win.function ? `${this.shortenPath(win.file)}#${win.function}` : this.shortenPath(win.file)
                );
            } else {
                const displayName = win.function ? `${this.shortenPath(win.file)}#${win.function}` : this.shortenPath(win.file);
                fileDisplay = `\`${displayName}\``;
            }

            // Calculate uncertainty bounds for display
            const uncertaintyPercent = this.getUncertaintyPercent(win.effortEstimate);
            const roiDisplay = `${win.roi.toFixed(1)} ±${uncertaintyPercent}%`;
            
            // Format criticality with visual indicator
            const criticalityDisplay = this.formatCriticality(win.criticality);
            
            markdown += `| ${priority} | ${fileDisplay} | ${win.action} | ${criticalityDisplay} | +${win.scoreGain} | ${this.formatEffort(win.effortEstimate)} | ${roiDisplay} |\n`;
        });

        // Problem Patterns avec liens vers les fichiers
        if (quickWinsAnalysis.problemPatterns && quickWinsAnalysis.problemPatterns.length > 0) {
            markdown += '\n## 📊 Problem Patterns Breakdown\n\n';

            quickWinsAnalysis.problemPatterns.forEach(pattern => {
                const emoji = this.getPatternEmoji(pattern.category);
                markdown += `### ${emoji} ${pattern.category} (${pattern.count} wins, ${pattern.percentage}%)\n\n`;
                markdown += `${pattern.description}\n\n`;
                markdown += `**Statistics:**\n`;
                markdown += `- Count: ${pattern.count} wins\n`;
                markdown += `- Total potential gain: +${pattern.totalGain} points\n`;
                markdown += `- Average gain per fix: +${pattern.averageGain} points\n`;
                markdown += `- Average effort: ${this.formatEffortLevel(pattern.averageEffort)}\n\n`;

                // AMÉLIORATION : Liens cliquables vers les fichiers les plus affectés
                if (pattern.topFiles.length > 0) {
                    markdown += `**Most affected files:**\n`;
                    pattern.topFiles.forEach(file => {
                    let linkedFile: string;
                    if (this.enableLinks) {
                        linkedFile = this.linkGenerator.generateMarkdownLink(file, undefined, file);
                    } else {
                        linkedFile = `\`${file}\``;
                    }
                    markdown += `- ${linkedFile}\n`;
                    });
                    markdown += '\n';
                }

                markdown += `**Strategic implication:** ${pattern.strategicImplications}\n\n`;
                markdown += '---\n\n';
            });
        }

        // Strategic sections - nouvelles sections basées sur ROI + criticité
        if (quickWinsAnalysis.byStrategicValue.strategic.length > 0) {
            markdown += `\n## 🚀 Strategic Quick Wins\n`;
            markdown += `*High ROI improvements on architecturally critical files - maximum impact*\n\n`;
            const strategicWins = this.resolveWinsByIds(quickWinsAnalysis.quickWins, quickWinsAnalysis.byStrategicValue.strategic.slice(0, 5));
            markdown += this.generateDetailedWinsSectionWithLinks(strategicWins);
        }

        if (quickWinsAnalysis.byStrategicValue.standard.length > 0) {
            markdown += `\n## ✅ Standard Quick Wins\n`;
            markdown += `*Good ROI improvements on moderate impact files - ideal for new contributors*\n\n`;
            const standardWins = this.resolveWinsByIds(quickWinsAnalysis.quickWins, quickWinsAnalysis.byStrategicValue.standard.slice(0, 5));
            markdown += this.generateDetailedWinsSectionWithLinks(standardWins);
        }

        // Legacy sections (commentées mais gardées pour compatibilité)
        // if (analysis.byPriority.high.length > 0) {
        //     markdown += `\n### High Priority Quick Wins (ROI > 10)\n\n`;
        //     markdown += this.generateDetailedWinsSectionWithLinks(analysis.byPriority.high.slice(0, 5));
        // }

        // if (analysis.byPriority.medium.length > 0) {
        //     markdown += `\n### Medium Priority Quick Wins (ROI 5-10)\n\n`;
        //     markdown += this.generateDetailedWinsSectionWithLinks(analysis.byPriority.medium.slice(0, 5));
        // }

        // Implementation roadmap
        markdown += this.generateRoadmapWithLinks(quickWinsAnalysis);

        return markdown;
    }

    /**
     * NOUVEAU : Generate detailed wins section avec liens cliquables
     */
    private generateDetailedWinsSectionWithLinks(wins: QuickWin[]): string {
        let markdown = '';

        wins.forEach((win, i) => {
            let linkedFile: string;
            if (this.enableLinks) {
                linkedFile = this.linkGenerator.generateMarkdownLink(
                    win.file,
                    win.line,
                    win.file
                );
            } else {
                linkedFile = `\`${win.file}\``;
            }

            markdown += `#### ${i + 1}. ${win.action}\n\n`;
            markdown += `- **Location**: ${linkedFile}${win.function ? ` → \`${win.function}()\`` : ''} (line ${win.line})\n`;
            markdown += `- **Current**: ${win.currentValue} → **Target**: ${win.targetValue}\n`;
            markdown += `- **Score Gain**: +${win.scoreGain} points\n`;
            markdown += `- **Effort**: ${this.formatEffort(win.effortEstimate)}\n`;
            // Afficher ROI avec incertitude
            const uncertaintyPercent = this.getUncertaintyPercent(win.effortEstimate);
            markdown += `- **ROI**: ${win.roi.toFixed(1)} HPH (±${uncertaintyPercent}%)\n`;

            if (win.suggestion) {
                markdown += `\n<details>\n<summary>💡 Code Suggestion</summary>\n\n`;
                markdown += `**${win.suggestion.explanation}**\n\n`;
                markdown += `Before:\n\`\`\`typescript\n${win.suggestion.before}\n\`\`\`\n\n`;
                markdown += `After:\n\`\`\`typescript\n${win.suggestion.after}\n\`\`\`\n`;
                markdown += `</details>\n`;
            }

            markdown += '\n';
        });

        return markdown;
    }

    /**
     * NOUVEAU : Generate roadmap avec liens cliquables
     */
    private generateRoadmapWithLinks(analysis: QuickWinsAnalysis): string {
        let markdown = `\n## 📅 Implementation Roadmap\n\n`;

        // Phase 1: Quick wins (< 30 min)
        const phase1 = analysis.quickWins.filter(w =>
            w.effortEstimate === 'trivial' || w.effortEstimate === 'easy'
        );

        if (phase1.length > 0) {
            const phase1Gain = phase1.reduce((sum, w) => sum + w.scoreGain, 0);
            markdown += `### Phase 1: Quick Wins (${phase1.length} tasks, ~${(phase1.length * 0.25).toFixed(1)}h)\n`;
            markdown += `**Potential gain: +${phase1Gain} points**\n\n`;
            markdown += `Focus on:\n`;
            phase1.slice(0, 5).forEach(w => {
                // CORRECTION : Utiliser enableLinks pour les liens
                let linkedFile: string;
                if (this.enableLinks) {
                    linkedFile = this.linkGenerator.generateMarkdownLink(w.file, w.line, this.shortenPath(w.file));
                } else {
                    linkedFile = `\`${this.shortenPath(w.file)}\``;
                }
                markdown += `- [ ] ${w.action} in ${linkedFile} (+${w.scoreGain})\n`;
            });
            markdown += '\n';
        }
        // Phase 2: Medium effort
        const phase2 = analysis.quickWins.filter(w => w.effortEstimate === 'moderate');
        if (phase2.length > 0) {
            const phase2Gain = phase2.reduce((sum, w) => sum + w.scoreGain, 0);
            markdown += `### Phase 2: Medium Effort (${phase2.length} tasks, ~${phase2.length}h)\n`;
            markdown += `**Potential gain: +${phase2Gain} points**\n\n`;
            markdown += `Key refactorings:\n`;
            phase2.slice(0, 5).forEach(w => {
            // CORRECTION : Utiliser enableLinks pour les liens
            let linkedFile: string;
            if (this.enableLinks) {
                linkedFile = this.linkGenerator.generateMarkdownLink(w.file, w.line, this.shortenPath(w.file));
            } else {
                linkedFile = `\`${this.shortenPath(w.file)}\``;
            }
            markdown += `- [ ] ${w.action} in ${linkedFile} (+${w.scoreGain})\n`;
            });
            markdown += '\n';
        }

        // Phase 3: Major refactorings
        const phase3 = analysis.quickWins.filter(w =>
            w.effortEstimate === 'hard' || w.effortEstimate === 'complex'
        );
        if (phase3.length > 0) {
            const phase3Gain = phase3.reduce((sum, w) => sum + w.scoreGain, 0);
            markdown += `### Phase 3: Major Refactorings (${phase3.length} tasks, ~${(phase3.length * 3).toFixed(0)}h)\n`;
            markdown += `**Potential gain: +${phase3Gain} points**\n\n`;
            markdown += `Strategic improvements:\n`;
            phase3.slice(0, 3).forEach(w => {
            // CORRECTION : Utiliser enableLinks pour les liens
            let linkedFile: string;
            if (this.enableLinks) {
                linkedFile = this.linkGenerator.generateMarkdownLink(w.file, w.line, this.shortenPath(w.file));
            } else {
                linkedFile = `\`${this.shortenPath(w.file)}\``;
            }
            markdown += `- [ ] ${w.action} in ${linkedFile} (+${w.scoreGain})\n`;
            });
        }

        return markdown;
    }

    /**
     * Résoudre une liste d'IDs en objets QuickWin
     */
    private resolveWinsByIds(allWins: QuickWin[], ids: string[]): QuickWin[] {
        const winMap = new Map(allWins.map(win => [win.id, win]));
        return ids.map(id => winMap.get(id)).filter((win): win is QuickWin => win !== undefined);
    }
    

    /**
     * Helper methods
     */
    private getPriorityEmoji(priority: 1 | 2 | 3): string {
        return priority === 1 ? '🔴' : priority === 2 ? '🟡' : '🟢';
    }

    private shortenPath(path: string): string {
        const parts = path.split('/');
        if (parts.length > 3) {
            return `.../${parts.slice(-2).join('/')}`;
        }
        return path;
    }

    /**
     * Formater la criticité architecturale avec indicateurs visuels
     */
    private formatCriticality(criticality: ArchitecturalCriticality): string {
        const criticalityMap = {
            core: '🔥 Core',
            feature: '⭐ Feature', 
            api: '🔌 API',
            config: '⚙️ Config',
            isolated: '📝 Isolated'
        };
        return criticalityMap[criticality];
    }

    /**
     * Obtenir le pourcentage d'incertitude basé sur l'effort
     */
    private getUncertaintyPercent(effortLevel: EffortLevel): number {
        const uncertaintyMap = {
            trivial: 25,   // ±25%
            easy: 30,      // ±30%
            moderate: 40,  // ±40%
            hard: 50,      // ±50%
            complex: 55    // ±55%
        };
        return uncertaintyMap[effortLevel];
    }

    private formatEffort(effort: EffortLevel): string {
        const labels: Record<EffortLevel, string> = {
            trivial: '~15min',
            easy: '~30min',
            moderate: '~1h',
            hard: '~2h',
            complex: '~4h'
        };
        return labels[effort];
    }

    private colorizeEffort(effort: EffortLevel): string {
        const labels = this.formatEffort(effort);
        switch (effort) {
            case 'trivial':
            case 'easy':
                return chalk.green(labels);
            case 'moderate':
                return chalk.yellow(labels);
            case 'hard':
            case 'complex':
                return chalk.red(labels);
        }
    }
}