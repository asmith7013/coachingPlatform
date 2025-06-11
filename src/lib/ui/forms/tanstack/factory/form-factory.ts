import { useForm } from '@tanstack/react-form';
import type { ZodSchema } from 'zod';
import { FormFactoryConfig, FormFieldConfig } from '@/lib/ui/forms/tanstack/types/field-types';
/**
 * Creates form hooks that follow established domain hook patterns
 * Consistent with useSchools API structure
 * Uses TanStack Form v1's native Standard Schema support (no adapter needed)
 * 
 * @param config Base configuration for the form
 * @returns Object with useResourceForm hook and utilities
 */
export function createFormHooks<T extends Record<string, unknown>>(
  config: FormFactoryConfig<T>
) {
  
  /**
   * Main form hook - follows useSchoolManager pattern
   * Returns TanStack Form API instance with Standard Schema validation
   */
  function useResourceForm(overrides?: Partial<FormFactoryConfig<T>>) {
    const finalConfig = { ...config, ...overrides };
    
    return useForm({
      defaultValues: (finalConfig.defaultValues || {}) as Partial<T>,
      validators: {
        onChange: finalConfig.schema, // Direct schema usage - no adapter needed!
        onChangeAsyncDebounceMs: 500,
        onBlur: finalConfig.schema,
        onSubmit: finalConfig.schema,
      },
      onSubmit: async ({ value }) => {
        await finalConfig.onSubmit(value as T);
      },
    });
  }
  
  /**
   * Field utility hook - provides field configuration lookup
   * Follows established pattern of single-purpose utilities
   */
  function useFormField<K extends keyof T>(name: K) {
    const fieldConfig = config.fields.find(f => f.name === String(name));
    return { fieldConfig };
  }
  
  return {
    useResourceForm,
    useFormField,
    schema: config.schema,
    fields: config.fields
  };
}

/**
 * High-level form factory function
 * Follows established pattern from CRUD factory usage
 * Uses Standard Schema for direct Zod integration
 * 
 * @param schema Zod schema for validation
 * @param fields Field configuration array
 * @returns Form hooks factory
 */
export function createResourceForm<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  fields: FormFieldConfig[]
) {
  const hooks = createFormHooks({
    schema,
    fields,
    onSubmit: () => {}, // Will be overridden
    mode: 'create'
  });
  
  return {
    ...hooks,
    useResourceForm: (config: Pick<FormFactoryConfig<T>, 'onSubmit'> & Partial<FormFactoryConfig<T>>) => 
      hooks.useResourceForm({
        ...config,
        defaultValues: config.defaultValues,
        mode: config.mode || 'create'
      })
  };
} 