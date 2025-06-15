"use client";

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Input } from '@components/core/fields/Input';
import { Textarea } from '@components/core/fields/Textarea';
import { Select } from '@components/core/fields/Select';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';
import type { Field } from '@ui-types/form';
import { 
  CapWeeklyPlan, 
  CapImplementationRecord, 
  CapOutcome,
  CapEvidence,
  CapWeeklyPlanZodSchema,
  CapImplementationRecordZodSchema,
  CapEvidenceZodSchema,
} from '@zod-schema/cap';
import { stageFieldConfigs } from '@/lib/ui/forms/fieldConfig/coaching/coaching-action-plan-stages';

type StageData = CapWeeklyPlan | CapImplementationRecord | CapOutcome | CapEvidence;

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
    schema: CapWeeklyPlanZodSchema,
    fields: stageFieldConfigs[1]
  },
  2: {
    title: 'Stage 2: Goal & Outcomes', 
    description: 'Define SMART goals with measurable teacher and student outcomes',
    schema: CapWeeklyPlanZodSchema,
    fields: stageFieldConfigs[2]
  },
  3: {
    title: 'Stage 3: Implementation Record',
    description: 'Document what actually happened during coaching visits',
    schema: CapImplementationRecordZodSchema,
    fields: stageFieldConfigs[3]
  },
  4: {
    title: 'Stage 4: End of Cycle Analysis',
    description: 'Analyze goal achievement and plan for next steps',
    schema: CapEvidenceZodSchema,
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
                {(field) => (
                  <div className="space-y-1">
                    {['text', 'email', 'password', 'number'].includes(fieldConfig.type) && (
                      <Input
                        type={fieldConfig.type}
                        value={String(field.state.value ?? '')}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                      />
                    )}
                    {fieldConfig.type === 'textarea' && (
                      <Textarea
                        value={String(field.state.value ?? '')}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                      />
                    )}
                    {fieldConfig.type === 'select' && (
                      fieldConfig.multiple ? (
                        <Select
                          value={Array.isArray(field.state.value) ? field.state.value as string[] : []}
                          onChange={field.handleChange}
                          options={fieldConfig.options || []}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled}
                          multiple={true}
                        />
                      ) : (
                        <Select
                          value={typeof field.state.value === 'string' ? field.state.value as string : ''}
                          onChange={field.handleChange}
                          options={fieldConfig.options || []}
                          placeholder={fieldConfig.placeholder}
                          disabled={fieldConfig.disabled}
                        />
                      )
                    )}
                    {fieldConfig.type === 'reference' && (
                      <ReferenceSelect
                        url={fieldConfig.url || ''}
                        value={field.state.value as string | string[]}
                        onChange={field.handleChange}
                        multiple={fieldConfig.multiple}
                        placeholder={fieldConfig.placeholder}
                        disabled={fieldConfig.disabled}
                        entityType={fieldConfig.entityType}
                        label={fieldConfig.label}
                      />
                    )}
                    {field.state.meta.errors?.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
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
  props: Omit<ActionPlanStageFormProps<CapWeeklyPlan>, 'stage'>
) {
  return <ActionPlanStageForm<CapWeeklyPlan> stage={1} {...props} />;
}

export function GoalForm(
  props: Omit<ActionPlanStageFormProps<CapWeeklyPlan>, 'stage'>
) {
  return <ActionPlanStageForm<CapWeeklyPlan> stage={2} {...props} />;
}

export function ImplementationRecordForm(
  props: Omit<ActionPlanStageFormProps<CapImplementationRecord>, 'stage'>
) {
  return <ActionPlanStageForm<CapImplementationRecord> stage={3} {...props} />;
}

export function EndOfCycleAnalysisForm(
  props: Omit<ActionPlanStageFormProps<CapOutcome>, 'stage'>
) {
  return <ActionPlanStageForm<CapOutcome> stage={4} {...props} />;
} 