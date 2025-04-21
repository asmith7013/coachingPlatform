"use client";

import React, { useState } from "react";
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
import ReferenceSelect, { URLReferenceSelect } from "@/components/core/fields/ReferenceSelect";

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
  const [formData, setFormData] = useState<T>(
    defaultValues || fields.reduce((acc, field) => ({
      ...acc,
      [field.name]: field.type === 'select' ? (field.defaultValue ?? []) : (field.defaultValue ?? ''),
    }), {} as T)
  );

  const label = submitLabel ?? (mode === "edit" ? "Save" : "Add");
  const styles = resourceForm({ mode });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (name: keyof T, value: T[keyof T]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInputChange = (
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
  };

  const isFieldEditable = (field: Field<T>): boolean => {
    if (mode === "create") return true;
    return field.editable !== false; // If not specified, default to true
  };

  const renderField = (field: Field<T>) => {
    // Determine if the field should be disabled
    const isDisabled = !isFieldEditable(field);

    switch (field.type) {
      case 'reference': {
        const value = formData[field.name];
        const multiple = field.multiple !== false;
        
        if (field.url) {
          return (
            <URLReferenceSelect
              label={field.label}
              value={value as string[] | string}
              onChange={(newValue) => {
                handleChange(field.name, newValue as T[keyof T]);
              }}
              url={field.url}
              multiple={multiple}
              disabled={isDisabled}
            />
          );
        } else if (field.fetcher) {
          return (
            <ReferenceSelect
              label={field.label}
              value={value as string[] | string}
              onChange={(newValue) => {
                handleChange(field.name, newValue as T[keyof T]);
              }}
              fetcher={field.fetcher}
              multiple={multiple}
              disabled={isDisabled}
            />
          );
        } else {
          console.error(`Reference field ${String(field.name)} missing url or fetcher function`);
          return <div>Error: Missing url or fetcher function</div>;
        }
      }
      case 'select': {
        const value = formData[field.name];
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
            checked={formData[field.name] as boolean}
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
            checked={formData[field.name] as boolean}
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
            value={formData[field.name] as string}
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
            value={formData[field.name] as string}
            onChange={(e) => handleInputChange(field.name, e)}
            required={field.required}
            disabled={isDisabled}
          />
        );
    }
  };

  return (
    <Card className={cn(styles.root(), className)}>
      <form onSubmit={handleSubmit} className={styles.form()}>
        <div className={styles.header()}>
          <Heading level="h2" className={styles.title()}>{title}</Heading>
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
        <div className="w-full">
          <Button type="submit" className={styles.submitButton()}>
            {label}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Also export as default
export default GenericResourceForm; 