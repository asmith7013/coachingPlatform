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
import { zDateField } from '@zod-schema/shared/dateHelpers';
import { formatVisitDate } from "@schema/reference/visits/visit-helpers";

// Time Slot Schema (reusable component)
export const TimeSlotZodSchema = z.object({
  startTime: z.string().describe("24-hour format time: 'HH:MM' (e.g., '08:30')"),
  endTime: z.string().describe("24-hour format time: 'HH:MM' (e.g., '09:15')"),
  periodNum: z.number().optional().describe("Period number for bell schedule alignment (1-8)"),
});

export const VisitPortionZod = ScheduleAssignmentTypeZod;

export const EventItemZodSchema = z.object({
  eventType: SessionPurposeZod.describe("Type of coaching session: Observation, Debrief, Co-Planning, or PLC"),
  staffIds: z.array(z.string()).describe("Array of Staff document _ids participating in this event"),
  duration: DurationZod.describe("Length of session: 15, 30, 45, or 60 minutes"),
  
  // ADD: Scheduling fields that were in PlannedVisit
  timeSlot: TimeSlotZodSchema.optional().describe("Specific time window for this event"),
  purpose: SessionPurposeZod.optional().describe("Override purpose if different from eventType"),
  periodNumber: z.number().optional().describe("Bell schedule period number (1-8)"),
  portion: VisitPortionZod.optional().describe("Schedule portion: full_period, first_half, or second_half"),
  
  // ADD: Event-specific metadata
  orderIndex: z.number().optional().describe("Sequence order within visit (1, 2, 3...)"),
  notes: z.string().optional(),
});

// Session Link Schema (shared schema)
export const SessionLinkZodSchema = z.object({
  purpose: z.string(),
  title: z.string(),
  url: z.string().url().describe("Valid URL to external resource or document"),
  staffIds: z.array(z.string()).describe("Array of Staff document _ids who should access this link"),
});

// Visit Fields Schema
export const VisitFieldsSchema = z.object({
  date: zDateField,
  schoolId: z.string().describe("Reference to School document _id where visit occurs"),
  coachId: z.string().describe("Reference to Staff document _id of the coach conducting visit"),
  cycleId: z.string().optional().describe("Reference to Cycle document _id for coaching cycle"),
  allowedPurpose: AllowedPurposeZod.optional().describe("Visit type: Initial Walkthrough, Regular Visit, or Final Walkthrough"),
  modeDone: ModeDoneZod.optional().describe("Visit format: In-Person, Virtual, or Hybrid"),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).describe("Grade levels included in this visit"),
  events: z.array(EventItemZodSchema).optional(),
  sessionLinks: z.array(SessionLinkZodSchema).optional(),

  // Planned schedule integration (Task 1.2: Visit model extension)
  plannedScheduleId: z.string().optional().describe("Reference to planned schedule from Schedule Builder"),

  // Monday.com integration fields
  mondayItemId: z.string().optional().describe("Monday.com board item ID for bi-directional sync"),
  mondayBoardId: z.string().optional().describe("Monday.com board ID where visit item exists"),
  mondayItemName: z.string().optional().describe("Visit name as stored in Monday.com"),
  mondayLastSyncedAt: zDateField.optional().describe("Timestamp of most recent Monday.com synchronization"),
  
  // Optional fields for data that might be imported from Monday
  // but doesn't map directly to core schema fields
  siteAddress: z.string().optional(),
  endDate: zDateField.optional(),
});

// Visit Full Schema
export const VisitZodSchema = BaseDocumentSchema.merge(VisitFieldsSchema);

// Visit Input Schema
export const VisitInputZodSchema = toInputSchema(VisitZodSchema);

// Visit Reference Schema
export const VisitReferenceZodSchema = BaseReferenceZodSchema.merge(
  z.object({
    date: zDateField.optional(),
    schoolId: z.string().optional(),
    coachId: z.string().optional(),
    allowedPurpose: AllowedPurposeZod.optional(),
    modeDone: ModeDoneZod.optional(),
  })
).extend({
  dateFormatted: z.string().optional().describe("Formatted date string"),
  schoolName: z.string().optional().describe("School name (for display)"),
  coachName: z.string().optional().describe("Coach name (for display)"),
  eventsCount: z.number().optional().describe("Number of events"),
  hasCoachingLog: z.boolean().optional().describe("Whether visit has a coaching log"),
});

// Visit Import Schema with relaxed validation for initial import
export const VisitImportZodSchema = VisitFieldsSchema.extend({
  // Make multiple fields optional for flexible import
  date: zDateField.optional(),
  schoolId: z.string().optional(),
  coachId: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).optional(),
});

// Visit Reference Transformer
export const visitToReference = createReferenceTransformer<Visit, VisitReference>(
  // Label function: Create display string from date and purpose
  (visit) => {
    if (!visit.date) return 'No date set';
    const dateStr = formatVisitDate(visit.date);
    return visit.allowedPurpose ? `${dateStr} - ${visit.allowedPurpose}` : dateStr;
  },
  
  // Additional fields function
  (visit) => {
    const date = visit.date instanceof Date ? visit.date : visit.date ? new Date(visit.date) : undefined;
    return {
      date: date as Date | undefined,
      schoolId: visit.schoolId,
      coachId: visit.coachId,
      allowedPurpose: visit.allowedPurpose,
      modeDone: visit.modeDone,
      dateFormatted: date ? formatVisitDate(date) : undefined,
      eventsCount: visit.events?.length || 0,
      hasCoachingLog: false, // This would need to be populated from related data
    };
  },
  
  // Validation schema
  VisitReferenceZodSchema as z.ZodType<VisitReference>
);

// Array transformer
export const visitsToReferences = createArrayTransformer<Visit, VisitReference>(
  visitToReference
);

// Auto-generate TypeScript types
export type TimeSlot = z.infer<typeof TimeSlotZodSchema>;
export type EventItem = z.infer<typeof EventItemZodSchema>;
export type SessionLink = z.infer<typeof SessionLinkZodSchema>;
export type VisitInput = z.infer<typeof VisitInputZodSchema>;
export type Visit = z.infer<typeof VisitZodSchema>;
export type VisitReference = z.infer<typeof VisitReferenceZodSchema>;
export type VisitImport = z.infer<typeof VisitImportZodSchema>;