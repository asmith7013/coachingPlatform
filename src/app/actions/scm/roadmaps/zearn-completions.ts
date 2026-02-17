"use server";

import { z } from "zod";
import { handleServerError } from "@/lib/error/handlers/server";
import { withDbConnection } from "@/lib/server/db/ensure-connection";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { EntityResponse, PaginatedResponse } from "@/lib/types/core/response";
import { ScraperEmailService } from "@/lib/email/email-notifications";
import fs from "fs/promises";

// Schema for parsing Zearn completion data
const ZearnCompletionRowSchema = z.object({
  school: z.string(),
  class: z.string(),
  classGrade: z.string(),
  sisId: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  studentGrade: z.string(),
  lesson: z.string(),
  completionDate: z.string(),
});

type ZearnCompletionRow = z.infer<typeof ZearnCompletionRowSchema>;

// Type for the history page display
export type ZearnHistoryRow = {
  studentId: string;
  studentName: string;
  section: string;
  lessonCode: string;
  completionDate: string;
  grade: string;
  module: string;
};

/**
 * Parse tab-separated Zearn data and import into student records
 * Adds unique lessons to each student's zearnLessons array
 */
export async function importZearnCompletions(
  rawData: string,
): Promise<
  EntityResponse<{ imported: number; skipped: number; errors: string[] }>
> {
  return withDbConnection(async () => {
    try {
      const lines = rawData.trim().split("\n");

      // Skip header row
      if (lines.length < 2) {
        return {
          success: false,
          error: "No data rows found",
          data: { imported: 0, skipped: 0, errors: [] },
        };
      }

      // Save CSV file locally (development only)
      if (process.env.NODE_ENV !== "production") {
        try {
          // Convert TSV back to CSV format
          const csvData = lines
            .map((line) => {
              const parts = line.split("\t");
              // Wrap fields in quotes and join with commas
              return parts.map((field) => `"${field}"`).join(",");
            })
            .join("\n");

          const localFilePath =
            "/Users/alexsmith/Documents/GitHub/tl-connect/scripts/zearn.csv";
          await fs.writeFile(localFilePath, csvData, "utf-8");
          console.log(`✓ Saved CSV file to: ${localFilePath}`);
        } catch (fileError) {
          // Log error but don't fail the import
          console.warn("Failed to save CSV file locally:", fileError);
        }
      }

      // Parse all rows
      const rows: ZearnCompletionRow[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split("\t");
        if (parts.length < 9) {
          parseErrors.push(
            `Row ${i + 1}: Not enough columns (expected 9, got ${parts.length})`,
          );
          continue;
        }

        try {
          const row = ZearnCompletionRowSchema.parse({
            school: parts[0],
            class: parts[1],
            classGrade: parts[2],
            sisId: parts[3],
            lastName: parts[4],
            firstName: parts[5],
            studentGrade: parts[6],
            lesson: parts[7],
            completionDate: parts[8],
          });
          rows.push(row);
        } catch {
          parseErrors.push(`Row ${i + 1}: Invalid data format`);
        }
      }

      // Group by student SIS ID
      const studentLessons = new Map<
        string,
        { lessons: Array<{ lessonCode: string; completionDate: string }> }
      >();

      for (const row of rows) {
        if (!studentLessons.has(row.sisId)) {
          studentLessons.set(row.sisId, { lessons: [] });
        }

        const studentData = studentLessons.get(row.sisId)!;

        // Check if this lesson already exists for this student (in this import batch)
        const existingLesson = studentData.lessons.find(
          (l) => l.lessonCode === row.lesson,
        );
        if (!existingLesson) {
          studentData.lessons.push({
            lessonCode: row.lesson,
            completionDate: row.completionDate,
          });
        }
      }

      // Update students in database
      let imported = 0;
      let skipped = 0;
      const missingStudents: Array<{
        sisId: string;
        firstName?: string;
        lastName?: string;
      }> = [];

      // Get student names from the first row with each SIS ID
      const studentNames = new Map<
        string,
        { firstName: string; lastName: string }
      >();
      for (const row of rows) {
        if (!studentNames.has(row.sisId)) {
          studentNames.set(row.sisId, {
            firstName: row.firstName,
            lastName: row.lastName,
          });
        }
      }

      for (const [sisId, data] of studentLessons) {
        const studentID = parseInt(sisId, 10);
        if (isNaN(studentID)) {
          parseErrors.push(`Invalid SIS ID: ${sisId}`);
          skipped++;
          continue;
        }

        // Find student and update zearnLessons
        const student = await StudentModel.findOne({ studentID });

        if (!student) {
          const names = studentNames.get(sisId);
          missingStudents.push({
            sisId,
            firstName: names?.firstName,
            lastName: names?.lastName,
          });
          parseErrors.push(`Student not found: ${sisId}`);
          skipped++;
          continue;
        }

        // Get existing lessons
        const existingLessons = (student.zearnLessons ||
          []) as unknown as Array<{
          lessonCode: string;
          completionDate: string;
        }>;
        const existingCodes = new Set(existingLessons.map((l) => l.lessonCode));

        // Add only new lessons
        const newLessons = data.lessons.filter(
          (l) => !existingCodes.has(l.lessonCode),
        );

        if (newLessons.length > 0) {
          await StudentModel.updateOne(
            { studentID },
            {
              $push: {
                zearnLessons: {
                  $each: newLessons,
                },
              },
            },
          );
          imported += newLessons.length;
        }
      }

      // Send email notification if there are missing students
      if (missingStudents.length > 0) {
        const emailService = new ScraperEmailService();
        await emailService.sendMissingStudentsNotification({
          source: "zearn",
          missingStudents,
          totalProcessed: rows.length,
          timestamp: new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          }),
        });
      }

      return {
        success: true,
        data: {
          imported,
          skipped,
          errors: parseErrors,
        },
        message: `Imported ${imported} Zearn lessons, skipped ${skipped} students`,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "importZearnCompletions"),
        data: { imported: 0, skipped: 0, errors: [] },
      };
    }
  });
}

