import { describe, expect, it } from 'vitest';
import { JsonConfigurationLoader } from '../json-configuration-loader.js';

describe('JsonConfigurationLoader', () => {
  const loader = new JsonConfigurationLoader();

  describe('parse()', () => {
    it('parses valid JSON configuration', () => {
      const result = loader.parse(
        JSON.stringify({
          outputDirectory: '/custom/output',
          maxEstimatedTokens: 100000,
        }),
      );
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/custom/output');
      expect(result?.maxEstimatedTokens).toBe(100000);
    });

    it('parses boolean properties', () => {
      const result = loader.parse(
        JSON.stringify({
          blockSensitiveFiles: false,
          previewBeforeGenerate: true,
        }),
      );
      expect(result).toBeDefined();
      expect(result?.blockSensitiveFiles).toBe(false);
      expect(result?.previewBeforeGenerate).toBe(true);
    });

    it('parses array properties', () => {
      const result = loader.parse(
        JSON.stringify({
          excludeDirectories: ['node_modules', 'dist'],
          includeExtensions: ['.ts', '.tsx'],
        }),
      );
      expect(result).toBeDefined();
      expect(result?.excludeDirectories).toEqual(['node_modules', 'dist']);
      expect(result?.includeExtensions).toEqual(['.ts', '.tsx']);
    });

    it('returns undefined for invalid JSON', () => {
      const result = loader.parse('{ invalid json }');
      expect(result).toBeUndefined();
    });

    it('returns undefined for non-object JSON', () => {
      const result = loader.parse('"just a string"');
      expect(result).toBeUndefined();
    });

    it('returns undefined for null JSON', () => {
      const result = loader.parse('null');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const result = loader.parse('');
      expect(result).toBeUndefined();
    });

    it('ignores unknown keys', () => {
      const result = loader.parse(
        JSON.stringify({
          unknownKey: 'value',
          outputDirectory: '/known',
        }),
      );
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/known');
      expect((result as Record<string, unknown>).unknownKey).toBeUndefined();
    });

    it('skips keys with undefined values', () => {
      const result = loader.parse(
        JSON.stringify({
          outputDirectory: null,
          maxEstimatedTokens: 100000,
        }),
      );
      expect(result).toBeDefined();
      // outputDirectory with null should be skipped
      expect(result?.outputDirectory).toBeUndefined();
      expect(result?.maxEstimatedTokens).toBe(100000);
    });
  });

  describe('load()', () => {
    it('returns undefined for any path (stub)', () => {
      const result = loader.load('contextforge.json');
      expect(result).toBeUndefined();
    });

    it('returns undefined for non-existent file path', () => {
      const result = loader.load('/nonexistent/contextforge.json');
      expect(result).toBeUndefined();
    });
  });
});
