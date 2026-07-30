import { describe, expect, it } from 'vitest';
import { DEFAULT_SECRET_PATTERNS } from '../../default-secret-patterns';

function findRule(ruleId: string) {
  return DEFAULT_SECRET_PATTERNS.find((r) => r.ruleId === ruleId);
}

describe('secret-patterns', () => {
  it('should detect private key block', () => {
    const rule = findRule('SECRET_PRIVATE_KEY_PEM');
    if (!rule) throw new Error('Rule not found');
    const r = rule.detect('', '', '-----BEGIN PRIVATE KEY-----\nfake\n-----END PRIVATE KEY-----');
    expect(r.matched).toBe(true);
    expect(r.maskedEvidence).toBe('[REDACTED]');
  });

  it('should ignore content without private key', () => {
    const rule = findRule('SECRET_PRIVATE_KEY_PEM');
    expect(rule?.detect('', '', 'normal text').matched).toBe(false);
  });

  it('should detect API key assignment', () => {
    const rule = findRule('SECRET_API_KEY_GENERIC');
    expect(rule?.detect('', '', 'api_key = "sk-abcdef1234567890"').matched).toBe(true);
  });

  it('should detect password in quotes', () => {
    const rule = findRule('SECRET_PASSWORD_ASSIGNMENT');
    expect(rule?.detect('', '', 'password: "secret123"').matched).toBe(true);
  });

  it('should detect postgres connection string', () => {
    const rule = findRule('SECRET_CONNECTION_STRING_PG');
    expect(rule?.detect('', '', 'postgres://user:pass@localhost/db').matched).toBe(true);
  });

  it('should detect mongodb connection string', () => {
    const rule = findRule('SECRET_CONNECTION_STRING_MONGO');
    expect(rule?.detect('', '', 'mongodb://admin:hunter2@localhost').matched).toBe(true);
  });

  it('should detect credential JSON object', () => {
    const rule = findRule('SECRET_CREDENTIAL_OBJECT');
    expect(rule?.detect('', '', '{"username": "admin", "password": "test123"}').matched).toBe(true);
  });

  it('should detect SUSPICIOUS SECRET pattern', () => {
    const rule = findRule('SECRET_SUSPICIOUS_PATTERN');
    expect(rule?.detect('', '', 'SECRET = abcdefghijk123').matched).toBe(true);
  });

  it('should mask evidence for all content rules', () => {
    for (const rule of DEFAULT_SECRET_PATTERNS) {
      const r = rule.detect(
        '',
        '',
        'password: "test"\npostgres://u:p@h\n-----BEGIN PRIVATE KEY-----',
      );
      if (r.matched) {
        expect(r.maskedEvidence).toBe('[REDACTED]');
      }
    }
  });

  it('should not match content without keyword for suspicious pattern', () => {
    const rule = findRule('SECRET_SUSPICIOUS_PATTERN');
    expect(rule?.detect('', '', 'normal assignment = value').matched).toBe(false);
  });
});
