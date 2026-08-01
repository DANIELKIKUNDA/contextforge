import type { ProfileDefinition } from '@contextforge/core';

export const customProfile: ProfileDefinition = {
  id: 'custom',
  name: 'Custom',
  description: 'Fully customizable profile — uses user-defined directories and extensions.',
  defaultTokenLimit: 200000,
  suggestedDirectories: [],
  priorityExtensions: [],
  outputCategories: [],
};