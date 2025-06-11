import type { ZodSchema } from 'zod';
import { createStandardValidation } from '../factory/validation-factory';
import { FormApi } from '@tanstack-form/types/field-types';

/**
 * Hook for accessing field-specific information and operations
 * Provides a clean API for field-level form management
 * 
 * @example
 * ```tsx
 * function EmailField({ form }: { form: FormApi }) {
 *   const { field, hasError, isValidating } = useFormField(form, 'email');
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={field.state.value}
 *         disabled={isValidating}
 *       />
 *       {hasError && <span>{field.state.meta.errors?.[0]}</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFormField(form: FormApi, fieldName: string) {
  const field = form.getFieldInfo(fieldName);
  
  return {
    /** Raw field information from TanStack Form */
    field,
    
    /** Current field value */
    value: field.state.value,
    
    /** Whether field has validation errors */
    hasError: Boolean(field.state.meta.errors?.length),
    
    /** First error message (most common use case) */
    errorMessage: field.state.meta.errors?.[0],
    
    /** All error messages for the field */
    errors: field.state.meta.errors || [],
    
    /** Whether field is currently being validated */
    isValidating: Boolean(field.state.meta.isValidating),
    
    /** Whether field value has changed from default */
    isDirty: Boolean(field.state.meta.isDirty),
    
    /** Whether field has been interacted with */
    isTouched: Boolean(field.state.meta.isTouched),
  };
}

/**
 * Hook for form submission handling with TanStack Form
 * Provides a clean API for submit operations
 * 
 * @example
 * ```tsx
 * function SubmitButton({ form, onSubmit }: { form: FormApi, onSubmit: Function }) {
 *   const { handleSubmit, isSubmitting, canSubmit } = useFormSubmit(form, onSubmit);
 *   
 *   return (
 *     <button 
 *       onClick={handleSubmit}
 *       disabled={!canSubmit}
 *     >
 *       {isSubmitting ? 'Saving...' : 'Save'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useFormSubmit(form: FormApi, onSubmit?: (values: Record<string, unknown>) => void | Promise<void>) {
  const handleSubmit = () => {
    if (onSubmit) {
      // If custom submit handler provided, use it
      onSubmit(form.state.values);
    } else {
      // Otherwise use form's built-in submit
      form.handleSubmit();
    }
  };

  return {
    /** Submit handler function */
    handleSubmit,
    
    /** Whether form is currently submitting */
    isSubmitting: form.state.isSubmitting,
    
    /** Whether form can be submitted (no errors) */
    canSubmit: form.state.canSubmit,
    
    /** Form-level errors */
    formErrors: form.state.errors,
    
    /** Current form values */
    values: form.state.values,
  };
}

/**
 * Hook for working with Zod schema validation in TanStack Form
 * Provides utilities for schema-based validation setup
 * 
 * @example
 * ```tsx
 * function MyForm() {
 *   const { validationConfig } = useFormValidation(MySchema);
 *   
 *   const form = useForm({
 *     validators: validationConfig,
 *     onSubmit: async ({ value }) => {
 *       // Form is automatically validated by schema
 *     }
 *   });
 * }
 * ```
 */
export function useFormValidation<T extends Record<string, unknown>>(schema: ZodSchema<T>) {
  return {
    /** Standard validation configuration for TanStack Form */
    validationConfig: createStandardValidation(schema),
    
    /** Original schema for reference */
    schema,
  };
} 