import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolve as pathResolve } from 'node:path';
import type { SourceFile } from '@contextforge/contracts';
import type { FileContentReaderPort, ReadFileOptions, ReadFileResult } from '@contextforge/core';
import { detectEncoding } from './encoding-detector.js';
import { detectFileKind } from './file-kind-detector.js';
import { normalizePath, toAbsolutePath } from './path-normalizer.js';
import { shouldRejectSymlink } from './symlink-policy.js';

/**
 * Node.js implementation of FileContentReaderPort.
 */
export class NodeFileContentReaderAdapter implements FileContentReaderPort {
  async read(file: SourceFile, options?: ReadFileOptions): Promise<ReadFileResult> {
    const absolutePath = file.absolutePath;

    if (!existsSync(absolutePath)) {
      throw new Error(`File not found: ${file.relativePath}`);
    }

    let stat: ReturnType<typeof lstatSync>;
    try {
      stat = lstatSync(absolutePath);
    } catch {
      throw new Error(`Cannot stat file: ${file.relativePath}`);
    }

    if (!stat.isFile()) {
      throw new Error(`Not a regular file: ${file.relativePath}`);
    }

    if (shouldRejectSymlink(absolutePath)) {
      throw new Error(`Symlinks are not followed: ${file.relativePath}`);
    }

    const maxBytes = options?.maxBytes ?? 10 * 1024 * 1024;
    if (stat.size > maxBytes) {
      throw new Error(`File exceeds size limit of ${maxBytes} bytes: ${file.relativePath}`);
    }

    let buffer: Buffer;
    try {
      buffer = readFileSync(absolutePath);
    } catch {
      throw new Error(`Cannot read file: ${file.relativePath}`);
    }

    const encodingResult = detectEncoding(buffer);
    if (!encodingResult.valid) {
      throw new Error(`Unsupported encoding in file: ${file.relativePath}`);
    }

    const contentKind = detectFileKind(file.extension, buffer);
    if (contentKind === 'binary') {
      throw new Error(`Binary files are not readable as text: ${file.relativePath}`);
    }

    let content: string;
    if (encodingResult.encoding === 'utf-8-bom') {
      content = buffer.toString('utf-8', 3);
    } else {
      content = buffer.toString('utf-8');
    }

    return {
      file: {
        ...file,
        contentKind,
        encoding: encodingResult.encoding,
        sizeInBytes: buffer.length,
      },
      content,
    };
  }
}
