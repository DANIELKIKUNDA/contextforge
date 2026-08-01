import type { ProfileDefinition } from '@contextforge/core';

export const onboardingProfile: ProfileDefinition = {
  id: 'onboarding',
  name: 'Onboarding',
  description: 'Helps new developers understand the project — includes overview docs, READMEs, and key source files.',
  defaultTokenLimit: 120000,
  suggestedDirectories: ['docs', 'src', 'README.md', 'CONTRIBUTING.md', 'ARCHITECTURE.md'],
  priorityExtensions: ['.md', '.ts', '.tsx', '.js', '.json', '.yaml', '.yml'],
  outputCategories: ['docs', 'code', 'config'],
};