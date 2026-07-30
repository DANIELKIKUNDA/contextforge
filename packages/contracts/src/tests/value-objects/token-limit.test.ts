import { describe, expect, it } from 'vitest';
import {
  TOKEN_LIMIT_LARGE,
  TOKEN_LIMIT_MEDIUM,
  TOKEN_LIMIT_SMALL,
  createTokenLimit,
  resolveTokenLimitPreset,
} from '../../value-objects/token-limit';

describe('TokenLimit value object', () => {
  it('should create a valid token limit', () => {
    const result = createTokenLimit(50000);
    expect(result.tokenLimit).toBe(50000);
    expect(result.error).toBeUndefined();
  });

  it('should reject zero', () => {
    const result = createTokenLimit(0);
    expect(result.tokenLimit).toBeUndefined();
    expect(result.error).toContain('positive');
  });

  it('should reject negative numbers', () => {
    const result = createTokenLimit(-1);
    expect(result.tokenLimit).toBeUndefined();
  });

  it('should reject non-integer numbers', () => {
    const result = createTokenLimit(1.5);
    expect(result.tokenLimit).toBeUndefined();
  });

  it('should reject Infinity', () => {
    const result = createTokenLimit(Number.POSITIVE_INFINITY);
    expect(result.tokenLimit).toBeUndefined();
  });

  it('should reject NaN', () => {
    const result = createTokenLimit(Number.NaN);
    expect(result.tokenLimit).toBeUndefined();
  });

  it('should provide small preset at 20000', () => {
    expect(TOKEN_LIMIT_SMALL).toBe(20000);
  });

  it('should provide medium preset at 60000', () => {
    expect(TOKEN_LIMIT_MEDIUM).toBe(60000);
  });

  it('should provide large preset at 120000', () => {
    expect(TOKEN_LIMIT_LARGE).toBe(120000);
  });

  it('should resolve small preset', () => {
    expect(resolveTokenLimitPreset('small')).toBe(20000);
  });

  it('should resolve medium preset', () => {
    expect(resolveTokenLimitPreset('medium')).toBe(60000);
  });

  it('should resolve large preset', () => {
    expect(resolveTokenLimitPreset('large')).toBe(120000);
  });
});
