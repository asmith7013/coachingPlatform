import { z } from "zod";
import { 
  BellScheduleTypeZod, 
  BlockDayTypeZod, 
  DayTypeZod, 
  PeriodTypeZod 
} from "@enums"; // Updated centralized import
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Class Schedule Item Schema - without _id field
export const ClassScheduleItemZodSchema = z.object({
  dayType: DayTypeZod, // Enum for day type
  startTime: z.string(), // Required time string
  endTime: z.string(), // Required time string
});

// Assigned Cycle Day Schema - without _id field
export const AssignedCycleDayZodSchema = z.object({
  date: zDateField, // Required date with proper handling
  blockDayType: BlockDayTypeZod, // Enum for block day type
});

// Bell Schedule Fields Schema
export const BellScheduleFieldsSchema = z.object({
  school: z.string(), // Required school ID
  bellScheduleType: BellScheduleTypeZod, // Enum for schedule type
  classSchedule: z.array(ClassScheduleItemZodSchema), // Array of class schedules
  assignedCycleDays: z.array(AssignedCycleDayZodSchema), // Array of assigned cycle days
});

// Bell Schedule Full Schema
export const BellScheduleZodSchema = BaseDocumentSchema.merge(BellScheduleFieldsSchema);

// Bell Schedule Input Schema
export const BellScheduleInputZodSchema = toInputSchema(BellScheduleZodSchema);

// Period Schema - without _id field
export const PeriodZodSchema = z.object({
  periodNum: z.number(), // Required period number
  className: z.string(), // Required class name
  room: z.string().optional(), // Optional room
  periodType: PeriodTypeZod, // Enum for period type
});

// ScheduleByDay Schema - without _id field
export const ScheduleByDayZodSchema = z.object({
  day: DayTypeZod, // Enum for day
  periods: z.array(PeriodZodSchema), // Array of periods
});

// Teacher Schedule Fields Schema
export const TeacherScheduleFieldsSchema = z.object({
  teacher: z.string(), // Required teacher ID
  school: z.string(), // Required school ID
  scheduleByDay: z.array(ScheduleByDayZodSchema), // Array of daily schedules
});

// Teacher Schedule Full Schema
export const TeacherScheduleZodSchema = BaseDocumentSchema.merge(TeacherScheduleFieldsSchema);

// Teacher Schedule Input Schema
export const TeacherScheduleInputZodSchema = toInputSchema(TeacherScheduleZodSchema);

// Auto-generate TypeScript types
export type ClassScheduleItem = z.infer<typeof ClassScheduleItemZodSchema>;
export type AssignedCycleDay = z.infer<typeof AssignedCycleDayZodSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type Period = z.infer<typeof PeriodZodSchema>;
export type ScheduleByDay = z.infer<typeof ScheduleByDayZodSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;