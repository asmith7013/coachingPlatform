"use client";

import React from 'react';
import { ResourceForm } from '@/components/composed/forms/UpdatedResourceForm';
import type { Field } from '@ui-types/form';
import { 
  NeedsAndFocusFieldConfig,
  GoalFieldConfig,
  ImplementationRecordFieldConfig,
  EndOfCycleAnalysisFieldConfig
} from '@/lib/ui/forms/configurations/coaching-action-plan-config';
import type { 
  NeedsAndFocus, 
  Goal, 
  ImplementationRecord, 
  EndOfCycleAnalysis 
} from '@zod-schema/core/cap';

type StageData = NeedsAndFocus | Goal | ImplementationRecord | EndOfCycleAnalysis;

interface ActionPlanStageFormProps<T extends StageData> {
  stage: 1 | 2 | 3 | 4;
  initialValues?: Partial<T>;
  onSubmit: (data: T) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

// Stage configuration mapping
const stageConfig = {
  1: {
    title: 'Stage 1: Needs & Focus',
    description: 'Identify the core instructional focus area based on IPG standards',
    fields: NeedsAndFocusFieldConfig
  },
  2: {
    title: 'Stage 2: Goal & Outcomes', 
    description: 'Define SMART goals with measurable teacher and student outcomes',
    fields: GoalFieldConfig
  },
  3: {
    title: 'Stage 3: Implementation Record',
    description: 'Document what actually happened during coaching visits',
    fields: ImplementationRecordFieldConfig
  },
  4: {
    title: 'Stage 4: End of Cycle Analysis',
    description: 'Analyze goal achievement and plan for next steps',
    fields: EndOfCycleAnalysisFieldConfig
  }
} as const;

export function ActionPlanStageForm<T extends StageData>({
  stage,
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className
}: ActionPlanStageFormProps<T>) {
  const config = stageConfig[stage];
  
  if (!config) {
    throw new Error(`Invalid stage: ${stage}. Must be 1, 2, 3, or 4.`);
  }

  return (
    <ResourceForm<T>
      title={config.title}
      description={config.description}
      fields={config.fields as Field[]}
      onSubmit={onSubmit}
      initialValues={initialValues}
      submitLabel={`Save ${config.title}`}
      onCancel={onCancel}
      showCancelButton={!!onCancel}
      cancelLabel="Cancel"
      loading={loading}
      error={error}
      className={className}
      mode="edit"
    />
  );
}

// Individual stage form components for type safety
export function NeedsAndFocusForm(
  props: Omit<ActionPlanStageFormProps<NeedsAndFocus>, 'stage'>
) {
  return <ActionPlanStageForm<NeedsAndFocus> stage={1} {...props} />;
}

export function GoalForm(
  props: Omit<ActionPlanStageFormProps<Goal>, 'stage'>
) {
  return <ActionPlanStageForm<Goal> stage={2} {...props} />;
}

export function ImplementationRecordForm(
  props: Omit<ActionPlanStageFormProps<ImplementationRecord>, 'stage'>
) {
  return <ActionPlanStageForm<ImplementationRecord> stage={3} {...props} />;
}

export function EndOfCycleAnalysisForm(
  props: Omit<ActionPlanStageFormProps<EndOfCycleAnalysis>, 'stage'>
) {
  return <ActionPlanStageForm<EndOfCycleAnalysis> stage={4} {...props} />;
} 