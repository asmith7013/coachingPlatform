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
  disabled: z.boolean().default(false).describe("Whether option is disabled"),
  group: z.string().optional().describe("Option group"),
});

export const ValidationRulesZodSchema = z.object({
  min: z.number().optional().describe("Minimum value/length"),
  max: z.number().optional().describe("Maximum value/length"),
  pattern: z.string().optional().describe("RegExp pattern"),
  custom: z.function().args(z.unknown()).returns(z.union([z.boolean(), z.string()])).optional()
}).optional().describe("Validation configuration");

// === MAIN SCHEMAS ===

export const FieldConfigZodSchema = z.object({
  name: z.string().describe("Field identifier"),
  label: z.string().describe("Display label"),
  type: FieldTypeZodSchema.describe("Field type"),
  required: z.boolean().default(false).describe("Whether field is required"),
  
  // Display
  placeholder: z.string().optional().describe("Placeholder text"),
  helpText: z.string().optional().describe("Help text"),
  
  // State
  disabled: z.boolean().default(false).describe("Whether field is disabled"),
  hidden: z.boolean().default(false).describe("Whether field is hidden"),
  readOnly: z.boolean().default(false).describe("Whether field is read-only"),
  editable: z.boolean().default(true).describe("Whether field can be edited"),
  
  // Options
  defaultValue: z.unknown().optional().describe("Default value"),
  options: z.array(SelectOptionZodSchema).optional().describe("Options for select fields"),
  inputType: z.string().optional().describe("HTML input type"),
  validation: ValidationRulesZodSchema,
  
  // Reference fields
  url: z.string().url().optional().describe("URL for reference fields"),
  fetcher: z.function().optional().describe("Dynamic option fetcher"),
  
  // Conditional display
  modalOnly: z.boolean().default(false).describe("Show only in modal"),
  desktopOnly: z.boolean().default(false).describe("Show only on desktop"),
  mobileOnly: z.boolean().default(false).describe("Show only on mobile"),
});

export const FieldOverrideZodSchema = FieldConfigZodSchema.partial();

export const FormConfigZodSchema = z.object({
  title: z.string().optional().describe("Form title"),
  description: z.string().optional().describe("Form description"),
  submitLabel: z.string().default("Save").describe("Submit button label"),
  cancelLabel: z.string().default("Cancel").describe("Cancel button label"),
  
  // Field organization
  fields: z.array(z.string()).optional().describe("Fields to include (in order)"),
  hiddenFields: z.array(z.string()).optional().describe("Fields to hide"),
  requiredFields: z.array(z.string()).optional().describe("Fields to make required"),
  optionalFields: z.array(z.string()).optional().describe("Fields to make optional"),
  
  // Form behavior
  defaultValues: z.record(z.unknown()).optional().describe("Default form values"),
  validation: z.object({
    validateOnChange: z.boolean().default(true),
    validateOnBlur: z.boolean().default(true),
    abortEarly: z.boolean().default(false),
  }).optional().describe("Form validation behavior"),
});

// === TYPE EXPORTS ===
export type FieldType = z.infer<typeof FieldTypeZodSchema>;
export type SelectOption = z.infer<typeof SelectOptionZodSchema>;
export type ValidationRules = z.infer<typeof ValidationRulesZodSchema>;
export type FieldConfig = z.infer<typeof FieldConfigZodSchema>;
export type FieldOverride = z.infer<typeof FieldOverrideZodSchema>;
export type FormConfig = z.infer<typeof FormConfigZodSchema>;