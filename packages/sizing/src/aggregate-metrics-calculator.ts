import type { AggregateSizeMetrics } from '@contextforge/core';

/**
 * Calculates aggregate metrics from multiple FileSizeMetrics.
 * Deterministic, never modifies inputs.
 */
export function calculateAggregateMetrics(
  metrics: readonly { bytes: number; characters: number; lines: number; estimatedTokens: number }[],
): AggregateSizeMetrics {
  let totalBytes = 0;
  let totalCharacters = 0;
  let totalLines = 0;
  let estimatedTokens = 0;

  for (const m of metrics) {
    if (!Number.isFinite(m.bytes) || m.bytes < 0) {
      throw new Error('Invalid bytes in metrics.');
    }
    totalBytes += m.bytes;
    totalCharacters += m.characters;
    totalLines += m.lines;
    estimatedTokens += m.estimatedTokens;
  }

  return { totalBytes, totalCharacters, totalLines, estimatedTokens };
}
