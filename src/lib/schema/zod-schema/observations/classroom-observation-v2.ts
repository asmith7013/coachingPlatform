import { z } from "zod";
import { useMemo } from 'react';
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { getTodayString } from '@data-processing/transformers/utils/date-utils';

// ===== CORE OBSERVATION SCHEMA (MAIN RECORD) =====
export const ClassroomObservationV2FieldsSchema = z.object({
  // Core identification
  cycle: z.string().default(''),
  session: z.string().default(''),
  date: z.string().describe("ISO date string for user input"), // Consistent string dates
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
  // Status and metadata
  status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']).default('draft'),
  isSharedWithTeacher: z.boolean().default(false),
  // References
  visitId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
});

export const ClassroomObservationV2ZodSchema = BaseDocumentSchema.merge(ClassroomObservationV2FieldsSchema);
export const ClassroomObservationV2InputZodSchema = toInputSchema(ClassroomObservationV2ZodSchema);

export type ClassroomObservationV2 = z.infer<typeof ClassroomObservationV2ZodSchema>;
export type ClassroomObservationV2Input = z.infer<typeof ClassroomObservationV2InputZodSchema>;

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
export interface ClassroomObservationV2Context {
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
 * Factory function for creating classroom observation V2 defaults with context
 * Uses schema defaults and applies contextual overrides
 */
export function createClassroomObservationV2Defaults(
  context: ClassroomObservationV2Context = {}
): ClassroomObservationV2Input {
  // Create base defaults by parsing an empty object (schema defaults will apply)
  const baseDefaults = ClassroomObservationV2InputZodSchema.parse({
    date: getTodayString(), // ISO date string for today
    ownerIds: context.userId ? [context.userId] : [], // ✅ Fixed: Use ownerIds instead of owners
  });
  
  // Apply context overrides
  return {
    ...baseDefaults,
    schoolId: context.schoolId || baseDefaults.schoolId,
    teacherId: context.teacherId || baseDefaults.teacherId,
    coachId: context.coachId || context.userId || baseDefaults.coachId,
    cycle: context.cycle || baseDefaults.cycle,
    session: context.session || baseDefaults.session,
    visitId: context.visitId || baseDefaults.visitId,
    coachingActionPlanId: context.coachingActionPlanId || baseDefaults.coachingActionPlanId,
    ownerIds: context.userId ? [context.userId] : baseDefaults.ownerIds, // ✅ Fixed: Use ownerIds
  };
}

/**
 * Hook for form defaults with authentication context
 * Automatically incorporates user data from auth context
 */
export function useClassroomObservationV2Defaults(
  overrides: Partial<ClassroomObservationV2Context> = {}
): ClassroomObservationV2Input {
  // Note: This would typically use your auth hook
  // const { user } = useAuthenticatedUser();
  return useMemo(() => 
    createClassroomObservationV2Defaults({
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
export function useClassroomObservationV2DefaultsSimple(
  overrides: Partial<ClassroomObservationV2Context> = {}
): ClassroomObservationV2Input {
  return useMemo(() => 
    createClassroomObservationV2Defaults({
      userId: 'test-user-123',
      schoolId: 'test-school-456',
      coachId: 'test-coach-789',
      ...overrides
    }), 
    [overrides]
  );
} 