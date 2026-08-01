import type { SourceFile } from '@contextforge/contracts';
import type { PackableFile } from '@contextforge/core';
import { describe, expect, it } from 'vitest';
import { PackingStrategy } from '../packing-strategy';
import { validatePackingResult } from '../packing-validator';

function makePackableFile(
  relativePath: string,
  estimatedTokens: number,
  bytes = 100,
): PackableFile {
  return {
    file: {
      id: `file:${relativePath}` as unknown as SourceFile['id'],
      relativePath: relativePath as unknown as SourceFile['relativePath'],
      absolutePath: `/tmp/${relativePath}`,
      extension: '.ts',
      sizeInBytes: bytes,
      encoding: 'utf-8',
      contentKind: 'text',
      discoveredAt: new Date().toISOString(),
    } as SourceFile,
    metrics: { bytes, characters: estimatedTokens * 4, lines: 1, estimatedTokens },
  };
}

function validate(
  result: Awaited<ReturnType<PackingStrategy['pack']>>,
  input: PackableFile[],
  limit: number,
) {
  const errors = validatePackingResult(input, result, limit);
  if (errors.length > 0) throw new Error(errors.join('\n'));
}

describe('PackingStrategy', () => {
  it('should pack zero files', () => {
    const strategy = new PackingStrategy();
    const result = strategy.pack([], 1000, 'ai-general' as never);
    expect(result.volumes).toHaveLength(0);
    expect(result.oversizedFiles).toHaveLength(0);
  });

  it('should pack a single small file', () => {
    const strategy = new PackingStrategy();
    const input = [makePackableFile('a.ts', 10)];
    const result = strategy.pack(input, 100, 'ai-general' as never);
    expect(result.volumes).toHaveLength(1);
    expect(result.volumes[0]?.estimatedTokens).toBe(10);
    expect(result.oversizedFiles).toHaveLength(0);
    validate(result, input, 100);
  });

  it('should detect oversized file', () => {
    const strategy = new PackingStrategy();
    const input = [makePackableFile('large.ts', 200)];
    const result = strategy.pack(input, 100, 'ai-general' as never);
    expect(result.volumes).toHaveLength(0);
    expect(result.oversizedFiles).toHaveLength(1);
    expect(result.oversizedFiles[0]?.reasonCode).toBe('file-too-large');
    validate(result, input, 100);
  });

  it('should pack two files that fit together', () => {
    const strategy = new PackingStrategy();
    const input = [makePackableFile('a.ts', 40), makePackableFile('b.ts', 50)];
    const result = strategy.pack(input, 100, 'ai-general' as never);
    expect(result.volumes).toHaveLength(1);
    expect(result.volumes[0]?.estimatedTokens).toBe(90);
    expect(result.oversizedFiles).toHaveLength(0);
    validate(result, input, 100);
  });

  it('should split files across multiple volumes when needed', () => {
    const strategy = new PackingStrategy();
    const input = [makePackableFile('a.ts', 60), makePackableFile('b.ts', 60)];
    const result = strategy.pack(input, 100, 'ai-general' as never);
    expect(result.volumes).toHaveLength(2);
    expect(result.oversizedFiles).toHaveLength(0);
    validate(result, input, 100);
  });

  it('should be deterministic', () => {
    const strategy = new PackingStrategy();
    const input = [makePackableFile('a.ts', 30), makePackableFile('b.ts', 30)];
    const a = strategy.pack(input, 100, 'ai-general' as never);
    const b = strategy.pack(input, 100, 'ai-general' as never);
    expect(a).toEqual(b);
  });

  it('should not mutate input', () => {
    const strategy = new PackingStrategy();
    const input = [makePackableFile('a.ts', 30)];
    const frozen = Object.freeze(input.map((f) => Object.freeze(f)));
    const result = strategy.pack(frozen, 100, 'ai-general' as never);
    expect(result.volumes).toHaveLength(1);
  });

  it('should handle 1000 files', () => {
    const strategy = new PackingStrategy();
    const input: PackableFile[] = [];
    for (let i = 0; i < 1000; i++) {
      input.push(makePackableFile(`file-${i}.ts`, 1));
    }
    const result = strategy.pack(input, 100, 'ai-general' as never);
    expect(result.volumes.length).toBeGreaterThan(0);
    expect(result.oversizedFiles).toHaveLength(0);
    validate(result, input, 100);
  });

  it('should throw for invalid tokenLimit', () => {
    const strategy = new PackingStrategy();
    expect(() => strategy.pack([], 0, 'ai-general' as never)).toThrow();
    expect(() => strategy.pack([], -1, 'ai-general' as never)).toThrow();
  });
});
