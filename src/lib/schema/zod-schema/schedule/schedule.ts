import { z } from "zod";
import { 
  BellScheduleTypeZod, 
  BlockDayTypeZod, 
  DayTypeZod, 
  PeriodTypeZod,
  ScheduleAssignmentTypeZod
} from "@enums"; 
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';
import { TimeSlotZodSchema } from "@zod-schema/visits/visit";

// Note: ScheduleAssignmentTypeZod was from planned-visit schema - using string for now

// Class Schedule Item Fields Schema
export const ClassScheduleItemFieldsSchema = z.object({
  dayType: DayTypeZod.describe("Type of school day: Regular, Early Dismissal, etc."),
  startTime: z.string().describe("24-hour format time: 'HH:MM' (e.g., '08:30')"),
  endTime: z.string().describe("24-hour format time: 'HH:MM' (e.g., '09:15')"),
  periodNum: z.number().optional().describe("Period number in bell schedule sequence (1-8)"),
  className: z.string().optional(),
  room: z.string().optional(),
  periodType: PeriodTypeZod.optional().describe("Type of period: class, lunch, prep, assembly, etc."),
});

// Class Schedule Item Schema

// Assigned Cycle Day Fields Schema
export const AssignedCycleDayFieldsSchema = z.object({
  date: zDateField,
  blockDayType: BlockDayTypeZod,
});


// Bell Schedule Fields Schema
export const BellScheduleFieldsSchema = z.object({
  schoolId: z.string().describe("Reference to School document _id this bell schedule belongs to"),
  bellScheduleType: BellScheduleTypeZod.describe("Schedule pattern: Regular, Block, Early Dismissal, etc."),
  classSchedule: z.array(ClassScheduleItemFieldsSchema).describe("Array of time slots defining the daily schedule"),
  assignedCycleDays: z.array(AssignedCycleDayFieldsSchema).describe("Array of specific dates with assigned cycle days"),
});

// Bell Schedule Full Schema
export const BellScheduleZodSchema = BaseDocumentSchema.merge(BellScheduleFieldsSchema);

// Bell Schedule Input Schema
export const BellScheduleInputZodSchema = toInputSchema(BellScheduleZodSchema);

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
  daysCount: z.number().optional(),
  scheduleCount: z.number().optional(),
});

// Period Fields Schema
export const PeriodFieldsSchema = z.object({
  periodNum: z.number().describe("Period number in daily sequence (1-8)"),
  className: z.string(),
  room: z.string().optional(),
  periodType: PeriodTypeZod.describe("Type of period: class, lunch, prep, assembly, etc."),
});

// Period Schema
export const PeriodZodSchema = PeriodFieldsSchema;

// ScheduleByDay Fields Schema
export const ScheduleByDayFieldsSchema = z.object({
  day: DayTypeZod,
  periods: z.array(PeriodZodSchema),
});

// ScheduleByDay Schema
export const ScheduleByDayZodSchema = ScheduleByDayFieldsSchema;

// Teacher Schedule Fields Schema
export const TeacherScheduleFieldsSchema = z.object({
  teacherId: z.string().describe("Reference to Teacher document _id this schedule belongs to"),
  schoolId: z.string().describe("Reference to School document _id where teacher works"),
  scheduleByDay: z.array(ScheduleByDayZodSchema).describe("Array of daily schedules organized by day type"),
});

// Teacher Schedule Full Schema
export const TeacherScheduleZodSchema = BaseDocumentSchema.merge(TeacherScheduleFieldsSchema);

// Teacher Schedule Input Schema
export const TeacherScheduleInputZodSchema = toInputSchema(TeacherScheduleZodSchema);

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
  daysCount: z.number().optional(),
  periodsCount: z.number().optional(),
});

// Bell Schedule Reference Transformer
export const bellScheduleToReference = createReferenceTransformer<BellSchedule, BellScheduleReference>(
  (schedule) => `${schedule.bellScheduleType} Schedule`,
  (schedule) => ({
    schoolId: schedule.schoolId,
    bellScheduleType: schedule.bellScheduleType,
    daysCount: schedule.assignedCycleDays?.length || 0,
    scheduleCount: schedule.classSchedule?.length || 0,
  }),
  BellScheduleReferenceZodSchema
);

// Array transformer
export const bellSchedulesToReferences = createArrayTransformer<BellSchedule, BellScheduleReference>(
  bellScheduleToReference
);

// Teacher Schedule Reference Transformer
export const teacherScheduleToReference = createReferenceTransformer<TeacherSchedule, TeacherScheduleReference>(
  (_schedule) => `Teacher Schedule`,
  (schedule) => {
    const periodsCount = schedule.scheduleByDay.reduce(
      (total, day) => total + (day.periods?.length || 0), 
      0
    );
    
    return {
      teacherId: schedule.teacherId,
      schoolId: schedule.schoolId,
      daysCount: schedule.scheduleByDay?.length || 0,
      periodsCount,
    };
  },
  TeacherScheduleReferenceZodSchema
);

// Assignment State Schema
export const AssignmentStateZodSchema = z.object({
  teacherId: z.string().describe("Reference to Teacher document _id being assigned"),
  timeSlot: TimeSlotZodSchema.describe("Time window for this assignment"),
  purpose: z.string().optional(),
  assignmentType: ScheduleAssignmentTypeZod.describe("Assignment scope: full_period, first_half, or second_half"),
  isTemporary: z.boolean().default(true).describe("Whether assignment is temporary preview (drag state)"),
  assignedAt: zDateField.optional().describe("Timestamp when assignment was confirmed"),
});


// Array transformer
export const teacherSchedulesToReferences = createArrayTransformer<TeacherSchedule, TeacherScheduleReference>(
  teacherScheduleToReference
);

// Auto-generate TypeScript types
export type ClassScheduleItem = z.infer<typeof ClassScheduleItemFieldsSchema>;
export type AssignedCycleDay = z.infer<typeof AssignedCycleDayFieldsSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type BellScheduleReference = z.infer<typeof BellScheduleReferenceZodSchema>;
export type Period = z.infer<typeof PeriodZodSchema>;
export type ScheduleByDay = z.infer<typeof ScheduleByDayZodSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type TeacherScheduleReference = z.infer<typeof TeacherScheduleReferenceZodSchema>;
export type AssignmentState = z.infer<typeof AssignmentStateZodSchema>;
export type ScheduleAssignment = z.infer<typeof ScheduleAssignmentTypeZod>;