/**
 * Security severity levels for findings.
 * - low: informational, no blocking
 * - medium: warning, block in strict mode
 * - high: blocked by default
 * - critical: always blocked, no override in V1
 */
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export const SecuritySeverityValues = ['low', 'medium', 'high', 'critical'] as const;
