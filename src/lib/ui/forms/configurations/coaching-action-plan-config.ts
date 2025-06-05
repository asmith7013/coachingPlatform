import type { FormConfiguration } from '@ui-types/form';
import { CoachingActionPlanInputZodSchema } from '@zod-schema/core/cap';
import { createModeAwareConfig, type FormMode } from './schema-aware-builders';

/**
 * Schema-aware Coaching Action Plan Form Configuration
 * Type-safe field builders that validate against CoachingActionPlanInputZodSchema
 */
const coachingActionPlanConfigFactory = createModeAwareConfig(
  CoachingActionPlanInputZodSchema,
  (builder, _mode) => [
    // Basic Information
    builder.createTextField(
      'title',
      'Plan Title',
      true,
      true,
      'Descriptive title for this coaching action plan'
    ),
    builder.createReferenceField(
      'teachers',
      'Teachers',
      '/api/reference/staff?type=nycps',
      true, // multiple
      true,
      'Select teachers who will be coached in this plan'
    ),
    builder.createReferenceField(
      'coaches',
      'Coaches',
      '/api/reference/staff?type=teachinglab',
      true, // multiple
      true,
      'Select Teaching Lab coaches leading this plan'
    ),
    builder.createReferenceField(
      'school',
      'School',
      '/api/reference/schools',
      false, // single
      true,
      'Select the school where coaching takes place'
    ),
    builder.createTextField(
      'academicYear',
      'Academic Year',
      true,
      true,
      'Academic year for this plan (e.g., "2024-2025")'
    ),
    builder.createDateField(
      'startDate',
      'Start Date',
      true,
      'When the coaching plan begins'
    ),
    builder.createDateField(
      'endDate',
      'End Date',
      false,
      'When the coaching plan ends (optional)'
    ),
    builder.createSelectField(
      'status',
      'Status',
      [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'archived', label: 'Archived' }
      ],
      false,
      'Current status of the coaching plan'
    ),
    builder.createTextField(
      'cycleLength',
      'Cycle Length',
      false,
      true,
      'Number of coaching cycles in this plan (default: 3)'
    ),
    builder.createReferenceField(
      'owners',
      'Plan Owners',
      '/api/reference/staff',
      true, // multiple
      true,
      'Staff members responsible for managing this plan'
    )
  ]
);

// Export mode-specific configurations
export const CoachingActionPlanCreateFieldConfig = coachingActionPlanConfigFactory.create();
export const CoachingActionPlanEditFieldConfig = coachingActionPlanConfigFactory.edit();

/**
 * Stage-specific field configurations for the wizard interface
 */

// Stage 1: Needs and Focus (IPG Focus)
export const Stage1FieldConfig = [
  {
    key: 'needsAndFocus.ipgCoreAction',
    label: 'Core Action',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'CA1', label: 'Core Action 1' },
      { value: 'CA2', label: 'Core Action 2' },
      { value: 'CA3', label: 'Core Action 3' }
    ],
    helpText: 'Select the primary IPG core action to focus on'
  },
  {
    key: 'needsAndFocus.ipgSubCategory',
    label: 'Subsection',
    type: 'select' as const,
    required: true,
    options: [], // Will be populated dynamically based on core action
    helpText: 'Select the specific subsection within the core action'
  },
  {
    key: 'needsAndFocus.rationale',
    label: 'Rationale',
    type: 'textarea' as const,
    required: true,
    helpText: 'Explain why this focus area was selected'
  }
];

// Stage 2: Goal and Metrics
export const Stage2FieldConfig = [
  {
    key: 'goal.description',
    label: 'SMART Goal Description',
    type: 'textarea' as const,
    required: true,
    placeholder: 'By the end of the coaching cycle, the teacher will... As a result... This will be evidenced by...',
    helpText: 'Write a SMART goal that follows the structured format'
  }
  // Note: Teacher and student outcomes with metrics will be handled by specialized components
];

// Stage 3: Weekly Plans
export const Stage3FieldConfig = [
  // Weekly plans will be handled by specialized components due to their complex array structure
];

// Stage 4: End of Cycle Analysis
export const Stage4FieldConfig = [
  {
    key: 'endOfCycleAnalysis.goalMet',
    label: 'Goal Met',
    type: 'select' as const,
    required: true,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ],
    helpText: 'Was the primary goal achieved?'
  },
  {
    key: 'endOfCycleAnalysis.impactOnLearning',
    label: 'Impact on Learning',
    type: 'textarea' as const,
    required: true,
    helpText: 'What impact did this goal have on student learning?'
  },
  {
    key: 'endOfCycleAnalysis.lessonsLearned',
    label: 'Lessons Learned',
    type: 'textarea' as const,
    required: false,
    helpText: 'Key lessons learned from this coaching cycle'
  },
  {
    key: 'endOfCycleAnalysis.recommendationsForNext',
    label: 'Recommendations for Next Cycle',
    type: 'textarea' as const,
    required: false,
    helpText: 'Recommendations for the next coaching cycle'
  }
];

/**
 * Form configuration factory
 */
export const createCoachingActionPlanFormConfig = (mode: FormMode): FormConfiguration => ({
  fields: mode === 'create' ? CoachingActionPlanCreateFieldConfig : CoachingActionPlanEditFieldConfig,
  schema: CoachingActionPlanInputZodSchema,
  title: mode === 'create' ? 'Create Coaching Action Plan' : 'Edit Coaching Action Plan',
  description: mode === 'create' 
    ? 'Create a new coaching action plan with structured goals and implementation tracking'
    : 'Update coaching action plan details and progress'
});

/**
 * Stage-specific configuration factory for wizard interface
 */
export const createStageFormConfig = (stage: 1 | 2 | 3 | 4): FormConfiguration => {
  const stageConfigs = {
    1: { fields: Stage1FieldConfig, title: 'Needs Assessment & IPG Focus' },
    2: { fields: Stage2FieldConfig, title: 'SMART Goals & Metrics' },
    3: { fields: Stage3FieldConfig, title: 'Weekly Implementation Plans' },
    4: { fields: Stage4FieldConfig, title: 'End of Cycle Analysis' }
  };

  const config = stageConfigs[stage];
  
  return {
    fields: config.fields,
    schema: CoachingActionPlanInputZodSchema,
    title: config.title,
    description: `Complete Stage ${stage} of the coaching action plan`
  };
}; 