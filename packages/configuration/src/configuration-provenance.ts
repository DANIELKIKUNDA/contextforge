import type { ContextForgeConfiguration } from '@contextforge/contracts';
import type {
  ConfigurationLoadResult,
  ConfigurationPort,
  ConfigurationProvenance,
} from '@contextforge/core';
import { ConfigurationMerger } from './configuration-merger.js';
import { ConfigurationValidator } from './configuration-validator.js';
import { DEFAULT_CONFIGURATION } from './default-configuration.js';
import { EnvConfigurationLoader } from './env-configuration-loader.js';
import { JsonConfigurationLoader } from './json-configuration-loader.js';
import { YamlConfigurationLoader } from './yaml-configuration-loader.js';

type ProvenanceLevel =
  | 'default'
  | 'project-file'
  | 'environment-variable'
  | 'cli'
  | 'vscode-settings'
  | 'override';

/**
 * Loads, merges, and validates the effective configuration.
 *
 * Priority chain (highest to lowest):
 *   explicit options / CLI arguments (override)
 * > VS Code settings (vscode-settings)       — resolved at adapter level
 * > environment variables (environment-variable)
 * > project file (project-file)
 * > defaults (default)
 *
 * In Phase 6, VS Code settings and CLI are resolved by adapters and passed
 * as `overrides`. This implementation handles defaults, project file,
 * environment variables, and overrides internally.
 */
export class ConfigurationService implements ConfigurationPort {
  private readonly jsonLoader = new JsonConfigurationLoader();
  private readonly yamlLoader = new YamlConfigurationLoader();
  private readonly envLoader = new EnvConfigurationLoader();
  private readonly merger = new ConfigurationMerger();
  private readonly validator = new ConfigurationValidator();

  async load(overrides?: Partial<ContextForgeConfiguration>): Promise<ConfigurationLoadResult> {
    // Layer 1: defaults
    let config = { ...DEFAULT_CONFIGURATION };
    const provenance: Record<string, ProvenanceLevel> = {};

    // Mark all defaults
    for (const key of Object.keys(config) as (keyof ContextForgeConfiguration)[]) {
      provenance[key] = 'default';
    }

    // Layer 2: project file (try contextforge.json then contextforge.yaml)
    const projectConfig = this.loadProjectConfig();
    if (projectConfig) {
      config = this.merger.merge(config, projectConfig);
      this.updateProvenance(provenance, projectConfig, 'project-file');
    }

    // Layer 3: environment variables (CONTEXTFORGE_*)
    const envConfig = this.envLoader.load();
    if (envConfig) {
      config = this.merger.merge(config, envConfig);
      this.updateProvenance(provenance, envConfig, 'environment-variable');
    }

    // Layer 4: overrides (CLI / VS Code / explicit options)
    if (overrides) {
      config = this.merger.merge(config, overrides);
      this.updateProvenance(provenance, overrides, 'override');
    }

    // Validate
    const validationResult = this.validator.validate(config);
    if (!validationResult.isValid) {
      // Restore defaults for invalid values to keep the system running
      // with a warning via provenance
      config = this.restoreInvalids(config, validationResult.invalidKeys ?? []);
      for (const key of validationResult.invalidKeys ?? []) {
        provenance[key] = 'default';
      }
    }

    return { config, provenance: provenance as ConfigurationProvenance };
  }

  private loadProjectConfig(): Partial<ContextForgeConfiguration> | undefined {
    // In Phase 6, the project config file resolution is done via
    // the file system adapters. Here we use the loaders directly.
    // For now, attempt to load from known paths.
    const jsonResult = this.jsonLoader.load('contextforge.json');
    if (jsonResult) {
      return jsonResult;
    }
    return this.yamlLoader.load('contextforge.yaml');
  }

  private updateProvenance(
    provenance: Record<string, ProvenanceLevel>,
    source: Partial<ContextForgeConfiguration>,
    level: ProvenanceLevel,
  ): void {
    for (const key of Object.keys(source) as (keyof ContextForgeConfiguration)[]) {
      if (source[key] !== undefined) {
        provenance[key] = level;
      }
    }
  }

  private restoreInvalids(
    config: ContextForgeConfiguration,
    invalidKeys: string[],
  ): ContextForgeConfiguration {
    const result = { ...config } as Record<string, unknown>;
    for (const key of invalidKeys) {
      const k = key as keyof ContextForgeConfiguration;
      result[key] = DEFAULT_CONFIGURATION[k];
    }
    return result as unknown as ContextForgeConfiguration;
  }
}
