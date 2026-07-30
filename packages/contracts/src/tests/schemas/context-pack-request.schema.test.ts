import { describe, expect, it } from 'vitest';
import { ContextPackRequestSchema } from '../../schemas/context-pack-request.schema';

describe('ContextPackRequestSchema', () => {
  const validRequest = {
    projectRoot: '/home/user/project',
    objective: 'Prepare a context pack for the payment module.',
    profile: 'ai-general' as const,
    selectedPaths: ['src/', 'docs/'],
    tokenLimit: 60000,
  };

  it('should accept a valid request', () => {
    const result = ContextPackRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject an empty projectRoot', () => {
    const result = ContextPackRequestSchema.safeParse({ ...validRequest, projectRoot: '' });
    expect(result.success).toBe(false);
  });

  it('should reject an objective shorter than 10 characters', () => {
    const result = ContextPackRequestSchema.safeParse({ ...validRequest, objective: 'Short' });
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from objective', () => {
    const result = ContextPackRequestSchema.safeParse({
      ...validRequest,
      objective: '  Prepare a valid context pack objective  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.objective).toBe('Prepare a valid context pack objective');
    }
  });

  it('should reject an invalid profile', () => {
    const result = ContextPackRequestSchema.safeParse({ ...validRequest, profile: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should reject empty selectedPaths', () => {
    const result = ContextPackRequestSchema.safeParse({ ...validRequest, selectedPaths: [] });
    expect(result.success).toBe(false);
  });

  it('should reject non-positive tokenLimit', () => {
    const result = ContextPackRequestSchema.safeParse({ ...validRequest, tokenLimit: 0 });
    expect(result.success).toBe(false);
  });

  it('should apply default securityMode', () => {
    const result = ContextPackRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.securityMode).toBe('strict');
    }
  });

  it('should accept optional customIncludes and customExcludes', () => {
    const result = ContextPackRequestSchema.safeParse({
      ...validRequest,
      customIncludes: ['*.md'],
      customExcludes: ['tmp/'],
    });
    expect(result.success).toBe(true);
  });

  it('should apply default previewOnly', () => {
    const result = ContextPackRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.previewOnly).toBe(false);
    }
  });
});
