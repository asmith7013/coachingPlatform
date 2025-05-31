import { z } from 'zod';
import type { Field, FieldOverrideMap, FormConfiguration } from '@ui-types/form';

// Reuse existing validation utilities from transformers
import { validateSafe } from '@transformers/core/validation';
import { handleClientError } from '@error/handlers/client';

/**
 * Validate field configuration using validateSafe
 * Simplified to use consistent validation approach
 */
export function validateFieldConfig(
  field: Field, 
  schema?: z.ZodSchema<Field>
): boolean {
  if (schema) {
    return validateSafe(schema, field) !== null;
  }
  // Basic validation only - check required properties exist
  return !!(field.key && field.label && field.type);
}

/**
 * Validate field override map using validateSafe
 * Simplified validation approach
 */
export function validateFieldOverrides(
  overrides: FieldOverrideMap,
  schema?: z.ZodSchema<FieldOverrideMap>
): boolean {
  if (schema) {
    return validateSafe(schema, overrides) !== null;
  }
  
  // Basic validation - check all overrides are objects
  return Object.values(overrides).every(override => 
    override && typeof override === 'object'
  );
}

/**
 * Validate form configuration using validateSafe
 * Simplified validation approach
 */
export function validateFormConfig(
  config: FormConfiguration,
  schema?: z.ZodSchema<FormConfiguration>
): boolean {
  if (schema) {
    return validateSafe(schema, config) !== null;
  }
  
  // Basic validation - check required properties
  return !!(config.fields && Array.isArray(config.fields));
}

/**
 * Validate all field configurations in an array
 * Uses the single field validator for consistency
 */
export function validateFieldConfigs(
  fields: Field[],
  fieldSchema?: z.ZodSchema<Field>
): boolean {
  try {
    return fields.every(field => validateFieldConfig(field, fieldSchema));
  } catch (error) {
    handleClientError(error, 'validateFieldConfigs');
    return false;
  }
}

/**
 * Create validation result with consistent error format
 * Follows transformer pattern for result objects
 */
export function createValidationResult<T extends Record<string, unknown>>(
  isValid: boolean,
  data?: T,
  error?: string
): { success: boolean; data?: T; error?: string } {
  return {
    success: isValid,
    data: isValid ? data : undefined,
    error: isValid ? undefined : error
  };
}

/**
 * Batch validation utility for multiple items
 * Consistent with transformer array validation patterns
 */
export function validateBatch<T>(
  items: T[],
  validator: (item: T) => boolean,
  itemName: string = 'item'
): { success: boolean; validCount: number; totalCount: number; errors: string[] } {
  try {
    const errors: string[] = [];
    let validCount = 0;
    
    items.forEach((item, index) => {
      try {
        if (validator(item)) {
          validCount++;
        } else {
          errors.push(`${itemName} ${index + 1}: validation failed`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${itemName} ${index + 1}: ${errorMessage}`);
      }
    });
    
    return {
      success: validCount === items.length,
      validCount,
      totalCount: items.length,
      errors
    };
  } catch (error) {
    const errorMessage = handleClientError(error, 'validateBatch');
    return {
      success: false,
      validCount: 0,
      totalCount: items.length,
      errors: [errorMessage]
    };
  }
}