import type { ContextPackManifest, ContextPackPreview, PackVolume } from '@contextforge/contracts';

export interface ContextPackWriteRequest {
  readonly packId: string;
  readonly outputRoot: string;
  readonly volumes: readonly PackVolume[];
  readonly manifest: ContextPackManifest;
  readonly preview: ContextPackPreview;
  readonly contents: ReadonlyMap<string, string>;
}

/**
 * Writes output files atomically.
 * Strategy: write to a temporary directory, validate, then rename.
 */
export interface ContextPackWriterPort {
  writeTemporary(request: ContextPackWriteRequest): Promise<string>;
  validateTemporary(temporaryDir: string): Promise<string[]>;
  commit(temporaryDir: string, finalDir: string): Promise<void>;
  rollback(temporaryDir: string): Promise<void>;
}
