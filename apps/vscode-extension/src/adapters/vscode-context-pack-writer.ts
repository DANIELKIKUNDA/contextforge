import * as path from 'node:path';
import type { ContextPackWriteRequest, ContextPackWriterPort } from '@contextforge/core';
import { AtomicContextPackWriter, ContextPackOutputGenerator } from '@contextforge/generators';

/**
 * Adaptateur ContextPackWriterPort pour VS Code.
 *
 * Implémente l'écriture atomique temporaire, la validation et le commit
 * en utilisant AtomicContextPackWriter du package generators.
 *
 * Analogue à CliContextPackWriter — aucune logique métier ici.
 */
export class VscodeContextPackWriter implements ContextPackWriterPort {
  private readonly writer = new AtomicContextPackWriter();
  private readonly outputGenerator = new ContextPackOutputGenerator();

  /**
   * Écrit les fichiers de sortie dans un répertoire temporaire.
   */
  async writeTemporary(request: ContextPackWriteRequest): Promise<string> {
    const tmpDir = path.join(request.outputRoot, '.tmp', `${request.packId}-${Date.now()}`);
    await this.writer.createTemporaryDir(tmpDir);

    const files = this.outputGenerator.generate(request);
    for (const [relativePath, content] of files) {
      await this.writer.writeFile(tmpDir, relativePath, content);
    }

    return tmpDir;
  }

  /**
   * Valide le répertoire temporaire avant commit.
   */
  async validateTemporary(temporaryDir: string): Promise<string[]> {
    const files = await this.writer.listWrittenFiles(temporaryDir);
    const requiredFiles = [
      'README.md',
      'manifest.json',
      'included-files.md',
      'exclusions.md',
      'warnings.md',
    ];
    return requiredFiles
      .filter((requiredFile) => !files.includes(requiredFile))
      .map((requiredFile) => `Fichier de sortie manquant : ${requiredFile}`);
  }

  /**
   * Commit atomique du temporaire vers le final.
   */
  async commit(temporaryDir: string, finalDir: string): Promise<void> {
    await this.writer.commit(temporaryDir, finalDir);
  }

  /**
   * Rollback du répertoire temporaire en cas d'erreur.
   */
  async rollback(temporaryDir: string): Promise<void> {
    await this.writer.rollback(temporaryDir);
  }
}
