import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { SourceFile } from '@contextforge/contracts';
import type { CancellationToken, FileDiscoveryPort } from '@contextforge/core';
import {
  isIgnoredByContextforgeIgnore,
  loadContextforgeIgnore,
} from './contextforge-ignore-loader.js';
import { isDefaultExcludedDir } from './default-exclusions.js';
import { detectFileKind } from './file-kind-detector.js';
import { isIgnoredByGitignore, loadGitignore } from './gitignore-loader.js';
import { normalizePath } from './path-normalizer.js';
import { shouldRejectSymlink } from './symlink-policy.js';

/**
 * Node.js implementation of FileDiscoveryPort.
 */
export class NodeFileDiscoveryAdapter implements FileDiscoveryPort {
  async discover(
    projectRoot: string,
    selectedPaths: string[],
    cancellation?: CancellationToken,
  ): Promise<SourceFile[]> {
    const root = resolve(projectRoot);
    const gitignore = loadGitignore(root);
    const contextforgeignore = loadContextforgeIgnore(root);

    const results: SourceFile[] = [];
    const seen = new Set<string>();

    for (const selected of selectedPaths) {
      if (cancellation?.cancelled) break;

      try {
        const relativePath = normalizePath(selected, root);
        const absolutePath = join(root, relativePath);

        await this.scanRecursive(
          absolutePath,
          root,
          gitignore,
          contextforgeignore,
          results,
          seen,
          cancellation,
        );
      } catch {
        // Skip paths that can't be normalized or don't exist
      }
    }

    results.sort((a, b) => (a.relativePath as string).localeCompare(b.relativePath as string));
    return results;
  }

  private async scanRecursive(
    currentPath: string,
    root: string,
    gitignore: ReturnType<typeof loadGitignore>,
    contextforgeignore: ReturnType<typeof loadContextforgeIgnore>,
    results: SourceFile[],
    seen: Set<string>,
    cancellation?: CancellationToken,
  ): Promise<void> {
    if (cancellation?.cancelled) return;

    let entries: string[];
    try {
      entries = readdirSync(currentPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (cancellation?.cancelled) break;

      const fullPath = join(currentPath, entry);
      if (isDefaultExcludedDir(entry)) continue;
      if (shouldRejectSymlink(fullPath)) continue;

      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        const relDir = normalizePath(join(currentPath, entry), root);
        if (isIgnoredByGitignore(relDir as string, gitignore)) continue;
        if (isIgnoredByContextforgeIgnore(relDir as string, contextforgeignore)) continue;

        await this.scanRecursive(
          fullPath,
          root,
          gitignore,
          contextforgeignore,
          results,
          seen,
          cancellation,
        );
      } else if (stat.isFile()) {
        const relPath = normalizePath(join(currentPath, entry), root);
        const relPathStr = relPath as string;

        if (seen.has(relPathStr)) continue;
        seen.add(relPathStr);

        if (isIgnoredByGitignore(relPathStr, gitignore)) continue;
        if (isIgnoredByContextforgeIgnore(relPathStr, contextforgeignore)) continue;

        const ext = extractExtension(entry);
        const kind = detectFileKind(ext);

        results.push({
          id: `file:${relPathStr}` as unknown as SourceFile['id'],
          relativePath: relPath,
          absolutePath: fullPath,
          extension: ext,
          sizeInBytes: stat.size,
          encoding: 'utf-8',
          contentKind: kind,
          discoveredAt: new Date().toISOString(),
        });
      }
    }
  }
}

function extractExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return '';
  return filename.slice(dot).toLowerCase();
}
