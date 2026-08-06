import type {
  ContextPackManifest,
  ContextPackPreview,
  FileDecision,
  IncludedFileDecision,
  PackVolume,
} from '@contextforge/contracts';
import { ContextVolumeGenerator } from './context-volume.generator.js';
import { ReadmeGenerator } from './readme.generator.js';

export interface ContextPackOutputInput {
  readonly manifest: ContextPackManifest;
  readonly preview: ContextPackPreview;
  readonly volumes: readonly PackVolume[];
  readonly contents: ReadonlyMap<string, string>;
}

/** Génère l'ensemble déterministe des fichiers écrits dans un Context Pack. */
export class ContextPackOutputGenerator {
  private readonly readmeGenerator = new ReadmeGenerator();
  private readonly volumeGenerator = new ContextVolumeGenerator();

  generate(input: ContextPackOutputInput): ReadonlyMap<string, string> {
    const files = new Map<string, string>();
    const included = input.preview.decisions.filter(
      (decision): decision is IncludedFileDecision => decision.status === 'included',
    );

    files.set('README.md', this.readmeGenerator.generate(input.manifest));

    for (const volume of input.volumes) {
      const fileIds = new Set(volume.fileIds);
      const volumeFiles = included.filter((decision) => fileIds.has(decision.file.id));
      files.set(
        volume.outputFileName,
        this.volumeGenerator.generate(volumeFiles, volume.index + 1, input.contents),
      );
    }

    files.set('manifest.json', `${JSON.stringify(input.manifest, null, 2)}\n`);
    files.set('included-files.md', this.generateIncludedFiles(included));
    files.set('exclusions.md', this.generateExclusions(input.preview.decisions));
    files.set('warnings.md', this.generateWarnings(input.preview.warnings));
    return files;
  }

  private generateIncludedFiles(decisions: readonly IncludedFileDecision[]): string {
    const lines = [
      '# Fichiers inclus',
      '',
      '| Chemin | Catégorie | Tokens estimés |',
      '|---|---|---:|',
    ];

    for (const decision of [...decisions].sort((a, b) =>
      String(a.file.relativePath).localeCompare(String(b.file.relativePath)),
    )) {
      lines.push(
        `| ${this.escapeCell(String(decision.file.relativePath))} | ${this.escapeCell(decision.category)} | ${decision.estimatedTokens} |`,
      );
    }

    return `${lines.join('\n')}\n`;
  }

  private generateExclusions(decisions: readonly FileDecision[]): string {
    const rows = decisions
      .filter((decision) => decision.status !== 'included')
      .map((decision) => {
        if (decision.status === 'failed') {
          return {
            path: decision.relativePath,
            status: decision.status,
            reason: decision.message,
          };
        }

        const reason = decision.status === 'oversized' ? decision.recommendation : decision.reason;
        return {
          path: String(decision.file.relativePath),
          status: decision.status,
          reason,
        };
      })
      .sort((a, b) => a.path.localeCompare(b.path));

    const lines = ['# Exclusions', '', '| Chemin | Statut | Motif |', '|---|---|---|'];
    for (const row of rows) {
      lines.push(
        `| ${this.escapeCell(row.path)} | ${row.status} | ${this.escapeCell(row.reason)} |`,
      );
    }
    return `${lines.join('\n')}\n`;
  }

  private generateWarnings(warnings: readonly string[]): string {
    const lines = ['# Avertissements', ''];
    if (warnings.length === 0) {
      lines.push('Aucun avertissement.');
    } else {
      lines.push(...warnings.map((warning) => `- ${warning}`));
    }
    return `${lines.join('\n')}\n`;
  }

  private escapeCell(value: string): string {
    return value.replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
  }
}
