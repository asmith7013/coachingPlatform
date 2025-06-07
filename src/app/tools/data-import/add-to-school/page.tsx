'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/core';
import { Alert } from '@/components/core/feedback';
import { Card } from '@/components/composed/cards';
import { PageHeader } from '@/components/composed/layouts';
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  ClipboardDocumentIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSchools } from '@hooks/domain/useSchools';
import { useErrorHandledMutation } from '@/query/client/hooks/mutations/useStandardMutation';
import { bulkCreateStaffWithSchoolLink } from '@actions/staff/operations';
import { createVisit } from '@actions/visits/visits';
import { AI_PROMPTS } from '@ui/data-import/schema-templates';
import { 
  createDataPreview 
} from '@/lib/transformers/ui/data-preview';
import { validateVisitData, validateStaffData } from '@/lib/transformers/ui/form-validation';
import type { SchoolWithDates } from '@hooks/domain/useSchools';
import type { NYCPSStaffInput } from '@domain-types/staff';
import type { VisitInput } from '@domain-types/visit';
import { SingleSchool } from '@/components/domain/schools';

type DataType = 'staff' | 'visits';
type Step = 'selectSchool' | 'selectDataType' | 'importData';

interface ImportData {
  staff: NYCPSStaffInput[];
  visits: VisitInput[];
}

export default function AddToSchoolPage() {
  const router = useRouter();
  const { list: schoolsList } = useSchools;
  const { items: schools = [], isLoading: schoolsLoading } = schoolsList();
  
  const [currentStep, setCurrentStep] = useState<Step>('selectSchool');
  const [selectedSchool, setSelectedSchool] = useState<SchoolWithDates | null>(null);
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

  // Handle school selection
  const handleSchoolSelect = useCallback((school: SchoolWithDates) => {
    setSelectedSchool(school);
    setCurrentStep('selectDataType');
  }, []);

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
    if (!selectedSchool || !selectedDataType) return;

    if (selectedDataType === 'staff' && importData.staff.length > 0) {
      createStaffMutation([importData.staff, selectedSchool._id], {
        onSuccess: () => {
          alert('Staff members added successfully!');
          router.push('/dashboard/schoolList');
        },
        onError: (error) => {
          alert(`Failed to add staff: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
    } else if (selectedDataType === 'visits' && importData.visits.length > 0) {
      // For visits, create them one by one (could be optimized to bulk later)
      try {
        for (const visit of importData.visits) {
          await new Promise<void>((resolve, reject) => {
            createVisitMutation({ ...visit, school: selectedSchool._id }, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            });
          });
        }
        alert('Visits added successfully!');
        router.push('/dashboard/schoolList');
      } catch (error) {
        alert(`Failed to add visits: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [selectedSchool, selectedDataType, importData, createStaffMutation, createVisitMutation, router]);

  // Render school selection
  const renderSchoolSelection = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-900/10 pb-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">Select School</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          Choose which school you want to add data to
        </p>
      </div>

      {schoolsLoading ? (
        <div className="text-center py-8">Loading schools...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school: SchoolWithDates) => (
            <div key={school._id} onClick={() => handleSchoolSelect(school)}>
              <SingleSchool schoolId={school._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render data type selection
  const renderDataTypeSelection = () => (
    <div className="space-y-6">
      <div className="border-b border-gray-900/10 pb-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Add Data to {selectedSchool?.schoolName}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">
          What type of information would you like to add?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dataTypeOptions.map((option) => (
          <div 
            key={option.type}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleDataTypeSelect(option.type)}
          >
            <Card>
              <Card.Body className="p-6 text-center">
                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${option.color} mb-4`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.description}</p>
              </Card.Body>
            </Card>
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
      <div className="space-y-6">
        <div className="border-b border-gray-900/10 pb-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            Import {selectedDataType === 'staff' ? 'Staff Members' : 'Visits'}
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Adding {selectedDataType} to {selectedSchool?.schoolName}
          </p>
        </div>

        {!hasData ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-gray-300 p-6">
              <div className="text-center">
                <ClipboardDocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Import {selectedDataType === 'staff' ? 'Staff' : 'Visit'} Data
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Copy the prompt, use it with AI, then paste the result back here
                  </p>
                </div>
                <div className="mt-6">
                  <Button
                    intent="primary"
                    onClick={() => setShowPrompt(!showPrompt)}
                  >
                    {showPrompt ? 'Hide' : 'Show'} AI Prompt
                  </Button>
                </div>
              </div>
            </div>

            {showPrompt && (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Copy this to AI:</h4>
                    <Button
                      appearance="outline"
                      textSize="sm"
                      onClick={() => copyToClipboard(AI_PROMPTS[selectedDataType])}
                    >
                      Copy Prompt
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto">
                    {AI_PROMPTS[selectedDataType]}
                  </pre>
                </div>

                <div>
                  <label htmlFor="data-json" className="block text-sm font-medium leading-6 text-gray-900">
                    Paste AI response here:
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="data-json"
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
                      onClick={() => handleValidateAndParse(jsonInput)}
                      disabled={!jsonInput.trim()}
                    >
                      Import {selectedDataType === 'staff' ? 'Staff' : 'Visit'} Data
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
            <Card className="mt-4">
              <Card.Body>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Data Preview</h4>
                <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto max-h-40">
                  {createDataPreview(currentData, selectedDataType)}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  {currentData.length} {selectedDataType} record(s) ready to be added
                </p>
              </Card.Body>
            </Card>

            <div className="flex gap-3">
              <Button
                intent="primary"
                onClick={handleCreateData}
                loading={creatingStaff || creatingVisit}
              >
                Add {selectedDataType === 'staff' ? 'Staff' : 'Visits'} to School
              </Button>
              <Button
                appearance="outline"
                onClick={() => {
                  setImportData({ staff: [], visits: [] });
                  setShowPrompt(false);
                }}
              >
                Start Over
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'selectSchool':
        return renderSchoolSelection();
      case 'selectDataType':
        return renderDataTypeSelection();
      case 'importData':
        return renderDataImport();
      default:
        return renderSchoolSelection();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Button
          appearance="outline"
          onClick={() => {
            if (currentStep === 'selectSchool') {
              router.push('/tools/data-import');
            } else if (currentStep === 'selectDataType') {
              setCurrentStep('selectSchool');
            } else {
              setCurrentStep('selectDataType');
            }
          }}
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <PageHeader title="Add Data to School" />
      <p className="mt-2 text-sm text-gray-600 mb-8">
        Select a school and add staff, visits, or other information using AI assistance
      </p>

      {renderCurrentStep()}
    </div>
  );
} 