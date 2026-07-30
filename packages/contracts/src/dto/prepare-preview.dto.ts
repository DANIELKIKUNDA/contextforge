import type { ProfileId } from '../enums/profile-id';
import type { ContextPackPreview } from '../models/context-pack-preview';

export interface PrepareContextPackPreviewInput {
  readonly projectRoot: string;
  readonly objective: string;
  readonly profile: ProfileId;
  readonly selectedPaths: string[];
  readonly tokenLimit: number;
  readonly customIncludes?: string[];
  readonly customExcludes?: string[];
  readonly outputDirectory?: string;
  readonly securityMode?: 'strict' | 'balanced';
  readonly previewOnly?: boolean;
}

export interface PrepareContextPackPreviewOutput {
  readonly preview: ContextPackPreview;
}
