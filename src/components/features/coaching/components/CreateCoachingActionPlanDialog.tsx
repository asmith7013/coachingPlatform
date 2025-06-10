'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Dialog } from '@composed-components/dialogs/Dialog';
import { Button } from '@/components/core/Button';
import { Alert } from '@core-components/feedback';
import { 
  ClipboardDocumentListIcon, 
  CheckIcon 
} from '@heroicons/react/24/outline';
import { createCoachingActionPlan } from '@actions/coaching/coaching-action-plans';
import type { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/core/cap';

interface CreateCoachingActionPlanDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (plan: CoachingActionPlan) => void;
}

export function CreateCoachingActionPlanDialog({ 
  open, 
  onClose, 
  onSuccess 
}: CreateCoachingActionPlanDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    academicYear: '2024-2025',
    startDate: new Date(),
  });
  
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form validation
  const isFormValid = useMemo(() => {
    return !!(formData.title?.trim() && formData.academicYear?.trim());
  }, [formData.title, formData.academicYear]);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setFormData({
      title: '',
      academicYear: '2024-2025',
      startDate: new Date(),
    });
    setError('');
    setIsSubmitted(false);
    onClose();
  }, [onClose]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: string | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle form submission using server action directly
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;

    setError('');
    setIsCreating(true);

    try {
      // Create complete CoachingActionPlanInput object with sensible defaults
      const coachingActionPlanData: CoachingActionPlanInput = {
        // User provided fields
        title: formData.title?.trim() || 'New Coaching Action Plan',
        academicYear: formData.academicYear?.trim() || '2024-2025',
        startDate: formData.startDate || new Date(),
        
        // Required fields with valid placeholder values (not empty strings)
        teachers: [],
        coaches: [],
        school: 'PS 175', // Valid non-empty value
        owners: [],
        status: 'draft',
        cycleLength: 3,
        
        // Required nested objects with valid placeholder values
        needsAndFocus: {
          ipgCoreAction: 'CA1',
          ipgSubCategory: 'CA1A',
          rationale: 'Initial focus area - to be completed during planning phase',
          // pdfAttachment is optional and can be omitted
        },
        
        goal: {
          description: 'Primary coaching goal - to be defined during planning phase',
          teacherOutcomes: [],
          studentOutcomes: [],
        },
        
        // Required arrays that can start empty
        weeklyPlans: [],
        implementationRecords: [],
      };

      const result = await createCoachingActionPlan(coachingActionPlanData);
      
      if (result.success && result.data) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess(result.data);
        }
        // Close dialog after a brief moment
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(result.error || 'Failed to create plan');
      }
      
    } catch (error) {
      console.error('Create plan error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setIsCreating(false);
    }
  }, [formData, isFormValid, onSuccess, handleClose]);

  if (isSubmitted) {
    return (
      <Dialog open={open} onClose={handleClose} size="md">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mx-auto mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Plan Created Successfully!</h2>
          <p className="text-sm text-gray-600">Your coaching action plan has been created and is ready for editing.</p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Coaching Action Plan</h2>
            <p className="text-sm text-gray-600">Start with basic information - you can add details later</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plan Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
              Plan Title *
            </label>
            <div className="mt-2">
              <input
                id="title"
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Enter a descriptive title for this coaching action plan"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>
          </div>

          {/* Academic Year */}
          <div>
            <label htmlFor="academicYear" className="block text-sm font-medium leading-6 text-gray-900">
              Academic Year *
            </label>
            <div className="mt-2">
              <input
                id="academicYear"
                type="text"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="e.g., 2024-2025"
                value={formData.academicYear || ''}
                onChange={(e) => handleFieldChange('academicYear', e.target.value)}
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium leading-6 text-gray-900">
              Start Date
            </label>
            <div className="mt-2">
              <input
                id="startDate"
                type="date"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFieldChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          {error && (
            <Alert intent="error" className="mt-4">
              <Alert.Description>{error}</Alert.Description>
            </Alert>
          )}

          {/* Dialog Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              appearance="outline"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              type="submit"
              loading={isCreating}
              disabled={!isFormValid}
            >
              Create Plan
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
} 