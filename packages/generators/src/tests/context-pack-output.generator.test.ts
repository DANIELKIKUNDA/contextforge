import type {
  ContextPackManifest,
  ContextPackPreview,
  IncludedFileDecision,
  PackVolume,
  SourceFile,
} from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { ContextPackOutputGenerator } from '../context-pack-output.generator.js';

function sourceFile(relativePath: string): SourceFile {
  return {
    id: `id-${relativePath}` as SourceFile['id'],
    relativePath: relativePath as SourceFile['relativePath'],
    absolutePath: `/workspace/${relativePath}`,
    extension: '.ts',
    sizeInBytes: 28,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: '2026-08-06T00:00:00.000Z',
  };
}

describe('ContextPackOutputGenerator', () => {
  it('génère un pack complet sans exposer le contenu des fichiers bloqués', () => {
    const included: IncludedFileDecision = {
      status: 'included',
      file: sourceFile('src/index.ts'),
      estimatedTokens: 7,
      category: 'code',
      priority: 1,
      warnings: [],
    };
    const blocked = sourceFile('.env');
    const preview: ContextPackPreview = {
      previewId: 'preview-1',
      requestFingerprint: 'fingerprint-1',
      project: {
        name: 'fixture',
        rootPath: '/workspace',
        workspaceKind: 'single-root',
        platform: 'linux',
        detectedLanguages: ['typescript'],
        selectedPaths: [],
      },
      objective: 'Vérifier la génération' as ContextPackPreview['objective'],
      profile: 'ai-general',
      decisions: [
        included,
        {
          status: 'blocked',
          file: blocked,
          reasonCode: 'secret-detected',
          reason: 'Secret détecté',
          findings: [],
          highestSeverity: 'critical',
        },
      ],
      includedCount: 1,
      excludedCount: 0,
      blockedCount: 1,
      oversizedCount: 0,
      failedCount: 0,
      estimatedTokens: 7,
      estimatedBytes: 28,
      estimatedVolumes: 1,
      warnings: ['Un fichier sensible a été bloqué.'],
      requiresConfirmation: true,
      createdAt: '2026-08-06T00:00:00.000Z',
    };
    const volumes: PackVolume[] = [
      {
        index: 0,
        outputFileName: 'context-01.md',
        fileIds: [included.file.id],
        estimatedTokens: 7,
        estimatedBytes: 28,
        heading: 'Volume 1',
        orderKey: '0001',
      },
    ];
    const outputFiles = [
      'README.md',
      'context-01.md',
      'manifest.json',
      'included-files.md',
      'exclusions.md',
      'warnings.md',
    ];
    const manifest: ContextPackManifest = {
      schemaVersion: '1.0.0',
      contextForgeVersion: '1.0.0',
      packId: 'pack-1',
      name: 'ContextPack-fixture',
      objective: 'Vérifier la génération',
      profile: 'ai-general',
      projectName: 'fixture',
      generatedAt: '2026-08-06T00:00:00.000Z',
      estimationStrategy: 'character-token-estimator',
      limits: { tokenLimit: 32_000, maxFileSizeBytes: 1_000_000 },
      includedFiles: ['src/index.ts'],
      excludedFiles: [],
      blockedFiles: ['.env'],
      oversizedFiles: [],
      failedFiles: [],
      volumes: [
        {
          index: 0,
          outputFileName: 'context-01.md',
          fileCount: 1,
          estimatedTokens: 7,
          estimatedBytes: 28,
        },
      ],
      warnings: preview.warnings,
      securitySummary: {
        totalFindings: 1,
        highestSeverity: 'critical',
        blockedFileCount: 1,
      },
      outputFiles,
    };

    const files = new ContextPackOutputGenerator().generate({
      manifest,
      preview,
      volumes,
      contents: new Map([['src/index.ts', 'export const answer = 42;']]),
    });

    expect([...files.keys()]).toEqual(outputFiles);
    expect(files.get('context-01.md')).toContain('export const answer = 42;');
    expect(files.get('context-01.md')).not.toContain('secret-value');
    expect(files.get('included-files.md')).toContain('src/index.ts');
    expect(files.get('exclusions.md')).toContain('.env');
    expect(files.get('warnings.md')).toContain('Un fichier sensible a été bloqué.');
    expect(JSON.parse(files.get('manifest.json') ?? '{}')).toEqual(manifest);
  });
});
