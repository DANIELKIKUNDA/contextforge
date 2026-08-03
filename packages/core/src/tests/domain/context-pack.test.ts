import { describe, expect, it } from 'vitest';
import { ContextPack } from '../../domain/context-pack.js';
import { InvalidAggregateError, InvalidStateTransitionError } from '../../errors/core-errors.js';

describe('ContextPack aggregate', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  it('should create a valid ContextPack in draft state', () => {
    const pack = ContextPack.create(validId);
    expect(pack.id).toBe(validId);
    expect(pack.status).toBe('draft');
  });

  it('should reject an invalid ID', () => {
    expect(() => ContextPack.create('')).toThrow(InvalidAggregateError);
  });

  it('should preserve identity', () => {
    const pack = ContextPack.create(validId);
    expect(pack.id).toBe(validId);
  });

  it('should allow setting objective on draft', () => {
    const pack = ContextPack.create(validId);
    pack.setObjective('Obtain a complete preview of the payment module' as unknown as never);
  });

  it('should allow draft → previewed transition', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    expect(pack.status).toBe('previewed');
  });

  it('should allow full happy path', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.transition('confirmed');
    pack.transition('generating');
    pack.markGenerated();
    expect(pack.status).toBe('generated');
  });

  it('should reject generated → draft', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.transition('confirmed');
    pack.transition('generating');
    pack.markGenerated();
    expect(() => pack.transition('draft')).toThrow(InvalidStateTransitionError);
  });

  it('should allow generation to fail', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.transition('confirmed');
    pack.transition('generating');
    pack.fail(new Error('Something went wrong'));
    expect(pack.status).toBe('failed');
    expect(pack.error).toBeDefined();
    expect(pack.error?.message).toBe('Something went wrong');
  });

  it('should not allow mutation after failed', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.transition('confirmed');
    pack.transition('generating');
    pack.fail(new Error('Failure'));
    expect(() => pack.setObjective('New objective' as unknown as never)).toThrow(
      InvalidAggregateError,
    );
  });

  it('should allow cancellation from draft', () => {
    const pack = ContextPack.create(validId);
    pack.cancel();
    expect(pack.status).toBe('cancelled');
  });

  it('should allow cancellation from previewed', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.cancel();
    expect(pack.status).toBe('cancelled');
  });

  it('should reject transition from cancelled', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.cancel();
    expect(() => pack.transition('confirmed')).toThrow(InvalidStateTransitionError);
  });

  it('should not expose internal state via mutation', () => {
    const pack = ContextPack.create(validId);
    const status1 = pack.status;
    expect(status1).toBe('draft');
    // status is returned as value, not reference
    expect(pack.status).toBe('draft');
  });

  it('should keep error undefined on normal flow', () => {
    const pack = ContextPack.create(validId);
    pack.transition('previewed');
    pack.transition('confirmed');
    pack.transition('generating');
    pack.markGenerated();
    expect(pack.error).toBeUndefined();
  });

  it('should reject state transition draft → generating', () => {
    const pack = ContextPack.create(validId);
    expect(() => pack.transition('generating')).toThrow(InvalidStateTransitionError);
  });
});
