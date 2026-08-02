import type { ReasonCode, SecuritySeverity, SourceFile } from '@contextforge/contracts';
import { describe, expect, it } from 'vitest';
import { FileDecisionService } from '../../services/file-decision-service';

/** Fabrique un SourceFile minimal pour les tests. */
function makeFile(relativePath: string, overrides: Partial<SourceFile> = {}): SourceFile {
  return {
    id: `id-${relativePath}` as SourceFile['id'],
    relativePath: relativePath as SourceFile['relativePath'],
    absolutePath: `/root/${relativePath}`,
    extension: relativePath.includes('.') ? relativePath.slice(relativePath.lastIndexOf('.')) : '',
    sizeInBytes: 1024,
    encoding: 'utf-8',
    contentKind: 'text',
    discoveredAt: new Date().toISOString(),
    ...overrides,
  } as SourceFile;
}

describe('FileDecisionService', () => {
  const svc = new FileDecisionService();

  describe('createIncluded', () => {
    it('crée une décision included avec les bons champs', () => {
      const file = makeFile('src/index.ts');
      const d = svc.createIncluded(file, 250, 'code', 5);
      expect(d.status).toBe('included');
      expect(d.file).toBe(file);
      expect(d.estimatedTokens).toBe(250);
      expect(d.category).toBe('code');
      expect(d.priority).toBe(5);
      expect(d.warnings).toEqual([]);
    });
  });

  describe('createExcluded', () => {
    it('crée une décision excluded', () => {
      const file = makeFile('src/legacy.ts');
      const d = svc.createExcluded(file, 'excluded_by_pattern' as ReasonCode, 'Pattern de test');
      expect(d.status).toBe('excluded');
      expect(d.reasonCode).toBe('excluded_by_pattern');
      expect(d.reason).toBe('Pattern de test');
    });
  });

  describe('createBlocked', () => {
    it('crée une décision blocked avec findings', () => {
      const file = makeFile('.env');
      const d = svc.createBlocked(
        file,
        'sensitive_file' as ReasonCode,
        'Fichier sensible',
        [
          {
            ruleId: 'TEST_001',
            kind: 'api-key',
            severity: 'critical' as SecuritySeverity,
            relativePath: '.env',
            message: 'Test finding',
            maskedEvidence: '***',
          },
        ],
        'critical' as SecuritySeverity,
      );
      expect(d.status).toBe('blocked');
      expect(d.findings).toHaveLength(1);
      expect(d.highestSeverity).toBe('critical');
    });
  });

  describe('createOversized', () => {
    it('crée une décision oversized', () => {
      const file = makeFile('big.bin', { sizeInBytes: 5_000_000 });
      const d = svc.createOversized(file, 200_000, 100_000);
      expect(d.status).toBe('oversized');
      expect(d.estimatedTokens).toBe(200_000);
      expect(d.configuredLimit).toBe(100_000);
      expect(d.recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('createFailed', () => {
    it('crée une décision failed', () => {
      const d = svc.createFailed('missing.txt', 'READ_ERROR', 'Fichier introuvable', true);
      expect(d.status).toBe('failed');
      expect(d.relativePath).toBe('missing.txt');
      expect(d.errorCode).toBe('READ_ERROR');
      expect(d.recoverable).toBe(true);
    });
  });

  describe('validateCoverage', () => {
    it('retourne un tableau vide quand tous les fichiers ont une décision', () => {
      const fileA = makeFile('a.ts');
      const fileB = makeFile('b.ts');
      const files = [fileA, fileB];
      const decisions = [
        svc.createIncluded(fileA, 100, 'code', 5),
        svc.createIncluded(fileB, 100, 'code', 5),
      ];
      const missing = svc.validateCoverage(files, decisions);
      expect(missing).toHaveLength(0);
    });

    it('retourne les chemins sans décision', () => {
      const fileA = makeFile('a.ts');
      const fileB = makeFile('b.ts');
      const fileC = makeFile('c.ts');
      const files = [fileA, fileB, fileC];
      const decisions = [svc.createIncluded(fileA, 100, 'code', 5)];
      const missing = svc.validateCoverage(files, decisions);
      expect(missing).toHaveLength(2);
      expect(missing).toContain('b.ts');
      expect(missing).toContain('c.ts');
    });

    it('gère les décisions failed', () => {
      const fileA = makeFile('a.ts');
      const fileB = makeFile('b.ts');
      const files = [fileA, fileB];
      const decisions = [
        svc.createIncluded(fileA, 100, 'code', 5),
        svc.createFailed('b.ts', 'ERR', 'msg', false),
      ];
      const missing = svc.validateCoverage(files, decisions);
      expect(missing).toHaveLength(0);
    });
  });
});
