import { describe, expect, it } from 'vitest';
import { createContextPackId } from '../../ids/context-pack-id.js';
import type {
  BlockedFileDecision,
  ExcludedFileDecision,
  FailedFileDecision,
  FileDecision,
  IncludedFileDecision,
  OversizedFileDecision,
} from '../../models/file-decision.js';
import type { SecurityFinding } from '../../models/security-finding.js';
import type { SourceFile } from '../../models/source-file.js';

function makeStubSourceFile(overrides: Partial<SourceFile> = {}): SourceFile {
  return {
    id: createContextPackId('550e8400-e29b-41d4-a716-446655440000') as SourceFile['id'],
    relativePath: 'src/test.ts' as unknown as SourceFile['relativePath'],
    absolutePath: '/internal/path/src/test.ts',
    extension: '.ts',
    sizeInBytes: 1024,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: '2026-07-29T00:00:00Z',
    ...overrides,
  };
}

function makeStubSecurityFinding(overrides: Partial<SecurityFinding> = {}): SecurityFinding {
  return {
    ruleId: 'rule-1',
    kind: 'sensitive-file-name',
    severity: 'high',
    relativePath: 'src/.env',
    message: 'Sensitive file detected.',
    ...overrides,
  };
}

describe('FileDecision discriminated union', () => {
  it('should create an IncludedFileDecision', () => {
    const decision: IncludedFileDecision = {
      status: 'included',
      file: makeStubSourceFile(),
      estimatedTokens: 500,
      category: 'application',
      priority: 1,
      warnings: [],
    };
    expect(decision.status).toBe('included');
    expect(decision.file.contentKind).toBe('text');
  });

  it('should create an ExcludedFileDecision', () => {
    const decision: ExcludedFileDecision = {
      status: 'excluded',
      file: makeStubSourceFile(),
      reasonCode: 'unsupported-extension',
      reason: 'Extension .xyz is not supported.',
    };
    expect(decision.status).toBe('excluded');
    expect(decision.reasonCode).toBe('unsupported-extension');
  });

  it('should create a BlockedFileDecision', () => {
    const finding = makeStubSecurityFinding();
    const decision: BlockedFileDecision = {
      status: 'blocked',
      file: makeStubSourceFile({ relativePath: '.env' as unknown as SourceFile['relativePath'] }),
      reasonCode: 'sensitive-file-name',
      reason: 'File .env is blocked for security reasons.',
      findings: [finding],
      highestSeverity: 'high',
    };
    expect(decision.status).toBe('blocked');
    expect(decision.highestSeverity).toBe('high');
    expect(decision.findings).toHaveLength(1);
  });

  it('should create an OversizedFileDecision', () => {
    const decision: OversizedFileDecision = {
      status: 'oversized',
      file: makeStubSourceFile({ sizeInBytes: 10_000_000 }),
      estimatedTokens: 150000,
      configuredLimit: 120000,
      recommendation: 'Split the file before generating context.',
    };
    expect(decision.status).toBe('oversized');
    expect(decision.estimatedTokens).toBeGreaterThan(decision.configuredLimit);
  });

  it('should create a FailedFileDecision', () => {
    const decision: FailedFileDecision = {
      status: 'failed',
      relativePath: 'src/broken.ts',
      errorCode: 'UNREADABLE',
      message: 'File is unreadable due to permissions.',
      recoverable: false,
    };
    expect(decision.status).toBe('failed');
    expect(decision.recoverable).toBe(false);
  });

  it('should be usable as the FileDecision union type', () => {
    const decisions: FileDecision[] = [
      {
        status: 'included',
        file: makeStubSourceFile(),
        estimatedTokens: 100,
        category: 'tests',
        priority: 2,
        warnings: [],
      },
      {
        status: 'excluded',
        file: makeStubSourceFile({
          relativePath: 'ignored/file.txt' as unknown as SourceFile['relativePath'],
        }),
        reasonCode: 'ignored-by-gitignore',
        reason: 'Matched .gitignore pattern.',
      },
      {
        status: 'blocked',
        file: makeStubSourceFile({ relativePath: '.env' as unknown as SourceFile['relativePath'] }),
        reasonCode: 'sensitive-file-name',
        reason: 'Blocked.',
        findings: [makeStubSecurityFinding()],
        highestSeverity: 'high',
      },
    ];
    expect(decisions).toHaveLength(3);
    expect(decisions[0]?.status).toBe('included');
    expect(decisions[2]?.status).toBe('blocked');
  });
});
