import type { PackableFile } from '@contextforge/core';

/**
 * Sorts packable files by relative path for stable, deterministic ordering.
 * Never mutates input.
 */
export function stableSort(input: readonly PackableFile[]): PackableFile[] {
  return [...input].sort((a, b) =>
    (a.file.relativePath as string).localeCompare(b.file.relativePath as string),
  );
}
