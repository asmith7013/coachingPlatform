"use server";

import { z } from "zod";
import { withDbConnection } from "@server/db/ensure-connection";
import { Attendance313 } from "@mongoose-schema/313/student/attendance.model";
import { StudentModel } from "@mongoose-schema/313/student/student.model";
import { AttendanceStatusSchema, type AttendanceInput } from "@zod-schema/313/student/attendance";
import { handleServerError } from "@error/handlers/server";

// =====================================
// INPUT SCHEMAS
// =====================================

/**
 * Schema for a single day's attendance data from Podsie sync format
 */
const DayAttendanceSchema = z.object({
  attendanceStatus: AttendanceStatusSchema.nullable(),
  blockType: z.enum(['single', 'double']),
  masteryChecksPassed: z.number().int().nonnegative(),
});

/**
 * Schema for the import JSON format (matches Podsie sync format)
 */
const AttendanceImportSchema = z.object({
  success: z.boolean(),
  data: z.object({
    group: z.object({
      id: z.number(),
      name: z.string(),
    }),
    dateRange: z.object({
      startDate: z.string(),
      endDate: z.string(),
    }),
    matrix: z.record(
      z.string().email(), // email keys
      z.record(
        z.string(), // date keys (YYYY-MM-DD)
        DayAttendanceSchema
      )
    ),
  }),
});

// type AttendanceImportData = z.infer<typeof AttendanceImportSchema>;

// =====================================
// IMPORT ACTIONS
// =====================================

/**
 * Import attendance data from Podsie sync format
 *
 * Note: Days with null attendanceStatus are recorded as "not-tracked"
 * This allows us to still track masteryChecksPassed even when attendance wasn't recorded
 */
export async function importAttendanceData(jsonData: unknown) {
  return withDbConnection(async () => {
    try {
      // Validate input
      const validated = AttendanceImportSchema.parse(jsonData);

      if (!validated.success) {
        return {
          success: false,
          error: "Invalid data format: success field is false",
        };
      }

      const { matrix, group } = validated.data;

      // Extract section from group name (e.g., "802 - Alg 1" -> "802")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const section = group.name.split(' ')[0] as any; // Cast to any since we're extracting from dynamic data

      // Build list of attendance records to upsert
      const attendanceRecords: AttendanceInput[] = [];
      const errors: string[] = [];

      // Get all student emails to look up studentIds (case-insensitive)
      const emails = Object.keys(matrix);

      // Use case-insensitive regex to match emails in the database
      const emailRegexes = emails.map(email => new RegExp(`^${email}$`, 'i'));
      const students = await StudentModel.find({
        email: { $in: emailRegexes }
      }).lean();

      // Create case-insensitive email lookup map
      // Store with lowercase keys for case-insensitive matching
      const emailToStudentId = new Map<string, number>(
        students.map(s => [
          String(s.email).toLowerCase(),
          Number(s.studentID)
        ])
      );

      // Parse through matrix
      let notTrackedCount = 0;

      for (const [email, dateData] of Object.entries(matrix)) {
        // Use lowercase for lookup to handle case-insensitive matching
        const studentId = emailToStudentId.get(email.toLowerCase());

        if (!studentId) {
          errors.push(`Student not found for email: ${email}`);
          continue;
        }

        for (const [date, dayData] of Object.entries(dateData)) {
          // Determine status: if null, mark as "not-tracked"
          const status = dayData.attendanceStatus ?? ('not-tracked' as const);

          if (status === 'not-tracked') {
            notTrackedCount++;
          }

          attendanceRecords.push({
            studentId,
            email,
            date,
            status,
            section,
            blockType: dayData.blockType,
            syncedFrom: 'podsie' as const,
            lastSyncedAt: new Date().toISOString(),
            ownerIds: [],
          });
        }
      }

      // Bulk upsert (update if exists, insert if not)
      let updatedCount = 0;
      let createdCount = 0;

      for (const record of attendanceRecords) {
        const result = await Attendance313.updateOne(
          { studentId: record.studentId, date: record.date },
          { $set: record },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          createdCount++;
        } else if (result.modifiedCount > 0) {
          updatedCount++;
        }
      }

      return {
        success: true,
        data: {
          totalProcessed: attendanceRecords.length,
          created: createdCount,
          updated: updatedCount,
          notTracked: notTrackedCount,
          errors: errors.length > 0 ? errors : undefined,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          error: `Validation error: ${error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
        };
      }
      return {
        success: false,
        error: handleServerError(error, "Failed to import attendance data"),
      };
    }
  });
}

// =====================================
// QUERY ACTIONS
// =====================================

/**
 * Get attendance records for a date range
 */
export async function getAttendanceByDateRange(
  startDate: string,
  endDate: string,
  section?: string
) {
  return withDbConnection(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {
        date: { $gte: startDate, $lte: endDate },
      };

      if (section) {
        query.section = section;
      }

      const records = await Attendance313.find(query)
        .sort({ date: 1, studentId: 1 })
        .lean();

      return {
        success: true,
        data: records.map(r => ({
          ...r,
          _id: r._id.toString(),
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch attendance data"),
      };
    }
  });
}

/**
 * Get attendance records for a specific student
 */
export async function getAttendanceByStudent(studentId: number) {
  return withDbConnection(async () => {
    try {
      const records = await Attendance313.find({ studentId })
        .sort({ date: -1 })
        .lean();

      return {
        success: true,
        data: records.map(r => ({
          ...r,
          _id: r._id.toString(),
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch student attendance"),
      };
    }
  });
}

/**
 * Get attendance summary for a student
 * Note: 'not-tracked' is treated as 'present' for attendance rate calculations
 */
export async function getAttendanceSummary(studentId: number) {
  return withDbConnection(async () => {
    try {
      const records = await Attendance313.find({ studentId }).lean();

      const totalDays = records.length;
      const presentDays = records.filter(r => r.status === 'present').length;
      const absentDays = records.filter(r => r.status === 'absent').length;
      const lateDays = records.filter(r => r.status === 'late').length;
      const notTrackedDays = records.filter(r => r.status === 'not-tracked').length;

      // For attendance rate, treat 'not-tracked' as present (assumption: they were there if school was in session)
      const effectivePresentDays = presentDays + notTrackedDays;
      const attendanceRate = totalDays > 0 ? (effectivePresentDays / totalDays) * 100 : 0;

      return {
        success: true,
        data: {
          studentId,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          notTrackedDays,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to calculate attendance summary"),
      };
    }
  });
}
