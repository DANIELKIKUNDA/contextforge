import type { ContextForgeConfiguration } from '@contextforge/contracts';

export const DEFAULT_CONFIGURATION: ContextForgeConfiguration = {
  outputDirectory: '.contextforge/output',
  defaultProfile: undefined,
  maxEstimatedTokens: 200000,
  includeExtensions: [],
  excludeDirectories: [
    'node_modules',
    '.git',
    '.contextforge',
    'dist',
    'build',
    '.next',
    '.nuxt',
    '__pycache__',
    '.venv',
    'venv',
    '.idea',
    '.vscode',
    'coverage',
    '.turbo',
  ],
  blockSensitiveFiles: true,
  previewBeforeGenerate: true,
  followSymlinks: false,
  maxFileSizeBytes: 1048576, // 1 MB
  maxConcurrentReads: 16,
};
