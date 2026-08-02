import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * Écriture atomique du Context Pack.
 * Stratégie : écriture dans .contextforge/.tmp/<pack-id>,
 * validation, puis renommage atomique vers le dossier final.
 */
export class AtomicContextPackWriter {
  /**
   * Écrit un fichier dans le dossier temporaire.
   * Protège contre le path traversal.
   */
  async writeFile(baseDir: string, relativePath: string, content: string): Promise<string> {
    const normalized = path.normalize(relativePath);
    // Protection traversal : le chemin normalisé ne doit pas sortir de baseDir
    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
      throw new Error(`Chemin interdit : ${relativePath}`);
    }

    const fullPath = path.join(baseDir, normalized);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf-8');
    return fullPath;
  }

  /** Crée le répertoire temporaire. */
  async createTemporaryDir(dir: string): Promise<void> {
    await fs.mkdir(dir, { recursive: true });
  }

  /**
   * Valide les sorties temporaires avant commit.
   * Retourne la liste des chemins écrits.
   */
  async listWrittenFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
    return entries
      .filter((e) => e.isFile())
      .map((e) => path.relative(dir, path.join(e.parentPath ?? dir, e.name)));
  }

  /**
   * Commit atomique : renomme le dossier temporaire vers le dossier final.
   * Sur Windows, le rename peut échouer si la destination existe ; on utilise une copie.
   */
  async commit(tmpDir: string, finalDir: string): Promise<void> {
    await fs.mkdir(path.dirname(finalDir), { recursive: true });

    if (os.platform() === 'win32') {
      // Sur Windows, on copie récursivement puis on supprime le tmp
      await this.copyDir(tmpDir, finalDir);
      await fs.rm(tmpDir, { recursive: true, force: true });
    } else {
      // Sur Unix, rename atomique (même filesystem)
      try {
        await fs.rename(tmpDir, finalDir);
      } catch {
        // Fallback copie si rename échoue (cross-device)
        await this.copyDir(tmpDir, finalDir);
        await fs.rm(tmpDir, { recursive: true, force: true });
      }
    }
  }

  /** Rollback : supprime le dossier temporaire. */
  async rollback(tmpDir: string): Promise<void> {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }

  private async copyDir(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}
