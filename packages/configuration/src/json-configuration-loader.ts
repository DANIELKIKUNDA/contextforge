import type { ContextForgeConfiguration } from '@contextforge/contracts';

/**
 * Loads a project-level contextforge.json configuration file.
 * In Phase 6, the actual file reading is delegated to the scanner adapter.
 * This loader parses raw JSON content.
 */
export class JsonConfigurationLoader {
  /**
   * Load and parse a JSON configuration file.
   * Returns undefined if the file doesn't exist or is invalid.
   */
  load(_filePath: string): Partial<ContextForgeConfiguration> | undefined {
    // In Phase 6 integration, the actual file reading will be injected.
    // For now, this loader delegates to the caller.
    // The ConfigurationService handles the file resolution.
    return undefined;
  }

  /**
   * Parse raw JSON content into a partial configuration.
   * Only returns known keys from the configuration schema.
   * Null values are filtered out (treated as undefined).
   */
  parse(content: string): Partial<ContextForgeConfiguration> | undefined {
    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      if (typeof parsed !== 'object' || parsed === null) {
        return undefined;
      }

      const knownKeys: (keyof ContextForgeConfiguration)[] = [
        'outputDirectory',
        'defaultProfile',
        'maxEstimatedTokens',
        'includeExtensions',
        'excludeDirectories',
        'blockSensitiveFiles',
        'previewBeforeGenerate',
        'followSymlinks',
        'maxFileSizeBytes',
        'maxConcurrentReads',
      ];

      const result: Partial<ContextForgeConfiguration> = {};
      for (const key of knownKeys) {
        if (key in parsed && parsed[key] != null) {
          (result as Record<string, unknown>)[key] = parsed[key];
        }
      }
      return Object.keys(result).length > 0 ? result : undefined;
    } catch {
      return undefined;
    }
  }
}
