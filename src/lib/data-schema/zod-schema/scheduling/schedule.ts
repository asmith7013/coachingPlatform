import { z } from "zod";
import { 
  BellScheduleTypeZod, 
  BlockDayTypeZod, 
  DayTypeZod, 
  PeriodTypeZod 
} from "@data-schema/enum"; // Updated centralized import
import { zDateField } from '@zod-schema/shared/dateHelpers';

// ✅ Class Schedule Item Schema - with _id field
export const ClassScheduleItemZodSchema = z.object({
  _id: z.string().optional(), // Make _id optional in Zod but required in Mongoose
  dayType: DayTypeZod, // Enum for day type
  startTime: z.string(), // Required time string
  endTime: z.string(), // Required time string
});

// ✅ Assigned Cycle Day Schema - with _id field
export const AssignedCycleDayZodSchema = z.object({
  _id: z.string().optional(), // Make _id optional in Zod but required in Mongoose
  date: z.string(), // Required date string
  blockDayType: BlockDayTypeZod, // Enum for block day type
});

// ✅ Bell Schedule Input Schema
export const BellScheduleInputZodSchema = z.object({
  _id: z.string().optional(), // Make top-level _id optional
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

// ✅ Period Schema - with _id field
export const PeriodZodSchema = z.object({
  _id: z.string().optional(), // Make _id optional in Zod but required in Mongoose
  periodNum: z.number(), // Required period number
  className: z.string(), // Required class name
  room: z.string().optional(), // Optional room
  periodType: PeriodTypeZod, // Enum for period type
});

// ✅ ScheduleByDay Schema - with _id field
export const ScheduleByDayZodSchema = z.object({
  _id: z.string().optional(), // Make _id optional in Zod but required in Mongoose
  day: DayTypeZod, // Enum for day
  periods: z.array(PeriodZodSchema), // Array of periods
});

// ✅ Teacher Schedule Input Schema
export const TeacherScheduleInputZodSchema = z.object({
  _id: z.string().optional(), // Make top-level _id optional
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