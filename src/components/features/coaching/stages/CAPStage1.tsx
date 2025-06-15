import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Select } from '@components/core/fields/Select';
import { Textarea } from '@components/core/fields/Textarea';
import { CoachingActionPlan, CoachingActionPlanZodSchema } from '@zod-schema/cap/coaching-action-plan';
import { Button } from '@components/core/Button';
import { IPGCoreActionZod, IPGSubCategoryZod } from '@enums';

interface CAPStage1Props {
  data: Pick<CoachingActionPlan, 'ipgCoreAction' | 'ipgSubCategory' | 'rationale' | 'pdfAttachment'>;
  onChange: (updates: Pick<CoachingActionPlan, 'ipgCoreAction' | 'ipgSubCategory' | 'rationale' | 'pdfAttachment'>) => void;
  className?: string;
}

export function CoachingActionPlanStage1({ 
  data, 
  onChange, 
  className 
}: CAPStage1Props) {
  const form = useForm({
    defaultValues: data,
    validators: {
      onChange: (value) => {
        const result = CoachingActionPlanZodSchema.pick({
          ipgCoreAction: true,
          ipgSubCategory: true,
          rationale: true,
          pdfAttachment: true
        }).safeParse(value);
        if (!result.success) {
          return result.error.formErrors.fieldErrors;
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      onChange(value);
    },
  });

  const coreActionOptions = IPGCoreActionZod.options.map((value: string) => ({ 
    value, 
    label: value 
  }));
  
  const subCategoryOptions = IPGSubCategoryZod.options.map((value: string) => ({ 
    value, 
    label: value 
  }));

  return (
    <div className={className}>
      <FormLayout
        title="Stage 1: Needs Assessment and Focus"
        description="Identify the primary focus area for this coaching cycle"
        isSubmitting={false}
        canSubmit={form.state.canSubmit}
        submitLabel="Save"
      >
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          form.handleSubmit(); 
        }} className="space-y-6">
          
          <form.Field name="ipgCoreAction">
            {(field) => (
              <Select 
                fieldApi={field} 
                value={field.state.value} 
                onChange={field.handleChange} 
                label="IPG Core Action" 
                options={coreActionOptions} 
              />
            )}
          </form.Field>

          <form.Field name="ipgSubCategory">
            {(field) => (
              <Select 
                fieldApi={field} 
                value={field.state.value} 
                onChange={field.handleChange} 
                label="IPG Sub Category" 
                options={subCategoryOptions} 
              />
            )}
          </form.Field>

          <form.Field name="rationale">
            {(field) => (
              <Textarea 
                fieldApi={field} 
                label="Rationale" 
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <div className="flex justify-end pt-4">
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

export type { CAPStage1Props as CoachingActionPlanStage1Props };