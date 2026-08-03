import type { ReasonCode } from '../enums/reason-code.js';
import type { SecuritySeverity } from '../enums/security-severity.js';
import type { SecurityFinding } from './security-finding.js';
import type { SourceFile } from './source-file.js';

/**
 * FileDecision — Discriminated union.
 * Every file candidate gets exactly one decision.
 */

export interface IncludedFileDecision {
  readonly status: 'included';
  readonly file: SourceFile;
  readonly estimatedTokens: number;
  readonly category: string;
  readonly priority: number;
  readonly warnings: string[];
}

export interface ExcludedFileDecision {
  readonly status: 'excluded';
  readonly file: SourceFile;
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly ruleId?: string;
}

export interface BlockedFileDecision {
  readonly status: 'blocked';
  readonly file: SourceFile;
  readonly reasonCode: ReasonCode;
  readonly reason: string;
  readonly findings: SecurityFinding[];
  readonly highestSeverity: SecuritySeverity;
}

export interface OversizedFileDecision {
  readonly status: 'oversized';
  readonly file: SourceFile;
  readonly estimatedTokens: number;
  readonly configuredLimit: number;
  readonly recommendation: string;
}

export interface FailedFileDecision {
  readonly status: 'failed';
  readonly relativePath: string;
  readonly errorCode: string;
  readonly message: string;
  readonly recoverable: boolean;
}

export type FileDecision =
  | IncludedFileDecision
  | ExcludedFileDecision
  | BlockedFileDecision
  | OversizedFileDecision
  | FailedFileDecision;
