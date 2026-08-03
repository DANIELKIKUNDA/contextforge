import type { SecurityRule } from './security-rule.js';

const REDACTED = '[REDACTED]';

/**
 * Default content-based secret detection rules (doc 06 §11, doc 03 §5.3).
 * All regex patterns are bounded against ReDoS — no unbounded backtracking.
 */
export const DEFAULT_SECRET_PATTERNS: readonly SecurityRule[] = [
  // ── Private key ──
  {
    ruleId: 'SECRET_PRIVATE_KEY_PEM',
    kind: 'private-key',
    severity: 'critical',
    message: 'Private key block detected in file content.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /-----BEGIN [A-Z ]*PRIVATE KEY-----/.exec(content);
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },

  // ── API keys ──
  {
    ruleId: 'SECRET_API_KEY_GENERIC',
    kind: 'api-key',
    severity: 'high',
    message: 'Potential API key detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /[a-zA-Z0-9_]*api[_-]?key\s*[=:]\s*['"]?([a-zA-Z0-9_\-+]{16,})['"]?/.exec(
        content,
      );
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },
  {
    ruleId: 'SECRET_ACCESS_TOKEN_GENERIC',
    kind: 'token',
    severity: 'high',
    message: 'Potential access token detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match =
        /(?:access[_-]?token|auth[_-]?token|bearer|token)\s*[=:]\s*['"]?([a-zA-Z0-9_\-+.]{20,})['"]?/i.exec(
          content,
        );
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },

  // ── Password ──
  {
    ruleId: 'SECRET_PASSWORD_ASSIGNMENT',
    kind: 'password',
    severity: 'high',
    message: 'Hardcoded password detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /password\s*[=:]\s*['"]([^'"\n]{4,})['"]/i.exec(content);
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },

  // ── Connection strings ──
  {
    ruleId: 'SECRET_CONNECTION_STRING_PG',
    kind: 'connection-string',
    severity: 'critical',
    message: 'PostgreSQL connection string with credentials detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /postgres(?:ql)?:\/\/[^:@]+:[^@]+@/.exec(content);
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },
  {
    ruleId: 'SECRET_CONNECTION_STRING_MYSQL',
    kind: 'connection-string',
    severity: 'critical',
    message: 'MySQL connection string with credentials detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /mysql:\/\/[^:@]+:[^@]+@/.exec(content);
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },
  {
    ruleId: 'SECRET_CONNECTION_STRING_MONGO',
    kind: 'connection-string',
    severity: 'critical',
    message: 'MongoDB connection string with credentials detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /mongodb(\+srv)?:\/\/[^:@]+:[^@]+@/.exec(content);
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },
  {
    ruleId: 'SECRET_CONNECTION_STRING_REDIS',
    kind: 'connection-string',
    severity: 'high',
    message: 'Redis connection string with credentials detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match = /redis:\/\/[^:@]+:[^@]+@/.exec(content);
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },

  // ── Credential object ──
  {
    ruleId: 'SECRET_CREDENTIAL_OBJECT',
    kind: 'credential-object',
    severity: 'high',
    message: 'JSON object with credential fields detected.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match =
        /\{\s*"(?:username|user|login|email)"\s*:\s*"[^"]+"\s*,\s*"(?:password|passwd|pwd|secret)"\s*:\s*"[^"]+"/.exec(
          content,
        );
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },

  // ── Suspicious secret pattern ──
  {
    ruleId: 'SECRET_SUSPICIOUS_PATTERN',
    kind: 'suspicious-secret-pattern',
    severity: 'medium',
    message: 'Suspicious assignment that may contain a secret.',
    detect(_fileName, _extension, content) {
      if (!content) return { matched: false };
      const match =
        /\b(?:SECRET|SECRET_KEY|PRIVATE_KEY|API_KEY|AUTH_TOKEN)\s*=\s*['"]?([^\s'"\n]{12,})['"]?/.exec(
          content,
        );
      if (!match) return { matched: false };
      return { matched: true, maskedEvidence: REDACTED, lineNumber: lineOf(match.index, content) };
    },
  },
];

function lineOf(index: number, content: string): number {
  return (content.slice(0, index).match(/\n/g)?.length ?? 0) + 1;
}
