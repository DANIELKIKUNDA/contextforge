import type { PackVolume, SourceFile } from '@contextforge/contracts';
import type { ProfileId } from '@contextforge/contracts';

/**
 * Distributes included files into one or more volumes
 * respecting token limits and stable ordering.
 */
export interface PackingPort {
  pack(includedFiles: SourceFile[], tokenLimit: number, profile: ProfileId): PackVolume[];
}
