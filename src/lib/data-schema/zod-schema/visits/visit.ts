import { z } from "zod";
import { 
  GradeLevelsSupportedZod, 
  EventTypeZod, 
  DurationZod,
  AllowedPurposeZod,
  ModeDoneZod
} from "@enums";
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';
import { zDateField } from '@zod-schema/shared/dateHelpers';

// Event Item Schema (shared schema)
export const EventItemZodSchema = z.object({
  eventType: EventTypeZod, // Enum for event type
  staff: z.array(z.string()), // Array of staff IDs
  duration: DurationZod, // Enum for duration with string->number transform
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

// Visit Import Schema with relaxed validation for initial import
export const VisitImportZodSchema = VisitFieldsSchema.extend({
  // Make multiple fields optional for flexible import
  date: zDateField.optional(),
  school: z.string().optional(),
  coach: z.string().optional(),
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod).optional(),
});

// Auto-generate TypeScript types
export type EventItem = z.infer<typeof EventItemZodSchema>;
export type SessionLink = z.infer<typeof SessionLinkZodSchema>;
export type VisitInput = z.infer<typeof VisitInputZodSchema>;
export type Visit = z.infer<typeof VisitZodSchema>;
export type VisitImport = z.infer<typeof VisitImportZodSchema>;