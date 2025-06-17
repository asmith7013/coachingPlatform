// src/lib/zod-schema/schedules/schedule-events.ts
import { z } from "zod";
import { 
  SessionPurposeZod,
  ScheduleAssignmentTypeZod,
  PeriodTypeZod,
  GradeLevelsSupportedZod,
} from "@enums";

// =====================================
// BASE SCHEMA
// =====================================

export const BaseTimeBlockSchema = z.object({
  periodNumber: z.number().describe("Sequential period number: 1, 2, 3, etc."),
  periodName: z.string().optional().describe("Optional period name: 'Morning Block', 'Advisory', etc."),
  startTime: z.string().describe("24-hour format: 'HH:MM' (e.g., '08:30')"),
  endTime: z.string().describe("24-hour format: 'HH:MM' (e.g., '09:15')"),
  duration: z.number().optional().describe("Actual minutes if different from portion default"),
  room: z.string().optional().describe("Override room if different from teacher's assigned room"),
  notes: z.string().optional().describe("Event-specific notes and focus areas"),
});

// =====================================
// DISCRIMINATED UNION - SINGLE SOURCE OF TRUTH
// =====================================

export const BellScheduleBlockSchema = BaseTimeBlockSchema.extend({
  blockType: z.literal("bellScheduleBlock"),
});

export const TeacherScheduleBlockSchema = BaseTimeBlockSchema.extend({
  blockType: z.literal("teacherScheduleBlock"),

  className: z.string().describe("'5th Grade Math', 'Planning Time', 'Lunch Break', etc."),
  room: z.string().describe("'Room 205', 'Teachers Lounge', 'Main Playground', etc."),
  activityType: PeriodTypeZod.describe("Type of activity: 'teaching', 'prep', 'duty', 'lunch', 'meeting'"),
  subject: z.string().optional().describe("'Math', 'Science', 'Reading', etc."),
  gradeLevel: GradeLevelsSupportedZod.optional().describe("'Grade 5', 'Kindergarten', etc."),
});

export const VisitScheduleBlockSchema = BaseTimeBlockSchema.extend({
  blockType: z.literal("visitScheduleBlock"),

  orderIndex: z.number().describe("Sequence within period: 1, 2, 3... for multiple events"),
  eventType: SessionPurposeZod.describe("Type of coaching session"),
  staffIds: z.array(z.string()).describe("Array of staff IDs - supports multiple teachers per event"),
  portion: ScheduleAssignmentTypeZod.describe("Time portion of the period"),
});
// export const TimeBlockSchema = z.discriminatedUnion("blockType", [
//   // Bell schedule structure - defines time blocks only
//   BaseTimeBlockSchema.extend({
//     blockType: z.literal("bellScheduleBlock"),

//   }),
  
//   // Teacher assignment - what teacher does during this period
//   BaseTimeBlockSchema.extend({
//     blockType: z.literal("teacherScheduleBlock"),

//     className: z.string().describe("'5th Grade Math', 'Planning Time', 'Lunch Break', etc."),
//     room: z.string().describe("'Room 205', 'Teachers Lounge', 'Main Playground', etc."),
//     activityType: PeriodTypeZod.describe("Type of activity: 'teaching', 'prep', 'duty', 'lunch', 'meeting'"),
//     subject: z.string().optional().describe("'Math', 'Science', 'Reading', etc."),
//     gradeLevel: GradeLevelsSupportedZod.optional().describe("'Grade 5', 'Kindergarten', etc."),
//   }),
  
//   // Coaching activity - what coach does during this period
//   BaseTimeBlockSchema.extend({
//     blockType: z.literal("visitScheduleBlock"),

//     eventId: z.string().describe("Unique identifier for this event"),
//     orderIndex: z.number().describe("Sequence within period: 1, 2, 3... for multiple events"),
//     eventType: SessionPurposeZod.describe("Type of coaching session"),
//     staffIds: z.array(z.string()).describe("Array of staff IDs - supports multiple teachers per event"),
//     portion: ScheduleAssignmentTypeZod.describe("Time portion of the period"),
//   })
// ]);


// =====================================
// TYPE EXTRACTION (DRY)
// =====================================

export type BellScheduleBlock = z.infer<typeof BellScheduleBlockSchema>;
export type TeacherScheduleBlock = z.infer<typeof TeacherScheduleBlockSchema>;
export type VisitScheduleBlock = z.infer<typeof VisitScheduleBlockSchema>;

// =====================================
// BACKWARD COMPATIBILITY ALIASES
// =====================================

/** @deprecated Use existing EventFieldsSchema from old schedule structure */
export const EventFieldsSchema = z.object({
  eventId: z.string().describe("Unique identifier for this event"),
  periodNumber: z.number().describe("Maps to bell schedule period"),
  orderIndex: z.number().describe("Sequence within period"),
  eventType: SessionPurposeZod.describe("Type of coaching session"),
  staffIds: z.array(z.string()).describe("Array of staff IDs"),
  portion: ScheduleAssignmentTypeZod.describe("Time portion of the period"),
  room: z.string().optional().describe("Override room"),
  duration: z.number().optional().describe("Actual minutes"),
  notes: z.string().optional().describe("Event-specific notes"),
  timeSlot: z.object({
    periodNumber: z.number(),
    startTime: z.string(),
    endTime: z.string(),
    periodName: z.string().optional()
  }).optional().describe("More specific time window"),
  actualStartTime: z.string().optional().describe("Override start time"),
  actualEndTime: z.string().optional().describe("Override end time")
});

/** @deprecated Use VisitScheduleBlock instead */
export type VisitEvent = z.infer<typeof EventFieldsSchema>;

/** @deprecated Use VisitScheduleBlock instead */
export type EventItem = z.infer<typeof EventFieldsSchema>;

/** @deprecated Use BellScheduleBlock instead */
export type TimeBlockFields = z.infer<typeof BaseTimeBlockSchema>;

/** @deprecated Use TimeBlockSchema instead */
export const EventItemZodSchema = EventFieldsSchema;

/** @deprecated Use VisitScheduleBlock instead */
export type EventFields = z.infer<typeof EventFieldsSchema>;

/** @deprecated Use existing Event type */
export type Event = z.infer<typeof EventFieldsSchema>;

// Fix ConflictCheckData to match actual usage
export const ConflictCheckDataSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  periodNumber: z.number().int().min(1).max(10),
  portion: z.string() // Changed to string to match existing usage
});