'use client';

import { useState, useMemo } from 'react';
import { Button } from '@components/core/Button';
import { Alert } from '@components/core/feedback/Alert';
import { Spinner } from '@components/core/feedback/Spinner';
import { ResourceForm } from '@components/composed/forms';
import { VisitFieldConfig } from '@ui-forms/configurations';
import type { VisitInput } from '@zod-schema/visits/visit';
import type { Field } from '@ui-types/form';

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
  disabled = false
}: ImportCompletionFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<VisitInput>>(importedVisit);
  
  // Filter field config to only include missing fields
  const fields = useMemo(() => {
    // If no missing fields, return empty array
    if (missingFields.length === 0) {
      return [];
    }
    
    // Filter fields to only include missing ones
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
      <div className="space-y-4">
        <Alert intent="success">
          <Alert.Title>All Required Information Available</Alert.Title>
          <Alert.Description>
            All required information has been imported successfully from Monday.com.
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
            {missingFields.map(field => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </Alert.Description>
      </Alert>
      
      <ResourceForm
        title="Complete Visit Information"
        description="Fill in the missing fields to complete the import"
        fields={fields as Field[]}
        initialValues={formData}
        onSubmit={(data: VisitInput) => onSubmit(data)}
        onCancel={onCancel}
        showCancelButton={true}
        cancelLabel="Cancel Import"
        submitLabel="Complete Import"
        loading={disabled}
        onChange={(data: Partial<VisitInput>) => setFormData(data)}
      />
    </div>
  );
}