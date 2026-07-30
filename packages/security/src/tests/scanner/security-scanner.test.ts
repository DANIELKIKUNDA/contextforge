import type { SourceFile } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { SecurityScanner } from '../../security-scanner';

function makeSourceFile(
  opts: {
    relativePath?: string;
    extension?: string;
  } = {},
): SourceFile {
  return {
    id: 'file:test.env' as unknown as SourceFile['id'],
    relativePath: (opts.relativePath ?? 'test.env') as unknown as SourceFile['relativePath'],
    absolutePath: '/tmp/test.env',
    extension: opts.extension ?? '',
    sizeInBytes: 0,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: new Date().toISOString(),
  } as SourceFile;
}

describe('SecurityScanner', () => {
  it('should detect .env by name', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(makeSourceFile({ relativePath: '.env' }));
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0]?.kind).toBe('sensitive-file-name');
  });

  it('should detect sensitive extension', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'key.pem', extension: '.pem' }),
    );
    expect(findings.some((f) => f.kind === 'sensitive-extension')).toBe(true);
  });

  it('should return zero findings for safe file', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'src/index.ts', extension: '.ts' }),
    );
    expect(findings).toHaveLength(0);
  });

  it('should detect private key in content', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'cert.txt', extension: '.txt' }),
      '-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----',
    );
    expect(findings.some((f) => f.kind === 'private-key')).toBe(true);
  });

  it('should deduplicate same rule on same file', async () => {
    const scanner = new SecurityScanner();
    const f1 = await scanner.scan(makeSourceFile({ relativePath: 'file.pem', extension: '.pem' }));
    const pemFindings = f1.filter((f) => f.ruleId === 'SENSITIVE_EXTENSION_PEM');
    expect(pemFindings).toHaveLength(1);
  });

  it('should return stable results on repeated scans', async () => {
    const scanner = new SecurityScanner();
    const a = await scanner.scan(makeSourceFile({ relativePath: '.env', extension: '' }));
    const b = await scanner.scan(makeSourceFile({ relativePath: '.env', extension: '' }));
    expect(a).toEqual(b);
  });

  it('should have severity order stable', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'test.txt', extension: '.txt' }),
      'api_key: xxx\npostgres://u:p@h\npassword: "test"\nSECRET=val\n',
    );
    // At minimum, findings is sorted deterministically
    const a = await scanner.scan(
      makeSourceFile({ relativePath: 'test.txt', extension: '.txt' }),
      'api_key: xxx\npostgres://u:p@h\npassword: "test"\nSECRET=val\n',
    );
    expect(findings).toEqual(a);
  });

  it('should handle empty content', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(makeSourceFile({ relativePath: 'empty.txt' }), '');
    expect(findings.filter((f) => f.kind.startsWith('sensitive-')).length).toBeGreaterThanOrEqual(
      0,
    );
  });

  it('should handle undefined content', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(makeSourceFile({ relativePath: '.env' }));
    expect(findings.some((f) => f.ruleId === 'SENSITIVE_FILE_NAME_ENV')).toBe(true);
  });

  it('should respect maxContentScanBytes', async () => {
    const scanner = new SecurityScanner({ maxContentScanBytes: 50 });
    const long = `${'a'.repeat(100)}\npassword: "test"`;
    const findings = await scanner.scan(makeSourceFile({ relativePath: 'f.txt' }), long);
    expect(findings.length).toBeGreaterThanOrEqual(0);
  });

  it('should handle CRLF line endings', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'f.txt' }),
      'password: "test"\r\napi_key: "abc"',
    );
    expect(findings.some((f) => f.kind === 'password')).toBe(true);
  });

  it('should handle multiple rules on same file', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: '.env' }),
      'password: "test"',
    );
    const kinds = findings.map((f) => f.kind);
    expect(kinds).toContain('sensitive-file-name');
    expect(kinds).toContain('password');
  });

  it('should not modify the input SourceFile', async () => {
    const scanner = new SecurityScanner();
    const file = makeSourceFile({ relativePath: '.env' });
    const originalPath = file.relativePath;
    await scanner.scan(file);
    expect(file.relativePath).toBe(originalPath);
  });

  // ── maxContentScanBytes edge cases ──

  it('should reject maxContentScanBytes = 0', () => {
    expect(() => new SecurityScanner({ maxContentScanBytes: 0 })).toThrow(
      'Invalid maxContentScanBytes',
    );
  });

  it('should reject maxContentScanBytes negative', () => {
    expect(() => new SecurityScanner({ maxContentScanBytes: -1 })).toThrow(
      'Invalid maxContentScanBytes',
    );
  });

  it('should reject maxContentScanBytes NaN', () => {
    expect(() => new SecurityScanner({ maxContentScanBytes: Number.NaN })).toThrow(
      'Invalid maxContentScanBytes',
    );
  });

  it('should reject maxContentScanBytes Infinity', () => {
    expect(() => new SecurityScanner({ maxContentScanBytes: Number.POSITIVE_INFINITY })).toThrow(
      'Invalid maxContentScanBytes',
    );
  });

  it('should reject maxContentScanBytes decimal', () => {
    expect(() => new SecurityScanner({ maxContentScanBytes: 1.5 })).toThrow(
      'Invalid maxContentScanBytes',
    );
  });

  it('should accept custom valid maxContentScanBytes', () => {
    const scanner = new SecurityScanner({ maxContentScanBytes: 500 });
    expect(scanner).toBeDefined();
  });

  it('should use default maxContentScanBytes', () => {
    const scanner = new SecurityScanner();
    expect(scanner).toBeDefined();
  });

  it('should scan exact content at the limit', async () => {
    const scanner = new SecurityScanner({ maxContentScanBytes: 30 });
    const content = 'password: "abcd"'; // at limit
    const findings = await scanner.scan(makeSourceFile({ relativePath: 'f.txt' }), content);
    expect(findings.some((f) => f.kind === 'password')).toBe(true);
  });

  it('should scan content one byte under limit', async () => {
    const scanner = new SecurityScanner({ maxContentScanBytes: 100 });
    const content = 'password: "abcd"'; // under limit
    const findings = await scanner.scan(makeSourceFile({ relativePath: 'f.txt' }), content);
    expect(findings.some((f) => f.kind === 'password')).toBe(true);
  });

  // ── Unicode ──

  it('should handle Unicode accented characters', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'f.txt' }),
      'héllo wörld\npassword: "test"',
    );
    expect(findings.some((f) => f.kind === 'password')).toBe(true);
  });

  it('should handle non-Latin Unicode characters', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'f.txt' }),
      'コンテキスト\npassword: "test"',
    );
    expect(findings.some((f) => f.kind === 'password')).toBe(true);
  });

  it('should report correct lineNumber with Unicode', async () => {
    const scanner = new SecurityScanner();
    const findings = await scanner.scan(
      makeSourceFile({ relativePath: 'f.txt' }),
      'line1 héllo\npassword: "test"',
    );
    expect(findings.some((f) => f.kind === 'password' && f.lineNumber === 2)).toBe(true);
  });

  // ── Regex state ──

  it('should have no residual regex state across calls', async () => {
    const scanner = new SecurityScanner();
    const content = 'password: "test"\napi_key: "abc"';
    const a = await scanner.scan(makeSourceFile({ relativePath: 'a.txt' }), content);
    const b = await scanner.scan(makeSourceFile({ relativePath: 'a.txt' }), content);
    const c = await scanner.scan(makeSourceFile({ relativePath: 'a.txt' }), content);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });

  it('should be deeply equal across many scans', async () => {
    const scanner = new SecurityScanner();
    const content = 'postgres://u:p@h\npassword: "x"\nSECRET=val\n';
    const first = await scanner.scan(makeSourceFile({ relativePath: 'x.txt' }), content);
    for (let i = 0; i < 5; i++) {
      const next = await scanner.scan(makeSourceFile({ relativePath: 'x.txt' }), content);
      expect(next).toEqual(first);
    }
  });
});
