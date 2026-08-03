import type { ProfileDefinition, ProfileRegistryPort } from '../ports/profile-registry.port.js';

/** Sortie du cas d'usage ListAvailableProfiles. */
export interface ListAvailableProfilesOutput {
  readonly profiles: ProfileDefinition[];
  readonly total: number;
}

/**
 * Cas d'usage : liste tous les profils disponibles.
 * Réutilise le ProfileRegistry de la Phase 6 via son port.
 */
export class ListAvailableProfiles {
  constructor(private readonly profileRegistry: ProfileRegistryPort) {}

  execute(): ListAvailableProfilesOutput {
    const profiles = this.profileRegistry.list();
    return { profiles, total: profiles.length };
  }
}
