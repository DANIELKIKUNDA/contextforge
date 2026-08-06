import * as path from 'node:path';
import type { ContextPackWriteRequest, ContextPackWriterPort } from '@contextforge/core';
import { AtomicContextPackWriter, ContextPackOutputGenerator } from '@contextforge/generators';

/**
 * Adaptateur concret de ContextPackWriterPort utilisant AtomicContextPackWriter
 * et OutputValidator du package generators (Phase 8).
 *
 * Garantit l'écriture atomique, la validation et le rollback.
 */
export class CliContextPackWriter implements ContextPackWriterPort {
  private readonly writer = new AtomicContextPackWriter();
  private readonly outputGenerator = new ContextPackOutputGenerator();

  async writeTemporary(request: ContextPackWriteRequest): Promise<string> {
    const tmpDir = path.join(request.outputRoot, '.tmp', `${request.packId}-${Date.now()}`);
    await this.writer.createTemporaryDir(tmpDir);

    const files = this.outputGenerator.generate(request);
    for (const [relativePath, content] of files) {
      await this.writer.writeFile(tmpDir, relativePath, content);
    }

    return tmpDir;
  }

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

  async commit(temporaryDir: string, finalDir: string): Promise<void> {
    await this.writer.commit(temporaryDir, finalDir);
  }

  async rollback(temporaryDir: string): Promise<void> {
    await this.writer.rollback(temporaryDir);
  }
}
