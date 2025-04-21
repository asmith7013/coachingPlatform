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
import { shadows, textSize, textColors } from "@/lib/ui/tokens";
import { stack } from "@/lib/ui/tokens/spacing";
import { cn } from "@/lib/utils";
import ReferenceSelect from "@/components/core/fields/ReferenceSelect";


export type FieldType = 'text' | 'number' | 'email' | 'password' | 'select' | 'switch' | 'checkbox' | 'textarea' | 'reference';
export type Mode = "create" | "edit";

export interface Field<T extends Record<string, unknown>> {
  name: keyof T;
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
}

interface GenericResourceFormProps<T extends Record<string, unknown>> {
  title: string;
  fields: Field<T>[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  defaultValues?: T;
  mode?: Mode;
  className?: string;
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
}: GenericResourceFormProps<T>) {
  // Add performance monitoring

  
  // Store formData in a ref to avoid recreation of renderField on every state change
  const [formData, setFormData] = useState<T>(
    defaultValues || fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'select' ? (field.defaultValue ?? []) : (field.defaultValue ?? ''),
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

  const handleChange = useCallback((name: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleInputChange = useCallback((
    name: keyof T,
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

    handleChange(name, value);
  }, [handleChange]);

  const isFieldEditable = useCallback((field: Field<T>): boolean => {
    if (mode === "create") return true;
    return field.editable !== false; // If not specified, default to true
  }, [mode]);
  


  // Optimize renderField to use formDataRef instead of formData directly
  // This prevents it from being recreated when formData changes
  const renderField = useCallback((field: Field<T>) => {
    // Add diagnostic logging
    // console.log(`🔍 renderField for ${String(field.name)} in ${formId.current}`);
    
    // Determine if the field should be disabled
    const isDisabled = !isFieldEditable(field);
    
    // Always access latest formData via ref
    const currentFormData = formDataRef.current;

    switch (field.type) {
      case 'reference': {
        const value = currentFormData[field.name];
        const multiple = field.multiple !== false;
        
        if (field.url) {
          return (
            <ReferenceSelect
              label={field.label}
              value={value as string[] | string}
              onChange={(newValue) => {
                handleChange(field.name, newValue as T[keyof T]);
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
          console.error(`Reference field ${String(field.name)} missing url`);
          return <div>Error: Missing url for reference field</div>;
        }
      }
      case 'select': {
        const value = currentFormData[field.name];
        const isMultiSelect = Array.isArray(value);
        
        if (isMultiSelect) {
          return (
            <Select
              label={field.label}
              value={value as string[]}
              onChange={(newValue: string[]) => {
                handleChange(field.name, newValue as T[keyof T]);
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
                handleChange(field.name, newValue as T[keyof T]);
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
            checked={currentFormData[field.name] as boolean}
            onChange={(checked: boolean) => {
              handleChange(field.name, checked as T[keyof T]);
            }}
            disabled={isDisabled}
          />
        );
      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={currentFormData[field.name] as boolean}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleChange(field.name, e.target.checked as T[keyof T]);
            }}
            disabled={isDisabled}
          />
        );
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            value={currentFormData[field.name] as string}
            onChange={(e) => handleInputChange(field.name, e)}
            required={field.required}
            disabled={isDisabled}
          />
        );
      default:
        return (
          <Input
            type={field.type}
            label={field.label}
            value={currentFormData[field.name] as string}
            onChange={(e) => handleInputChange(field.name, e)}
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
            <div key={String(field.name)} className={styles.fieldWrapper()}>
              {renderField(field)}
            </div>
          ))}
        </div>
        <Button
          type="submit"
          appearance="solid"
          className={styles.submitButton()}
        >
          {label}
        </Button>
      </form>
    </Card>
  );
}

// Create memoized version of the GenericResourceForm for better performance
export const MemoizedGenericResourceForm = memo(GenericResourceForm) as typeof GenericResourceForm; 