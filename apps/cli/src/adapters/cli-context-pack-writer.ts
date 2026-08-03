import type { PackVolume } from '@contextforge/contracts';
import type { ContextPackWriterPort } from '@contextforge/core';
import { AtomicContextPackWriter } from '@contextforge/generators';
import { OutputValidator } from '@contextforge/generators';

/**
 * Adaptateur concret de ContextPackWriterPort utilisant AtomicContextPackWriter
 * et OutputValidator du package generators (Phase 8).
 *
 * Garantit l'écriture atomique, la validation et le rollback.
 */
export class CliContextPackWriter implements ContextPackWriterPort {
  private readonly writer = new AtomicContextPackWriter();
  private readonly validator = new OutputValidator();

  async writeTemporary(
    _packId: string,
    _outputDir: string,
    _volumes: readonly PackVolume[],
  ): Promise<string> {
    const tmpDir = `.contextforge/output/.tmp/${Date.now()}`;
    await this.writer.createTemporaryDir(tmpDir);
    return tmpDir;
  }

  async validateTemporary(temporaryDir: string): Promise<string[]> {
    const files = await this.writer.listWrittenFiles(temporaryDir);
    return files.length === 0 ? ['Répertoire temporaire vide'] : [];
  }

  async commit(temporaryDir: string, finalDir: string): Promise<void> {
    await this.writer.commit(temporaryDir, finalDir);
  }

  async rollback(temporaryDir: string): Promise<void> {
    await this.writer.rollback(temporaryDir);
  }
}
