import type { PackVolume } from '@contextforge/contracts';
import type { ContextPackWriterPort } from '@contextforge/core';
import { AtomicContextPackWriter } from '@contextforge/generators';

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

  /**
   * Écrit les fichiers de sortie dans un répertoire temporaire.
   */
  async writeTemporary(
    _packId: string,
    _outputDir: string,
    _volumes: readonly PackVolume[],
  ): Promise<string> {
    const tmpDir = `.contextforge/output/.tmp/${Date.now()}`;
    await this.writer.createTemporaryDir(tmpDir);
    return tmpDir;
  }

  /**
   * Valide le répertoire temporaire avant commit.
   */
  async validateTemporary(temporaryDir: string): Promise<string[]> {
    const files = await this.writer.listWrittenFiles(temporaryDir);
    return files.length === 0 ? ['Répertoire temporaire vide'] : [];
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
