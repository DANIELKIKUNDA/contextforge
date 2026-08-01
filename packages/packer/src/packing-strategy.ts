import type { ProfileId } from '@contextforge/contracts';
import type { PackableFile, PackingPort, PackingResult } from '@contextforge/core';
import { classifyOversizedFiles, filterPackableFiles } from './oversized-file-policy';
import { resolvePriority } from './profile-priority-resolver';
import { stableSort } from './stable-file-sorter';
import { firstFitPack } from './volume-packer';

/**
 * Implements PackingPort using first-fit stable packing.
 * Never recalculates tokens — uses PackableFile.metrics.estimatedTokens.
 * Never reads filesystem, never modifies inputs.
 */
export class PackingStrategy implements PackingPort {
  pack(
    includedFiles: readonly PackableFile[],
    tokenLimit: number,
    profile: ProfileId,
  ): PackingResult {
    // 1. Validate tokenLimit
    if (!Number.isFinite(tokenLimit) || tokenLimit <= 0) {
      throw new Error('tokenLimit must be a positive finite number.');
    }

    // 2. Sort by relativePath for deterministic order
    const sorted = stableSort(includedFiles);

    // 3. Resolve profile-based priority (V1: identity)
    const prioritized = resolvePriority(sorted, profile);

    // 4. Classify oversized files (files exceeding token limit)
    const oversizedFiles = classifyOversizedFiles(prioritized, tokenLimit);

    // 5. Filter to packable only
    const packable = filterPackableFiles(prioritized, tokenLimit);

    // 6. First-fit pack
    const volumes = firstFitPack(packable, tokenLimit);

    return { volumes, oversizedFiles };
  }
}
