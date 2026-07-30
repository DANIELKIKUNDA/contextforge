/**
 * Signals cancellation cooperatively without depending on VS Code or CLI.
 */
export interface CancellationPort {
  readonly isCancelled: boolean;
  throwIfCancelled(): void;
}
