import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { useFieldRenderer } from '@/lib/ui/forms/hooks/useFieldRenderer';
import { SchoolFieldConfig } from '@forms/fieldConfig/school/school-field-config';
import { SchoolInputZodSchema, type SchoolInput } from '@zod-schema/core/school';
import type { Field } from '@ui-types/form';

interface SchoolFormProps {
  initialValues?: Partial<SchoolInput>;
  onSubmit: (data: SchoolInput) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  submitLabel?: string;
}

/**
 * Domain-specific school form component
 * Uses TanStack Form's native API with direct useForm hook
 */
export function SchoolForm({
  initialValues = {},
  onSubmit,
  onCancel,
  title = 'School Form',
  submitLabel = 'Save School'
}: SchoolFormProps) {
  const { renderField } = useFieldRenderer<SchoolInput>();
  
  // Use TanStack Form directly - simpler and more direct
  const form = useForm({
    defaultValues: {
      schoolNumber: '',
      district: '',
      schoolName: '',
      address: '',
      emoji: '',
      gradeLevelsSupported: [],
      owners: [],
      ...initialValues
    } as SchoolInput,
    validators: {
      onChange: SchoolInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <FormLayout
      title={title}
      submitLabel={submitLabel}
      onCancel={onCancel}
      isSubmitting={form.state.isSubmitting}
      canSubmit={form.state.canSubmit}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {SchoolFieldConfig.map((fieldConfig: Field<SchoolInput>) => (
          <div key={String(fieldConfig.name)} className="space-y-2">
            <label
              htmlFor={String(fieldConfig.name)}
              className="text-sm font-medium leading-none"
            >
              {fieldConfig.label}
            </label>
            
            <form.Field name={String(fieldConfig.name)}>
              {(field) => renderField(fieldConfig, field)}
            </form.Field>
          </div>
        ))}
      </form>
    </FormLayout>
  );
} 