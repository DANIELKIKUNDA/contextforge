import type { FileContentKind } from '../enums/file-content-kind';
import type { ContextPackId } from '../ids/context-pack-id';
import type { RelativePath } from '../value-objects/relative-path';

/**
 * Represents a discovered source file with its metadata.
 * absolutePath is internal only and never exported.
 */
export interface SourceFile {
  readonly id: ContextPackId;
  readonly relativePath: RelativePath;
  /** Internal only — never serialized in exports. */
  readonly absolutePath: string;
  readonly extension: string;
  readonly sizeInBytes: number;
  readonly lineCount?: number;
  readonly encoding: string;
  readonly contentKind: FileContentKind;
  readonly hash?: string;
  readonly discoveredAt: string;
}
