import type { SecurityFindingKind } from '@contextforge/contracts';
import type { SecuritySeverity } from '@contextforge/contracts';

/**
 * Internal contract for a security detection rule.
 *
 * Each rule identifies one kind of finding, has a fixed severity,
 * and produces a deterministic result for a given input.
 */
export interface SecurityRule {
  /** Stable unique identifier for this rule. */
  readonly ruleId: string;

  /** The finding kind this rule produces. */
  readonly kind: SecurityFindingKind;

  /** Fixed severity assigned to findings from this rule. */
  readonly severity: SecuritySeverity;

  /**
   * Human-readable message describing the finding.
   * Must never contain raw secret values.
   */
  readonly message: string;

  /**
   * Tests whether this rule matches the given file name and optional content.
   * @param fileName - the basename of the file (not full path)
   * @param extension - file extension (lowercased)
   * @param content - optional text content to scan
   */
  detect(fileName: string, extension: string, content?: string): DetectionResult;
}

export interface DetectionResult {
  /** Whether the rule matched. */
  readonly matched: boolean;
  /**
   * Masked evidence. Must be [REDACTED] for any matched secret content.
   * undefined if the rule produces no evidence (e.g., name-based rules).
   */
  readonly maskedEvidence?: string;
  /** 1-based line number where the finding was detected, if applicable. */
  readonly lineNumber?: number;
}
