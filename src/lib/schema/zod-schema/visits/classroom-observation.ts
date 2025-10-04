import { z } from "zod";
import { useMemo } from 'react';
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { getTodayString } from '@data-processing/transformers/utils/date-utils';

// ===== CORE OBSERVATION SCHEMA (MAIN RECORD) =====
export const ClassroomObservationFieldsSchema = z.object({
  // Core identification
  cycle: z.string().default(''),
  session: z.string().default(''),
  date: z.string().default(() => getTodayString()).describe("ISO date string for user input"),
  teacherId: z.string().default(''),
  coachId: z.string().default(''),
  schoolId: z.string().default(''),
  // Basic lesson info (flat)
  lessonTitle: z.string().default(''),
  lessonCourse: z.string().default(''),
  lessonUnit: z.string().default(''),
  lessonNumber: z.string().default(''),
  lessonCurriculum: z.string().default(''),
  // Simple context
  otherContext: z.string().default(''),
  coolDown: z.string().default(''),
  // Lesson flow structure for form compatibility
  lessonFlow: z.object({
    warmUp: z.object({
      launch: z.string().default(''),
      workTime: z.string().default(''),
      synthesis: z.string().default(''),
    }),
    activity1: z.object({
      launch: z.string().default(''),
      workTime: z.string().default(''),
      synthesis: z.string().default(''),
    }),
    activity2: z.object({
      launch: z.string().default(''),
      workTime: z.string().default(''),
      synthesis: z.string().default(''),
    }).optional(),
    lessonSynthesis: z.object({
      launch: z.string().default(''),
      workTime: z.string().default(''),
      synthesis: z.string().default(''),
    }),
  }).default({
    warmUp: { launch: '', workTime: '', synthesis: '' },
    activity1: { launch: '', workTime: '', synthesis: '' },
    activity2: { launch: '', workTime: '', synthesis: '' },
    lessonSynthesis: { launch: '', workTime: '', synthesis: '' }
  }),
  // Feedback structure for form compatibility
  feedback: z.object({
    glow: z.array(z.string()).default([]),
    wonder: z.array(z.string()).default([]),
    grow: z.array(z.string()).default([]),
    nextSteps: z.array(z.string()).default([]),
  }).default({ glow: [], wonder: [], grow: [], nextSteps: [] }),
  // Learning targets array
  learningTargets: z.array(z.string()).default([]),
  // Time tracking structure
  timeTracking: z.object({
    stopwatchTime: z.string().default(''),
    startedWhenMinutes: z.string().default(''),
    classStartTime: z.string().default(''),
    classEndTime: z.string().default(''),
  }).default({
    stopwatchTime: '',
    startedWhenMinutes: '',
    classStartTime: '',
    classEndTime: ''
  }),
  // Transcripts structure
  transcripts: z.object({
    warmUpLaunch: z.string().default(''),
    activity1Launch: z.string().default(''),
    activity2Launch: z.string().default(''),
    synthesisLaunch: z.string().default(''),
  }).default({
    warmUpLaunch: '',
    activity1Launch: '',
    activity2Launch: '',
    synthesisLaunch: ''
  }),
  // Progress monitoring
  progressMonitoring: z.object({
    observedCriteria: z.array(z.any()).default([]),
  }).default({ observedCriteria: [] }),
  // Status and metadata
  status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']).default('draft'),
  isSharedWithTeacher: z.boolean().default(false),
  // References
  visitId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
});

export const ClassroomObservationZodSchema = BaseDocumentSchema.extend(ClassroomObservationFieldsSchema.shape);
export const ClassroomObservationInputZodSchema = toInputSchema(ClassroomObservationZodSchema);

export type ClassroomObservation = z.infer<typeof ClassroomObservationZodSchema>;
export type ClassroomObservationInput = z.infer<typeof ClassroomObservationInputZodSchema>;

// ===== OBSERVATION CRITERIA (PROGRESS MONITORING) =====
export const ObservationCriterionFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  criterion: z.string(),
  observed: z.boolean().default(false),
  notes: z.string().optional(),
  category: z.string().optional().describe("engagement, questioning, facilitation"),
  sortOrder: z.number().default(0).describe("For maintaining order"),
});

export const ObservationCriterionZodSchema = BaseDocumentSchema.merge(ObservationCriterionFieldsSchema);
export const ObservationCriterionInputZodSchema = toInputSchema(ObservationCriterionZodSchema);

export type ObservationCriterion = z.infer<typeof ObservationCriterionZodSchema>;
export type ObservationCriterionInput = z.infer<typeof ObservationCriterionInputZodSchema>;

