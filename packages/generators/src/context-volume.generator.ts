import type { IncludedFileDecision } from '@contextforge/contracts';
import { MarkdownLanguageResolver } from './markdown-language-resolver';

/**
 * Génère un volume de contexte Markdown contenant le code des fichiers inclus.
 * Déterministe : mêmes entrées → même sortie.
 */
export class ContextVolumeGenerator {
  private readonly langResolver = new MarkdownLanguageResolver();

  /**
   * Génère le contenu Markdown d'un volume.
   * @param files Fichiers inclus dans ce volume (triés par chemin).
   * @param volumeIndex Index du volume (commence à 1).
   * @param contents Map chemin → contenu texte du fichier.
   */
  generate(
    files: IncludedFileDecision[],
    volumeIndex: number,
    contents: Map<string, string>,
  ): string {
    const lines: string[] = [];

    lines.push(`# Contexte — Volume ${volumeIndex}`);
    lines.push('');
    lines.push(`**Fichiers** : ${files.length}`);
    lines.push('');

    for (const decision of files) {
      const path = decision.file.relativePath as string;
      const content = contents.get(path) ?? '';
      const lang = this.langResolver.resolve(decision.file.extension);

      lines.push(`## \`${path}\``);
      lines.push('');
      lines.push(`\`\`\`${lang}`);
      // N'inclut pas de contenu avec des secrets bruts
      lines.push(content);
      lines.push('```');
      lines.push('');
    }

    return lines.join('\n');
  }
}
