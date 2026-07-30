import type { ProfileId } from '../enums/profile-id';

/**
 * Describes the project being analyzed.
 * rootPath is internal only.
 */
export interface ProjectDescriptor {
  readonly name: string;
  /** Internal only — never serialized. */
  readonly rootPath: string;
  readonly workspaceKind: 'single-root' | 'multi-root';
  readonly platform: string;
  readonly detectedLanguages: string[];
  readonly selectedPaths: string[];
  readonly configurationSource?: string;
}
