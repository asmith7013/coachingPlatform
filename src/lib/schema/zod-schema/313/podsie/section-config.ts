import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { AllSectionsZod, SchoolsZod, Teachers313Zod, ScopeSequenceTagZod } from "@schema/enum/313";

// =====================================
// SECTION CONFIG SCHEMA
// =====================================

/**
 * Podsie question mapping - maps question numbers to Podsie question IDs
 * Now includes explicit root/variant distinction for proper question mapping
 */
export const PodsieQuestionMapSchema = z.object({
  questionNumber: z.number().int().positive().describe("Question number (1-based index)"),
  questionId: z.string().describe("Podsie question ID"),
  isRoot: z.boolean().default(true).describe("Whether this is a root question (true) or a variant (false)"),
  rootQuestionId: z.string().optional().describe("For variants: the Podsie question ID of the root question this variant belongs to"),
  variantNumber: z.number().int().positive().optional().describe("For variants: which variation this is (1, 2, 3, etc.)"),
});

export type PodsieQuestionMap = z.infer<typeof PodsieQuestionMapSchema>;

/**
 * Activity type enum - differentiates between sidekick activities, mastery checks, and unit assessments
 */
export const ActivityTypeSchema = z.enum([
  'sidekick',      // Podsie Sidekick lesson activities (warm-up, activities, cool-down)
  'mastery-check', // Mastery check assessment
  'assessment',    // Unit assessment (end of unit summative assessment)
]).describe("Type of activity");

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

/**
 * Podsie activity configuration
 */
export const PodsieActivitySchema = z.object({
  activityType: ActivityTypeSchema,
  podsieAssignmentId: z.string().describe("Podsie assignment ID"),
  podsieQuestionMap: z.array(PodsieQuestionMapSchema).default([]).describe("Map of question numbers to Podsie question IDs"),
  totalQuestions: z.number().int().positive().optional().describe("Total questions in the assignment"),
  variations: z.number().int().min(0).max(10).default(3).describe("Number of variations per question (0 means root only, 3 means root + 3 variants). Default is 3."),
  q1HasVariations: z.boolean().default(false).describe("Whether Question 1 has variations (default: false, Q1 typically has no variations)"),
  active: z.boolean().default(true).describe("Whether this activity is active"),
});

export type PodsieActivity = z.infer<typeof PodsieActivitySchema>;

/**
 * Zearn activity configuration
 */
export const ZearnActivitySchema = z.object({
  zearnLessonId: z.string().optional().describe("Zearn lesson ID"),
  zearnUrl: z.string().optional().describe("Direct URL to Zearn lesson"),
  active: z.boolean().default(true).describe("Whether this Zearn lesson is active"),
});

export type ZearnActivity = z.infer<typeof ZearnActivitySchema>;

/**
 * Assignment content configuration for a single lesson in this section
 *
 * Links to a specific scope-and-sequence lesson and defines how students engage with it
 * through various activity types (Podsie Sidekick, Mastery Checks, Zearn, etc.)
 */
export const AssignmentContentSchema = z.object({
  // =====================================
  // LINK TO SCOPE AND SEQUENCE
  // =====================================

  scopeAndSequenceId: z.string().describe("MongoDB ObjectId reference to the scope-and-sequence document - provides unambiguous link to exact lesson"),

  // Denormalized fields for display/sorting (kept in sync with scope-and-sequence)
  unitLessonId: z.string().describe("Denormalized: Unit.Lesson ID (e.g., '3.15', '4.RU1')"),
  lessonName: z.string().describe("Denormalized: Lesson name for display"),
  section: z.string().optional().describe("Denormalized: Section (A, B, C, D, E, F, Ramp Ups, Unit Assessment)"),
  grade: z.string().optional().describe("Denormalized: Grade level"),

  // =====================================
  // ACTIVITY CONFIGURATIONS
  // =====================================

  podsieActivities: z.array(PodsieActivitySchema).default([]).describe("Array of Podsie activity configurations (sidekick lessons and/or mastery checks)"),
  zearnActivity: ZearnActivitySchema.optional().describe("Optional Zearn lesson configuration"),

  // =====================================
  // METADATA
  // =====================================

  active: z.boolean().default(true).describe("Whether this assignment content is active"),
  notes: z.string().optional().describe("Optional notes about this assignment content"),
});

