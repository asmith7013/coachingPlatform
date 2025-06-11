'use client';

import React, { useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Alert } from '@components/core/feedback/Alert';
import { TanStackForm } from '@tanstack-form/components/TanStackForm';
import { VisitInput } from '@zod-schema/visits/visit';
import { VisitInputZodSchema } from '@zod-schema/visits/visit';
import { visitFields } from '@forms/fieldConfig/integrations';

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
    return visitFields.filter(field => missingFields.includes(field.name));
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any; // Type assertion needed due to TanStack Form interface compatibility

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
      
      <TanStackForm
        form={form}
        fields={filteredFields}
        title="Complete Visit Information"
        description="The following fields need to be completed before this visit can be imported."
        submitLabel="Create Visit"
        cancelLabel="Cancel Import"
        onCancel={onCancel}
        loading={disabled}
      />
    </div>
  );
} 