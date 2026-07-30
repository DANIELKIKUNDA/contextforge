/**
 * Objective value object.
 * Constraints:
 * - auto-trimmed
 * - min 10 characters
 * - max 500 characters
 * - non-empty after trim
 */
export type Objective = string & { readonly __brand: 'Objective' };

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export interface ObjectiveCreationResult {
  readonly objective: Objective | undefined;
  readonly error: string | undefined;
}

/**
 * Creates an Objective from a raw string.
 * Applies trim, enforces length constraints.
 */
export function createObjective(raw: string): ObjectiveCreationResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { objective: undefined, error: 'Objective must not be empty.' };
  }
  if (trimmed.length < MIN_LENGTH) {
    return {
      objective: undefined,
      error: `Objective must be at least ${MIN_LENGTH} characters (got ${trimmed.length}).`,
    };
  }
  if (trimmed.length > MAX_LENGTH) {
    return {
      objective: undefined,
      error: `Objective must not exceed ${MAX_LENGTH} characters (got ${trimmed.length}).`,
    };
  }
  return { objective: trimmed as Objective, error: undefined };
}