export type AssignmentContent = z.infer<typeof AssignmentContentSchema>;

// =====================================
// BELL SCHEDULE SCHEMA
// =====================================

/**
 * Meeting schedule for a specific day of the week
 */
export const DayScheduleSchema = z.object({
  meetingCount: z.number().int().min(0).max(10).describe("Number of times the class meets on this day"),
  minutesPerMeeting: z.number().int().positive().describe("Duration in minutes for each class meeting on this day"),
});

export type DaySchedule = z.infer<typeof DayScheduleSchema>;

/**
 * Weekly bell schedule configuration
 * Defines how many times a class meets each day and for how long
 */
export const BellScheduleSchema = z.object({
  monday: DayScheduleSchema.optional(),
  tuesday: DayScheduleSchema.optional(),
  wednesday: DayScheduleSchema.optional(),
  thursday: DayScheduleSchema.optional(),
  friday: DayScheduleSchema.optional(),
}).describe("Weekly bell schedule - how many times and for how long the class meets each day");

export type BellSchedule = z.infer<typeof BellScheduleSchema>;

/**
 * Helper functions for bell schedule calculations
 */
export const BellScheduleHelpers = {
  /**
   * Calculate total number of class meetings in a week
   */
  getTotalWeeklyMeetings(schedule: BellSchedule | undefined): number {
    if (!schedule) return 0;

    return (
      (schedule.monday?.meetingCount ?? 0) +
      (schedule.tuesday?.meetingCount ?? 0) +
      (schedule.wednesday?.meetingCount ?? 0) +
      (schedule.thursday?.meetingCount ?? 0) +
      (schedule.friday?.meetingCount ?? 0)
    );
  },

  /**
   * Calculate total instructional minutes in a week
   */
  getTotalWeeklyMinutes(schedule: BellSchedule | undefined): number {
    if (!schedule) return 0;

    return (
      ((schedule.monday?.meetingCount ?? 0) * (schedule.monday?.minutesPerMeeting ?? 0)) +
      ((schedule.tuesday?.meetingCount ?? 0) * (schedule.tuesday?.minutesPerMeeting ?? 0)) +
      ((schedule.wednesday?.meetingCount ?? 0) * (schedule.wednesday?.minutesPerMeeting ?? 0)) +
      ((schedule.thursday?.meetingCount ?? 0) * (schedule.thursday?.minutesPerMeeting ?? 0)) +
      ((schedule.friday?.meetingCount ?? 0) * (schedule.friday?.minutesPerMeeting ?? 0))
    );
  },

  /**
   * Calculate average meeting length in minutes
   */
  getAverageMeetingLength(schedule: BellSchedule | undefined): number {
    if (!schedule) return 0;

    const totalMeetings = this.getTotalWeeklyMeetings(schedule);
    if (totalMeetings === 0) return 0;

    const totalMinutes = this.getTotalWeeklyMinutes(schedule);
    return Math.round(totalMinutes / totalMeetings);
  },

  /**
   * Get days of the week when class meets
   */
  getMeetingDays(schedule: BellSchedule | undefined): string[] {
    if (!schedule) return [];

    const days: string[] = [];
    if (schedule.monday && schedule.monday.meetingCount > 0) days.push('Monday');
    if (schedule.tuesday && schedule.tuesday.meetingCount > 0) days.push('Tuesday');
    if (schedule.wednesday && schedule.wednesday.meetingCount > 0) days.push('Wednesday');
    if (schedule.thursday && schedule.thursday.meetingCount > 0) days.push('Thursday');
    if (schedule.friday && schedule.friday.meetingCount > 0) days.push('Friday');

    return days;
  },
};

