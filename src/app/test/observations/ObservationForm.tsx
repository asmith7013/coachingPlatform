'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/core/Button';
import { Card } from '@/components/composed/cards';
import { Text } from '@/components/core/typography/Text';
import { Heading } from '@/components/core/typography/Heading';
import { Input } from '@/components/core/fields/Input';
import { Textarea } from '@/components/core/fields/Textarea';
import { Select } from '@/components/core/fields/Select';
import { ReferenceSelect } from '@/components/core/fields/ReferenceSelect';
import { Checkbox } from '@/components/core/fields/Checkbox';
import { 
  ClassroomObservationNoteInput
} from '@/lib/schema/zod-schema/observations/classroom-observation';
import { 
  ClassroomObservationFieldConfig,
  updateNestedObservationField 
} from '@/lib/ui/forms/fieldConfig/observations/classroom-observation';
import { toDateString } from '@/lib/data-processing/transformers/utils/date-utils';
import { get } from 'lodash';

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
  const [formData, setFormData] = useState<ClassroomObservationNoteInput>(initialData);
  const [activeSection, setActiveSection] = useState<string>('basic');

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Handle field changes with nested field support
  const handleFieldChange = useCallback((fieldKey: string, value: unknown) => {
    setFormData(prev => {
      const updated = updateNestedObservationField(prev, fieldKey, value);
      return updated;
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  }, [formData, onSubmit]);

  // Get field value with nested support
  const getFieldValue = useCallback((fieldKey: string): unknown => {
    if (fieldKey.includes('.')) {
      return get(formData, fieldKey);
    }
    return (formData as Record<string, unknown>)[fieldKey];
  }, [formData]);

  // Render individual field based on field config
  const renderField = useCallback((fieldKey: string) => {
    const field = ClassroomObservationFieldConfig.find(f => f.key === fieldKey);
    if (!field) return null;

    const value = getFieldValue(fieldKey);
    const disabled = isSubmitting || (mode === 'edit' && field.editable === false);

    switch (field.type) {
      case 'text':
        return (
          <Input
            label={field.label}
            value={String(value || '')}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            label={field.label}
            value={String(value || '')}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
            rows={3}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            label={field.label}
            value={value ? toDateString(value as Date) : ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            required={field.required}
            disabled={disabled}
          />
        );
        
      case 'select':
        if (field.options) {
                     return (
             <Select
               label={field.label}
               value={String(value || field.defaultValue || '')}
               onChange={(newValue) => handleFieldChange(fieldKey, newValue)}
               options={field.options}
               disabled={disabled}
             />
           );
        }
        break;
        
      case 'checkbox':
        return (
          <Checkbox
            label={field.label}
            checked={Boolean(value)}
            onChange={(e) => handleFieldChange(fieldKey, e.target.checked)}
            disabled={disabled}
          />
        );

      case 'reference':
        return (
          <ReferenceSelect
            label={field.label}
            url={field.url || ''}
            value={String(value || '')}
            onChange={(newValue) => handleFieldChange(fieldKey, newValue)}
            disabled={disabled}
            placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
          />
        );
        
      default:
        return (
          <Input
            label={field.label}
            value={String(value || '')}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
          />
        );
    }
  }, [getFieldValue, handleFieldChange, isSubmitting, mode]);

  // Render section fields
  const renderSection = useCallback((sectionKey: string, title: string) => {
    const fields = FIELD_SECTIONS[sectionKey as keyof typeof FIELD_SECTIONS] || [];
    
    return (
      <div className="space-y-4">
        <Heading level="h4">{title}</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(fieldKey => (
            <div key={fieldKey} className={
              fieldKey.includes('launch') || fieldKey.includes('synthesis') || fieldKey.includes('workTime') || 
              fieldKey === 'learningTargets' || fieldKey === 'coolDown' || fieldKey === 'otherContext' ||
              fieldKey === 'progressMonitoring.overallNotes' ? 'md:col-span-2' : ''
            }>
              {renderField(fieldKey)}
            </div>
          ))}
        </div>
      </div>
    );
  }, [renderField]);

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
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section Navigation */}
          <div className="border-b border-gray-200">
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

          {/* Section Content */}
          <div className="min-h-[400px]">
            {activeSection === 'basic' && renderSection('basic', 'Basic Information')}
            {activeSection === 'lesson' && renderSection('lesson', 'Lesson Details')}
            {activeSection === 'warmUp' && renderSection('warmUp', 'Warm Up Activity')}
            {activeSection === 'activity1' && renderSection('activity1', 'Activity 1')}
            {activeSection === 'synthesis' && renderSection('synthesis', 'Lesson Synthesis')}
            {activeSection === 'monitoring' && renderSection('monitoring', 'Progress Monitoring')}
            {activeSection === 'timing' && renderSection('timing', 'Time Tracking')}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <Text color="danger">{error}</Text>
            </div>
          )}

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
        </form>
      </Card.Body>
    </Card>
  );
} 