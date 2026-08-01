import type { ProfileDefinition } from '@contextforge/core';

export const uiUxProfile: ProfileDefinition = {
  id: 'ui-ux',
  name: 'UI/UX',
  description:
    'UI/UX context — prioritizes roles, permissions, workflows, forms, validations, APIs, errors, pages, and components.',
  defaultTokenLimit: 180000,
  suggestedDirectories: ['src', 'components', 'pages', 'app', 'api', 'hooks', 'utils', 'types'],
  priorityExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '.css', '.html'],
  outputCategories: ['components', 'pages', 'api', 'types'],
};
