// src/lib/data-utilities/transformers/reference-transformer.ts
import { z } from "zod";
import { BaseReference } from "@core-types/reference";

/**
 * Creates base reference fields for any entity
 */
export function createBaseReference<T extends { _id: string | { toString(): string } }>(
  entity: T,
  labelField: keyof T
): BaseReference {
  return {
    _id: typeof entity._id === 'string' ? entity._id : entity._id.toString(),
    value: typeof entity._id === 'string' ? entity._id : entity._id.toString(),
    label: String(entity[labelField]),
  };
}

/**
 * Creates a reference transformer for a specific entity type
 */
export function createReferenceTransformer<
  TEntity extends { _id: string | { toString(): string } },
  TReference extends BaseReference
>(
  getLabelFn: (entity: TEntity) => string,
  getAdditionalFields?: (entity: TEntity) => Partial<Omit<TReference, '_id' | 'label' | 'value'>>,
  validationSchema?: z.ZodType<TReference>
) {
  return function transformToReference(entity: TEntity): TReference {
    // Create base reference
    const reference: Record<string, unknown> = {
      _id: typeof entity._id === 'string' ? entity._id : entity._id.toString(),
      value: typeof entity._id === 'string' ? entity._id : entity._id.toString(),
      label: getLabelFn(entity),
    };
    
    // Add additional fields
    if (getAdditionalFields) {
      Object.assign(reference, getAdditionalFields(entity));
    }
    
    // Validate if schema provided
    if (validationSchema) {
      return validationSchema.parse(reference);
    }
    
    return reference as TReference;
  };
}

/**
 * Helper for transforming arrays of entities
 */
export function createArrayTransformer<T, R>(
  transformer: (entity: T) => R
) {
  return function transformArray(entities: T[]): R[] {
    return entities.map(transformer);
  };
}