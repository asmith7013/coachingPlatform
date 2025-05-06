"use client";

import React, { useState, useCallback, memo, useRef, useEffect } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { Input } from "@/components/core/fields/Input";
import { Select } from "@/components/core/fields/Select";
import { Switch } from '@/components/core/fields/Switch';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { Textarea } from '@/components/core/fields/Textarea';
import { tv } from 'tailwind-variants';
import { shadows, textSize, textColors } from "@/lib/tokens/tokens";
import { stack } from "@/lib/tokens/tokens";
import { cn } from "@ui/utils/formatters";
import ReferenceSelect from "@/components/core/fields/ReferenceSelect";

// Import field renderer
import { renderFormField } from "@/lib/ui/forms/field-renderer";
import type { FieldOverrideMap } from "@/lib/types/ui/form";

/////////////////////////////////////////////////////////////
// LEGACY CODE - PRESERVED FOR REFERENCE
// The code below is the original implementation
// Please use ResourceForm (exported at the bottom) instead
/////////////////////////////////////////////////////////////

export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'switch' | 'checkbox' | 'textarea' | 'reference' | 'multi-select';
export type Mode = "create" | "edit";

export interface Field<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: T[keyof T];
  editable?: boolean;
  fetcher?: (input: string) => Promise<{ value: string; label: string }[]>;
  multiple?: boolean;
  url?: string;
  helpText?: string;
  placeholder?: string;
  error?: string;
}

