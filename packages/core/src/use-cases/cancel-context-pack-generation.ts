import { CancellationError } from '../errors/core-errors.js';
import type { CancellationPort } from '../ports/cancellation.port.js';
import type { ProgressReporterPort } from '../ports/progress-reporter.port.js';

/**
 * Cas d'usage : annulation coopérative d'une génération.
 * Lève le signal d'annulation via CancellationPort
 * et émet un événement de progression pour informer les adaptateurs.
 */
export class CancelContextPackGeneration {
  constructor(
    private readonly cancellation: CancellationPort,
    private readonly progressReporter: ProgressReporterPort,
  ) {}

  /**
   * Déclenche l'annulation de la génération en cours.
   * Lance une CancellationError qui sera interceptée par l'orchestrateur.
   *
   * @param packId - Identifiant du pack en cours d'annulation
   */
  execute(packId: string): never {
    this.progressReporter.report({
      phase: 'generating',
      percent: 0,
      message: `Annulation demandée pour le pack ${packId}`,
      processed: 0,
      total: 0,
    });

    throw new CancellationError(`Génération annulée pour le pack ${packId}`, {
      metadata: { packId, phase: 'cancel' },
    });
  }
}
