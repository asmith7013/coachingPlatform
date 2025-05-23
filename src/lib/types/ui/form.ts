import type {
  FieldType,
  SelectOption,
  FieldConfig as ZodFieldConfig,
  FieldOverride as ZodFieldOverride,
  FormConfig as ZodFormConfig,
} from '@zod-schema/core-types/form';

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

// === ENHANCED GENERIC INTERFACES ===

/**
 * Generic field configuration with type safety
 * Extends Zod schema with generic typing
 */
export interface Field<T = unknown> extends Omit<ZodFieldConfig, 'name'> {
  /** Field name - typed to match object keys */
  name: keyof T & string;
  
  /** Legacy support during transition */
  key?: keyof T & string;
  
  /** Schema reference for advanced validation */
  schemaName?: unknown;
}

/**
 * Field override map with proper typing
 */
export type FieldOverrideMap<T = unknown> = {
  [K in keyof T]?: ZodFieldOverride;
} & {
  /** Special form-level overrides */
  title?: ZodFieldOverride;
  [key: string]: ZodFieldOverride | undefined;
};

/**
 * Form configuration with generic typing
 */
export interface FormConfiguration<T = unknown> extends Omit<ZodFormConfig, 'fields' | 'hiddenFields' | 'requiredFields' | 'optionalFields' | 'defaultValues'> {
  /** Fields to include (typed to entity) */
  fields?: Array<keyof T & string>;
  /** Fields to hide (typed to entity) */
  hiddenFields?: Array<keyof T & string>;
  /** Fields to make required (typed to entity) */
  requiredFields?: Array<keyof T & string>;
  /** Fields to make optional (typed to entity) */
  optionalFields?: Array<keyof T & string>;
  /** Default values (typed to entity) */
  defaultValues?: Partial<T>;
}

// === TYPE RE-EXPORTS ===
export type { FieldType, SelectOption };
export type { ZodFieldConfig as FieldConfig };
export type { ZodFieldOverride as FieldOverride };
export type { ZodFormConfig as FormConfig };

// === LEGACY SUPPORT ===
/** @deprecated Use Field<T> instead */
export type TextField<T = unknown> = Field<T> & { type: "text" | "email" | "number" | "password" };
/** @deprecated Use Field<T> instead */
export type SelectField<T = unknown> = Field<T> & { type: "select" | "multi-select" };
/** @deprecated Use Field<T> instead */
export type CheckboxField<T = unknown> = Field<T> & { type: "checkbox" };
/** @deprecated Use Field<T> instead */
export type ReferenceField<T = unknown> = Field<T> & { type: "reference"; url: string };
/** @deprecated Use Field<T> instead */
export type DateField<T = unknown> = Field<T> & { type: "date" | "datetime" };

// === UTILITY TYPES ===

/**
 * Extract field names from a form configuration
 */
export type FormFieldNames<T> = Array<keyof T & string>;

/**
 * Create a field configuration type for a specific entity
 */
export type EntityFieldConfig<T> = Field<T>[];

/**
 * Create a field override map type for a specific entity
 */
export type EntityFieldOverrides<T> = FieldOverrideMap<T>;

// Import types from the new location but don't re-export
// to avoid conflicts with types defined in this file
import './forms';