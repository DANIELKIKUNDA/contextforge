import type { LastPackRegistryPort } from '../ports/last-pack-registry.port';

/**
 * Cas d'usage : ouvre le dernier Context Pack généré.
 * Utilise LastPackRegistryPort pour retrouver le chemin.
 */
export class OpenLastContextPack {
  constructor(private readonly lastPackRegistry: LastPackRegistryPort) {}

  /**
   * Retourne le chemin du dernier pack valide pour le projet donné.
   * Retourne undefined si aucun pack n'a encore été généré.
   */
  execute(projectRoot: string): string | undefined {
    return this.lastPackRegistry.get(projectRoot);
  }
}
