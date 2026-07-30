import type { SourceFile } from '@contextforge/contracts';

/**
 * Discovers candidate files from the project workspace.
 */
export interface FileDiscoveryPort {
  discover(
    projectRoot: string,
    selectedPaths: string[],
    cancellation?: CancellationToken,
  ): Promise<SourceFile[]>;
}

/** Minimal cancellation token — detailed contract in cancellation.port.ts. */
export interface CancellationToken {
  readonly cancelled: boolean;
}