/**
 * Section Configuration - Complete configuration for a class section
 *
 * This collection stores all configuration for a single class section including:
 * - Section metadata (school, teacher, grade)
 * - Assignment content configurations defining how students engage with each lesson
 *
 * Why section-centric?
 * - Natural mental model: "What's configured for my 802 class?"
 * - Single source of truth per section
 * - Efficient queries: One find gets all section info + all assignments
 * - Easy admin: Manage all configs for a section in one place
 * - Enables bulk operations: Import/export configs per section
 */
export const SectionConfigFieldsSchema = z.object({
  // =====================================
  // SECTION METADATA
  // =====================================

  school: SchoolsZod.describe("School identifier (IS313, PS19, or X644)"),
  classSection: AllSectionsZod.describe("Class section (e.g., '802', '803', '601')"),
  teacher: Teachers313Zod.optional().describe("Current teacher for this section"),
  gradeLevel: z.string().describe("Grade level (e.g., '6', '7', '8')"),
  scopeSequenceTag: ScopeSequenceTagZod.optional().describe("Scope and sequence tag (e.g., 'Grade 8', 'Algebra 1')"),

  groupId: z.string().optional().describe("Podsie group ID for this section (used in Podsie URLs)"),

  active: z.boolean().default(true).describe("Whether this section is currently active"),

  // =====================================
  // BELL SCHEDULE
  // =====================================

  bellSchedule: BellScheduleSchema.optional().describe("Weekly bell schedule - defines how many times and for how long the class meets each day"),

  // =====================================
  // ASSIGNMENT CONTENT CONFIGURATIONS
  // =====================================

  assignmentContent: z.array(AssignmentContentSchema).default([]).describe("All assignment content configurations for this section (links to scope-and-sequence lessons with activity configs)"),

  // =====================================
  // METADATA
  // =====================================

  notes: z.string().optional().describe("Optional notes about this section"),
});

// Full schema with base document fields
export const SectionConfigZodSchema = BaseDocumentSchema.merge(SectionConfigFieldsSchema);

// Input schema for creation
export const SectionConfigInputZodSchema = toInputSchema(SectionConfigZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type SectionConfig = z.infer<typeof SectionConfigZodSchema>;
export type SectionConfigInput = z.infer<typeof SectionConfigInputZodSchema>;

// =====================================
// HELPER TYPES
// =====================================

/**
 * Query params for finding section configs
 */
export const SectionConfigQuerySchema = z.object({
  school: SchoolsZod.optional(),
  classSection: AllSectionsZod.optional(),
  teacher: Teachers313Zod.optional(),
  gradeLevel: z.string().optional(),
  active: z.boolean().optional(),
});

export type SectionConfigQuery = z.infer<typeof SectionConfigQuerySchema>;

/**
 * Joined type: Scope and Sequence + Assignment Content from Section Config
 * Used when you need both curriculum data and section-specific activity configurations
 */
export type ScopeAndSequenceWithAssignmentContent = {
  // From scope-and-sequence
  id: string;
  unitLessonId: string;
  lessonName: string;
  grade: string;
  unit: string;
  section?: string;
  roadmapSkills: string[];
  targetSkills: string[];

  // From section-config assignmentContent array
  assignmentContent?: {
    scopeAndSequenceId: string;
    podsieActivities: PodsieActivity[];
    zearnActivity?: ZearnActivity;
    active: boolean;
    notes?: string;
  };
};

// Legacy type alias for backwards compatibility during migration
/** @deprecated Use ScopeAndSequenceWithAssignmentContent instead */
export type ScopeAndSequenceWithPodsie = ScopeAndSequenceWithAssignmentContent;

/**
 * Section dropdown option with metadata
 */
export type SectionOption = {
  school: string;
  classSection: string;
  teacher?: string;
  gradeLevel: string;
  scopeSequenceTag?: string;
  assignmentCount: number;
};
