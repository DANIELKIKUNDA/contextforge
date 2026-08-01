import type { ProfileDefinition } from '@contextforge/core';

export const aiGeneralProfile: ProfileDefinition = {
  id: 'ai-general',
  name: 'AI General',
  description: 'General-purpose context for AI assistants and LLM consumption.',
  defaultTokenLimit: 200000,
  suggestedDirectories: [
    'src',
    'lib',
    'app',
    'components',
    'utils',
    'hooks',
    'services',
    'types',
    'config',
  ],
  priorityExtensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.java', '.cs'],
  outputCategories: ['code', 'docs', 'config'],
};
