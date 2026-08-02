/**
 * Résout le langage Markdown à utiliser pour les blocs de code
 * en fonction de l'extension du fichier.
 */
export class MarkdownLanguageResolver {
  /** Table de correspondance extension → langage Markdown. */
  private static readonly LANG_MAP: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.json': 'json',
    '.md': 'markdown',
    '.mdx': 'mdx',
    '.css': 'css',
    '.html': 'html',
    '.py': 'python',
    '.rs': 'rust',
    '.go': 'go',
    '.java': 'java',
    '.cs': 'csharp',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.txt': 'text',
    '.xml': 'xml',
    '.sql': 'sql',
    '.sh': 'bash',
    '.bash': 'bash',
    '.rb': 'ruby',
    '.php': 'php',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
  };

  /**
   * Résout le langage Markdown à partir de l'extension d'un fichier.
   * Retourne 'text' pour les extensions inconnues.
   */
  resolve(extension: string): string {
    const normalized = extension.toLowerCase();
    return MarkdownLanguageResolver.LANG_MAP[normalized] ?? 'text';
  }
}
