import { describe, expect, it } from 'vitest';
import { detectFileKind } from '../../file-kind-detector.js';

describe('file-kind-detector', () => {
  it('should detect TypeScript as text', () => {
    expect(detectFileKind('.ts')).toBe('text');
  });

  it('should detect JavaScript as text', () => {
    expect(detectFileKind('.js')).toBe('text');
  });

  it('should detect JSON as text', () => {
    expect(detectFileKind('.json')).toBe('text');
  });

  it('should detect Markdown as text', () => {
    expect(detectFileKind('.md')).toBe('text');
  });

  it('should detect YAML as text', () => {
    expect(detectFileKind('.yaml')).toBe('text');
  });

  it('should detect PNG as binary', () => {
    expect(detectFileKind('.png')).toBe('binary');
  });

  it('should detect PDF as binary', () => {
    expect(detectFileKind('.pdf')).toBe('binary');
  });

  it('should detect ZIP as binary', () => {
    expect(detectFileKind('.zip')).toBe('binary');
  });

  it('should return unknown for unrecognized extension', () => {
    expect(detectFileKind('.xyz')).toBe('unknown');
  });

  it('should handle uppercase extensions', () => {
    expect(detectFileKind('.TS')).toBe('text');
  });

  it('should detect binary content by NUL bytes', () => {
    const buf = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    expect(detectFileKind('.dat', buf)).toBe('binary');
  });

  it('should detect text content without NUL bytes', () => {
    const buf = Buffer.from('hello world', 'utf-8');
    expect(detectFileKind('.dat', buf)).toBe('text');
  });

  it('should handle empty buffer', () => {
    const buf = Buffer.alloc(0);
    expect(detectFileKind('.dat', buf)).toBe('unknown');
  });

  it('should handle file without extension', () => {
    expect(detectFileKind('')).toBe('unknown');
  });
});
