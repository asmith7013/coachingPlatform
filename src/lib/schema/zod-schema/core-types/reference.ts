import { z } from "zod";

/**
 * Base reference schema that all reference schemas should extend
 * Provides the core fields needed for any reference:
 * - _id: The unique identifier
 * - label: The display text
 * - value: The value to use in forms/selects (usually same as _id)
 */
export const BaseReferenceZodSchema = z.object({
    _id: z.string(),
    label: z.string(),
    value: z.string(),
}).strict();

/**
 * Type for the base reference schema
 */
export type BaseReference = z.infer<typeof BaseReferenceZodSchema>;
  