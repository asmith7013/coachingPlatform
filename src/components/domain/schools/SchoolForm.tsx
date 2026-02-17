import React from "react";
import { useForm } from "@tanstack/react-form";
import { FormLayout } from "@components/composed/forms/FormLayout";
import { Input } from "@components/core/fields/Input";
import { Select } from "@components/core/fields/Select";
import {
  SchoolInputZodSchema,
  type SchoolInput,
  createSchoolDefaults,
} from "@zod-schema/core/school";
import { GradeLevelsSupportedZod } from "@schema/enum";

interface SchoolFormProps {
  initialValues?: Partial<SchoolInput>;
  onSubmit: (data: SchoolInput) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  submitLabel?: string;
}

const gradeOptions = GradeLevelsSupportedZod.options.map((value) => ({
  value,
  label: value,
}));

/**
 * Domain-specific school form component
 * Uses TanStack Form's native API with direct useForm hook
 */
export function SchoolForm({
  initialValues = {},
  onSubmit,
  onCancel,
  title = "School Form",
  submitLabel = "Save School",
}: SchoolFormProps) {
  const form = useForm({
    defaultValues: createSchoolDefaults(initialValues),
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
      canSubmit={form.state.canSubmit && form.state.isValid}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.Field name="schoolNumber">
          {(field) => (
            <Input
              fieldApi={field}
              label="School Number"
              placeholder="Enter school number"
            />
          )}
        </form.Field>

        <form.Field name="district">
          {(field) => (
            <Input
              fieldApi={field}
              label="District"
              placeholder="Enter district name"
            />
          )}
        </form.Field>

        <form.Field name="schoolName">
          {(field) => (
            <Input
              fieldApi={field}
              label="School Name"
              placeholder="Enter school name"
            />
          )}
        </form.Field>

        <form.Field name="address">
          {(field) => (
            <Input
              fieldApi={field}
              label="Address"
              placeholder="Enter full address (optional)"
            />
          )}
        </form.Field>

        <form.Field name="emoji">
          {(field) => (
            <Input
              fieldApi={field}
              label="Emoji"
              placeholder="Choose an emoji (optional)"
            />
          )}
        </form.Field>

        <form.Field name="gradeLevelsSupported">
          {(field) => (
            <Select
              value={field.state.value as string[]}
              onChange={field.handleChange}
              fieldApi={field}
              label="Grade Levels Supported"
              options={gradeOptions}
              multiple={true}
              placeholder="Select grade levels"
            />
          )}
        </form.Field>
      </form>
    </FormLayout>
  );
}
