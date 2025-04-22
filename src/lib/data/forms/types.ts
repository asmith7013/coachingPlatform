import { z } from "zod";

export interface Field<T> {
  key: keyof T;
  label: string;
  type: "text" | "email" | "select" | "multi-select";
  inputType: string;
  options?: string[];
  required: boolean;
  editable: boolean;
  placeholder: string;
  schemaName?: z.ZodTypeAny;
}

// Common type for form field override definitions
export interface FieldOverride {
  label?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  hidden?: boolean;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  fetcher?: () => Promise<Array<{ label: string; value: string }>>;
  multiple?: boolean;
  modalOnly?: boolean;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
  type?: 'text' | 'select' | 'reference' | 'checkbox' | 'email' | 'number' | 'multi-select';
  url?: string; // used if type === 'reference'
}

export type FieldOverrideMap<T> = {
  [K in keyof T]?: FieldOverride;
};

// Type for form-level overrides
export interface FormOverride<T> {
  title?: string;
  description?: string;
  submitLabel?: string;
  cancelLabel?: string;
  fields?: Array<string>;
  hiddenFields?: Array<string>;
  requiredFields?: Array<string>;
  optionalFields?: Array<string>;
  defaultValues?: Partial<T>;
} 