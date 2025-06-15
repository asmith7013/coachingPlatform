"use client";

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Textarea } from '@components/core/fields/Textarea';
import { Select } from '@components/core/fields/Select';
import { CoachingActionPlanZodSchema, type CoachingActionPlan } from '@zod-schema/cap/coaching-action-plan';
import { Button } from '@components/core/Button';

interface CAPStage4Props {
  data: CoachingActionPlan;
  onChange: (analysisData: CoachingActionPlan) => void;
  goal?: CoachingActionPlan;
  planId: string;
  className?: string;
}

export function CoachingActionPlanStage4({ 
  data, 
  onChange, 
  className 
}: CAPStage4Props) {
  const form = useForm({
    defaultValues: data,
    validators: {
      onChange: (value) => {
        const result = CoachingActionPlanZodSchema.safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const validatedData = CoachingActionPlanZodSchema.parse(value);
      onChange(validatedData);
    },
  });

  return (
    <div className={className}>
      <FormLayout 
        title="Stage 4: End of Cycle Analysis" 
        isSubmitting={false} 
        canSubmit={form.state.canSubmit} 
        submitLabel="Save"
      >
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          form.handleSubmit(); 
        }} className="space-y-8">
          
          <form.Field name="goalMet">
            {(field) => (
              <Select
                fieldApi={field}
                value={String(field.state.value)}
                onChange={(v) => field.handleChange(v === 'true')}
                label="Goal Met"
                options={[
                  { value: 'true', label: 'Yes' }, 
                  { value: 'false', label: 'No' }
                ]}
              />
            )}
          </form.Field>
          
          <form.Field name="impactOnLearning">
            {(field) => (
              <Textarea 
                fieldApi={field} 
                label="Impact on Learning" 
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          
          <form.Field name="lessonsLearned">
            {(field) => (
              <Textarea 
                fieldApi={field} 
                label="Lessons Learned" 
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          
          <form.Field name="recommendationsForNext">
            {(field) => (
              <Textarea 
                fieldApi={field} 
                label="Recommendations for Next Cycle" 
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          
          <div className="flex justify-end pt-6">
            <Button 
              type="submit" 
              disabled={!form.state.canSubmit} 
              className="ml-auto"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </FormLayout>
    </div>
  );
}

export type { CAPStage4Props as CoachingActionPlanStage4Props }; 