import type { ContextForgeConfiguration } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { ConfigurationValidator } from '../configuration-validator';
import { DEFAULT_CONFIGURATION } from '../default-configuration';

describe('ConfigurationValidator', () => {
  const validator = new ConfigurationValidator();

  it('validates default configuration as valid', () => {
    const result = validator.validate(DEFAULT_CONFIGURATION);
    expect(result.isValid).toBe(true);
  });

  it('validates configuration with overrides as valid', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      outputDirectory: '/custom/output',
      maxEstimatedTokens: 150000,
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(true);
  });

  it('rejects negative maxEstimatedTokens', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      maxEstimatedTokens: -1,
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.invalidKeys).toContain('maxEstimatedTokens');
  });

  it('rejects zero maxEstimatedTokens', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      maxEstimatedTokens: 0,
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.invalidKeys).toContain('maxEstimatedTokens');
  });

  it('rejects negative maxFileSizeBytes', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      maxFileSizeBytes: -100,
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.invalidKeys).toContain('maxFileSizeBytes');
  });

  it('rejects negative maxConcurrentReads', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      maxConcurrentReads: -5,
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.invalidKeys).toContain('maxConcurrentReads');
  });

  it('returns error messages for invalid config', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      maxEstimatedTokens: -1,
    };
    const result = validator.validate(config);
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it('accepts profile values as default profile', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      defaultProfile: 'ai-general',
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(true);
  });

  it('rejects non-integer maxEstimatedTokens', () => {
    const config: ContextForgeConfiguration = {
      ...DEFAULT_CONFIGURATION,
      maxEstimatedTokens: 3.14,
    };
    const result = validator.validate(config);
    expect(result.isValid).toBe(false);
    expect(result.invalidKeys).toContain('maxEstimatedTokens');
  });
});
