/**
 * @deprecated This entire file is deprecated and will be removed in v2.0
 * Use src/lib/zod-schema/schedules/schedule-documents.ts instead
 *
 * Migration path:
 * - BellSchedule → BellScheduleZodSchema from schedule-documents.ts
 * - TeacherSchedule → TeacherScheduleZodSchema from schedule-documents.ts
 * - VisitSchedule → VisitScheduleZodSchema from schedule-documents.ts
 * - Reference types → Use new reference schemas from schedule-documents.ts
 */

import { z } from "zod";
import {
  BellScheduleTypeZod,
  SessionPurposeZod,
  ScheduleAssignmentTypeZod,
  PeriodTypeZod,
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { BaseReferenceZodSchema } from "@zod-schema/core-types/reference";
import {
  createReferenceTransformer,
  createArrayTransformer,
} from "@data-processing/transformers/factories/reference-factory";
// import { EventItem } from "@/lib/types/domain/visit";

// =====================================
// 1. SCHOOL BELL SCHEDULE (Simplified)
// =====================================

/** @deprecated Use BellScheduleZodSchema from schedule-documents.ts instead */
export const TimeBlockFieldsSchema = z.object({
  periodNumber: z.number().describe("Sequential period number: 1, 2, 3, etc."),
  startTime: z.string().describe("24-hour format: 'HH:MM' (e.g., '08:30')"),
  endTime: z.string().describe("24-hour format: 'HH:MM' (e.g., '09:15')"),
  periodName: z
    .string()
    .optional()
    .describe(
      "Optional custom name: 'Morning Block', 'Advisory', 'Homeroom', etc.",
    ),
});

/** @deprecated Use DayIndexZod from schedule-documents.ts instead */
export const DayIndexZod = z.number().min(0).max(4);
/** @deprecated Use DayIndex from schedule-documents.ts instead */
export type DayIndex = z.infer<typeof DayIndexZod>;

/** @deprecated Use BellScheduleZodSchema from schedule-documents.ts instead */
export const BellScheduleFieldsSchema = z.object({
  schoolId: z
    .string()
    .describe("Reference to School document _id this bell schedule belongs to"),
  name: z
    .string()
    .describe(
      "Schedule name: 'Regular Day', 'Early Release', 'Block Schedule', etc.",
    ),
  bellScheduleType: BellScheduleTypeZod.describe("Schedule pattern type"),

  // 🎯 NEW: Day indices at bell schedule level
  dayIndices: z
    .array(DayIndexZod)
    .describe(
      "Days when this bell schedule applies: [0,1,2,3,4] for M-F, [4] for Friday early release",
    ),

  timeBlocks: z
    .array(TimeBlockFieldsSchema)
    .describe("Array of time periods defining the daily schedule"),
});

/** @deprecated Use BellScheduleZodSchema from schedule-documents.ts instead */
export const BellScheduleZodSchema = BaseDocumentSchema.merge(
  BellScheduleFieldsSchema,
);

/** @deprecated Use BellScheduleInputZodSchema from schedule-documents.ts instead */
export const BellScheduleInputZodSchema = toInputSchema(BellScheduleZodSchema);

// =====================================
// 2. TEACHER SCHEDULE (Unchanged)
// =====================================

/** @deprecated Use TeacherScheduleZodSchema from schedule-documents.ts instead */
export const PeriodFieldsSchema = z.object({
  periodNumber: z.number().describe("Maps to bell schedule period"),
  className: z
    .string()
    .describe("'5th Grade Math', 'Planning Time', 'Lunch Break', etc."),
  room: z
    .string()
    .describe("'Room 205', 'Teachers Lounge', 'Main Playground', etc."),
  activityType: PeriodTypeZod.describe(
    "Type of activity: 'teaching', 'prep', 'duty', 'lunch', 'meeting'",
  ),
  subject: z.string().optional().describe("'Math', 'Science', 'Reading', etc."),
  gradeLevel: z.string().optional().describe("'Grade 5', 'Kindergarten', etc."),
});

/** @deprecated Use TeacherScheduleZodSchema from schedule-documents.ts instead */
export const TeacherScheduleFieldsSchema = z.object({
  teacherId: z.string().describe("Reference to Staff document _id"),
  schoolId: z.string().describe("Reference to School document _id"),
  bellScheduleId: z
    .string()
    .describe("References which bell schedule this follows"),

  // 🎯 NEW: Day indices at schedule level
  dayIndices: z
    .array(DayIndexZod)
    .describe(
      "Days when this entire schedule applies: [0,1,2,3,4] for M-F, [0,2,4] for M/W/F",
    ),

  // Clean assignments array (applies to all days in dayIndices)
  assignments: z
    .array(PeriodFieldsSchema)
    .describe("Period assignments for the specified days"),
});

/** @deprecated Use TeacherScheduleZodSchema from schedule-documents.ts instead */
export const TeacherScheduleZodSchema = BaseDocumentSchema.merge(
  TeacherScheduleFieldsSchema,
);

/** @deprecated Use TeacherScheduleInputZodSchema from schedule-documents.ts instead */
export const TeacherScheduleInputZodSchema = toInputSchema(
  TeacherScheduleZodSchema,
);

// =====================================
// 3. VISIT SCHEDULE (Updated)
// =====================================

/** @deprecated Use VisitScheduleZodSchema from schedule-documents.ts instead */
export const EventFieldsSchema = z.object({
  // Unique identifier for context tracking
  eventId: z
    .string()
    .describe(
      "Unique identifier for this event - used for linking notes/evidence",
    ),

  // Period and sequencing
  periodNumber: z.number().describe("Maps to bell schedule period (1-9, etc.)"),
  orderIndex: z
    .number()
    .describe("Sequence within period: 1, 2, 3... for multiple events"),

  // Event details
  eventType: SessionPurposeZod.describe("Type of coaching session"),
  staffIds: z
    .array(z.string())
    .describe("Array of staff IDs - supports multiple teachers per event"),
  portion: ScheduleAssignmentTypeZod.describe("Time portion of the period"),

  // Context and notes
  room: z
    .string()
    .optional()
    .describe("Override room if different from teacher's assigned room"),
  duration: z
    .number()
    .optional()
    .describe("Actual minutes if different from portion default"),
  notes: z.string().optional().describe("Event-specific notes and focus areas"),

  // Timing information
  timeSlot: TimeBlockFieldsSchema.optional().describe(
    "More specific time window from bell schedule",
  ),
  actualStartTime: z
    .string()
    .optional()
    .describe("Override start time: 'HH:MM'"),
  actualEndTime: z.string().optional().describe("Override end time: 'HH:MM'"),
});

/** @deprecated Use VisitScheduleZodSchema from schedule-documents.ts instead */
export const VisitScheduleFieldsSchema = z.object({
  coachingActionPlanId: z.string().describe("Reference to primary aggregate"),
  date: z.string().optional().describe("ISO string for system timestamp"),
  coachId: z.string().describe("Reference to coach Staff document _id"),
  schoolId: z.string().describe("Reference to School document _id"),
  bellScheduleId: z
    .string()
    .describe("References school's bell schedule for period timing"),
  events: z
    .array(EventFieldsSchema)
    .describe(
      "Flat array of all events - use periodNumber + orderIndex for sequencing",
    ),
});

/** @deprecated Use VisitScheduleZodSchema from schedule-documents.ts instead */
export const VisitScheduleZodSchema = BaseDocumentSchema.merge(
  VisitScheduleFieldsSchema,
);

/** @deprecated Use VisitScheduleInputZodSchema from schedule-documents.ts instead */
export const VisitScheduleInputZodSchema = toInputSchema(
  VisitScheduleZodSchema,
);

// =====================================
// REFERENCE SCHEMAS
// =====================================

/** @deprecated Use BellScheduleReferenceSchema from schedule-documents.ts instead */
export const BellScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  BellScheduleFieldsSchema.pick({
    schoolId: true,
    bellScheduleType: true,
  }).partial(),
).extend({
  schoolName: z.string().optional(),
  blocksCount: z.number().optional(),
});

