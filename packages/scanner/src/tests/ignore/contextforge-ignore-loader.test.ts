import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  isIgnoredByContextforgeIgnore,
  loadContextforgeIgnore,
} from '../../contextforge-ignore-loader.js';

function tmpDir(): string {
  const dir = join(
    tmpdir(),
    `cf-test-cfignore-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe('contextforge-ignore-loader', () => {
  it('should return undefined if .contextforgeignore does not exist', () => {
    const dir = tmpDir();
    try {
      const cig = loadContextforgeIgnore(dir);
      expect(cig).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should load a simple exclusion', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.contextforgeignore'), 'docs/draft.md\n');
      const cig = loadContextforgeIgnore(dir);
      expect(cig).toBeDefined();
      expect(isIgnoredByContextforgeIgnore('docs/draft.md', cig)).toBe(true);
      expect(isIgnoredByContextforgeIgnore('docs/readme.md', cig)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should handle wildcards', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.contextforgeignore'), '*.tmp\n');
      const cig = loadContextforgeIgnore(dir);
      expect(isIgnoredByContextforgeIgnore('out.tmp', cig)).toBe(true);
      expect(isIgnoredByContextforgeIgnore('src/out.tmp', cig)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should combine with gitignore logic', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.contextforgeignore'), 'secrets/\n');
      writeFileSync(join(dir, '.gitignore'), 'dist/\n');
      const cig = loadContextforgeIgnore(dir);
      // Both loaders work independently; combination is at discovery level
      expect(isIgnoredByContextforgeIgnore('secrets/key.txt', cig)).toBe(true);
      expect(isIgnoredByContextforgeIgnore('dist/app.js', cig)).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
