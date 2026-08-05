import { describe, expect, it } from 'vitest';
import {
  UserCancellationError,
  VscodeCancellationAdapter,
} from '../../adapters/vscode-cancellation.adapter';

/**
 * Tests unitaires pour VscodeCancellationAdapter.
 * Mocke l'API CancellationToken de VS Code.
 */

function createToken(cancelled: boolean) {
  return {
    isCancellationRequested: cancelled,
    onCancellationRequested: () => ({ dispose: () => {} }),
  };
}

describe('VscodeCancellationAdapter', () => {
  it('isCancelled renvoie false quand le token est actif', () => {
    const adapter = new VscodeCancellationAdapter(createToken(false) as never);
    expect(adapter.isCancelled).toBe(false);
  });

  it('isCancelled renvoie true quand le token est annulé', () => {
    const adapter = new VscodeCancellationAdapter(createToken(true) as never);
    expect(adapter.isCancelled).toBe(true);
  });

  it("throwIfCancelled ne lance pas si le token n'est pas annulé", () => {
    const adapter = new VscodeCancellationAdapter(createToken(false) as never);
    expect(() => adapter.throwIfCancelled()).not.toThrow();
  });

  it('throwIfCancelled lance UserCancellationError si le token est annulé', () => {
    const adapter = new VscodeCancellationAdapter(createToken(true) as never);
    expect(() => adapter.throwIfCancelled()).toThrow(UserCancellationError);
  });

  it('UserCancellationError a le nom correct', () => {
    const err = new UserCancellationError();
    expect(err.name).toBe('UserCancellationError');
    expect(err.message).toContain('annulée');
  });
});
