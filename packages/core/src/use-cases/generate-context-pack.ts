import type {
  ContextPackManifest,
  ContextPackPreview,
  ContextPackResult,
  GenerateContextPackInput,
  IncludedFileDecision,
  PackVolume,
} from '@contextforge/contracts';
import { GenerationError } from '../errors/core-errors';
import type { CancellationPort } from '../ports/cancellation.port';
import type { ClockPort } from '../ports/clock.port';
import type { ContextPackWriterPort } from '../ports/context-pack-writer.port';
import type { FileContentReaderPort } from '../ports/file-content-reader.port';
import type { IdGeneratorPort } from '../ports/id-generator.port';
import type { LastPackRegistryPort } from '../ports/last-pack-registry.port';
import type { ProgressReporterPort } from '../ports/progress-reporter.port';

/**
 * Contexte mutable interne utilisé pendant la génération.
 */
interface GenerationContext {
  input: GenerateContextPackInput;
  preview: ContextPackPreview;
  startedAtMs: number;
  packId: string;
  volumes: PackVolume[];
  manifest: ContextPackManifest;
  outputDirectory: string;
  temporaryDir: string;
  warnings: string[];
}

/**
 * Cas d'usage principal de génération d'un Context Pack (Phase 8).
 * Orchestre l'écriture atomique de tous les fichiers de sortie,
 * la validation, le commit et l'enregistrement du dernier pack.
 *
 * Toutes les dépendances sont injectées via le constructeur.
 */
export class GenerateContextPack {
  constructor(
    private readonly contextPackWriter: ContextPackWriterPort,
    private readonly fileContentReader: FileContentReaderPort,
    private readonly progressReporter: ProgressReporterPort,
    private readonly cancellation: CancellationPort,
    private readonly clock: ClockPort,
    private readonly idGenerator: IdGeneratorPort,
    private readonly lastPackRegistry: LastPackRegistryPort,
  ) {}

  /**
   * Point d'entrée unique.
   * Exécute le pipeline complet de génération en 9 étapes.
   */
  async execute(
    input: GenerateContextPackInput,
    preview: ContextPackPreview,
  ): Promise<ContextPackResult> {
    const ctx = this.makeContext(input, preview);

    // Étape 1 : validation des entrées
    this.report(ctx, 1, 'validation des entrées');
    this.checkCancelled();
    this.validateInput(ctx);

    // Étape 2 : construction du manifest
    this.report(ctx, 2, 'construction du manifest');
    this.checkCancelled();
    this.buildManifest(ctx);

    // Étape 3 : construction des volumes
    this.report(ctx, 3, 'construction des volumes');
    this.checkCancelled();
    this.buildVolumes(ctx);

    // Étape 4 : écriture temporaire
    this.report(ctx, 4, 'écriture temporaire');
    this.checkCancelled();
    await this.writeTemporary(ctx);

    // Étape 5 : validation des sorties
    this.report(ctx, 5, 'validation des sorties');
    this.checkCancelled();
    await this.validateOutputs(ctx);

    // Étape 6 : commit atomique
    this.report(ctx, 6, 'commit atomique');
    this.checkCancelled();
    await this.commit(ctx);

    // Étape 7 : enregistrement du dernier pack
    this.report(ctx, 7, 'enregistrement du dernier pack');
    this.lastPackRegistry.set(ctx.input.projectRoot, ctx.outputDirectory);

    // Étape 8 : construction du résultat
    this.report(ctx, 8, 'construction du résultat');
    return this.buildResult(ctx);
  }

  // ── helpers ───────────────────────────────────────

  private makeContext(
    input: GenerateContextPackInput,
    preview: ContextPackPreview,
  ): GenerationContext {
    return {
      input,
      preview,
      startedAtMs: this.clock.now().getTime(),
      packId: this.idGenerator.generatePackId(),
      volumes: [],
      manifest: this.createEmptyManifest(input, preview),
      outputDirectory: '',
      temporaryDir: '',
      warnings: [],
    };
  }

