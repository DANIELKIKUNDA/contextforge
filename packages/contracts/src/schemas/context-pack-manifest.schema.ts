import { z } from 'zod';
import { ProfileIdValues } from '../enums/profile-id';
import { SecuritySeverityValues } from '../enums/security-severity';

export const ContextPackManifestSchema = z.object({
  schemaVersion: z.string(),
  contextForgeVersion: z.string(),
  packId: z.string().min(1),
  name: z.string().min(1),
  objective: z.string().min(10).max(500),
  profile: z.enum(ProfileIdValues),
  projectName: z.string().min(1),
  generatedAt: z.string(),
  estimationStrategy: z.string(),
  limits: z.object({
    tokenLimit: z.number().int().positive(),
    maxFileSizeBytes: z.number().int().nonnegative(),
  }),
  includedFiles: z.array(z.string()),
  excludedFiles: z.array(z.string()),
  blockedFiles: z.array(z.string()),
  oversizedFiles: z.array(z.string()),
  failedFiles: z.array(z.string()),
  volumes: z.array(
    z.object({
      index: z.number().int().min(1),
      outputFileName: z.string().min(1),
      fileCount: z.number().int().nonnegative(),
      estimatedTokens: z.number().int().nonnegative(),
      estimatedBytes: z.number().int().nonnegative(),
    }),
  ),
  warnings: z.array(z.string()),
  securitySummary: z.object({
    totalFindings: z.number().int().nonnegative(),
    highestSeverity: z.enum([...SecuritySeverityValues, 'none'] as [string, ...string[]]),
    blockedFileCount: z.number().int().nonnegative(),
  }),
  outputFiles: z.array(z.string()),
});

export type ContextPackManifest = z.infer<typeof ContextPackManifestSchema>;
