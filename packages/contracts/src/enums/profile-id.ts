/**
 * Predefined profile identifiers for V1.
 */
export type ProfileId =
  | 'ai-general'
  | 'code-review'
  | 'documentation'
  | 'onboarding'
  | 'ui-ux'
  | 'custom';

export const ProfileIdValues = [
  'ai-general',
  'code-review',
  'documentation',
  'onboarding',
  'ui-ux',
  'custom',
] as const;
