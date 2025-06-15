"use client";

import React, { useState } from 'react';
import { DashboardPage } from '@/components/composed/layouts/DashboardPage';
import { PageHeader } from '@/components/composed/layouts/PageHeader';
import { ResourceHeader } from '@/components/composed/layouts/ResourceHeader';
import { EmptyListWrapper } from '@/components/core/empty/EmptyListWrapper';
import { Text } from '@/components/core/typography/Text';
import { useToast } from '@/components/core/feedback/Toast';
import { CreateCoachingActionPlanDialog } from './components/CreateCoachingActionPlanDialog';
import { CoachingActionPlanDetailedEditor } from './CoachingActionPlanDetailedEditor';
import { ActionPlanCard, StatusTransitionButton } from '@components/domain/coaching';
import { useCoachingActionPlans } from '@components/features/coaching/hooks/useCoachingActionPlans';
import { updateCoachingActionPlanStatus } from '@actions/coaching/coaching-action-plans';
import { handleClientError } from '@error/handlers/client';
import { PlusCircleIcon, FolderIcon, CheckCircleIcon } from 'lucide-react';
import type { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/cap/coaching-action-plan';
import { type PlanStatus } from '@data-processing/transformers/utils/coaching-action-plan-utils';
import { Button } from '@components/core/Button';

interface CoachingActionPlanDashboardProps {
  className?: string;
}

export function CoachingActionPlanDashboard({ className }: CoachingActionPlanDashboardProps) {
  const { showToast, ToastComponent } = useToast();
  const [searchInput, setSearchInput] = useState('');
  
  // Dialog state management
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailedEditor, setShowDetailedEditor] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  
  // ✅ Use the factory pattern hook - provides all state management
  const {
    items: plans,
    total,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    applyFilters,
    changeSorting,
    refetch
  } = useCoachingActionPlans.list();

  // ✅ Proper navigation handler following established patterns
  const handleCreatePlan = async () => {
    setShowCreateDialog(true);
  };

  // ✅ Navigation handlers following established patterns  
  const handleEditPlan = (planId: string) => {
    setEditingPlanId(planId);
    setShowDetailedEditor(true);
  };

  // Success handlers for dialogs
  const handleCreateSuccess = (_plan: CoachingActionPlan) => {
    showToast({
      title: 'Success',
      description: 'Coaching action plan created successfully',
      variant: 'success',
      icon: CheckCircleIcon
    });
    refetch();
  };

  const handleEditSuccess = (_plan: CoachingActionPlan) => {
    showToast({
      title: 'Success',
      description: 'Coaching action plan updated successfully',
      variant: 'success',
      icon: CheckCircleIcon
    });
    refetch();
  };

  const handleDuplicatePlan = (_planId: string) => {
    // TODO: Implement plan duplication
    showToast({
      title: 'Feature Coming Soon',
      description: 'Plan duplication will be available in a future update',
      variant: 'info'
    });
  };

  const handleArchivePlan = (_planId: string) => {
    // TODO: Implement plan archiving
    showToast({
      title: 'Feature Coming Soon', 
      description: 'Plan archiving will be available in a future update',
      variant: 'info'
    });
  };

  const handleDeletePlan = (_planId: string) => {
    // TODO: Implement plan deletion with confirmation
    showToast({
      title: 'Feature Coming Soon',
      description: 'Plan deletion will be available in a future update',
      variant: 'info'
    });
  };

  const handleExportPlan = (_planId: string) => {
    // TODO: Implement plan export
    showToast({
      title: 'Feature Coming Soon',
      description: 'Plan export will be available in a future update',
      variant: 'info'
    });
  };

  const handleStatusChange = async (planId: string, newStatus: PlanStatus, reason?: string) => {
    try {
      const result = await updateCoachingActionPlanStatus(planId, newStatus, reason);
      if (result.success) {
        showToast({
          title: 'Status Updated',
          description: `Plan status changed to ${newStatus}`,
          variant: 'success',
          icon: CheckCircleIcon
        });
        refetch();
      } else {
        const errorMessage = result.error || 'Failed to update status';
        showToast({
          title: 'Update Failed',
          description: errorMessage,
          variant: 'error'
        });
      }
    } catch (error) {
      const errorMessage = handleClientError(error, 'updateCoachingActionPlanStatus');
      showToast({
        title: 'Error',
        description: errorMessage,
        variant: 'error'
      });
    }
  };

  // ✅ Use established early return pattern
  if (isLoading) return <Text textSize="base">Loading coaching action plans...</Text>;
  if (error) return <Text textSize="base" color="danger">Error loading plans: {error.message}</Text>;

  return (
    <div className={className}>
      <DashboardPage>
        {/* ✅ Use established PageHeader component pattern */}
        <PageHeader 
          title="Coaching Action Plans"
          subtitle="Manage coaching cycles and track teacher development progress"
          actions={[
            { 
              label: "Create Plan", 
              icon: PlusCircleIcon,
              onClick: handleCreatePlan, 
              intent: "primary" 
            }
          ]}
        />

        {/* ✅ Enhanced ResourceHeader integration with proper search state */}
        <ResourceHeader<CoachingActionPlanInput>
          page={page}
          total={total}
          limit={pageSize}
          setPage={setPage}
          sortOptions={[
            { key: "title", label: "Plan Title" },
            { key: "school", label: "School" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created Date" },
            { key: "updatedAt", label: "Updated Date" }
          ]}
          onSort={(field, order) => changeSorting(field as string, order)}
          onSearch={(value) => {
            setSearchInput(value);
            applyFilters({ search: value });
          }}
          searchInput={searchInput} 
          setSearchInput={setSearchInput}
        />

        {/* ✅ Proper empty state with infrastructure loading handling */}
        <EmptyListWrapper 
          items={plans} 
          resourceName="coaching action plans"
          title="No coaching action plans found"
          description="Get started by creating your first coaching action plan"
          icon={FolderIcon}
          action={
            <Button
              intent="primary"
              onClick={handleCreatePlan}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md disabled:opacity-50"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create Your First Plan
            </Button>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {plans.map((plan: CoachingActionPlan) => (
              <div key={plan._id} className="relative group">
                <ActionPlanCard
                  plan={plan}
                  onEdit={handleEditPlan}
                  onDuplicate={handleDuplicatePlan}
                  onArchive={handleArchivePlan}
                  onDelete={handleDeletePlan}
                  onExport={handleExportPlan}
                />
                
                {/* ✅ Enhanced feature - status transition overlay */}
                <div className="absolute top-2 right-2">
                  <StatusTransitionButton
                    plan={plan}
                    onStatusChange={handleStatusChange}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            ))}
          </div>
        </EmptyListWrapper>
      </DashboardPage>
      
      {/* Create Dialog */}
      <CreateCoachingActionPlanDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Detailed Editor */}
      <CoachingActionPlanDetailedEditor
        planId={editingPlanId || ''}
        open={showDetailedEditor}
        onClose={() => {
          setShowDetailedEditor(false);
          setEditingPlanId(null);
        }}
        onSave={handleEditSuccess}
      />
      
      {/* ✅ Toast notification system for user feedback */}
      <ToastComponent />
    </div>
  );
} 