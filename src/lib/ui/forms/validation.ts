import { z } from 'zod';
import { 
  FieldConfigZodSchema, 
  FieldOverrideZodSchema,
  FormConfigZodSchema 
} from '@zod-schema/core-types/form';
import type { Field, FieldOverrideMap, FormConfiguration } from '@ui-types/form';

/**
 * Validate field configuration against Zod schema
 */
export function validateFieldConfig<T>(field: Field<T>): boolean {
  const result = FieldConfigZodSchema.safeParse(field);
  if (!result.success) {
    console.warn(`Invalid field config for ${String(field.name)}:`, result.error.issues);
    return false;
  }
  return true;
}

/**
 * Validate field override map
 */
export function validateFieldOverrides<T>(overrides: FieldOverrideMap<T>): boolean {
  for (const [fieldName, override] of Object.entries(overrides)) {
    if (override) {
      const result = FieldOverrideZodSchema.safeParse(override);
      if (!result.success) {
        console.warn(`Invalid field override for ${fieldName}:`, result.error.issues);
        return false;
      }
    }
  }
  return true;
}

/**
 * Validate form configuration
 */
export function validateFormConfig<T>(config: FormConfiguration<T>): boolean {
  const result = FormConfigZodSchema.safeParse(config);
  if (!result.success) {
    console.warn('Invalid form configuration:', result.error.issues);
    return false;
  }
  return true;
}

/**
 * Create field from entity schema (simplified)
 */
export function createFieldFromSchema<T>(
  fieldName: keyof T & string,
  entitySchema: z.ZodType<T>,
  overrides: Partial<Field<T>> = {}
): Field<T> {
  const fieldSchema = (entitySchema as { shape?: Record<string, z.ZodType> }).shape?.[fieldName];
  const isRequired = fieldSchema && !fieldSchema.isOptional?.();
  
  return {
    name: fieldName,
    label: formatFieldLabel(fieldName),
    type: inferFieldType(fieldSchema),
    required: isRequired || false,
    editable: true,
    hidden: false,
    ...overrides,
  } as Field<T>;
}

/**
 * Format field name into a readable label
 */
function formatFieldLabel(fieldName: string): string {
  return fieldName
    .charAt(0).toUpperCase() + 
    fieldName.slice(1).replace(/([A-Z])/g, ' $1');
}

/**
 * Infer field type from Zod schema (direct Zod usage)
 */
function inferFieldType(zodType: unknown): string {
  if (!zodType) return 'text';
  
  // Use direct Zod instance checks, no wrapper functions
  if (zodType instanceof z.ZodString) return 'text';
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'checkbox';
  if (zodType instanceof z.ZodEnum) return 'select';
  if (zodType instanceof z.ZodArray) return 'multi-select';
  if (zodType instanceof z.ZodDate) return 'date';
  
  return 'text';
}

/**
 * Validate all field configurations in an array
 */
export function validateFieldConfigs<T>(fields: Field<T>[]): boolean {
  return fields.every(field => validateFieldConfig(field));
}