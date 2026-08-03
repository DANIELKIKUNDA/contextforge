import { describe, expect, it } from 'vitest';
import { ConfigurationService } from '../configuration-provenance.js';
import { DEFAULT_CONFIGURATION } from '../default-configuration.js';

describe('ConfigurationService', () => {
  const service = new ConfigurationService();

  describe('load() with no overrides', () => {
    it('returns defaults with default provenance', async () => {
      const result = await service.load();
      expect(result.config).toEqual(DEFAULT_CONFIGURATION);
      expect(result.provenance.outputDirectory).toBe('default');
      expect(result.provenance.blockSensitiveFiles).toBe('default');
    });

    it('all provenance entries are default', async () => {
      const result = await service.load();
      for (const value of Object.values(result.provenance)) {
        expect(value).toBe('default');
      }
    });
  });

  describe('load() with overrides', () => {
    it('applies override values', async () => {
      const result = await service.load({
        outputDirectory: '/overridden/path',
        maxEstimatedTokens: 100000,
      });
      expect(result.config.outputDirectory).toBe('/overridden/path');
      expect(result.config.maxEstimatedTokens).toBe(100000);
    });

    it('marks overridden keys as override in provenance', async () => {
      const result = await service.load({
        outputDirectory: '/overridden/path',
      });
      expect(result.provenance.outputDirectory).toBe('override');
      // Unchanged keys should remain default
      expect(result.provenance.blockSensitiveFiles).toBe('default');
    });

    it('respects priority: override > defaults', async () => {
      const result = await service.load({
        followSymlinks: true,
      });
      expect(result.config.followSymlinks).toBe(true);
    });

    it('handles empty overrides object', async () => {
      const result = await service.load({});
      expect(result.config).toEqual(DEFAULT_CONFIGURATION);
    });
  });

  describe('load() validation recovery', () => {
    it('recovers from invalid maxEstimatedTokens', async () => {
      const result = await service.load({
        // biome-ignore lint/suspicious/noExplicitAny: test for invalid input
        maxEstimatedTokens: -1 as any,
      });
      // Should recover to default
      expect(result.config.maxEstimatedTokens).toBe(DEFAULT_CONFIGURATION.maxEstimatedTokens);
      // Provenance should be reset to default
      expect(result.provenance.maxEstimatedTokens).toBe('default');
    });

    it('recovers from invalid maxFileSizeBytes', async () => {
      const result = await service.load({
        // biome-ignore lint/suspicious/noExplicitAny: test for invalid input
        maxFileSizeBytes: -1 as any,
      });
      expect(result.config.maxFileSizeBytes).toBe(DEFAULT_CONFIGURATION.maxFileSizeBytes);
      expect(result.provenance.maxFileSizeBytes).toBe('default');
    });
  });

  describe('provenance tracking', () => {
    it('tracks each key independently', async () => {
      const result = await service.load({
        outputDirectory: '/custom/path',
      });
      expect(result.provenance.outputDirectory).toBe('override');
      expect(result.provenance.maxEstimatedTokens).toBe('default');
      expect(result.provenance.blockSensitiveFiles).toBe('default');
    });
  });
});
