import { describe, expect, it } from 'vitest';
import { YamlConfigurationLoader } from '../yaml-configuration-loader';

describe('YamlConfigurationLoader', () => {
  const loader = new YamlConfigurationLoader();

  describe('parse()', () => {
    it('parses flat YAML key-value pairs', () => {
      const result = loader.parse('outputDirectory: /custom/output\nmaxEstimatedTokens: 100000');
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/custom/output');
      expect(result?.maxEstimatedTokens).toBe(100000);
    });

    it('parses boolean true values', () => {
      const result = loader.parse('blockSensitiveFiles: false\npreviewBeforeGenerate: true');
      expect(result).toBeDefined();
      expect(result?.blockSensitiveFiles).toBe(false);
      expect(result?.previewBeforeGenerate).toBe(true);
    });

    it('parses boolean values with yes/no syntax', () => {
      const result = loader.parse('followSymlinks: yes');
      expect(result).toBeDefined();
      expect(result?.followSymlinks).toBe(true);
    });

    it('parses YAML array in flow sequence format', () => {
      const result = loader.parse('excludeDirectories: [node_modules, dist, .git]');
      expect(result).toBeDefined();
      expect(result?.excludeDirectories).toEqual(['node_modules', 'dist', '.git']);
    });

    it('parses includeExtensions array', () => {
      const result = loader.parse('includeExtensions: [.ts, .tsx, .js]');
      expect(result).toBeDefined();
      expect(result?.includeExtensions).toEqual(['.ts', '.tsx', '.js']);
    });

    it('parses quoted string values', () => {
      const result = loader.parse('outputDirectory: "/path with spaces"');
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/path with spaces');
    });

    it('parses single-quoted string values', () => {
      const result = loader.parse("outputDirectory: '/path with spaces'");
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/path with spaces');
    });

    it('returns undefined for empty content', () => {
      expect(loader.parse('')).toBeUndefined();
    });

    it('returns undefined for whitespace-only content', () => {
      expect(loader.parse('   \n  \n  ')).toBeUndefined();
    });

    it('ignores commented lines', () => {
      const result = loader.parse('# A comment\noutputDirectory: /valid');
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/valid');
    });

    it('ignores unknown keys', () => {
      const result = loader.parse('unknownKey: value\noutputDirectory: /known');
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/known');
      expect((result as Record<string, unknown>).unknownKey).toBeUndefined();
    });

    it('ignores lines without a colon', () => {
      const result = loader.parse('outputDirectory: /valid\nplain line without colon');
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/valid');
    });

    it('parses multiple properties together', () => {
      const yaml = [
        'outputDirectory: /out',
        'maxEstimatedTokens: 250000',
        'blockSensitiveFiles: false',
        'previewBeforeGenerate: true',
      ].join('\n');
      const result = loader.parse(yaml);
      expect(result).toBeDefined();
      expect(result?.outputDirectory).toBe('/out');
      expect(result?.maxEstimatedTokens).toBe(250000);
      expect(result?.blockSensitiveFiles).toBe(false);
      expect(result?.previewBeforeGenerate).toBe(true);
    });
  });

  describe('load()', () => {
    it('returns undefined for any path (stub)', () => {
      const result = loader.load('contextforge.yaml');
      expect(result).toBeUndefined();
    });
  });
});
