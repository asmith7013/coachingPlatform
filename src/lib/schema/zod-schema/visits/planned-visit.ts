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

// Schedule Assignment Type (for hover zones and three-zone scheduling)
export const ScheduleAssignmentTypeZod = z.enum(['full_period', 'first_half', 'second_half']);

// Visit Portion Type (alias for three-zone scheduling)
export const VisitPortionZod = ScheduleAssignmentTypeZod;

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
  
  // Three-zone scheduling enhancements
  periodNumber: z.number().optional(), // Period number (1, 2, 3, etc.) - simplified approach
  portion: VisitPortionZod.optional().default('full_period'), // Time portion within period
  
  // Optional scheduling context
  school: z.string().optional(), // School ID for context
  periodNum: z.number().optional(), // Legacy field - kept for backward compatibility
  notes: z.string().optional(), // Optional planning notes
  
  // Schedule builder state
  scheduleId: z.string().optional(), // Reference to parent schedule if grouped
  orderIndex: z.number().optional(), // Order within the schedule
  
  // Conflict tracking for multi-teacher assignments
  conflictingVisits: z.array(z.string()).optional(), // Array of conflicting visit IDs
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
    periodNumber: z.number().optional(),
    portion: VisitPortionZod.optional(),
  })
).extend({
  teacherName: z.string().optional().describe("Teacher name (for display)"),
  coachName: z.string().optional().describe("Coach name (for display)"),
  schoolName: z.string().optional().describe("School name (for display)"),
  timeSlotFormatted: z.string().optional().describe("Formatted time slot string"),
  dateFormatted: z.string().optional().describe("Formatted date string"),
  durationMinutes: z.number().optional().describe("Duration in minutes"),
  portionLabel: z.string().optional().describe("Human-readable portion label (e.g., 'First half of Period 2')"),
});

// Planned Visit Reference Transformer
export const plannedVisitToReference = createReferenceTransformer<PlannedVisit, PlannedVisitReference>(
  // Label function: Create display string with period-portion approach
  (plannedVisit) => {
    // Use period-portion approach if available, fallback to time slot
    if (plannedVisit.periodNumber && plannedVisit.portion) {
      const portionLabels = {
        first_half: 'First half',
        second_half: 'Second half',
        full_period: 'Full period'
      }
      const portionLabel = portionLabels[plannedVisit.portion] || 'Full period'
      return `${portionLabel} of Period ${plannedVisit.periodNumber}: ${plannedVisit.purpose}`
    }
    
    // Fallback to legacy time slot approach
    const timeSlot = `${plannedVisit.timeSlot.startTime}-${plannedVisit.timeSlot.endTime}`;
    return `${timeSlot}: ${plannedVisit.purpose}`;
  },
  
  // Additional fields function
  (plannedVisit) => {
    const date = plannedVisit.date ? 
      (plannedVisit.date instanceof Date ? plannedVisit.date : new Date(plannedVisit.date))
      : new Date();
    const timeSlotFormatted = `${plannedVisit.timeSlot.startTime} - ${plannedVisit.timeSlot.endTime}`;
    
    // Generate human-readable portion label
    let portionLabel = ''
    if (plannedVisit.periodNumber && plannedVisit.portion) {
      const portionLabels = {
        first_half: 'First half',
        second_half: 'Second half',
        full_period: 'Full period'
      }
      const portion = portionLabels[plannedVisit.portion] || 'Full period'
      portionLabel = `${portion} of Period ${plannedVisit.periodNumber}`
    }
    
    return {
      teacherId: plannedVisit.teacherId,
      timeSlot: plannedVisit.timeSlot,
      purpose: plannedVisit.purpose,
      date: date,
      coach: plannedVisit.coach,
      assignmentType: plannedVisit.assignmentType,
      periodNumber: plannedVisit.periodNumber,
      portion: plannedVisit.portion,
      timeSlotFormatted,
      dateFormatted: date.toISOString().split('T')[0], // YYYY-MM-DD format
      durationMinutes: parseInt(plannedVisit.duration), // Convert duration enum to minutes
      portionLabel,
    };
  },
  
  // Validation schema
  PlannedVisitReferenceZodSchema as z.ZodType<PlannedVisitReference>
);

// Auto-generate TypeScript types
export type TimeSlot = z.infer<typeof TimeSlotZodSchema>;
export type ScheduleAssignmentType = z.infer<typeof ScheduleAssignmentTypeZod>;
export type VisitPortion = z.infer<typeof VisitPortionZod>;
export type PlannedVisitInput = z.infer<typeof PlannedVisitInputZodSchema>;
export type PlannedVisit = z.infer<typeof PlannedVisitZodSchema>;
export type PlannedVisitReference = z.infer<typeof PlannedVisitReferenceZodSchema>; 