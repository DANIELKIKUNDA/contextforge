import { z } from 'zod';
import { ProfileIdValues } from '../enums/profile-id';

/**
 * Zod schema for validating a ContextPackRequest input.
 */
export const ContextPackRequestSchema = z.object({
  projectRoot: z.string().min(1, 'projectRoot must not be empty.'),
  objective: z
    .string()
    .trim()
    .min(10, 'Objective must be at least 10 characters.')
    .max(500, 'Objective must not exceed 500 characters.'),
  profile: z.enum(ProfileIdValues, {
    errorMap: () => ({ message: 'Invalid profile.' }),
  }),
  selectedPaths: z.array(z.string().min(1)).min(1, 'At least one path must be selected.'),
  tokenLimit: z.number().int().positive('Token limit must be a positive integer.'),
  customIncludes: z.array(z.string()).optional(),
  customExcludes: z.array(z.string()).optional(),
  outputDirectory: z.string().optional(),
  securityMode: z.enum(['strict', 'balanced']).optional().default('strict'),
  previewOnly: z.boolean().optional().default(false),
});

export type ContextPackRequest = z.infer<typeof ContextPackRequestSchema>;
