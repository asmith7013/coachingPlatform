// import type { ZodSchema } from 'zod';
// import type { ReactNode } from 'react';
import type { AnyFieldApi } from "@tanstack/react-form";

/**
 * Core field types supported by the form system
 */
export type FieldApi = AnyFieldApi;
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "textarea"
  | "checkbox"
  | "switch"
  | "reference"
  | "date"
  | "datetime"
  | "file";

export interface BaseFieldProps {
  field: FieldApi;
  className?: string;
}
/**
 * Generic field configuration interface
 */
export interface Field<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  name: keyof T;
  label: string;
  type: FieldType;
  disabled?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  multiple?: boolean;
  // Reference field specific props
  url?: string;
  entityType?: string;
  search?: string;
}

// export interface Field<T extends Record<string, unknown> = Record<string, unknown>> {
//   name: keyof T;
//   label: string;
//   type: FieldType;
//   disabled?: boolean;
//   placeholder?: string;
//   options?: Array<{ value: string; label: string }>;
//   multiple?: boolean;
//   // Reference field specific props
//   url?: string;
//   entityType?: string;
//   search?: string;
// }
// /**
//  * ✅ Correct TanStack Form API - useForm returns an object with Field and Subscribe
//  */
// export type FormApi = ReturnType<typeof import('@tanstack/react-form').useForm>;

// /**
//  * Base props for form components - use AnyFormApi for maximum compatibility
//  */
// export interface BaseFieldProps {
//   form: FormApi;
//   field: AnyFieldApi;
//   className?: string;
// }

// export interface FieldWrapperProps extends BaseFieldProps {
//   label: string;
//   required?: boolean;
//   children: ReactNode;
// }

// /**
//  * UI hints for generating fields from schemas
//  * Type-safe with generic T
//  */
// export interface FormUIHints<T extends Record<string, unknown> = Record<string, unknown>> {
//   fieldOrder: (keyof T)[];
//   labels: Partial<Record<keyof T, string>>;
//   placeholders?: Partial<Record<keyof T, string>>;
//   fieldTypes?: Partial<Record<keyof T, FieldType>>;
//   urls?: Partial<Record<keyof T, string>>;
//   options?: Partial<Record<keyof T, Array<{ value: string; label: string }>>>;
//   disabled?: Partial<Record<keyof T, boolean>>;
//   hidden?: Partial<Record<keyof T, boolean>>;
// }

// /**
//  * Main form component props - uses AnyFormApi for universal compatibility
//  */
// export interface TanStackFormProps<T extends Record<string, unknown> = Record<string, unknown>> {
//   form: FormApi;
//   fields: Field<T>[];
//   title: string;
//   description?: string;
//   submitLabel?: string;
//   cancelLabel?: string;
//   onCancel?: () => void;
//   loading?: boolean;
//   children?: ReactNode;
//   className?: string;
// }

// /**
//  * Field renderer props - uses AnyFieldApi for universal compatibility
//  */
// export interface TanStackFieldProps<T extends Record<string, unknown> = Record<string, unknown>> {
//   field: AnyFieldApi;
//   config: Field<T>;
//   fieldProps?: Record<string, unknown>;
// }

// /**
//  * Form factory configuration
//  */
// export interface FormFactoryConfig<T extends Record<string, unknown>> {
//   schema: ZodSchema<T>;
//   fields: Field<T>[];
//   defaultValues?: Partial<T>;
//   onSubmit: (data: T) => void | Promise<void>;
// }

// /**
//  * Backward compatibility aliases
//  */
// export type FieldApi = AnyFieldApi;
// export type FieldName<T> = keyof T & string;

// // Legacy alias for backward compatibility during migration
// export type FormFieldConfig = Field<Record<string, unknown>>;
