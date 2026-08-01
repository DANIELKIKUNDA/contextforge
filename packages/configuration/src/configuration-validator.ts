import type { ContextForgeConfiguration } from '@contextforge/contracts';
import { ContextForgeConfigurationSchema } from '@contextforge/contracts';

export interface ValidationResult {
  readonly isValid: boolean;
  readonly invalidKeys?: string[];
  readonly errors?: readonly string[];
}

/**
 * Validates the merged configuration against the Zod schema.
 * Invalid keys are reported but the system continues with defaults.
 */
export class ConfigurationValidator {
  validate(config: ContextForgeConfiguration): ValidationResult {
    const result = ContextForgeConfigurationSchema.safeParse(config);

    if (result.success) {
      return { isValid: true };
    }

    const errors = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

    // Extract which top-level keys have validation issues
    const invalidKeys = result.error.issues
      .map((issue) => issue.path[0] as string)
      .filter((key): key is string => typeof key === 'string');

    return {
      isValid: false,
      invalidKeys: [...new Set(invalidKeys)],
      errors,
    };
  }
}