  private createEmptyManifest(
    input: GenerateContextPackInput,
    _preview: ContextPackPreview,
  ): ContextPackManifest {
    const projectName =
      input.projectRoot.split('/').pop() ?? input.projectRoot.split('\\').pop() ?? 'unknown';

    return {
      schemaVersion: '1.0.0',
      contextForgeVersion: '1.0.0',
      packId: '',
      name: `ContextPack-${projectName}`,
      objective: input.objective,
      profile: input.profile,
      projectName,
      generatedAt: new Date().toISOString(),
      estimationStrategy: 'character-token-estimator',
      limits: {
        tokenLimit: input.tokenLimit,
        maxFileSizeBytes: 1_048_576,
      },
      includedFiles: [],
      excludedFiles: [],
      blockedFiles: [],
      oversizedFiles: [],
      failedFiles: [],
      volumes: [],
      warnings: [],
      securitySummary: {
        totalFindings: 0,
        highestSeverity: 'none',
        blockedFileCount: 0,
      },
      outputFiles: [],
    };
  }

  private report(_ctx: GenerationContext, step: number, message: string): void {
    this.progressReporter.report({
      phase: 'generating',
      percent: Math.round((step / 8) * 100),
      message,
      processed: step,
      total: 8,
    });
  }

  private checkCancelled(): void {
    this.cancellation.throwIfCancelled();
  }

  // ── étapes ────────────────────────────────────────

  private validateInput(ctx: GenerationContext): void {
    if (!ctx.input.previewId) {
      throw new GenerationError('previewId requis pour la génération', {
        metadata: { packId: ctx.packId, phase: 'validation' },
      });
    }
    if (!ctx.input.requestFingerprint) {
      throw new GenerationError('requestFingerprint requis pour la génération', {
        metadata: { packId: ctx.packId, phase: 'validation' },
      });
    }
    if (!ctx.input.projectRoot) {
      throw new GenerationError('projectRoot requis pour la génération', {
        metadata: { packId: ctx.packId, phase: 'validation' },
      });
    }
  }

  private buildManifest(ctx: GenerationContext): void {
    const preview = ctx.preview;
    const includedDecisions = preview.decisions.filter(
      (d): d is IncludedFileDecision => d.status === 'included',
    );

    // Extraction sûre des chemins relatifs quel que soit le type de décision
    const extractPath = (d: (typeof preview.decisions)[number]): string => {
      if ('relativePath' in d && typeof d.relativePath === 'string') {
        return d.relativePath;
      }
      if ('file' in d && d.file && typeof d.file.relativePath === 'string') {
        return d.file.relativePath;
      }
      return '';
    };

    ctx.manifest = {
      ...ctx.manifest,
      packId: ctx.packId,
      includedFiles: includedDecisions.map((d) => d.file.relativePath as string),
      excludedFiles: preview.decisions
        .filter((d) => d.status === 'excluded')
        .map(extractPath)
        .filter(Boolean),
      blockedFiles: preview.decisions
        .filter((d) => d.status === 'blocked')
        .map((d) => d.file.relativePath as string),
      oversizedFiles: preview.decisions
        .filter((d) => d.status === 'oversized')
        .map((d) => d.file.relativePath as string),
      failedFiles: preview.decisions
        .filter((d) => d.status === 'failed')
        .map(extractPath)
        .filter(Boolean),
      securitySummary: {
        totalFindings: preview.decisions.reduce(
          (sum, d) => sum + (d.status === 'blocked' ? d.findings.length : 0),
          0,
        ),
        highestSeverity: preview.decisions.reduce<
          ContextPackManifest['securitySummary']['highestSeverity']
        >((max, d) => {
          if (d.status !== 'blocked') return max;
          const severityOrder: Array<ContextPackManifest['securitySummary']['highestSeverity']> = [
            'critical',
            'high',
            'medium',
            'low',
            'none',
          ];
          const currentIdx = severityOrder.indexOf(d.highestSeverity);
          const maxIdx = severityOrder.indexOf(max);
          return currentIdx < maxIdx ? d.highestSeverity : max;
        }, 'none'),
        blockedFileCount: preview.decisions.filter((d) => d.status === 'blocked').length,
      },
      warnings: [...preview.warnings],
    };
  }

