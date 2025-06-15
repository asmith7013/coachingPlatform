import { z } from "zod";
import { 
  BellScheduleTypeZod, 
  SessionPurposeZod,
  ScheduleAssignmentTypeZod
} from "@enums"; 
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";

// =====================================
// 1. SCHOOL BELL SCHEDULE (Simplified)
// =====================================

// Time Block Fields Schema
export const TimeBlockFieldsSchema = z.object({
  periodNumber: z.number().describe("Sequential period number: 1, 2, 3, etc."),
  startTime: z.string().describe("24-hour format: 'HH:MM' (e.g., '08:30')"),
  endTime: z.string().describe("24-hour format: 'HH:MM' (e.g., '09:15')"),
  periodName: z.string().optional().describe("Optional custom name: 'Morning Block', 'Advisory', 'Homeroom', etc.")
});

// Bell Schedule Fields Schema
export const BellScheduleFieldsSchema = z.object({
  schoolId: z.string().describe("Reference to School document _id this bell schedule belongs to"),
  name: z.string().describe("Schedule name: 'Regular Day', 'Early Release', 'Block Schedule', etc."),
  bellScheduleType: BellScheduleTypeZod.describe("Schedule pattern type"),
  timeBlocks: z.array(TimeBlockFieldsSchema).describe("Array of time periods defining the daily schedule")
});

// Bell Schedule Full Schema
export const BellScheduleZodSchema = BaseDocumentSchema.merge(BellScheduleFieldsSchema);

// Bell Schedule Input Schema
export const BellScheduleInputZodSchema = toInputSchema(BellScheduleZodSchema);

// =====================================
// 2. TEACHER SCHEDULE (Unchanged)
// =====================================

// Teacher Assignment Fields Schema
export const TeacherAssignmentFieldsSchema = z.object({
  periodNumber: z.number().describe("Maps to bell schedule period"),
  className: z.string().describe("'5th Grade Math', 'Planning Time', 'Lunch Break', etc."),
  room: z.string().describe("'Room 205', 'Teachers Lounge', 'Main Playground', etc."),
  activityType: z.enum(["teaching", "prep", "duty", "lunch", "meeting"]),
  subject: z.string().optional().describe("'Math', 'Science', 'Reading', etc."),
  gradeLevel: z.string().optional().describe("'Grade 5', 'Kindergarten', etc.")
});

// Teacher Schedule Fields Schema
export const TeacherScheduleFieldsSchema = z.object({
  teacherId: z.string().describe("Reference to Staff document _id"),
  schoolId: z.string().describe("Reference to School document _id"),
  bellScheduleId: z.string().describe("References which bell schedule this follows"),
  assignments: z.array(TeacherAssignmentFieldsSchema).describe("Period-by-period assignments")
});

// Teacher Schedule Full Schema
export const TeacherScheduleZodSchema = BaseDocumentSchema.merge(TeacherScheduleFieldsSchema);

// Teacher Schedule Input Schema
export const TeacherScheduleInputZodSchema = toInputSchema(TeacherScheduleZodSchema);

// =====================================
// 3. VISIT SCHEDULE (Updated)
// =====================================

// Visit Event Fields Schema
export const VisitEventFieldsSchema = z.object({
  // Unique identifier for context tracking
  eventId: z.string().describe("Unique identifier for this event - used for linking notes/evidence"),
  
  // Period and sequencing
  periodNumber: z.number().describe("Maps to bell schedule period (1-9, etc.)"),
  orderIndex: z.number().describe("Sequence within period: 1, 2, 3... for multiple events"),
  
  // Event details
  eventType: SessionPurposeZod.describe("Type of coaching session"),
  teacherIds: z.array(z.string()).describe("Array of teacher IDs - supports multiple teachers per event"),
  portion: ScheduleAssignmentTypeZod.describe("Time portion of the period"),
  
  // Context and notes
  room: z.string().optional().describe("Override room if different from teacher's assigned room"),
  duration: z.number().optional().describe("Actual minutes if different from portion default"),
  notes: z.string().optional().describe("Event-specific notes and focus areas"),
  
  // Optional timing overrides
  actualStartTime: z.string().optional().describe("Override start time: 'HH:MM'"),
  actualEndTime: z.string().optional().describe("Override end time: 'HH:MM'")
});

