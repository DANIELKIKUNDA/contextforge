import { describe, expect, it } from 'vitest';
import { createContextPackId } from '../../ids/context-pack-id.js';

describe('ContextPackId with UUID validation', () => {
  it('should accept a valid UUID v4', () => {
    const id = createContextPackId('550e8400-e29b-41d4-a716-446655440000');
    expect(id).toBeDefined();
  });

  it('should accept a valid UUID v7', () => {
    const id = createContextPackId('018f3c6c-9b7c-7d4a-8c3f-1a2b3c4d5e6f');
    expect(id).toBeDefined();
  });

  it('should trim surrounding whitespace', () => {
    const id = createContextPackId('  550e8400-e29b-41d4-a716-446655440000  ');
    expect(id).toBeDefined();
    expect(id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('should reject an empty string', () => {
    const id = createContextPackId('');
    expect(id).toBeUndefined();
  });

  it('should reject UUID v1 (non-4, non-7 version)', () => {
    const id = createContextPackId('550e8400-e29b-11d4-a716-446655440000');
    expect(id).toBeUndefined();
  });

  it('should reject a random non-UUID string', () => {
    const id = createContextPackId('abc-123-def');
    expect(id).toBeUndefined();
  });

  it('should reject a malformed UUID (too short)', () => {
    const id = createContextPackId('550e8400-e29b-41d4-a716');
    expect(id).toBeUndefined();
  });

  it('should reject a malformed UUID (wrong separators)', () => {
    const id = createContextPackId('550e8400_e29b_41d4_a716_446655440000');
    expect(id).toBeUndefined();
  });

  it('should reject whitespace-only strings', () => {
    const id = createContextPackId('     ');
    expect(id).toBeUndefined();
  });
});
