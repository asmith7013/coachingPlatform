import type { ZodSchema } from 'zod';

export type FieldType = 
  | 'text' | 'email' | 'password' | 'number' 
  | 'select' | 'textarea' | 'checkbox' | 'switch' 
  | 'reference' | 'date' | 'datetime';


export interface FormUIHints {
  fieldOrder: string[];
  labels: Record<string, string>;
  placeholders?: Record<string, string>;
  options?: Record<string, Array<{ value: string; label: string }>>;
  disabled?: Record<string, boolean>;
  hidden?: Record<string, boolean>;
  fieldTypes?: Record<string, FieldType>;
  urls?: Record<string, string>; // For reference fields
}

export interface FormFieldConfig {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean; // Derived from schema
    disabled?: boolean;
    hidden?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    multiple?: boolean;
    url?: string; // For reference fields
    defaultValue?: unknown;
}

/**
 * Form factory configuration interface
 * Updated for schema-derived field generation following established patterns
 */
export interface FormFactoryConfig<T extends Record<string, unknown>> {
  /** Zod schema for validation (used directly with Standard Schema) */
  schema: ZodSchema<T>;
  
  /** Field configuration array (generated from schema + UI hints) */
  fields: FormFieldConfig[];
  
  /** Default values for form initialization */
  defaultValues?: Partial<T>;
  
  /** Form submission handler */
  onSubmit: (data: T) => void | Promise<void>;
  
  /** Form mode for conditional behavior */
  mode?: 'create' | 'edit';
}

/**
 * Field section grouping interface
 * For organizing fields into logical sections
 */
export interface FieldSection {
  /** Section title */
  title: string;
  
  /** Section description (optional) */
  description?: string;
  
  /** Fields in this section */
  fields: FormFieldConfig[];
  
  /** Whether section is collapsible */
  collapsible?: boolean;
  
  /** Whether section starts collapsed */
  defaultCollapsed?: boolean;
}

/**
 * Form layout configuration
 * For organizing fields and sections
 */
export interface FormLayout {
  /** Form title */
  title: string;
  
  /** Form description */
  description?: string;
  
  /** Either flat field list or organized sections */
  layout: FormFieldConfig[] | FieldSection[];
  
  /** Submit button text */
  submitLabel?: string;
  
  /** Cancel button text */
  cancelLabel?: string;
}

/**
 * TanStack Form API interface for hooks
 */
export interface FormApi {
    state: {
      isSubmitting: boolean;
      canSubmit: boolean;
      errors: Record<string, string[]>;
      values: Record<string, unknown>;
    };
    getFieldInfo: (name: string) => FieldInfo;
    handleSubmit: () => void;
  }
  
  /**
   * Field information from TanStack Form
   */
export interface FieldInfo {
    state: {
      value: unknown;
      meta: {
        errors?: string[];
        isValidating?: boolean;
        isDirty?: boolean;
        isTouched?: boolean;
      };
    };
    name: string;
  }


/**
 * Type helper for extracting field names from schema
 * Ensures type safety when referencing field names
 */
export type FieldName<T> = keyof T & string;
