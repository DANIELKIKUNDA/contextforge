/**
 * Génère des noms déterministes pour les dossiers et fichiers de sortie.
 */
export class OutputDirectoryNamer {
  private static readonly PREFIX = 'context-pack-';

  /**
   * Nomme le dossier final de sortie à partir du packId et du nom du projet.
   * Format : context-pack-<projectName>-<packIdShort>
   */
  resolve(packId: string, projectName: string): string {
    const short = packId.slice(0, 8);
    const safeName = projectName.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
    return `${OutputDirectoryNamer.PREFIX}${safeName}-${short}`;
  }

  /** Retourne le chemin du dossier temporaire pour un packId donné. */
  temporaryDir(packId: string): string {
    return `.contextforge/.tmp/${packId}`;
  }

  /** Retourne le chemin du dossier final. */
  finalDir(outputDirectory: string, packId: string, projectName: string): string {
    return `${outputDirectory}/${this.resolve(packId, projectName)}`;
  }
}
