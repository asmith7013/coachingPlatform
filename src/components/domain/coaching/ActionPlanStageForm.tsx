"use client";

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { useFieldRenderer } from '@/lib/ui/forms/hooks/useFieldRenderer';
import { stageFieldConfigs } from '@/lib/ui/forms/fieldConfig/coaching/coaching-action-plan-stages';
import type { Field } from '@ui-types/form';
import type { 
  NeedsAndFocus, 
  Goal, 
  ImplementationRecord, 
  EndOfCycleAnalysis 
} from '@zod-schema/core/cap';
import { 
  NeedsAndFocusZodSchema,
  GoalZodSchema,
  ImplementationRecordZodSchema,
  EndOfCycleAnalysisZodSchema
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
    schema: NeedsAndFocusZodSchema,
    fields: stageFieldConfigs[1]
  },
  2: {
    title: 'Stage 2: Goal & Outcomes', 
    description: 'Define SMART goals with measurable teacher and student outcomes',
    schema: GoalZodSchema,
    fields: stageFieldConfigs[2]
  },
  3: {
    title: 'Stage 3: Implementation Record',
    description: 'Document what actually happened during coaching visits',
    schema: ImplementationRecordZodSchema,
    fields: stageFieldConfigs[3]
  },
  4: {
    title: 'Stage 4: End of Cycle Analysis',
    description: 'Analyze goal achievement and plan for next steps',
    schema: EndOfCycleAnalysisZodSchema,
    fields: stageFieldConfigs[4]
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
  const { renderField } = useFieldRenderer<T>();
  
  if (!config) {
    throw new Error(`Invalid stage: ${stage}. Must be 1, 2, 3, or 4.`);
  }

  // Create TanStack form with schema validation
  const form = useForm({
    defaultValues: initialValues || {},
    validators: {
      onChange: config.schema,
      onSubmit: config.schema
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as T);
    }
  });

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <FormLayout
        title={config.title}
        description={config.description}
        submitLabel={`Save ${config.title}`}
        onCancel={onCancel}
        isSubmitting={loading}
        canSubmit={form.state.canSubmit}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {(config.fields as Field<T>[]).map((fieldConfig) => (
            <div key={String(fieldConfig.name)} className="space-y-2">
              <label
                htmlFor={String(fieldConfig.name)}
                className="text-sm font-medium leading-none"
              >
                {fieldConfig.label}
              </label>
              
              <form.Field name={String(fieldConfig.name)}>
                {(field) => renderField(fieldConfig, field)}
              </form.Field>
            </div>
          ))}
        </form>
      </FormLayout>
    </div>
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