import { describe, expect, it } from 'vitest';
import { normalizePath, toAbsolutePath } from '../../path-normalizer.js';

describe('path-normalizer', () => {
  const root = '/home/user/project';

  describe('normalizePath', () => {
    it('should accept a valid POSIX path', () => {
      const result = normalizePath('src/index.ts', root);
      expect(result).toBe('src/index.ts');
    });

    it('should accept a valid Windows path with backslashes', () => {
      const result = normalizePath('src\\components\\App.tsx', 'C:\\Users\\project');
      expect(result).toBe('src/components/App.tsx');
    });

    it('should remove double slashes', () => {
      const result = normalizePath('src//index.ts', root);
      expect(result).toBe('src/index.ts');
    });

    it('should remove single-dot segments', () => {
      const result = normalizePath('src/./index.ts', root);
      expect(result).toBe('src/index.ts');
    });

    it('should reject traversal with ..', () => {
      expect(() => normalizePath('../outside/file.ts', root)).toThrow();
    });

    it('should reject traversal from root level', () => {
      expect(() => normalizePath('../../../etc/passwd', root)).toThrow();
    });

    it('should reject absolute POSIX path not under root', () => {
      expect(() => normalizePath('/etc/passwd', root)).toThrow();
    });

    it('should reject absolute Windows path not under root', () => {
      expect(() => normalizePath('C:\\Windows\\System32', 'C:\\Users\\project')).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => normalizePath('', root)).toThrow();
    });

    it('should reject UNC path', () => {
      expect(() => normalizePath('\\\\server\\share', root)).toThrow();
    });
  });

  describe('toAbsolutePath', () => {
    it('should join root and relative path', () => {
      const relPath = normalizePath('src/index.ts', root);
      const abs = toAbsolutePath(relPath, root);
      expect(abs).toBe('/home/user/project/src/index.ts');
    });
  });
});
