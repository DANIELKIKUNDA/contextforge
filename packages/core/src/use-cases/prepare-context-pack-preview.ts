import type {
  BlockedFileDecision,
  ContextPackPreview,
  FailedFileDecision,
  FileDecision,
  IncludedFileDecision,
  OversizedFileDecision,
  ProfileId,
  ReasonCode,
  SecurityFinding,
  SecuritySeverity,
  SourceFile,
} from '@contextforge/contracts';
import type { CancellationPort } from '../ports/cancellation.port';
import type { ConfigurationPort } from '../ports/configuration.port';
import type { FileContentReaderPort } from '../ports/file-content-reader.port';
import type { FileDiscoveryPort } from '../ports/file-discovery.port';
import type { PackingPort } from '../ports/packing.port';
import type { ProfileRegistryPort } from '../ports/profile-registry.port';
import type { ProgressEvent, ProgressReporterPort } from '../ports/progress-reporter.port';
import type { SecurityScannerPort } from '../ports/security-scanner.port';
import type { SizingPort } from '../ports/sizing.port';
import { FileDecisionService } from '../services/file-decision-service';
import { RequestFingerprintService } from '../services/request-fingerprint-service';

/** Entrée du cas d'usage PrepareContextPackPreview. */
export interface PreparePreviewInput {
  readonly projectRoot: string;
  readonly objective: string;
  readonly profile: ProfileId;
  readonly selectedPaths: string[];
  readonly tokenLimit: number;
  readonly customIncludes?: string[];
  readonly customExcludes?: string[];
}

/** Contexte interne mutable transporté à travers le pipeline. */
interface PipelineContext {
  input: PreparePreviewInput;
  config: {
    outputDirectory: string;
    blockSensitiveFiles: boolean;
    followSymlinks: boolean;
    maxFileSizeBytes: number;
    maxConcurrentReads: number;
    excludeDirectories: string[];
    includeExtensions: string[];
    previewBeforeGenerate: boolean;
  };
  profileId: ProfileId;
  candidates: SourceFile[];
  /** Résout un SourceFile à partir de son chemin relatif (pour les ports). */
  fileByPath: Map<string, SourceFile>;
  readResults: Map<string, string>;
  contentFindings: Map<string, SecurityFinding[]>;
  decisions: FileDecision[];
  estimatedTokens: number;
  estimatedBytes: number;
  estimatedVolumes: number;
  warnings: string[];
}

/**
 * Cas d'usage principal de la Phase 7.
 * Exécute les 13 étapes du pipeline officiel,
 * sans écrire aucun fichier sur le disque.
 *
 * Toutes les dépendances sont injectées via le constructeur.
 */
export class PrepareContextPackPreview {
  private readonly decisionService = new FileDecisionService();
  private readonly fingerprintService = new RequestFingerprintService();

  constructor(
    private readonly configurationPort: ConfigurationPort,
    private readonly profileRegistry: ProfileRegistryPort,
    private readonly fileDiscovery: FileDiscoveryPort,
    private readonly fileContentReader: FileContentReaderPort,
    private readonly securityScanner: SecurityScannerPort,
    private readonly sizingPort: SizingPort,
    private readonly packingPort: PackingPort,
    private readonly progressReporter: ProgressReporterPort,
    private readonly cancellation: CancellationPort,
  ) {}

