import { z } from 'zod';
import { handleClientError } from '@error/handlers/client';

/**
 * Extract field names from a Zod schema using the shape property
 * Consistent approach for all schema field extraction operations
 */
export function extractSchemaFields<T>(schema: z.ZodSchema<T>): string[] {
  try {
    const shape = (schema as { shape?: Record<string, z.ZodType> }).shape;
    return shape ? Object.keys(shape) : [];
  } catch (error) {
    handleClientError(error, 'extractSchemaFields');
    return [];
  }
}

/**
 * Get field schema from entity schema
 * Safely extracts field information with error handling
 */
export function extractFieldSchema<T>(
  entitySchema: z.ZodSchema<T>,
  fieldName: string
): z.ZodType | null {
  try {
    const shape = (entitySchema as { shape?: Record<string, z.ZodType> }).shape;
    return shape?.[fieldName] || null;
  } catch (error) {
    handleClientError(error, 'extractFieldSchema');
    return null;
  }
} 