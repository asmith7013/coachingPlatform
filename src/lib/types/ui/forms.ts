/**
 * Common form field types and interfaces
 */

/**
 * Base field configuration interface
 */
export interface FieldBase {
  /** Field identifier */
  key: string;
  /** Display label */
  label: string;
  /** Field type (text, select, etc) */
  type: string;
  /** Whether the field is required */
  required: boolean;
  /** Field placeholder text */
  placeholder?: string;
  /** Help text to display with the field */
  helpText?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is read-only */
  readonly?: boolean;
  /** Whether the field is editable */
  editable?: boolean;
  /** Default value for the field */
  defaultValue?: unknown;
  /** Validation rules */
  validation?: {
    /** Minimum value/length */
    min?: number;
    /** Maximum value/length */
    max?: number;
    /** Regular expression pattern */
    pattern?: string;
    /** Custom validation function */
    validate?: (value: unknown) => boolean | string;
  };
}

/**
 * Generic field configuration with strongly typed name property
 */
export interface Field<T = unknown> extends FieldBase {
  /** Field name - must be a key of T */
  key: keyof T & string;
  /** Options for select fields */
  options?: Array<{
    /** Option value */
    value: string;
    /** Option display label */
    label: string;
    /** Whether the option is disabled */
    disabled?: boolean;
  }>;
  /** Input type attribute for text fields */
  inputType?: string;
  /** Schema reference for validation */
  schemaName?: unknown;
  /** Fields to allow legacy form components */
  name?: keyof T & string;
}

/**
 * Field override configuration
 */
export interface FieldOverride extends Partial<FieldBase> {
  /** Whether to hide the field */
  hidden?: boolean;
  /** URL for reference fields */
  url?: string;
  /** Whether to allow multiple selections */
  multiple?: boolean;
  /** Function to fetch options dynamically */
  fetcher?: () => Promise<Array<{ label: string; value: string }>>;
  /** Whether to show only in modal */
  modalOnly?: boolean;
  /** Whether to show only on desktop */
  desktopOnly?: boolean;
  /** Whether to show only on mobile */
  mobileOnly?: boolean;
}

/**
 * Map of field overrides by field key
 * Allows both keys from the data type T and special fields like 'title'
 */
export type FieldOverrideMap<T = Record<string, unknown>> = {
  [K in keyof T]?: FieldOverride;
} & {
  /** Form title field override (special case) */
  title?: FieldOverride;
  /** Extra fields not explicitly in the model */
  [key: string]: FieldOverride | undefined;
};

/**
 * Common field types used in the application
 */
export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
  DATE = 'date',
  TIME = 'time',
  EMAIL = 'email',
  PASSWORD = 'password',
  TEL = 'tel',
  URL = 'url',
  REFERENCE = 'reference',
  FILE = 'file',
  HIDDEN = 'hidden',
  CUSTOM = 'custom'
} 