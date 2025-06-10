import { z } from 'zod';
import type { Field } from '@ui-types/form';
import { extractSchemaFields, extractFieldSchema } from '@/lib/data-processing/transformers/ui/schema-utils';
import { inferFieldType } from '@/lib/data-processing/transformers/ui/form-field-inference';
export type FormMode = 'create' | 'edit';

/**
 * Check if a Zod type represents an email field
 */
function isEmailField(zodType: z.ZodTypeAny, key: string): boolean {
  return key.toLowerCase().includes('email') && 
         (zodType instanceof z.ZodString || 
          (zodType instanceof z.ZodOptional && zodType.unwrap() instanceof z.ZodString));
}

/**
 * Schema-aware field builder factory
 */
export function createSchemaAwareFieldBuilder<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) {
  // Get all valid schema keys using shared utility
  const schemaKeys = extractSchemaFields(schema);
  
  /**
   * Validate that field key exists in schema
   */
  function validateKey(key: string): void {
    if (!schemaKeys.includes(key)) {
      throw new Error(`Field key "${key}" does not exist in schema. Valid keys: ${schemaKeys.join(', ')}`);
    }
  }
  
  /**
   * Get field metadata from schema
   */
  function getFieldMetadata(key: string) {
    validateKey(key);
    const fieldSchema = extractFieldSchema(schema, key);
    
    if (!fieldSchema) {
      throw new Error(`Could not extract schema for field "${key}"`);
    }
    
    return {
      isRequired: !fieldSchema.isOptional(),
      inferredType: inferFieldType(fieldSchema),
      isEmail: isEmailField(fieldSchema, key),
      zodType: fieldSchema
    };
  }
  
  /**
   * Create text field with schema validation
   */
  const createTextField = (
    key: string,
    label: string,
    required?: boolean,
    editable = true,
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    
    return {
      key,
      label,
      type: metadata.isEmail ? 'email' : 'text',
      required: required ?? metadata.isRequired,
      editable,
      disabled: false,
      hidden: false,
      readOnly: false,
      ...(helpText && { helpText })
    };
  };
  
  /**
   * Create email field with schema validation and mode awareness
   */
  const createEmailField = (
    key: string,
    label = 'Email',
    mode: FormMode = 'create',
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    
    if (!metadata.isEmail && !key.toLowerCase().includes('email')) {
      console.warn(`Field "${key}" may not be an email field. Consider using createTextField instead.`);
    }
    
    return {
      key,
      label,
      type: 'email',
      required: metadata.isRequired,
      editable: mode === 'create',
      disabled: false,
      hidden: false,
      readOnly: false,
      helpText: helpText || (mode === 'create' 
        ? 'Enter email address'
        : 'Email synced from system and cannot be edited')
    };
  };
  
  /**
   * Create select field with enum validation
   */
  const createSelectField = (
    key: string,
    label: string,
    options: Array<{ value: string; label: string; disabled?: boolean }>,
    required?: boolean,
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    
    return {
      key,
      label,
      type: 'select',
      options: options.map(opt => ({ ...opt, disabled: opt.disabled ?? false })),
      required: required ?? metadata.isRequired,
      editable: true,
      disabled: false,
      hidden: false,
      readOnly: false,
      ...(helpText && { helpText })
    };
  };
  
  /**
   * Create multi-select field with array validation
   */
  const createMultiSelectField = (
    key: string,
    label: string,
    options: Array<{ value: string; label: string; disabled?: boolean }>,
    required?: boolean,
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    
    return {
      key,
      label,
      type: 'multi-select',
      options: options.map(opt => ({ ...opt, disabled: opt.disabled ?? false })),
      required: required ?? metadata.isRequired,
      editable: true,
      disabled: false,
      hidden: false,
      readOnly: false,
      ...(helpText && { helpText })
    };
  };
  
  /**
   * Create enum field with automatic option generation
   */
  const createEnumField = (
    key: string,
    label: string,
    required?: boolean,
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    const fieldSchema = metadata.zodType;
    
    // Handle enum fields
    if (fieldSchema instanceof z.ZodEnum) {
      const options = fieldSchema.options.map((value: string) => ({
        value,
        label: value,
        disabled: false
      }));
      
      return {
        key,
        label,
        type: 'select',
        options,
        required: required ?? metadata.isRequired,
        editable: true,
        disabled: false,
        hidden: false,
        readOnly: false,
        ...(helpText && { helpText })
      };
    }
    
    // Handle array of enums
    if (fieldSchema instanceof z.ZodArray && fieldSchema.element instanceof z.ZodEnum) {
      const enumSchema = fieldSchema.element as z.ZodEnum<[string, ...string[]]>;
      const options = enumSchema.options.map((value: string) => ({
        value,
        label: value,
        disabled: false
      }));
      
      return {
        key,
        label,
        type: 'multi-select',
        options,
        required: required ?? metadata.isRequired,
        editable: true,
        disabled: false,
        hidden: false,
        readOnly: false,
        ...(helpText && { helpText })
      };
    }
    
    throw new Error(`Field "${key}" is not an enum type. Use createSelectField or createMultiSelectField instead.`);
  };
  
  /**
   * Create reference field (for foreign key relationships)
   */
  const createReferenceField = (
    key: string,
    label: string,
    url: string,
    multiple = false,
    required?: boolean,
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    
    return {
      key,
      label,
      type: 'reference',
      url,
      multiple,
      required: required ?? metadata.isRequired,
      editable: true,
      disabled: false,
      hidden: false,
      readOnly: false,
      ...(helpText && { helpText })
    };
  };
  
  /**
   * Create date field with date type validation
   */
  const createDateField = (
    key: string,
    label: string,
    required?: boolean,
    helpText?: string
  ): Field => {
    const metadata = getFieldMetadata(key);
    
    return {
      key,
      label,
      type: 'date',
      required: required ?? metadata.isRequired,
      editable: true,
      disabled: false,
      hidden: false,
      readOnly: false,
      ...(helpText && { helpText })
    };
  };
  
  /**
   * Auto-generate field configuration from schema
   */
  const generateAutoFields = (
    labels: Record<string, string>,
    excludeFields: string[] = []
  ): Field[] => {
    return schemaKeys
      .filter(key => !excludeFields.includes(key))
      .map(key => {
        const metadata = getFieldMetadata(key);
        const label = labels[key] || key;
        
        return {
          key,
          label,
          type: metadata.inferredType,
          required: metadata.isRequired,
          editable: true,
          disabled: false,
          hidden: false,
          readOnly: false
        };
      });
  };
  
  /**
   * Validate field configuration against schema
   */
  const validateFields = (fields: Field[]): Field[] => {
    const invalidFields = fields.filter(field => {
      try {
        validateKey(field.key);
        return false;
      } catch {
        return true;
      }
    });
    
    if (invalidFields.length > 0) {
      throw new Error(
        `Invalid field keys found: ${invalidFields.map(f => f.key).join(', ')}. ` +
        `Valid keys: ${schemaKeys.join(', ')}`
      );
    }
    
    return fields;
  };
  
  return {
    // Core builders
    createTextField,
    createEmailField,
    createSelectField,
    createMultiSelectField,
    createEnumField,
    createReferenceField,
    createDateField,
    
    // Utilities
    generateAutoFields,
    validateFields,
    getFieldMetadata,
    schemaKeys
  };
}

/**
 * Create mode-aware configuration factory
 */
export function createModeAwareConfig<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  configFactory: (builder: ReturnType<typeof createSchemaAwareFieldBuilder<T>>, mode: FormMode) => Field[]
) {
  const builder = createSchemaAwareFieldBuilder(schema);
  
  return {
    create: () => builder.validateFields(configFactory(builder, 'create')),
    edit: () => builder.validateFields(configFactory(builder, 'edit')),
    builder
  };
} 