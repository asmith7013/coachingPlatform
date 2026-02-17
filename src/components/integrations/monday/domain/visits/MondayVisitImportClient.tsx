"use client";

import { useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@components/core/Button";
import { Alert } from "@components/core/feedback/Alert";
import { Spinner } from "@components/core/feedback/Spinner";
import { FormLayout } from "@components/composed/forms/FormLayout";
import { useFieldRenderer } from "@/lib/ui/forms/hooks/useFieldRenderer";
import { VisitFieldConfig } from "@ui-forms/fieldConfig/integrations/visits";
import { VisitInputZodSchema } from "@zod-schema/visits/visit";
import type { VisitInput } from "@zod-schema/visits/visit";
import type { Field } from "@ui-types/form";

/**
 * Form for completing missing information for a Monday.com visit import
 */
interface ImportCompletionFormProps {
  importedVisit: Partial<VisitInput>;
  missingFields: string[];
  onSubmit: (data: VisitInput) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function ImportCompletionForm({
  importedVisit,
  missingFields,
  onSubmit,
  onCancel,
  disabled = false,
}: ImportCompletionFormProps) {
  const { renderField } = useFieldRenderer<VisitInput>();

  // Filter field config to only include missing fields
  const fields = useMemo(() => {
    // If no missing fields, return empty array
    if (missingFields.length === 0) {
      return [];
    }

    // Filter fields to only include missing ones
    return VisitFieldConfig.filter((field: Field<VisitInput>) =>
      missingFields.includes(String(field.name)),
    ).map((field: Field<VisitInput>) => {
      // Setup logic for reference fields
      if (field.type === "select" || field.type === "reference") {
        let url = "/api/";

        // Set proper URL based on field type
        if (field.name === "school") {
          url += "schools";
        } else if (field.name === "coach" || field.name === "owners") {
          url += "staff";
        }

        return {
          ...field,
          url,
        };
      }

      return field;
    });
  }, [missingFields]);

  // Create TanStack form with schema validation
  const form = useForm({
    defaultValues: importedVisit,
    validators: {
      onChange: VisitInputZodSchema,
      onSubmit: VisitInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as VisitInput);
    },
  });

  // If no missing fields, show success message
  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <Alert intent="success">
          <Alert.Title>All Required Information Available</Alert.Title>
          <Alert.Description>
            All required information has been imported successfully from
            Monday.com.
          </Alert.Description>
        </Alert>

        <div className="flex justify-end space-x-4">
          <Button
            intent="secondary"
            appearance="outline"
            onClick={onCancel}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            intent="primary"
            onClick={() => onSubmit(importedVisit as VisitInput)}
            disabled={disabled}
          >
            {disabled && <Spinner size="sm" className="mr-2" />}
            Complete Import
          </Button>
        </div>
      </div>
    );
  }

  // Show form for completing missing fields
  return (
    <div className="space-y-4">
      <Alert intent="info">
        <Alert.Title>Complete Missing Information</Alert.Title>
        <Alert.Description>
          <p>Please complete the following fields to import this visit:</p>
          <ul className="list-disc list-inside mt-1">
            {missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </Alert.Description>
      </Alert>

      <FormLayout
        title="Complete Visit Information"
        description="Fill in the missing fields to complete the import"
        submitLabel="Complete Import"
        onCancel={onCancel}
        isSubmitting={disabled}
        canSubmit={form.state.canSubmit}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {fields.map((fieldConfig: Field<VisitInput>) => (
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
    </div>
  );
}
