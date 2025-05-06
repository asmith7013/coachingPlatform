'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Button } from '@/components/core/Button';
import { ResourceForm, type Field } from '@/components/composed/forms';
import { VisitFieldConfig } from '@/lib/ui/forms/fieldConfig/visits/visit';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';

/**
 * Props for the ImportCompletionForm component
 */
interface ImportCompletionFormProps {
  importedVisit: Partial<VisitInput>;
  onSubmit: (data: VisitInput) => void;
  onCancel: () => void;
  missingFields: string[];
  boardId?: string; // Made optional since it's not used in this component
  mondayItemName?: string; // Made optional since it's not used in this component
  mondayUserName?: string; // Made optional since it's not used in this component
  disabled?: boolean;
}

export function ImportCompletionForm({
  importedVisit,
  onSubmit,
  onCancel,
  missingFields,
  // Rename these to match interface and use _ prefix for unused props
  boardId: _boardId,
  mondayItemName: _mondayItemName,
  mondayUserName: _mondayUserName,
  disabled = false
}: ImportCompletionFormProps) {
  const [formData, setFormData] = useState<Partial<VisitInput>>(importedVisit);
  
  // Filter field config to only include missing fields
  const fields = useMemo(() => {
    return VisitFieldConfig
      .filter(field => missingFields.includes(field.key as string))
      .map(field => {
        // Setup logic for reference fields
        if (field.type === 'select' || field.type === 'reference') {
          let url = '/api/';
          
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
  
  // If no missing fields, show success message
  if (fields.length === 0) {
    return (
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Complete Import</h3>
        </Card.Header>
        <Card.Body>
          <Alert intent="success">
            <Alert.Title>All Information Ready</Alert.Title>
            <Alert.Description>
              All required information has been imported successfully from Monday.com.
            </Alert.Description>
          </Alert>
          <div className="mt-4 flex justify-end gap-2">
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
              Import Visit
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Show form for completing missing fields
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
      
      <ResourceForm
        title="Complete Visit Information"
        description="The following fields need to be completed before this visit can be imported."
        fields={fields as Field<VisitInput>[]}
        initialValues={formData}
        onSubmit={(data: VisitInput) => onSubmit(data)}
        onCancel={onCancel}
        showCancelButton={true}
        cancelLabel="Cancel Import"
        loading={disabled}
        submitLabel="Create Visit"
        onChange={(data: Partial<VisitInput>) => setFormData(data)}
      />
    </div>
  );
} 