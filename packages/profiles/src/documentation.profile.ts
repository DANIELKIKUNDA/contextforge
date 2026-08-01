import type { ProfileDefinition } from '@contextforge/core';

export const documentationProfile: ProfileDefinition = {
  id: 'documentation',
  name: 'Documentation',
  description: 'Focused on documentation files, READMEs, and guides.',
  defaultTokenLimit: 100000,
  suggestedDirectories: ['docs', 'README.md', 'CONTRIBUTING.md', 'guides'],
  priorityExtensions: ['.md', '.mdx', '.txt', '.rst', '.adoc'],
  outputCategories: ['docs'],
};
