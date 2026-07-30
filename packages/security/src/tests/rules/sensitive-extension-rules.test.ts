import { describe, expect, it } from 'vitest';
import { DEFAULT_SENSITIVE_EXTENSION_RULES } from '../../default-sensitive-extension-rules';

function findRule(ruleId: string) {
  return DEFAULT_SENSITIVE_EXTENSION_RULES.find((r) => r.ruleId === ruleId);
}

describe('sensitive-extension-rules', () => {
  it('should detect .pem', () => {
    const rule = findRule('SENSITIVE_EXTENSION_PEM');
    expect(rule?.detect('file.pem', '.pem').matched).toBe(true);
  });

  it('should detect .PEM (uppercase)', () => {
    const rule = findRule('SENSITIVE_EXTENSION_PEM');
    expect(rule?.detect('file.PEM', '.pem').matched).toBe(true);
  });

  it('should detect .key', () => {
    const rule = findRule('SENSITIVE_EXTENSION_KEY');
    expect(rule?.detect('keyfile.key', '.key').matched).toBe(true);
  });

  it('should detect .p12', () => {
    const rule = findRule('SENSITIVE_EXTENSION_P12');
    expect(rule?.detect('cert.p12', '.p12').matched).toBe(true);
  });

  it('should detect .pfx', () => {
    const rule = findRule('SENSITIVE_EXTENSION_PFX');
    expect(rule?.detect('bundle.pfx', '.pfx').matched).toBe(true);
  });

  it('should detect .jks', () => {
    const rule = findRule('SENSITIVE_EXTENSION_JKS');
    expect(rule?.detect('keystore.jks', '.jks').matched).toBe(true);
  });

  it('should not detect .pem inside longer extension', () => {
    const rule = findRule('SENSITIVE_EXTENSION_PEM');
    expect(rule?.detect('file.pem.txt', '.pem.txt').matched).toBe(false);
  });

  it('should handle file with no extension', () => {
    const rule = findRule('SENSITIVE_EXTENSION_PEM');
    expect(rule?.detect('Makefile', '').matched).toBe(false);
  });

  it('should have critical severity', () => {
    for (const rule of DEFAULT_SENSITIVE_EXTENSION_RULES) {
      expect(rule.severity).toBe('critical');
    }
  });

  it('should produce no maskedEvidence', () => {
    const rule = findRule('SENSITIVE_EXTENSION_PEM');
    if (!rule) throw new Error('Rule not found');
    const result = rule.detect('file.pem', '.pem');
    expect(result.maskedEvidence).toBeUndefined();
  });
});
