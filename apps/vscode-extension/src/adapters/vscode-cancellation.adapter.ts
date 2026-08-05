import type { CancellationPort } from '@contextforge/core';
import type { CancellationToken } from 'vscode';

/**
 * Erreur lancée lorsque l'utilisateur annule l'opération.
 */
export class UserCancellationError extends Error {
  constructor() {
    super('Opération annulée par l’utilisateur');
    this.name = 'UserCancellationError';
  }
}

/**
 * Adaptateur VS Code pour le port CancellationPort.
 * Traduit un CancellationToken VS Code en contrat CancellationPort
 * pour le Core, permettant une annulation coopérative.
 */
export class VscodeCancellationAdapter implements CancellationPort {
  constructor(private readonly token: CancellationToken) {}

  /** Retourne true si l'opération a été annulée. */
  get isCancelled(): boolean {
    return this.token.isCancellationRequested;
  }

  /** Lance une erreur si l'opération est annulée. */
  throwIfCancelled(): void {
    if (this.token.isCancellationRequested) {
      throw new UserCancellationError();
    }
  }
}
