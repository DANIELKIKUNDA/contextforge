import type { ProfileId } from '../enums/profile-id.js';
import type { ContextPackResult } from '../models/context-pack-result.js';

export interface GenerateContextPackInput {
  readonly projectRoot: string;
  readonly objective: string;
  readonly profile: ProfileId;
  readonly selectedPaths: string[];
  readonly tokenLimit: number;
  readonly previewId: string;
  readonly requestFingerprint: string;
  readonly customIncludes?: string[];
  readonly customExcludes?: string[];
  readonly outputDirectory?: string;
  readonly securityMode?: 'strict' | 'balanced';
}

export interface GenerateContextPackOutput {
  readonly result: ContextPackResult;
}
