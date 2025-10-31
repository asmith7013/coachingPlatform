"use server";

import { StudentModel } from "@mongoose-schema/313/student.model";
import { StudentActivityModel } from "@mongoose-schema/313/student-activity.model";
import { ActivityTypeConfigModel } from "@mongoose-schema/313/activity-type-config.model";
import { RoadmapUnitModel } from "@mongoose-schema/313/roadmap-unit.model";
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
  studentId: string;
  studentName: string;
  section: string;
  gradeLevel: string;
  activityDate: string;
  activityType: string;
  activityLabel: string;
  unitId?: string;
  unitTitle?: string;
  lessonId?: string;
  skillId?: string;
  inquiryQuestion?: string;
  customDetail?: string;
  loggedBy?: string;
}

/**
 * Fetch all activity data with optional filters
 * NOW QUERIES student-activities collection instead of embedded arrays
 */
export async function fetchActivityData(filters: ActivityDataFilters = {}) {
  return withDbConnection(async () => {
    try {
      // Build MongoDB query for student-activities collection
      const query: any = {
        gradeLevel: "8"
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

      // Fetch activities from dedicated collection
      const activities = await StudentActivityModel.find(query)
        .sort({ date: -1, studentName: 1 });

      // Convert to plain objects
      const records: StudentActivityRecord[] = activities.map((activity) => {
        const activityData = activity.toJSON();
        return {
          studentId: activityData.studentId,
          studentName: activityData.studentName,
          section: activityData.section,
          gradeLevel: activityData.gradeLevel,
          activityDate: activityData.date,
          activityType: activityData.activityType,
          activityLabel: activityData.activityLabel,
          unitId: activityData.unitId,
          lessonId: activityData.lessonId,
          skillId: activityData.skillId,
          inquiryQuestion: activityData.inquiryQuestion,
          customDetail: activityData.customDetail,
          loggedBy: activityData.loggedBy,
        };
      });

      return { success: true, data: records };
    } catch (error) {
      return handleServerError(error, "Failed to fetch activity data");
    }
  });
}

/**
 * Get activity summary statistics
 */
export async function getActivitySummary(filters: ActivityDataFilters = {}) {
  return withDbConnection(async () => {
    try {
      const result = await fetchActivityData(filters);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const records = result.data as StudentActivityRecord[];

      // Calculate statistics
      const totalActivities = records.length;
      const uniqueStudents = new Set(records.map(r => r.studentId)).size;

      // Activities by type
      const byType: { [key: string]: number } = {};
      records.forEach(r => {
        byType[r.activityLabel] = (byType[r.activityLabel] || 0) + 1;
      });

      // Activities by date
      const byDate: { [key: string]: number } = {};
      records.forEach(r => {
        byDate[r.activityDate] = (byDate[r.activityDate] || 0) + 1;
      });

      // Activities by student
      const byStudent: { [key: string]: number } = {};
      records.forEach(r => {
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
          dateRange: records.length > 0 ? {
            earliest: records[records.length - 1].activityDate,
            latest: records[0].activityDate,
          } : null,
        },
      };
    } catch (error) {
      return handleServerError(error, "Failed to calculate summary");
    }
  });
}

/**
 * Export activity data as CSV
 */
export async function exportActivityDataAsCSV(filters: ActivityDataFilters = {}) {
  return withDbConnection(async () => {
    try {
      const result = await fetchActivityData(filters);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
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
        "Lesson ID",
        "Skill ID",
        "Custom Detail",
        "Logged By",
      ];

      // Generate CSV rows
      const rows = records.map(r => [
        r.studentName,
        r.section,
        r.activityDate,
        r.activityLabel,
        r.unitId || "",
        r.inquiryQuestion || "",
        r.lessonId || "",
        r.skillId || "",
        r.customDetail || "",
        r.loggedBy || "",
      ]);

      // Escape CSV values
      const escapeCSV = (value: string) => {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      // Build CSV string
      const csvLines = [
        headers.map(escapeCSV).join(","),
        ...rows.map(row => row.map(v => escapeCSV(v.toString())).join(",")),
      ];

      const csv = csvLines.join("\n");

      return { success: true, data: csv };
    } catch (error) {
      return handleServerError(error, "Failed to export CSV");
    }
  });
}
