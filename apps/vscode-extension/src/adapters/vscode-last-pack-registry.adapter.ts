import type { LastPackRegistryPort } from '@contextforge/core';

/**
 * Adaptateur VS Code pour le port LastPackRegistryPort.
 * Stocke le chemin du dernier Context Pack généré dans le stockage
 * Memento de VS Code (workspaceState), persistant entre les sessions.
 */
export class VscodeLastPackRegistryAdapter implements LastPackRegistryPort {
  private static readonly KEY = 'contextForge.lastPackPath';

  /**
   * @param workspaceState - Le stockage Memento de l'espace de travail VS Code.
   */
  constructor(
    private readonly workspaceState: {
      get<T>(key: string): T | undefined;
      update(key: string, value: unknown): Thenable<void>;
    },
  ) {}

  /** Récupère le chemin du dernier pack pour un projet donné. */
  get(projectRoot: string): string | undefined {
    const registry =
      this.workspaceState.get<Record<string, string>>(VscodeLastPackRegistryAdapter.KEY) ?? {};
    return registry[projectRoot];
  }

  /** Enregistre le chemin du pack généré. */
  set(projectRoot: string, packPath: string): void {
    const registry =
      this.workspaceState.get<Record<string, string>>(VscodeLastPackRegistryAdapter.KEY) ?? {};
    registry[projectRoot] = packPath;
    // Mise à jour asynchrone (fire-and-forget) — VS Code persiste automatiquement
    this.workspaceState.update(VscodeLastPackRegistryAdapter.KEY, registry);
  }

  /** Efface l'entrée pour un projet donné. */
  clear(projectRoot: string): void {
    const registry =
      this.workspaceState.get<Record<string, string>>(VscodeLastPackRegistryAdapter.KEY) ?? {};
    delete registry[projectRoot];
    this.workspaceState.update(VscodeLastPackRegistryAdapter.KEY, registry);
  }
}
