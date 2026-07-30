import type { SourceFile } from '@contextforge/contracts';

export interface ReadFileOptions {
  readonly maxBytes?: number;
}

export interface ReadFileResult {
  readonly file: SourceFile;
  readonly content: string;
}

/**
 * Reads file content under a controlled size limit.
 * Never returns raw content of blocked files.
 */
export interface FileContentReaderPort {
  read(file: SourceFile, options?: ReadFileOptions): Promise<ReadFileResult>;
}
