import type { ContextPackManifest } from '@contextforge/contracts';

/**
 * Génère le contenu du fichier README.md du pack.
 * Le README est déterministe : mêmes entrées → même sortie.
 */
export class ReadmeGenerator {
  /** Génère le contenu Markdown du README. */
  generate(manifest: ContextPackManifest): string {
    const lines: string[] = [];

    lines.push(`# ${manifest.name}`);
    lines.push('');
    lines.push(`**Objective** : ${manifest.objective}`);
    lines.push(`**Profile** : ${manifest.profile}`);
    lines.push(`**Generated** : ${manifest.generatedAt}`);
    lines.push('');
    lines.push('## 📦 Volumes');
    lines.push('');

    for (const volume of manifest.volumes) {
      lines.push(
        `- **Volume ${volume.index + 1}** : \`${volume.outputFileName}\` (${volume.fileCount} fichiers, ~${volume.estimatedTokens} tokens)`,
      );
    }

    lines.push('');
    lines.push('## 📊 Résumé');
    lines.push('');
    lines.push('| Catégorie | Compte |');
    lines.push('|---|---|');
    lines.push(`| Fichiers inclus | ${manifest.includedFiles.length} |`);
    lines.push(`| Fichiers exclus | ${manifest.excludedFiles.length} |`);
    lines.push(`| Fichiers bloqués | ${manifest.blockedFiles.length} |`);
    lines.push(`| Fichiers surdimensionnés | ${manifest.oversizedFiles.length} |`);
    lines.push(`| Fichiers en échec | ${manifest.failedFiles.length} |`);
    lines.push('');
    lines.push('## 🔒 Sécurité');
    lines.push('');
    lines.push(`- Findings : ${manifest.securitySummary.totalFindings}`);
    lines.push(`- Sévérité maximale : ${manifest.securitySummary.highestSeverity}`);
    lines.push(`- Fichiers bloqués : ${manifest.securitySummary.blockedFileCount}`);
    lines.push('');

    if (manifest.warnings.length > 0) {
      lines.push('## ⚠️ Avertissements');
      lines.push('');
      for (const w of manifest.warnings) {
        lines.push(`- ${w}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('*Généré par ContextForge*');

    return `${lines.join('\n')}\n`;
  }
}
