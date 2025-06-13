import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { useFieldRenderer } from '@/lib/ui/forms/hooks/useFieldRenderer';
import { NYCPSStaffFieldConfig } from '@/lib/ui/forms/fieldConfig/staff/nycps-staff';
import { NYCPSStaffInputZodSchema, type NYCPSStaffInput } from '@zod-schema/core/staff';

interface NYCPSStaffFormProps {
  initialValues?: Partial<NYCPSStaffInput>;
  onSubmit: (data: NYCPSStaffInput) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
}

/**
 * Domain-specific NYCPS staff form component
 * Demonstrates ReferenceSelect integration with schools and owners fields
 */
export function NYCPSStaffForm({
  initialValues = {},
  onSubmit,
  onCancel,
  title = 'NYCPS Staff Form'
}: NYCPSStaffFormProps) {
  const { renderField } = useFieldRenderer<NYCPSStaffInput>();
  
  const form = useForm({
    defaultValues: {
      staffName: '',
      email: '',
      schools: [],           // ReferenceSelect will handle this
      owners: [],            // ReferenceSelect will handle this
      gradeLevelsSupported: [],
      subjects: [],
      specialGroups: [],
      rolesNYCPS: [],
      pronunciation: '',
      ...initialValues
    } as NYCPSStaffInput,
    validators: {
      onChange: NYCPSStaffInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <FormLayout
      title={title}
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
        {NYCPSStaffFieldConfig.map((fieldConfig) => (
          <div key={String(fieldConfig.name)} className="space-y-2">
            <label
              htmlFor={String(fieldConfig.name)}
              className="text-sm font-medium"
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