/** @deprecated Use TeacherScheduleReferenceSchema from schedule-documents.ts instead */
export const TeacherScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  TeacherScheduleFieldsSchema.pick({
    teacherId: true,
    schoolId: true,
  }).partial(),
).extend({
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
  periodsCount: z.number().optional(),
});

/** @deprecated Use VisitScheduleReferenceSchema from schedule-documents.ts instead */
export const VisitScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  VisitScheduleFieldsSchema.pick({
    coachId: true,
    schoolId: true,
    date: true,
  }).partial(),
).extend({
  coachName: z.string().optional(),
  schoolName: z.string().optional(),
  eventsCount: z.number().optional(),
  dateFormatted: z.string().optional(),
});

// =====================================
// REFERENCE TRANSFORMERS
// =====================================

/** @deprecated Use bellScheduleToReference from schedule-documents.ts instead */
export const bellScheduleToReference = createReferenceTransformer<
  BellSchedule,
  BellScheduleReference
>(
  (schedule) => `${schedule.name} (${schedule.bellScheduleType})`,
  (schedule) => ({
    schoolId: schedule.schoolId,
    bellScheduleType: schedule.bellScheduleType,
    blocksCount: schedule.timeBlocks?.length || 0,
  }),
  BellScheduleReferenceZodSchema,
);

