import type { ExcludedFileDecision } from '@contextforge/contracts';

/** Génère le rapport JSON des fichiers exclus. */
export class ExclusionsGenerator {
  generate(excluded: ExcludedFileDecision[]): string {
    const list = excluded
      .map((d) => ({
        path: d.file.relativePath as string,
        reason: d.reason,
        reasonCode: d.reasonCode,
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
    return JSON.stringify(list, null, 2);
  }
}
