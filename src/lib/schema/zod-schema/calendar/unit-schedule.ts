import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";

/**
 * A section within a unit (e.g., Section A, Section B)
 */
export const UnitSectionSchema = z.object({
  sectionId: z.string(), // Unique identifier within the unit
  name: z.string(), // e.g., "Section A", "Week 1"
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(), // YYYY-MM-DD
  plannedDays: z.number().optional(), // How many school days planned
  actualDays: z.number().optional(), // Calculated based on calendar (excludes days off)
  notes: z.string().optional(),
  color: z.string().optional(), // For visual differentiation in calendar
});

export type UnitSection = z.infer<typeof UnitSectionSchema>;

/**
 * A unit schedule with sections
 */
export const UnitScheduleFieldsSchema = z.object({
  schoolYear: z.string(), // e.g., "2024-2025"
  grade: z.string(), // e.g., "6", "7", "8"
  subject: z.string().optional(), // e.g., "Math"
  unitNumber: z.number(), // e.g., 1, 2, 3
  unitName: z.string(), // e.g., "Unit 3: Ratios and Proportions"
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(), // YYYY-MM-DD
  sections: z.array(UnitSectionSchema).default([]),
  color: z.string().optional(), // Primary color for the unit
  notes: z.string().optional(),
  // Per-section config fields (when schedules are tied to a specific class section)
  school: z.string().optional(), // e.g., "IS313", "PS19"
  classSection: z.string().optional(), // e.g., "601", "701", "802"
});

export const UnitScheduleZodSchema = BaseDocumentSchema.merge(UnitScheduleFieldsSchema);
export const UnitScheduleInputZodSchema = toInputSchema(UnitScheduleZodSchema);

export type UnitSchedule = z.infer<typeof UnitScheduleZodSchema>;
export type UnitScheduleInput = z.infer<typeof UnitScheduleInputZodSchema>;
