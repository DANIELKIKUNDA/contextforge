import type { SecurityRule } from './security-rule.js';

/**
 * Default rules for sensitive file extensions (doc 06 §10).
 * Comparison is always case-insensitive on the extension.
 */
export const DEFAULT_SENSITIVE_EXTENSION_RULES: readonly SecurityRule[] = [
  {
    ruleId: 'SENSITIVE_EXTENSION_PEM',
    kind: 'sensitive-extension',
    severity: 'critical',
    message: 'Sensitive file extension detected: .pem files may contain private keys.',
    detect(_fileName, extension) {
      return { matched: extension === '.pem' };
    },
  },
  {
    ruleId: 'SENSITIVE_EXTENSION_KEY',
    kind: 'sensitive-extension',
    severity: 'critical',
    message: 'Sensitive file extension detected: .key files may contain private keys.',
    detect(_fileName, extension) {
      return { matched: extension === '.key' };
    },
  },
  {
    ruleId: 'SENSITIVE_EXTENSION_P12',
    kind: 'sensitive-extension',
    severity: 'critical',
    message:
      'Sensitive file extension detected: .p12 files may contain certificate bundles with private keys.',
    detect(_fileName, extension) {
      return { matched: extension === '.p12' };
    },
  },
  {
    ruleId: 'SENSITIVE_EXTENSION_PFX',
    kind: 'sensitive-extension',
    severity: 'critical',
    message:
      'Sensitive file extension detected: .pfx files may contain certificate bundles with private keys.',
    detect(_fileName, extension) {
      return { matched: extension === '.pfx' };
    },
  },
  {
    ruleId: 'SENSITIVE_EXTENSION_JKS',
    kind: 'sensitive-extension',
    severity: 'critical',
    message: 'Sensitive file extension detected: .jks keystore may contain private keys.',
    detect(_fileName, extension) {
      return { matched: extension === '.jks' };
    },
  },
];
