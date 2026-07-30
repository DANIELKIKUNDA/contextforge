/**
 * RelativePath value object.
 * Constraints:
 * - never absolute (no drive letter, no leading /)
 * - normalized forward slashes
 * - no ".." traversal outside project
 * - non-empty
 */
export type RelativePath = string & { readonly __brand: 'RelativePath' };

export interface RelativePathCreationResult {
  readonly relativePath: RelativePath | undefined;
  readonly error: string | undefined;
}

/** Normalizes backslashes to forward slashes. */
function normalizeSlashes(input: string): string {
  return input.replace(/\\/g, '/');
}

/** Checks if the path is absolute (starts with /, \, or drive letter like C:). */
function isAbsoluteLike(input: string): boolean {
  return /^[a-zA-Z]:/.test(input) || input.startsWith('/') || input.startsWith('\\');
}

/** Checks if any segment is ".." that would escape the project root. */
function hasTraversal(input: string): boolean {
  const parts = input.split('/');
  return parts.some((part) => part === '..');
}

/**
 * Creates a RelativePath from a raw string.
 * - Rejects empty strings
 * - Rejects absolute paths (drive letters, leading / or \)
 * - Rejects traversal (any ".." segment)
 * - Normalizes all slashes to forward slash
 */
export function createRelativePath(raw: string): RelativePathCreationResult {
  if (raw.length === 0) {
    return { relativePath: undefined, error: 'Path must not be empty.' };
  }

  if (isAbsoluteLike(raw)) {
    return { relativePath: undefined, error: `Path must be relative, got: "${raw}".` };
  }

  const normalized = normalizeSlashes(raw);

  if (hasTraversal(normalized)) {
    return {
      relativePath: undefined,
      error: `Path must not contain traversal segments, got: "${raw}".`,
    };
  }

  return { relativePath: normalized as RelativePath, error: undefined };
}
