import React from 'react';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
import { Textarea } from '@components/core/fields/Textarea';
import { Checkbox } from '@components/core/fields/Checkbox';
import { Switch } from '@components/core/fields/Switch';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';
import type { FormFieldConfig } from '../types/field-types';

/**
 * TanStack Field API interface (matching main form component)
 */
interface FieldApi {
  state: {
    value: unknown;
    meta: {
      errors?: string[];
      isValidating?: boolean;
      isDirty?: boolean;
      isTouched?: boolean;
    };
  };
  handleChange: (value: unknown) => void;
  handleBlur: () => void;
  name: string;
}

/**
 * Props for TanStack field integration
 */
export interface TanStackFieldProps {
  /** Field API from TanStack Form */
  field: FieldApi;
  
  /** Field configuration */
  config: FormFieldConfig;
  
  /** Additional props to pass to the field component */
  fieldProps?: Record<string, unknown>;
}

/**
 * Props for the unified field renderer
 */
export interface TanStackFieldRendererProps {
  /** TanStack Form instance */
  form: {
    Field: React.ComponentType<{ 
      name: string; 
      children: (field: FieldApi) => React.ReactNode;
    }>;
  };
  
  /** Field configuration */
  config: FormFieldConfig;
  
  /** Additional props to pass to the field component */
  fieldProps?: Record<string, unknown>;
}

/**
 * Renders a single field based on TanStack field configuration
 * Integrates with existing core field components through FieldWrapper pattern
 */
export function TanStackField({ field, config, fieldProps = {} }: TanStackFieldProps) {
  const { 
    name, 
    label, 
    type, 
    required, 
    disabled, 
    placeholder, 
    options, 
    multiple, 
    url 
  } = config;

  // Extract current value and error state
  const value = field.state.value;
  const error = field.state.meta.errors?.[0];
  const isValidating = field.state.meta.isValidating;

  // Common props for all field components
  const commonProps = {
    id: name,
    label,
    error,
    required,
    disabled: disabled || isValidating,
    value,
    onChange: field.handleChange,
    onBlur: field.handleBlur,
    ...fieldProps,
  };

  // Render appropriate field component based on type
  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
      return (
        <Input
          {...commonProps}
          type={type}
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <Select
          {...commonProps}
          label={label}
          error={error}
          fieldApi={field}
          options={options || []}
          multiple={multiple || false}
          disabled={disabled || isValidating}
          required={required}
          value={value as string | string[]}
          onChange={(selectedValue: string | string[]) => field.handleChange(selectedValue)}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          id={name}
          label={label}
          error={error}
          required={required}
          disabled={disabled || isValidating}
          checked={Boolean(value)}
          onChange={(e) => field.handleChange(e.target.checked)}
          onBlur={field.handleBlur}
        />
      );

    case 'switch':
      return (
        <Switch
          {...commonProps}
          checked={Boolean(value)}
          onChange={(checked) => field.handleChange(checked)}
        />
      );

    case 'reference':
      return (
        <ReferenceSelect
          {...commonProps}
          label={label}
          error={error}
          required={required}
          disabled={disabled || isValidating}
          url={url || ''}
          multiple={multiple}
          value={value as string | string[]}
          onChange={(selectedValue: string | string[]) => field.handleChange(selectedValue)}
          onBlur={field.handleBlur}
        />
      );

    case 'date':
    case 'datetime':
      return (
        <Input
          {...commonProps}
          type={type === 'date' ? 'date' : 'datetime-local'}
          value={value as string}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      );

    default:
      // Fallback to text input for unknown types
      console.warn(`Unknown field type: ${type}. Falling back to text input.`);
      return (
        <Input
          {...commonProps}
          type="text"
          placeholder={placeholder}
          value={value as string}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      );
  }
}

/**
 * Unified field renderer that wraps TanStack Form.Field with field rendering logic
 * Provides a clean API for rendering any field type with TanStack Form integration
 * 
 * @example
 * ```tsx
 * <TanStackFieldRenderer
 *   form={form}
 *   config={{
 *     name: 'email',
 *     label: 'Email Address',
 *     type: 'email',
 *     required: true
 *   }}
 * />
 * ```
 */
export function TanStackFieldRenderer({ 
  form, 
  config, 
  fieldProps = {} 
}: TanStackFieldRendererProps) {
  return (
    <form.Field name={config.name}>
      {(field: FieldApi) => (
        <TanStackField 
          field={field} 
          config={config} 
          fieldProps={fieldProps} 
        />
      )}
    </form.Field>
  );
}

/**
 * Bulk field renderer for rendering multiple fields at once
 * Useful for standard form layouts
 * 
 * @example
 * ```tsx
 * <TanStackFieldGroup
 *   form={form}
 *   fields={[
 *     { name: 'firstName', label: 'First Name', type: 'text' },
 *     { name: 'lastName', label: 'Last Name', type: 'text' },
 *     { name: 'email', label: 'Email', type: 'email' }
 *   ]}
 *   className="space-y-4"
 * />
 * ```
 */
export function TanStackFieldGroup({
  form,
  fields,
  fieldProps = {},
  className = 'space-y-4',
}: {
  form: TanStackFieldRendererProps['form'];
  fields: FormFieldConfig[];
  fieldProps?: Record<string, unknown>;
  className?: string;
}) {
  return (
    <div className={className}>
      {fields.map((config) => (
        <TanStackFieldRenderer
          key={config.name}
          form={form}
          config={config}
          fieldProps={fieldProps}
        />
      ))}
    </div>
  );
}

export default TanStackFieldRenderer; 