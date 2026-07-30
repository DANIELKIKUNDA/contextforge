import type { ContextPackStatus } from '../enums/context-pack-status';

export interface ContextPackResult {
  readonly packId: string;
  readonly status: ContextPackStatus;
  readonly outputDirectory: string;
  readonly readmePath: string;
  readonly manifestPath: string;
  readonly volumePaths: string[];
  readonly includedFilesPath: string;
  readonly exclusionsPath: string;
  readonly warningsPath: string;
  readonly includedCount: number;
  readonly blockedCount: number;
  readonly estimatedTokens: number;
  readonly generatedAt: string;
  readonly durationMs: number;
  readonly warnings: string[];
}
