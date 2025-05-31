'use client';

import React, { useState, useCallback } from 'react';
import { Dialog } from './Dialog';
import { Button } from '@/components/core';
import { Alert } from '@/components/core/feedback';
import { 
  UserGroupIcon, 
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { useErrorHandledMutation } from '@query/client/hooks/mutations/useErrorHandledMutation';
import { bulkCreateStaffWithSchoolLink } from '@actions/staff/operations';
import { createVisit } from '@actions/visits/visits';
import { AI_PROMPTS } from '@ui/data-import/schema-templates';
import { 
  validateStaffData, 
  validateVisitData, 
  createDataPreview 
} from '@lib/ui/data-import/validation-helpers';
import type { SchoolWithDates } from '@hooks/domain/useSchools';
import type { NYCPSStaffInput } from '@domain-types/staff';
import type { VisitInput } from '@domain-types/visit';

type DataType = 'staff' | 'visits';
type Step = 'selectDataType' | 'importData';

interface ImportData {
  staff: NYCPSStaffInput[];
  visits: VisitInput[];
}

interface DataImportDialogProps {
  open: boolean;
  onClose: () => void;
  school: SchoolWithDates;
}

export function DataImportDialog({ open, onClose, school }: DataImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>('selectDataType');
  const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null);
  const [importData, setImportData] = useState<ImportData>({ staff: [], visits: [] });
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  // Mutations
  const { mutate: createStaffMutation, isPending: creatingStaff } = useErrorHandledMutation(
    ([staffData, schoolId]: [NYCPSStaffInput[], string]) => 
      bulkCreateStaffWithSchoolLink(staffData, schoolId),
    {},
    "StaffCreation"
  );

  const { mutate: createVisitMutation, isPending: creatingVisit } = useErrorHandledMutation(
    (visitData: VisitInput) => createVisit(visitData),
    {},
    "VisitCreation"
  );

  // Data type options
  const dataTypeOptions = [
    {
      type: 'staff' as const,
      title: 'Staff Members',
      description: 'Add teachers, administrators, and other staff to this school',
      icon: UserGroupIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      type: 'visits' as const,
      title: 'Visits',
      description: 'Add coaching visits and classroom observations',
      icon: CalendarDaysIcon,
      color: 'bg-green-100 text-green-600'
    }
  ];

  // Copy to clipboard helper
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setCurrentStep('selectDataType');
    setSelectedDataType(null);
    setImportData({ staff: [], visits: [] });
    setJsonInput('');
    setValidationError('');
    setShowPrompt(false);
    onClose();
  }, [onClose]);

  // Handle data type selection
  const handleDataTypeSelect = useCallback((dataType: DataType) => {
    setSelectedDataType(dataType);
    setCurrentStep('importData');
  }, []);

  // Validation and parsing handler
  const handleValidateAndParse = useCallback((jsonString: string) => {
    if (!selectedDataType) return false;
    
    setValidationError('');
    
    if (selectedDataType === 'staff') {
      const result = validateStaffData(jsonString);
      if (!result.success || !result.data) {
        setValidationError(result.error || 'Validation failed');
        return false;
      }
      setImportData(prev => ({ ...prev, staff: result.data! }));
    } else if (selectedDataType === 'visits') {
      const result = validateVisitData(jsonString);
      if (!result.success || !result.data) {
        setValidationError(result.error || 'Validation failed');
        return false;
      }
      setImportData(prev => ({ ...prev, visits: result.data! }));
    }
    
    setJsonInput('');
    setShowPrompt(false);
    return true;
  }, [selectedDataType]);

  // Handle data creation
  const handleCreateData = useCallback(async () => {
    if (!selectedDataType) return;

    if (selectedDataType === 'staff' && importData.staff.length > 0) {
      createStaffMutation([importData.staff, school._id], {
        onSuccess: () => {
          alert('Staff members added successfully!');
          handleClose();
        },
        onError: (error) => {
          alert(`Failed to add staff: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    } else if (selectedDataType === 'visits' && importData.visits.length > 0) {
      try {
        for (const visit of importData.visits) {
          await new Promise<void>((resolve, reject) => {
            createVisitMutation({ ...visit, school: school._id }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            });
          });
        }
        alert('Visits added successfully!');
        handleClose();
      } catch (error) {
        alert(`Failed to add visits: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [selectedDataType, importData, school._id, createStaffMutation, createVisitMutation, handleClose]);

  // Render data type selection
  const renderDataTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Add Data to {school.schoolName}</h3>
        <p className="text-sm text-gray-600 mt-1">What type of information would you like to add?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataTypeOptions.map((option) => (
          <div 
            key={option.type}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
            onClick={() => handleDataTypeSelect(option.type)}
          >
            <div className="text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${option.color} mb-3`}>
                <option.icon className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">{option.title}</h4>
              <p className="text-xs text-gray-600">{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render data import
  const renderDataImport = () => {
    if (!selectedDataType) return null;

    const currentData = selectedDataType === 'staff' ? importData.staff : importData.visits;
    const hasData = currentData.length > 0;

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Import {selectedDataType === 'staff' ? 'Staff Members' : 'Visits'}
          </h3>
          <p className="text-sm text-gray-600">Adding {selectedDataType} to {school.schoolName}</p>
        </div>

        {!hasData ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-gray-300 p-6">
              <div className="text-center">
                <ClipboardDocumentIcon className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Import {selectedDataType === 'staff' ? 'Staff' : 'Visit'} Data
                  </h4>
                  <p className="mt-2 text-xs text-gray-600">
                    Copy the prompt, use it with AI, then paste the result back here
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    appearance="outline"
                    textSize="xs"
                    onClick={() => setShowPrompt(!showPrompt)}
                  >
                    {showPrompt ? 'Hide' : 'Show'} AI Prompt
                  </Button>
                </div>
              </div>
            </div>

            {showPrompt && (
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-gray-900">Copy this to AI:</h5>
                    <Button
                      appearance="outline"
                      textSize="xs"
                      onClick={() => copyToClipboard(AI_PROMPTS[selectedDataType])}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border overflow-x-auto max-h-32">
                    {AI_PROMPTS[selectedDataType]}
                  </pre>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1">
                    Paste AI response here:
                  </label>
                  <textarea
                    rows={6}
                    className="block w-full rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    placeholder="Paste the JSON response here..."
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                  {validationError && (
                    <Alert intent="error" className="mt-2">
                      <Alert.Description>{validationError}</Alert.Description>
                    </Alert>
                  )}
                  <div className="mt-2">
                    <Button
                      textSize="sm"
                      onClick={() => handleValidateAndParse(jsonInput)}
                      disabled={!jsonInput.trim()}
                    >
                      Import Data
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Alert intent="success">
              <CheckIcon className="h-5 w-5" />
              <Alert.Description>
                {selectedDataType === 'staff' ? 'Staff' : 'Visit'} data imported successfully!
              </Alert.Description>
            </Alert>

            {/* Data preview */}
            <div className="bg-white border rounded-lg p-3">
              <h5 className="text-xs font-medium text-gray-900 mb-2">Data Preview</h5>
              <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded overflow-x-auto max-h-32">
                {createDataPreview(currentData, selectedDataType)}
              </pre>
              <p className="text-xs text-gray-500 mt-1">
                {currentData.length} {selectedDataType} record(s) ready to be added
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} size="lg">
      <div className="p-6">
        {currentStep === 'selectDataType' ? renderDataTypeSelection() : renderDataImport()}

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            appearance="outline"
            onClick={() => {
              if (currentStep === 'selectDataType') {
                handleClose();
              } else {
                setCurrentStep('selectDataType');
                setSelectedDataType(null);
                setImportData({ staff: [], visits: [] });
                setShowPrompt(false);
              }
            }}
          >
            {currentStep === 'selectDataType' ? 'Cancel' : 'Back'}
          </Button>
          
          {currentStep === 'importData' && selectedDataType && (
            <>
              {importData[selectedDataType].length > 0 ? (
                <Button
                  intent="primary"
                  onClick={handleCreateData}
                  loading={creatingStaff || creatingVisit}
                >
                  Add {selectedDataType === 'staff' ? 'Staff' : 'Visits'} to School
                </Button>
              ) : (
                <Button
                  appearance="outline"
                  onClick={() => {
                    setImportData({ staff: [], visits: [] });
                    setShowPrompt(false);
                  }}
                  disabled={!importData[selectedDataType].length}
                >
                  Start Over
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
} 