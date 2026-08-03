import type { ProgressEvent, ProgressReporterPort } from '@contextforge/core';
import type { Progress, ProgressLocation } from 'vscode';

/**
 * Adaptateur VS Code pour le port ProgressReporterPort.
 * Délègue les événements de progression à l'API vscode.window.withProgress.
 *
 * Cet adaptateur ne crée pas lui-même la progression : il reçoit un objet
 * Progress déjà créé par l'API VS Code et l'utilise pour signaler l'avancement.
 */
export class VscodeProgressAdapter implements ProgressReporterPort {
  /**
   * @param progress - L'objet Progress fourni par VS Code via vscode.window.withProgress.
   */
  constructor(private readonly progress: Progress<{ message?: string; increment?: number }>) {}

  /** {@inheritdoc} */
  report(event: ProgressEvent): void {
    const percentIncrement =
      event.total !== undefined && event.total > 0
        ? Math.round((event.processed / event.total) * 100)
        : event.percent;

    this.progress.report({
      message: `[${event.phase}] ${event.message}${event.currentItem ? ` : ${event.currentItem}` : ''}`,
      increment: percentIncrement,
    });
  }
}
