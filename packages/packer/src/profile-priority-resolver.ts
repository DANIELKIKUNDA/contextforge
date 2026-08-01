import type { ProfileId } from '@contextforge/contracts';
import type { PackableFile } from '@contextforge/core';

/**
 * Resolves the priority order for packing based on profile.
 * Default V1: stable by relativePath (no profile-specific reordering).
 */
export function resolvePriority(
  input: readonly PackableFile[],
  _profile: ProfileId,
): PackableFile[] {
  return [...input]; // V1: order preserved, profile affects only metadata
}
