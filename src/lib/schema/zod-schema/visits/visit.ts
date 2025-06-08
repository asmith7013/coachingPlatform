import { z } from "zod";
import { 
  GradeLevelsSupportedZod, 
  EventTypeZod, 
  DurationZod,
  AllowedPurposeZod,
  ModeDoneZod
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { BaseReferenceZodSchema } from '@zod-schema/core-types/reference';
import { createReferenceTransformer, createArrayTransformer } from "@transformers/factories/reference-factory";
import { zDateField } from '@zod-schema/shared/dateHelpers';
import { formatVisitDate } from "@schema/reference/visits/visit-helpers";

// Time Slot Schema (reusable component)
export const TimeSlotZodSchema = z.object({
  startTime: z.string(), // Format: "HH:MM" (24-hour format)
  endTime: z.string(),   // Format: "HH:MM" (24-hour format)
  periodNum: z.number().optional(), // Optional period number for bell schedule alignment
});

export const VisitPortionZod = z.enum(['full_period', 'first_half', 'second_half']);

export const EventItemZodSchema = z.object({
  eventType: EventTypeZod, // Existing: event type
  staff: z.array(z.string()), // Existing: staff IDs
  duration: DurationZod, // Existing: duration
  
  // ADD: Scheduling fields that were in PlannedVisit
  timeSlot: TimeSlotZodSchema.optional(), // Time slot for this specific event
  purpose: z.string().optional(), // Specific purpose for this event
  periodNumber: z.number().optional(), // Period number if relevant
  portion: VisitPortionZod.optional(), // Full/first_half/second_half
  
  // ADD: Event-specific metadata
  orderIndex: z.number().optional(), // Order within the visit schedule
  notes: z.string().optional(), // Event-specific notes
});

// Session Link Schema (shared schema)
export const SessionLinkZodSchema = z.object({
  purpose: z.string(), // Required purpose
  title: z.string(), // Required title
  url: z.string().url(), // Required valid URL
  staff: z.array(z.string()), // Array of staff IDs
});

// Visit Fields Schema
export const VisitFieldsSchema = z.object({
  date: zDateField, // Required date with proper handling
  school: z.string(), // Required school ID
  coach: z.string(), // Required coach ID
  cycleRef: z.string().optional(), // Made optional as requested
  allowedPurpose: AllowedPurposeZod.optional(), // Optional enum
  modeDone: ModeDoneZod.optional(), // Optional enum
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod), // Array of grade levels
  events: z.array(EventItemZodSchema).optional(), // Optional array of events
  sessionLinks: z.array(SessionLinkZodSchema).optional(), // Optional array of session links

  // Planned schedule integration (Task 1.2: Visit model extension)
  plannedScheduleId: z.string().optional(), // Reference to PlannedVisit for schedule builder integration

  // Monday.com integration fields
  mondayItemId: z.string().optional(),
  mondayBoardId: z.string().optional(),
  mondayItemName: z.string().optional(),
  mondayLastSyncedAt: zDateField.optional(),
  
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
    school: z.string().optional(),
    coach: z.string().optional(),
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
  school: z.string().optional(),
  coach: z.string().optional(),
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
      school: visit.school,
      coach: visit.coach,
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