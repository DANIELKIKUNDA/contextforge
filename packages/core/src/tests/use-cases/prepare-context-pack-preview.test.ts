import type { ContextPackPreview, SecurityFinding, SourceFile } from '@contextforge/contracts';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CancellationPort } from '../../ports/cancellation.port';
import type {
  ConfigurationLoadResult,
  ConfigurationPort,
  ConfigurationProvenance,
} from '../../ports/configuration.port';
import type { FileContentReaderPort, ReadFileResult } from '../../ports/file-content-reader.port';
import type { FileDiscoveryPort } from '../../ports/file-discovery.port';
import type { PackingPort, PackingResult } from '../../ports/packing.port';
import type { ProfileDefinition, ProfileRegistryPort } from '../../ports/profile-registry.port';
import type { ProgressEvent, ProgressReporterPort } from '../../ports/progress-reporter.port';
import type { SecurityScannerPort } from '../../ports/security-scanner.port';
import type { AggregateSizeMetrics, FileSizeMetrics, SizingPort } from '../../ports/sizing.port';
import {
  PrepareContextPackPreview,
  type PreparePreviewInput,
} from '../../use-cases/prepare-context-pack-preview';

/** Construit un SourceFile minimal pour les fakes. */
function fakeFile(relativePath: string, sizeInBytes = 1024): SourceFile {
  return {
    id: `id-${relativePath}` as SourceFile['id'],
    relativePath: relativePath as SourceFile['relativePath'],
    absolutePath: `/fake/${relativePath}`,
    extension: relativePath.includes('.') ? `.${relativePath.split('.').pop()}` : '',
    sizeInBytes,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: new Date().toISOString(),
  } as SourceFile;
}

/** Spy de progression : enregistre chaque appel. */
function spyProgress(): { reporter: ProgressReporterPort; events: ProgressEvent[] } {
  const events: ProgressEvent[] = [];
  const reporter: ProgressReporterPort = {
    report(event: ProgressEvent): void {
      events.push(event);
    },
  };
  return { reporter, events };
}

/** Fake CancellationPort : contrôle l'annulation. */
function fakeCancellation(cancelled = false): CancellationPort {
  const _cancelled = cancelled;
  return {
    get isCancelled(): boolean {
      return _cancelled;
    },
    throwIfCancelled(): void {
      if (_cancelled) throw new Error('Annulation');
    },
  };
}

