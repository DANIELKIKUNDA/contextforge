import type { ContextForgeError } from '@contextforge/contracts';

/**
 * Abstract base class for all Core errors.
 * Implements the ContextForgeError contract from packages/contracts.
 *
 * SECURITY: metadata must never contain secrets, tokens, keys, passwords,
 * file contents, or absolute paths.
 */
export abstract class CoreError extends Error implements ContextForgeError {
  abstract readonly code: string;
  abstract readonly recoverable: boolean;
  readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    options?: { readonly cause?: unknown; readonly metadata?: Record<string, unknown> },
  ) {
    super(message);
    this.name = 'CoreError';
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
    if (options?.metadata !== undefined) {
      this.metadata = options.metadata;
    }
  }

  /**
   * Controlled JSON serialization.
   * Only includes public properties defined by the ContextForgeError contract.
   * Never includes: stack, cause, file contents, secrets, tokens,
   * API keys, passwords, connection strings, or absolute paths.
   */
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      code: this.code,
      message: this.message,
      recoverable: this.recoverable,
    };

    if (this.metadata !== undefined) {
      result.metadata = this.metadata;
    }

    return result;
  }
}
