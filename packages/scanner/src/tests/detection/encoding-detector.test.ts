import { describe, expect, it } from 'vitest';
import { detectEncoding } from '../../encoding-detector';

describe('encoding-detector', () => {
  it('should detect valid UTF-8 ASCII', () => {
    const buf = Buffer.from('hello world', 'utf-8');
    const result = detectEncoding(buf);
    expect(result.encoding).toBe('utf-8');
    expect(result.valid).toBe(true);
  });

  it('should detect valid UTF-8 with accented characters', () => {
    const buf = Buffer.from('héllo wörld éàç', 'utf-8');
    const result = detectEncoding(buf);
    expect(result.valid).toBe(true);
  });

  it('should detect UTF-8 BOM', () => {
    // EF BB BF followed by "hello"
    const buf = Buffer.from([0xef, 0xbb, 0xbf, 0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    const result = detectEncoding(buf);
    expect(result.encoding).toBe('utf-8-bom');
    expect(result.valid).toBe(true);
  });

  it('should handle empty buffer as valid UTF-8', () => {
    const buf = Buffer.alloc(0);
    const result = detectEncoding(buf);
    expect(result.encoding).toBe('utf-8');
    expect(result.valid).toBe(true);
  });

  it('should detect invalid UTF-8 bytes', () => {
    // Invalid start byte 0xFF
    const buf = Buffer.from([0x48, 0x65, 0xff, 0x6c, 0x6c, 0x6f]);
    const result = detectEncoding(buf);
    expect(result.valid).toBe(false);
  });

  it('should detect truncated UTF-8 sequence', () => {
    // 2-byte starter (0xC2) followed by ASCII (not continuation)
    const buf = Buffer.from([0x48, 0xc2, 0x48]);
    const result = detectEncoding(buf);
    expect(result.valid).toBe(false);
  });

  it('should detect binary content with NUL bytes', () => {
    const buf = Buffer.from([0x01, 0x02, 0x00, 0x03]);
    const result = detectEncoding(buf);
    expect(result.encoding).toBe('binary');
    expect(result.valid).toBe(false);
  });
});
