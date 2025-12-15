// src/lib/schema/zod-schema/timesheet/timesheet-entry.ts
import { z } from 'zod';
import { BaseDocumentSchema, toInputSchema } from '@zod-schema/base-schemas';

// === TIMESHEET ENTRY SCHEMA ===

/**
 * Fields specific to a timesheet entry
 * Each entry represents a single row from the timesheet form
 */
export const TimesheetEntryFieldsSchema = z.object({
  // Date of the work (YYYY-MM-DD format)
  date: z.string().describe("Date of the work in YYYY-MM-DD format"),

  // Task - the type of work performed (captured from dropdown)
  task: z.string().describe("The task/activity type from the form"),

  // Project - the project this work was for (captured from dropdown)
  project: z.string().describe("The project name from the form"),

  // Hours worked
  hours: z.number().min(0).describe("Number of hours worked"),

  // Hourly rate
  rate: z.number().min(0).describe("Hourly rate in dollars"),

  // Calculated total pay (hours * rate)
  totalPay: z.number().min(0).describe("Total pay for this entry (hours * rate)"),

  // Metadata
  submittedAt: z.string().optional().describe("When the entry was submitted to the external system"),
});

/**
 * Full timesheet entry schema with base document fields
 */
export const TimesheetEntryZodSchema = BaseDocumentSchema.merge(TimesheetEntryFieldsSchema);

/**
 * Input schema for creating new timesheet entries (excludes auto-generated fields)
 */
export const TimesheetEntryInputZodSchema = toInputSchema(TimesheetEntryZodSchema);

/**
 * API input schema - what the Chrome extension will send
 * Does not include totalPay as it will be calculated server-side
 */
export const TimesheetEntryApiInputSchema = z.object({
  date: z.string().describe("Date of the work in YYYY-MM-DD format"),
  task: z.string().describe("The task/activity type from the form"),
  project: z.string().describe("The project name from the form"),
  hours: z.number().min(0).describe("Number of hours worked"),
  rate: z.number().min(0).optional().default(75).describe("Hourly rate in dollars (default: 75)"),
});

/**
 * Schema for batch submission from Chrome extension
 * Allows submitting multiple entries at once
 */
export const TimesheetBatchInputSchema = z.object({
  entries: z.array(TimesheetEntryApiInputSchema).min(1).describe("Array of timesheet entries"),
  apiKey: z.string().describe("API key for authentication"),
});

// === TYPE EXPORTS ===
export type TimesheetEntry = z.infer<typeof TimesheetEntryZodSchema>;
export type TimesheetEntryInput = z.infer<typeof TimesheetEntryInputZodSchema>;
export type TimesheetEntryApiInput = z.infer<typeof TimesheetEntryApiInputSchema>;
export type TimesheetBatchInput = z.infer<typeof TimesheetBatchInputSchema>;