interface GenericResourceFormProps<T extends Record<string, unknown>> {
  title: string;
  fields: Field<T>[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  defaultValues?: T;
  mode?: Mode;
  className?: string;
  onCancel?: () => void;
}

// 🎨 ResourceForm style variants
export const resourceForm = tv({
  slots: {
    root: [shadows.md, 'bg-secondary'],
    form: [stack.md],
    header: [stack.md],
    title: [textSize.lg, textColors.default, 'font-semibold'],
    description: [textSize.base, textColors.muted],
    fieldsContainer: [stack.md],
    fieldWrapper: [stack.sm],
    submitButton: ['w-full'],
    buttonContainer: ['flex gap-4 mt-4'],
    cancelButton: ['flex-1'],
    errorContainer: ['text-red-500 text-sm mt-2'],
  },
  variants: {
    mode: {
      create: {},
      edit: {},
    }
  },
  defaultVariants: {
    mode: 'create',
  }
});

// ✅ Export for atomic style use elsewhere
export const resourceFormStyles = resourceForm;

// ✅ Export type for variant props
export type ResourceFormVariants = Parameters<typeof resourceForm>[0];

export function GenericResourceForm<T extends Record<string, unknown>>({
  title,
  fields,
  onSubmit,
  submitLabel,
  defaultValues,
  mode = "create",
  className,
  onCancel,
}: GenericResourceFormProps<T>) {
  // Add performance monitoring

  
  // Store formData in a ref to avoid recreation of renderField on every state change
  const [formData, setFormData] = useState<T>(
    defaultValues || fields.reduce((acc, field) => ({
      ...acc,
      [field.key]: field.type === 'select' ? (field.defaultValue ?? []) : (field.defaultValue ?? ''),
    }), {} as T)
  );
  
  // Create a stable ref to formData that renderField can use
  const formDataRef = useRef(formData);
  // Update the ref whenever formData changes
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const label = submitLabel ?? (mode === "edit" ? "Save" : "Add");
  const styles = resourceForm({ mode });
  


  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  const handleChange = useCallback((key: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleInputChange = useCallback((
    key: keyof T,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const input = e.target;
    let value: T[keyof T];

    if (input instanceof HTMLInputElement) {
      if (input.type === 'number') {
        value = Number(input.value) as T[keyof T];
      } else if (input.type === 'checkbox') {
        value = input.checked as T[keyof T];
      } else {
        value = input.value as T[keyof T];
      }
    } else {
      value = input.value as T[keyof T];
    }

    handleChange(key, value);
  }, [handleChange]);

  const isFieldEditable = useCallback((field: Field<T>): boolean => {
    if (mode === "create") return true;
    return field.editable !== false; // If not specified, default to true
  }, [mode]);
  


  // Optimize renderField to use formDataRef instead of formData directly
  // This prevents it from being recreated when formData changes
  const renderField = useCallback((field: Field<T>) => {
    // Add diagnostic logging
    // console.log(`🔍 renderField for ${String(field.key)} in ${formId.current}`);
    
    // Determine if the field should be disabled
    const isDisabled = !isFieldEditable(field);
    
    // Always access latest formData via ref
    const currentFormData = formDataRef.current;

    switch (field.type) {
      case 'reference': {
        const value = currentFormData[field.key];
        const multiple = field.multiple !== false;
        
        if (field.url) {
          return (
            <ReferenceSelect
              label={field.label}
              value={value as string[] | string}
              onChange={(newValue) => {
                handleChange(field.key, newValue as T[keyof T]);
              }}
              url={field.url}
              multiple={multiple}
              disabled={isDisabled}
              helpText={field.helpText}
            />
          );
        } else if (field.fetcher) {
          console.warn(`Fetcher-based ReferenceSelect is deprecated. Please use URL-based references.`);
          return (
            <div className="p-3 text-sm border rounded-md bg-yellow-50 border-yellow-200">
              <p className="font-medium text-yellow-700">Field needs migration</p>
              <p className="text-yellow-600">Please update to use URL-based reference field.</p>
            </div>
          );
        } else {
          console.error(`Reference field ${String(field.key)} missing url`);
          return <div>Error: Missing url for reference field</div>;
        }
      }
      case 'select': {
        const value = currentFormData[field.key];
        const isMultiSelect = Array.isArray(value);
        
        if (isMultiSelect) {
          return (
            <Select
              label={field.label}
              value={value as string[]}
              onChange={(newValue: string[]) => {
                handleChange(field.key, newValue as T[keyof T]);
              }}
              options={field.options || []}
              multiple={true}
              disabled={isDisabled}
            />
          );
        } else {
          return (
            <Select
              label={field.label}
              value={value as string}
              onChange={(newValue: string) => {
                handleChange(field.key, newValue as T[keyof T]);
              }}
              options={field.options || []}
              multiple={false}
              disabled={isDisabled}
            />
          );
        }
      }
      case 'switch':
        return (
          <Switch
            label={field.label}
            checked={currentFormData[field.key] as boolean}
            onChange={(checked: boolean) => {
              handleChange(field.key, checked as T[keyof T]);
            }}
            disabled={isDisabled}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={currentFormData[field.key] as boolean}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(field.key, e.target.checked as T[keyof T]);
            }}
            disabled={isDisabled}
          />
        );
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            value={currentFormData[field.key] as string}
            onChange={(e) => handleInputChange(field.key, e)}
            required={field.required}
            disabled={isDisabled}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            label={field.label}
            value={currentFormData[field.key] as string}
            onChange={(e) => handleInputChange(field.key, e)}
            required={field.required}
            disabled={isDisabled}
          />
        );
    }
  // Remove formData from dependencies list, use only stable references
  }, [handleChange, handleInputChange, isFieldEditable]);

