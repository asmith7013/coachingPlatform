"use client";

import React from 'react';
import { useForm } from '@tanstack/react-form';

import { FormLayout } from '@components/composed/forms/FormLayout';
import { Input } from '@components/core/fields/Input';
import { Textarea } from '@components/core/fields/Textarea';
import { Select } from '@components/core/fields/Select';
import { Button } from '@components/core/Button';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { 
  MetricCollectionMethodZod,
  type Outcome,
  type Metric,
  CoachingActionPlan,
  CoachingActionPlanZodSchema
} from '@zod-schema/cap';

interface CAPStage2Props {
  data: CoachingActionPlan;
  onChange: (goalData: CoachingActionPlan) => void;
  planId: string;
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

  const collectionMethodOptions = MetricCollectionMethodZod.options.map(
    (option: string) => ({ value: option, label: option })
  );

  // Helper for rendering outcome arrays
  const renderOutcomeArray = (
    fieldName: keyof CoachingActionPlan, 
    label: string
  ) => (
    <form.Field name={fieldName}>
      {(outcomeArrayField) => {
        const outcomes = (outcomeArrayField.state.value as Outcome[]) || [];
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">{label}</span>
              <Button
                type="button"
                appearance="outline"
                onClick={() => {
                  const newOutcome: Outcome = {
                    type: fieldName === 'teacherOutcomes' ? 'teacher-facing' : 'student-facing',
                    description: '',
                    metrics: [],
                    evidence: []
                  };
                  outcomeArrayField.handleChange([...outcomes, newOutcome]);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-1" /> Add Outcome
              </Button>
            </div>
            
            {outcomes.map((outcome: Outcome, outcomeIndex: number) => (
              <div key={outcomeIndex} className="border rounded-md p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Outcome {outcomeIndex + 1}</span>
                  <Button
                    type="button"
                    appearance="outline"
                    onClick={() => {
                      const updatedOutcomes = outcomes.filter((_, i) => i !== outcomeIndex);
                      outcomeArrayField.handleChange(updatedOutcomes);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
                
                <form.Field name={`${fieldName}.${outcomeIndex}.description` as any}>
                  {(field) => (
                    <Textarea 
                      fieldApi={field} 
                      label="Description" 
                      placeholder="Describe the expected outcome..." 
                    />
                  )}
                </form.Field>
                
                {/* Metrics section */}
                <form.Field name={`${fieldName}.${outcomeIndex}.metrics` as any}>
                  {(metricsArrayField) => {
                    const metrics = (metricsArrayField.state.value as Metric[]) || [];
                    
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">Metrics</span>
                          <Button
                            type="button"
                            appearance="outline"
                            onClick={() => {
                              const newMetric: Metric = {
                                type: 'quantitative',
                                description: '',
                                name: '',
                                collectionMethod: 'observation',
                                baselineValue: '',
                                targetValue: '',
                                currentValue: '',
                                notes: ''
                              };
                              metricsArrayField.handleChange([...metrics, newMetric]);
                            }}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" /> Add Metric
                          </Button>
                        </div>
                        
                        {metrics.map((metric: Metric, metricIndex: number) => (
                          <div key={metricIndex} className="border rounded-md p-2 space-y-2">
                            <Input 
                              label="Metric Name" 
                              value={metric.name}
                              onChange={(e) => {
                                const updatedMetrics = [...metrics];
                                updatedMetrics[metricIndex] = {
                                  ...updatedMetrics[metricIndex],
                                  name: e.target.value
                                };
                                metricsArrayField.handleChange(updatedMetrics);
                              }}
                            />
                            
                            <Select 
                              label="Collection Method" 
                              value={metric.collectionMethod}
                              onChange={(value) => {
                                const updatedMetrics = [...metrics];
                                updatedMetrics[metricIndex] = {
                                  ...updatedMetrics[metricIndex],
                                  collectionMethod: value
                                };
                                metricsArrayField.handleChange(updatedMetrics);
                              }}
                              options={collectionMethodOptions}
                            />
                            
                            <Input 
                              label="Target Value" 
                              value={metric.targetValue}
                              onChange={(e) => {
                                const updatedMetrics = [...metrics];
                                updatedMetrics[metricIndex] = {
                                  ...updatedMetrics[metricIndex],
                                  targetValue: e.target.value
                                };
                                metricsArrayField.handleChange(updatedMetrics);
                              }}
                            />
                            
                            <Button
                              type="button"
                              appearance="outline"
                              onClick={() => {
                                const updatedMetrics = metrics.filter((_, i) => i !== metricIndex);
                                metricsArrayField.handleChange(updatedMetrics);
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                </form.Field>
              </div>
            ))}
          </div>
        );
      }}
    </form.Field>
  );

  return (
    <div className={className}>
      <FormLayout 
        title="Stage 2: Goal Definition" 
        isSubmitting={false} 
        canSubmit={form.state.canSubmit} 
        submitLabel="Save"
      >
        <form onSubmit={(e) => { 
          e.preventDefault(); 
          form.handleSubmit(); 
        }} className="space-y-8">
          
          <form.Field name="description">
            {(field) => (
              <Textarea
                fieldApi={field} 
                label="Goal Description" 
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          
          {renderOutcomeArray('teacherOutcomes', 'Teacher Outcomes')}
          {renderOutcomeArray('studentOutcomes', 'Student Outcomes')}
          
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

export type { CAPStage2Props as CoachingActionPlanStage2Props };