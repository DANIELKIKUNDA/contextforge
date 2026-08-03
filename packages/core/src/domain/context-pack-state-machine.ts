import type { ContextPackStatus } from '@contextforge/contracts';
import { VALID_TRANSITIONS } from '@contextforge/contracts';
import { InvalidStateTransitionError } from '../errors/core-errors.js';

/**
 * Pure function: determines if a transition is valid.
 * Consumes the VALID_TRANSITIONS table from contracts.
 * Terminal states (generated, failed, cancelled) cannot transition further.
 */
export function validateTransition(from: ContextPackStatus, to: ContextPackStatus): void {
  const allowed = VALID_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new InvalidStateTransitionError(from, to);
  }
}

/**
 * Checks if the given status is terminal (no further transitions allowed).
 */
export function isTerminal(status: ContextPackStatus): boolean {
  const allowed = VALID_TRANSITIONS[status];
  return allowed !== undefined && allowed.length === 0;
}

export const TERMINAL_STATUSES = new Set<ContextPackStatus>(['generated', 'failed', 'cancelled']);
