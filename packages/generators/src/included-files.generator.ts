import type { IncludedFileDecision } from '@contextforge/contracts';

/**
 * Génère la liste JSON des fichiers inclus dans le pack.
 */
export class IncludedFilesGenerator {
  generate(included: IncludedFileDecision[]): string {
    const list = included
      .map((d) => ({
        path: d.file.relativePath as string,
        estimatedTokens: d.estimatedTokens,
        category: d.category,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));

    return JSON.stringify(list, null, 2);
  }
}
