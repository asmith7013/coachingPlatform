"use client";

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@components/composed/forms/FormLayout';
import { Input } from '@components/core/fields/Input';
import { Textarea } from '@components/core/fields/Textarea';
import { Select } from '@components/core/fields/Select';
import { 
  CoachingActionPlanInputZodSchema,
  type CoachingActionPlanInput
} from '@zod-schema/core/cap';
import { 
  IPGCoreActionZod,
  IPGSubCategoryZod,
  CoachingActionPlanStatusZod
} from '@enums';

interface CAPStage2Props {
  data: CoachingActionPlanInput;
  onChange: (formData: CoachingActionPlanInput) => void;
  className?: string;
}

export function CoachingActionPlanStage2({ 
  data,
  onChange,
  className
}: CAPStage2Props) {
  const form = useForm({
    defaultValues: data,
    validators: {
      onChange: CoachingActionPlanInputZodSchema,
    },
    onSubmit: async ({ value }) => {
      onChange(value);
    },
  });

  // Create options for select fields
  const ipgCoreActionOptions = IPGCoreActionZod.options.map(option => ({
    value: option,
    label: option
  }));

  const ipgSubCategoryOptions = IPGSubCategoryZod.options.map(option => ({
    value: option,
    label: option
  }));

  const statusOptions = CoachingActionPlanStatusZod.options.map(option => ({
    value: option,
    label: option.charAt(0).toUpperCase() + option.slice(1)
  }));

  return (
    <div className={className}>
      <FormLayout 
        title="Stage 2: Goal Definition" 
        isSubmitting={form.state.isSubmitting} 
        canSubmit={form.state.canSubmit} 
        submitLabel="Save Changes"
      >
        <form 
          onSubmit={(e) => { 
            e.preventDefault(); 
            form.handleSubmit(); 
          }} 
          className="space-y-6"
        >
          
          {/* Goal Description */}
          <form.Field name="goalDescription">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Goal Description
                </label>
                <Textarea
                  value={(field.state.value as string) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Describe the primary goal for this coaching plan..."
                  rows={4}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* IPG Core Action */}
          <form.Field name="ipgCoreAction">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  IPG Core Action
                </label>
                <Select
                  value={(field.state.value as string) || 'CA1'}
                  onChange={field.handleChange}
                  options={ipgCoreActionOptions}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* IPG Sub Category */}
          <form.Field name="ipgSubCategory">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  IPG Sub Category
                </label>
                <Select
                  value={(field.state.value as string) || 'CA1A'}
                  onChange={field.handleChange}
                  options={ipgSubCategoryOptions}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Rationale */}
          <form.Field name="rationale">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rationale
                </label>
                <Textarea
                  value={(field.state.value as string | number) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Explain the rationale for selecting this focus area..."
                  rows={3}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Impact on Learning */}
          <form.Field name="impactOnLearning">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expected Impact on Student Learning
                </label>
                <Textarea
                  value={(field.state.value as string | number) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Describe the expected impact on student learning outcomes..."
                  rows={3}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Lessons Learned */}
          <form.Field name="lessonsLearned">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Lessons Learned (Previous Cycles)
                </label>
                <Textarea
                  value={(field.state.value as string | number) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="What key lessons were learned from previous coaching cycles?"
                  rows={3}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Recommendations for Next */}
          <form.Field name="recommendationsForNext">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Recommendations for Next Cycle
                </label>
                <Textarea
                  value={(field.state.value as string | number) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="What recommendations do you have for the next coaching cycle?"
                  rows={3}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Status */}
          <form.Field name="status">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Plan Status
                </label>
                <Select
                  value={(field.state.value as string) || 'draft'}
                  onChange={field.handleChange}
                  options={statusOptions}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Cycle Length */}
          <form.Field name="cycleLength">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Number of Coaching Cycles
                </label>
                <Input
                  type="number"
                  value={(field.state.value as number) || 3}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  min={1}
                  max={10}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Start Date */}
          <form.Field name="startDate">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={(field.state.value as string | number) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* End Date */}
          <form.Field name="endDate">
            {(field) => (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  End Date (Optional)
                </label>
                <Input
                  type="date"
                  value={(field.state.value as string | number) || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors?.length > 0 && typeof field.state.meta.errors[0] === 'string' && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors[0]}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Form-level error display */}
          <form.Subscribe 
            selector={(state) => state.errorMap}
          >
            {(errorMap) => 
              typeof errorMap.onChange === 'string' && (
                <div className="text-sm text-destructive">
                  <strong>Form Error:</strong> {errorMap.onChange}
                </div>
              )
            }
          </form.Subscribe>

        </form>
      </FormLayout>
    </div>
  );
}

export type { CAPStage2Props as CoachingActionPlanStage2Props };