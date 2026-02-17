"use server";

import { StudentActivityModel } from "@mongoose-schema/scm/student/student-activity.model";
import { ScopeAndSequenceModel } from "@mongoose-schema/scm/scope-and-sequence/scope-and-sequence.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// =====================================
// FETCH ACTIVITY DATA
// =====================================

export interface ActivityDataFilters {
  section?: string;
  unitId?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
  studentId?: string;
}

export interface StudentActivityRecord {
  _id: string;
  studentId: string;
  studentName: string;
  section: string;
  gradeLevel: string;
  activityDate: string;
  loggedAt?: string;
  activityType: string;
  activityLabel: string;
  unitId?: string;
  unitTitle?: string;
  lessonId?: string;
  lessonName?: string;
  skillId?: string;
  inquiryQuestion?: string;
  customDetail?: string;
  loggedBy?: string;
}

/**
 * Fetch all activity data with optional filters
 * NOW QUERIES student-activities collection instead of embedded arrays
 */
export async function fetchActivityData(
  filters: ActivityDataFilters = {},
): Promise<{
  success: boolean;
  data?: StudentActivityRecord[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      console.log("🔵 [fetchActivityData] Called with filters:", filters);

      // Build MongoDB query for student-activities collection
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: any = {
        gradeLevel: "8",
      };

      if (filters.section) {
        query.section = filters.section;
      }

      if (filters.studentId) {
        query.studentId = filters.studentId;
      }

      if (filters.activityType) {
        query.activityType = filters.activityType;
      }

      if (filters.unitId) {
        query.unitId = filters.unitId;
      }

      if (filters.startDate || filters.endDate) {
        query.date = {};
        if (filters.startDate) {
          query.date.$gte = filters.startDate;
        }
        if (filters.endDate) {
          query.date.$lte = filters.endDate;
        }
      }

      console.log(
        "🔵 [fetchActivityData] MongoDB query:",
        JSON.stringify(query, null, 2),
      );

      // Fetch activities from dedicated collection
      const activities = await StudentActivityModel.find(query).sort({
        date: -1,
        studentName: 1,
      });

      console.log(
        "🔵 [fetchActivityData] Found activities:",
        activities.length,
      );

      // Extract unique lesson IDs to fetch lesson names
      const lessonIds = [
        ...new Set(
          activities.map((a) => a.lessonId).filter((id): id is string => !!id),
        ),
      ];

      // Fetch lesson names if there are any lesson IDs
      const lessonMap = new Map<string, string>();
      if (lessonIds.length > 0) {
        interface LessonData {
          _id: { toString: () => string };
          lessonName: string;
        }

        const lessons = (await ScopeAndSequenceModel.find({
          _id: { $in: lessonIds },
        })
          .select("_id lessonName")
          .lean()) as unknown as LessonData[];

        lessons.forEach((lesson) => {
          lessonMap.set(lesson._id.toString(), lesson.lessonName);
        });
      }

      // Convert to plain objects
      const records: StudentActivityRecord[] = activities.map((activity) => {
        const activityData = activity.toJSON();
        return {
          _id: activityData._id.toString(),
          studentId: activityData.studentId,
          studentName: activityData.studentName,
          section: activityData.section,
          gradeLevel: activityData.gradeLevel,
          activityDate: activityData.date,
          loggedAt: activityData.loggedAt,
          activityType: activityData.activityType,
          activityLabel: activityData.activityLabel,
          unitId: activityData.unitId,
          lessonId: activityData.lessonId,
          lessonName: activityData.lessonId
            ? lessonMap.get(activityData.lessonId)
            : undefined,
          skillId: activityData.skillId,
          inquiryQuestion: activityData.inquiryQuestion,
          customDetail: activityData.customDetail,
          loggedBy: activityData.loggedBy,
        };
      });

      return { success: true, data: records };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch activity data"),
      };
    }
  });
}

/**
 * Get activity summary statistics
 */
