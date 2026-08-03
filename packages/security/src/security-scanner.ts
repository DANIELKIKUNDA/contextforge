import type { SecurityFinding, SourceFile } from '@contextforge/contracts';
import type { SecurityScannerPort } from '@contextforge/core';
import { DEFAULT_SECRET_PATTERNS } from './default-secret-patterns.js';
import { DEFAULT_SENSITIVE_EXTENSION_RULES } from './default-sensitive-extension-rules.js';
import { DEFAULT_SENSITIVE_FILE_RULES } from './default-sensitive-file-rules.js';
import type { SecurityRule } from './security-rule.js';

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const DEFAULT_MAX_CONTENT_SCAN_BYTES = 1_048_576; // 1 MB

export interface SecurityScannerOptions {
  readonly maxContentScanBytes?: number;
}

/**
 * Implements SecurityScannerPort.
 *
 * Analyzes file metadata (name, extension) and optional text content
 * to produce SecurityFinding[].
 * Never stores raw secret values — uses [REDACTED] masking.
 * Never reads the file system itself — relies on content already provided
 * by packages/scanner.
 */
export class SecurityScanner implements SecurityScannerPort {
  private readonly rules: readonly SecurityRule[];
  private readonly maxContentScanBytes: number;

  constructor(options?: SecurityScannerOptions) {
    this.rules = [
      ...DEFAULT_SENSITIVE_FILE_RULES,
      ...DEFAULT_SENSITIVE_EXTENSION_RULES,
      ...DEFAULT_SECRET_PATTERNS,
    ];
    const raw = options?.maxContentScanBytes ?? DEFAULT_MAX_CONTENT_SCAN_BYTES;
    if (!Number.isFinite(raw) || raw <= 0 || !Number.isInteger(raw)) {
      throw new Error('Invalid maxContentScanBytes: must be a positive finite integer.');
    }
    this.maxContentScanBytes = raw;
  }

  async scan(file: SourceFile, content?: string): Promise<SecurityFinding[]> {
    const findings: SecurityFinding[] = [];
    const relativePath = file.relativePath as string;

    // 1. Extract basename and extension
    const fileName = extractBasename(relativePath);
    const extension = file.extension.toLowerCase();

    // 2. Truncate content if needed (don't scan gigabytes of data)
    const scanContent =
      content !== undefined && content.length > this.maxContentScanBytes
        ? content.slice(0, this.maxContentScanBytes)
        : content;

    // 3. Run all rules
    for (const rule of this.rules) {
      const result = rule.detect(fileName, extension, scanContent);
      if (result.matched) {
        findings.push({
          ruleId: rule.ruleId,
          kind: rule.kind,
          severity: rule.severity,
          relativePath,
          message: rule.message,
          ...(result.maskedEvidence !== undefined && { maskedEvidence: result.maskedEvidence }),
          ...(result.lineNumber !== undefined && { lineNumber: result.lineNumber }),
        } as SecurityFinding);
      }
    }

    // 4. Deduplicate: one finding per rule per file per line
    const deduped = deduplicate(findings);

    // 5. Stable sort
    deduped.sort(compareFindings);

    return deduped;
  }
}

function extractBasename(relativePath: string): string {
  const lastSlash = relativePath.lastIndexOf('/');
  if (lastSlash === -1) return relativePath;
  return relativePath.slice(lastSlash + 1);
}

function deduplicate(findings: readonly SecurityFinding[]): SecurityFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.relativePath}:${f.ruleId}:${f.lineNumber ?? 0}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareFindings(a: SecurityFinding, b: SecurityFinding): number {
  // 1. relativePath alphabetical
  const pathCmp = a.relativePath.localeCompare(b.relativePath);
  if (pathCmp !== 0) return pathCmp;

  // 2. severity (critical=0, high=1, medium=2, low=3)
  const sevA = SEVERITY_ORDER[a.severity] ?? 99;
  const sevB = SEVERITY_ORDER[b.severity] ?? 99;
  if (sevA !== sevB) return sevA - sevB;

  // 3. kind alphabetical
  const kindCmp = a.kind.localeCompare(b.kind);
  if (kindCmp !== 0) return kindCmp;

  // 4. lineNumber ascending (undefined last)
  const lineA = a.lineNumber ?? Number.MAX_SAFE_INTEGER;
  const lineB = b.lineNumber ?? Number.MAX_SAFE_INTEGER;
  if (lineA !== lineB) return lineA - lineB;

  // 5. ruleId alphabetical
  return a.ruleId.localeCompare(b.ruleId);
}
