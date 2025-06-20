"use client";

import React, { useState, useMemo } from 'react';
import { Drawer } from '@components/composed/drawers/Drawer';
import { TabbedStageNavigation, defaultStageConfiguration } from './TabbedStageNavigation';
import { Text } from '@components/core/typography/Text';
import { Heading } from '@components/core/typography/Heading';
import { Button } from '@components/core/Button';
import { XIcon } from 'lucide-react';
import { useCoachingActionPlans } from '@/hooks/domain/useCoachingActionPlans';
import { useToast } from '@components/core/feedback/Toast';
import { handleClientError } from '@error/handlers/client';
import { calculatePlanProgress } from '@data-processing/transformers/utils/coaching-action-plan-utils';
import { CoachingActionPlanInputZodSchema } from '@zod-schema/core/cap';
import type { CoachingActionPlan, CoachingActionPlanInput } from '@zod-schema/core/cap';
import { CapOutcomeInput } from '@zod-schema/cap';
import { createCoachingActionPlanDefaults } from '@zod-schema/core/cap';

// Import stage components
import { CoachingActionPlanStage1 } from './stages/CAPStage1';
import { CoachingActionPlanStage2 } from './stages/CAPStage2';
import { CoachingActionPlanStage3 } from './stages/CAPStage3';
import { CoachingActionPlanStage4 } from './stages/CAPStage4';

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
  onSave,
  className
}: CoachingActionPlanDetailedEditorProps) {
  // Data fetching and mutations
  const { data: plan, isLoading, error } = useCoachingActionPlans.byId(planId);
  const mutations = useCoachingActionPlans.mutations();
  
  // UI state
  const [currentStage, setCurrentStage] = useState(1);
  
  // Toast notifications
  const { showToast } = useToast();

  // Handle stage updates with direct mutation and schema validation
  const handleStageUpdate = async (
    stage: keyof CoachingActionPlanInput,
    updates: unknown
  ) => {
    if (!plan || !mutations?.updateAsync) return;

    try {
      // Validate updates with schema
      const validated = CoachingActionPlanInputZodSchema.partial().parse({
        [stage]: updates
      });

      // Direct mutation update
      const result = await mutations.updateAsync(planId, validated);

      if (result?.data && onSave) {
        onSave(result.data);
      }

      showToast({
        title: 'Success',
        description: 'Changes saved successfully',
        variant: 'success'
      });
    } catch (error) {
      const errorMessage = handleClientError(error, 'updateCoachingActionPlan');
      showToast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'error'
      });
    }
  };

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
  function getStageKey(stageNumber: number): keyof CoachingActionPlanInput {
    const stageMap = {
      1: 'needsAndFocus',
      2: 'goal', 
      3: 'implementationRecords',
      4: 'endOfCycleAnalysis'
    } as const;
    return stageMap[stageNumber as keyof typeof stageMap] || 'needsAndFocus';
  }

  // Render stage content with direct mutation handlers
  const renderStageContent = () => {
    if (!plan) {
      return (
        <div className="flex items-center justify-center h-64">
          <Text color="muted">Loading stage data...</Text>
        </div>
      );
    }

    const fullPlan = createCoachingActionPlanDefaults(plan);
    const commonProps = {
      planId,
      className: "flex-1"
    };

    switch (currentStage) {
      case 1:
        return (
          <CoachingActionPlanStage1
            className={commonProps.className}
            data={fullPlan.ipgCoreAction as CoachingActionPlan}
            onChange={(updates) => handleStageUpdate('ipgCoreAction', updates)}
          />  
        );
        
      case 2:
        return (
          <CoachingActionPlanStage2
            {...commonProps}
            data={fullPlan.goal || {
              description: '',
              teacherOutcomes: [],
              studentOutcomes: []
            }}
            onChange={(goalData) => handleStageUpdate('goal', goalData)}
          />
        );
        
      case 3:
        return (
          <CoachingActionPlanStage3
            {...commonProps}
            data={fullPlan.implementationRecords || []}
            onChange={(records) => handleStageUpdate('implementationRecords', records)}
            goal={fullPlan.goal as CoachingActionPlan}
          />
        );
        
      case 4:
        return (
          <CoachingActionPlanStage4
            {...commonProps}
            data={fullPlan.endOfCycleAnalysis || {
              goalMet: false,
              teacherOutcomeAnalysis: [],
              studentOutcomeAnalysis: [],
              impactOnLearning: '',
              overallEvidence: [],
              lessonsLearned: undefined,
              recommendationsForNext: undefined
            }}
            onChange={(analysisData: CapOutcomeInput) => handleStageUpdate('endOfCycleAnalysis', analysisData)}
            goal={fullPlan.goal}
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
        onClose={onClose}
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
      onClose={onClose}
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
                {plan ? `Spring Action Plan` : 'Loading...'}
              </Heading>
            </Drawer.Title>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              intent="secondary"
              appearance="outline"
              padding="sm"
              onClick={onClose}
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
        {/* Add padding top to account for sticky header */}
        <div className="pt-2">
          <div 
            id={`stage-panel-${currentStage}`}
            role="tabpanel"
            aria-labelledby={`stage-tab-${currentStage}`}
            className="h-full"
          >
            {renderStageContent()}
          </div>
        </div>
      </Drawer.Body>
    </Drawer>
  );
} 