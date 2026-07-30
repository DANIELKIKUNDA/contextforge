import type { GenerationPhase } from '@contextforge/contracts';

export interface ProgressEvent {
  readonly phase: GenerationPhase;
  readonly percent: number;
  readonly message: string;
  readonly currentItem?: string;
  readonly processed: number;
  readonly total?: number;
}

/**
 * Publishes progress events without depending on VS Code or CLI.
 */
export interface ProgressReporterPort {
  report(event: ProgressEvent): void;
}
