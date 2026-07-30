import type { ContextPackId } from '@contextforge/contracts';
import type { ContextPackStatus } from '@contextforge/contracts';
import type { ProfileId } from '@contextforge/contracts';
import type { Objective } from '@contextforge/contracts';
import type { TokenLimit } from '@contextforge/contracts';
import type { GenerationProgress } from '@contextforge/contracts';
import { createContextPackId } from '@contextforge/contracts';
import { InvalidAggregateError } from '../errors/core-errors';
import { isTerminal, validateTransition } from './context-pack-state-machine';

/**
 * ContextPack aggregate root.
 * Owns the lifecycle of a Context Pack — from draft to generated/failed/cancelled.
 * Never directly touches the file system or network.
 */
export class ContextPack {
  private _status: ContextPackStatus = 'draft';
  private _objective?: Objective;
  private _profile?: ProfileId;
  private _tokenLimit?: TokenLimit;
  private _progress?: GenerationProgress;
  private _error?: Error;

  readonly id: ContextPackId;

  private constructor(id: ContextPackId) {
    this.id = id;
  }

  /** Creates a new ContextPack in draft state. */
  static create(rawId: string): ContextPack {
    const id = createContextPackId(rawId);
    if (!id) {
      throw new InvalidAggregateError(`Failed to create ContextPack: invalid pack ID '${rawId}'.`);
    }
    return new ContextPack(id);
  }

  get status(): ContextPackStatus {
    return this._status;
  }

  get objective(): Objective | undefined {
    return this._objective;
  }

  get profile(): ProfileId | undefined {
    return this._profile;
  }

  get tokenLimit(): TokenLimit | undefined {
    return this._tokenLimit;
  }

  get progress(): GenerationProgress | undefined {
    return this._progress;
  }

  get error(): Error | undefined {
    return this._error;
  }

  /**
   * Sets the objective. Allowed in any non-terminal state.
   */
  setObjective(objective: Objective): void {
    this.guardNotTerminal();
    this._objective = objective;
  }

  /**
   * Sets the profile. Allowed in any non-terminal state.
   */
  setProfile(profile: ProfileId): void {
    this.guardNotTerminal();
    this._profile = profile;
  }

  /**
   * Sets the token limit. Allowed in any non-terminal state.
   */
  setTokenLimit(limit: TokenLimit): void {
    this.guardNotTerminal();
    this._tokenLimit = limit;
  }

  /**
   * Updates generation progress. Allowed in any non-terminal state.
   */
  updateProgress(progress: GenerationProgress): void {
    this.guardNotTerminal();
    this._progress = progress;
  }

  /**
   * Transitions to a new state.
   * Throws InvalidStateTransitionError if the transition is not allowed.
   */
  transition(to: ContextPackStatus): void {
    validateTransition(this._status, to);
    this._status = to;
  }

  /**
   * Registers a controlled failure.
   * Transitions to 'failed' and stores the error.
   */
  fail(error: Error): void {
    this.transition('failed');
    this._error = error;
  }

  /**
   * Cancels the operation. Transitions to 'cancelled'.
   */
  cancel(): void {
    if (this._status === 'draft') {
      this._status = 'cancelled';
      return;
    }
    this.transition('cancelled');
  }

  /**
   * Marks the pack as generated. Terminal state.
   */
  markGenerated(): void {
    this.transition('generated');
  }

  private guardNotTerminal(): void {
    if (isTerminal(this._status)) {
      throw new InvalidAggregateError(
        `Cannot modify a ContextPack in terminal state '${this._status}'.`,
      );
    }
  }
}
