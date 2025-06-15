import { z } from "zod";
import { 
  GradeLevelsSupportedZod, 
  DurationZod,
  AllowedPurposeZod,
  ModeDoneZod,
  SessionPurposeZod,
  ScheduleAssignmentTypeZod
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@/lib/data-processing/transformers/factories/reference-factory";
import { formatVisitDate } from "@schema/reference/visits/visit-helpers";

// Time Slot Schema (reusable component)
export const TimeSlotZodSchema = z.object({
  startTime: z.string().default('').describe("24-hour format time: 'HH:MM' (e.g., '08:30')"),
  endTime: z.string().default('').describe("24-hour format time: 'HH:MM' (e.g., '09:15')"),
  periodNum: z.number().optional().default(0).describe("Period number for bell schedule alignment (1-8)"),
});

export const VisitPortionZod = ScheduleAssignmentTypeZod;

export const EventItemZodSchema = z.object({

  // event-specific context
  eventType: SessionPurposeZod.default(SessionPurposeZod.options[0]).describe("Type of coaching session: Observation, Debrief, Co-Planning, or PLC"),
  staffIds: z.array(z.string()).default([]).describe("Array of Staff document _ids participating in this event"),
  room: z.string().optional().describe("Classroom from teacher schedule"),
  periodNumber: z.number().optional().default(0).describe("Bell schedule period number (1-8)"),

  // event-specific scheduling
  portion: VisitPortionZod.optional().default(VisitPortionZod.options[0]).describe("Schedule portion: full_period, first_half, or second_half"),
  duration: DurationZod.default(DurationZod.options[0]).describe("Length of session: 15, 30, 45, or 60 minutes"),
  timeSlot: TimeSlotZodSchema.optional().describe("More specific time window from bell schedule - not used currently"),

  // event-specific metadata
  orderIndex: z.number().optional().default(0).describe("Sequence order within visit (1, 2, 3...)"),
  notes: z.string().optional().default(''),
});

// =====================================
// SESSION LINK SCHEMA
// =====================================

export const SessionLinkFieldsSchema = z.object({
  purpose: z.string().describe("Purpose of the linked resource"),
  title: z.string().describe("Display title for the link"),
  url: z.string().url().describe("Valid URL to external resource or document"),
  staffIds: z.array(z.string()).describe("Array of Staff document _ids who should access this link"),
});

// =====================================
// VISIT SCHEMA (Updated for New Schedule Flow)
// =====================================

export const VisitFieldsSchema = z.object({
  // Primary relationships
  coachingActionPlanId: z.string().describe("Reference to CoachingActionPlan document _id - PRIMARY AGGREGATE"),
  date: z.string().optional().describe("ISO string for system timestamp"),
  schoolId: z.string().describe("Reference to School document _id where visit occurs"),
  coachId: z.string().describe("Reference to Staff document _id of the coach conducting visit"),
  
  // Optional relationships
  cycleId: z.string().optional().describe("Reference to Cycle document _id for coaching cycle"),
  teacherId: z.string().optional().describe("Primary teacher for this visit (most common from schedule events)"),
  
  // Visit metadata
  allowedPurpose: AllowedPurposeZod.optional().describe("Visit type: Initial Walkthrough, Regular Visit, or Final Walkthrough"),
  modeDone: ModeDoneZod.optional().describe("Visit format: In-Person, Virtual, or Hybrid"),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).default([]).describe("Grade levels included in this visit"),
  
  // Schedule reference (NEW - replaces embedded events)
  visitScheduleId: z.string().optional().describe("Reference to VisitSchedule document _id for detailed scheduling"),
  
  // Supporting content
  sessionLinks: z.array(SessionLinkFieldsSchema).default([]).describe("External resources and documents"),
  
  // Monday.com integration fields
  mondayItemId: z.string().optional().describe("Monday.com board item ID for bi-directional sync"),
  mondayBoardId: z.string().optional().describe("Monday.com board ID where visit item exists"),
  mondayItemName: z.string().optional().describe("Item name in Monday.com"),
  mondayLastSyncedAt: z.string().optional().describe("Last sync timestamp with Monday.com"),
  
  // Import flexibility fields
  siteAddress: z.string().optional().describe("Physical address for visit location"),
  endDate: z.string().optional().describe("ISO string for system timestamp"),
});

