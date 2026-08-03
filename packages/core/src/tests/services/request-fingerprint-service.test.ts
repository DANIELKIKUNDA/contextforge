import { describe, expect, it } from 'vitest';
import { RequestFingerprintService } from '../../services/request-fingerprint-service.js';

describe('RequestFingerprintService', () => {
  const service = new RequestFingerprintService();

  it('produit un fingerprint stable pour les mêmes entrées', () => {
    const a = service.compute('objectif test', 'ai-general', ['src', 'lib']);
    const b = service.compute('objectif test', 'ai-general', ['src', 'lib']);
    expect(a).toBe(b);
  });

  it('produit un fingerprint différent pour des objectifs différents', () => {
    const a = service.compute('alpha', 'ai-general', ['src']);
    const b = service.compute('beta', 'ai-general', ['src']);
    expect(a).not.toBe(b);
  });

  it('produit un fingerprint différent pour des profils différents', () => {
    const a = service.compute('test', 'ai-general', ['src']);
    const b = service.compute('test', 'code-review', ['src']);
    expect(a).not.toBe(b);
  });

  it("est stable quel que soit l'ordre des chemins", () => {
    const a = service.compute('test', 'ai-general', ['a', 'b', 'c']);
    const b = service.compute('test', 'ai-general', ['c', 'a', 'b']);
    expect(a).toBe(b);
  });

  it('produit un fingerprint différent pour des chemins différents', () => {
    const a = service.compute('test', 'ai-general', ['src']);
    const b = service.compute('test', 'ai-general', ['lib']);
    expect(a).not.toBe(b);
  });

  it('retourne une chaîne hexadécimale de 64 caractères (SHA-256)', () => {
    const fp = service.compute('test', 'ai-general', ['src']);
    expect(fp).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(fp)).toBe(true);
  });
});