// ===== FEEDBACK ITEMS =====
export const FeedbackItemFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  type: z.enum(['glow', 'wonder', 'grow', 'nextSteps']),
  content: z.string(),
  sortOrder: z.number().default(0),
});

export const FeedbackItemZodSchema = BaseDocumentSchema.merge(FeedbackItemFieldsSchema);
export const FeedbackItemInputZodSchema = toInputSchema(FeedbackItemZodSchema);

export type FeedbackItem = z.infer<typeof FeedbackItemZodSchema>;
export type FeedbackItemInput = z.infer<typeof FeedbackItemInputZodSchema>;

// ===== LESSON FLOW STEPS =====
export const LessonFlowStepFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  activity: z.enum(['warmUp', 'activity1', 'activity2', 'lessonSynthesis']),
  stepType: z.enum(['launch', 'workTime', 'synthesis']),
  content: z.string().default(''),
  sortOrder: z.number().default(0),
});

export const LessonFlowStepZodSchema = BaseDocumentSchema.merge(LessonFlowStepFieldsSchema);
export const LessonFlowStepInputZodSchema = toInputSchema(LessonFlowStepZodSchema);

export type LessonFlowStep = z.infer<typeof LessonFlowStepZodSchema>;
export type LessonFlowStepInput = z.infer<typeof LessonFlowStepInputZodSchema>;

// ===== LESSON FLOW NOTES =====
export const LessonFlowNoteFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  activity: z.enum(['warmUp', 'activity1', 'activity2', 'lessonSynthesis']),
  note: z.string(),
  sortOrder: z.number().default(0),
});

export const LessonFlowNoteZodSchema = BaseDocumentSchema.merge(LessonFlowNoteFieldsSchema);
export const LessonFlowNoteInputZodSchema = toInputSchema(LessonFlowNoteZodSchema);

export type LessonFlowNote = z.infer<typeof LessonFlowNoteZodSchema>;
export type LessonFlowNoteInput = z.infer<typeof LessonFlowNoteInputZodSchema>;

// ===== LEARNING TARGETS =====
export const LearningTargetFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  target: z.string(),
  sortOrder: z.number().default(0),
});

export const LearningTargetZodSchema = BaseDocumentSchema.merge(LearningTargetFieldsSchema);
export const LearningTargetInputZodSchema = toInputSchema(LearningTargetZodSchema);

export type LearningTarget = z.infer<typeof LearningTargetZodSchema>;
export type LearningTargetInput = z.infer<typeof LearningTargetInputZodSchema>;

// ===== TIME TRACKING =====
export const ObservationTimeTrackingFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation (should be 1:1)"),
  classStartTime: z.string().default(''),
  classEndTime: z.string().default(''),
  observationStartTime: z.string().optional().describe("ISO string for precise timing"),
  observationEndTime: z.string().optional().describe("ISO string for precise timing"),
  stopwatchTime: z.string().default('00:00:00'),
  startedWhenMinutes: z.number().optional(),
});

export const ObservationTimeTrackingZodSchema = BaseDocumentSchema.merge(ObservationTimeTrackingFieldsSchema);
export const ObservationTimeTrackingInputZodSchema = toInputSchema(ObservationTimeTrackingZodSchema);

export type ObservationTimeTracking = z.infer<typeof ObservationTimeTrackingZodSchema>;
export type ObservationTimeTrackingInput = z.infer<typeof ObservationTimeTrackingInputZodSchema>;

// ===== TRANSCRIPTS =====
export const TranscriptSectionFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  section: z.enum(['warmUpLaunch', 'activity1Launch', 'activity2Launch', 'synthesisLaunch']),
  content: z.string().default(''),
});

export const TranscriptSectionZodSchema = BaseDocumentSchema.merge(TranscriptSectionFieldsSchema);
export const TranscriptSectionInputZodSchema = toInputSchema(TranscriptSectionZodSchema);

// Custom sections stored separately
export const CustomTranscriptSectionFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  sectionName: z.string(),
  content: z.string().default(''),
});

export const CustomTranscriptSectionZodSchema = BaseDocumentSchema.merge(CustomTranscriptSectionFieldsSchema);
export const CustomTranscriptSectionInputZodSchema = toInputSchema(CustomTranscriptSectionZodSchema);

export type TranscriptSection = z.infer<typeof TranscriptSectionZodSchema>;
export type TranscriptSectionInput = z.infer<typeof TranscriptSectionInputZodSchema>;
export type CustomTranscriptSection = z.infer<typeof CustomTranscriptSectionZodSchema>;
export type CustomTranscriptSectionInput = z.infer<typeof CustomTranscriptSectionInputZodSchema>;

