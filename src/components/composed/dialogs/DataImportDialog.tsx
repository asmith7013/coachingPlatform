'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Dialog } from './Dialog';
import { Button, Alert } from '@core-components';
import { 
  UserGroupIcon, 
  CalendarDaysIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useErrorHandledMutation } from '@/query/client/hooks/mutations/useStandardMutation';
import { bulkCreateStaffWithSchoolLink } from '@actions/staff/operations';
import { createVisit } from '@actions/visits/visits';
import { createBellSchedule, createMasterSchedule } from '@actions/schedule/schedule';
import { AI_PROMPTS, createMasterSchedulePrompt } from '@ui/data-import/schema-templates';
import { createDataPreview, validateVisitData, validateStaffData, validateBellScheduleData, validateMasterScheduleData } from '@transformers/ui';
import type { SchoolWithDates } from '@hooks/domain/useSchools';
import type { NYCPSStaffInput } from '@domain-types/staff';
import type { VisitInput } from '@domain-types/visit';
import type { BellScheduleInput, TeacherScheduleInput } from '@zod-schema/schedule/schedule';
import type { NYCPSStaffWithDates } from '@hooks/domain/useNYCPSStaff';
import { useNYCPSStaffList } from '@hooks/domain/useNYCPSStaff';

type DataType = 'staff' | 'visits' | 'bellSchedules' | 'masterSchedule';
type Step = 'selectDataType' | 'importData';

interface ProcessedTeacherSchedule extends TeacherScheduleInput {
  teacherEmail: string;
  teacherName: string;
}

interface ImportData {
  staff: NYCPSStaffInput[];
  visits: VisitInput[];
  bellSchedules: BellScheduleInput[];
  masterSchedule: ProcessedTeacherSchedule[];
}

interface DataImportDialogProps {
  open: boolean;
  onClose: () => void;
  school: SchoolWithDates;
}

