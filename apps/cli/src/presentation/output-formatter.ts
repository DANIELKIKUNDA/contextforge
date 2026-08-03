import type { ContextPackPreview, ContextPackResult } from '@contextforge/contracts';
import type {
  ConfigValidationResult,
  InspectProjectSourcesOutput,
  ListAvailableProfilesOutput,
  ProfileDefinition,
} from '@contextforge/core';

/**
 * Format de sortie supporté par la CLI.
 */
export type OutputFormat = 'text' | 'json';

/**
 * Formate les résultats des cas d'usage en mode texte ou JSON.
 */
export class OutputFormatter {
  constructor(private readonly format: OutputFormat) {}

  isJson(): boolean {
    return this.format === 'json';
  }

  log(data: Record<string, unknown>): void {
    process.stdout.write(`${JSON.stringify(data)}\n`);
  }

  diag(message: string): void {
    process.stderr.write(`${message}\n`);
  }

  formatInspect(output: InspectProjectSourcesOutput): Record<string, unknown> {
    return {
      fileCount: output.structure.fileCount,
      directoryCount: output.structure.directoryCount,
      detectedExtensions: output.detectedExtensions,
      probableLanguages: output.probableLanguages,
      estimatedTotalSizeBytes: output.estimatedTotalSizeBytes,
      securityRisks: output.securityRisks,
      suggestedProfiles: output.suggestedProfiles,
      status: 'ok',
    };
  }

  formatPreview(preview: ContextPackPreview): Record<string, unknown> {
    return {
      previewId: preview.previewId,
      requestFingerprint: preview.requestFingerprint,
      profile: preview.profile,
      objective: String(preview.objective),
      includedCount: preview.includedCount,
      excludedCount: preview.excludedCount,
      blockedCount: preview.blockedCount,
      oversizedCount: preview.oversizedCount,
      failedCount: preview.failedCount,
      estimatedTokens: preview.estimatedTokens,
      estimatedVolumes: preview.estimatedVolumes,
      warnings: preview.warnings,
      status: 'ok',
    };
  }

  formatGenerate(result: ContextPackResult): Record<string, unknown> {
    return {
      packId: result.packId,
      status: result.status,
      outputDirectory: result.outputDirectory,
      manifestPath: result.manifestPath,
      volumePaths: result.volumePaths,
      includedCount: result.includedCount,
      blockedCount: result.blockedCount,
      estimatedTokens: result.estimatedTokens,
      generatedAt: result.generatedAt,
      durationMs: result.durationMs,
      warnings: result.warnings,
    };
  }

  formatValidate(result: ConfigValidationResult): Record<string, unknown> {
    return {
      valid: result.errors.length === 0,
      errors: result.errors,
      provenance: result.provenance,
      status: result.errors.length === 0 ? 'ok' : 'invalid',
    };
  }

  formatProfiles(output: ListAvailableProfilesOutput): Record<string, unknown> {
    return {
      profiles: output.profiles.map((p: ProfileDefinition) => ({
        id: p.id,
        name: p.name,
        description: p.description,
      })),
      count: output.total,
      status: 'ok',
    };
  }

  formatOpenLast(packPath: string | undefined): Record<string, unknown> {
    if (!packPath) {
      return { found: false, status: 'not-found' };
    }
    return { found: true, path: packPath, status: 'ok' };
  }

  formatError(error: Error, code: number): Record<string, unknown> {
    return {
      status: 'error',
      code,
      message: error.message,
      name: error.name,
    };
  }
}
