import { describe, expect, it } from 'vitest';
import { ConfigurationMerger } from '../configuration-merger.js';
import { DEFAULT_CONFIGURATION } from '../default-configuration.js';

describe('ConfigurationMerger', () => {
  const merger = new ConfigurationMerger();

  it('returns base when overrides are empty', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {});
    expect(result).toEqual(DEFAULT_CONFIGURATION);
  });

  it('overrides string property', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {
      outputDirectory: '/custom/output',
    });
    expect(result.outputDirectory).toBe('/custom/output');
  });

  it('overrides boolean property', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {
      followSymlinks: true,
    });
    expect(result.followSymlinks).toBe(true);
  });

  it('overrides number property', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {
      maxEstimatedTokens: 500000,
    });
    expect(result.maxEstimatedTokens).toBe(500000);
  });

  it('overrides array property (replaces, not concatenates)', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {
      excludeDirectories: ['custom-dir'],
    });
    expect(result.excludeDirectories).toEqual(['custom-dir']);
  });

  it('does not override when override value is undefined', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {
      outputDirectory: undefined,
    });
    // Should keep default since undefined means "not set"
    expect(result.outputDirectory).toBe(DEFAULT_CONFIGURATION.outputDirectory);
  });

  it('merges multiple properties at once', () => {
    const result = merger.merge(DEFAULT_CONFIGURATION, {
      outputDirectory: '/merged/output',
      maxFileSizeBytes: 500000,
      blockSensitiveFiles: false,
    });
    expect(result.outputDirectory).toBe('/merged/output');
    expect(result.maxFileSizeBytes).toBe(500000);
    expect(result.blockSensitiveFiles).toBe(false);
    // Unchanged properties should retain defaults
    expect(result.maxEstimatedTokens).toBe(DEFAULT_CONFIGURATION.maxEstimatedTokens);
  });

  it('conflict resolution: later override wins', () => {
    const firstMerge = merger.merge(DEFAULT_CONFIGURATION, {
      maxEstimatedTokens: 100000,
    });
    const secondMerge = merger.merge(firstMerge, {
      maxEstimatedTokens: 300000,
    });
    expect(secondMerge.maxEstimatedTokens).toBe(300000);
  });

  it('array override creates a new array instance (no mutation)', () => {
    const overrides = { excludeDirectories: ['test-dir'] };
    const result = merger.merge(DEFAULT_CONFIGURATION, overrides);
    expect(result.excludeDirectories).not.toBe(DEFAULT_CONFIGURATION.excludeDirectories);
    expect(result.excludeDirectories).not.toBe(overrides.excludeDirectories);
  });
});
