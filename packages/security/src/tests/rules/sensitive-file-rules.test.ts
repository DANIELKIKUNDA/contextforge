import { describe, expect, it } from 'vitest';
import { DEFAULT_SENSITIVE_FILE_RULES } from '../../default-sensitive-file-rules';

function findRule(ruleId: string) {
  return DEFAULT_SENSITIVE_FILE_RULES.find((r) => r.ruleId === ruleId);
}

describe('sensitive-file-rules', () => {
  it('should detect .env', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_ENV');
    expect(rule?.detect('.env', '').matched).toBe(true);
  });

  it('should not detect env.txt', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_ENV');
    expect(rule?.detect('env.txt', '').matched).toBe(false);
  });

  it('should detect .env.local', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_ENV_VARIANT');
    expect(rule?.detect('.env.local', '').matched).toBe(true);
  });

  it('should detect .env.production', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_ENV_VARIANT');
    expect(rule?.detect('.env.production', '').matched).toBe(true);
  });

  it('should detect credentials.json', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_CREDENTIALS_JSON');
    expect(rule?.detect('credentials.json', '').matched).toBe(true);
  });

  it('should detect id_rsa', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_PRIVATE_KEY');
    expect(rule?.detect('id_rsa', '').matched).toBe(true);
  });

  it('should detect id_ed25519', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_PRIVATE_KEY_ED');
    expect(rule?.detect('id_ed25519', '').matched).toBe(true);
  });

  it('should detect service-account-key.json', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_SERVICE_ACCOUNT');
    expect(rule?.detect('service-account-key.json', '').matched).toBe(true);
  });

  it('should have critical severity', () => {
    for (const rule of DEFAULT_SENSITIVE_FILE_RULES) {
      expect(rule.severity).toBe('critical');
    }
  });

  it('should produce no maskedEvidence (name rules)', () => {
    const rule = findRule('SENSITIVE_FILE_NAME_ENV');
    if (!rule) throw new Error('Rule not found');
    const result = rule.detect('.env', '');
    expect(result.maskedEvidence).toBeUndefined();
  });
});
