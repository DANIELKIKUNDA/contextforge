import { describe, expect, it } from 'vitest';
import { calculateFileMetrics } from '../file-metrics-calculator.js';

describe('file-metrics-calculator', () => {
  it('should handle empty content', () => {
    const m = calculateFileMetrics('');
    expect(m.bytes).toBe(0);
    expect(m.characters).toBe(0);
    expect(m.lines).toBe(0);
    expect(m.estimatedTokens).toBe(0);
  });

  it('should handle single line', () => {
    const m = calculateFileMetrics('hello');
    expect(m.characters).toBe(5);
    expect(m.lines).toBe(1);
    expect(m.estimatedTokens).toBe(2);
  });

  it('should handle multiple lines', () => {
    const m = calculateFileMetrics('line1\nline2\nline3');
    expect(m.lines).toBe(3);
  });

  it('should handle CRLF', () => {
    const m = calculateFileMetrics('line1\r\nline2');
    expect(m.lines).toBe(2);
  });

  it('should be deterministic', () => {
    const a = calculateFileMetrics('hello world');
    const b = calculateFileMetrics('hello world');
    expect(a).toEqual(b);
  });

  it('should not mutate input', () => {
    const frozen = Object.freeze('test');
    calculateFileMetrics(frozen);
  });
});
