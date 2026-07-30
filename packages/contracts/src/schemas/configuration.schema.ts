import { z } from 'zod';
import { ProfileIdValues } from '../enums/profile-id';

export const ContextForgeConfigurationSchema = z.object({
  outputDirectory: z.string().optional(),
  defaultProfile: z.enum(ProfileIdValues).optional(),
  maxEstimatedTokens: z.number().int().positive().optional(),
  includeExtensions: z.array(z.string()).optional(),
  excludeDirectories: z.array(z.string()).optional(),
  blockSensitiveFiles: z.boolean().optional(),
  previewBeforeGenerate: z.boolean().optional(),
  followSymlinks: z.boolean().optional().default(false),
  maxFileSizeBytes: z.number().int().positive().optional(),
  maxConcurrentReads: z.number().int().positive().optional(),
});

export type ContextForgeConfiguration = z.infer<typeof ContextForgeConfigurationSchema>;
