import { z } from "zod";
import { GradeLevelsSupportedZod, EventTypeZod, DurationZod } from "../shared/shared-types";

// ✅ AllowedPurpose Enum
export const AllowedPurposeZod = z.enum(["Initial Walkthrough", "Visit", "Final Walkthrough"]);

// ✅ ModeDone Enum
export const ModeDoneZod = z.enum(["In-person", "Virtual", "Hybrid"]);

// ✅ EventType Enum
// export const EventTypeZod = z.enum(["observation", "debrief"]);

// ✅ EventItem Schema
export const EventItemZodSchema = z.object({
  eventType: EventTypeZod, // Enum for event type
  staff: z.array(z.string()), // Array of staff IDs
  duration: DurationZod, // Enum for duration
});

// ✅ SessionLink Schema
export const SessionLinkZodSchema = z.object({
  purpose: z.string(), // Required purpose
  title: z.string(), // Required title
  url: z.string().url(), // Required valid URL
  staff: z.array(z.string()), // Array of staff IDs
});

// ✅ Visit Schema
export const VisitZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
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
  createdAt: z.string().optional(), // Optional ISO date string
  updatedAt: z.string().optional(), // Optional ISO date string
});

// ✅ Auto-generate TypeScript types
export type AllowedPurpose = z.infer<typeof AllowedPurposeZod>;
export type ModeDone = z.infer<typeof ModeDoneZod>;
export type EventItem = z.infer<typeof EventItemZodSchema>;
export type SessionLink = z.infer<typeof SessionLinkZodSchema>;
export type Visit = z.infer<typeof VisitZodSchema>;