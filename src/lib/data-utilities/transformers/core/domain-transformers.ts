import { validateSafe, validateStrict } from '@/lib/data-utilities/transformers/core/schema-validators';
import { transformDocument } from '@/lib/data-utilities/transformers/core/db-transformers';
import { ZodSchema } from 'zod';

/**
 * Type for domain transformation functions
 */
export type DomainTransformer<T, R> = (data: T) => R;

/**
 * Type for domain transformation pipeline
 */
export type DomainTransformPipeline<T, R> = {
  schema: ZodSchema<T>;
  transform: DomainTransformer<T, R>;
};

/**
 * Applies domain-specific transformations to validated data
 */
export function applyDomainTransform<T, R>(
  doc: unknown,
  pipeline: DomainTransformPipeline<T, R>
): R | null {
  try {
    // Layer 1: MongoDB transformation
    const transformed = transformDocument(doc);
    
    // Layer 2: Schema validation (pure validation)
    const validated = validateSafe(pipeline.schema, transformed);
    if (!validated) return null;
    
    // Layer 3: Domain transformation
    return pipeline.transform(validated);
  } catch (error) {
    console.error('Error applying domain transform:', error);
    return null;
  }
}

/**
 * Applies domain transformation and throws if it fails
 */
export function applyDomainTransformOrThrow<T, R>(
  doc: unknown,
  pipeline: DomainTransformPipeline<T, R>
): R {
  // Layer 1: MongoDB transformation
  const transformed = transformDocument(doc);
  
  // Layer 2: Schema validation (throws on failure)
  const validated = validateStrict(pipeline.schema, transformed);
  
  // Layer 3: Domain transformation
  return pipeline.transform(validated);
}

/**
 * Complete transformation pipeline
 */
export function transformToDomain<T, R>(
  doc: unknown,
  pipeline: DomainTransformPipeline<T, R>
): R | null {
  return applyDomainTransform(doc, pipeline);
}

/**
 * Complete transformation pipeline with error throwing
 */
export function transformToDomainOrThrow<T, R>(
  doc: unknown,
  pipeline: DomainTransformPipeline<T, R>
): R {
  return applyDomainTransformOrThrow(doc, pipeline);
}

/**
 * Creates a domain transformation pipeline
 */
export function createDomainPipeline<T, R>(
  schema: ZodSchema<T>,
  transform: DomainTransformer<T, R>
): DomainTransformPipeline<T, R> {
  return { schema, transform };
}

// Export compatibility aliases
export const transformToDomainModel = transformToDomain;
export const transformToDomainModelOrThrow = transformToDomainOrThrow; 