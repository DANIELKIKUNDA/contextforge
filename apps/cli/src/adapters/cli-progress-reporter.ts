import type { ProgressEvent, ProgressReporterPort } from '@contextforge/core';
import type { Ora } from 'ora';

/**
 * Adaptateur CLI pour le port ProgressReporterPort.
 * Utilise ora pour afficher une barre de progression en mode TTY.
 * En mode JSON ou non-TTY, les notifications sont redirigées vers stderr.
 */
export class CliProgressReporter implements ProgressReporterPort {
  constructor(private readonly spinner?: Ora) {}

  report(event: ProgressEvent): void {
    if (this.spinner?.isSpinning) {
      this.spinner.text = `[${event.phase}] ${event.message} (${event.processed}/${event.total})`;
    } else {
      process.stderr.write(`[progress] ${event.phase}: ${event.message}\n`);
    }
  }
}
