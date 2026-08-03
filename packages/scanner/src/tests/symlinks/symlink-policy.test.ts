import { existsSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FOLLOW_SYMLINKS_V1, isSymlink, shouldRejectSymlink } from '../../symlink-policy.js';

function tmpDir(): string {
  const dir = join(
    tmpdir(),
    `cf-test-symlink-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

function canCreateSymlinks(): boolean {
  try {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, 'target.txt'), 'hello');
      symlinkSync(join(dir, 'target.txt'), join(dir, 'link.txt'));
      return true;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  } catch {
    return false;
  }
}

describe('symlink-policy', () => {
  it('should have FOLLOW_SYMLINKS_V1 set to false', () => {
    expect(FOLLOW_SYMLINKS_V1).toBe(false);
  });

  it('should detect a normal file as not a symlink', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, 'normal.txt'), 'hello');
      expect(isSymlink(join(dir, 'normal.txt'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should reject a symlink', () => {
    const canSymlink = canCreateSymlinks();
    if (!canSymlink) {
      console.warn('Symlink creation not available — test skipped.');
      return;
    }

    const dir = tmpDir();
    try {
      writeFileSync(join(dir, 'target.txt'), 'hello');
      symlinkSync(join(dir, 'target.txt'), join(dir, 'link.txt'));
      expect(shouldRejectSymlink(join(dir, 'link.txt'))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should not reject a normal file', () => {
    const dir = tmpDir();
    try {
      writeFileSync(join(dir, 'normal.txt'), 'hello');
      expect(shouldRejectSymlink(join(dir, 'normal.txt'))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should return false for non-existent file', () => {
    expect(isSymlink('/nonexistent/file.txt')).toBe(false);
  });
});
