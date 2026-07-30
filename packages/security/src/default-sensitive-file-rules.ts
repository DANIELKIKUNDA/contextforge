import type { SecurityRule } from './security-rule';

/**
 * Default rules for sensitive file names (doc 06 §10).
 * These match against the file basename only — not the full path.
 */
export const DEFAULT_SENSITIVE_FILE_RULES: readonly SecurityRule[] = [
  {
    ruleId: 'SENSITIVE_FILE_NAME_ENV',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: .env files may contain secrets.',
    detect(fileName) {
      return { matched: fileName === '.env' };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_ENV_VARIANT',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: .env.* files may contain environment-specific secrets.',
    detect(fileName) {
      return { matched: fileName.startsWith('.env.') };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_CREDENTIALS_JSON',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: credentials file may contain secrets.',
    detect(fileName) {
      return { matched: fileName === 'credentials.json' };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_SECRETS_JSON',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: secrets file may contain sensitive data.',
    detect(fileName) {
      return { matched: fileName === 'secrets.json' };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_SECRETS_YAML',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: secrets YAML file may contain sensitive data.',
    detect(fileName) {
      return { matched: fileName === 'secrets.yaml' || fileName === 'secrets.yml' };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_PRIVATE_KEY',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: private key file may expose SSH credentials.',
    detect(fileName) {
      return { matched: fileName === 'id_rsa' };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_PRIVATE_KEY_ED',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: Ed25519 private key may expose SSH credentials.',
    detect(fileName) {
      return { matched: fileName === 'id_ed25519' };
    },
  },
  {
    ruleId: 'SENSITIVE_FILE_NAME_SERVICE_ACCOUNT',
    kind: 'sensitive-file-name',
    severity: 'critical',
    message: 'Sensitive file name detected: service account key may contain cloud credentials.',
    detect(fileName) {
      return { matched: /^service-account.*\.json$/.test(fileName) };
    },
  },
];
