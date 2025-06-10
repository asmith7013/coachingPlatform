import type { FormConfiguration } from '@ui-types/form';
import { CoachingActionPlanInputZodSchema } from '@zod-schema/core/cap';
import { createModeAwareConfig, type FormMode } from './schema-aware-builders';
import type { Field } from '@ui-types/form';
import { 
  IPGCoreActionZod,
  CoachingCycleNumberZod,
  VisitNumberZod
} from '@zod-schema/core/cap';

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
      'ownerIds',
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
 * Field Configuration for Stage 1: Needs and Focus
 * Maps directly to NeedsAndFocus schema properties
 */
export const NeedsAndFocusFieldConfig: Field[] = [
  {
    key: 'ipgCoreAction',
    label: 'IPG Core Action',
    type: 'select',
    required: true,
    options: IPGCoreActionZod.options.map(value => ({
      value,
      label: getIPGCoreActionLabel(value)
    })),
    placeholder: 'Select IPG Core Action focus',
    helpText: 'Primary IPG Core Action focus for this coaching plan'
  },
  {
    key: 'ipgSubCategory',
    label: 'IPG Sub-Category',
    type: 'select',
    required: true,
    options: [], // Will be populated dynamically based on selected core action
    placeholder: 'Select specific sub-category',
    helpText: 'Specific sub-category within the selected core action'
  },
  {
    key: 'rationale',
    label: 'Rationale',
    type: 'textarea',
    required: true,
    placeholder: 'Explain the rationale for selecting this focus area...',
    helpText: 'Rationale for selecting this focus area'
  },
  {
    key: 'pdfAttachment',
    label: 'Supporting Document',
    type: 'file',
    required: false,
    helpText: 'Optional PDF document to support the needs assessment'
  }
];

/**
 * Field Configuration for Stage 2: Goals & Metrics
 * Maps directly to Goal schema properties
 */
export const GoalFieldConfig: Field[] = [
  {
    key: 'description',
    label: 'Primary Goal Statement',
    type: 'textarea',
    required: true,
    placeholder: 'Define the primary goal for this coaching cycle...',
    helpText: 'Clear statement of the primary goal for this coaching plan'
  }
];

/**
 * Field Configuration for Stage 3: Implementation Records
 * Maps directly to ImplementationRecord schema properties
 */
export const ImplementationRecordFieldConfig: Field[] = [
  {
    key: 'date',
    label: 'Implementation Date',
    type: 'date',
    required: true,
    helpText: 'Date when this implementation occurred'
  },
  {
    key: 'cycleNumber',
    label: 'Cycle Number',
    type: 'select',
    required: true,
    options: CoachingCycleNumberZod.options.map(value => ({
      value,
      label: `Cycle ${value}`
    })),
    helpText: 'Which coaching cycle this visit belongs to'
  },
  {
    key: 'visitNumber',
    label: 'Visit Number',
    type: 'select',
    required: true,
    options: VisitNumberZod.options.map(value => ({
      value,
      label: `Visit ${value}`
    })),
    helpText: 'Which visit within the cycle'
  },
  {
    key: 'visitId',
    label: 'Related Visit',
    type: 'reference',
    required: false,
    url: '/api/reference/visits',
    helpText: 'Link to the actual visit record (optional)'
  },
  {
    key: 'lookForImplemented',
    label: 'What Was Observed',
    type: 'textarea',
    required: true,
    placeholder: 'Describe what was actually observed or looked for...',
    helpText: 'What was actually observed or looked for during this visit'
  },
  {
    key: 'teacherReflection',
    label: 'Teacher Reflection',
    type: 'textarea',
    required: false,
    placeholder: 'Teacher\'s reflection on the session...',
    helpText: 'Teacher\'s reflection on the coaching session'
  },
  {
    key: 'coachNotes',
    label: 'Coach Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional coach observations and notes...',
    helpText: 'Additional coach observations and notes'
  }
];

/**
 * Field Configuration for Stage 4: End of Cycle Analysis
 * Maps directly to EndOfCycleAnalysis schema properties
 */
