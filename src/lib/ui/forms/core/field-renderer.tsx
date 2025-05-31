// src/lib/ui/forms/core/field-renderer.tsx

import React from 'react';
import { Input } from '@core-components/fields/Input';
import { Select } from '@core-components/fields/Select';
import { Switch } from '@core-components/fields/Switch';
import { Checkbox } from '@core-components/fields/Checkbox';
import { Textarea } from '@core-components/fields/Textarea';
import ReferenceSelect from '@core-components/fields/ReferenceSelect';
import type { Field, FieldComponentProps } from '@ui-types/form';
import { ZodSchema } from 'zod';

// Import transformer validation for consistency
import { validateSafe } from '@transformers/core/validation';
import { handleClientError } from '@error/handlers/client';

/**
 * UNIFIED Field Renderer System
 * 
 * Consolidates all field rendering logic into a single, consistent system
 * that leverages the transformer validation system and provides a clean API
 */

// Type for field renderer props
export interface FieldRendererProps<_T extends Record<string, unknown>> {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  error?: string;
  // Optional schema for validation
  validationSchema?: ZodSchema<unknown>;
}

/**
 * Validates field value using transformer validation system
 * Provides consistent validation across all field types
 */
function validateFieldValue(
  value: unknown, 
  field: Field, 
  schema?: ZodSchema<unknown>
): { isValid: boolean; error?: string } {
  try {
    // Use transformer validation if schema provided
    if (schema) {
      const isValid = validateSafe(schema, value) !== null;
      return { 
        isValid,
        error: isValid ? undefined : `Invalid ${field.label.toLowerCase()}`
      };
    }
    
    // Basic required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return { 
        isValid: false, 
        error: `${field.label} is required` 
      };
    }
    
    return { isValid: true };
  } catch (error) {
    const errorMessage = handleClientError(error, 'fieldValidation');
    return { 
      isValid: false, 
      error: errorMessage 
    };
  }
}

/**
 * Main field renderer function
 * Uses transformer validation system for consistency
 */
export function renderField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled = false,
  error,
  validationSchema,
}: FieldRendererProps<T>): React.ReactNode {
  // Validate current value using transformer system if no explicit error
  const validation = error ? { isValid: false, error } : validateFieldValue(value, field as Field, validationSchema);
  
  // Handle value change
  const handleChange = (newValue: unknown) => {
    onChange(newValue);
  };

  const isDisabled = disabled || field.editable === false;
  const errorMessage = validation.error;
  
  switch (field.type) {
    case 'reference': {
      const multiple = field.multiple !== false;
      
      if (field.url) {
        return (
          <ReferenceSelect
            label={field.label}
            value={value as string[] | string}
            onChange={handleChange}
            url={field.url}
            multiple={multiple}
            disabled={isDisabled}
            helpText={errorMessage || field.helpText}
            placeholder={field.placeholder}
          />
        );
      } else {
        return (
          <div className="p-3 text-sm border rounded-md bg-yellow-50 border-yellow-200">
            <p className="font-medium text-yellow-700">Configuration error</p>
            <p className="text-yellow-600">Reference field missing URL</p>
          </div>
        );
      }
    }
    
    case 'select':
    case 'multi-select': {
      const isMultiSelect = field.type === 'multi-select' || field.multiple;
      
      if (isMultiSelect) {
        return (
          <Select
            label={field.label}
            value={value as string[]}
            onChange={(newValue: string[]) => handleChange(newValue)}
            options={field.options || []}
            multiple={true}
            disabled={isDisabled}
            placeholder={field.placeholder}
            error={errorMessage}
          />
        );
      } else {
        return (
          <Select
            label={field.label}
            value={value as string}
            onChange={(newValue: string) => handleChange(newValue)}
            options={field.options || []}
            multiple={false}
            disabled={isDisabled}
            placeholder={field.placeholder}
            error={errorMessage}
          />
        );
      }
    }
    
    case 'switch':
      return (
        <Switch
          label={field.label}
          checked={value as boolean}
          onChange={(checked: boolean) => handleChange(checked)}
          disabled={isDisabled}
          description={errorMessage || field.helpText}
        />
      );
      
    case 'checkbox':
      return (
        <Checkbox
          label={field.label}
          checked={value as boolean}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.checked)}
          disabled={isDisabled}
          description={errorMessage || field.helpText}
        />
      );
      
    case 'textarea':
      return (
        <Textarea
          label={field.label}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          disabled={isDisabled}
          placeholder={field.placeholder}
          error={errorMessage}
        />
      );
      
    default:
      return (
        <Input
          type={field.type}
          label={field.label}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          disabled={isDisabled}
          placeholder={field.placeholder}
          error={errorMessage}
          helpText={field.helpText}
        />
      );
  }
}

/**
 * Safe field renderer with error boundary
 * Provides fallback rendering if field rendering fails
 */
export function SafeFieldRenderer<T extends Record<string, unknown>>(
  props: FieldRendererProps<T>
): React.ReactNode {
  try {
    return renderField(props);
  } catch (error) {
    console.error('Field rendering error:', error);
    const errorMessage = handleClientError(error, 'fieldRendering');
    
    return (
      <div className="p-3 text-sm border rounded-md bg-red-50 border-red-200">
        <p className="font-medium text-red-700">Field rendering error</p>
        <p className="text-red-600">{errorMessage}</p>
        <p className="text-xs text-red-500 mt-1">Field: {String(props.field.key)}</p>
      </div>
    );
  }
}

/**
 * Registry for custom field renderers
 * Allows extending the system with custom field types
 */
const customRenderers: Record<string, (props: FieldRendererProps<Record<string, unknown>>) => React.ReactNode> = {};

/**
 * Register a custom field renderer
 */
export function registerFieldRenderer(
  type: string, 
  renderer: (props: FieldRendererProps<Record<string, unknown>>) => React.ReactNode
): void {
  customRenderers[type] = renderer;
}

/**
 * Get a custom field renderer
 */
export function getFieldRenderer(type: string): ((props: FieldRendererProps<Record<string, unknown>>) => React.ReactNode) | null {
  return customRenderers[type] || null;
}

/**
 * Enhanced field renderer with custom renderer support
 */
export function renderFieldWithCustomSupport<T extends Record<string, unknown>>(props: FieldRendererProps<T>): React.ReactNode {
  // Check for custom renderer first
  const customRenderer = getFieldRenderer(props.field.type);
  if (customRenderer) {
    return customRenderer(props as FieldRendererProps<Record<string, unknown>>);
  }
  
  // Use standard renderer
  return renderField(props);
}

/**
 * Utility function to extract reference field props
 * Helps with type safety when working with reference fields
 */
export function extractReferenceProps(field: Field): {
  url: string;
  multiple: boolean;
  label: string;
} {
  if (field.type !== 'reference') {
    throw new Error(`Expected field type 'reference', got '${field.type}'`);
  }
  if (!field.url) {
    throw new Error('URL is required for reference fields');
  }
  return {
    url: field.url,
    multiple: field.multiple ?? false,
    label: field.label
  };
}

/**
 * Utility function to create field component props
 * Standardizes props passed to field components
 */
export function createFieldProps<T = unknown>(
  field: Field,
  value: T,
  onChange: (value: T) => void,
  options: {
    disabled?: boolean;
    error?: string;
  } = {}
): FieldComponentProps<T> {
  return {
    label: field.label,
    value,
    onChange,
    disabled: options.disabled || field.editable === false,
    placeholder: field.placeholder,
    error: options.error,
    helpText: field.helpText,
    required: field.required,
    className: field.className
  };
}
