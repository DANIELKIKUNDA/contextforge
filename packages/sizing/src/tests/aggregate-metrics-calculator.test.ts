import { describe, expect, it } from 'vitest';
import { calculateAggregateMetrics } from '../aggregate-metrics-calculator';

describe('aggregate-metrics-calculator', () => {
  it('should handle empty list', () => {
    const result = calculateAggregateMetrics([]);
    expect(result.totalBytes).toBe(0);
    expect(result.estimatedTokens).toBe(0);
  });

  it('should handle single file', () => {
    const result = calculateAggregateMetrics([
      { bytes: 10, characters: 5, lines: 2, estimatedTokens: 3 },
    ]);
    expect(result.totalBytes).toBe(10);
    expect(result.estimatedTokens).toBe(3);
  });

  it('should handle multiple files', () => {
    const result = calculateAggregateMetrics([
      { bytes: 10, characters: 5, lines: 2, estimatedTokens: 3 },
      { bytes: 20, characters: 10, lines: 4, estimatedTokens: 6 },
    ]);
    expect(result.totalBytes).toBe(30);
    expect(result.estimatedTokens).toBe(9);
  });

  it('should be deterministic', () => {
    const a = calculateAggregateMetrics([
      { bytes: 5, characters: 3, lines: 1, estimatedTokens: 2 },
    ]);
    const b = calculateAggregateMetrics([
      { bytes: 5, characters: 3, lines: 1, estimatedTokens: 2 },
    ]);
    expect(a).toEqual(b);
  });
});
