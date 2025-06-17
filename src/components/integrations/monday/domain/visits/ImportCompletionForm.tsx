'use client';

import React, { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Alert } from '@components/core/feedback/Alert';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';
import { VisitInput } from '@zod-schema/visits/visit';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import { VisitFieldConfig } from '@forms/fieldConfig/integrations';
import type { Field } from '@ui-types/form';

/**
 * Props for the ImportCompletionForm component
 */
interface ImportCompletionFormProps {
  importedVisit: Partial<VisitInput>;
  missingFields: string[];
  onSubmit: (data: VisitInput) => void;
  onCancel: () => void;
  disabled?: boolean;
  // Unused props kept for interface compatibility
  boardId?: string;
  mondayItemName?: string;
  mondayUserName?: string;
}

export function ImportCompletionForm({
  importedVisit,
  onSubmit,
  onCancel,
  missingFields,
  disabled = false
}: ImportCompletionFormProps) {
  // Filter fields to only include missing ones
  const filteredFields = useMemo(() => {
    return VisitFieldConfig.filter((field: Field<VisitInput>) => 
      missingFields.includes(String(field.name))
    );
  }, [missingFields]);

  // Create TanStack form with schema validation
  const form = useForm({
    defaultValues: importedVisit,
    validators: {
      onChange: VisitInputZodSchema,
      onSubmit: VisitInputZodSchema
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as VisitInput);
    }
  });

  // Show message if no missing fields
  if (missingFields.length === 0) {
    return (
      <Alert intent="success">
        <Alert.Title>Ready to Import</Alert.Title>
        <Alert.Description>
          All required fields are present. This visit can be imported as-is.
        </Alert.Description>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert intent="info" className="mb-4">
        <Alert.Title>Complete Missing Information</Alert.Title>
        <Alert.Description>
          <p>Please complete the following fields to import this visit:</p>
          <ul className="list-disc list-inside mt-1">
            {missingFields.map(field => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </Alert.Description>
      </Alert>
      
      <FormLayout
        title="Complete Visit Information"
        description="The following fields need to be completed before this visit can be imported."
        submitLabel="Create Visit"
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
          {filteredFields.map((fieldConfig: Field<VisitInput>) => (
            <div key={String(fieldConfig.name)} className="space-y-2">
              <label
                htmlFor={String(fieldConfig.name)}
                className="text-sm font-medium leading-none"
              >
                {fieldConfig.label}
              </label>
              
              <form.Field name={String(fieldConfig.name)}>
                {(field) => (
                  <div className="space-y-1">
                    {['text', 'email', 'password', 'number', 'date'].includes(fieldConfig.type) && (
                      <Input
                        type={fieldConfig.type}
                        value={String(field.state.value ?? '')}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                      />
                    )}
                    {fieldConfig.type === 'select' && (
                      fieldConfig.multiple ? (
                        <Select
                          value={Array.isArray(field.state.value) ? field.state.value as string[] : []}
                          onChange={field.handleChange}
                          options={fieldConfig.options || []}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled}
                          multiple={true}
                        />
                      ) : (
                        <Select
                          value={typeof field.state.value === 'string' ? field.state.value as string : ''}
                          onChange={field.handleChange}
                          options={fieldConfig.options || []}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled}
                        />
                      )
                    )}
                    {fieldConfig.type === 'reference' && (
                      <ReferenceSelect
                        url={fieldConfig.url || ''}
                        value={field.state.value as string | string[]}
                        onChange={field.handleChange}
                        multiple={fieldConfig.multiple}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        entityType={fieldConfig.entityType}
                        label={fieldConfig.label}
                      />
                    )}
                    {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          ))}
        </form>
      </FormLayout>
    </div>
  );
} 