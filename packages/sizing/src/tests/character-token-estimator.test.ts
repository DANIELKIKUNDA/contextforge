import { describe, expect, it } from 'vitest';
import { estimateTokens } from '../character-token-estimator';

describe('character-token-estimator', () => {
  it('should return 0 for empty string', () => {
    expect(estimateTokens(0)).toBe(0);
  });

  it('should return 1 for one character', () => {
    expect(estimateTokens(1, 4)).toBe(1);
  });

  it('should estimate ASCII text', () => {
    const tokens = estimateTokens(400, 4);
    expect(tokens).toBe(100);
  });

  it('should use ceil rounding', () => {
    expect(estimateTokens(5, 4)).toBe(2);
    expect(estimateTokens(4, 4)).toBe(1);
  });

  it('should throw for ratio = 0', () => {
    expect(() => estimateTokens(100, 0)).toThrow();
  });

  it('should throw for negative ratio', () => {
    expect(() => estimateTokens(100, -1)).toThrow();
  });

  it('should throw for NaN ratio', () => {
    expect(() => estimateTokens(100, Number.NaN)).toThrow();
  });

  it('should be deterministic', () => {
    expect(estimateTokens(100, 4)).toBe(estimateTokens(100, 4));
  });

  it('should accept a custom ratio', () => {
    expect(estimateTokens(10, 2)).toBe(5);
  });

  it('should handle large content', () => {
    const tokens = estimateTokens(1_000_000, 4);
    expect(tokens).toBe(250_000);
    expect(Number.isSafeInteger(tokens)).toBe(true);
  });
});
