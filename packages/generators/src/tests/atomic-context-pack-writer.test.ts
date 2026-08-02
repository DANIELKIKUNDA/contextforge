import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AtomicContextPackWriter } from '../atomic-context-pack-writer';

describe('AtomicContextPackWriter', () => {
  let writer: AtomicContextPackWriter;
  let tempRoot: string;

  beforeEach(async () => {
    writer = new AtomicContextPackWriter();
    tempRoot = path.join(
      os.tmpdir(),
      `cf-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    await fs.mkdir(tempRoot, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  describe('writeFile', () => {
    it('écrit un fichier dans un sous-dossier', async () => {
      const baseDir = path.join(tempRoot, 'output');
      const writtenPath = await writer.writeFile(baseDir, 'README.md', '# Hello');

      expect(writtenPath).toBe(path.join(baseDir, 'README.md'));
      const content = await fs.readFile(writtenPath, 'utf-8');
      expect(content).toBe('# Hello');
    });

    it('crée les dossiers parents automatiquement', async () => {
      const baseDir = path.join(tempRoot, 'deep');
      const writtenPath = await writer.writeFile(baseDir, 'a/b/c/file.txt', 'data');

      const stat = await fs.stat(writtenPath);
      expect(stat.isFile()).toBe(true);
    });

    it('rejette les chemins absolus', async () => {
      await expect(writer.writeFile(tempRoot, '/etc/passwd', 'bad')).rejects.toThrow(
        'Chemin interdit',
      );
    });

    it('rejette les traversées de dossier (../)', async () => {
      await expect(writer.writeFile(tempRoot, '../outside.txt', 'bad')).rejects.toThrow(
        'Chemin interdit',
      );
    });
  });

  describe('commit et rollback', () => {
    it('commite un répertoire temporaire vers le final', async () => {
      const tmpDir = path.join(tempRoot, '.tmp', 'pack-1');
      const finalDir = path.join(tempRoot, 'output', 'pack-1');

      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(path.join(tmpDir, 'README.md'), '# Test');

      await writer.commit(tmpDir, finalDir);

      const content = await fs.readFile(path.join(finalDir, 'README.md'), 'utf-8');
      expect(content).toBe('# Test');

      await expect(fs.stat(tmpDir)).rejects.toThrow();
    });

    it('rollback supprime le répertoire temporaire', async () => {
      const tmpDir = path.join(tempRoot, '.tmp', 'pack-1');
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.writeFile(path.join(tmpDir, 'file.txt'), 'data');

      await writer.rollback(tmpDir);

      await expect(fs.stat(tmpDir)).rejects.toThrow();
    });

    it("rollback ne lance pas d'erreur si le dossier n'existe pas", async () => {
      const missingDir = path.join(tempRoot, 'nonexistent');
      await expect(writer.rollback(missingDir)).resolves.toBeUndefined();
    });
  });
});
