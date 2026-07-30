import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { isIgnoredByGitignore, loadGitignore } from '../../gitignore-loader';

function tmpDir(): string {
  const dir = join(
    tmpdir(),
    `cf-test-gitignore-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe('gitignore-loader', () => {
  it('should return undefined if .gitignore does not exist', () => {
    const dir = tmpDir();
    try {
      const ig = loadGitignore(dir);
      expect(ig).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should return undefined if .gitignore is empty', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.gitignore'), '');
      const ig = loadGitignore(dir);
      expect(ig).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should load a simple exclusion', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.gitignore'), 'dist/\n');
      const ig = loadGitignore(dir);
      expect(ig).toBeDefined();
      expect(isIgnoredByGitignore('dist/app.js', ig)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should handle wildcards', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.gitignore'), '*.log\n');
      const ig = loadGitignore(dir);
      expect(isIgnoredByGitignore('app.log', ig)).toBe(true);
      expect(isIgnoredByGitignore('src/app.log', ig)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should handle comments', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.gitignore'), '# comment\n*.log\n');
      const ig = loadGitignore(dir);
      expect(isIgnoredByGitignore('# comment', ig)).toBe(false);
      expect(isIgnoredByGitignore('app.log', ig)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should handle directory exclusion', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, '.gitignore'), 'docs/\n');
      const ig = loadGitignore(dir);
      expect(isIgnoredByGitignore('docs/other.md', ig)).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
