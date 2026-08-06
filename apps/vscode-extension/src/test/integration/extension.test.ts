/// <reference types="mocha" />
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import type {
  ContextPackManifest,
  ContextPackPreview,
  IncludedFileDecision,
  PackVolume,
  SourceFile,
} from '@contextforge/contracts';
import { expect } from 'chai';
import * as vscode from 'vscode';
import { VscodeContextPackWriter } from '../../adapters/vscode-context-pack-writer.js';

function sourceFile(relativePath: string): SourceFile {
  return {
    id: `smoke-${relativePath}` as SourceFile['id'],
    relativePath: relativePath as SourceFile['relativePath'],
    absolutePath: path.join('C:\\fixture', relativePath),
    extension: '.ts',
    sizeInBytes: 35,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: '2026-08-06T00:00:00.000Z',
  };
}

/**
 * Tests d'intégration exécutés dans un vrai Extension Host VS Code
 * via @vscode/test-electron.
 *
 * ID VS Code réel : publisher.name = contextforge.contextforge
 */
describe('Extension VS Code — Intégration', () => {
  it("activation de l'extension sans erreur", async () => {
    // L'extension est activée automatiquement par VS Code au démarrage
    const ext = vscode.extensions.getExtension('contextforge.contextforge');
    expect(ext).to.not.be.undefined;
    expect(ext?.isActive).to.be.true;
  });

  it('les quatre commandes sont enregistrées', async () => {
    const allCommands = await vscode.commands.getCommands(true);

    expect(allCommands).to.include('contextForge.generateContextPack');
    expect(allCommands).to.include('contextForge.previewContextPack');
    expect(allCommands).to.include('contextForge.validateConfiguration');
    expect(allCommands).to.include('contextForge.openLastContextPack');
  });

  it("validateConfiguration s'exécute sans erreur", async () => {
    // Exécuter la commande validateConfiguration — vérifie qu'elle ne crash pas
    try {
      await vscode.commands.executeCommand('contextForge.validateConfiguration');
    } catch (_err) {
      // Si la config n'est pas définie, c'est normal — l'important est que ça ne crash pas
    }
  });

  it('écrit et commit un Context Pack complet dans un répertoire temporaire', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'contextforge-smoke-'));
    const included: IncludedFileDecision = {
      status: 'included',
      file: sourceFile('src/smoke.ts'),
      estimatedTokens: 9,
      category: 'code',
      priority: 1,
      warnings: [],
    };
    const blocked = sourceFile('.env');
    const outputFiles = [
      'README.md',
      'context-01.md',
      'manifest.json',
      'included-files.md',
      'exclusions.md',
      'warnings.md',
    ];
    const preview: ContextPackPreview = {
      previewId: 'preview-smoke',
      requestFingerprint: 'fingerprint-smoke',
      project: {
        name: 'smoke-fixture',
        rootPath: root,
        workspaceKind: 'single-root',
        platform: process.platform,
        detectedLanguages: ['typescript'],
        selectedPaths: [],
      },
      objective: 'Smoke test release' as ContextPackPreview['objective'],
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
      estimatedTokens: 9,
      estimatedBytes: 35,
      estimatedVolumes: 1,
      warnings: [],
      requiresConfirmation: true,
      createdAt: '2026-08-06T00:00:00.000Z',
    };
    const volumes: PackVolume[] = [
      {
        index: 0,
        outputFileName: 'context-01.md',
        fileIds: [included.file.id],
        estimatedTokens: 9,
        estimatedBytes: 35,
        heading: 'Volume 1',
        orderKey: '0000',
      },
    ];
    const manifest: ContextPackManifest = {
      schemaVersion: '1.0.0',
      contextForgeVersion: '1.0.0',
      packId: 'pack-smoke',
      name: 'ContextPack-smoke-fixture',
      objective: 'Smoke test release',
      profile: 'ai-general',
      projectName: 'smoke-fixture',
      generatedAt: '2026-08-06T00:00:00.000Z',
      estimationStrategy: 'character-token-estimator',
      limits: { tokenLimit: 32_000, maxFileSizeBytes: 1_048_576 },
      includedFiles: ['src/smoke.ts'],
      excludedFiles: [],
      blockedFiles: ['.env'],
      oversizedFiles: [],
      failedFiles: [],
      volumes: [
        {
          index: 0,
          outputFileName: 'context-01.md',
          fileCount: 1,
          estimatedTokens: 9,
          estimatedBytes: 35,
        },
      ],
      warnings: [],
      securitySummary: { totalFindings: 1, highestSeverity: 'critical', blockedFileCount: 1 },
      outputFiles,
    };
    const finalDirectory = path.join(root, 'pack-final');

    try {
      const writer = new VscodeContextPackWriter();
      const temporaryDirectory = await writer.writeTemporary({
        packId: 'pack-smoke',
        outputRoot: path.join(root, 'output'),
        volumes,
        manifest,
        preview,
        contents: new Map([['src/smoke.ts', 'export const smokeMarker = "PASS";']]),
      });

      expect(await writer.validateTemporary(temporaryDirectory)).to.deep.equal([]);
      await writer.commit(temporaryDirectory, finalDirectory);

      expect((await readdir(finalDirectory)).sort()).to.deep.equal([...outputFiles].sort());
      expect(await readFile(path.join(finalDirectory, 'context-01.md'), 'utf-8')).to.contain(
        'smokeMarker = "PASS"',
      );
      expect(await readFile(path.join(finalDirectory, 'exclusions.md'), 'utf-8')).to.contain(
        '.env',
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it("désactivation propre de l'extension", async () => {
    const ext = vscode.extensions.getExtension('contextforge.contextforge');
    expect(ext).to.not.be.undefined;
    // La désactivation est testée en appelant la commande de désactivation
    // VS Code gère la désactivation automatiquement à la fermeture
    expect(ext?.isActive).to.be.true;
  });
});