describe("PrepareContextPackPreview — test d'intégration avec fakes", () => {
  let configurationPort: ConfigurationPort;
  let profileRegistry: ProfileRegistryPort;
  let fileDiscovery: FileDiscoveryPort;
  let fileContentReader: FileContentReaderPort;
  let securityScanner: SecurityScannerPort;
  let sizingPort: SizingPort;
  let packingPort: PackingPort;
  let progressReporter: ProgressReporterPort;
  let cancellation: CancellationPort;
  let progressEvents: ProgressEvent[];
  let sut: PrepareContextPackPreview;

  beforeEach(() => {
    configurationPort = {
      async load(): Promise<ConfigurationLoadResult> {
        return {
          config: {
            outputDirectory: '.contextforge/output',
            blockSensitiveFiles: true,
            followSymlinks: false,
            maxFileSizeBytes: 1_048_576,
            maxConcurrentReads: 16,
            excludeDirectories: ['node_modules'],
            includeExtensions: [],
            previewBeforeGenerate: true,
          },
          provenance: {} as ConfigurationProvenance,
        };
      },
    };

    profileRegistry = {
      list(): ProfileDefinition[] {
        return [];
      },
      resolve(): ProfileDefinition | undefined {
        return {
          id: 'ai-general',
          name: 'AI General',
          description: 'test',
          defaultTokenLimit: 200_000,
          suggestedDirectories: [],
          priorityExtensions: [],
          outputCategories: [],
        };
      },
    };

    fileDiscovery = {
      async discover(): Promise<SourceFile[]> {
        return [fakeFile('src/index.ts'), fakeFile('src/utils.ts'), fakeFile('.env')];
      },
    };

    fileContentReader = {
      async read(file: SourceFile): Promise<ReadFileResult> {
        const rp = file.relativePath as string;
        if (rp === '.env') return { file, content: 'SECRET_KEY=abc123' };
        return { file, content: `// contenu de ${rp}` };
      },
    };

    securityScanner = {
      async scan(_file: SourceFile, content?: string): Promise<SecurityFinding[]> {
        if (content?.includes('SECRET_KEY')) {
          return [
            {
              ruleId: 'S001',
              kind: 'api-key',
              severity: 'critical',
              relativePath: '.env',
              message: 'secret',
              maskedEvidence: '***',
            },
          ];
        }
        return [];
      },
    };

    sizingPort = {
      estimateFile(_content: string): FileSizeMetrics {
        return { bytes: 400, characters: 400, lines: 10, estimatedTokens: 100 };
      },
      estimateAggregate(): AggregateSizeMetrics {
        return { totalBytes: 800, totalCharacters: 800, totalLines: 20, estimatedTokens: 200 };
      },
    };

    packingPort = {
      pack(): PackingResult {
        return { volumes: [], oversizedFiles: [] };
      },
    };

    const spy = spyProgress();
    progressReporter = spy.reporter;
    progressEvents = spy.events;

    cancellation = fakeCancellation(false);

    sut = new PrepareContextPackPreview(
      configurationPort,
      profileRegistry,
      fileDiscovery,
      fileContentReader,
      securityScanner,
      sizingPort,
      packingPort,
      progressReporter,
      cancellation,
    );
  });

  // ─── 1. Exécution complète du pipeline ────────────
  it('exécute les 13 étapes et retourne un ContextPackPreview', async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: "test d'intégration",
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const preview = await sut.execute(input);

    expect(preview).toBeDefined();
    expect(preview.previewId).toMatch(/^preview-/);
    expect(preview.requestFingerprint).toHaveLength(64);
    expect(preview.profile).toBe('ai-general');
    expect(preview.objective).toBe("test d'intégration");
    expect(preview.decisions.length).toBeGreaterThan(0);
  });

  // ─── 2. Ordre des 13 étapes via la progression ────
  it("émet 13 événements de progression dans l'ordre", async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    await sut.execute(input);

    expect(progressEvents.length).toBe(13);
    const etapes = progressEvents.map((e) => e.message);
    expect(etapes).toEqual([
      'validation',
      'configuration',
      'résolution du profil',
      'normalisation',
      'scan',
      'exclusions',
      'blocage nom/extension',
      'lecture',
      'scan de sécurité',
      'décision',
      'sizing',
      'simulation packing',
      'construction du preview',
    ]);
  });

  // ─── 3. Une décision exacte par candidat ──────────
  it('attribue une décision à chaque fichier candidat', async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const preview = await sut.execute(input);
    expect(preview.decisions).toHaveLength(3);

    const statuses = preview.decisions.map((d) => d.status);
    expect(statuses).toContain('included');
    expect(statuses).toContain('blocked');
  });

  // ─── 4. Blocage du .env par nom ───────────────────
  it('bloque .env par nom (étape 7)', async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const preview = await sut.execute(input);
    const blockedDecision = preview.decisions.find((d) => d.status === 'blocked');
    expect(blockedDecision).toBeDefined();
  });

  // ─── 5. Compteurs corrects ───────────────────────
  it('calcule les compteurs included/blocked/excluded/oversized/failed', async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const preview = await sut.execute(input);
    const sum =
      preview.includedCount +
      preview.blockedCount +
      preview.excludedCount +
      preview.oversizedCount +
      preview.failedCount;
    expect(sum).toBe(preview.decisions.length);
    expect(preview.includedCount).toBeGreaterThan(0);
    expect(preview.blockedCount).toBeGreaterThan(0);
  });

  // ─── 6. Annulation ───────────────────────────────
  it("lève une erreur si l'opération est annulée", async () => {
    const cancel = fakeCancellation(true);

    const sutCancelled = new PrepareContextPackPreview(
      configurationPort,
      profileRegistry,
      fileDiscovery,
      fileContentReader,
      securityScanner,
      sizingPort,
      packingPort,
      progressReporter,
      cancel,
    );

    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    await expect(sutCancelled.execute(input)).rejects.toThrow('Annulation');
  });

  // ─── 7. Aucune écriture finale ───────────────────
  it("n'appelle jamais un port d'écriture (confirme le mode preview)", async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const preview = await sut.execute(input);
    expect(preview).toBeDefined();
    expect(typeof preview.previewId).toBe('string');
    expect(Array.isArray(preview.decisions)).toBe(true);
    // Aucun ContextPackWriterPort n'est injecté dans le constructeur
  });

  // ─── 8. Fingerprint stable ───────────────────────
  it('produit le même fingerprint pour les mêmes entrées', async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const a = await sut.execute(input);
    const b = await sut.execute(input);
    expect(a.requestFingerprint).toBe(b.requestFingerprint);
  });

  it('produit un fingerprint différent pour des objectifs différents', async () => {
    const a = await sut.execute({
      projectRoot: '/fake/project',
      objective: 'alpha',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    });

    const b = await sut.execute({
      projectRoot: '/fake/project',
      objective: 'beta',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    });

    expect(a.requestFingerprint).not.toBe(b.requestFingerprint);
  });

  // ─── 9. Preview sérialisable ─────────────────────
  it('le preview est sérialisable en JSON', async () => {
    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    const preview = await sut.execute(input);
    const json = JSON.stringify(preview);
    expect(() => JSON.parse(json)).not.toThrow();

    const parsed = JSON.parse(json) as ContextPackPreview;
    expect(parsed.previewId).toBe(preview.previewId);
    expect(parsed.decisions.length).toBe(preview.decisions.length);
  });

  // ─── 10. Erreur profil inconnu ───────────────────
  it('lève une erreur pour un profil inconnu', async () => {
    const noResolveRegistry: ProfileRegistryPort = {
      list: () => [],
      resolve: () => undefined,
    };

    const sutNoProfile = new PrepareContextPackPreview(
      configurationPort,
      noResolveRegistry,
      fileDiscovery,
      fileContentReader,
      securityScanner,
      sizingPort,
      packingPort,
      progressReporter,
      cancellation,
    );

    const input: PreparePreviewInput = {
      projectRoot: '/fake/project',
      objective: 'test',
      profile: 'unknown' as 'ai-general',
      selectedPaths: ['src'],
      tokenLimit: 200_000,
    };

    await expect(sutNoProfile.execute(input)).rejects.toThrow('Profil inconnu');
  });
});
