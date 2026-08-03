import type { ProfileId } from '../enums/profile-id.js';

export interface InspectProjectSourcesInput {
  readonly projectRoot: string;
  readonly selectedPaths?: string[];
}

export interface InspectProjectSourcesOutput {
  readonly structure: {
    readonly directoryCount: number;
    readonly fileCount: number;
  };
  readonly detectedExtensions: string[];
  readonly probableLanguages: string[];
  readonly estimatedTotalSizeBytes: number;
  readonly ignoredDirectories: string[];
  readonly securityRisks: string[];
  readonly suggestedProfiles: ProfileId[];
}