  /** Point d'entrée unique. */
  async execute(input: PreparePreviewInput): Promise<ContextPackPreview> {
    const ctx = this.makeContext(input);

    // 1. validation
    this.step(ctx, 1, 'validation');

    // 2. configuration
    this.step(ctx, 2, 'configuration');
    this.checkCancelled();
    const { config } = await this.configurationPort.load();
    ctx.config = {
      outputDirectory: config.outputDirectory ?? '.contextforge/output',
      blockSensitiveFiles: config.blockSensitiveFiles ?? true,
      followSymlinks: config.followSymlinks ?? false,
      maxFileSizeBytes: config.maxFileSizeBytes ?? 1_048_576,
      maxConcurrentReads: config.maxConcurrentReads ?? 16,
      excludeDirectories: [...(config.excludeDirectories ?? []), ...(input.customExcludes ?? [])],
      includeExtensions: config.includeExtensions ?? [],
      previewBeforeGenerate: config.previewBeforeGenerate ?? true,
    };

    // 3. profil
    this.step(ctx, 3, 'résolution du profil');
    this.checkCancelled();
    const def = this.profileRegistry.resolve(input.profile);
    if (!def) throw new Error(`Profil inconnu : ${input.profile}`);
    ctx.profileId = def.id;

    // 4. normalisation (faite par le scanner)
    this.step(ctx, 4, 'normalisation');

    // 5. scan + construction de l'index fileByPath
    this.step(ctx, 5, 'scan');
    this.checkCancelled();
    ctx.candidates = await this.fileDiscovery.discover(input.projectRoot, input.selectedPaths);
    for (const f of ctx.candidates) {
      ctx.fileByPath.set(f.relativePath as string, f);
    }

    // 6. exclusions
    this.step(ctx, 6, 'exclusions');
    this.checkCancelled();
    this.applyExclusions(ctx);

    // 7. blocage nom / extension
    this.step(ctx, 7, 'blocage nom/extension');
    this.checkCancelled();
    this.blockByNameOrExtension(ctx);

    // 8. lecture
    this.step(ctx, 8, 'lecture');
    this.checkCancelled();
    await this.readFiles(ctx);

    // 9. scan contenu
    this.step(ctx, 9, 'scan de sécurité');
    this.checkCancelled();
    await this.scanContents(ctx);

    // 10. décision
    this.step(ctx, 10, 'décision');
    this.checkCancelled();
    this.finalizeDecisions(ctx);

    // 11. sizing
    this.step(ctx, 11, 'sizing');
    this.checkCancelled();
    this.computeSizing(ctx);

    // 12. simulation packing
    this.step(ctx, 12, 'simulation packing');
    this.checkCancelled();
    this.simulatePacking(ctx);

    // 13. preview
    this.step(ctx, 13, 'construction du preview');
    this.checkCancelled();
    return this.buildPreview(ctx);
  }

  // ── helpers ───────────────────────────────────────

  private makeContext(input: PreparePreviewInput): PipelineContext {
    return {
      input,
      config: {
        outputDirectory: '.contextforge/output',
        blockSensitiveFiles: true,
        followSymlinks: false,
        maxFileSizeBytes: 1_048_576,
        maxConcurrentReads: 16,
        excludeDirectories: [],
        includeExtensions: [],
        previewBeforeGenerate: true,
      },
      profileId: input.profile,
      candidates: [],
      fileByPath: new Map(),
      readResults: new Map(),
      contentFindings: new Map(),
      decisions: [],
      estimatedTokens: 0,
      estimatedBytes: 0,
      estimatedVolumes: 0,
      warnings: [],
    };
  }

  private step(_ctx: PipelineContext, step: number, label: string): void {
    this.progressReporter.report({
      phase: 'preview' as ProgressEvent['phase'],
      percent: Math.round((step / 13) * 100),
      message: label,
      processed: step,
      total: 13,
    });
  }

  private checkCancelled(): void {
    this.cancellation.throwIfCancelled();
  }

  // ── étapes ────────────────────────────────────────

  private applyExclusions(ctx: PipelineContext): void {
    const exclude = new Set(ctx.config.excludeDirectories.map((d) => d.toLowerCase()));
    ctx.candidates = ctx.candidates.filter((f) => {
      const parts = (f.relativePath as string).toLowerCase().split('/');
      return !parts.some((p) => exclude.has(p));
    });
  }

  private blockByNameOrExtension(ctx: PipelineContext): void {
    const blockedNames = new Set(['.env', '.env.local', '.env.production', 'id_rsa', 'id_ed25519']);
    const blockedExts = new Set(['.pem', '.key', '.p12', '.pfx']);

    for (const file of ctx.candidates) {
      const fileName = (file.relativePath as string).split('/').pop() ?? '';
      const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';

      if (blockedNames.has(fileName) || blockedExts.has(ext)) {
        ctx.decisions.push({
          status: 'blocked',
          file,
          reasonCode: 'sensitive_file' as ReasonCode,
          reason: `Fichier sensible : ${fileName}`,
          findings: [],
          highestSeverity: 'critical' as SecuritySeverity,
        } as BlockedFileDecision);
      } else if (file.sizeInBytes > ctx.config.maxFileSizeBytes) {
        ctx.decisions.push({
          status: 'oversized',
          file,
          estimatedTokens: Math.ceil(file.sizeInBytes / 4),
          configuredLimit: ctx.input.tokenLimit,
          recommendation: `Fichier de ${file.sizeInBytes} octets dépasse la limite`,
        } as OversizedFileDecision);
      }
    }
  }

  private async readFiles(ctx: PipelineContext): Promise<void> {
    for (const file of ctx.candidates) {
      this.checkCancelled();
      try {
        const res = await this.fileContentReader.read(file, {
          maxBytes: ctx.config.maxFileSizeBytes,
        });
        if (res.content !== undefined) {
          ctx.readResults.set(file.relativePath as string, res.content);
        }
      } catch {
        // ignoré → failed dans finalizeDecisions
      }
    }
  }

