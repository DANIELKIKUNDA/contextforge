/**
 * Detected content kind for a source file.
 */
export type FileContentKind = 'text' | 'binary' | 'unknown';

export const FileContentKindValues = ['text', 'binary', 'unknown'] as const;
