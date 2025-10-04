import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';
import { NYCPSStaffInputZodSchema, type NYCPSStaffInput, createNYCPSStaffDefaults } from '@zod-schema/core/staff';
import { GradeLevelsSupportedZod, RolesNYCPSZod } from '@enums';

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
  const form = useForm({
    defaultValues: createNYCPSStaffDefaults(initialValues),
    validators: {
      onChange: NYCPSStaffInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  // Options for select fields
  const gradeLevelOptions = GradeLevelsSupportedZod.options.map((value: string) => ({ value, label: value }));
  const roleOptions = RolesNYCPSZod.options.map((value: string) => ({ value, label: value }));

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
        <form.Field name="staffName">
          {(field) => (
            <Input fieldApi={field} label="Staff Name" required placeholder="Enter staff name" />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <Input fieldApi={field} label="Email" type="email" required placeholder="Enter email" />
          )}
        </form.Field>
        <form.Field name="schools">
          {(field) => (
            <ReferenceSelect fieldApi={field} value={field.state.value as string[]} onChange={field.handleChange} label="Schools" url="/api/schools" multiple placeholder="Select schools" />
          )}
        </form.Field>
        <form.Field name="owners">
          {(field) => (
            <ReferenceSelect fieldApi={field} value={field.state.value as string[]} onChange={field.handleChange} label="Owners" url="/api/staff" multiple placeholder="Select owners" />
          )}
        </form.Field>
        <form.Field name="gradeLevelsSupported">
          {(field) => (
            <Select fieldApi={field} value={field.state.value as string[]} onChange={field.handleChange} label="Grade Levels Supported" options={gradeLevelOptions} multiple placeholder="Select grade levels" />
          )}
        </form.Field>
        <form.Field name="subjects">
          {(field) => (
            <Input fieldApi={field} label="Subjects" placeholder="Enter subjects (comma separated)" />
          )}
        </form.Field>
        <form.Field name="specialGroups">
          {(field) => (
            <Input fieldApi={field} label="Special Groups" placeholder="Enter special groups (comma separated)" />
          )}
        </form.Field>
        <form.Field name="rolesNYCPS">
          {(field) => (
            <Select fieldApi={field} value={field.state.value as string[]} onChange={field.handleChange} label="Roles (NYCPS)" options={roleOptions} multiple placeholder="Select roles" />
          )}
        </form.Field>
        <form.Field name="pronunciation">
          {(field) => (
            <Input fieldApi={field} label="Pronunciation" placeholder="Enter pronunciation" />
          )}
        </form.Field>
      </form>
    </FormLayout>
  );
} 