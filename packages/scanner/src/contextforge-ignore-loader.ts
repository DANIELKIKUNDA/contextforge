import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ignore from 'ignore';

/**
 * Loads `.contextforgeignore` from the project root and returns an ignore matcher.
 * Follows the same logic as `.gitignore`.
 *
 * Returns undefined if the file does not exist or is empty.
 */
export function loadContextforgeIgnore(rootPath: string): undefined | ReturnType<typeof ignore> {
  const cfignorePath = resolve(rootPath, '.contextforgeignore');

  if (!existsSync(cfignorePath)) {
    return undefined;
  }

  const content = readFileSync(cfignorePath, 'utf-8').trim();
  if (content.length === 0) {
    return undefined;
  }

  const ig = ignore();
  ig.add(content);
  return ig;
}

/**
 * Tests whether a relative path is ignored by a .contextforgeignore matcher.
 * The path must be relative to the project root (no leading slash).
 */
export function isIgnoredByContextforgeIgnore(
  relativePath: string,
  cig: undefined | ReturnType<typeof ignore>,
): boolean {
  if (!cig) {
    return false;
  }
  return cig.ignores(relativePath);
}
