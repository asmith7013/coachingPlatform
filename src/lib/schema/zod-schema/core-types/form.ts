// src/lib/data-schema/zod-schema/core-types/form.ts
import { z } from "zod";

// === FORM BUILDING BLOCKS ===

export const FieldTypeZodSchema = z.enum([
  'text', 'textarea', 'number', 'password', 'select', 'multi-select', 
  'checkbox', 'switch', 'date', 'datetime', 'email', 'tel', 'url',
  'reference', 'file', 'radio', 'hidden', 'custom'
]);

export const SelectOptionZodSchema = z.object({
  value: z.string().describe("Option value"),
  label: z.string().describe("Option display label"),
  disabled: z.boolean().default(false).optional().describe("Whether option is disabled"),
  group: z.string().optional().describe("Option group"),
});

export const ValidationRulesZodSchema = z.object({
  min: z.number().optional().describe("Minimum value/length"),
  max: z.number().optional().describe("Maximum value/length"),
  pattern: z.string().optional().describe("RegExp pattern"),
  custom: z.function().args(z.unknown()).returns(z.union([z.boolean(), z.string()])).optional()
}).optional().describe("Validation configuration");

// === FIELD SCHEMA ===

export const FieldZodSchema = z.object({
  key: z.string(), // Simplified to string
  label: z.string(),
  type: FieldTypeZodSchema,
  required: z.boolean().default(false).optional(),
  editable: z.boolean().default(true).optional(),
  disabled: z.boolean().default(false).optional(),
  hidden: z.boolean().default(false).optional(),
  readOnly: z.boolean().default(false).optional(),
  
  // Field-specific options
  options: z.array(SelectOptionZodSchema).optional(),
  defaultValue: z.unknown().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  
  // Reference field props
  url: z.string().optional(),
  multiple: z.boolean().optional(),
  
  // Validation and state
  error: z.string().optional(),
  validation: ValidationRulesZodSchema,
  className: z.string().optional(),
  inputType: z.string().optional(),
  
  // Conditional display
  modalOnly: z.boolean().default(false).optional(),
  desktopOnly: z.boolean().default(false).optional(),
  mobileOnly: z.boolean().default(false).optional(),
});

export const FieldOverrideZodSchema = FieldZodSchema.partial();

export const FormConfigurationZodSchema = z.object({
  fields: z.array(FieldZodSchema),
  overrides: z.record(z.string(), FieldOverrideZodSchema).optional(),
  schema: z.any().optional(), // Accept any Zod schema
  title: z.string().optional(),
  description: z.string().optional(),
  mode: z.enum(['create', 'edit']).optional(),
  submitLabel: z.string().default("Save").optional(),
  cancelLabel: z.string().default("Cancel").optional(),
  hiddenFields: z.array(z.string()).optional(),
  requiredFields: z.array(z.string()).optional(),
  optionalFields: z.array(z.string()).optional(),
  defaultValues: z.record(z.unknown()).optional(),
});

// === COMPONENT PROP SCHEMAS ===

export const FieldComponentPropsZodSchema = z.object({
  label: z.string(),
  value: z.unknown(),
  onChange: z.function().args(z.unknown()).returns(z.void()),
  disabled: z.boolean().optional(),
  placeholder: z.string().optional(),
  className: z.string().optional(),
  error: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().optional(),
});

export const ReferenceFieldPropsZodSchema = FieldComponentPropsZodSchema.extend({
  url: z.string(),
  multiple: z.boolean().optional(),
});

export const SelectFieldPropsZodSchema = FieldComponentPropsZodSchema.extend({
  options: z.array(SelectOptionZodSchema),
  multiple: z.boolean().optional(),
});

// === FORM STATE SCHEMAS ===

export const ValidationResultZodSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  errors: z.record(z.string()).optional(),
  fieldErrors: z.record(z.string()).optional(),
});

export const FormStateZodSchema = z.object({
  data: z.record(z.unknown()),
  errors: z.record(z.string()),
  isSubmitting: z.boolean(),
  isDirty: z.boolean(),
  isValid: z.boolean(),
});

// === TYPE EXPORTS (Zod-inferred) ===

export type FieldType = z.infer<typeof FieldTypeZodSchema>;
export type SelectOption = z.infer<typeof SelectOptionZodSchema>;
export type ValidationRules = z.infer<typeof ValidationRulesZodSchema>;
export type Field = z.infer<typeof FieldZodSchema>;
export type FieldOverride = z.infer<typeof FieldOverrideZodSchema>;
export type FormConfiguration = z.infer<typeof FormConfigurationZodSchema>;
export type FieldComponentProps = z.infer<typeof FieldComponentPropsZodSchema>;
export type ReferenceFieldProps = z.infer<typeof ReferenceFieldPropsZodSchema>;
export type SelectFieldProps = z.infer<typeof SelectFieldPropsZodSchema>;
export type ValidationResult = z.infer<typeof ValidationResultZodSchema>;
export type FormState = z.infer<typeof FormStateZodSchema>;

// === ADDITIONAL CONVENIENCE TYPES ===

export type FormMode = 'create' | 'edit';
export type FormSubmitHandler = (data: Record<string, unknown>) => void | Promise<void>;

export interface UseFormReturn {
  state: FormState;
  updateField: (key: string, value: unknown) => void;
  updateErrors: (errors: Record<string, string>) => void;
  submit: () => Promise<ValidationResult>;
  reset: (initialData?: Record<string, unknown>) => void;
  validate: () => ValidationResult;
}

export type FieldOverrideMap = Record<string, FieldOverride>;

// === LEGACY COMPATIBILITY TYPES ===

// For backward compatibility with existing generic usage
export type FieldConfig = Field;
export type FormConfig = FormConfiguration;