export async function getActivitySummary(
  filters: ActivityDataFilters = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ success: boolean; data?: any; error?: string }> {
  return withDbConnection(async () => {
    try {
      const result = await fetchActivityData(filters);

      if (typeof result === "string" || !result.success || !result.data) {
        return {
          success: false,
          error:
            typeof result !== "string" && result.error
              ? result.error
              : "Failed to fetch data",
        };
      }

      const records = result.data as StudentActivityRecord[];

      // Calculate statistics
      const totalActivities = records.length;
      const uniqueStudents = new Set(records.map((r) => r.studentId)).size;

      // Activities by type
      const byType: { [key: string]: number } = {};
      records.forEach((r) => {
        byType[r.activityLabel] = (byType[r.activityLabel] || 0) + 1;
      });

      // Activities by date
      const byDate: { [key: string]: number } = {};
      records.forEach((r) => {
        byDate[r.activityDate] = (byDate[r.activityDate] || 0) + 1;
      });

      // Activities by student
      const byStudent: { [key: string]: number } = {};
      records.forEach((r) => {
        byStudent[r.studentName] = (byStudent[r.studentName] || 0) + 1;
      });

      // Top 10 most active students
      const topStudents = Object.entries(byStudent)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      return {
        success: true,
        data: {
          totalActivities,
          uniqueStudents,
          byType,
          byDate,
          topStudents,
          dateRange:
            records.length > 0
              ? {
                  earliest: records[records.length - 1].activityDate,
                  latest: records[0].activityDate,
                }
              : null,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to calculate summary"),
      };
    }
  });
}

/**
 * Export activity data as CSV
 */
export async function exportActivityDataAsCSV(
  filters: ActivityDataFilters = {},
): Promise<{ success: boolean; data?: string; error?: string }> {
  return withDbConnection(async () => {
    try {
      const result = await fetchActivityData(filters);

      if (typeof result === "string" || !result.success || !result.data) {
        return {
          success: false,
          error:
            typeof result !== "string" && result.error
              ? result.error
              : "Failed to fetch data",
        };
      }

      const records = result.data as StudentActivityRecord[];

      // Generate CSV header
      const headers = [
        "Student Name",
        "Section",
        "Date",
        "Activity Type",
        "Unit ID",
        "Inquiry Question",
        "Lesson Name",
        "Skill ID",
        "Custom Detail",
        "Logged By",
      ];

      // Generate CSV rows
      const rows = records.map((r) => [
        r.studentName,
        r.section,
        r.activityDate,
        r.activityLabel,
        r.unitId || "",
        r.inquiryQuestion || "",
        r.lessonName || "",
        r.skillId || "",
        r.customDetail || "",
        r.loggedBy || "",
      ]);

      // Escape CSV values
      const escapeCSV = (value: string) => {
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      // Build CSV string
      const csvLines = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map((v) => escapeCSV(v.toString())).join(",")),
      ];

      const csv = csvLines.join("\n");

      return { success: true, data: csv };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to export CSV"),
      };
    }
  });
}

/**
 * Update a single activity by ID
 */
export async function updateActivity(
  activityId: string,
  updates: {
    activityDate?: string;
    activityType?: string;
    activityLabel?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      const updateData: {
        date?: string;
        activityType?: string;
        activityLabel?: string;
      } = {};

      if (updates.activityDate !== undefined) {
        updateData.date = updates.activityDate;
      }
      if (updates.activityType !== undefined) {
        updateData.activityType = updates.activityType;
      }
      if (updates.activityLabel !== undefined) {
        updateData.activityLabel = updates.activityLabel;
      }

      const result = await StudentActivityModel.findByIdAndUpdate(
        activityId,
        { $set: updateData },
        { new: true },
      );

      if (!result) {
        return { success: false, error: "Activity not found" };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update activity"),
      };
    }
  });
}

/**
 * Delete a single activity by ID
 */
export async function deleteActivity(
  activityId: string,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      const result = await StudentActivityModel.findByIdAndDelete(activityId);

      if (!result) {
        return { success: false, error: "Activity not found" };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to delete activity"),
      };
    }
  });
}
