import type { SourceFile } from '@contextforge/contracts';

export interface FileSizeMetrics {
  readonly bytes: number;
  readonly characters: number;
  readonly lines: number;
  readonly estimatedTokens: number;
}

export interface AggregateSizeMetrics {
  readonly totalBytes: number;
  readonly totalCharacters: number;
  readonly totalLines: number;
  readonly estimatedTokens: number;
}

/**
 * Calculates size metrics and token estimates.
 * Default V1 strategy: 1 token ≈ 4 characters (configurable).
 */
export interface SizingPort {
  estimateFile(content: string): FileSizeMetrics;
  estimateAggregate(files: Array<{ content: string }>): AggregateSizeMetrics;
}
