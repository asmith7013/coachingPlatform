import { z, ZodTypeAny, ZodObject, ZodRawShape } from 'zod';
import { FieldType, FormUIHints, FormFieldConfig } from '@tanstack-form/types/field-types';

/**
 * Schema-Derived Field Factory
 * Automatically generates field configurations from Zod schemas
 * Follows the createCrudHooks factory pattern for consistency
 */


/**
 * Infer field type from Zod schema type
 * Follows YAGNI principle - only common type mappings
 */
export function inferFieldType(zodType: ZodTypeAny): FieldType {
  // Handle optional types
  if (zodType instanceof z.ZodOptional) {
    return inferFieldType(zodType._def.innerType);
  }
  
  // Handle nullable types
  if (zodType instanceof z.ZodNullable) {
    return inferFieldType(zodType._def.innerType);
  }
  
  // Handle default types
  if (zodType instanceof z.ZodDefault) {
    return inferFieldType(zodType._def.innerType);
  }

  // String types
  if (zodType instanceof z.ZodString) {
    // Check for email validation
    if (zodType._def.checks?.some(check => check.kind === 'email')) {
      return 'email';
    }
    return 'text';
  }
  
  // Number types
  if (zodType instanceof z.ZodNumber) {
    return 'number';
  }
  
  // Boolean types
  if (zodType instanceof z.ZodBoolean) {
    return 'checkbox';
  }
  
  // Enum types
  if (zodType instanceof z.ZodEnum || zodType instanceof z.ZodNativeEnum) {
    return 'select';
  }
  
  // Date types
  if (zodType instanceof z.ZodDate) {
    return 'date';
  }
  
  // Array types (for multi-select)
  if (zodType instanceof z.ZodArray) {
    const elementType = inferFieldType(zodType._def.type);
    return elementType === 'select' ? 'select' : 'textarea';
  }
  
  // Default to text for unknown types
  return 'text';
}

/**
 * Extract field requirement (required/optional) from Zod schema
 */
function isFieldRequired(zodType: ZodTypeAny): boolean {
  return !(zodType instanceof z.ZodOptional || zodType instanceof z.ZodNullable);
}

/**
 * Generate field label from field name
 * Converts camelCase to Title Case
 */
function generateLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Create form fields from Zod schema with UI hints
 * Main factory function following createCrudHooks pattern
 */
export function createFormFields(
  schema: ZodObject<ZodRawShape>,
  uiHints: FormUIHints
): FormFieldConfig[] {
  const schemaShape = schema.shape;
  const fields: FormFieldConfig[] = [];
  
  // Process fields in the order specified by UI hints
  for (const fieldName of uiHints.fieldOrder) {
    const zodType = schemaShape[fieldName as string];
    if (!zodType) {
      console.warn(`Field "${String(fieldName)}" not found in schema`);
      continue;
    }
    
    // Skip hidden fields
    if (uiHints.hidden?.[fieldName]) {
      continue;
    }
    
    // Infer or use explicit field type
    const inferredType = inferFieldType(zodType);
    const fieldType = uiHints.fieldTypes?.[fieldName] || inferredType;
    
    // Generate field configuration
    const field: FormFieldConfig = {
      name: String(fieldName),
      label: uiHints.labels[fieldName] || generateLabel(String(fieldName)),
      type: fieldType,
      required: isFieldRequired(zodType),
      disabled: uiHints.disabled?.[fieldName],
      placeholder: uiHints.placeholders?.[fieldName],
      options: uiHints.options?.[fieldName],
      url: uiHints.urls?.[fieldName]
    };
    
    // Handle array types for multi-select
    if (zodType instanceof z.ZodArray && fieldType === 'select') {
      field.multiple = true;
    }
    
    fields.push(field);
  }
  
  return fields;
}

/**
 * Convenience function for simple field generation
 * When you just need basic fields without complex UI hints
 */
export function createSimpleFields(
  schema: ZodObject<ZodRawShape>,
  fieldOrder: string[],
  labels?: Record<string, string>
): FormFieldConfig[] {
  return createFormFields(schema, {
    fieldOrder,
    labels: labels || {}
  });
} 