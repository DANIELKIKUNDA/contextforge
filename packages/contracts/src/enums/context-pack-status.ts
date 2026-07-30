/**
 * Possible states of a ContextPack aggregate.
 */
export type ContextPackStatus =
  | 'draft'
  | 'previewed'
  | 'confirmed'
  | 'generating'
  | 'generated'
  | 'failed'
  | 'cancelled';

export const ContextPackStatusValues = [
  'draft',
  'previewed',
  'confirmed',
  'generating',
  'generated',
  'failed',
  'cancelled',
] as const;

/**
 * Valid state transitions for the ContextPack state machine.
 */
export const VALID_TRANSITIONS: Record<ContextPackStatus, ContextPackStatus[]> = {
  draft: ['previewed'],
  previewed: ['confirmed', 'cancelled'],
  confirmed: ['generating'],
  generating: ['generated', 'failed', 'cancelled'],
  generated: [],
  failed: [],
  cancelled: [],
};
