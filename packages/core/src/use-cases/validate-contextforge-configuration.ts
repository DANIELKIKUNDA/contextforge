import type { ContextForgeConfiguration } from '@contextforge/contracts';
import type { ConfigurationPort } from '../ports/configuration.port.js';

/**
 * Résultat de validation retourné par le cas d'usage.
 * Réutilise le port de configuration défini dans le core.
 */
export interface ConfigValidationResult {
  readonly config: ContextForgeConfiguration;
  readonly provenance: Record<string, string>;
  readonly errors: string[];
}

/**
 * Cas d'usage : Valide la configuration ContextForge en utilisant
 * le port de configuration (implémenté pendant la Phase 6).
 *
 * Ce use-case reçoit le port par injection de dépendance.
 */
export class ValidateContextForgeConfiguration {
  constructor(private readonly configurationPort: ConfigurationPort) {}

  /**
   * Charge et valide la configuration effective.
   * Retourne la configuration, la provenance et les éventuelles erreurs.
   */
  async execute(): Promise<ConfigValidationResult> {
    const { config, provenance } = await this.configurationPort.load();

    return {
      config,
      provenance,
      errors: [],
    };
  }
}
