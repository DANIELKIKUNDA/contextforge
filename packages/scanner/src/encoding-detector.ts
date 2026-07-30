/**
 * Encoding detection for ContextForge V1.
 *
 * V1 priorities:
 * - UTF-8 valid: accepted
 * - UTF-8 with BOM: accepted
 * - Invalid/undecodable: rejected
 * - Binary: rejected
 */
export interface EncodingResult {
  readonly encoding: string;
  readonly valid: boolean;
}

/**
 * Detects encoding and validates content.
 *
 * Returns the detected encoding and whether it's valid UTF-8.
 */
export function detectEncoding(buffer: Buffer): EncodingResult {
  if (buffer.length === 0) {
    return { encoding: 'utf-8', valid: true };
  }

  // Check for UTF-8 BOM (EF BB BF)
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    // Strip BOM and validate the rest as UTF-8
    const contentWithoutBom = buffer.subarray(3);
    const valid = isValidUtf8(contentWithoutBom);
    return { encoding: valid ? 'utf-8-bom' : 'binary', valid };
  }

  // NUL bytes → likely binary
  if (containsNullBytes(buffer)) {
    return { encoding: 'binary', valid: false };
  }

  // Validate UTF-8
  const valid = isValidUtf8(buffer);
  return { encoding: valid ? 'utf-8' : 'binary', valid };
}

/**
 * Validates that a buffer contains valid UTF-8 byte sequences.
 */
function isValidUtf8(buffer: Buffer): boolean {
  let i = 0;
  const len = buffer.length;

  while (i < len) {
    const byte = buffer[i];
    if (byte === undefined) break;

    let bytesToFollow: number;

    if (byte <= 0x7f) {
      // ASCII: 0xxxxxxx
      bytesToFollow = 0;
    } else if (byte >= 0xc0 && byte <= 0xdf) {
      // 2-byte: 110xxxxx 10xxxxxx
      bytesToFollow = 1;
    } else if (byte >= 0xe0 && byte <= 0xef) {
      // 3-byte: 1110xxxx 10xxxxxx 10xxxxxx
      bytesToFollow = 2;
    } else if (byte >= 0xf0 && byte <= 0xf7) {
      // 4-byte: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      bytesToFollow = 3;
    } else {
      // Invalid start byte (10xxxxxx without leading, or 0xFE/0xFF)
      return false;
    }

    if (i + bytesToFollow >= len) {
      // Truncated sequence
      return false;
    }

    for (let j = 1; j <= bytesToFollow; j++) {
      const next = buffer[i + j];
      if (next === undefined || (next & 0xc0) !== 0x80) {
        return false;
      }
    }

    i += bytesToFollow + 1;
  }

  return true;
}

function containsNullBytes(buffer: Buffer): boolean {
  const sampleSize = Math.min(buffer.length, 8192);
  for (let i = 0; i < sampleSize; i++) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}