// Visit Schedule Fields Schema
export const VisitScheduleFieldsSchema = z.object({
  coachingActionPlanId: z.string().describe("Reference to primary aggregate"),
  date: z.string().optional().describe("ISO string for system timestamp"),
  coachId: z.string().describe("Reference to coach Staff document _id"),
  schoolId: z.string().describe("Reference to School document _id"),
  bellScheduleId: z.string().describe("References school's bell schedule for period timing"),
  events: z.array(VisitEventFieldsSchema).describe("Flat array of all events - use periodNumber + orderIndex for sequencing")
});

// Visit Schedule Full Schema
export const VisitScheduleZodSchema = BaseDocumentSchema.merge(VisitScheduleFieldsSchema);

// Visit Schedule Input Schema
export const VisitScheduleInputZodSchema = toInputSchema(VisitScheduleZodSchema);

// =====================================
// REFERENCE SCHEMAS
// =====================================

// Bell Schedule Reference Schema
export const BellScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  BellScheduleFieldsSchema
    .pick({
      schoolId: true,
      bellScheduleType: true,
    })
    .partial()
).extend({
  schoolName: z.string().optional(),
  blocksCount: z.number().optional(),
});

// Teacher Schedule Reference Schema
export const TeacherScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  TeacherScheduleFieldsSchema
    .pick({
      teacherId: true,
      schoolId: true,
    })
    .partial()
).extend({
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
  periodsCount: z.number().optional(),
});

// Visit Schedule Reference Schema
export const VisitScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  VisitScheduleFieldsSchema
    .pick({
      coachId: true,
      schoolId: true,
      date: true,
    })
    .partial()
).extend({
  coachName: z.string().optional(),
  schoolName: z.string().optional(),
  eventsCount: z.number().optional(),
  dateFormatted: z.string().optional(),
});

// =====================================
// REFERENCE TRANSFORMERS
// =====================================

// Bell Schedule Reference Transformer
export const bellScheduleToReference = createReferenceTransformer<BellSchedule, BellScheduleReference>(
  (schedule) => `${schedule.name} (${schedule.bellScheduleType})`,
  (schedule) => ({
    schoolId: schedule.schoolId,
    bellScheduleType: schedule.bellScheduleType,
    blocksCount: schedule.timeBlocks?.length || 0,
  }),
  BellScheduleReferenceZodSchema
);

// Teacher Schedule Reference Transformer
export const teacherScheduleToReference = createReferenceTransformer<TeacherSchedule, TeacherScheduleReference>(
  (_schedule) => `Teacher Schedule`,
  (schedule) => ({
    teacherId: schedule.teacherId,
    schoolId: schedule.schoolId,
    periodsCount: schedule.assignments?.length || 0,
  }),
  TeacherScheduleReferenceZodSchema
);

// Visit Schedule Reference Transformer
export const visitScheduleToReference = createReferenceTransformer<VisitSchedule, VisitScheduleReference>(
  (visit) => `Visit - ${visit.date}`,
  (visit) => ({
    coachId: visit.coachId,
    schoolId: visit.schoolId,
    date: visit.date,
    eventsCount: visit.events?.length || 0,
    dateFormatted: visit.date ? new Date(visit.date).toLocaleDateString() : undefined,
  }),
  VisitScheduleReferenceZodSchema
);

// Array transformers
export const bellSchedulesToReferences = createArrayTransformer<BellSchedule, BellScheduleReference>(
  bellScheduleToReference
);

export const teacherSchedulesToReferences = createArrayTransformer<TeacherSchedule, TeacherScheduleReference>(
  teacherScheduleToReference
);

export const visitSchedulesToReferences = createArrayTransformer<VisitSchedule, VisitScheduleReference>(
  visitScheduleToReference
);

// =====================================
// TYPE EXPORTS
// =====================================

// Bell Schedule Types
export type TimeBlock = z.infer<typeof TimeBlockFieldsSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type BellScheduleReference = z.infer<typeof BellScheduleReferenceZodSchema>;

// Teacher Schedule Types
export type TeacherAssignment = z.infer<typeof TeacherAssignmentFieldsSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type TeacherScheduleReference = z.infer<typeof TeacherScheduleReferenceZodSchema>;

// Visit Schedule Types
export type VisitEvent = z.infer<typeof VisitEventFieldsSchema>;
export type VisitScheduleInput = z.infer<typeof VisitScheduleInputZodSchema>;
export type VisitSchedule = z.infer<typeof VisitScheduleZodSchema>;
export type VisitScheduleReference = z.infer<typeof VisitScheduleReferenceZodSchema>;