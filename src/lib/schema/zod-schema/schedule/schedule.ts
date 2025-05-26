import { z } from "zod";
import { 
  BellScheduleTypeZod, 
  BlockDayTypeZod, 
  DayTypeZod, 
  PeriodTypeZod 
} from "@enums"; 
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Class Schedule Item Fields Schema
export const ClassScheduleItemFieldsSchema = z.object({
  dayType: DayTypeZod,
  startTime: z.string(),
  endTime: z.string(),
});

// Class Schedule Item Schema
export const ClassScheduleItemZodSchema = ClassScheduleItemFieldsSchema;

// Assigned Cycle Day Fields Schema
export const AssignedCycleDayFieldsSchema = z.object({
  date: zDateField,
  blockDayType: BlockDayTypeZod,
});

// Assigned Cycle Day Schema
export const AssignedCycleDayZodSchema = AssignedCycleDayFieldsSchema;

// Bell Schedule Fields Schema
export const BellScheduleFieldsSchema = z.object({
  school: z.string(),
  bellScheduleType: BellScheduleTypeZod,
  classSchedule: z.array(ClassScheduleItemZodSchema),
  assignedCycleDays: z.array(AssignedCycleDayZodSchema),
});

// Bell Schedule Full Schema
export const BellScheduleZodSchema = BaseDocumentSchema.merge(BellScheduleFieldsSchema);

// Bell Schedule Input Schema
export const BellScheduleInputZodSchema = toInputSchema(BellScheduleZodSchema);

// Bell Schedule Reference Schema
export const BellScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  BellScheduleFieldsSchema
    .pick({
      school: true,
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
  periodNum: z.number(),
  className: z.string(),
  room: z.string().optional(),
  periodType: PeriodTypeZod,
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
  teacher: z.string(),
  school: z.string(),
  scheduleByDay: z.array(ScheduleByDayZodSchema),
});

// Teacher Schedule Full Schema
export const TeacherScheduleZodSchema = BaseDocumentSchema.merge(TeacherScheduleFieldsSchema);

// Teacher Schedule Input Schema
export const TeacherScheduleInputZodSchema = toInputSchema(TeacherScheduleZodSchema);

// Teacher Schedule Reference Schema
export const TeacherScheduleReferenceZodSchema = BaseReferenceZodSchema.merge(
  TeacherScheduleFieldsSchema
    .pick({
      teacher: true,
      school: true,
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
    school: schedule.school,
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
      teacher: schedule.teacher,
      school: schedule.school,
      daysCount: schedule.scheduleByDay?.length || 0,
      periodsCount,
    };
  },
  TeacherScheduleReferenceZodSchema
);

// Array transformer
export const teacherSchedulesToReferences = createArrayTransformer<TeacherSchedule, TeacherScheduleReference>(
  teacherScheduleToReference
);

// Auto-generate TypeScript types
export type ClassScheduleItem = z.infer<typeof ClassScheduleItemZodSchema>;
export type AssignedCycleDay = z.infer<typeof AssignedCycleDayZodSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type BellScheduleReference = z.infer<typeof BellScheduleReferenceZodSchema>;
export type Period = z.infer<typeof PeriodZodSchema>;
export type ScheduleByDay = z.infer<typeof ScheduleByDayZodSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;
export type TeacherScheduleReference = z.infer<typeof TeacherScheduleReferenceZodSchema>;