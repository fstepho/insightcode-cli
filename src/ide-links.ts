import * as path from 'path';

export interface IdeLinkOptions {
  ide: 'vscode' | 'cursor' | 'webstorm' | 'sublime' | 'atom';
  projectRoot?: string;
}

export class IdeLinkGenerator {
  private projectRoot: string;
  private ide: IdeLinkOptions['ide'];

  constructor(options: IdeLinkOptions) {
    this.ide = options.ide;
    this.projectRoot = options.projectRoot || process.cwd();
  }

  /**
   * Génère un lien cliquable vers un fichier à une ligne spécifique
   */
  generateFileLink(relativePath: string, line?: number, column?: number): string {
    const absolutePath = path.resolve(this.projectRoot, relativePath);
    
    switch (this.ide) {
      case 'vscode':
      case 'cursor':
        return `vscode://file/${absolutePath}${line ? `:${line}` : ''}${column ? `:${column}` : ''}`;
      
      case 'webstorm':
        return `jetbrains://web-storm/navigate/reference?project=${path.basename(this.projectRoot)}&path=${relativePath}${line ? `&line=${line}` : ''}`;
      
      case 'sublime':
        return `subl://${absolutePath}${line ? `:${line}` : ''}${column ? `:${column}` : ''}`;
      
      case 'atom':
        return `atom://core/open/file?filename=${absolutePath}${line ? `&line=${line}` : ''}${column ? `&column=${column}` : ''}`;
      
      default:
        return `file://${absolutePath}`;
    }
  }

  /**
   * Génère un lien avec texte formaté pour le terminal
   */
  generateTerminalLink(relativePath: string, line?: number, displayText?: string): string {
    const link = this.generateFileLink(relativePath, line);
    const text = displayText || `${relativePath}${line ? `:${line}` : ''}`;
    
    // ANSI escape sequence pour les liens cliquables dans les terminaux modernes
    return `\x1b]8;;${link}\x1b\\${text}\x1b]8;;\x1b\\`;
  }

  /**
   * Génère un lien markdown
   */
  generateMarkdownLink(relativePath: string, line?: number, displayText?: string): string {
    const link = this.generateFileLink(relativePath, line);
    const text = displayText || `${relativePath}${line ? `:${line}` : ''}`;
    
    return `[${text}](${link})`;
  }

  /**
   * Détecte automatiquement l'IDE disponible
   */
  static detectIDE(): IdeLinkOptions['ide'] {
    // Vérifier les variables d'environnement communes
    if (process.env.VSCODE_PID || process.env.TERM_PROGRAM === 'vscode') {
      return 'vscode';
    }
    
    if (process.env.CURSOR_PID) {
      return 'cursor';
    }
    
    // Par défaut, utiliser VSCode (le plus commun)
    return 'vscode';
  }
}