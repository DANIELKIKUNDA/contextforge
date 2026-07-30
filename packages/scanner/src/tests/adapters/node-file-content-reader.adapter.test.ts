import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SourceFile } from '@contextforge/contracts';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileContentReaderAdapter } from '../../node-file-content-reader.adapter';

function tmpDir(): string {
  const dir = join(tmpdir(), `cf-test-reader-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function makeSourceFile(overrides: Partial<SourceFile> = {}): SourceFile {
  return {
    id: 'file:src/test.ts' as unknown as SourceFile['id'],
    relativePath: 'src/test.ts' as unknown as SourceFile['relativePath'],
    absolutePath: join(tmpdir(), 'src/test.ts'),
    extension: '.ts',
    sizeInBytes: 0,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: new Date().toISOString(),
    ...overrides,
  } as SourceFile;
}

describe('NodeFileContentReaderAdapter', () => {
  let dir: string;
  let adapter: NodeFileContentReaderAdapter;

  beforeEach(() => {
    dir = tmpDir();
    mkdirSync(join(dir, 'src'), { recursive: true });
    adapter = new NodeFileContentReaderAdapter();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('should read a valid UTF-8 file', async () => {
    const filePath = join(dir, 'src/readme.md');
    writeFileSync(filePath, '# Hello world');
    const sourceFile = makeSourceFile({ absolutePath: filePath, extension: '.md' });
    const result = await adapter.read(sourceFile);
    expect(result.content).toBe('# Hello world');
    expect(result.file.contentKind).toBe('text');
  });

  it('should handle UTF-8 BOM', async () => {
    const filePath = join(dir, 'src/bom.txt');
    const buf = Buffer.from([0xef, 0xbb, 0xbf, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    writeFileSync(filePath, buf);
    const sourceFile = makeSourceFile({ absolutePath: filePath, extension: '.txt' });
    const result = await adapter.read(sourceFile);
    expect(result.content).toBe('Hello');
  });

  it('should handle empty file', async () => {
    const filePath = join(dir, 'src/empty.txt');
    writeFileSync(filePath, '');
    const sourceFile = makeSourceFile({ absolutePath: filePath, extension: '.txt' });
    const result = await adapter.read(sourceFile);
    expect(result.content).toBe('');
  });

  it('should reject non-existent file', async () => {
    const sourceFile = makeSourceFile({ absolutePath: join(dir, 'src/nonexistent.ts') });
    await expect(adapter.read(sourceFile)).rejects.toThrow('File not found');
  });

  it('should reject a directory', async () => {
    const dirPath = join(dir, 'src');
    const sourceFile = makeSourceFile({ absolutePath: dirPath });
    await expect(adapter.read(sourceFile)).rejects.toThrow('Not a regular file');
  });

  it('should reject binary file as text', async () => {
    const filePath = join(dir, 'src/binary.bin');
    writeFileSync(filePath, Buffer.from([0x00, 0x01, 0x02, 0x03]));
    const sourceFile = makeSourceFile({ absolutePath: filePath, extension: '.bin' });
    await expect(adapter.read(sourceFile)).rejects.toThrow('Unsupported encoding');
  });

  it('should reject file exceeding maxBytes', async () => {
    const filePath = join(dir, 'src/large.txt');
    const largeContent = 'a'.repeat(2000);
    writeFileSync(filePath, largeContent);
    const sourceFile = makeSourceFile({
      absolutePath: filePath,
      extension: '.txt',
      sizeInBytes: 2000,
    });
    await expect(adapter.read(sourceFile, { maxBytes: 1000 })).rejects.toThrow(
      'exceeds size limit',
    );
  });

  it('should accept file under maxBytes', async () => {
    const filePath = join(dir, 'src/small.txt');
    writeFileSync(filePath, 'hello');
    const sourceFile = makeSourceFile({
      absolutePath: filePath,
      extension: '.txt',
      sizeInBytes: 5,
    });
    const result = await adapter.read(sourceFile, { maxBytes: 100 });
    expect(result.content).toBe('hello');
  });

  it('should accept file at exact maxBytes', async () => {
    const filePath = join(dir, 'src/exact.txt');
    const content = 'x'.repeat(100);
    writeFileSync(filePath, content);
    const sourceFile = makeSourceFile({
      absolutePath: filePath,
      extension: '.txt',
      sizeInBytes: 100,
    });
    const result = await adapter.read(sourceFile, { maxBytes: 100 });
    expect(result.content).toBe(content);
  });

  it('should not modify the source file', async () => {
    const filePath = join(dir, 'src/readonly.txt');
    writeFileSync(filePath, 'original content');
    const sourceFile = makeSourceFile({ absolutePath: filePath, extension: '.txt' });
    await adapter.read(sourceFile);
    const { readFileSync } = await import('node:fs');
    const after = readFileSync(filePath, 'utf-8');
    expect(after).toBe('original content');
  });
});
