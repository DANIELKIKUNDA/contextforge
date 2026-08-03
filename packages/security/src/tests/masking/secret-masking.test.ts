import type { SourceFile } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { SecurityScanner } from '../../security-scanner.js';

function makeSourceFile(opts: { relativePath?: string; extension?: string } = {}): SourceFile {
  return {
    id: 'file:test.env' as unknown as SourceFile['id'],
    relativePath: (opts.relativePath ?? 'test.txt') as unknown as SourceFile['relativePath'],
    absolutePath: '/tmp/test.txt',
    extension: opts.extension ?? '.txt',
    sizeInBytes: 0,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: new Date().toISOString(),
  } as SourceFile;
}

describe('secret-masking', () => {
  const scanner = new SecurityScanner();

  it('should not contain raw secret in maskedEvidence', async () => {
    const findings = await scanner.scan(makeSourceFile(), 'api_key = "sk-abcdef1234567890"');
    for (const f of findings) {
      expect(f.maskedEvidence).toBe('[REDACTED]');
    }
  });

  it('should not contain raw content in message', async () => {
    const findings = await scanner.scan(makeSourceFile(), 'password: "my-secret-password-123"');
    for (const f of findings) {
      expect(f.message).not.toContain('my-secret-password-123');
    }
  });

  it('JSON.stringify should not expose raw secrets', async () => {
    const findings = await scanner.scan(makeSourceFile(), 'postgres://admin:hunter2@localhost/db');
    const json = JSON.stringify(findings);
    expect(json).not.toContain('hunter2');
    expect(json).toContain('[REDACTED]');
  });

  it('JSON.stringify should not expose raw password', async () => {
    const findings = await scanner.scan(makeSourceFile(), 'password: "super-secret-2024"');
    const json = JSON.stringify(findings);
    expect(json).not.toContain('super-secret-2024');
  });

  it('should not include raw secret in metadata or message', async () => {
    const findings = await scanner.scan(makeSourceFile(), 'SECRET = abcdefghijklmnop');
    for (const f of findings) {
      expect(f.message).not.toContain('abcdefghijklmnop');
      expect(JSON.stringify(f)).not.toContain('abcdefghijklmnop');
    }
  });

  it('should mask all connection string credentials', async () => {
    const findings = await scanner.scan(
      makeSourceFile(),
      'mysql://root:password123@localhost/db\nmongodb://admin:secret456@srv\n',
    );
    expect(findings.filter((f) => f.kind === 'connection-string')).toHaveLength(2);
    for (const f of findings) {
      expect(f.maskedEvidence).toBe('[REDACTED]');
    }
  });

  it('should mask credential object passwords', async () => {
    const findings = await scanner.scan(
      makeSourceFile(),
      '{"username": "admin", "password": "p@ssw0rd!"}',
    );
    const json = JSON.stringify(findings);
    expect(json).not.toContain('p@ssw0rd!');
  });

  it('should not include absolute path in findings', async () => {
    const findings = await scanner.scan(makeSourceFile({ relativePath: '.env' }));
    for (const f of findings) {
      expect(f.relativePath).toBe('.env');
      expect(f.relativePath).not.toContain('/tmp');
      expect(f.relativePath).not.toMatch(/^[a-zA-Z]:/);
    }
  });

  it('should handle multiple secrets without cross-contamination', async () => {
    const findings = await scanner.scan(
      makeSourceFile(),
      'password: "first"\npassword: "second"\napi_key: "third"',
    );
    const json = JSON.stringify(findings);
    expect(json).not.toContain('first');
    expect(json).not.toContain('second');
    expect(json).not.toContain('third');
  });

  it('should fully redact short secret values', async () => {
    const findings = await scanner.scan(makeSourceFile(), 'password: "a"');
    for (const f of findings) {
      expect(f.maskedEvidence).toBe('[REDACTED]');
      expect(JSON.stringify(f)).not.toContain('"a"');
      expect(JSON.stringify(f)).toContain('[REDACTED]');
    }
  });

  it('should not crash on very long strings (robustness)', async () => {
    const long = `${'a'.repeat(50000)}\npassword: "safe"\n`;
    const findings = await scanner.scan(makeSourceFile(), long);
    const json = JSON.stringify(findings);
    expect(json).not.toContain('safe');
    expect(json).toContain('[REDACTED]');
  });
});
