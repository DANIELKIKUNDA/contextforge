import { describe, expect, it } from 'vitest';
import { createRelativePath } from '../../value-objects/relative-path';

describe('RelativePath value object', () => {
  it('should create a valid relative path', () => {
    const result = createRelativePath('src/index.ts');
    expect(result.relativePath).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should normalize backslashes to forward slashes', () => {
    const result = createRelativePath('src\\components\\App.tsx');
    expect(result.relativePath).toBe('src/components/App.tsx');
  });

  it('should reject empty strings', () => {
    const result = createRelativePath('');
    expect(result.relativePath).toBeUndefined();
    expect(result.error).toBeDefined();
  });

  it('should reject absolute paths with drive letter (Windows)', () => {
    const result = createRelativePath('C:\\Users\\project\\file.ts');
    expect(result.relativePath).toBeUndefined();
    expect(result.error).toContain('relative');
  });

  it('should reject absolute paths starting with / (POSIX)', () => {
    const result = createRelativePath('/home/user/project/file.ts');
    expect(result.relativePath).toBeUndefined();
    expect(result.error).toContain('relative');
  });

  it('should reject traversal segments (..)', () => {
    const result = createRelativePath('../outside/file.ts');
    expect(result.relativePath).toBeUndefined();
    expect(result.error).toContain('traversal');
  });

  it('should reject deep traversal', () => {
    const result = createRelativePath('src/../../../etc/passwd');
    expect(result.relativePath).toBeUndefined();
    expect(result.error).toContain('traversal');
  });

  it('should accept dotted segments that are not traversal', () => {
    const result = createRelativePath('src/.hidden/file.ts');
    expect(result.relativePath).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should accept complex nested relative paths', () => {
    const result = createRelativePath('packages/contracts/src/value-objects/objective.ts');
    expect(result.relativePath).toBe('packages/contracts/src/value-objects/objective.ts');
  });
});
