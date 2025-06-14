"use client";

import React, { useState, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { useFieldRenderer } from '@ui/forms/hooks/useFieldRenderer';
import { CoachingActionPlanFieldConfig } from '@ui/forms/fieldConfig/coaching';
import type { Field } from '@ui-types/form';
import { 
  CoachingActionPlanInput,
  CoachingActionPlanInputZodSchema
} from '@zod-schema/core/cap';

interface CoachingActionPlanFormProps {
  mode: 'create' | 'edit';
  initialData: CoachingActionPlanInput;
  onSubmit: (data: CoachingActionPlanInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string;
}

// Group fields by section for better organization
const FIELD_SECTIONS = {
  basic: ['title', 'teachers', 'coaches', 'school', 'academicYear', 'status'],
  needs: ['needsAndFocus.ipgCoreAction', 'needsAndFocus.ipgSubCategory', 'needsAndFocus.rationale'],
  goal: ['goal.description'],
  timeline: ['startDate', 'endDate', 'cycleLength'],
  weekly: ['weeklyPlans'],
  implementation: ['implementationRecords'],
  analysis: ['endOfCycleAnalysis']
};

export function CoachingActionPlanForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  error 
}: CoachingActionPlanFormProps) {
  const [activeSection, setActiveSection] = useState<string>('basic');
  const { renderField } = useFieldRenderer<CoachingActionPlanInput>();

  // Create TanStack form with schema validation
  const form = useForm({
    defaultValues: initialData,
    validators: {
      onChange: CoachingActionPlanInputZodSchema,
      onSubmit: CoachingActionPlanInputZodSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as CoachingActionPlanInput);
    }
  });

  // Get fields for current section
  const getSectionFields = useCallback((sectionKey: string) => {
    const sectionFieldNames = FIELD_SECTIONS[sectionKey as keyof typeof FIELD_SECTIONS] || [];
    return CoachingActionPlanFieldConfig.filter((field: Field<CoachingActionPlanInput>) => 
      sectionFieldNames.includes(String(field.name))
    );
  }, []);

  return (
    <Card>
      <Card.Header>
        <Heading level="h3">
          {mode === 'create' ? 'Create New Coaching Action Plan' : 'Edit Coaching Action Plan'}
        </Heading>
        <Text textSize="sm" color="muted">
          {mode === 'create' 
            ? 'Fill in the coaching action plan details below'
            : 'Update the coaching action plan details below'
          }
        </Text>
      </Card.Header>
      
      <Card.Body>
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <Text color="danger">{error}</Text>
          </div>
        )}

        {/* Section Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {Object.entries({
              basic: 'Basic Info',
              needs: 'Needs & Focus',
              goal: 'Goal Setting',
              timeline: 'Timeline',
              weekly: 'Weekly Plans',
              implementation: 'Implementation',
              analysis: 'Analysis'
            }).map(([key, title]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {title}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div className="min-h-[400px]">
              <div className="space-y-4">
                <Heading level="h4">
                  {Object.entries({
                    basic: 'Basic Information',
                    needs: 'Needs Assessment & Focus',
                    goal: 'Goal Setting',
                    timeline: 'Timeline & Duration',
                    weekly: 'Weekly Planning',
                    implementation: 'Implementation Records',
                    analysis: 'End of Cycle Analysis'
                  }).find(([key]) => key === activeSection)?.[1]}
                </Heading>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSectionFields(activeSection).map((fieldConfig: Field<CoachingActionPlanInput>) => (
                    <div 
                      key={String(fieldConfig.name)} 
                      className={
                        fieldConfig.type === 'textarea' || 
                        String(fieldConfig.name).includes('description') ||
                        String(fieldConfig.name).includes('rationale') ||
                        fieldConfig.name === 'weeklyPlans' || 
                        fieldConfig.name === 'implementationRecords' ||
                        fieldConfig.name === 'endOfCycleAnalysis'
                          ? 'md:col-span-2' 
                          : ''
                      }
                    >
                      <label
                        htmlFor={String(fieldConfig.name)}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        {fieldConfig.label}
                      </label>
                      
                      <form.Field name={String(fieldConfig.name)}>
                        {(field) => renderField(fieldConfig, field)}
                      </form.Field>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                appearance="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                appearance="solid"
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Saving...' : mode === 'create' ? 'Create Plan' : 'Update Plan'}
              </Button>
            </div>
          </fieldset>
        </form>
      </Card.Body>
    </Card>
  );
} 