import { z } from "zod";
import { BaseDocumentSchema, toInputSchema } from "@zod-schema/base-schemas";
import { AllSectionsZod } from "@schema/enum/scm";

// =====================================
// ATTENDANCE STATUS ENUM
// =====================================

/**
 * Attendance status options
 *
 * Note: 'not-tracked' is used for days when attendance wasn't recorded
 * For calculations, assume 'not-tracked' means present if school was in session
 */
export const AttendanceStatusSchema = z
  .enum([
    "present",
    "absent",
    "late",
    "not-tracked", // Used when attendance data wasn't collected for that day
  ])
  .describe("Student attendance status for a given day");

export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

// =====================================
// ATTENDANCE RECORD SCHEMA
// =====================================

/**
 * Daily attendance record for a student
 *
 * Design: Separate collection for efficient querying across students and date ranges
 * - Query by student: Get full attendance history for reports
 * - Query by section/date: Get class roster attendance for a specific day
 * - Query by date range: Analyze attendance trends
 */
export const AttendanceFieldsSchema = z.object({
  studentId: z.number().int().positive().describe("Student ID reference"),
  email: z
    .string()
    .email()
    .describe("Student email for redundancy and querying"),

  date: z.string().describe("Attendance date in ISO format (YYYY-MM-DD)"),
  status: AttendanceStatusSchema.describe("Attendance status for this date"),

  section: AllSectionsZod.describe("Class section identifier"),

  // Optional context
  blockType: z
    .enum(["single", "double"])
    .optional()
    .describe("Block type for this day (single or double period)"),
  notes: z
    .string()
    .optional()
    .describe("Optional notes about attendance (e.g., reason for absence)"),

  // Sync tracking
  syncedFrom: z
    .enum(["podsie", "manual", "import"])
    .optional()
    .describe("Source of attendance data"),
  lastSyncedAt: z.string().optional().describe("Last sync timestamp"),
});

/**
 * Full attendance schema with base document fields
 */
export const AttendanceZodSchema = BaseDocumentSchema.merge(
  AttendanceFieldsSchema,
);

/**
 * Input schema for creating/updating attendance records
 */
export const AttendanceInputZodSchema = toInputSchema(AttendanceZodSchema);

// =====================================
// TYPE EXPORTS
// =====================================

export type AttendanceRecord = z.infer<typeof AttendanceZodSchema>;
export type AttendanceInput = z.infer<typeof AttendanceInputZodSchema>;

// =====================================
// BULK IMPORT SCHEMA
// =====================================

/**
 * Schema for bulk importing attendance (e.g., from CSV or external system)
 */
export const BulkAttendanceImportSchema = z.object({
  records: z.array(AttendanceInputZodSchema),
  overwriteExisting: z
    .boolean()
    .default(false)
    .describe("Whether to overwrite existing records for same student+date"),
});

export type BulkAttendanceImport = z.infer<typeof BulkAttendanceImportSchema>;

// =====================================
// QUERY HELPERS
// =====================================

/**
 * Schema for querying attendance records
 */
export const AttendanceQuerySchema = z.object({
  studentId: z.number().int().positive().optional(),
  section: AllSectionsZod.optional(),
  startDate: z.string().optional().describe("Start of date range (ISO format)"),
  endDate: z.string().optional().describe("End of date range (ISO format)"),
  status: AttendanceStatusSchema.optional(),
});

export type AttendanceQuery = z.infer<typeof AttendanceQuerySchema>;

// =====================================
// ATTENDANCE SUMMARY TYPES
// =====================================

/**
 * Summary statistics for a student's attendance
 */
export const AttendanceSummarySchema = z.object({
  studentId: z.number().int().positive(),
  totalDays: z.number().int().nonnegative(),
  presentDays: z.number().int().nonnegative(),
  absentDays: z.number().int().nonnegative(),
  lateDays: z.number().int().nonnegative(),
  attendanceRate: z
    .number()
    .min(0)
    .max(100)
    .describe("Percentage of days present"),
});

export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>;