/** @deprecated Use teacherScheduleToReference from schedule-documents.ts instead */
export const teacherScheduleToReference = createReferenceTransformer<
  TeacherSchedule,
  TeacherScheduleReference
>(
  (_schedule) => `Teacher Schedule`,
  (schedule) => ({
    teacherId: schedule.teacherId,
    schoolId: schedule.schoolId,
    periodsCount: schedule.assignments?.length || 0,
  }),
  TeacherScheduleReferenceZodSchema,
);

/** @deprecated Use visitScheduleToReference from schedule-documents.ts instead */
export const visitScheduleToReference = createReferenceTransformer<
  VisitSchedule,
  VisitScheduleReference
>(
  (visit) => `Visit - ${visit.date}`,
  (visit) => ({
    coachId: visit.coachId,
    schoolId: visit.schoolId,
    date: visit.date,
    eventsCount: visit.events?.length || 0,
    dateFormatted: visit.date
      ? new Date(visit.date).toLocaleDateString()
      : undefined,
  }),
  VisitScheduleReferenceZodSchema,
);

/** @deprecated Use bellSchedulesToReferences from schedule-documents.ts instead */
export const bellSchedulesToReferences = createArrayTransformer<
  BellSchedule,
  BellScheduleReference
>(bellScheduleToReference);

/** @deprecated Use teacherSchedulesToReferences from schedule-documents.ts instead */
export const teacherSchedulesToReferences = createArrayTransformer<
  TeacherSchedule,
  TeacherScheduleReference
>(teacherScheduleToReference);

/** @deprecated Use visitSchedulesToReferences from schedule-documents.ts instead */
export const visitSchedulesToReferences = createArrayTransformer<
  VisitSchedule,
  VisitScheduleReference
>(visitScheduleToReference);

/** @deprecated Use ConflictCheckDataSchema from schedule-documents.ts instead */
export const ConflictCheckDataSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  periodNumber: z.number().int().min(1).max(10),
  portion: ScheduleAssignmentTypeZod,
});

/** @deprecated Use ConflictCheckData from schedule-documents.ts instead */
export type ConflictCheckData = z.infer<typeof ConflictCheckDataSchema>;

// =====================================
// TYPE EXPORTS
// =====================================

// Bell Schedule Types
/** @deprecated Use TimeBlock from schedule-documents.ts instead */
export type TimeBlock = z.infer<typeof TimeBlockFieldsSchema>;
/** @deprecated Use BellScheduleInput from schedule-documents.ts instead */
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
/** @deprecated Use BellSchedule from schedule-documents.ts instead */
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
/** @deprecated Use BellScheduleReference from schedule-documents.ts instead */
export type BellScheduleReference = z.infer<
  typeof BellScheduleReferenceZodSchema
>;

// Teacher Schedule Types
/** @deprecated Use Period from schedule-documents.ts instead */
export type Period = z.infer<typeof PeriodFieldsSchema>;
/** @deprecated Use TeacherScheduleInput from schedule-documents.ts instead */
export type TeacherScheduleInput = z.infer<
  typeof TeacherScheduleInputZodSchema
>;
/** @deprecated Use TeacherSchedule from schedule-documents.ts instead */
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
/** @deprecated Use TeacherScheduleReference from schedule-documents.ts instead */
export type TeacherScheduleReference = z.infer<
  typeof TeacherScheduleReferenceZodSchema
>;

// Visit Schedule Types
/** @deprecated Use Event from schedule-documents.ts instead */
export type Event = z.infer<typeof EventFieldsSchema>;
/** @deprecated Use VisitScheduleInput from schedule-documents.ts instead */
export type VisitScheduleInput = z.infer<typeof VisitScheduleInputZodSchema>;
/** @deprecated Use VisitSchedule from schedule-documents.ts instead */
export type VisitSchedule = z.infer<typeof VisitScheduleZodSchema>;
/** @deprecated Use VisitScheduleReference from schedule-documents.ts instead */
export type VisitScheduleReference = z.infer<
  typeof VisitScheduleReferenceZodSchema
>;
