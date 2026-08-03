import { describe, expect, it } from 'vitest';
import { SizingStrategy } from '../sizing-strategy.js';

describe('sizing-strategy', () => {
  it('should estimate a single file', () => {
    const strategy = new SizingStrategy(4);
    const metrics = strategy.estimateFile('hello world');
    expect(metrics.bytes).toBeGreaterThan(0);
    expect(metrics.characters).toBe(11);
    expect(metrics.lines).toBe(1);
    expect(metrics.estimatedTokens).toBe(3);
  });

  it('should estimate aggregate from multiple files', () => {
    const strategy = new SizingStrategy(4);
    const aggregate = strategy.estimateAggregate([{ content: 'hello' }, { content: 'world' }]);
    expect(aggregate.totalCharacters).toBe(10);
    expect(aggregate.estimatedTokens).toBe(4);
  });

  it('should throw on invalid ratio', () => {
    expect(() => new SizingStrategy(0)).toThrow();
  });

  it('should be deterministic', () => {
    const a = new SizingStrategy(4);
    const b = new SizingStrategy(4);
    expect(a.estimateFile('test')).toEqual(b.estimateFile('test'));
  });
});
