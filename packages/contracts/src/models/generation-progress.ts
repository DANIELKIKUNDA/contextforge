import type { GenerationPhase } from '../enums/generation-phase';

/**
 * Progress event emitted during ContextPack generation.
 */
export interface GenerationProgress {
  readonly phase: GenerationPhase;
  /** Progress percent from 0 to 100. */
  readonly percent: number;
  readonly message: string;
  readonly currentItem?: string;
  readonly processed: number;
  readonly total?: number;
}
