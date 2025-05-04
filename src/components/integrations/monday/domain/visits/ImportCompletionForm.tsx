'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/composed/cards/Card';
import { Alert } from '@/components/core/feedback/Alert';
import { Button } from '@/components/core/Button';
import { Spinner } from '@/components/core/feedback/Spinner';
import { ResourceForm, type Field } from '@/components/composed/forms/UpdatedResourceForm';
import { VisitFieldConfig } from '@/lib/ui/forms/fieldConfig/visits/visit';
import { VisitInputZodSchema } from '@/lib/data-schema/zod-schema/visits/visit';
import type { VisitInput } from '@/lib/data-schema/zod-schema/visits/visit';
import { Heading } from '@/components/core/typography/Heading';
import { Text } from '@/components/core/typography/Text';

interface ImportCompletionFormProps {
  importedVisit: Partial<VisitInput>;
  onSubmit: (data: VisitInput) => Promise<void>;
  onCancel: () => void;
  missingFields: string[];
  boardId?: string; // Optional board ID for reference
  mondayItemName?: string; // Optional item name for reference
  mondayUserName?: string; // Optional Monday user name (from token)
}

export function ImportCompletionForm({
  importedVisit,
  onSubmit,
  onCancel,
  missingFields,
  boardId,
  mondayItemName,
  mondayUserName
}: ImportCompletionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VisitInput>>({});
  
  // Reset form data when imported visit changes
  useEffect(() => {
    setFormData(importedVisit || {});
  }, [importedVisit]);
  
  // Enhanced debugging for completed/missing data
  const debugInfo = useMemo(() => {
    return {
      importedFields: Object.keys(importedVisit || {}),
      missingFields,
      completedData: { ...importedVisit, ...formData }
    };
  }, [importedVisit, missingFields, formData]);
  
  // Log out helpful debugging info
  useEffect(() => {
    console.log('Import Completion Form Debug Info:', debugInfo);
  }, [debugInfo]);
  
  // Filter field config to only include missing fields
  const fields = useMemo(() => {
    // Filter the field config to only include fields that need completion
    return VisitFieldConfig
      .filter(field => missingFields.includes(field.key as string))
      .map(field => {
        // For reference fields, ensure they have proper URL properties
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
  
  // Handle form submission
  const handleSubmit = async (submittedData: Partial<VisitInput>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Track the form data for preview purposes
      setFormData(submittedData);
      
      // Combine imported data with form data
      const completeVisit = {
        ...importedVisit,
        ...submittedData
      };
      
      // Log the combined data
      console.log('Combined data before submission:', completeVisit);
      
      // Try to validate against schema
      const parseResult = VisitInputZodSchema.safeParse(completeVisit);
      if (!parseResult.success) {
        console.error('Validation errors:', parseResult.error.format());
        setError('Some required fields are still missing or invalid');
        setLoading(false);
        return;
      }
      
      await onSubmit(parseResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  // If no missing fields, show success message
  if (fields.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Heading level="h3">Complete Import</Heading>
        </Card.Header>
        <Card.Body>
          <Alert intent="success">
            <Alert.Title>All Information Ready</Alert.Title>
            <Alert.Description>
              All required information has been imported successfully from Monday.com.
              {mondayItemName && (
                <p className="mt-2">
                  Monday Item: <strong>{mondayItemName}</strong>
                </p>
              )}
              {mondayUserName && (
                <p className="text-sm text-gray-600 mt-1">
                  Connected as: {mondayUserName}
                </p>
              )}
            </Alert.Description>
          </Alert>
          <div className="mt-4 flex justify-end gap-2">
            <Button 
              intent="secondary"
              appearance="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              intent="primary"
              onClick={() => handleSubmit(importedVisit)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Importing...
                </>
              ) : "Import Visit"}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Show form for completing missing fields
  return (
    <div className="space-y-4">
      {/* Source information */}
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h3" className="text-lg font-medium">
              Importing from Monday.com
            </Heading>
            {mondayUserName && (
              <Text className="text-sm text-gray-600">
                Connected as: {mondayUserName}
              </Text>
            )}
          </div>
          {mondayItemName && (
            <div className="text-right">
              <Text className="text-sm font-medium">Item:</Text>
              <Text className="text-sm">{mondayItemName}</Text>
              {boardId && (
                <Text className="text-xs text-gray-500">
                  Board ID: {boardId}
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Missing fields alert */}
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
        fields={fields as Field<Record<string, unknown>>[]}
        initialValues={formData}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        showCancelButton={true}
        cancelLabel="Cancel Import"
        loading={loading}
        error={error || undefined}
        submitLabel="Create Visit"
      />
      
      {/* Data preview */}
      <Card className="mt-4 bg-gray-50">
        <Card.Header>
          <Heading level="h4">Data Preview</Heading>
        </Card.Header>
        <Card.Body>
          <Text className="text-sm text-gray-600 mb-2">
            This is what will be imported after you complete the form:
          </Text>
          <div className="bg-white p-3 rounded border text-sm overflow-auto max-h-60">
            <pre>{JSON.stringify({ ...importedVisit, ...formData }, null, 2)}</pre>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
} 