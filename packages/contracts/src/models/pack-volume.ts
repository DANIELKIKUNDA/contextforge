import type { ContextPackId } from '../ids/context-pack-id';

export interface PackVolume {
  readonly index: number;
  readonly outputFileName: string;
  readonly fileIds: ContextPackId[];
  readonly estimatedTokens: number;
  readonly estimatedBytes: number;
  readonly heading: string;
  readonly orderKey: string;
}
