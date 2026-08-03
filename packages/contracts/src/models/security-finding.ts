import type { SecuritySeverity } from '../enums/security-severity.js';

/**
 * Security finding kinds in V1.
 */
export type SecurityFindingKind =
  | 'sensitive-file-name'
  | 'sensitive-extension'
  | 'private-key'
  | 'api-key'
  | 'token'
  | 'password'
  | 'connection-string'
  | 'credential-object'
  | 'suspicious-secret-pattern';

/**
 * SecurityFinding produced by a detection rule.
 * Raw secret values are never stored — use maskedEvidence.
 */
export interface SecurityFinding {
  readonly ruleId: string;
  readonly kind: SecurityFindingKind;
  readonly severity: SecuritySeverity;
  readonly relativePath: string;
  readonly message: string;
  /** Masked evidence only — raw value never stored. */
  readonly maskedEvidence?: string;
  readonly lineNumber?: number;
}
