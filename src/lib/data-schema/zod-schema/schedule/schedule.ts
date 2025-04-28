import { z } from "zod";
import { 
  BellScheduleTypeZod, 
  BlockDayTypeZod, 
  DayTypeZod, 
  PeriodTypeZod 
} from "@enums"; // Updated centralized import
import { zDateField } from '@zod-schema/shared/dateHelpers';

// ✅ Class Schedule Item Schema - without _id field
export const ClassScheduleItemZodSchema = z.object({
  dayType: DayTypeZod, // Enum for day type
  startTime: z.string(), // Required time string
  endTime: z.string(), // Required time string
});

// ✅ Assigned Cycle Day Schema - without _id field
export const AssignedCycleDayZodSchema = z.object({
  date: z.string(), // Required date string
  blockDayType: BlockDayTypeZod, // Enum for block day type
});

// ✅ Bell Schedule Input Schema - without _id field
export const BellScheduleInputZodSchema = z.object({
  school: z.string(), // Required school ID
  bellScheduleType: BellScheduleTypeZod, // Enum for schedule type
  classSchedule: z.array(ClassScheduleItemZodSchema), // Array of class schedules
  assignedCycleDays: z.array(AssignedCycleDayZodSchema), // Array of assigned cycle days
  owners: z.array(z.string()), // Array of owner IDs
});

// ✅ Bell Schedule Full Schema
export const BellScheduleZodSchema = BellScheduleInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Period Schema - without _id field
export const PeriodZodSchema = z.object({
  periodNum: z.number(), // Required period number
  className: z.string(), // Required class name
  room: z.string().optional(), // Optional room
  periodType: PeriodTypeZod, // Enum for period type
});

// ✅ ScheduleByDay Schema - without _id field
export const ScheduleByDayZodSchema = z.object({
  day: DayTypeZod, // Enum for day
  periods: z.array(PeriodZodSchema), // Array of periods
});

// ✅ Teacher Schedule Input Schema - without _id field
export const TeacherScheduleInputZodSchema = z.object({
  teacher: z.string(), // Required teacher ID
  school: z.string(), // Required school ID
  scheduleByDay: z.array(ScheduleByDayZodSchema), // Array of daily schedules
  owners: z.array(z.string()), // Array of owner IDs
});

// ✅ Teacher Schedule Full Schema
export const TeacherScheduleZodSchema = TeacherScheduleInputZodSchema.extend({
  _id: z.string(),
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// ✅ Auto-generate TypeScript types
export type ClassScheduleItem = z.infer<typeof ClassScheduleItemZodSchema>;
export type AssignedCycleDay = z.infer<typeof AssignedCycleDayZodSchema>;
export type BellScheduleInput = z.infer<typeof BellScheduleInputZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type Period = z.infer<typeof PeriodZodSchema>;
export type ScheduleByDay = z.infer<typeof ScheduleByDayZodSchema>;
export type TeacherScheduleInput = z.infer<typeof TeacherScheduleInputZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;