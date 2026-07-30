import { createRelativePath } from '@contextforge/contracts';
import type { RelativePath } from '@contextforge/contracts';

/**
 * Normalizes a file system path relative to a project root.
 *
 * Security invariants:
 * - Never returns absolute paths.
 * - Rejects traversal (../) outside the workspace.
 * - Always uses forward slash as separator.
 * - Strips redundant . and // segments.
 * - Output is compatible with RelativePath from @contextforge/contracts.
 */
export function normalizePath(rawPath: string, projectRoot: string): RelativePath {
  // 1. Resolve to absolute using the project root as base
  const normalizedRoot = normalizeSlashes(projectRoot);

  // 2. Normalize the raw path separators first
  let normalized = normalizeSlashes(rawPath);

  // 3. If the raw path is already absolute-like, validate it belongs to projectRoot
  const isAbsolute = /^[a-zA-Z]:/.test(normalized) || normalized.startsWith('/');
  if (isAbsolute) {
    if (!normalized.startsWith(normalizedRoot)) {
      throw new Error(`Path "${rawPath}" is outside the project workspace.`);
    }
    // Make it relative to projectRoot
    normalized = normalized.slice(normalizedRoot.length);
    if (normalized.startsWith('/')) {
      normalized = normalized.slice(1);
    }
  }

  // 4. Remove redundant . segments
  normalized = removeDotSegments(normalized);

  // 5. Remove double slashes
  normalized = normalized.replace(/\/{2,}/g, '/');

  // 6. Remove trailing slash (unless empty)
  if (normalized.endsWith('/') && normalized.length > 1) {
    normalized = normalized.slice(0, -1);
  }

  // 7. Delegate to the contract's createRelativePath for final validation
  const result = createRelativePath(normalized);
  if (!result.relativePath) {
    throw new Error(`Invalid relative path: ${result.error ?? 'unknown error'}`);
  }

  return result.relativePath;
}

/** Converts all backslashes to forward slashes. */
function normalizeSlashes(input: string): string {
  return input.replace(/\\/g, '/');
}

/** Removes single-dot segments like "." or "/./" and handles ".." rejection. */
function removeDotSegments(path: string): string {
  const segments = path.split('/');
  const result: string[] = [];

  for (const segment of segments) {
    if (segment === '.' || segment === '') {
      continue;
    }
    if (segment === '..') {
      if (result.length === 0) {
        // Traversal attempt — rejected later by createRelativePath in contracts
        result.push(segment);
      } else {
        result.pop();
      }
      continue;
    }
    result.push(segment);
  }

  return result.join('/');
}

/**
 * Joins a project root with a relative path and resolves the absolute path.
 * Returns the absolute path for internal use only.
 */
export function toAbsolutePath(relativePath: RelativePath, projectRoot: string): string {
  const root = projectRoot.replace(/\\/g, '/').replace(/\/$/, '');
  return `${root}/${relativePath}`;
}
