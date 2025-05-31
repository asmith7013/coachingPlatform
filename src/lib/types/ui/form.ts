// Re-export everything from Zod schema
export * from '@zod-schema/core-types/form';

/**
 * Form mode type for create/edit forms
 */
export type FormMode = 'create' | 'edit';

/**
 * Form submission handler type
 */
export type FormSubmitHandler<T extends Record<string, unknown>> = (
  data: T
) => void | Promise<void>;

/**
 * Form validation result
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  fieldErrors?: Record<keyof T, string>;
}

/**
 * Form state management
 */
export interface FormState<T extends Record<string, unknown>> {
  data: Partial<T>;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

/**
 * Form hook return type
 */
export interface UseFormReturn<T extends Record<string, unknown>> {
  state: FormState<T>;
  updateField: (key: keyof T, value: T[keyof T]) => void;
  updateErrors: (errors: Record<keyof T, string>) => void;
  submit: () => Promise<ValidationResult<T>>;
  reset: (initialData?: Partial<T>) => void;
  validate: () => ValidationResult<T>;
}

/**
 * Field component props interface
 */
export interface FieldComponentProps<T = unknown> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

/**
 * Utility type helpers for form fields
 */
export type FieldValue<T extends Record<string, unknown>, K extends keyof T> = T[K];
export type FieldErrors<T extends Record<string, unknown>> = Partial<Record<keyof T, string>>;

/**
 * Helper to validate field at runtime
 */

