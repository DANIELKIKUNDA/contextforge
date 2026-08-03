import type { ProfileId } from '../enums/profile-id.js';
import type { Objective } from '../value-objects/objective.js';
import type { FileDecision } from './file-decision.js';
import type { ProjectDescriptor } from './project-descriptor.js';

/**
 * Full scan preview result — no files are written at this stage.
 */
export interface ContextPackPreview {
  readonly previewId: string;
  readonly requestFingerprint: string;
  readonly project: ProjectDescriptor;
  readonly objective: Objective;
  readonly profile: ProfileId;
  readonly decisions: FileDecision[];
  readonly includedCount: number;
  readonly excludedCount: number;
  readonly blockedCount: number;
  readonly oversizedCount: number;
  readonly failedCount: number;
  readonly estimatedTokens: number;
  readonly estimatedBytes: number;
  readonly estimatedVolumes: number;
  readonly warnings: string[];
  readonly requiresConfirmation: boolean;
  readonly createdAt: string;
}
