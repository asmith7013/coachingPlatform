'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { useFieldRenderer } from '@ui/forms/hooks/useFieldRenderer';
import { ClassroomObservationFieldConfig } from '@ui/forms/fieldConfig/observations';
import type { Field } from '@ui-types/form';
import { 
  ClassroomObservationNoteInput,
  ClassroomObservationNoteInputZodSchema
} from '@zod-schema/observations/classroom-observation';

interface ObservationFormProps {
  mode: 'create' | 'edit';
  initialData: ClassroomObservationNoteInput;
  onSubmit: (data: ClassroomObservationNoteInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string;
}

// Group fields by section for better organization
const FIELD_SECTIONS = {
  basic: ['cycle', 'session', 'date', 'teacherId', 'coachId', 'schoolId', 'visitId', 'status', 'isSharedWithTeacher'],
  lesson: ['lesson.title', 'lesson.course', 'lesson.unit', 'lesson.lessonNumber', 'otherContext', 'learningTargets', 'coolDown'],
  warmUp: ['lessonFlow.warmUp.launch', 'lessonFlow.warmUp.workTime', 'lessonFlow.warmUp.synthesis'],
  activity1: ['lessonFlow.activity1.launch', 'lessonFlow.activity1.workTime', 'lessonFlow.activity1.synthesis'],
  synthesis: ['lessonFlow.lessonSynthesis.launch', 'lessonFlow.lessonSynthesis.workTime', 'lessonFlow.lessonSynthesis.synthesis'],
  monitoring: ['progressMonitoring.overallNotes'],
  timing: ['timeTracking.classStartTime', 'timeTracking.classEndTime']
};

export function ObservationForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  error 
}: ObservationFormProps) {
  const [activeSection, setActiveSection] = useState<string>('basic');
  const { renderField } = useFieldRenderer<ClassroomObservationNoteInput>();

  // Create TanStack form with schema validation
  const form = useForm({
    defaultValues: initialData,
    validators: {
      onChange: ClassroomObservationNoteInputZodSchema,
      onSubmit: ClassroomObservationNoteInputZodSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as ClassroomObservationNoteInput);
    }
  });

  // Get fields for current section
  const getSectionFields = useCallback((sectionKey: string) => {
    const sectionFieldNames = FIELD_SECTIONS[sectionKey as keyof typeof FIELD_SECTIONS] || [];
    return ClassroomObservationFieldConfig.filter((field: Field<ClassroomObservationNoteInput>) => 
      sectionFieldNames.includes(String(field.name))
    );
  }, []);

  return (
    <Card>
      <Card.Header>
        <Heading level="h3">
          {mode === 'create' ? 'Create New Observation' : 'Edit Observation'}
        </Heading>
        <Text textSize="sm" color="muted">
          {mode === 'create' 
            ? 'Fill in the observation details below'
            : 'Update the observation details below'
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
              lesson: 'Lesson Details',
              warmUp: 'Warm Up',
              activity1: 'Activity 1',
              synthesis: 'Synthesis',
              monitoring: 'Progress Monitoring',
              timing: 'Time Tracking'
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

        {/* Form without Provider - TanStack Form doesn't use providers */}
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
                    lesson: 'Lesson Details',
                    warmUp: 'Warm Up Activity',
                    activity1: 'Activity 1',
                    synthesis: 'Lesson Synthesis',
                    monitoring: 'Progress Monitoring',
                    timing: 'Time Tracking'
                  }).find(([key]) => key === activeSection)?.[1]}
                </Heading>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSectionFields(activeSection).map((fieldConfig: Field<ClassroomObservationNoteInput>) => (
                    <div 
                      key={String(fieldConfig.name)} 
                      className={
                        fieldConfig.type === 'textarea' || 
                        String(fieldConfig.name).includes('launch') ||
                        String(fieldConfig.name).includes('synthesis') ||
                        String(fieldConfig.name).includes('workTime') ||
                        fieldConfig.name === 'learningTargets' || 
                        fieldConfig.name === 'coolDown' || 
                        fieldConfig.name === 'otherContext' ||
                        fieldConfig.name === 'progressMonitoring.overallNotes' 
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
                {isSubmitting ? '⏳ Saving...' : mode === 'create' ? 'Create Observation' : 'Update Observation'}
              </Button>
            </div>
          </fieldset>
        </form>
      </Card.Body>
    </Card>
  );
} 