  private buildVolumes(ctx: GenerationContext): void {
    const includedDecisions = ctx.preview.decisions.filter(
      (d): d is IncludedFileDecision => d.status === 'included',
    );

    if (includedDecisions.length === 0) {
      ctx.volumes = [];
      return;
    }

    const tokenLimit = ctx.input.tokenLimit;
    const volumesCount = Math.max(1, Math.ceil(ctx.preview.estimatedTokens / tokenLimit));
    const filesPerVolume = Math.ceil(includedDecisions.length / volumesCount);

    ctx.volumes = [];
    for (let i = 0; i < volumesCount; i++) {
      const slice = includedDecisions.slice(i * filesPerVolume, (i + 1) * filesPerVolume);
      const volumeTokens = slice.reduce((sum, d) => sum + d.estimatedTokens, 0);
      const volumeBytes = slice.reduce((sum, d) => sum + d.file.sizeInBytes, 0);

      ctx.volumes.push({
        index: i,
        outputFileName: `volume-${String(i + 1).padStart(3, '0')}.md`,
        fileIds: [],
        estimatedTokens: volumeTokens,
        estimatedBytes: volumeBytes,
        heading: `Volume ${i + 1}`,
        orderKey: String(i).padStart(4, '0'),
      });
    }

    // Mise à jour du manifest avec les métadonnées de volumes
    const manifestVolumes = ctx.volumes.map((v) => {
      const fileCount = includedDecisions.slice(
        v.index * filesPerVolume,
        Math.min((v.index + 1) * filesPerVolume, includedDecisions.length),
      ).length;
      return {
        index: v.index,
        outputFileName: v.outputFileName,
        fileCount,
        estimatedTokens: v.estimatedTokens,
        estimatedBytes: v.estimatedBytes,
      };
    });
    ctx.manifest = { ...ctx.manifest, volumes: manifestVolumes };
  }

  private async writeTemporary(ctx: GenerationContext): Promise<void> {
    const outputDir = ctx.input.outputDirectory ?? '.contextforge/output';
    const projectName =
      ctx.input.projectRoot.split('/').pop() ??
      ctx.input.projectRoot.split('\\').pop() ??
      'unknown';

    ctx.outputDirectory = `${outputDir}/${projectName}-${ctx.packId}`;

    try {
      ctx.temporaryDir = await this.contextPackWriter.writeTemporary(
        ctx.packId,
        outputDir,
        ctx.volumes,
      );
    } catch (err) {
      throw new GenerationError(
        `Échec de l'écriture temporaire : ${err instanceof Error ? err.message : String(err)}`,
        { metadata: { packId: ctx.packId, phase: 'write_temporary' } },
      );
    }
  }

  private async validateOutputs(ctx: GenerationContext): Promise<void> {
    const issues = await this.contextPackWriter.validateTemporary(ctx.temporaryDir);
    if (issues.length > 0) {
      ctx.warnings.push(...issues.map((i) => `Validation temporaire : ${i}`));
    }

    if (!ctx.temporaryDir) {
      throw new GenerationError('Répertoire temporaire non défini après écriture', {
        metadata: { packId: ctx.packId, phase: 'validate' },
      });
    }
  }

  private async commit(ctx: GenerationContext): Promise<void> {
    try {
      await this.contextPackWriter.commit(ctx.temporaryDir, ctx.outputDirectory);
    } catch (err) {
      // Rollback en cas d'échec du commit
      await this.contextPackWriter.rollback(ctx.temporaryDir).catch(() => {
        // Ignorer les erreurs de rollback, on fait le maximum
      });
      throw new GenerationError(
        `Échec du commit atomique : ${err instanceof Error ? err.message : String(err)}`,
        { metadata: { packId: ctx.packId, phase: 'commit' } },
      );
    }
  }

  private buildResult(ctx: GenerationContext): ContextPackResult {
    const durationMs = Date.now() - ctx.startedAtMs;

    return {
      packId: ctx.packId,
      status: 'generated',
      outputDirectory: ctx.outputDirectory,
      readmePath: `${ctx.outputDirectory}/README.md`,
      manifestPath: `${ctx.outputDirectory}/manifest.json`,
      volumePaths: ctx.volumes.map((v) => `${ctx.outputDirectory}/${v.outputFileName}`),
      includedFilesPath: `${ctx.outputDirectory}/_included-files.md`,
      exclusionsPath: `${ctx.outputDirectory}/_exclusions.md`,
      warningsPath: `${ctx.outputDirectory}/_warnings.md`,
      includedCount: ctx.manifest.includedFiles.length,
      blockedCount: ctx.manifest.blockedFiles.length,
      estimatedTokens: ctx.preview.estimatedTokens,
      generatedAt: new Date().toISOString(),
      durationMs,
      warnings: ctx.warnings,
    };
  }
}