  return (
    <Card
      className={cn(styles.root(), 'p-6 rounded-lg', className)}
    >
      <form onSubmit={handleSubmit} className={styles.form()}>
        <div className={styles.header()}>
          <Heading 
            level="h2" 
            color="default"
            className={styles.title()}
          >
            {title}
          </Heading>
          <Text className={styles.description()}>
            {mode === "edit" 
              ? "Edit the details below to update this item."
              : "Fill in the details below to add a new item."}
          </Text>
        </div>
        <div className={styles.fieldsContainer()}>
          {fields.map((field) => (
            <div key={String(field.key)} className={styles.fieldWrapper()}>
              {renderField(field)}
            </div>
          ))}
        </div>
        <div className={styles.buttonContainer()}>
          <Button
            type="submit"
            appearance="solid"
            className={styles.submitButton()}
          >
            {label}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              appearance="outline" 
              className={styles.cancelButton()}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

// Create memoized version of the GenericResourceForm for better performance
export const MemoizedGenericResourceForm = memo(GenericResourceForm) as typeof GenericResourceForm;

/////////////////////////////////////////////////////////////
// NEW IMPLEMENTATION - USE THIS GOING FORWARD
// Enhanced ResourceForm with field renderer system
/////////////////////////////////////////////////////////////

export interface ResourceFormProps<T extends Record<string, unknown>> {
  title: string;
  description?: string;
  fields: Field<T>[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  initialValues?: Partial<T>;
  mode?: Mode;
  className?: string;
  // New props for flexibility
  overrides?: FieldOverrideMap<T>;
  onChange?: (data: T) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  cancelLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  fieldOverrides?: FieldOverrideMap<T>; // For backward compatibility
}

export function ResourceForm<T extends Record<string, unknown>>({
  title,
  description,
  fields,
  onSubmit,
  submitLabel,
  initialValues = {} as Partial<T>,
  mode = "create",
  className,
  overrides = {},
  onChange,
  onCancel,
  showCancelButton = false,
  cancelLabel = "Cancel",
  disabled = false,
  loading = false,
  error,
  fieldOverrides,
}: ResourceFormProps<T>) {
  // Use fieldOverrides for backward compatibility
  const fieldOverrideMap = fieldOverrides || overrides;
  
  // Initialize form data with initialValues
  const [formData, setFormData] = useState<Partial<T>>(initialValues);
  
  // Add debugging useEffect to track initialValues and formData
  useEffect(() => {
    console.log('ResourceForm received initialValues:', initialValues);
    
    // Log field keys vs value keys to diagnose mismatches
    const fieldKeys = fields.map(field => String(field.key));
    const valueKeys = Object.keys(initialValues || {});
    console.log('Form field keys:', fieldKeys);
    console.log('Initial value keys:', valueKeys);
    console.log('Missing in values:', fieldKeys.filter(k => !valueKeys.includes(k)));
    
    // Update formData if initialValues changes after component mount
    setFormData(current => ({
      ...current,
      ...initialValues
    }));
  }, [initialValues, fields]);
  
  const label = submitLabel ?? (mode === "edit" ? "Save" : "Add");
  const styles = resourceForm({ mode });
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as T);
  }, [formData, onSubmit]);

  const handleChange = useCallback((key: keyof T, value: unknown) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [key]: value,
      };
      
      // Call onChange handler if provided
      if (onChange) {
        onChange(newData as T);
      }
      
      return newData;
    });
  }, [onChange]);

  // Apply field overrides if provided
  const fieldsWithOverrides = fields.map(field => {
    const fieldKey = field.key as keyof T;
    const override = fieldOverrideMap[fieldKey];
    
    if (override) {
      return { ...field, ...override };
    }
    
    return field;
  });

  return (
    <Card
      className={cn(styles.root(), 'p-6 rounded-lg', className)}
    >
      <form onSubmit={handleSubmit} className={styles.form()}>
        <div className={styles.header()}>
          <Heading 
            level="h3" 
            color="default"
            className={styles.title()}
          >
            {title}
          </Heading>
          {description ? (
            <Text className={styles.description()}>
              {description}
            </Text>
          ) : (
            <Text className={styles.description()}>
              {mode === "edit" 
                ? "Edit the details below to update this item."
                : "Fill in the details below to add a new item."}
            </Text>
          )}
        </div>
        
        <div className={styles.fieldsContainer()}>
          {fieldsWithOverrides.map((field) => (
            <div key={String(field.key)} className={styles.fieldWrapper()}>
              {renderFormField({
                field,
                value: formData[field.key as keyof T],
                onChange: (value: unknown) => handleChange(field.key as keyof T, value),
                disabled: disabled || loading || (mode === "edit" && field.editable === false),
              })}
            </div>
          ))}
        </div>
        
        {error && (
          <div className={styles.errorContainer()}>
            {error}
          </div>
        )}
        
        <div className={styles.buttonContainer()}>
          <Button
            type="submit"
            appearance="solid"
            className={styles.submitButton()}
            disabled={disabled || loading}
            loading={loading}
          >
            {label}
          </Button>
          
          {(showCancelButton || onCancel) && (
            <Button
              type="button"
              appearance="outline"
              className={styles.cancelButton()}
              onClick={onCancel}
              disabled={disabled || loading}
            >
              {cancelLabel}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

// Create memoized version of the ResourceForm for better performance
export const MemoizedResourceForm = memo(ResourceForm) as typeof ResourceForm;

// Export components - avoiding redundant exports
export { MemoizedResourceForm as ResourceForm2 }; 