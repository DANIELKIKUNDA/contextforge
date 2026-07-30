import type { ProfileId } from '../enums/profile-id';
import type { SecuritySeverity } from '../enums/security-severity';

export interface ContextPackManifest {
  readonly schemaVersion: string;
  readonly contextForgeVersion: string;
  readonly packId: string;
  readonly name: string;
  readonly objective: string;
  readonly profile: ProfileId;
  readonly projectName: string;
  readonly generatedAt: string;
  readonly estimationStrategy: string;
  readonly limits: {
    readonly tokenLimit: number;
    readonly maxFileSizeBytes: number;
  };
  readonly includedFiles: string[];
  readonly excludedFiles: string[];
  readonly blockedFiles: string[];
  readonly oversizedFiles: string[];
  readonly failedFiles: string[];
  readonly volumes: Array<{
    readonly index: number;
    readonly outputFileName: string;
    readonly fileCount: number;
    readonly estimatedTokens: number;
    readonly estimatedBytes: number;
  }>;
  readonly warnings: string[];
  readonly securitySummary: {
    readonly totalFindings: number;
    readonly highestSeverity: SecuritySeverity | 'none';
    readonly blockedFileCount: number;
  };
  readonly outputFiles: string[];
}
