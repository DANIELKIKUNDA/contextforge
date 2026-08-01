import type { ContextPackId, PackVolume, SourceFile } from '@contextforge/contracts';
import type { ProfileId } from '@contextforge/contracts';
import type { FileSizeMetrics } from './sizing.port';

/**
 * A file bundled with its sizing metrics.
 * Guarantees that estimatedTokens is available for packing decisions
 * without requiring the packer to call the sizing layer.
 */
export interface PackableFile {
  readonly file: SourceFile;
  readonly metrics: FileSizeMetrics;
}

/**
 * A file that exceeds the token limit for a single volume.
 * Produced by the oversized-file policy so exclusions remain traceable.
 */
export interface OversizedFile {
  readonly fileId: ContextPackId;
  readonly estimatedTokens: number;
  readonly tokenLimit: number;
  readonly reasonCode: 'file-too-large';
}

/**
 * Result of a packing operation.
 * Successful distributions appear in volumes; files too large for any
 * volume appear in oversizedFiles.
 */
export interface PackingResult {
  readonly volumes: readonly PackVolume[];
  readonly oversizedFiles: readonly OversizedFile[];
}

/**
 * Distributes included files into one or more volumes
 * respecting token limits and stable ordering.
 */
export interface PackingPort {
  pack(
    includedFiles: readonly PackableFile[],
    tokenLimit: number,
    profile: ProfileId,
  ): PackingResult;
}
