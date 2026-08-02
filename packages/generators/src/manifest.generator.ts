import type {
  BlockedFileDecision,
  ContextPackManifest,
  ContextPackPreview,
  ExcludedFileDecision,
  FailedFileDecision,
  IncludedFileDecision,
  OversizedFileDecision,
  SecuritySeverity,
} from '@contextforge/contracts';

/**
 * Génère le manifest JSON du Context Pack.
 * Déterministe : mêmes entrées → même sortie.
 */
export class ManifestGenerator {
  generate(
    preview: ContextPackPreview,
    packId: string,
    name: string,
    projectName: string,
    tokenLimit: number,
    maxFileSizeBytes: number,
  ): ContextPackManifest {
    const included = preview.decisions.filter(
      (d): d is IncludedFileDecision => d.status === 'included',
    );
    const blocked = preview.decisions.filter(
      (d): d is BlockedFileDecision => d.status === 'blocked',
    );
    const excluded = preview.decisions.filter(
      (d): d is ExcludedFileDecision => d.status === 'excluded',
    );
    const oversized = preview.decisions.filter(
      (d): d is OversizedFileDecision => d.status === 'oversized',
    );
    const failed = preview.decisions.filter((d): d is FailedFileDecision => d.status === 'failed');

    const includedPaths = included.map((d) => d.file.relativePath as string).sort();
    const excludedPaths = excluded.map((d) => d.file.relativePath as string).sort();
    const blockedPaths = blocked.map((d) => (d.file?.relativePath ?? '') as string).sort();
    const oversizedPaths = oversized.map((d) => d.file.relativePath as string).sort();
    const failedPaths = failed.map((d) => d.relativePath).sort();

    const volumes = this.buildVolumes(included, includedPaths);

    const highestSev = this.highestSeverity(
      blocked.flatMap((d) => d.findings.map((f) => f.severity)),
    );

    return {
      schemaVersion: '1.0',
      contextForgeVersion: '0.0.0',
      packId,
      name,
      objective: preview.objective as string,
      profile: preview.profile,
      projectName,
      generatedAt: new Date().toISOString(),
      estimationStrategy: 'character-token-estimator',
      limits: { tokenLimit, maxFileSizeBytes },
      includedFiles: includedPaths,
      excludedFiles: excludedPaths,
      blockedFiles: blockedPaths,
      oversizedFiles: oversizedPaths,
      failedFiles: failedPaths,
      volumes,
      warnings: preview.warnings,
      securitySummary: {
        totalFindings: blocked.flatMap((d) => d.findings).length,
        highestSeverity: highestSev,
        blockedFileCount: blocked.length,
      },
      outputFiles: [
        'README.md',
        ...volumes.map((v) => v.outputFileName),
        'manifest.json',
        'included-files.json',
        'exclusions.json',
        'warnings.json',
      ],
    };
  }

  private buildVolumes(
    included: IncludedFileDecision[],
    _paths: string[],
  ): ContextPackManifest['volumes'] {
    if (included.length === 0) return [];
    return [
      {
        index: 1,
        outputFileName: 'context-01.md',
        fileCount: included.length,
        estimatedTokens: included.reduce((sum, d) => sum + d.estimatedTokens, 0),
        estimatedBytes: included.reduce((sum, d) => sum + d.file.sizeInBytes, 0),
      },
    ];
  }

  private highestSeverity(severities: SecuritySeverity[]): SecuritySeverity | 'none' {
    if (severities.length === 0) return 'none';
    const order: SecuritySeverity[] = ['critical', 'high', 'medium', 'low'];
    for (const sev of order) {
      if (severities.includes(sev)) return sev;
    }
    return 'none';
  }
}
