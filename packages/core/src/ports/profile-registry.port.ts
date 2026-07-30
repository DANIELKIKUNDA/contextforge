import type { ProfileId } from '@contextforge/contracts';
import type { PackVolume } from '@contextforge/contracts';

export interface ProfileDefinition {
  readonly id: ProfileId;
  readonly name: string;
  readonly description: string;
  readonly defaultTokenLimit: number;
  readonly suggestedDirectories: string[];
  readonly priorityExtensions: string[];
  readonly outputCategories: string[];
}

/**
 * Lists and resolves available profiles.
 */
export interface ProfileRegistryPort {
  list(): ProfileDefinition[];
  resolve(id: ProfileId): ProfileDefinition | undefined;
}
