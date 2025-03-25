import { z } from "zod";
import { BellScheduleTypeZod, BlockDayTypeZod, DayTypeZod, PeriodTypeZod } from "../shared/shared-types";

// ✅ Class Schedule Item Schema
export const ClassScheduleItemZodSchema = z.object({
  dayType: DayTypeZod, // Enum for day type
  startTime: z.string(), // Required time string
  endTime: z.string(), // Required time string
});

// ✅ Assigned Cycle Day Schema
export const AssignedCycleDayZodSchema = z.object({
  date: z.string(), // Required date string
  blockDayType: BlockDayTypeZod, // Enum for block day type
});

// ✅ Bell Schedule Schema
export const BellScheduleZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
  school: z.string(), // Required school ID
  bellScheduleType: BellScheduleTypeZod, // Enum for schedule type
  classSchedule: z.array(ClassScheduleItemZodSchema), // Array of class schedules
  assignedCycleDays: z.array(AssignedCycleDayZodSchema), // Array of assigned cycle days
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.date().optional(), // Use Date type instead of string
  updatedAt: z.date().optional(), // Use Date type instead of string
});

// ✅ Period Schema
export const PeriodZodSchema = z.object({
  periodNum: z.number(), // Required period number
  className: z.string(), // Required class name
  room: z.string().optional(), // Optional room
  periodType: PeriodTypeZod, // Enum for period type
});

// ✅ ScheduleByDay Schema
export const ScheduleByDayZodSchema = z.object({
  day: DayTypeZod, // Enum for day
  periods: z.array(PeriodZodSchema), // Array of periods
});

// ✅ Teacher Schedule Schema
export const TeacherScheduleZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
  teacher: z.string(), // Required teacher ID
  school: z.string(), // Required school ID
  scheduleByDay: z.array(ScheduleByDayZodSchema), // Array of daily schedules
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.date().optional(), // Use Date type instead of string
  updatedAt: z.date().optional(), // Use Date type instead of string
});

// ✅ Auto-generate TypeScript types
export type ClassScheduleItem = z.infer<typeof ClassScheduleItemZodSchema>;
export type AssignedCycleDay = z.infer<typeof AssignedCycleDayZodSchema>;
export type BellSchedule = z.infer<typeof BellScheduleZodSchema>;
export type Period = z.infer<typeof PeriodZodSchema>;
export type ScheduleByDay = z.infer<typeof ScheduleByDayZodSchema>;
export type TeacherSchedule = z.infer<typeof TeacherScheduleZodSchema>;