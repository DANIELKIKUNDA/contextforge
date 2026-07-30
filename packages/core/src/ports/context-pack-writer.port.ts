import type { ContextPackResult, PackVolume } from '@contextforge/contracts';

/**
 * Writes output files atomically.
 * Strategy: write to a temporary directory, validate, then rename.
 */
export interface ContextPackWriterPort {
  writeTemporary(packId: string, outputDir: string, volumes: PackVolume[]): Promise<string>;
  validateTemporary(temporaryDir: string): Promise<string[]>;
  commit(temporaryDir: string, finalDir: string): Promise<void>;
  rollback(temporaryDir: string): Promise<void>;
}
