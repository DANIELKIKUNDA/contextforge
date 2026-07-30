import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileDiscoveryAdapter } from '../../node-file-discovery.adapter';

function tmpDir(): string {
  const dir = join(
    tmpdir(),
    `cf-test-discovery-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(dir, { recursive: true });
  return dir;
}

function createFixture(root: string) {
  mkdirSync(join(root, 'src'));
  mkdirSync(join(root, 'docs'));
  mkdirSync(join(root, '.git'));
  mkdirSync(join(root, '.contextforge'));
  mkdirSync(join(root, 'node_modules'));
  mkdirSync(join(root, 'dist'));

  writeFileSync(join(root, 'src/index.ts'), 'export const x = 1;');
  writeFileSync(join(root, 'docs/readme.md'), '# Docs');
  writeFileSync(join(root, '.git/config'), '');
  writeFileSync(join(root, '.contextforge/out.md'), '');
  writeFileSync(join(root, 'node_modules/pkg.js'), '');
  writeFileSync(join(root, 'dist/bundle.js'), '');
  writeFileSync(join(root, '.gitignore'), 'dist/\n');
  writeFileSync(join(root, '.contextforgeignore'), 'docs/draft.md\n');
}

describe('NodeFileDiscoveryAdapter', () => {
  let dir: string;
  let adapter: NodeFileDiscoveryAdapter;

  beforeEach(() => {
    dir = tmpDir();
    createFixture(dir);
    adapter = new NodeFileDiscoveryAdapter();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('should discover files from root', async () => {
    const files = await adapter.discover(dir, ['src', 'docs']);
    const paths = files.map((f) => f.relativePath as string);
    expect(paths).toContain('src/index.ts');
    expect(paths).toContain('docs/readme.md');
  });

  it('should ignore .git', async () => {
    const files = await adapter.discover(dir, [dir]);
    const paths = files.map((f) => f.relativePath as string);
    expect(paths.filter((p) => p.startsWith('.git')).length).toBe(0);
  });

  it('should ignore .contextforge', async () => {
    const files = await adapter.discover(dir, [dir]);
    const paths = files.map((f) => f.relativePath as string);
    expect(paths.filter((p) => p.startsWith('.contextforge')).length).toBe(0);
  });

  it('should ignore node_modules', async () => {
    const files = await adapter.discover(dir, [dir]);
    const paths = files.map((f) => f.relativePath as string);
    expect(paths.filter((p) => p.startsWith('node_modules')).length).toBe(0);
  });

  it('should respect .gitignore', async () => {
    const files = await adapter.discover(dir, [dir]);
    const paths = files.map((f) => f.relativePath as string);
    expect(paths.filter((p) => p.startsWith('dist')).length).toBe(0);
  });

  it('should respect .contextforgeignore', async () => {
    writeFileSync(join(dir, 'docs/draft.md'), '# Draft');
    const files = await adapter.discover(dir, [dir]);
    const paths = files.map((f) => f.relativePath as string);
    expect(paths).not.toContain('docs/draft.md');
  });

  it('should return stable order', async () => {
    const files1 = await adapter.discover(dir, [dir]);
    const files2 = await adapter.discover(dir, [dir]);
    const paths1 = files1.map((f) => f.relativePath as string);
    const paths2 = files2.map((f) => f.relativePath as string);
    expect(paths1).toEqual(paths2);
  });

  it('should not return absolute paths publicly', async () => {
    const files = await adapter.discover(dir, [dir]);
    for (const f of files) {
      const rel = f.relativePath as string;
      expect(rel).not.toContain(dir);
      expect(rel).not.toMatch(/^[a-zA-Z]:/);
      expect(rel).not.toMatch(/^\//);
    }
  });

  it('should return no duplicates', async () => {
    const files = await adapter.discover(dir, [dir]);
    const paths = files.map((f) => f.relativePath as string);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
