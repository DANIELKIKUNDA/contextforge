/**
 * TokenLimit value object.
 * Positive integer. Provides presets: small (20k), medium (60k), large (120k).
 */
export type TokenLimit = number & { readonly __brand: 'TokenLimit' };

export const TOKEN_LIMIT_SMALL = 20_000 as TokenLimit;
export const TOKEN_LIMIT_MEDIUM = 60_000 as TokenLimit;
export const TOKEN_LIMIT_LARGE = 120_000 as TokenLimit;

export interface TokenLimitCreationResult {
  readonly tokenLimit: TokenLimit | undefined;
  readonly error: string | undefined;
}

/**
 * Creates a TokenLimit from a raw number.
 * Must be a positive integer.
 */
export function createTokenLimit(raw: number): TokenLimitCreationResult {
  if (!Number.isFinite(raw) || !Number.isInteger(raw) || raw <= 0) {
    return { tokenLimit: undefined, error: `Token limit must be a positive integer, got: ${raw}.` };
  }
  return { tokenLimit: raw as TokenLimit, error: undefined };
}

export type TokenLimitPreset = 'small' | 'medium' | 'large';

/**
 * Resolves a preset name to its numeric value.
 */
export function resolveTokenLimitPreset(preset: TokenLimitPreset): TokenLimit {
  switch (preset) {
    case 'small':
      return TOKEN_LIMIT_SMALL;
    case 'medium':
      return TOKEN_LIMIT_MEDIUM;
    case 'large':
      return TOKEN_LIMIT_LARGE;
  }
}
