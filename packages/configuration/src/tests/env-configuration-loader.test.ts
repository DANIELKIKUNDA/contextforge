import { describe, expect, it } from 'vitest';
import { EnvConfigurationLoader } from '../env-configuration-loader';

describe('EnvConfigurationLoader', () => {
  const loader = new EnvConfigurationLoader();

  describe('load()', () => {
    it('returns undefined when no relevant env vars are set', () => {
      const result = loader.load({});
      expect(result).toBeUndefined();
    });

    it('reads CONTEXTFORGE_OUTPUT_DIRECTORY as string', () => {
      const result = loader.load({
        CONTEXTFORGE_OUTPUT_DIRECTORY: '/env/output',
      });
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/env/output');
    });

    it('reads CONTEXTFORGE_MAX_ESTIMATED_TOKENS as number', () => {
      const result = loader.load({
        CONTEXTFORGE_MAX_ESTIMATED_TOKENS: '150000',
      });
      expect(result).toBeDefined();
      expect(result?.maxEstimatedTokens).toBe(150000);
    });

    it('reads CONTEXTFORGE_BLOCK_SENSITIVE_FILES as boolean (true)', () => {
      const result = loader.load({
        CONTEXTFORGE_BLOCK_SENSITIVE_FILES: 'true',
      });
      expect(result).toBeDefined();
      expect(result?.blockSensitiveFiles).toBe(true);
    });

    it('reads CONTEXTFORGE_BLOCK_SENSITIVE_FILES as boolean (false)', () => {
      const result = loader.load({
        CONTEXTFORGE_BLOCK_SENSITIVE_FILES: 'false',
      });
      expect(result).toBeDefined();
      expect(result?.blockSensitiveFiles).toBe(false);
    });

    it('reads CONTEXTFORGE_FOLLOW_SYMLINKS with value "1" as true', () => {
      const result = loader.load({
        CONTEXTFORGE_FOLLOW_SYMLINKS: '1',
      });
      expect(result).toBeDefined();
      expect(result?.followSymlinks).toBe(true);
    });

    it('reads CONTEXTFORGE_FOLLOW_SYMLINKS with value "0" as false', () => {
      const result = loader.load({
        CONTEXTFORGE_FOLLOW_SYMLINKS: '0',
      });
      expect(result).toBeDefined();
      expect(result?.followSymlinks).toBe(false);
    });

    it('reads CONTEXTFORGE_INCLUDE_EXTENSIONS as comma-separated array', () => {
      const result = loader.load({
        CONTEXTFORGE_INCLUDE_EXTENSIONS: '.ts,.tsx,.js',
      });
      expect(result).toBeDefined();
      expect(result?.includeExtensions).toEqual(['.ts', '.tsx', '.js']);
    });

    it('reads CONTEXTFORGE_EXCLUDE_DIRECTORIES as comma-separated array', () => {
      const result = loader.load({
        CONTEXTFORGE_EXCLUDE_DIRECTORIES: 'node_modules,dist,.git',
      });
      expect(result).toBeDefined();
      expect(result?.excludeDirectories).toEqual(['node_modules', 'dist', '.git']);
    });

    it('reads multiple env vars at once', () => {
      const result = loader.load({
        CONTEXTFORGE_OUTPUT_DIRECTORY: '/env/out',
        CONTEXTFORGE_MAX_ESTIMATED_TOKENS: '250000',
        CONTEXTFORGE_PREVIEW_BEFORE_GENERATE: 'false',
        CONTEXTFORGE_MAX_FILE_SIZE_BYTES: '500000',
      });
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/env/out');
      expect(result?.maxEstimatedTokens).toBe(250000);
      expect(result?.previewBeforeGenerate).toBe(false);
      expect(result?.maxFileSizeBytes).toBe(500000);
    });

    it('ignores empty string values', () => {
      const result = loader.load({
        CONTEXTFORGE_OUTPUT_DIRECTORY: '',
        CONTEXTFORGE_MAX_ESTIMATED_TOKENS: '100000',
      });
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBeUndefined();
      expect(result?.maxEstimatedTokens).toBe(100000);
    });

    it('ignores non-CONTEXTFORGE_ prefixed variables', () => {
      const result = loader.load({
        NODE_ENV: 'production',
        HOME: '/home/user',
        CONTEXTFORGE_OUTPUT_DIRECTORY: '/only/this',
      });
      expect(result).toBeDefined();
      expect(Object.keys(result ?? {}).length).toBe(1);
      expect(result?.outputDirectory).toBe('/only/this');
    });

    it('rejects invalid number values', () => {
      const result = loader.load({
        CONTEXTFORGE_MAX_ESTIMATED_TOKENS: 'not_a_number',
      });
      expect(result).toBeUndefined();
    });

    it('rejects negative number values', () => {
      const result = loader.load({
        CONTEXTFORGE_MAX_ESTIMATED_TOKENS: '-100',
      });
      expect(result).toBeUndefined();
    });

    it('rejects zero number values', () => {
      const result = loader.load({
        CONTEXTFORGE_MAX_FILE_SIZE_BYTES: '0',
      });
      expect(result).toBeUndefined();
    });

    it('trims array items from comma-separated values', () => {
      const result = loader.load({
        CONTEXTFORGE_INCLUDE_EXTENSIONS: ' .ts , .tsx , .js ',
      });
      expect(result).toBeDefined();
      expect(result?.includeExtensions).toEqual(['.ts', '.tsx', '.js']);
    });

    it('reads CONTEXTFORGE_DEFAULT_PROFILE', () => {
      const result = loader.load({
        CONTEXTFORGE_DEFAULT_PROFILE: 'ai-general',
      });
      expect(result).toBeDefined();
      expect(result?.defaultProfile).toBe('ai-general');
    });

    it('reads CONTEXTFORGE_MAX_CONCURRENT_READS', () => {
      const result = loader.load({
        CONTEXTFORGE_MAX_CONCURRENT_READS: '8',
      });
      expect(result).toBeDefined();
      expect(result?.maxConcurrentReads).toBe(8);
    });

    it('handles "yes"/"no" boolean values', () => {
      const result = loader.load({
        CONTEXTFORGE_FOLLOW_SYMLINKS: 'yes',
        CONTEXTFORGE_BLOCK_SENSITIVE_FILES: 'no',
      });
      expect(result).toBeDefined();
      expect(result?.followSymlinks).toBe(true);
      expect(result?.blockSensitiveFiles).toBe(false);
    });
  });
});
