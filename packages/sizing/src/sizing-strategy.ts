import type { AggregateSizeMetrics, FileSizeMetrics, SizingPort } from '@contextforge/core';
import { calculateAggregateMetrics } from './aggregate-metrics-calculator';
import { DEFAULT_TOKEN_RATIO } from './character-token-estimator';
import { calculateFileMetrics } from './file-metrics-calculator';

/**
 * Implements SizingPort using the character-based token estimator.
 * Uses ratio = 4 (1 token ≈ 4 characters) by default.
 */
export class SizingStrategy implements SizingPort {
  private readonly ratio: number;

  constructor(ratio = DEFAULT_TOKEN_RATIO) {
    if (!Number.isFinite(ratio) || ratio <= 0 || !Number.isInteger(ratio)) {
      throw new Error('Ratio must be a positive finite integer.');
    }
    this.ratio = ratio;
  }

  estimateFile(content: string): FileSizeMetrics {
    return calculateFileMetrics(content, this.ratio);
  }

  estimateAggregate(files: Array<{ content: string }>): AggregateSizeMetrics {
    const metrics = files.map((f) => calculateFileMetrics(f.content, this.ratio));
    return calculateAggregateMetrics(metrics);
  }
}
