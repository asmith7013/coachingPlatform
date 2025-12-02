"use server";

import { StudentActivityModel } from "@mongoose-schema/313/student-activity.model";
import { ScopeAndSequenceModel } from "@mongoose-schema/313/scope-and-sequence.model";
import { RoadmapUnitModel } from "@mongoose-schema/313/roadmap-unit.model";
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
 * Fetch all student of the day records (no date filtering)
 */
export async function fetchStudentOfTheDay(section?: string) {
  return withDbConnection(async () => {
    try {
      console.log("🔵 [fetchStudentOfTheDay] Called with section:", section);

      const query: Record<string, unknown> = {
        gradeLevel: "8",
        $or: [
          { activityType: "student-of-day" },
          { activityLabel: "Student of the Day" }
        ]
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
      if (activities.length > 0) {
        console.log("🔵 [fetchStudentOfTheDay] Sample activity:", JSON.stringify(activities[0], null, 2));
      }

      // Normalize dates to YYYY-MM-DD format
      const records: StudentOfTheDayRecord[] = activities.map((activity) => {
        let normalizedDate = activity.date;

        // Check if date is in MM/DD/YY format and convert to YYYY-MM-DD
        if (activity.date && activity.date.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
          const [month, day, year] = activity.date.split('/');
          normalizedDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        return {
          date: normalizedDate,
          studentName: activity.studentName
        };
      });

      console.log("🔵 [fetchStudentOfTheDay] Total records:", records.length);

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
        $or: [
          { activityType: { $in: ["small-group-acceleration", "small-group-prerequisite"] } },
          { activityLabel: { $in: ["Small Group (Acceleration)", "Small Group (Prerequisite)"] } }
        ]
      };

      if (section) {
        query.section = section;
      }

      console.log("🔵 [fetchSmallGroupActivities] Query:", JSON.stringify(query, null, 2));

      const activities = await StudentActivityModel.find(query)
        .select("studentId studentName lessonId activityType activityLabel")
        .lean();

      console.log("🔵 [fetchSmallGroupActivities] Found activities:", activities.length);
      if (activities.length > 0) {
        console.log("🔵 [fetchSmallGroupActivities] Sample activity:", JSON.stringify(activities[0], null, 2));
      }

      const records: SmallGroupRecord[] = activities.map((activity) => ({
        studentId: activity.studentId,
        studentName: activity.studentName,
        lessonId: activity.lessonId || "",
        isAcceleration: activity.activityType === "small-group-acceleration" || activity.activityLabel === "Small Group (Acceleration)"
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
        $or: [
          { activityType: "inquiry-activity" },
          { activityLabel: "Inquiry Activity" }
        ],
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
// SHOUTOUTS AND TEAMWORK TRACKING
// =====================================

export interface ShoutoutsTeamworkRecord {
  studentId: string;
  studentName: string;
  shoutoutDates: string[]; // Array of dates (YYYY-MM-DD)
  teamworkDates: string[]; // Array of dates (YYYY-MM-DD)
  studentOfDayDates: string[]; // Array of dates (YYYY-MM-DD)
}

/**
 * Fetch shoutouts and teamwork activities for a section with optional date filtering
 */
export async function fetchShoutoutsTeamwork(section?: string, startDate?: string, endDate?: string) {
  return withDbConnection(async () => {
    try {
      console.log("🔵 [fetchShoutoutsTeamwork] Called with section:", section, "startDate:", startDate, "endDate:", endDate);

      // Get activity type IDs
      const teamworkTypeId = "690e180b3b195af5c3d371f1";
      const shoutoutsTypeId = "shoutouts";

      const query: Record<string, unknown> = {
        gradeLevel: "8",
        $or: [
          { activityType: teamworkTypeId },
          { activityType: shoutoutsTypeId },
          { activityType: "student-of-day" },
          { activityLabel: "Teamwork" },
          { activityLabel: "Shoutouts" },
          { activityLabel: "Student of the Day" }
        ]
      };

      if (section) {
        query.section = section;
      }

      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      }

      console.log("🔵 [fetchShoutoutsTeamwork] Query:", JSON.stringify(query, null, 2));

      const activities = await StudentActivityModel.find(query)
        .select("studentId studentName date activityType activityLabel")
        .sort({ studentName: 1, date: 1 })
        .lean();

      console.log("🔵 [fetchShoutoutsTeamwork] Found activities:", activities.length);

      // Group by student
      const studentMap = new Map<string, ShoutoutsTeamworkRecord>();

      activities.forEach((activity) => {
        const key = `${activity.studentId}|||${activity.studentName}`;

        if (!studentMap.has(key)) {
          studentMap.set(key, {
            studentId: activity.studentId,
            studentName: activity.studentName,
            shoutoutDates: [],
            teamworkDates: [],
            studentOfDayDates: []
          });
        }

        const record = studentMap.get(key)!;
        const isTeamwork = activity.activityType === teamworkTypeId || activity.activityLabel === "Teamwork";
        const isShoutouts = activity.activityType === shoutoutsTypeId || activity.activityLabel === "Shoutouts";
        const isStudentOfDay = activity.activityType === "student-of-day" || activity.activityLabel === "Student of the Day";

        if (isTeamwork) {
          record.teamworkDates.push(activity.date);
        } else if (isShoutouts) {
          record.shoutoutDates.push(activity.date);
        } else if (isStudentOfDay) {
          record.studentOfDayDates.push(activity.date);
        }
      });

      const records = Array.from(studentMap.values()).sort((a, b) =>
        a.studentName.localeCompare(b.studentName)
      );

      console.log("🔵 [fetchShoutoutsTeamwork] Total students:", records.length);

      return { success: true, data: records };
    } catch (error) {
      return { success: false, error: handleServerError(error, "fetchShoutoutsTeamwork") };
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
 * Fetch lessons for a given unit from scope-and-sequence collection
 * Gets grade and unitNumber from RoadmapUnit, then queries scope-and-sequence
 */
export async function fetchLessonsForUnit(unitId: string) {
  return withDbConnection(async () => {
    try {
      console.log("🔵 [fetchLessonsForUnit] Called with unitId:", unitId);

      // Get the unit to extract grade and unitNumber
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unit: any = await RoadmapUnitModel.findById(unitId)
        .select("grade unitNumber")
        .lean();

      if (!unit) {
        console.log("🔵 [fetchLessonsForUnit] Unit not found");
        return { success: true, data: [] };
      }

      // Extract grade number from grade string (e.g., "Illustrative Math New York - 8th Grade" -> "8")
      const gradeMatch = unit.grade.match(/(\d+)th Grade/);
      const grade = gradeMatch ? gradeMatch[1] : "8";
      const unitNumber = unit.unitNumber;

      console.log("🔵 [fetchLessonsForUnit] Unit info - grade:", grade, "unitNumber:", unitNumber);

      // Query scope-and-sequence by grade and unitNumber
      const lessons = await ScopeAndSequenceModel.find({
        grade,
        unitNumber
      })
        .sort({ lessonNumber: 1 })
        .lean();

      console.log("🔵 [fetchLessonsForUnit] Found lessons:", lessons.length);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessonInfo: LessonInfo[] = lessons.map((lesson: any) => ({
        lessonId: lesson._id.toString(),
        lessonNumber: lesson.lessonNumber || 0,
        lessonName: lesson.lessonName || `Lesson ${lesson.lessonNumber}`
      }));

      return { success: true, data: lessonInfo };
    } catch (error) {
      return { success: false, error: handleServerError(error, "fetchLessonsForUnit") };
    }
  });
}
