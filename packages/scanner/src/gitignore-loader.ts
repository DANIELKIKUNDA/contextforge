import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, relative, resolve } from 'node:path';
import ignore from 'ignore';

/**
 * Loads `.gitignore` from the project root and returns an ignore matcher.
 *
 * Returns undefined if the file does not exist or is empty.
 * Comments and blank lines are handled by the `ignore` library.
 */
export function loadGitignore(rootPath: string): undefined | ReturnType<typeof ignore> {
  const gitignorePath = resolve(rootPath, '.gitignore');

  if (!existsSync(gitignorePath)) {
    return undefined;
  }

  const content = readFileSync(gitignorePath, 'utf-8').trim();
  if (content.length === 0) {
    return undefined;
  }

  const ig = ignore();
  ig.add(content);
  return ig;
}

/**
 * Tests whether a relative path is ignored by a gitignore matcher.
 * The path must be relative to the project root (no leading slash).
 */
export function isIgnoredByGitignore(
  relativePath: string,
  ig: undefined | ReturnType<typeof ignore>,
): boolean {
  if (!ig) {
    return false;
  }
  return ig.ignores(relativePath);
}
