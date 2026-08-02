import type {
  BlockedFileDecision,
  ExcludedFileDecision,
  FailedFileDecision,
  FileDecision,
  IncludedFileDecision,
  OversizedFileDecision,
  SourceFile,
} from '@contextforge/contracts';

/**
 * Service centralisant l'attribution des décisions pour chaque fichier candidat.
 * Garantit qu'aucun fichier n'a zéro décision ou plus d'une décision.
 */
export class FileDecisionService {
  /**
   * Crée une décision "inclus" pour un fichier.
   */
  createIncluded(
    file: SourceFile,
    estimatedTokens: number,
    category: string,
    priority: number,
  ): IncludedFileDecision {
    return {
      status: 'included',
      file,
      estimatedTokens,
      category,
      priority,
      warnings: [],
    };
  }

  /**
   * Crée une décision "exclus" pour un fichier.
   */
  createExcluded(
    file: SourceFile,
    reasonCode: ExcludedFileDecision['reasonCode'],
    reason: string,
  ): ExcludedFileDecision {
    return {
      status: 'excluded',
      file,
      reasonCode,
      reason,
    };
  }

  /**
   * Crée une décision "bloqué" pour un fichier sensible.
   */
  createBlocked(
    file: SourceFile,
    reasonCode: BlockedFileDecision['reasonCode'],
    reason: string,
    findings: BlockedFileDecision['findings'],
    highestSeverity: BlockedFileDecision['highestSeverity'],
  ): BlockedFileDecision {
    return {
      status: 'blocked',
      file,
      reasonCode,
      reason,
      findings,
      highestSeverity,
    };
  }

  /**
   * Crée une décision "surcapacité" pour un fichier trop volumineux.
   */
  createOversized(
    file: SourceFile,
    estimatedTokens: number,
    configuredLimit: number,
  ): OversizedFileDecision {
    return {
      status: 'oversized',
      file,
      estimatedTokens,
      configuredLimit,
      recommendation: `Fichier trop volumineux : ${file.sizeInBytes} octets (limite : ${configuredLimit} tokens)`,
    };
  }

  /**
   * Crée une décision "échec" pour un fichier illisible.
   */
  createFailed(
    relativePath: string,
    errorCode: string,
    message: string,
    recoverable: boolean,
  ): FailedFileDecision {
    return {
      status: 'failed',
      relativePath,
      errorCode,
      message,
      recoverable,
    };
  }

  /**
   * Vérifie que tous les candidats ont exactement une décision.
   * Retourne la liste des chemins sans décision.
   */
  validateCoverage(candidates: SourceFile[], decisions: FileDecision[]): string[] {
    const decidedPaths = new Set(
      decisions
        .filter(
          (
            d,
          ): d is
            | ExcludedFileDecision
            | BlockedFileDecision
            | IncludedFileDecision
            | OversizedFileDecision => d.status !== 'failed',
        )
        .map((d) => d.file.relativePath as string),
    );
    // Ajoute les chemins des décisions "failed"
    for (const d of decisions) {
      if (d.status === 'failed') {
        decidedPaths.add(d.relativePath);
      }
    }

    return candidates.map((f) => f.relativePath as string).filter((p) => !decidedPaths.has(p));
  }
}
