import { z } from "zod";
import { DurationZod } from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer } from "@transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Time Slot Schema (reusable component)
export const TimeSlotZodSchema = z.object({
  startTime: z.string(), // Format: "HH:MM" (24-hour format)
  endTime: z.string(),   // Format: "HH:MM" (24-hour format)
  periodNum: z.number().optional(), // Optional period number for bell schedule alignment
});

// Schedule Assignment Type (for hover zones)
export const ScheduleAssignmentTypeZod = z.enum(['full_period', 'first_half', 'second_half']);

// Planned Visit Fields Schema
export const PlannedVisitFieldsSchema = z.object({
  // Core assignment data
  teacherId: z.string(), // Required teacher ID
  timeSlot: TimeSlotZodSchema, // Required time slot information
  purpose: z.string(), // Required purpose (coaching-specific or custom)
  duration: DurationZod, // Required duration enum
  date: zDateField, // Required date for the planned visit
  coach: z.string(), // Required coach ID who created the plan
  
  // Planning metadata
  assignmentType: ScheduleAssignmentTypeZod.default('full_period'), // How teacher was assigned to slot
  customPurpose: z.boolean().default(false), // Whether purpose is custom or predefined
  
  // Optional scheduling context
  school: z.string().optional(), // School ID for context
  periodNum: z.number().optional(), // Period number if aligned with bell schedule
  notes: z.string().optional(), // Optional planning notes
  
  // Schedule builder state
  scheduleId: z.string().optional(), // Reference to parent schedule if grouped
  orderIndex: z.number().optional(), // Order within the schedule
});

// Planned Visit Full Schema
export const PlannedVisitZodSchema = BaseDocumentSchema.merge(PlannedVisitFieldsSchema);

// Planned Visit Input Schema
export const PlannedVisitInputZodSchema = toInputSchema(PlannedVisitZodSchema);

// Planned Visit Reference Schema
export const PlannedVisitReferenceZodSchema = BaseReferenceZodSchema.merge(
  z.object({
    teacherId: z.string().optional(),
    timeSlot: TimeSlotZodSchema.optional(),
    purpose: z.string().optional(),
    date: zDateField.optional(),
    coach: z.string().optional(),
    assignmentType: ScheduleAssignmentTypeZod.optional(),
  })
).extend({
  teacherName: z.string().optional().describe("Teacher name (for display)"),
  coachName: z.string().optional().describe("Coach name (for display)"),
  schoolName: z.string().optional().describe("School name (for display)"),
  timeSlotFormatted: z.string().optional().describe("Formatted time slot string"),
  dateFormatted: z.string().optional().describe("Formatted date string"),
  durationMinutes: z.number().optional().describe("Duration in minutes"),
});

// Planned Visit Reference Transformer
export const plannedVisitToReference = createReferenceTransformer<PlannedVisit, PlannedVisitReference>(
  // Label function: Create display string from teacher, time, and purpose
  (plannedVisit) => {
    const timeSlot = `${plannedVisit.timeSlot.startTime}-${plannedVisit.timeSlot.endTime}`;
    return `${timeSlot}: ${plannedVisit.purpose}`;
  },
  
  // Additional fields function
  (plannedVisit) => {
    const date = plannedVisit.date ? 
      (plannedVisit.date instanceof Date ? plannedVisit.date : new Date(plannedVisit.date))
      : new Date();
    const timeSlotFormatted = `${plannedVisit.timeSlot.startTime} - ${plannedVisit.timeSlot.endTime}`;
    
    return {
      teacherId: plannedVisit.teacherId,
      timeSlot: plannedVisit.timeSlot,
      purpose: plannedVisit.purpose,
      date: date,
      coach: plannedVisit.coach,
      assignmentType: plannedVisit.assignmentType,
      timeSlotFormatted,
      dateFormatted: date.toISOString().split('T')[0], // YYYY-MM-DD format
      durationMinutes: parseInt(plannedVisit.duration), // Convert duration enum to minutes
    };
  },
  
  // Validation schema
  PlannedVisitReferenceZodSchema as z.ZodType<PlannedVisitReference>
);

// Auto-generate TypeScript types
export type TimeSlot = z.infer<typeof TimeSlotZodSchema>;
export type ScheduleAssignmentType = z.infer<typeof ScheduleAssignmentTypeZod>;
export type PlannedVisitInput = z.infer<typeof PlannedVisitInputZodSchema>;
export type PlannedVisit = z.infer<typeof PlannedVisitZodSchema>;
export type PlannedVisitReference = z.infer<typeof PlannedVisitReferenceZodSchema>; 