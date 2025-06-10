import { z } from "zod";
import { zDateField } from "../shared/dateHelpers";
import { BaseDocumentSchema, toInputSchema } from "../base-schemas";
import { TaggableContentZodSchema } from '../shared/tagging-system';
import { useMemo } from 'react';
import { getTodayString } from '@/lib/data-processing/transformers/utils/date-utils';

// ===== CONTEXTUAL NOTE SCHEMA =====
export const ContextualNoteZodSchema = BaseDocumentSchema.merge(z.object({
  content: z.string(),
  noteType: z.enum(['observation', 'debrief', 'reflection', 'action_item', 'quote', 'question', 'insight', 'concern', 'celebration']),
  tagging: TaggableContentZodSchema,
  visitId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
  classroomObservationId: z.string().optional(),
  isPrivate: z.boolean().default(false),
  followUpRequired: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
}));

// ===== LESSON FLOW STRUCTURES WITH DEFAULTS =====
export const ActivitySectionZodSchema = z.object({
  launch: z.string().default(''),
  workTime: z.string().default(''),
  synthesis: z.string().default(''),
  notes: z.array(z.string()).default([]),
});

// ===== SIMPLIFIED PROGRESS MONITORING WITH FLEXIBLE CRITERIA =====
export const CriterionObservationZodSchema = z.object({
  criterion: z.string(),
  observed: z.boolean().default(false),
  notes: z.string().optional(),
  category: z.string().optional(), // e.g., 'engagement', 'questioning', 'facilitation'
});

export const ProgressMonitoringZodSchema = z.object({
  observedCriteria: z.array(CriterionObservationZodSchema).default([]),
  overallNotes: z.string().default(''),
});

// Helper function for common criteria sets
export function createCommonCriteria(): z.infer<typeof CriterionObservationZodSchema>[] {
  return [
    { criterion: 'Teacher debriefs a portion of the activity to use for the synthesis', observed: false, category: 'facilitation' },
    { criterion: 'Synthesis begins with the teacher intentionally calling on specific students and displaying student work', observed: false, category: 'engagement' },
    { criterion: 'Students who are sharing explain their reasoning', observed: false, category: 'discourse' },
    { criterion: 'Students actively listen and engage with peers\' contributions', observed: false, category: 'discourse' },
    { criterion: 'The teacher uses a variety of engagement moves (turn and talk, cold call, etc.)', observed: false, category: 'engagement' },
    { criterion: 'The teacher makes student thinking visible', observed: false, category: 'facilitation' },
    { criterion: 'The teacher asks follow-up questions to clarify and deepen student thinking', observed: false, category: 'questioning' },
  ];
}

export const TranscriptSectionZodSchema = z.object({
  warmUpLaunch: z.string().default(''),
  activity1Launch: z.string().default(''),
  activity2Launch: z.string().default(''),
  synthesisLaunch: z.string().default(''),
  customSections: z.record(z.string(), z.string()).default({}),
});

// ===== CLASSROOM OBSERVATION SCHEMA WITH DEFAULTS =====
export const ClassroomObservationNoteZodSchema = BaseDocumentSchema.merge(z.object({
  cycle: z.string().default(''),
  session: z.string().default(''),
  date: zDateField,
  teacherId: z.string().default(''),
  coachId: z.string().default(''),
  schoolId: z.string().default(''),
  lesson: z.object({
    title: z.string().default(''),
    course: z.string().default(''),
    unit: z.string().default(''),
    lessonNumber: z.string().default(''),
    curriculum: z.string().default(''),
  }).default({}),
  otherContext: z.string().default(''),
  learningTargets: z.array(z.string()).default([]),
  coolDown: z.string().default(''),
  feedback: z.object({
    glow: z.array(z.string()).default([]),
    wonder: z.array(z.string()).default([]),
    grow: z.array(z.string()).default([]),
    nextSteps: z.array(z.string()).default([]),
  }).default({}),
  lessonFlow: z.object({
    warmUp: ActivitySectionZodSchema.default({}),
    activity1: ActivitySectionZodSchema.default({}),
    activity2: ActivitySectionZodSchema.default({}).optional(),
    lessonSynthesis: ActivitySectionZodSchema.default({}),
  }).default({}),
  progressMonitoring: ProgressMonitoringZodSchema.default({}),
  timeTracking: z.object({
    classStartTime: z.string().default(''),
    classEndTime: z.string().default(''),
    observationStartTime: zDateField.optional(),
    observationEndTime: zDateField.optional(),
    stopwatchTime: z.string().default('00:00:00'),
    startedWhenMinutes: z.number().optional(),
  }).default({}),
  transcripts: TranscriptSectionZodSchema.default({}),
  contextualNotes: z.array(z.string()).default([]),
  tagging: TaggableContentZodSchema,
  status: z.enum(['draft', 'in_progress', 'completed', 'reviewed']).default('draft'),
  isSharedWithTeacher: z.boolean().default(false),
  visitId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
}));

