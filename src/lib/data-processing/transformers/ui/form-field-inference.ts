import { z } from 'zod';
import type { Field, FieldType } from '@ui-types/form';
import { handleClientError } from '@error/handlers/client';
import { extractFieldSchema } from './schema-utils';

/**
 * Field type inference utilities
 * Separated from validation for clear responsibility separation
 */

/**
 * Infer field type from Zod schema using consistent patterns
 * Uses direct Zod instance checks following transformer patterns
 */
export function inferFieldType(zodType: unknown): FieldType {
  if (!zodType) return 'text';
  
  // Use direct Zod instance checks, consistent with transformer validation
  if (zodType instanceof z.ZodString) return 'text';
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'checkbox';
  if (zodType instanceof z.ZodEnum) return 'select';
  if (zodType instanceof z.ZodArray) return 'multi-select';
  if (zodType instanceof z.ZodDate) return 'date';
  
  // Handle optional and nullable types
  if (zodType instanceof z.ZodOptional) {
    return inferFieldType(zodType._def.innerType);
  }
  if (zodType instanceof z.ZodNullable) {
    return inferFieldType(zodType._def.innerType);
  }
  
  return 'text';
}

/**
 * Check if field is required from Zod schema
 * Follows transformer pattern for schema introspection
 */
export function isFieldRequired(zodType: unknown): boolean {
  if (!zodType) return false;
  
  // Check if it's optional
  if (zodType instanceof z.ZodOptional) return false;
  if (zodType instanceof z.ZodNullable) return false;
  
  // For other types, assume required unless explicitly optional
  return true;
}

/**
 * Format field name into a readable label
 * Simple utility following transformer naming patterns
 */
export function formatFieldLabel(fieldName: string): string {
  return fieldName
    .charAt(0).toUpperCase() + 
    fieldName.slice(1).replace(/([A-Z])/g, ' $1');
}

/**
 * Create field from entity schema using transformer patterns
 * Simplified approach focusing only on current needs (YAGNI)
 */
export function createFieldFromSchema<T extends Record<string, unknown>>(
  fieldName: string,
  entitySchema: z.ZodType<T>,
  overrides: Partial<Field> = {}
): Field {
  try {
    const fieldSchema = extractFieldSchema(entitySchema, fieldName);
    const fieldType = inferFieldType(fieldSchema);
    const isRequired = isFieldRequired(fieldSchema);
    
    return {
      key: fieldName,
      label: formatFieldLabel(fieldName),
      type: fieldType,
      required: isRequired,
      editable: true,
      disabled: false,
      hidden: false,
      readOnly: false,
      // Apply any overrides
      ...overrides,
    };
  } catch (error) {
    handleClientError(error, 'createFieldFromSchema');
    // Return a basic field configuration as fallback
    return {
      key: fieldName,
      label: formatFieldLabel(fieldName),
      type: 'text',
      required: false,
      editable: true,
      disabled: false,
      hidden: false,
      readOnly: false,
      ...overrides,
    };
  }
}

/**
 * Create multiple fields from schema
 * Batch field creation using consistent error handling
 */
export function createFieldsFromSchema<T extends Record<string, unknown>>(
  entitySchema: z.ZodType<T>,
  fieldNames: string[],
  overridesMap: Record<string, Partial<Field>> = {}
): Field[] {
  try {
    return fieldNames.map(fieldName => 
      createFieldFromSchema(
        fieldName, 
        entitySchema, 
        overridesMap[fieldName] || {}
      )
    );
  } catch (error) {
    handleClientError(error, 'createFieldsFromSchema');
    return [];
  }
}