// Type for the student data from MongoDB
type StudentWithZearn = {
  studentID: number;
  firstName: string;
  lastName: string;
  section: string;
  zearnLessons: Array<{
    lessonCode: string;
    completionDate: string;
  }>;
};

/**
 * Fetch all Zearn completions for history page display
 * Returns flattened array of all student lesson completions
 */
export async function fetchZearnCompletions(): Promise<
  PaginatedResponse<ZearnHistoryRow>
> {
  return withDbConnection(async () => {
    try {
      // Fetch all active students with zearnLessons
      const students = (await StudentModel.find(
        { active: true, "zearnLessons.0": { $exists: true } },
        {
          studentID: 1,
          firstName: 1,
          lastName: 1,
          section: 1,
          zearnLessons: 1,
        },
      ).lean()) as unknown as StudentWithZearn[];

      // Flatten into rows
      const rows: ZearnHistoryRow[] = [];

      for (const student of students) {
        const studentName = `${student.lastName}, ${student.firstName}`;

        for (const lesson of student.zearnLessons || []) {
          // Parse lesson code to extract grade and module
          // Format: "G8 M2 L1" or "G3 M1 L10"
          const lessonMatch = lesson.lessonCode.match(
            /G(\d+)\s+M(\d+)\s+L(\d+)/,
          );
          const grade = lessonMatch ? lessonMatch[1] : "";
          const moduleNum = lessonMatch ? lessonMatch[2] : "";

          rows.push({
            studentId: student.studentID.toString(),
            studentName,
            section: student.section,
            lessonCode: lesson.lessonCode,
            completionDate: lesson.completionDate,
            grade,
            module: moduleNum,
          });
        }
      }

      // Sort by completion date (most recent first)
      rows.sort((a, b) => {
        // Parse dates (handle MM/DD/YY format)
        const parseDate = (dateStr: string): Date => {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            const month = parseInt(parts[0], 10) - 1;
            const day = parseInt(parts[1], 10);
            let year = parseInt(parts[2], 10);
            // Handle 2-digit year
            if (year < 100) {
              year += year < 50 ? 2000 : 1900;
            }
            return new Date(year, month, day);
          }
          return new Date(dateStr);
        };

        const dateA = parseDate(a.completionDate);
        const dateB = parseDate(b.completionDate);
        return dateB.getTime() - dateA.getTime();
      });

      return {
        success: true,
        items: rows,
        total: rows.length,
        page: 1,
        limit: rows.length,
        totalPages: 1,
        hasMore: false,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "fetchZearnCompletions"),
        items: [],
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0,
        hasMore: false,
      };
    }
  });
}