// ===== INPUT SCHEMAS =====
export const ContextualNoteInputZodSchema = toInputSchema(ContextualNoteZodSchema);
export const ClassroomObservationNoteInputZodSchema = toInputSchema(ClassroomObservationNoteZodSchema);

// ===== TYPE EXPORTS =====
export type ContextualNote = z.infer<typeof ContextualNoteZodSchema>;
export type ContextualNoteInput = z.infer<typeof ContextualNoteInputZodSchema>;
export type ClassroomObservationNote = z.infer<typeof ClassroomObservationNoteZodSchema>;
export type ClassroomObservationNoteInput = z.infer<typeof ClassroomObservationNoteInputZodSchema>;
export type ActivitySection = z.infer<typeof ActivitySectionZodSchema>;
export type CriterionObservation = z.infer<typeof CriterionObservationZodSchema>;
export type ProgressMonitoring = z.infer<typeof ProgressMonitoringZodSchema>;
export type TranscriptSection = z.infer<typeof TranscriptSectionZodSchema>;

// ===== FACTORY FUNCTIONS FOR CONTEXTUAL DEFAULTS =====
export interface ClassroomObservationContext {
  userId?: string;
  schoolId?: string;
  visitId?: string;
  teacherId?: string;
  cycle?: string;
  session?: string;
  coachId?: string;
}

/**
 * Factory function for creating classroom observation defaults with context
 * Uses schema defaults and applies contextual overrides
 */
export function createClassroomObservationDefaults(
  context: ClassroomObservationContext = {}
): ClassroomObservationNoteInput {
  // Create base defaults using schema parsing
  const baseDefaults = ClassroomObservationNoteInputZodSchema.parse({
    date: new Date(getTodayString()).toISOString(),
    progressMonitoring: {
      observedCriteria: createCommonCriteria(),
      overallNotes: '',
    },
    tagging: {
      tags: [],
      contextMetadata: {
        timestamp: new Date().toISOString(),
        scheduledActivity: '',
        actualActivity: '',
        location: '',
        participants: [],
        sourceType: 'manual' as const,
        confidence: 1.0,
      },
      lastTagUpdate: new Date().toISOString(),
      autoTaggingEnabled: true,
      searchableText: '',
      tagSummary: '',
    },
  });
  
  // Apply context overrides
  return {
    ...baseDefaults,
    schoolId: context.schoolId || baseDefaults.schoolId,
    ownerIds: context.userId ? [context.userId] : baseDefaults.ownerIds,
    visitId: context.visitId || baseDefaults.visitId,
    teacherId: context.teacherId || baseDefaults.teacherId,
    coachId: context.coachId || context.userId || baseDefaults.coachId,
    cycle: context.cycle || baseDefaults.cycle,
    session: context.session || baseDefaults.session,
  };
}

/**
 * Hook for form defaults with authentication context
 * Automatically incorporates user data from auth context
 */
export function useClassroomObservationDefaults(
  overrides: Partial<ClassroomObservationContext> = {}
): ClassroomObservationNoteInput {
  // Note: This would typically use your auth hook, but for now we'll create a placeholder
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
): ClassroomObservationNoteInput {
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