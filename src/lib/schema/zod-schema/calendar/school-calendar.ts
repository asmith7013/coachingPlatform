import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

/**
 * Types of calendar events (days off, half days, etc.)
 */
export const CalendarEventTypeZod = z.enum([
  "holiday",
  "school_closed",
  "half_day",
  "professional_development",
  "parent_conference",
  "testing",
  "other"
]);

export type CalendarEventType = z.infer<typeof CalendarEventTypeZod>;

/**
 * A single calendar event (day off, holiday, etc.)
 */
export const CalendarEventSchema = z.object({
  date: z.string(), // ISO date string YYYY-MM-DD
  name: z.string(),
  type: CalendarEventTypeZod,
  description: z.string().optional(),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

/**
 * School calendar for a school year
 */
export const SchoolCalendarFieldsSchema = z.object({
  schoolYear: z.string(), // e.g., "2024-2025"
  schoolId: z.string().optional(), // If calendar is school-specific
  startDate: z.string(), // First day of school YYYY-MM-DD
  endDate: z.string(), // Last day of school YYYY-MM-DD
  events: z.array(CalendarEventSchema).default([]),
  notes: z.string().optional(),
});

export const SchoolCalendarZodSchema = BaseDocumentSchema.merge(SchoolCalendarFieldsSchema);
export const SchoolCalendarInputZodSchema = toInputSchema(SchoolCalendarZodSchema);

export type SchoolCalendar = z.infer<typeof SchoolCalendarZodSchema>;
export type SchoolCalendarInput = z.infer<typeof SchoolCalendarInputZodSchema>;