export function DataImportDialog({ open, onClose, school }: DataImportDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>('selectDataType');
  const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null);
  const [importData, setImportData] = useState<ImportData>({ staff: [], visits: [], bellSchedules: [], masterSchedule: [] });
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  // Fetch staff for this school
  const { 
    items: allStaff, 
    isLoading: _isLoadingStaff 
  } = useNYCPSStaffList({
    filters: { schools: school._id },
    enabled: open // Only fetch when dialog is open
  });

  // Generate school staff list for AI prompt
  const schoolStaff = useMemo(() => {
    if (!allStaff) return [];
    
    return allStaff
      .filter((staff: NYCPSStaffWithDates) => staff.schools?.includes(school._id))
      .map((staff: NYCPSStaffWithDates) => ({
        staffName: staff.staffName,
        email: staff.email
      }));
  }, [allStaff, school._id]);

  // Generate dynamic master schedule prompt
  const masterSchedulePrompt = useMemo(() => {
    if (schoolStaff.length === 0) {
      return `No staff members found for this school. Please add staff members first before creating a master schedule.`;
    }
    
    return createMasterSchedulePrompt(schoolStaff);
  }, [schoolStaff]);

  // Get the appropriate AI prompt based on data type
  const getAIPrompt = useCallback(() => {
    if (!selectedDataType) return '';
    
    if (selectedDataType === 'masterSchedule') {
      return masterSchedulePrompt;
    }
    
    return AI_PROMPTS[selectedDataType];
  }, [selectedDataType, masterSchedulePrompt]);

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

  const { mutate: createBellScheduleMutation, isPending: creatingBellSchedule } = useErrorHandledMutation(
    (scheduleData: BellScheduleInput) => createBellSchedule(scheduleData),
    {},
    "BellScheduleCreation"
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
    },
    {
      type: 'bellSchedules' as const,
      title: 'Bell Schedules',
      description: 'Add daily schedules and class periods for this school',
      icon: ClockIcon,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      type: 'masterSchedule' as const,
      title: 'Master Schedule',
      description: 'Add master schedule for this school',
      icon: AcademicCapIcon,
      color: 'bg-pink-100 text-pink-600'
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
    setImportData({ staff: [], visits: [], bellSchedules: [], masterSchedule: [] });
    setJsonInput('');
    setValidationError('');
    setShowPrompt(false);
    onClose();
  }, [onClose]);

  // Enhanced data type selection with staff validation
  const handleDataTypeSelect = useCallback((dataType: DataType) => {
    // Check if master schedule requires staff
    if (dataType === 'masterSchedule' && schoolStaff.length === 0) {
      alert('Please add staff members to this school before creating a master schedule.');
      return;
    }
    
    setSelectedDataType(dataType);
    setCurrentStep('importData');
  }, [schoolStaff.length]);

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
    } else if (selectedDataType === 'bellSchedules') {
      const result = validateBellScheduleData(jsonString);
      if (!result.success || !result.data) {
        setValidationError(result.error || 'Validation failed');
        return false;
      }
      
      // Auto-fill school and owners for each bell schedule
      const scheduleWithSchool = result.data.map(schedule => ({
        ...schedule,
        school: school._id,
        owners: [] // Or use school.owners if available
      }));
      
      setImportData(prev => ({ ...prev, bellSchedules: scheduleWithSchool }));
    } else if (selectedDataType === 'masterSchedule') {
      const result = validateMasterScheduleData(jsonString, school._id, schoolStaff);
      if (!result.success || !result.data) {
        setValidationError(result.error || 'Validation failed');
        return false;
      }
      
      // Auto-fill school and owners for each master schedule
      const scheduleWithSchool = result.data.map(schedule => ({
        ...schedule,
        school: school._id,
        owners: [] // Or use school.owners if available
      }));
      
      setImportData(prev => ({ ...prev, masterSchedule: scheduleWithSchool }));
    }
    
    setJsonInput('');
    setShowPrompt(false);
    return true;
  }, [selectedDataType, school._id, schoolStaff]);

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
    } else if (selectedDataType === 'bellSchedules' && importData.bellSchedules.length > 0) {
      try {
        for (const schedule of importData.bellSchedules) {
          await new Promise<void>((resolve, reject) => {
            createBellScheduleMutation(schedule, {
              onSuccess: () => resolve(),
              onError: (error) => reject(error)
            });
          });
        }
        alert('Bell schedules added successfully!');
        handleClose();
      } catch (error) {
        alert(`Failed to add bell schedules: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (selectedDataType === 'masterSchedule' && importData.masterSchedule.length > 0) {
      try {
        // Call the batch function instead of individual creates
        const result = await createMasterSchedule(importData.masterSchedule, school._id);
        
        if (result.success && result.data) {
          const { data } = result;
          const successMsg = `Master schedule created! ${data.successfulSchedules}/${data.totalSchedules} schedules added successfully.`;
          
          if (data.errors.length > 0) {
            alert(`${successMsg}\n\nErrors:\n${data.errors.join('\n')}`);
          } else {
            alert(successMsg);
          }
          
          handleClose();
        } else {
          throw new Error(result.error || 'Failed to create master schedule');
        }
      } catch (error) {
        alert(`Failed to add master schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [selectedDataType, importData, school._id, createStaffMutation, createVisitMutation, createBellScheduleMutation, handleClose]);

  // Render data type selection
  const renderDataTypeSelection = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Add Data to {school.schoolName}</h3>
        <p className="text-sm text-gray-600 mt-1">What type of information would you like to add?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

    // Show loading state while fetching staff for master schedule
    if (selectedDataType === 'masterSchedule' && _isLoadingStaff) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-600">Loading school staff...</div>
        </div>
      );
    }

    const currentData = selectedDataType === 'staff' ? importData.staff : 
                       selectedDataType === 'visits' ? importData.visits : 
                       selectedDataType === 'bellSchedules' ? importData.bellSchedules : 
                       importData.masterSchedule;
    const hasData = currentData.length > 0;

    const getDataTypeLabel = () => {
      switch (selectedDataType) {
        case 'staff': return 'Staff Members';
        case 'visits': return 'Visits';
        case 'bellSchedules': return 'Bell Schedules';
        case 'masterSchedule': return 'Master Schedule';
        default: return '';
      }
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Import {getDataTypeLabel()}
          </h3>
          <p className="text-sm text-gray-600">Adding to {school.schoolName}</p>
        </div>

        {!hasData ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed border-gray-300 p-6">
              <div className="text-center">
                <ClipboardDocumentIcon className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Import {selectedDataType === 'masterSchedule' ? 'Master Schedule' : getDataTypeLabel()} Data
                  </h4>
                  <p className="mt-2 text-xs text-gray-600">
                    {selectedDataType === 'masterSchedule' 
                      ? 'Copy the prompt with school staff, use it with AI, then paste the result back here'
                      : 'Copy the prompt, use it with AI, then paste the result back here'
                    }
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    appearance="outline"
                    textSize="xs"
                    onClick={() => setShowPrompt(!showPrompt)}
                    disabled={selectedDataType === 'masterSchedule' && schoolStaff.length === 0}
                  >
                    {showPrompt ? 'Hide' : 'Show'} AI Prompt
                  </Button>
                </div>
              </div>
            </div>

            {selectedDataType === 'masterSchedule' && schoolStaff.length === 0 && (
              <Alert intent="warning" className="mt-4">
                <Alert.Description>
                  No staff members found for this school. Please add staff members first using the &quot;Staff Members&quot; option above.
                </Alert.Description>
              </Alert>
            )}

            {showPrompt && selectedDataType !== 'masterSchedule' && (
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-gray-900">Copy this to AI:</h5>
                    <Button
                      appearance="outline"
                      textSize="xs"
                      onClick={() => copyToClipboard(getAIPrompt())}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border overflow-x-auto max-h-32">
                    {getAIPrompt()}
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

            {showPrompt && selectedDataType === 'masterSchedule' && schoolStaff.length > 0 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-gray-900">
                      Copy this to AI:
                      <span className="ml-2 text-green-600">({schoolStaff.length} staff members available)</span>
                    </h5>
                    <Button
                      appearance="outline"
                      textSize="xs"
                      onClick={() => copyToClipboard(getAIPrompt())}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border overflow-x-auto max-h-32">
                    {getAIPrompt()}
                  </pre>
                </div>

                {/* Show staff preview for master schedule */}
                <div className="rounded-lg bg-blue-50 p-3">
                  <h6 className="text-xs font-medium text-blue-900 mb-2">
                    Available Staff ({schoolStaff.length} members):
                  </h6>
                  <div className="max-h-20 overflow-y-auto">
                    {schoolStaff.map((staff, index) => (
                      <div key={index} className="text-xs text-blue-800">
                        • {staff.staffName} ({staff.email})
                      </div>
                    ))}
                  </div>
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
                {getDataTypeLabel()} data imported successfully!
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
                setImportData({ staff: [], visits: [], bellSchedules: [], masterSchedule: [] });
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
                  loading={creatingStaff || creatingVisit || creatingBellSchedule}
                >
                  Add {
                    selectedDataType === 'staff' ? 'Staff' : 
                    selectedDataType === 'visits' ? 'Visits' : 
                    selectedDataType === 'bellSchedules' ? 'Bell Schedules' : 
                    'Master Schedule'
                  } to School
                </Button>
              ) : (
                <Button
                  appearance="outline"
                  onClick={() => {
                    setImportData({ staff: [], visits: [], bellSchedules: [], masterSchedule: [] });
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