// ===== CONTEXTUAL NOTES =====
export const ContextualNoteFieldsSchema = z.object({
  observationId: z.string().optional().describe("Reference to main observation"),
  content: z.string(),
  noteType: z.enum(['observation', 'debrief', 'reflection', 'action_item', 'quote', 'question', 'insight', 'concern', 'celebration']),
  isPrivate: z.boolean().default(false),
  followUpRequired: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  visitId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
  sortOrder: z.number().default(0),
});

export const ContextualNoteZodSchema = BaseDocumentSchema.merge(ContextualNoteFieldsSchema);
export const ContextualNoteInputZodSchema = toInputSchema(ContextualNoteZodSchema);

export type ContextualNote = z.infer<typeof ContextualNoteZodSchema>;
export type ContextualNoteInput = z.infer<typeof ContextualNoteInputZodSchema>;

// ===== OBSERVATION TAGS =====
export const ObservationTagFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation"),
  type: z.enum(['cycle', 'visit', 'period', 'activity', 'person', 'subject', 'location', 'topic', 'goal', 'priority', 'custom']),
  value: z.string(),
  confidence: z.enum(['auto', 'manual']).default('manual'),
  isEditable: z.boolean().default(true),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const ObservationTagZodSchema = BaseDocumentSchema.merge(ObservationTagFieldsSchema);
export const ObservationTagInputZodSchema = toInputSchema(ObservationTagZodSchema);

export type ObservationTag = z.infer<typeof ObservationTagZodSchema>;
export type ObservationTagInput = z.infer<typeof ObservationTagInputZodSchema>;

// ===== OBSERVATION METADATA =====
export const ObservationMetadataFieldsSchema = z.object({
  observationId: z.string().describe("Reference to main observation (should be 1:1)"),
  scheduledActivity: z.string().optional(),
  actualActivity: z.string().optional(),
  location: z.string().optional(),
  participants: z.array(z.string()).default([]),
  sourceType: z.enum(['manual', 'scheduled', 'detected', 'imported']).default('manual'),
  confidence: z.number().min(0).max(1).default(1.0),
  autoTaggingEnabled: z.boolean().default(true),
  searchableText: z.string().default(''),
  tagSummary: z.string().default(''),
  lastTagUpdate: z.string().optional().describe("ISO string for system timestamp"),
});

export const ObservationMetadataZodSchema = BaseDocumentSchema.merge(ObservationMetadataFieldsSchema);
export const ObservationMetadataInputZodSchema = toInputSchema(ObservationMetadataZodSchema);

export type ObservationMetadata = z.infer<typeof ObservationMetadataZodSchema>;
export type ObservationMetadataInput = z.infer<typeof ObservationMetadataInputZodSchema>;

// ===== CONTEXT INTERFACES AND UTILITIES =====
export interface ClassroomObservationContext {
  userId?: string;
  schoolId?: string;
  visitId?: string;
  teacherId?: string;
  coachId?: string;
  cycle?: string;
  session?: string;
  coachingActionPlanId?: string;
}

/**
 * Factory function for creating classroom observation  defaults with context
 * Uses schema defaults and applies contextual overrides
 */
export function createClassroomObservationDefaults(
  context: ClassroomObservationContext = {}
): ClassroomObservationInput {
  return ClassroomObservationInputZodSchema.parse({
    ...context,
    ownerIds: context.userId ? [context.userId] : undefined,
  });
}

/**
 * Hook for form defaults with authentication context
 * Automatically incorporates user data from auth context
 */
export function useClassroomObservationDefaults(
  overrides: Partial<ClassroomObservationContext> = {}
): ClassroomObservationInput {
  // Note: This would typically use your auth hook
  // const { user } = useAuthenticatedUser();
  return useMemo(() => 
    createClassroomObservationDefaults({
      // userId: user?.staffId,
      // schoolId: user?.schoolId,
      // coachId: user?.staffId,
      ...overrides
    }), 
    [overrides]
  );
}

/**
 * Simplified hook for testing purposes
 * Creates defaults without auth dependency
 */
export function useClassroomObservationDefaultsSimple(
  overrides: Partial<ClassroomObservationContext> = {}
): ClassroomObservationInput {
  return useMemo(() => 
    createClassroomObservationDefaults({
      userId: 'test-user-123',
      schoolId: 'test-school-456',
      coachId: 'test-coach-789',
      ...overrides
    }), 
    [overrides]
  );
} 


