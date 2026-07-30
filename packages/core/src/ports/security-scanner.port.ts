import type { SecurityFinding, SourceFile } from '@contextforge/contracts';

/**
 * Analyzes a file and produces security findings.
 * Raw secrets are never returned — use maskedEvidence.
 */
export interface SecurityScannerPort {
  scan(file: SourceFile, content?: string): Promise<SecurityFinding[]>;
}
