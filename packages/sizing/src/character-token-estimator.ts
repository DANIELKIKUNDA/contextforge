/** V1 default ratio: 1 token ≈ 4 characters (doc 04 §8.1, SizingPort). */
export const DEFAULT_TOKEN_RATIO = 4;

/**
 * Estimates token count from character count using a fixed ratio.
 *
 * Formula: estimatedTokens = Math.ceil(characterCount / ratio)
 *
 * The estimate is deterministic, never negative, and never NaN.
 * It does NOT call any AI, API, or remote tokenizer.
 *
 * @param characterCount - must be a non-negative integer
 * @param ratio - must be a positive integer (default 4)
 */
export function estimateTokens(characterCount: number, ratio = DEFAULT_TOKEN_RATIO): number {
  if (!Number.isFinite(ratio) || ratio <= 0 || !Number.isInteger(ratio)) {
    throw new Error('Ratio must be a positive finite integer.');
  }
  if (!Number.isFinite(characterCount) || characterCount < 0) {
    throw new Error('characterCount must be a non-negative finite number.');
  }
  if (characterCount === 0) return 0;
  return Math.ceil(characterCount / ratio);
}
