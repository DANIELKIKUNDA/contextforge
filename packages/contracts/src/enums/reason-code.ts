/**
 * Reason codes for file decisions.
 * Each code explains why a file was excluded, blocked, or failed.
 */
export type ReasonCode =
  | 'ignored-directory'
  | 'ignored-by-gitignore'
  | 'ignored-by-contextforgeignore'
  | 'unsupported-extension'
  | 'binary-file'
  | 'sensitive-file-name'
  | 'sensitive-extension'
  | 'secret-detected'
  | 'too-large'
  | 'unreadable'
  | 'invalid-encoding'
  | 'outside-workspace'
  | 'symbolic-link'
  | 'duplicate'
  | 'cancelled';

export const ReasonCodeValues = [
  'ignored-directory',
  'ignored-by-gitignore',
  'ignored-by-contextforgeignore',
  'unsupported-extension',
  'binary-file',
  'sensitive-file-name',
  'sensitive-extension',
  'secret-detected',
  'too-large',
  'unreadable',
  'invalid-encoding',
  'outside-workspace',
  'symbolic-link',
  'duplicate',
  'cancelled',
] as const;
