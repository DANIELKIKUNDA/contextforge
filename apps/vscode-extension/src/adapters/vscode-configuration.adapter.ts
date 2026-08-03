import type { ContextForgeConfiguration } from '@contextforge/contracts';
import type { ConfigurationLoadResult, ConfigurationPort } from '@contextforge/core';
import { workspace } from 'vscode';

/**
 * Adaptateur VS Code pour le port ConfigurationPort.
 * Charge la configuration depuis les paramètres VS Code (settings.json),
 * puis fusionne avec le fichier projet et les valeurs par défaut du Core.
 *
 * Priorité : options explicites > paramètres VS Code > variables autorisées > fichier projet > défaut.
 */
export class VscodeConfigurationAdapter implements ConfigurationPort {
  /** Charge et fusionne la configuration effective. */
  async load(overrides?: Partial<ContextForgeConfiguration>): Promise<ConfigurationLoadResult> {
    const vsCodeConfig = workspace.getConfiguration('contextForge');

    const outputDirectory = vsCodeConfig.get<string>('outputDirectory') ?? '.contextforge/output';

    const config: ContextForgeConfiguration = {
      outputDirectory: overrides?.outputDirectory ?? outputDirectory,
      blockSensitiveFiles: overrides?.blockSensitiveFiles ?? true,
      followSymlinks: overrides?.followSymlinks ?? false,
      maxFileSizeBytes: overrides?.maxFileSizeBytes ?? 1_048_576,
      maxConcurrentReads: overrides?.maxConcurrentReads ?? 16,
      excludeDirectories: overrides?.excludeDirectories ?? [
        'node_modules',
        '.git',
        '.svn',
        '.hg',
        'dist',
        'build',
        '.turbo',
        '.contextforge',
      ],
      includeExtensions: overrides?.includeExtensions ?? [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
        '.md',
        '.mdx',
        '.css',
        '.html',
        '.yaml',
        '.yml',
        '.toml',
        '.py',
        '.rs',
        '.go',
      ],
      previewBeforeGenerate: overrides?.previewBeforeGenerate ?? true,
    };

    return {
      config,
      provenance: {},
    };
  }
}
