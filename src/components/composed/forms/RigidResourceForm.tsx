"use client";

import React, { useState, useCallback, memo, useRef, useEffect } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/composed/cards/Card";
import { Heading } from "@/components/core/typography/Heading";
import { Text } from "@/components/core/typography/Text";
import { tv } from 'tailwind-variants';
import { shadows, textSize, textColors } from "@/lib/tokens/tokens";
import { stack } from "@/lib/tokens/tokens";
import { cn } from "@ui/utils/formatters";

// Import unified field renderer
import { renderField } from '@ui-forms/core/field-renderer';
import type { Field } from '@ui-types/form';

// Export Field type for backward compatibility
// export type { Field };

export type Mode = "create" | "edit";

interface RigidResourceFormProps<T extends Record<string, unknown>> {
  title: string;
  fields: Field[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  defaultValues?: T;
  mode?: Mode;
  className?: string;
  errors?: Record<keyof T, string>;
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

export function RigidResourceForm<T extends Record<string, unknown>>({
  title,
  fields,
  onSubmit,
  submitLabel,
  defaultValues,
  mode = "create",
  className,
  errors = {} as Record<keyof T, string>,
}: RigidResourceFormProps<T>) {
  // Store formData in a ref to avoid recreation of renderField on every state change
  const [formData, setFormData] = useState<T>(
    defaultValues || fields.reduce((acc, field) => ({
      ...acc,
      [field.key]: field.type === 'select' || field.type === 'multi-select' ? (field.defaultValue ?? []) : (field.defaultValue ?? ''),
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

  const isFieldEditable = useCallback((field: Field): boolean => {
    if (mode === "create") return true;
    return field.editable !== false; // If not specified, default to true
  }, [mode]);

  // Use unified field renderer
  const fieldRenderer = useCallback((field: Field) => {
    return renderField({
      field,
      value: formDataRef.current[field.key],
      onChange: (value) => handleChange(field.key, value as T[keyof T]),
      disabled: !isFieldEditable(field),
      error: errors[field.key]
    });
  }, [handleChange, isFieldEditable, errors]);

  // Filter fields that should be rendered
  const fieldsToRender = fields.filter(field => {
    if (mode === "create") return true;
    return field.editable !== false;
  });

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
          {fieldsToRender.map((field) => (
            <div key={String(field.key)} className={styles.fieldWrapper()}>
              {fieldRenderer(field)}
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
export const MemoizedRigidResourceForm = memo(RigidResourceForm) as typeof RigidResourceForm; 