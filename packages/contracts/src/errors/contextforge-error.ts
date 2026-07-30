/**
 * Serializable error contract for ContextForge.
 * Specialized errors will be defined in Core (Phase 2).
 *
 * SECURITY: metadata must never contain:
 * - file contents
 * - secrets / tokens / API keys / passwords
 * - private key material
 * - connection strings with credentials
 * - environment variable values
 * - absolute paths exposing the user's machine
 */
export interface ContextForgeError {
  readonly code: string;
  readonly message: string;
  readonly cause?: unknown;
  readonly recoverable: boolean;
  /**
   * SECURITY: must never contain secrets, tokens, keys, passwords,
   * file contents, or absolute paths. Used for structured diagnostics only.
   */
  readonly metadata?: Record<string, unknown>;
}
