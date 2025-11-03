"use server";

import { StudentActivityModel } from "@mongoose-schema/313/student-activity.model";
import { ScopeAndSequenceModel } from "@mongoose-schema/313/scope-and-sequence.model";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

// =====================================
// STUDENT OF THE DAY TRACKING
// =====================================

export interface StudentOfTheDayRecord {
  date: string; // YYYY-MM-DD
  studentName: string;
}

/**
 * Fetch student of the day records for the last 4 weeks
 */
export async function fetchStudentOfTheDay(section?: string) {
  return withDbConnection(async () => {
    try {
      console.log("🔵 [fetchStudentOfTheDay] Called with section:", section);

      // Calculate date range (last 4 weeks)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 28); // 4 weeks

      const query: Record<string, unknown> = {
        gradeLevel: "8",
        activityType: "student-of-day",
        date: {
          $gte: startDate.toISOString().split("T")[0],
          $lte: endDate.toISOString().split("T")[0]
        }
      };

      if (section) {
        query.section = section;
      }

      console.log("🔵 [fetchStudentOfTheDay] Query:", JSON.stringify(query, null, 2));

      const activities = await StudentActivityModel.find(query)
        .select("date studentName")
        .sort({ date: 1 })
        .lean();

      console.log("🔵 [fetchStudentOfTheDay] Found activities:", activities.length);

      const records: StudentOfTheDayRecord[] = activities.map((activity) => ({
        date: activity.date,
        studentName: activity.studentName
      }));

      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: handleServerError(error, "fetchStudentOfTheDay") };
    }
  });
}

// =====================================
// SMALL GROUPS / ACCELERATION TRACKING
// =====================================

export interface SmallGroupRecord {
  studentId: string;
  studentName: string;
  lessonId: string;
  isAcceleration: boolean; // true for acceleration (🚀), false for prerequisite
}

/**
 * Fetch small group activities (acceleration and prerequisite) for a unit
 */
export async function fetchSmallGroupActivities(unitId: string, section?: string) {
  return withDbConnection(async () => {
    try {
      console.log("🔵 [fetchSmallGroupActivities] Called with unitId:", unitId, "section:", section);

      const query: Record<string, unknown> = {
        gradeLevel: "8",
        unitId,
        activityType: { $in: ["small-group-acceleration", "small-group-prerequisite"] }
      };

      if (section) {
        query.section = section;
      }

      console.log("🔵 [fetchSmallGroupActivities] Query:", JSON.stringify(query, null, 2));

      const activities = await StudentActivityModel.find(query)
        .select("studentId studentName lessonId activityType")
        .lean();

      console.log("🔵 [fetchSmallGroupActivities] Found activities:", activities.length);

      const records: SmallGroupRecord[] = activities.map((activity) => ({
        studentId: activity.studentId,
        studentName: activity.studentName,
        lessonId: activity.lessonId || "",
        isAcceleration: activity.activityType === "small-group-acceleration"
      }));

      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: handleServerError(error, "fetchSmallGroupActivities") };
    }
  });
}

// =====================================
// INQUIRY GROUPS TRACKING
// =====================================

export interface InquiryRecord {
  studentId: string;
  studentName: string;
  inquiryQuestion: string;
}

/**
 * Fetch inquiry activity records for a unit
 */
export async function fetchInquiryActivities(unitId: string, section?: string) {
  return withDbConnection(async () => {
    try {
      const query: Record<string, unknown> = {
        gradeLevel: "8",
        unitId,
        activityType: "inquiry-activity",
        inquiryQuestion: { $exists: true, $ne: "" }
      };

      if (section) {
        query.section = section;
      }

      const activities = await StudentActivityModel.find(query)
        .select("studentId studentName inquiryQuestion")
        .lean();

      const records: InquiryRecord[] = activities.map((activity) => ({
        studentId: activity.studentId,
        studentName: activity.studentName,
        inquiryQuestion: activity.inquiryQuestion || ""
      }));

      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: handleServerError(error, "fetchInquiryActivities") };
    }
  });
}

// =====================================
// FETCH LESSONS FOR UNIT
// =====================================

export interface LessonInfo {
  lessonId: string;
  lessonNumber: number;
  lessonName: string;
}

/**
 * Fetch lessons for a given unit
 */
export async function fetchLessonsForUnit(unitId: string) {
  return withDbConnection(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scopeEntry: any = await ScopeAndSequenceModel.findOne({
        "unit._id": unitId
      })
        .select("lessons")
        .lean();

      if (!scopeEntry || !scopeEntry.lessons) {
        return { success: true, data: [] };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessons: LessonInfo[] = scopeEntry.lessons.map((lesson: any) => ({
        lessonId: lesson._id.toString(),
        lessonNumber: lesson.lessonNumber,
        lessonName: lesson.lessonName
      }));

      return { success: true, data: lessons };
    } catch (error) {
      return { success: false, error: handleServerError(error, "fetchLessonsForUnit") };
    }
  });
}
