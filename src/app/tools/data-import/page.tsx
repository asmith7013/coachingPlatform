'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/core';
import { Alert } from '@/components/core/feedback';
import { Card } from '@/components/composed/cards';
import { PageHeader } from '@/components/composed/layouts';
import { ClipboardDocumentIcon, CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSchools } from '@hooks/domain/useSchools';
import { useErrorHandledMutation } from '@query/client/hooks/mutations/useErrorHandledMutation';
import { bulkCreateStaffWithSchoolLink } from '@actions/staff/operations';
import { createSchool } from '@actions/schools/schools';
import { AI_PROMPTS } from '@ui/data-import/schema-templates';
import { 
  validateSchoolData, 
  validateStaffData, 
  validateServerResponse,
  createDataPreview,
  type ImportDataType 
} from '@ui/data-import/validation-helpers';
import type { SchoolInput } from '@domain-types/school';
import type { NYCPSStaffInput } from '@domain-types/staff';

type ImportStep = 'school' | 'staff' | 'review';

interface ImportData {
  school: SchoolInput | null;
  staff: NYCPSStaffInput[];
  createdSchoolId?: string;
}

export default function DataImportPage() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('school');
  const [importData, setImportData] = useState<ImportData>({
    school: null,
    staff: []
  });
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  // Use domain hooks instead of direct mutations
  const schoolMutations = useSchools.mutations();
  const { isCreating: creatingSchool } = schoolMutations;

  // Staff mutation using the existing bulk creation
  const {
    mutate: createStaffMutation,
    isPending: creatingStaff
  } = useErrorHandledMutation(
    ([staffData, schoolId]: [NYCPSStaffInput[], string]) => 
      bulkCreateStaffWithSchoolLink(staffData, schoolId),
    {},
    "StaffCreation"
  );

  // Validation and parsing handler with enhanced error handling
  const handleValidateAndParse = useCallback((jsonString: string, type: ImportDataType) => {
    setValidationError('');

    if (type === 'school') {
      const result = validateSchoolData(jsonString);
      if (!result.success || !result.data) {
        setValidationError(result.error || 'Validation failed');
        return false;
      }
      setImportData(prev => ({ ...prev, school: result.data! }));
    } else if (type === 'staff') {
      const result = validateStaffData(jsonString);
      if (!result.success || !result.data) {
        setValidationError(result.error || 'Validation failed');
        return false;
      }
      setImportData(prev => ({ ...prev, staff: result.data! }));
    }
    
    setJsonInput('');
    setShowPrompt(false);
    return true;
  }, []);

  // Copy to clipboard helper
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // School creation handler with enhanced error handling
  const handleCreateSchool = useCallback(async () => {
    if (!importData.school || !createSchool) return;

    try {
      // Use the server action directly to get the raw response
      const rawResult = await createSchool(importData.school);
      
      // Use enhanced response validation
      const validatedResult = validateServerResponse<{ _id: string }>(rawResult);
      
      if (!validatedResult.success) {
        throw new Error(validatedResult.error);
      }
      
      const createdSchool = validatedResult.data?.[0];
      if (createdSchool?._id) {
        setImportData(prev => ({ 
          ...prev, 
          createdSchoolId: createdSchool._id 
        }));
        alert('School created successfully!');
      }
    } catch (error) {
      console.error('Error creating school:', error);
      alert(`Failed to create school: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [importData.school]);

  // Combined creation handler with enhanced error handling
  const handleCreateWithStaff = useCallback(async () => {
    if (!importData.school || !createSchool) return;

    try {
      // Use the server action directly to get the raw response
      const rawSchoolResult = await createSchool(importData.school);
      const validatedSchoolResult = validateServerResponse<{ _id: string }>(rawSchoolResult);
      
      if (!validatedSchoolResult.success) {
        throw new Error(validatedSchoolResult.error);
      }
      
      const createdSchool = validatedSchoolResult.data?.[0];
      if (createdSchool?._id) {
        setImportData(prev => ({ ...prev, createdSchoolId: createdSchool._id }));
        
        // Create staff with validation
        if (importData.staff.length > 0) {
          createStaffMutation([importData.staff, createdSchool._id], {
            onSuccess: (rawStaffResult) => {
              const validatedStaffResult = validateServerResponse(rawStaffResult);
              
              if (validatedStaffResult.success) {
                const successCount = validatedStaffResult.data?.length || 0;
                alert(`School created successfully! ${successCount} out of ${importData.staff.length} staff members created.`);
              } else {
                console.warn('Staff creation had issues:', validatedStaffResult.error);
                alert('School created successfully, but there were issues creating some staff members.');
              }
            },
            onError: (error) => {
              console.error('Staff creation failed:', error);
              alert('School created successfully, but staff creation failed.');
            }
          });
        } else {
          alert('School created successfully!');
        }
      }
    } catch (error) {
      console.error('Error creating school and staff:', error);
      alert(`Failed to create school and staff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [importData.school, importData.staff, createStaffMutation]);

  // Data preview component
  const renderDataPreview = useCallback((data: SchoolInput | NYCPSStaffInput[], type: 'school' | 'staff') => {
    const previewData = createDataPreview(data, type);
    
    return (
      <Card className="mt-4">
        <Card.Body>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Data Preview</h4>
          <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto max-h-40">
            {previewData}
          </pre>
          <p className="text-xs text-gray-500 mt-2">
            This is how your data will be processed and stored.
          </p>
        </Card.Body>
      </Card>
    );
  }, []);

  // Render JSON import section with schema-driven prompts
  const renderJsonImportSection = useCallback((
    type: ImportDataType,
    title: string,
    _description: string
  ) => (
    <div className="space-y-4">
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Copy this to AI:</h4>
          <Button
            appearance="outline"
            textSize="sm"
            onClick={() => copyToClipboard(AI_PROMPTS[type])}
          >
            Copy Prompt
          </Button>
        </div>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto">
          {AI_PROMPTS[type]}
        </pre>
      </div>

      <div>
        <label htmlFor={`${type}-json`} className="block text-sm font-medium leading-6 text-gray-900">
          Paste AI response here:
        </label>
        <div className="mt-2">
          <textarea
            id={`${type}-json`}
            rows={8}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Paste the JSON response here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>
        {validationError && (
          <Alert intent="error" className="mt-2">
            <Alert.Description>{validationError}</Alert.Description>
          </Alert>
        )}
        <div className="mt-3">
          <Button
            intent="primary"
            onClick={() => handleValidateAndParse(jsonInput, type)}
            disabled={!jsonInput.trim()}
          >
            Import {title} Data
          </Button>
        </div>
      </div>
    </div>
  ), [jsonInput, validationError, handleValidateAndParse, copyToClipboard]);

  // School step render
  const renderSchoolStep = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-900/10 pb-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">School Information</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Use AI to populate your school data from any format
        </p>
      </div>

      {!importData.school ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-dashed border-gray-300 p-6">
            <div className="text-center">
              <ClipboardDocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-900">Import School Data</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Copy the prompt, use it with AI, then paste the result back here
                </p>
              </div>
              <div className="mt-6">
                <Button
                  intent="primary"
                  onClick={() => setShowPrompt(!showPrompt)}
                >
                  <ChevronDownIcon className={`h-4 w-4 mr-2 transition-transform ${showPrompt ? 'rotate-180' : ''}`} />
                  {showPrompt ? 'Hide' : 'Show'} AI Prompt
                </Button>
              </div>
            </div>
          </div>

          {showPrompt && renderJsonImportSection('school', 'School', 'school information')}
        </div>
      ) : (
        <div className="space-y-4">
          <Alert intent="success">
            <CheckIcon className="h-5 w-5" />
            <Alert.Description>School data imported successfully!</Alert.Description>
          </Alert>
          
          <Card>
            <Card.Body>
              <h3 className="text-lg font-medium text-gray-900">{importData.school.schoolName}</h3>
              <p className="text-sm text-gray-600">District: {importData.school.district}</p>
              {importData.school.address && (
                <p className="text-sm text-gray-600">Address: {importData.school.address}</p>
              )}
              {importData.school.gradeLevelsSupported && importData.school.gradeLevelsSupported.length > 0 && (
                <p className="text-sm text-gray-600">
                  Grades: {importData.school.gradeLevelsSupported.join(', ')}
                </p>
              )}
            </Card.Body>
          </Card>

          {/* Add data preview for school */}
          {renderDataPreview(importData.school, 'school')}

          <div className="flex gap-3">
            <Button
              intent="primary"
              onClick={() => setCurrentStep('staff')}
            >
              Add Staff Members
            </Button>
            <Button
              appearance="outline"
              onClick={handleCreateSchool}
              loading={creatingSchool}
            >
              Create School Only
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Staff step render
  const renderStaffStep = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-900/10 pb-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Staff Information</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Add staff members for {importData.school?.schoolName}
        </p>
      </div>

      <div className="space-y-4">
        {renderJsonImportSection('staff', 'Staff', 'staff members')}

        {importData.staff.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Added Staff ({importData.staff.length}):</h4>
            {importData.staff.map((staff, index) => (
              <Card key={index}>
                <Card.Body className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-gray-900">{staff.staffName}</h5>
                      <p className="text-sm text-gray-600">{staff.email}</p>
                      {staff.rolesNYCPS && staff.rolesNYCPS.length > 0 && (
                        <p className="text-sm text-gray-600">Role: {staff.rolesNYCPS.join(', ')}</p>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
            
            {/* Add data preview for staff */}
            {renderDataPreview(importData.staff, 'staff')}
            
            <Button
              appearance="outline"
              onClick={() => setCurrentStep('review')}
            >
              Continue to Review
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Review step render
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-900/10 pb-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Review & Create</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Review your data before creating
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <Card.Body>
            <h3 className="text-lg font-semibold">School: {importData.school?.schoolName}</h3>
            <p>District: {importData.school?.district}</p>
            <p>Staff Members: {importData.staff.length}</p>
          </Card.Body>
        </Card>

        <div className="flex gap-3">
          <Button
            intent="primary"
            onClick={handleCreateWithStaff}
            loading={creatingSchool || creatingStaff}
          >
            Create School & Staff
          </Button>
          <Button
            appearance="outline"
            onClick={() => setCurrentStep('staff')}
          >
            Back to Staff
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'school':
        return renderSchoolStep();
      case 'staff':
        return renderStaffStep();
      case 'review':
        return renderReviewStep();
      default:
        return renderSchoolStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader 
        title="AI Data Import"
      />
      <p className="mt-2 text-sm text-gray-600 mb-8">
        Import schools and staff using AI-assisted JSON generation
      </p>
      
      <div className="mt-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 