  private async scanContents(ctx: PipelineContext): Promise<void> {
    for (const [path, content] of ctx.readResults) {
      this.checkCancelled();
      const srcFile = ctx.fileByPath.get(path);
      if (!srcFile) continue;
      try {
        const findings = await this.securityScanner.scan(srcFile, content);
        if (findings.length > 0) ctx.contentFindings.set(path, findings);
      } catch {
        // ignoré
      }
    }
  }

  private finalizeDecisions(ctx: PipelineContext): void {
    const processed = new Set<string>();
    for (const d of ctx.decisions) {
      if (d.status !== 'failed') {
        processed.add(d.file.relativePath as string);
      } else {
        processed.add(d.relativePath);
      }
    }

    for (const file of ctx.candidates) {
      const rp = file.relativePath as string;
      if (processed.has(rp)) continue;

      const content = ctx.readResults.get(rp);
      if (content === undefined) {
        ctx.decisions.push({
          status: 'failed',
          relativePath: rp,
          errorCode: 'READ_ERROR',
          message: 'Impossible de lire le fichier',
          recoverable: true,
        } as FailedFileDecision);
        processed.add(rp);
        continue;
      }

      const findings = ctx.contentFindings.get(rp);
      if (findings && findings.length > 0 && ctx.config.blockSensitiveFiles) {
        ctx.decisions.push({
          status: 'blocked',
          file,
          reasonCode: 'secret_detected' as ReasonCode,
          reason: 'Secret détecté dans le contenu',
          findings,
          highestSeverity: 'critical' as SecuritySeverity,
        } as BlockedFileDecision);
        processed.add(rp);
        continue;
      }

      ctx.decisions.push({
        status: 'included',
        file,
        estimatedTokens: Math.ceil(content.length / 4),
        category: 'code',
        priority: 5,
        warnings: [],
      } as IncludedFileDecision);
      processed.add(rp);
    }
  }

  private computeSizing(ctx: PipelineContext): void {
    let tokens = 0;
    let bytes = 0;
    for (const d of ctx.decisions) {
      if (d.status === 'included') {
        const content = ctx.readResults.get(d.file.relativePath as string) ?? '';
        tokens += Math.ceil(content.length / 4);
        bytes += d.file.sizeInBytes;
      }
    }
    ctx.estimatedTokens = tokens;
    ctx.estimatedBytes = bytes;
  }

  private simulatePacking(ctx: PipelineContext): void {
    const count = ctx.decisions.filter((d) => d.status === 'included').length;
    ctx.estimatedVolumes =
      count === 0 ? 0 : Math.max(1, Math.ceil(ctx.estimatedTokens / ctx.input.tokenLimit));
  }

  private buildPreview(ctx: PipelineContext): ContextPackPreview {
    const fingerprint = this.fingerprintService.compute(
      ctx.input.objective,
      ctx.profileId,
      ctx.input.selectedPaths,
    );

    let included = 0;
    let excluded = 0;
    let blocked = 0;
    let oversized = 0;
    let failed = 0;
    for (const d of ctx.decisions) {
      switch (d.status) {
        case 'included':
          included++;
          break;
        case 'excluded':
          excluded++;
          break;
        case 'blocked':
          blocked++;
          break;
        case 'oversized':
          oversized++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }

    return {
      previewId: `preview-${Date.now()}`,
      requestFingerprint: fingerprint,
      project: {
        name:
          ctx.input.projectRoot.split('/').pop() ??
          ctx.input.projectRoot.split('\\').pop() ??
          'unknown',
        rootPath: ctx.input.projectRoot,
        workspaceKind: 'single-root',
        platform: 'unknown',
        detectedLanguages: [],
        selectedPaths: ctx.input.selectedPaths,
      },
      objective: ctx.input.objective as unknown as ContextPackPreview['objective'],
      profile: ctx.profileId,
      decisions: ctx.decisions,
      includedCount: included,
      excludedCount: excluded,
      blockedCount: blocked,
      oversizedCount: oversized,
      failedCount: failed,
      estimatedTokens: ctx.estimatedTokens,
      estimatedBytes: ctx.estimatedBytes,
      estimatedVolumes: ctx.estimatedVolumes,
      warnings: ctx.warnings,
      requiresConfirmation: ctx.config.previewBeforeGenerate,
      createdAt: new Date().toISOString(),
    };
  }
}
