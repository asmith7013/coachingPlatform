// src/lib/types/core/reference.ts
import { z } from "zod";

/**
 * Base reference schema and type
 */
export const BaseReferenceZodSchema = z.object({
  _id: z.string(),
  label: z.string(),
  value: z.string().optional(),
});

export type BaseReference = z.infer<typeof BaseReferenceZodSchema>;

/**
 * School reference schema and type
 */
export const SchoolReferenceZodSchema = BaseReferenceZodSchema.extend({
  schoolNumber: z.string().optional(),
  district: z.string().optional(),
});

export type SchoolReference = z.infer<typeof SchoolReferenceZodSchema>;

/**
 * Staff reference schema and type
 */
export const StaffReferenceZodSchema = BaseReferenceZodSchema.extend({
  email: z.string().email().optional(),
  role: z.string().optional(),
});

export type StaffReference = z.infer<typeof StaffReferenceZodSchema>;

// Additional reference schemas and types for other entities...

/**
 * Generic utility to create a reference mapper
 */
export function createReferenceMapper<T, R extends BaseReference>(
  getLabelFn: (entity: T) => string,
  getAdditionalFields?: (entity: T) => Partial<Omit<R, '_id' | 'label' | 'value'>>
) {
  return (entity: T & { _id: string }): R => {
    const reference: BaseReference = {
      _id: entity._id,
      label: getLabelFn(entity),
      value: entity._id, // Default to using _id as value
    };
    
    return {
      ...reference,
      ...(getAdditionalFields ? getAdditionalFields(entity) : {}),
    } as R;
  };
}