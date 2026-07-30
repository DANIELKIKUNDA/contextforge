/**
 * Opaque, immutable identifier for a ContextPack.
 * Format: UUID v4 or v7 (recommended per spec 03 §4.1).
 *
 * Note: the recommended format is UUID v4/v7 for global uniqueness,
 * but the contract does not enforce UUID format at this layer.
 * Validation is deferred to IdGeneratorPort (Core Phase 2).
 */
export type ContextPackId = string & { readonly __brand: 'ContextPackId' };

/**
 * UUID v4 pattern (RFC 9562 §5.4).
 */
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * UUID v7 pattern (RFC 9562 §5.7).
 * Timestamp-ordered UUID with version nibble = 7.
 */
const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Creates a ContextPackId from a raw string.
 * Returns undefined if:
 * - empty string
 * - not a valid UUID v4 or v7
 */
export function createContextPackId(raw: string): ContextPackId | undefined {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  if (!UUID_V4_PATTERN.test(trimmed) && !UUID_V7_PATTERN.test(trimmed)) {
    return undefined;
  }

  return trimmed as ContextPackId;
}
