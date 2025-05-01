'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Button } from '@/components/core/Button';
import { ResourceForm, type Field } from '@/components/composed/forms/UpdatedResourceForm';
import { VisitFieldConfig } from '@/lib/ui/forms/fieldConfig/visits/visit';
import { VisitInputZodSchema } from '@/lib/data-schema/zod-schema/visits/visit';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';

interface ImportCompletionFormProps {
  importedVisit: Partial<VisitInput>;
  onSubmit: (data: VisitInput) => Promise<void>;
  onCancel: () => void;
  missingFields: string[];
}

export function ImportCompletionForm({
  importedVisit,
  onSubmit,
  onCancel,
  missingFields
}: ImportCompletionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter field config to only include missing fields
  const fields = useMemo(() => {
    // Filter the field config to only include fields that need completion
    return VisitFieldConfig
      .filter(field => missingFields.includes(field.key as string))
      .map(field => {
        // For reference fields, ensure they have proper URL properties
        if (field.type === 'reference') {
          let url = '/api/reference/';
          
          // Set proper URL based on field type
          if (field.key === 'school') {
            url += 'schools';
          } else if (field.key === 'coach' || field.key === 'owners') {
            url += 'staff';
          }
          
          return {
            ...field,
            url
          };
        }
        
        return field;
      });
  }, [missingFields]);
  
  // Handle form submission
  const handleSubmit = async (formData: Partial<VisitInput>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Combine imported data with form data
      const completeVisit = {
        ...importedVisit,
        ...formData
      };
      
      // Try to validate against schema
      const parseResult = VisitInputZodSchema.safeParse(completeVisit);
      if (!parseResult.success) {
        setError('Some required fields are still missing or invalid');
        setLoading(false);
        return;
      }
      
      await onSubmit(parseResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };
  
  // If no missing fields, show success message
  if (fields.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Alert intent="success">
            <Alert.Title>No Additional Information Needed</Alert.Title>
            <Alert.Description>
              All required information has been imported successfully.
            </Alert.Description>
          </Alert>
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={() => onSubmit(importedVisit as VisitInput)}
              loading={loading}
            >
              Continue
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <ResourceForm
      title="Complete Visit Information"
      description="Please provide the missing information required to create this visit."
      fields={fields as Field<Record<string, unknown>>[]}
      initialValues={importedVisit}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      showCancelButton={true}
      cancelLabel="Cancel Import"
      loading={loading}
      error={error || undefined}
      submitLabel="Create Visit"
    />
  );
} 