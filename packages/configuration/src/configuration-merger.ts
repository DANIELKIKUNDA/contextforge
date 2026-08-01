import type { ContextForgeConfiguration } from '@contextforge/contracts';

/**
 * Merges configuration layers with defined priority.
 * Later layers override earlier ones for defined properties.
 * Arrays are replaced, not concatenated.
 */
export class ConfigurationMerger {
  /**
   * Merge two configuration objects.
   * Values from `overrides` take precedence over `base`.
   * Only properties that are explicitly defined (not undefined) in `overrides`
   * will override the corresponding property in `base`.
   */
  merge(
    base: ContextForgeConfiguration,
    overrides: Partial<ContextForgeConfiguration>,
  ): ContextForgeConfiguration {
    const result = { ...base };

    const keys: (keyof ContextForgeConfiguration)[] = [
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

    for (const key of keys) {
      const overrideValue = overrides[key];
      if (overrideValue !== undefined) {
        // For arrays, create a shallow copy to avoid mutation
        if (Array.isArray(overrideValue)) {
          (result as Record<string, unknown>)[key] = [...overrideValue];
        } else {
          (result as Record<string, unknown>)[key] = overrideValue;
        }
      }
    }

    return result;
  }
}
