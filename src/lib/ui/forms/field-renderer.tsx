import React from 'react';
import { Input } from '@/components/core/fields/Input';
import { Select } from '@/components/core/fields/Select';
import { Switch } from '@/components/core/fields/Switch';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Textarea } from '@/components/core/fields/Textarea';
import ReferenceSelect from '@/components/core/fields/ReferenceSelect';
import type { Field } from '@/components/composed/forms/RigidResourceForm';

// Type for field renderer props
export interface FieldRendererProps<T extends Record<string, unknown>> {
  field: Field<T>;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

/**
 * Renders a form field based on its type
 * This centralized renderer allows for consistency and extensibility
 */
export function renderFormField<T extends Record<string, unknown>>({
  field,
  value,
  onChange,
  disabled = false,
}: FieldRendererProps<T>): React.ReactNode {
  // Apply any field-specific disabled state
  const isDisabled = disabled;
  
  switch (field.type) {
    case 'reference': {
      const multiple = field.multiple !== false;
      
      if (field.url) {
        return (
          <ReferenceSelect
            label={field.label}
            value={value as string[] | string}
            onChange={(newValue) => onChange(newValue)}
            url={field.url}
            multiple={multiple}
            disabled={isDisabled}
            helpText={field.helpText}
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
            onChange={(newValue: string[]) => onChange(newValue)}
            options={field.options || []}
            multiple={true}
            disabled={isDisabled}
            placeholder={field.placeholder}
          />
        );
      } else {
        return (
          <Select
            label={field.label}
            value={value as string}
            onChange={(newValue: string) => onChange(newValue)}
            options={field.options || []}
            multiple={false}
            disabled={isDisabled}
            placeholder={field.placeholder}
          />
        );
      }
    }
    case 'switch':
      return (
        <Switch
          label={field.label}
          checked={value as boolean}
          onChange={(checked: boolean) => onChange(checked)}
          disabled={isDisabled}
          description={field.helpText}
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          label={field.label}
          checked={value as boolean}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          disabled={isDisabled}
          description={field.helpText}
        />
      );
    case 'textarea':
      return (
        <Textarea
          label={field.label}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={isDisabled}
          placeholder={field.placeholder}
        />
      );
    default:
      return (
        <Input
          type={field.type}
          label={field.label}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          disabled={isDisabled}
          placeholder={field.placeholder}
        />
      );
  }
}

/**
 * Registry for custom field renderers
 * Allows for extending the default renderer with custom implementations
 */
const fieldRendererRegistry: Record<string, (props: FieldRendererProps<Record<string, unknown>>) => React.ReactNode> = {};

/**
 * Register a custom field renderer
 */
export function registerFieldRenderer(
  type: string, 
  renderer: (props: FieldRendererProps<Record<string, unknown>>) => React.ReactNode
): void {
  fieldRendererRegistry[type] = renderer;
}

/**
 * Get a registered field renderer by type
 */
export function getFieldRenderer(type: string): ((props: FieldRendererProps<Record<string, unknown>>) => React.ReactNode) | null {
  return fieldRendererRegistry[type] || null;
} 