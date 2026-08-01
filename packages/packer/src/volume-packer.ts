import type { ContextPackId, PackVolume } from '@contextforge/contracts';
import type { PackableFile } from '@contextforge/core';

/** Mutable builder used internally during packing. */
interface VolumeBuilder {
  index: number;
  fileIds: ContextPackId[];
  estimatedTokens: number;
  estimatedBytes: number;
}

/**
 * First-fit packing algorithm per doc 04 §8.2.
 *
 * Files are placed sequentially into the first volume that has enough room.
 * If no volume fits, a new volume is created.
 * Produces deterministic PackVolume[] with 1-based indexing.
 */
export function firstFitPack(files: readonly PackableFile[], tokenLimit: number): PackVolume[] {
  if (!Number.isFinite(tokenLimit) || tokenLimit <= 0) {
    throw new Error('tokenLimit must be a positive finite number.');
  }

  const builders: VolumeBuilder[] = [];

  for (const pf of files) {
    const tokens = pf.metrics.estimatedTokens;
    if (tokens > tokenLimit) continue; // oversized: handled by oversized-file-policy

    let placed = false;
    for (const vol of builders) {
      if (vol.estimatedTokens + tokens <= tokenLimit) {
        vol.fileIds.push(pf.file.id);
        vol.estimatedTokens += tokens;
        vol.estimatedBytes += pf.metrics.bytes;
        placed = true;
        break;
      }
    }

    if (!placed) {
      const index = builders.length + 1;
      builders.push({
        index,
        fileIds: [pf.file.id],
        estimatedTokens: tokens,
        estimatedBytes: pf.metrics.bytes,
      });
    }
  }

  return builders.map((b) => ({
    index: b.index,
    outputFileName: `context-pack-volume-${b.index}.md`,
    fileIds: b.fileIds,
    estimatedTokens: b.estimatedTokens,
    estimatedBytes: b.estimatedBytes,
    heading: `Context Pack — Volume ${b.index}`,
    orderKey: String(b.index).padStart(4, '0'),
  }));
}
