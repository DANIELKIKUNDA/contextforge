import type { ContextForgeConfiguration } from '@contextforge/contracts';

export interface ConfigurationProvenance {
  readonly [key: string]:
    | 'default'
    | 'project-file'
    | 'environment-variable'
    | 'cli'
    | 'vscode-settings'
    | 'override';
}

export interface ConfigurationLoadResult {
  readonly config: ContextForgeConfiguration;
  readonly provenance: ConfigurationProvenance;
}

/**
 * Loads, merges, and validates the effective configuration.
 * Priority: explicit options > CLI > env vars > project file > defaults.
 */
export interface ConfigurationPort {
  load(overrides?: Partial<ContextForgeConfiguration>): Promise<ConfigurationLoadResult>;
}
