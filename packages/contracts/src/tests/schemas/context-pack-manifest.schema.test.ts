import { describe, expect, it } from 'vitest';
import { ContextPackManifestSchema } from '../../schemas/context-pack-manifest.schema';

describe('ContextPackManifestSchema', () => {
  const validManifest = {
    schemaVersion: '1.0.0',
    contextForgeVersion: '1.0.0',
    packId: 'abc-def-123',
    name: 'payment-module-context',
    objective: 'Prepare a context pack for the payment module review.',
    profile: 'ai-general',
    projectName: 'my-project',
    generatedAt: '2026-07-29T12:00:00Z',
    estimationStrategy: 'characters/4',
    limits: { tokenLimit: 60000, maxFileSizeBytes: 1048576 },
    includedFiles: ['src/payments/domain/payment.ts'],
    excludedFiles: ['src/ignored/file.txt'],
    blockedFiles: ['.env'],
    oversizedFiles: [],
    failedFiles: [],
    volumes: [
      {
        index: 1,
        outputFileName: 'context-01.md',
        fileCount: 5,
        estimatedTokens: 30000,
        estimatedBytes: 120000,
      },
    ],
    warnings: ['No tests found for module.'],
    securitySummary: { totalFindings: 1, highestSeverity: 'high', blockedFileCount: 1 },
    outputFiles: ['README.md', 'context-01.md', 'manifest.json'],
  };

  it('should accept a valid manifest', () => {
    const result = ContextPackManifestSchema.safeParse(validManifest);
    expect(result.success).toBe(true);
  });

  it('should reject an empty packId', () => {
    const result = ContextPackManifestSchema.safeParse({ ...validManifest, packId: '' });
    expect(result.success).toBe(false);
  });

  it('should accept "none" as highestSeverity', () => {
    const result = ContextPackManifestSchema.safeParse({
      ...validManifest,
      securitySummary: { totalFindings: 0, highestSeverity: 'none', blockedFileCount: 0 },
    });
    expect(result.success).toBe(true);
  });

  it('should reject volume index < 1', () => {
    const result = ContextPackManifestSchema.safeParse({
      ...validManifest,
      volumes: [
        {
          index: 0,
          outputFileName: 'context-01.md',
          fileCount: 5,
          estimatedTokens: 30000,
          estimatedBytes: 120000,
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
