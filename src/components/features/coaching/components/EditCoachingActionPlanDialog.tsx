'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Dialog } from '@components/composed/dialogs/Dialog';
import { Button } from '@core-components';
import { Alert } from '@components/core/feedback';
import { 
  PencilIcon, 
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useCoachingActionPlans } from '@components/features/coaching/hooks/useCoachingActionPlans';
import type { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/core/cap';

interface EditCoachingActionPlanDialogProps {
  open: boolean;
  onClose: () => void;
  planId: string | null;
  onSuccess?: (plan: CoachingActionPlan) => void;
}

export function EditCoachingActionPlanDialog({ 
  open, 
  onClose, 
  planId,
  onSuccess 
}: EditCoachingActionPlanDialogProps) {
  const [formData, setFormData] = useState<Partial<CoachingActionPlanInput>>({});
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { byId, mutations } = useCoachingActionPlans;
  
  // Get the plan data
  const { data: plan, isLoading: planLoading, error: planError } = byId(planId || '');
  
  // Get mutation functions
  const { updateAsync, isUpdating } = mutations();

  // Load plan data into form when plan is fetched
  useEffect(() => {
    if (plan) {
      setFormData({
        title: plan.title,
        academicYear: plan.academicYear,
        startDate: plan.startDate,
        endDate: plan.endDate,
        status: plan.status,
        cycleLength: plan.cycleLength,
        teachers: plan.teachers,
        coaches: plan.coaches,
        school: plan.school,
        ownerIds: plan.ownerIds,
      });
    }
  }, [plan]);

  // Reset state when dialog closes
  const handleClose = useCallback(() => {
    setFormData({});
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

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!planId) {
      setError('No plan ID provided');
      return;
    }

    // Basic validation
    if (!formData.title?.trim()) {
      setError('Plan title is required');
      return;
    }

    if (!formData.academicYear?.trim()) {
      setError('Academic year is required');
      return;
    }

    try {
      if (updateAsync) {
        const result = await updateAsync(planId, formData);
        if (result.success && result.data) {
          setIsSubmitted(true);
          if (onSuccess) {
            onSuccess(result.data as CoachingActionPlan);
          }
          // Close dialog after a brief moment
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error updating coaching action plan:', error);
      setError(error instanceof Error ? error.message : 'Failed to update coaching action plan');
    }
  }, [formData, planId, updateAsync, onSuccess, handleClose]);

  // Show loading state
  if (planLoading) {
    return (
      <Dialog open={open} onClose={handleClose} size="md">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mx-auto mb-4">
            <PencilIcon className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Plan...</h2>
          <p className="text-sm text-gray-600">Please wait while we load the coaching action plan.</p>
        </div>
      </Dialog>
    );
  }

  // Show error state
  if (planError) {
    return (
      <Dialog open={open} onClose={handleClose} size="md">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Plan</h2>
          <p className="text-sm text-gray-600 mb-4">
            {planError.message || 'Failed to load the coaching action plan.'}
          </p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </Dialog>
    );
  }

  // Show success state
  if (isSubmitted) {
    return (
      <Dialog open={open} onClose={handleClose} size="md">
        <div className="p-6 text-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mx-auto mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Plan Updated Successfully!</h2>
          <p className="text-sm text-gray-600">Your changes have been saved.</p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
            <PencilIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Edit Coaching Action Plan</h2>
            <p className="text-sm text-gray-600">Update plan details and information</p>
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

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium leading-6 text-gray-900">
              End Date
            </label>
            <div className="mt-2">
              <input
                id="endDate"
                type="date"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFieldChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
              Status
            </label>
            <div className="mt-2">
              <select
                id="status"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={formData.status || 'draft'}
                onChange={(e) => handleFieldChange('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
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
              loading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
} 