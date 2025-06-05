"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Drawer } from '@/components/composed/drawers/Drawer';
import { TabbedStageNavigation, defaultStageConfiguration } from './TabbedStageNavigation';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { Button } from '@/components/core/Button';
import { SaveIcon, XIcon } from 'lucide-react';
import { useCoachingActionPlans } from '@/hooks/domain/cap/useCoachingActionPlans';
import { useToast } from '@/components/core/feedback/Toast';
import { handleClientError } from '@error/handlers/client';
import { calculatePlanProgress } from '@/lib/transformers/utils/coaching-action-plan-utils';
import type { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/core/cap';

// Import stage components
import { CoachingActionPlanStage1 } from './CoachingActionPlanStage1';
import { CoachingActionPlanStage2 } from './CoachingActionPlanStage2';
import { CoachingActionPlanStage3 } from './CoachingActionPlanStage3';
import { CoachingActionPlanStage4 } from './CoachingActionPlanStage4';

interface CoachingActionPlanDetailedEditorProps {
  planId: string;
  open: boolean;
  onClose: () => void;
  onSave?: (plan: CoachingActionPlan) => void;
  className?: string;
}

export function CoachingActionPlanDetailedEditor({
  planId,
  open,
  onClose,
  onSave: _onSave,
  className
}: CoachingActionPlanDetailedEditorProps) {
  // Data fetching
  const { data: plan, isLoading, error, refetch } = useCoachingActionPlans.byId(planId);
  
  // UI state
  const [currentStage, setCurrentStage] = useState(1);
  const [editingData, setEditingData] = useState<Partial<CoachingActionPlanInput> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Toast notifications
  const { showToast } = useToast();

  // Auto-save integration using the optimized hook with data parameter
  const autoSaveHook = useCoachingActionPlans.autoSave(planId, editingData || {});
  const { triggerSave } = autoSaveHook;

  // Initialize editing data when plan loads
  useEffect(() => {
    if (plan && !editingData) {
      setEditingData({
        needsAndFocus: plan.needsAndFocus,
        goal: plan.goal,
        implementationRecords: plan.implementationRecords,
        endOfCycleAnalysis: plan.endOfCycleAnalysis
      });
    }
  }, [plan, editingData]);

  // Trigger auto-save when data changes (2-second debounce handled by utility)
  useEffect(() => {
    if (hasUnsavedChanges && editingData && planId) {
      triggerSave();
    }
  }, [editingData, hasUnsavedChanges, triggerSave, planId]);

  // Handle data changes from stage components with auto-save
  const handleStageDataChange = useCallback((stageNumber: number, data: unknown) => {
    setHasUnsavedChanges(true);
    
    const stageKey = getStageKey(stageNumber);
    setEditingData(prev => ({
      ...prev,
      [stageKey]: data
    }));
  }, []);

  // Calculate stage completion status
  const stageInfo = useMemo(() => {
    if (!plan) return defaultStageConfiguration.map(stage => ({
      ...stage,
      isComplete: false,
      isValid: false
    }));

    const progress = calculatePlanProgress(plan);
    
    return defaultStageConfiguration.map(stage => {
      const stageProgress = progress.stageDetails.find(s => s.stage === getStageKey(stage.number));
      
      return {
        ...stage,
        isComplete: stageProgress?.isValid || false,
        isValid: stageProgress?.isValid || false,
        hasWarnings: stageProgress ? !stageProgress.isValid && stageProgress.completionPercentage > 0 : false
      };
    });
  }, [plan]);

  // Helper function to get correct property key for each stage
  function getStageKey(stageNumber: number): string {
    const stageMap = {
      1: 'needsAndFocus',
      2: 'goal', 
      3: 'implementationRecords',
      4: 'endOfCycleAnalysis'
    };
    return stageMap[stageNumber as keyof typeof stageMap] || 'needsAndFocus';
  }

  // Handle saving
  const handleSave = async () => {
    if (!plan || !editingData || isSaving) return;

    setIsSaving(true);
    try {
      // TODO: Implement update functionality when available in hook
      // const updatedPlan = await updateCoachingActionPlan(plan._id, editingData);

      setHasUnsavedChanges(false);
      showToast({
        title: 'Success',
        description: 'Coaching action plan saved successfully',
        variant: 'success'
      });

      // if (onSave) {
      //   onSave(updatedPlan);
      // }
      
      refetch();
    } catch (error) {
      const errorMessage = handleClientError(error, 'updateCoachingActionPlan');
      showToast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmed) return;
    }
    
    setHasUnsavedChanges(false);
    onClose();
  };

  // Render stage content with auto-save enabled onChange handlers
  const renderStageContent = () => {
    if (!editingData) {
      return (
        <div className="flex items-center justify-center h-64">
          <Text color="muted">Loading stage data...</Text>
        </div>
      );
    }

    const commonProps = {
      planId,
      className: "flex-1"
    };

    switch (currentStage) {
      case 1:
        return (
          <CoachingActionPlanStage1
            {...commonProps}
            initialData={editingData.needsAndFocus}
            onChange={(data) => handleStageDataChange(1, data)}
          />
        );
        
      case 2:
        return (
          <CoachingActionPlanStage2
            {...commonProps}
            smartGoal={editingData.goal?.description || ''}
            onSmartGoalChange={(value) => 
              handleStageDataChange(2, { ...editingData.goal, description: value })
            }
            metrics={editingData.goal?.teacherOutcomes || []}
            onMetricsChange={(metrics) => 
              handleStageDataChange(2, { ...editingData.goal, teacherOutcomes: metrics })
            }
            coachingMoves={editingData.goal?.studentOutcomes || []}
            onCoachingMovesChange={(moves) => 
              handleStageDataChange(2, { ...editingData.goal, studentOutcomes: moves })
            }
          />
        );
        
      case 3:
        return (
          <CoachingActionPlanStage3
            {...commonProps}
            implementationRecords={editingData.implementationRecords || []}
            onImplementationRecordsChange={(records) => handleStageDataChange(3, records)}
            metrics={editingData.goal?.teacherOutcomes || []}
            coachingMoves={editingData.goal?.studentOutcomes || []}
          />
        );
        
      case 4:
        return (
          <CoachingActionPlanStage4
            {...commonProps}
            goalMet={editingData.endOfCycleAnalysis?.goalMet ?? null}
            onGoalMetChange={(goalMet) => 
              handleStageDataChange(4, { ...editingData.endOfCycleAnalysis, goalMet })
            }
            impactOnLearning={editingData.endOfCycleAnalysis?.impactOnLearning || ''}
            onImpactOnLearningChange={(value) => 
              handleStageDataChange(4, { ...editingData.endOfCycleAnalysis, impactOnLearning: value })
            }
            buildOnThis={editingData.endOfCycleAnalysis?.lessonsLearned || ''}
            onBuildOnThisChange={(value) => 
              handleStageDataChange(4, { ...editingData.endOfCycleAnalysis, lessonsLearned: value })
            }
            spotlightLink={editingData.endOfCycleAnalysis?.recommendationsForNext || ''}
            onSpotlightLinkChange={(value) => 
              handleStageDataChange(4, { ...editingData.endOfCycleAnalysis, recommendationsForNext: value })
            }
          />
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <Text color="muted">Invalid stage selected</Text>
          </div>
        );
    }
  };

  if (error) {
    return (
      <Drawer 
        open={open} 
        onClose={handleClose}
        size="lg"
        position="right"
        background="white"
        className={className}
      >
        <Drawer.Header>
          <Drawer.Title>Error Loading Plan</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body>
          <Text textSize="base" color="danger">
            Failed to load coaching action plan: {error.message}
          </Text>
        </Drawer.Body>
      </Drawer>
    );
  }

  return (
    <Drawer 
      open={open} 
      onClose={handleClose}
      size="lg"
      position="right"
      background="white"
      className={className}
    >
      <Drawer.Header showCloseButton={false}>
        <div className="flex items-center justify-between w-full">
          <div className="flex-1">
            <Drawer.Title>
              <Heading level="h2" className="text-xl font-semibold">
                {plan ? `${plan.teachers?.join(', ')} - ${plan.school}` : 'Loading...'}
              </Heading>
            </Drawer.Title>
            {hasUnsavedChanges && (
              <Text textSize="sm" color="muted" className="mt-1">
                You have unsaved changes
              </Text>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              intent="primary"
              appearance="solid"
              padding="sm"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
            >
              <SaveIcon className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            
            <Button
              intent="secondary"
              appearance="outline"
              padding="sm"
              onClick={handleClose}
            >
              <XIcon className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
        
        {/* Stage Navigation */}
        <div className="mt-4">
          <TabbedStageNavigation
            stages={stageInfo}
            currentStage={currentStage}
            onStageChange={setCurrentStage}
            disabled={isLoading}
          />
        </div>
      </Drawer.Header>
      
      <Drawer.Body>
        <div 
          id={`stage-panel-${currentStage}`}
          role="tabpanel"
          aria-labelledby={`stage-tab-${currentStage}`}
          className="h-full"
        >
          {renderStageContent()}
        </div>
      </Drawer.Body>
    </Drawer>
  );
} 