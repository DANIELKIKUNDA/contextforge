import { describe, expect, it } from 'vitest';
import { createObjective } from '../../value-objects/objective';

describe('Objective value object', () => {
  it('should create a valid objective', () => {
    const result = createObjective('Prepare a context pack for the payment module review');
    expect(result.objective).toBeDefined();
    expect(result.error).toBeUndefined();
    expect(result.objective).toBe('Prepare a context pack for the payment module review');
  });

  it('should trim whitespace', () => {
    const result = createObjective('  Prepare a context pack for review  ');
    expect(result.objective).toBe('Prepare a context pack for review');
  });

  it('should reject empty strings', () => {
    const result = createObjective('');
    expect(result.objective).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should reject whitespace-only strings', () => {
    const result = createObjective('          ');
    expect(result.objective).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should reject strings shorter than 10 characters', () => {
    const result = createObjective('Short');
    expect(result.objective).toBeUndefined();
    expect(result.error).toContain('at least 10');
  });

  it('should accept exactly 10 characters', () => {
    const result = createObjective('abcdefghij');
    expect(result.objective).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should reject strings longer than 500 characters', () => {
    const long = 'a'.repeat(501);
    const result = createObjective(long);
    expect(result.objective).toBeUndefined();
    expect(result.error).toContain('500');
  });

  it('should accept exactly 500 characters', () => {
    const max = 'a'.repeat(500);
    const result = createObjective(max);
    expect(result.objective).toBeDefined();
    expect(result.error).toBeUndefined();
  });
});
