/**
 * Phases reported during ContextPack generation progress.
 */
export type GenerationPhase =
  | 'validating'
  | 'loading-configuration'
  | 'discovering'
  | 'filtering'
  | 'reading'
  | 'scanning-security'
  | 'sizing'
  | 'packing'
  | 'generating'
  | 'validating-output'
  | 'committing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export const GenerationPhaseValues = [
  'validating',
  'loading-configuration',
  'discovering',
  'filtering',
  'reading',
  'scanning-security',
  'sizing',
  'packing',
  'generating',
  'validating-output',
  'committing',
  'completed',
  'cancelled',
  'failed',
] as const;
