// src/lib/ui/forms/tanstack/utils/validation-helpers.ts (~30 lines)
import type { ZodSchema } from 'zod';

/**
 * Standard validation timing for TanStack Form
 * Single preset that covers 90% of use cases
 */
export function createStandardValidation<T extends Record<string, unknown>>(
  schema: ZodSchema<T>
) {
  return {
    onChange: schema,
    onBlur: schema,
    onSubmit: schema,
  };
}

// That's it. No complex nested validation, no presets, no conditional logic.