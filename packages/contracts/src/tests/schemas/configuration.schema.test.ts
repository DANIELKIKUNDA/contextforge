import { describe, expect, it } from 'vitest';
import { ContextForgeConfigurationSchema } from '../../schemas/configuration.schema.js';

describe('ContextForgeConfigurationSchema', () => {
  it('should accept an empty configuration', () => {
    const result = ContextForgeConfigurationSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept a full valid configuration', () => {
    const result = ContextForgeConfigurationSchema.safeParse({
      outputDirectory: '.contextforge',
      defaultProfile: 'ai-general',
      maxEstimatedTokens: 60000,
      includeExtensions: ['.md', '.ts', '.json'],
      excludeDirectories: ['node_modules', '.git'],
      blockSensitiveFiles: true,
      previewBeforeGenerate: true,
      followSymlinks: false,
      maxFileSizeBytes: 1048576,
      maxConcurrentReads: 4,
    });
    expect(result.success).toBe(true);
  });

  it('should apply default followSymlinks as false', () => {
    const result = ContextForgeConfigurationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.followSymlinks).toBe(false);
    }
  });

  it('should reject negative maxEstimatedTokens', () => {
    const result = ContextForgeConfigurationSchema.safeParse({ maxEstimatedTokens: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer maxEstimatedTokens', () => {
    const result = ContextForgeConfigurationSchema.safeParse({ maxEstimatedTokens: 1.5 });
    expect(result.success).toBe(false);
  });
});
