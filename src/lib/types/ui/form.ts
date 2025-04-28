import { z } from "zod";

/**
 * Base form field configuration
 */
export interface FieldBase {
  /** Field identifier - using 'name' for backward compatibility */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: string;
  /** Whether the field is required */
  required: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is hidden */
  hidden?: boolean;
}

/**
 * Generic field configuration with type safety
 */
export interface Field<T = unknown> extends FieldBase {
  /** Field name - typed to match object keys */
  name: keyof T & string;
  /** Field type */
  type: "text" | "email" | "number" | "password" | "select" | "multi-select" | "checkbox" | "date" | "datetime" | "reference";
  /** Available options for select fields */
  options?: Array<{ value: string; label: string }>;
  /** Default value */
  defaultValue?: unknown;
  /** Whether the field can be edited */
  editable?: boolean;
  /** Reference to a schema for validation */
  schemaName?: z.ZodTypeAny;
  /** Input HTML type when applicable */
  inputType?: string;
}

/**
 * Field override configuration
 */
export interface FieldOverride {
  /** Override field label */
  label?: string;
  /** Override help text */
  helpText?: string;
  /** Override placeholder */
  placeholder?: string;
  /** Override disabled state */
  disabled?: boolean;
  /** Override hidden state */
  hidden?: boolean;
  /** Override required state */
  required?: boolean;
  /** Override default value */
  defaultValue?: unknown;
  /** Override options for select fields */
  options?: Array<{ label: string; value: string }>;
  /** Function to fetch options dynamically */
  fetcher?: () => Promise<Array<{ label: string; value: string }>>;
  /** Override multiple selection */
  multiple?: boolean;
  /** Show field only in modal */
  modalOnly?: boolean;
  /** Show field only on desktop */
  desktopOnly?: boolean;
  /** Show field only on mobile */
  mobileOnly?: boolean;
  /** Override field type */
  type?: 'text' | 'select' | 'reference' | 'checkbox' | 'email' | 'number' | 'multi-select' | 'date' | 'datetime' | 'password';
  /** Override reference URL */
  url?: string;
}

/**
 * Map of field overrides by field name
 */
export type FieldOverrideMap<T = unknown> = {
  [K in keyof T]?: FieldOverride;
};

/**
 * Form-level override configuration
 */
export interface FormOverride<T = unknown> {
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Fields to include (in order) */
  fields?: Array<keyof T>;
  /** Fields to hide */
  hiddenFields?: Array<keyof T>;
  /** Fields to make required */
  requiredFields?: Array<keyof T>;
  /** Fields to make optional */
  optionalFields?: Array<keyof T>;
  /** Default values */
  defaultValues?: Partial<T>;
}

// Type aliases for backward compatibility with typed generics
export type TextField<T = unknown> = Field<T> & { type: "text" | "email" | "number" | "password" };
export type SelectField<T = unknown> = Field<T> & { type: "select" | "multi-select" };
export type CheckboxField<T = unknown> = Field<T> & { type: "checkbox" };
export type ReferenceField<T = unknown> = Field<T> & { type: "reference", url: string };
export type DateField<T = unknown> = Field<T> & { type: "date" | "datetime" };

// Import types from the new location but don't re-export
// to avoid conflicts with types defined in this file
import './forms';