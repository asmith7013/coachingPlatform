import { z } from "zod";
import { 
  GradeLevelsSupportedZod, 
  EventTypeZod, 
  DurationZod,
  AllowedPurposeZod,
  ModeDoneZod
} from "@data-schema/enum";
import { zDateField } from '@zod-schema/shared/dateHelpers';

export const EventItemZodSchema = z.object({
  eventType: EventTypeZod, // Enum for event type
  staff: z.array(z.string()), // Array of staff IDs
  duration: DurationZod, // Enum for duration with string->number transform
});

export const SessionLinkZodSchema = z.object({
  purpose: z.string(), // Required purpose
  title: z.string(), // Required title
  url: z.string().url(), // Required valid URL
  staff: z.array(z.string()), // Array of staff IDs
});

// New Input Schema
export const VisitInputZodSchema = z.object({
  date: z.string(), // Required date string
  school: z.string(), // Required school ID
  coach: z.string(), // Required coach ID
  cycleRef: z.string(), // Required cycle reference
  allowedPurpose: AllowedPurposeZod.optional(), // Optional enum
  modeDone: ModeDoneZod.optional(), // Optional enum
  gradeLevelsSupported: z.array(GradeLevelsSupportedZod), // Array of grade levels
  events: z.array(EventItemZodSchema).optional(), // Optional array of events
  sessionLinks: z.array(SessionLinkZodSchema).optional(), // Optional array of session links
  owners: z.array(z.string()), // Array of owner IDs
});

// Full Schema extends Input Schema
export const VisitZodSchema = VisitInputZodSchema.extend({
  _id: z.string(), // Required in full schema
  createdAt: zDateField.optional(),
  updatedAt: zDateField.optional(),
});

// Update type definition
export type VisitInput = z.infer<typeof VisitInputZodSchema>;
export type Visit = z.infer<typeof VisitZodSchema>;