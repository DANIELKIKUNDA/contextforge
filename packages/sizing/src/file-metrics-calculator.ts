import type { FileSizeMetrics } from '@contextforge/core';
import { estimateTokens } from './character-token-estimator';

/**
 * Calculates FileSizeMetrics from a content string.
 *
 * Metrics include: bytes (UTF-8), character count (code points), line count, estimated tokens.
 * Deterministic, never modifies input, never accesses the file system.
 */
export function calculateFileMetrics(content: string, ratio?: number): FileSizeMetrics {
  const bytes = byteLength(content);
  const characters = [...content].length; // code point count (handles Unicode, emoji)
  const lines = countLines(content);
  const estimatedTokens = estimateTokens(characters, ratio);

  return { bytes, characters, lines, estimatedTokens };
}

/** Counts byte length of a string using UTF-8 encoding (no Node API). */
function byteLength(str: string): number {
  return encodeURIComponent(str).replace(/%[0-9A-F]{2}/g, '1').length;
}

function countLines(content: string): number {
  if (content.length === 0) return 0;
  const newlineCount = (content.match(/\n/g) ?? []).length;
  if (content.endsWith('\n')) return newlineCount;
  return newlineCount + 1;
}
