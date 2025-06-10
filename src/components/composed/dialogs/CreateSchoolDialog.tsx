'use client';

import React, { useState, useCallback } from 'react';
import { Dialog } from './Dialog';
import { Button } from '@/components/core';
import { Alert } from '@/components/core/feedback';
import { 
  ClipboardDocumentIcon, 
  CheckIcon, 
  BuildingLibraryIcon 
} from '@heroicons/react/24/outline';
import { useSchoolsMutations } from '@hooks/domain/useSchools';
import { AI_PROMPTS } from '@ui/data-import/schema-templates';
import { validateSchoolData } from '@/lib/data-processing/transformers/ui/form-validation';
import { createDataPreview } from '@/lib/data-processing/transformers/ui/data-preview';
import type { SchoolInput } from '@domain-types/school';

interface CreateSchoolDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSchoolDialog({ open, onClose }: CreateSchoolDialogProps) {
  const [schoolData, setSchoolData] = useState<SchoolInput | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const { create: createSchool, isCreating } = useSchoolsMutations();

  // Copy to clipboard helper
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setSchoolData(null);
    setJsonInput('');
    setValidationError('');
    setShowPrompt(false);
    onClose();
  }, [onClose]);

  // Validation and parsing handler
  const handleValidateAndParse = useCallback((jsonString: string) => {
    setValidationError('');
    
    const result = validateSchoolData(jsonString);
    if (!result.success || !result.data) {
      setValidationError(result.error || 'Validation failed');
      return false;
    }
    
    setSchoolData(result.data);
    setJsonInput('');
    setShowPrompt(false);
    return true;
  }, []);

  // School creation handler
  const handleCreateSchool = useCallback(async () => {
    if (!schoolData || !createSchool) return;

    try {
      const schoolDataWithRequiredFields = {
        staffList: [],
        schedules: [],
        cycles: [],
        owners: [],
        gradeLevelsSupported: [],
        ...schoolData,
        schoolNumber: schoolData.schoolNumber || '',
        district: schoolData.district || '',
        schoolName: schoolData.schoolName || '',
      };

      await createSchool(schoolDataWithRequiredFields);
      alert('School created successfully!');
      handleClose();
    } catch (error) {
      console.error('Error creating school:', error);
      alert(`Failed to create school: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [schoolData, createSchool, handleClose]);

  return (
    <Dialog open={open} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
            <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create New School</h2>
            <p className="text-sm text-gray-600">Use AI to populate your school data from any format</p>
          </div>
        </div>

        {!schoolData ? (
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
                      onClick={() => copyToClipboard(AI_PROMPTS.school)}
                    >
                      Copy Prompt
                    </Button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-x-auto max-h-40">
                    {AI_PROMPTS.school}
                  </pre>
                </div>

                <div>
                  <label htmlFor="school-json" className="block text-sm font-medium leading-6 text-gray-900">
                    Paste AI response here:
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="school-json"
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
                      Import School Data
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
              <Alert.Description>School data imported successfully!</Alert.Description>
            </Alert>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">{schoolData.schoolName}</h3>
              <p className="text-sm text-gray-600">District: {schoolData.district}</p>
              {schoolData.address && (
                <p className="text-sm text-gray-600">Address: {schoolData.address}</p>
              )}
              {schoolData.gradeLevelsSupported && schoolData.gradeLevelsSupported.length > 0 && (
                <p className="text-sm text-gray-600">
                  Grades: {schoolData.gradeLevelsSupported.join(', ')}
                </p>
              )}
            </div>

            {/* Data preview */}
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Data Preview</h4>
              <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded overflow-x-auto max-h-40">
                {createDataPreview(schoolData, 'school')}
              </pre>
            </div>
          </div>
        )}

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button
            appearance="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          {schoolData ? (
            <Button
              intent="primary"
              onClick={handleCreateSchool}
              loading={isCreating}
            >
              Create School
            </Button>
          ) : (
            <Button
              appearance="outline"
              onClick={() => setSchoolData(null)}
              disabled={!schoolData}
            >
              Start Over
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
} 