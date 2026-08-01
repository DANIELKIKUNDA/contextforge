import type { ProfileDefinition } from '@contextforge/core';

export const codeReviewProfile: ProfileDefinition = {
  id: 'code-review',
  name: 'Code Review',
  description:
    'Optimized for code review contexts — includes source files, tests, and type definitions.',
  defaultTokenLimit: 150000,
  suggestedDirectories: ['src', 'tests', 'types', 'lib'],
  priorityExtensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go'],
  outputCategories: ['code', 'tests'],
};
