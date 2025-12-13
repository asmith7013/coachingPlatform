import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

/**
 * A single calendar event (day off, holiday, etc.)
 * Events without school/classSection are global (apply to everyone)
 * Events with school/classSection are section-specific
 */
export const CalendarEventSchema = z.object({
  date: z.string(), // ISO date string YYYY-MM-DD
  name: z.string(),
  description: z.string().optional(),
  // Optional section targeting (if absent = global event)
  school: z.string().optional(),
  classSection: z.string().optional(),
  // Whether math class happens on this day
  // false = no math class (testing, assembly, no school) - schedule shifts
  // true = math class happens (normal day)
  hasMathClass: z.boolean().default(false),
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
