import type { ContextForgeConfiguration } from '@contextforge/contracts';

/**
 * Loads a project-level contextforge.yaml configuration file.
 * In Phase 6, YAML parsing uses a manually written parser since
 * no external YAML dependency is added.
 * This loader delegates actual file reading to the caller.
 */
export class YamlConfigurationLoader {
  /**
   * Load and parse a YAML configuration file.
   * Returns undefined if the file doesn't exist or is invalid.
   */
  load(_filePath: string): Partial<ContextForgeConfiguration> | undefined {
    // In Phase 6 integration, the actual file reading will be injected.
    return undefined;
  }

  /**
   * Parse raw YAML content into a partial configuration.
   * Supports a minimal YAML subset: flat key-value pairs.
   * Deeply nested structures are not supported in Phase 6.
   */
  parse(content: string): Partial<ContextForgeConfiguration> | undefined {
    const trimmed = content.trim();
    if (!trimmed) {
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
    const lines = trimmed.split('\n');

    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) {
        continue;
      }
      const rawKey = line.slice(0, colonIdx).trim();
      const rawValue = line.slice(colonIdx + 1).trim();

      // Skip comments and empty keys
      if (rawKey.startsWith('#') || !rawKey) {
        continue;
      }

      const key = rawKey as keyof ContextForgeConfiguration;
      if (!(knownKeys as string[]).includes(key)) {
        continue;
      }

      const parsed = this.parseValue(key, rawValue);
      if (parsed !== undefined) {
        (result as Record<string, unknown>)[key] = parsed;
      }
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }

  private parseValue(key: keyof ContextForgeConfiguration, raw: string): unknown {
    // Handle arrays
    if (key === 'includeExtensions' || key === 'excludeDirectories') {
      return this.parseYamlArray(raw);
    }

    // Handle booleans
    if (
      key === 'blockSensitiveFiles' ||
      key === 'previewBeforeGenerate' ||
      key === 'followSymlinks'
    ) {
      const lower = raw.toLowerCase();
      if (lower === 'true' || lower === 'yes') {
        return true;
      }
      if (lower === 'false' || lower === 'no') {
        return false;
      }
      return undefined;
    }

    // Handle numbers
    if (
      key === 'maxEstimatedTokens' ||
      key === 'maxFileSizeBytes' ||
      key === 'maxConcurrentReads'
    ) {
      const num = Number(raw);
      if (Number.isFinite(num) && num > 0) {
        return Math.floor(num);
      }
      return undefined;
    }

    // Strings: strip quotes
    let value = raw;
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value || undefined;
  }

  private parseYamlArray(raw: string): string[] | undefined {
    // Handle YAML flow sequence: [a, b, c]
    if (raw.startsWith('[') && raw.endsWith(']')) {
      const inner = raw.slice(1, -1);
      if (!inner.trim()) {
        return [];
      }
      return inner
        .split(',')
        .map((s) => {
          let item = s.trim();
          if (
            (item.startsWith('"') && item.endsWith('"')) ||
            (item.startsWith("'") && item.endsWith("'"))
          ) {
            item = item.slice(1, -1);
          }
          return item;
        })
        .filter(Boolean);
    }

    // Handle YAML block sequence
    // Items must start with '-' on separate lines
    // For simplicity in Phase 6, just return the single item if it's a plain string
    return [raw];
  }
}