export const EndOfCycleAnalysisFieldConfig: Field[] = [
  {
    key: 'goalMet',
    label: 'Was the Primary Goal Achieved?',
    type: 'checkbox',
    required: true,
    helpText: 'Overall assessment of whether the primary goal was achieved'
  },
  {
    key: 'impactOnLearning',
    label: 'Impact on Student Learning',
    type: 'textarea',
    required: true,
    placeholder: 'Analyze the impact on student learning and how to build on this...',
    helpText: 'Analysis of impact on student learning and how to build on this'
  },
  {
    key: 'lessonsLearned',
    label: 'Key Lessons Learned',
    type: 'textarea',
    required: false,
    placeholder: 'What were the key lessons learned from this coaching cycle?',
    helpText: 'Key lessons learned from this coaching cycle'
  },
  {
    key: 'recommendationsForNext',
    label: 'Recommendations for Next Cycle',
    type: 'textarea',
    required: false,
    placeholder: 'What recommendations do you have for the next coaching cycle?',
    helpText: 'Recommendations for the next coaching cycle'
  }
];

/**
 * Helper function to get human-readable labels for IPG Core Actions
 */
export function getIPGCoreActionLabel(value: string): string {
  switch (value) {
    case 'CA1':
      return 'CA1: Ensure the work reflects Focus, Coherence, and Rigor';
    case 'CA2':
      return 'CA2: Employ instructional practices for all students';
    case 'CA3':
      return 'CA3: Provide opportunities for mathematical practices';
    default:
      return value;
  }
}

/**
 * Helper function to get human-readable labels for metric collection methods
 */
export function getMetricCollectionMethodLabel(value: string): string {
  switch (value) {
    case 'observation':
      return 'Classroom Observation';
    case 'student_work_analysis':
      return 'Student Work Analysis';
    case 'assessment_data':
      return 'Assessment Data';
    case 'interview':
      return 'Interview';
    case 'survey':
      return 'Survey';
    case 'documentation_review':
      return 'Documentation Review';
    case 'self_reflection':
      return 'Self Reflection';
    case 'other':
      return 'Other';
    default:
      return value;
  }
}

/**
 * Helper function to get IPG sub-category options based on core action
 */
export function getIPGSubCategoryOptions(coreAction: string) {
  const subCategories = {
    CA1: ['CA1A', 'CA1B', 'CA1C'],
    CA2: ['CA2A', 'CA2B'],
    CA3: ['CA3A', 'CA3B', 'CA3C', 'CA3D', 'CA3E']
  };

  return (subCategories[coreAction as keyof typeof subCategories] || []).map(value => ({
    value,
    label: getIPGSubCategoryLabel(value),
    description: getIPGSubCategoryDescription(value)
  }));
}

/**
 * Helper function to get human-readable labels for IPG sub-categories
 */
function getIPGSubCategoryLabel(value: string): string {
  switch (value) {
    case 'CA1A':
      return 'CA1A: Grade-level cluster focus';
    case 'CA1B':
      return 'CA1B: Relates new content to prior math';
    case 'CA1C':
      return 'CA1C: Targets appropriate rigor aspects';
    case 'CA2A':
      return 'CA2A: Makes mathematics explicit';
    case 'CA2B':
      return 'CA2B: Strategically shares student representations';
    case 'CA3A':
      return 'CA3A: Grade-level problems and exercises';
    case 'CA3B':
      return 'CA3B: Cultivates reasoning and problem solving';
    case 'CA3C':
      return 'CA3C: Prompts students to explain thinking';
    case 'CA3D':
      return 'CA3D: Creates conditions for student conversations';
    case 'CA3E':
      return 'CA3E: Connects informal to precise mathematical language';
    default:
      return value;
  }
}

/**
 * Helper function to get descriptions for IPG sub-categories
 */
function getIPGSubCategoryDescription(value: string): string {
  switch (value) {
    case 'CA1A':
      return 'Tasks focus students on the major work of the grade level';
    case 'CA1B':
      return 'Content connects to previous learning and future work';
    case 'CA1C':
      return 'Tasks demand appropriate levels of rigor for grade level';
    case 'CA2A':
      return 'Mathematical reasoning and procedures are made visible';
    case 'CA2B':
      return 'Student thinking is leveraged for learning';
    case 'CA3A':
      return 'Tasks provide appropriate level of cognitive demand';
    case 'CA3B':
      return 'Students engage in problem solving and reasoning';
    case 'CA3C':
      return 'Students articulate mathematical thinking clearly';
    case 'CA3D':
      return 'Mathematical discussions enhance understanding';
    case 'CA3E':
      return 'Informal language develops into mathematical language';
    default:
      return 'IPG sub-category description';
  }
}

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