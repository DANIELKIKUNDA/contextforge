import type { OversizedFile, PackableFile } from '@contextforge/core';

/**
 * Identifies files that exceed the token limit for a single volume.
 * These files are excluded from packing and reported separately.
 */
export function classifyOversizedFiles(
  files: readonly PackableFile[],
  tokenLimit: number,
): OversizedFile[] {
  if (!Number.isFinite(tokenLimit) || tokenLimit <= 0) {
    throw new Error('tokenLimit must be a positive finite number.');
  }

  const oversized: OversizedFile[] = [];
  for (const pf of files) {
    if (pf.metrics.estimatedTokens > tokenLimit) {
      oversized.push({
        fileId: pf.file.id as OversizedFile['fileId'],
        estimatedTokens: pf.metrics.estimatedTokens,
        tokenLimit,
        reasonCode: 'file-too-large',
      });
    }
  }
  return oversized;
}

/** Filters out oversized files, keeping only packable ones. */
export function filterPackableFiles(
  files: readonly PackableFile[],
  tokenLimit: number,
): PackableFile[] {
  return files.filter((pf) => pf.metrics.estimatedTokens <= tokenLimit);
}