// Visit Full Schema
export const VisitZodSchema = BaseDocumentSchema.merge(VisitFieldsSchema);

// Visit Input Schema
export const VisitInputZodSchema = toInputSchema(VisitZodSchema);

// =====================================
// VISIT REFERENCE SCHEMA
// =====================================

export const VisitReferenceZodSchema = BaseReferenceZodSchema.merge(
  VisitFieldsSchema
    .pick({
      date: true,
      schoolId: true,
      coachId: true,
      allowedPurpose: true,
      modeDone: true,
    })
    .partial()
).extend({
  date: z.string().optional().describe("Date as ISO string or formatted for display"),
  dateFormatted: z.string().optional().describe("Formatted date string"),
  schoolName: z.string().optional().describe("School name (for display)"),
  coachName: z.string().optional().describe("Coach name (for display)"),
  hasSchedule: z.boolean().optional().describe("Whether visit has a schedule"),
  hasCoachingLog: z.boolean().optional().describe("Whether visit has a coaching log"),
});

// =====================================
// VISIT IMPORT SCHEMA
// =====================================

export const VisitImportZodSchema = VisitFieldsSchema.extend({
  // Relax validation for flexible import
  date: z.string().optional().describe("ISO string for system timestamp"),
  schoolId: z.string().optional(),
  coachId: z.string().optional(),
  coachingActionPlanId: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).optional(),
});

// =====================================
// REFERENCE TRANSFORMER
// =====================================

export const visitToReference = createReferenceTransformer<Visit, VisitReference>(
  // Label function: Create display string from date and purpose
  (visit) => {
    if (!visit.date) return 'No date set';
    const dateStr = formatVisitDate(visit.date);
    return visit.allowedPurpose ? `${dateStr} - ${visit.allowedPurpose}` : dateStr;
  },
  
  // Additional fields function
  (visit) => {
    const date = visit.date ? new Date(visit.date) : undefined;
    return {
      date: date ? date.toISOString() : undefined,
      schoolId: visit.schoolId,
      coachId: visit.coachId,
      allowedPurpose: visit.allowedPurpose,
      modeDone: visit.modeDone,
      dateFormatted: date ? formatVisitDate(date) : undefined,
      hasSchedule: !!visit.visitScheduleId,
      hasCoachingLog: false, // This would need to be populated from related data
    };
  },
  
  // Validation schema
  VisitReferenceZodSchema
);

// Array transformer
export const visitsToReferences = createArrayTransformer<Visit, VisitReference>(
  visitToReference
);

// =====================================
// TYPE EXPORTS
// =====================================

export type TimeSlot = z.infer<typeof TimeSlotZodSchema>;
export type EventItem = z.infer<typeof EventItemZodSchema>;
export type SessionLink = z.infer<typeof SessionLinkFieldsSchema>;
export type VisitInput = z.infer<typeof VisitInputZodSchema>;
export type Visit = z.infer<typeof VisitZodSchema>;
export type VisitReference = z.infer<typeof VisitReferenceZodSchema>;
export type VisitImport = z.infer<typeof VisitImportZodSchema>;

// =====================================
// HELPER FUNCTIONS
// =====================================

export function createVisitDefaults(overrides: Partial<VisitInput> = {}): VisitInput {
  return {
    coachingActionPlanId: '',
    date: new Date().toISOString(),
    schoolId: '',
    coachId: '',
    gradeLevelsSupported: [],
    sessionLinks: [],
    ...overrides
  };
}