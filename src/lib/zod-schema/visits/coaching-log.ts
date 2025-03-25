import { z } from "zod";

// ✅ ReasonDone Enum
export const ReasonDoneZod = z.enum(["Yes", "No"]);

// ✅ TotalDuration Enum
export const TotalDurationZod = z.enum(["Full day - 6 hours", "Half day - 3 hours"]);

// ✅ SolvesTouchpoint Enum
export const SolvesTouchpointZod = z.enum([
  "Teacher support",
  "Leader support",
  "Teacher OR teacher & leader support",
]);

// ✅ CoachingLog Schema
export const CoachingLogZodSchema = z.object({
  _id: z.string().optional(), // MongoDB auto-generates this
  reasonDone: ReasonDoneZod, // Enum for completion status
  microPLTopic: z.string().optional(), // Optional MicroPL topic
  microPLDuration: z.number().optional(), // Optional duration in minutes
  modelTopic: z.string().optional(), // Optional modeled instruction topic
  modelDuration: z.number().optional(), // Optional duration in minutes
  adminMeet: z.boolean().optional(), // Optional boolean for admin meeting
  adminMeetDuration: z.number().optional(), // Optional duration in minutes
  NYCDone: z.boolean().optional(), // Optional boolean for NYC-specific work
  totalDuration: TotalDurationZod, // Enum for total duration
  solvesTouchpoint: SolvesTouchpointZod, // Enum for coaching focus
  primaryStrategy: z.string(), // Required strategy description
  solvesSpecificStrategy: z.string(), // Required detailed strategy description
  aiSummary: z.string().optional(), // Optional AI-generated summary
  owners: z.array(z.string()), // Array of owner IDs
  createdAt: z.string().optional(), // Optional ISO date string
  updatedAt: z.string().optional(), // Optional ISO date string
});

// ✅ Auto-generate TypeScript types
export type ReasonDone = z.infer<typeof ReasonDoneZod>;
export type TotalDuration = z.infer<typeof TotalDurationZod>;
export type SolvesTouchpoint = z.infer<typeof SolvesTouchpointZod>;
export type CoachingLog = z.infer<typeof CoachingLogZodSchema>;