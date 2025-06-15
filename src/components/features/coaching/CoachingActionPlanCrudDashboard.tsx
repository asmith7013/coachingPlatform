"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';
import { 
  CoachingActionPlanInput,
  CoachingActionPlan,
} from '@zod-schema/cap';
import { useCoachingActionPlans } from '@hooks/domain/useCoachingActionPlans';

// Import new form and list components
import { CoachingActionPlanForm } from '@components/features/coaching/components/CoachingActionPlanForm';
import { CoachingActionPlansList } from '@components/features/coaching/components/CoachingActionPlansList';

type ViewMode = 'list' | 'create' | 'edit';

export function CoachingActionPlanCrudDashboard() {
  // State management (following observations pattern)
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPlan, setSelectedPlan] = useState<CoachingActionPlan | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  
  const defaultValues = React.useMemo(() => ({
    academicYear: '2024-2025',
    status: 'draft'
  }), []);
  
  // Initialize CRUD hooks
  const plansManager = useCoachingActionPlans.manager();
  const {
    items: plans,
    isLoading: isLoadingList,
    error: listError,
    createAsync,
    updateAsync,
    deleteAsync,
    isCreating,
    isUpdating
  } = plansManager;
  
  // Handle create new plan
  const handleCreateNew = useCallback(() => {
    setSelectedPlan(null);
    setViewMode('create');
  }, []);
  
  // Handle edit plan
  const _handleEdit = useCallback((plan: CoachingActionPlan) => {
    setSelectedPlan(plan);
    setViewMode('edit');
  }, []);
  
  // Handle view plans list
  const handleViewList = useCallback(() => {
    setSelectedPlan(null);
    setViewMode('list');
  }, []);
  
  // Handle form submission (create or update)
  const handleFormSubmit = useCallback(async (data: CoachingActionPlanInput) => {
    try {
      if (viewMode === 'create') {
        if (!createAsync) {
          throw new Error('Create function not available');
        }
        const result = await createAsync(data as CoachingActionPlan);
        if (result.success) {
          setViewMode('list');
        }
      } else if (viewMode === 'edit' && selectedPlan) {
        if (!updateAsync) {
          throw new Error('Update function not available');
        }
        const result = await updateAsync(selectedPlan._id, data);
        if (result.success) {
          setViewMode('list');
        }
      }
    } catch (error) {
      console.error('Failed to save coaching action plan:', error);
      throw error; // Re-throw to let form handle the error
    }
  }, [viewMode, selectedPlan, createAsync, updateAsync]);
  
  // Handle delete plan
  const _handleDelete = useCallback(async (id: string) => {
    if (!deleteAsync) {
      console.error('Delete function not available');
      return;
    }
    
    setDeletingIds(prev => [...prev, id]);
    
    try {
      const result = await deleteAsync(id);
      if (result.success) {
        setDeletingIds(prev => prev.filter(deletingId => deletingId !== id));
      }
    } catch (error) {
      console.error('Failed to delete coaching action plan:', error);
      setDeletingIds(prev => prev.filter(deletingId => deletingId !== id));
    }
  }, [deleteAsync]);
  
  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setSelectedPlan(null);
    setViewMode('list');
  }, []);
  
  // Get initial form data based on mode
  const getInitialFormData = useCallback((): CoachingActionPlanInput => {
    if (viewMode === 'edit' && selectedPlan) {
      // Convert the plan to input format (remove system fields)
      const { _id, createdAt: _createdAt, updatedAt: _updatedAt, ...inputData } = selectedPlan;
      return inputData as CoachingActionPlanInput;
    }
    return defaultValues;
  }, [viewMode, selectedPlan, defaultValues]);
  
  // Get form error from mutations
  const getFormError = useCallback((): string | undefined => {
    if (viewMode === 'create') {
      return plansManager.createError ? String(plansManager.createError) : undefined;
    } else if (viewMode === 'edit') {
      return plansManager.updateError ? String(plansManager.updateError) : undefined;
    }
    return undefined;
  }, [viewMode, plansManager.createError, plansManager.updateError]);

  return (
    <DashboardPage>
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <Heading level="h1" className="mb-2">
            Coaching Action Plans
          </Heading>
          <Text color="muted">
            Create, edit, and manage comprehensive coaching action plans
          </Text>
        </div>

        {/* Navigation Controls */}
        <Card>
          <Card.Header>
            <Heading level="h3">Management Actions</Heading>
          </Card.Header>
          <Card.Body>
            <div className="flex gap-4 flex-wrap">
              <Button
                appearance={viewMode === 'list' ? 'solid' : 'outline'}
                onClick={handleViewList}
                disabled={isCreating || isUpdating || deletingIds.length > 0}
              >
                📋 View All Plans
              </Button>
              
              <Button
                appearance={viewMode === 'create' ? 'solid' : 'outline'}
                onClick={handleCreateNew}
                disabled={isCreating || isUpdating || deletingIds.length > 0}
              >
                ➕ Create New Plan
              </Button>
              
              {viewMode === 'edit' && selectedPlan && (
                <Button appearance="solid" disabled>
                  ✏️ Editing: {selectedPlan.title}
                </Button>
              )}
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 ml-auto">
                <Text textSize="sm" color="muted">
                  {plans.length} total plans
                </Text>
                {(isCreating || isUpdating || deletingIds.length > 0) && (
                  <Text textSize="sm" color="accent">
                    Processing...
                  </Text>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Main Content */}
        {viewMode === 'list' && (
          <CoachingActionPlansList
            plans={plans as CoachingActionPlan[]}
            isLoading={isLoadingList}
            error={listError ? String(listError) : undefined}
            // onEdit={_handleEdit}
            // onDelete={handleDelete}
            onEdit={() => {}}
            onDelete={() => {}}
            deletingIds={deletingIds}
          />
        )}
        
        {(viewMode === 'create' || viewMode === 'edit') && (
          <CoachingActionPlanForm
            mode={viewMode}
            initialData={getInitialFormData()}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isSubmitting={isCreating || isUpdating}
            error={getFormError()}
          />
        )}
        
      </div>
    </DashboardPage>
  );
} 