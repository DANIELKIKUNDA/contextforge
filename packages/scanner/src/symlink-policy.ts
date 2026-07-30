import { lstatSync } from 'node:fs';

/**
 * Symlink policy for ContextForge V1.
 *
 * Symlinks are IGNORED by default.
 * No symlink dereferencing, no external access, no risk of loops.
 */
export const FOLLOW_SYMLINKS_V1 = false;

/**
 * Checks whether a given file system path is a symbolic link.
 * Uses lstat to avoid following the link.
 *
 * Returns false if the file does not exist (caller should handle).
 */
export function isSymlink(absolutePath: string): boolean {
  try {
    const stat = lstatSync(absolutePath);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Validates that a path is NOT a symlink (or should be skipped per policy).
 * Returns true if the path should be REJECTED (symlink policy violation).
 *
 * V1: always returns true for symlinks (reject).
 */
export function shouldRejectSymlink(absolutePath: string): boolean {
  return isSymlink(absolutePath);
}
