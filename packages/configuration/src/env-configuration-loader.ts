import type { ContextForgeConfiguration } from '@contextforge/contracts';

/**
 * Prefix for all ContextForge environment variables.
 * Example: CONTEXTFORGE_OUTPUT_DIRECTORY, CONTEXTFORGE_MAX_ESTIMATED_TOKENS
 */
const ENV_PREFIX = 'CONTEXTFORGE_';

/**
 * Maps environment variable suffixes to configuration keys.
 * Only explicitly whitelisted variables are read (security: no wildcard).
 */
const ENV_KEY_MAP: Record<string, keyof ContextForgeConfiguration> = {
  OUTPUT_DIRECTORY: 'outputDirectory',
  DEFAULT_PROFILE: 'defaultProfile',
  MAX_ESTIMATED_TOKENS: 'maxEstimatedTokens',
  INCLUDE_EXTENSIONS: 'includeExtensions',
  EXCLUDE_DIRECTORIES: 'excludeDirectories',
  BLOCK_SENSITIVE_FILES: 'blockSensitiveFiles',
  PREVIEW_BEFORE_GENERATE: 'previewBeforeGenerate',
  FOLLOW_SYMLINKS: 'followSymlinks',
  MAX_FILE_SIZE_BYTES: 'maxFileSizeBytes',
  MAX_CONCURRENT_READS: 'maxConcurrentReads',
};

const BOOLEAN_KEYS: (keyof ContextForgeConfiguration)[] = [
  'blockSensitiveFiles',
  'previewBeforeGenerate',
  'followSymlinks',
];

const NUMBER_KEYS: (keyof ContextForgeConfiguration)[] = [
  'maxEstimatedTokens',
  'maxFileSizeBytes',
  'maxConcurrentReads',
];

const ARRAY_KEYS: (keyof ContextForgeConfiguration)[] = ['includeExtensions', 'excludeDirectories'];

/**
 * Loads configuration from environment variables.
 * Only reads variables prefixed with CONTEXTFORGE_ from an
 * explicitly whitelisted set. Unknown variables are silently ignored.
 */
export class EnvConfigurationLoader {
  /**
   * Read environment variables and convert to a partial configuration.
   * Returns undefined if no relevant env vars are set.
   */
  load(
    env: Record<string, string | undefined> = process.env,
  ): Partial<ContextForgeConfiguration> | undefined {
    const result: Record<string, unknown> = {};

    for (const [envSuffix, configKey] of Object.entries(ENV_KEY_MAP)) {
      const envName = `${ENV_PREFIX}${envSuffix}`;
      const rawValue = env[envName];
      if (rawValue === undefined || rawValue === '') {
        continue;
      }

      const parsed = this.parseValue(configKey, rawValue);
      if (parsed !== undefined) {
        result[configKey as string] = parsed;
      }
    }

    return Object.keys(result).length > 0
      ? (result as Partial<ContextForgeConfiguration>)
      : undefined;
  }

  private parseValue(key: keyof ContextForgeConfiguration, raw: string): unknown {
    // Arrays: split by comma, trim each item
    if ((ARRAY_KEYS as string[]).includes(key)) {
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Booleans
    if ((BOOLEAN_KEYS as string[]).includes(key)) {
      const lower = raw.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') {
        return true;
      }
      if (lower === 'false' || lower === '0' || lower === 'no') {
        return false;
      }
      return undefined;
    }

    // Numbers
    if ((NUMBER_KEYS as string[]).includes(key)) {
      const num = Number(raw);
      if (Number.isFinite(num) && num > 0) {
        return Math.floor(num);
      }
      return undefined;
    }

    // Strings: return as-is
    return raw;
  }
}
