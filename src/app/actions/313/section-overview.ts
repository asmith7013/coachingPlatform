"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/313/podsie/section-config.model";
import { Attendance313 } from "@mongoose-schema/313/student/attendance.model";
import { StudentModel } from "@mongoose-schema/313/student/student.model";
import { SchoolCalendarModel } from "@mongoose-schema/calendar/school-calendar.model";
import { handleServerError } from "@error/handlers/server";
import type { SectionConfig } from "@zod-schema/313/podsie/section-config";

// =====================================
// TYPES
// =====================================

export interface SectionOverviewData {
  config: SectionConfig;
  students: Array<{
    id: string;
    studentID: number;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
  }>;
  schoolCalendar?: {
    id: string;
    schoolYear: string;
    startDate: string;
    endDate: string;
    events: Array<{
      date: string;
      name: string;
      type: string;
      description?: string;
    }>;
  };
}

export interface DailyAttendanceStats {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface DailyVelocityStats {
  date: string;
  averageVelocity: number; // Average mastery checks completed per student present
  totalMasteries: number;
  studentsPresent: number;
}

// =====================================
// GET SECTION OVERVIEW DATA
// =====================================

/**
 * Get comprehensive overview data for a section
 */
export async function getSectionOverviewData(
  sectionId: string
): Promise<{ success: true; data: SectionOverviewData } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      // Fetch section config
      const config = await SectionConfigModel.findById(sectionId).lean();
      if (!config) {
        return { success: false, error: "Section config not found" };
      }

      // Fetch students in this section
      const students = await StudentModel.find({
        section: config.classSection,
        school: config.school,
        active: true,
      })
        .select("studentID firstName lastName email active")
        .lean();

      // Fetch school calendar for current year
      const currentYear = new Date().getFullYear();
      const schoolYear = `${currentYear}-${currentYear + 1}`;
      const calendar = await SchoolCalendarModel.findOne({
        schoolYear,
        schoolId: config.school,
      }).lean();

      return {
        success: true,
        data: {
          config: {
            ...(config as any),
            id: (config as any)._id.toString(),
            _id: (config as any)._id.toString(),
          } as unknown as SectionConfig,
          students: students.map((s: any) => ({
            id: s._id.toString(),
            studentID: s.studentID,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
            active: s.active,
          })),
          schoolCalendar: calendar
            ? {
                id: (calendar as any)._id.toString(),
                schoolYear: (calendar as any).schoolYear,
                startDate: (calendar as any).startDate,
                endDate: (calendar as any).endDate,
                events: (calendar as any).events || [],
              }
            : undefined,
        },
      };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch section overview") };
    }
  });
}

// =====================================
// GET ATTENDANCE DATA FOR DATE RANGE
// =====================================

/**
 * Get attendance statistics for a section over a date range
 */
export async function getSectionAttendanceByDateRange(
  section: string,
  startDate: string,
  endDate: string
): Promise<{ success: true; data: DailyAttendanceStats[] } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      const records = await Attendance313.find({
        section,
        date: { $gte: startDate, $lte: endDate },
      }).lean();

      // Group by date
      const byDate = new Map<string, { present: number; late: number; absent: number; total: number }>();

      for (const record of records) {
        const existing = byDate.get(record.date) || { present: 0, late: 0, absent: 0, total: 0 };

        if (record.status === "present") existing.present++;
        else if (record.status === "late") existing.late++;
        else if (record.status === "absent") existing.absent++;

        existing.total++;
        byDate.set(record.date, existing);
      }

      const stats: DailyAttendanceStats[] = [];
      for (const [date, data] of byDate.entries()) {
        stats.push({ date, ...data });
      }

      return {
        success: true,
        data: stats.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch attendance data") };
    }
  });
}

// =====================================
// GET VELOCITY DATA FOR DATE RANGE
// =====================================

/**
 * Get class velocity (mastery completion rate) for a date range
 * Velocity = average number of mastery checks completed per student present that day
 */
export async function getSectionVelocityByDateRange(
  section: string,
  school: string,
  startDate: string,
  endDate: string
): Promise<{ success: true; data: DailyVelocityStats[] } | { success: false; error: string }> {
  return withDbConnection(async () => {
    try {
      // Get students in section
      const students = await StudentModel.find({
        section,
        school,
        active: true,
      })
        .select("studentID podsieProgress")
        .lean();

      // Get attendance for date range
      const attendanceRecords = await Attendance313.find({
        section,
        date: { $gte: startDate, $lte: endDate },
        status: { $in: ["present", "late"] }, // Only count present/late students
      }).lean();

      // Group attendance by date
      const attendanceByDate = new Map<string, Set<number>>();
      for (const record of attendanceRecords) {
        const recDate = (record as any).date;
        const recStudentId = (record as any).studentId;
        if (!attendanceByDate.has(recDate)) {
          attendanceByDate.set(recDate, new Set());
        }
        attendanceByDate.get(recDate)!.add(recStudentId);
      }

      // Calculate velocity for each date
      const velocityStats: DailyVelocityStats[] = [];

      for (const [date, presentStudentIds] of attendanceByDate.entries()) {
        let totalMasteries = 0;

        // For each student present that day
        for (const student of students) {
          const studentID = (student as any).studentID;
          if (!presentStudentIds.has(studentID)) continue;

          // Count mastery checks completed on this date
          const podsieProgress = (student as any).podsieProgress;
          if (podsieProgress && Array.isArray(podsieProgress)) {
            for (const progress of podsieProgress) {
              // Check if fully completed on this date
              if (progress.fullyCompletedDate && progress.fullyCompletedDate.startsWith(date)) {
                totalMasteries++;
              }
            }
          }
        }

        const studentsPresent = presentStudentIds.size;
        const averageVelocity = studentsPresent > 0 ? totalMasteries / studentsPresent : 0;

        velocityStats.push({
          date,
          averageVelocity: Math.round(averageVelocity * 100) / 100, // Round to 2 decimals
          totalMasteries,
          studentsPresent,
        });
      }

      return {
        success: true,
        data: velocityStats.sort((a, b) => a.date.localeCompare(b.date)),
      };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch velocity data") };
    }
  });
}

// =====================================
// GET ALL SECTION CONFIGS FOR DROPDOWN
// =====================================

/**
 * Get all section configs grouped by school for dropdown
 */
export async function getAllSectionConfigs(): Promise<
  | { success: true; data: Array<{ school: string; sections: Array<{ id: string; classSection: string; teacher?: string; gradeLevel: string }> }> }
  | { success: false; error: string }
> {
  return withDbConnection(async () => {
    try {
      const configs = await SectionConfigModel.find({ active: true })
        .select("school classSection teacher gradeLevel")
        .sort({ school: 1, classSection: 1 })
        .lean();

      // Group by school
      const bySchool = new Map<string, Array<{ id: string; classSection: string; teacher?: string; gradeLevel: string }>>();

      for (const config of configs) {
        const configAny = config as any;
        const school = configAny.school;
        if (!bySchool.has(school)) {
          bySchool.set(school, []);
        }
        bySchool.get(school)!.push({
          id: configAny._id.toString(),
          classSection: configAny.classSection,
          teacher: configAny.teacher,
          gradeLevel: configAny.gradeLevel,
        });
      }

      const grouped = Array.from(bySchool.entries()).map(([school, sections]) => ({
        school,
        sections,
      }));

      return { success: true, data: grouped };
    } catch (error) {
      return { success: false, error: handleServerError(error, "Failed to fetch section configs") };
    }
  });
}
