"use client";

import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@components/core/Button';
import { Card } from '@components/composed/cards';
import { Text } from '@components/core/typography/Text';
import { Heading } from '@components/core/typography/Heading';
import { Input } from '@components/core/fields/Input';
import { Select } from '@components/core/fields/Select';
import { ReferenceSelect } from '@components/core/fields/ReferenceSelect';
import { Textarea } from '@components/core/fields/Textarea';
import { 
  CoachingActionPlanInput,
  CoachingActionPlanInputZodSchema
} from '@zod-schema/core/cap';
import { createCoachingActionPlanDefaults } from '@zod-schema/core/cap';
import { AcademicYearZod, CoachingActionPlanStatusZod } from '@enums';

interface CoachingActionPlanFormProps {
  mode: 'create' | 'edit';
  initialData: CoachingActionPlanInput;
  onSubmit: (data: CoachingActionPlanInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: string;
}

export function CoachingActionPlanForm({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  error 
}: CoachingActionPlanFormProps) {
  const [activeSection, setActiveSection] = useState<string>('basic');

  const form = useForm({
    defaultValues: createCoachingActionPlanDefaults(initialData),
    validators: {
      onChange: CoachingActionPlanInputZodSchema,
      onSubmit: CoachingActionPlanInputZodSchema
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as CoachingActionPlanInput);
    }
  });

  // Options for select fields
  const academicYearOptions = AcademicYearZod.options.map((value: string) => ({ value, label: value }));
  const statusOptions = CoachingActionPlanStatusZod.options.map((value: string) => ({ value, label: value }));

  // Helper to render fields for each section
  const renderSectionFields = (section: string) => {
    switch (section) {
      case 'basic':
        return <>
          <form.Field name="title">{(field) => <Input fieldApi={field} label="Title" required />}</form.Field>
          <form.Field name="teachers">{(field) => <ReferenceSelect fieldApi={field} value={field.state.value as string[]} onChange={field.handleChange} label="Teachers" url="/api/staff" multiple />}</form.Field>
          <form.Field name="coaches">{(field) => <ReferenceSelect fieldApi={field} value={field.state.value as string[]} onChange={field.handleChange} label="Coaches" url="/api/staff" multiple />}</form.Field>
          <form.Field name="school">{(field) => <ReferenceSelect fieldApi={field} value={field.state.value as string} onChange={field.handleChange} label="School" url="/api/schools" />}</form.Field>
          <form.Field name="academicYear">{(field) => <Select fieldApi={field} value={field.state.value as string} onChange={field.handleChange} label="Academic Year" options={academicYearOptions} />}</form.Field>
          <form.Field name="status">{(field) => <Select fieldApi={field} value={field.state.value as string} onChange={field.handleChange} label="Status" options={statusOptions} />}</form.Field>
        </>;
      case 'needs':
        return <>
          <form.Field name="needsAndFocus.ipgCoreAction">{(field) => <Input fieldApi={field} label="IPG Core Action" />}</form.Field>
          <form.Field name="needsAndFocus.ipgSubCategory">{(field) => <Input fieldApi={field} label="IPG Sub Category" />}</form.Field>
          <form.Field name="needsAndFocus.rationale">{(field) => <Textarea fieldApi={field} label="Rationale" />}</form.Field>
        </>;
      case 'goal':
        return <>
          <form.Field name="goal.description">{(field) => <Textarea fieldApi={field} label="Goal Description" />}</form.Field>
        </>;
      case 'timeline':
        return <>
          <form.Field name="startDate">{(field) => <Input fieldApi={field} label="Start Date" type="date" />}</form.Field>
          <form.Field name="endDate">{(field) => <Input fieldApi={field} label="End Date" type="date" />}</form.Field>
          <form.Field name="cycleLength">{(field) => <Input fieldApi={field} label="Cycle Length" type="number" />}</form.Field>
        </>;
      case 'weekly':
        return <form.Field name="weeklyPlans">{(field) => <Textarea fieldApi={field} label="Weekly Plans" />}</form.Field>;
      case 'implementation':
        return <form.Field name="implementationRecords">{(field) => <Textarea fieldApi={field} label="Implementation Records" />}</form.Field>;
      case 'analysis':
        return <form.Field name="endOfCycleAnalysis">{(field) => <Textarea fieldApi={field} label="End of Cycle Analysis" />}</form.Field>;
      default:
        return null;
    }
  };

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
                  {renderSectionFields(activeSection)}
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