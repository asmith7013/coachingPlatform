"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie/section-config.model";
import { Attendance313 } from "@mongoose-schema/scm/student/attendance.model";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import { SchoolCalendarModel } from "@mongoose-schema/calendar/school-calendar.model";
import { handleServerError } from "@error/handlers/server";
import type { SectionConfig } from "@zod-schema/scm/podsie/section-config";
import type {
  SchoolCalendar,
  CalendarEvent,
} from "@zod-schema/calendar/school-calendar";

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
    events: CalendarEvent[];
  };
}

export interface DailyAttendanceStats {
  date: string;
  present: number;
  late: number;
  absent: number;
  total: number;
}

// =====================================
// GET SECTION OVERVIEW DATA
// =====================================

/**
 * Get comprehensive overview data for a section
 */
export async function getSectionOverviewData(
  sectionId: string,
): Promise<
  | { success: true; data: SectionOverviewData }
  | { success: false; error: string }
> {
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

      // Serialize the config properly to handle ObjectIds
      interface LeanDocument {
        _id: { toString(): string };
        [key: string]: unknown;
      }

      interface LeanAssignmentContent {
        scopeAndSequenceId?: { toString(): string } | string;
        podsieActivities?: unknown[];
        [key: string]: unknown;
      }

      const configDoc = config as unknown as LeanDocument & {
        assignmentContent?: LeanAssignmentContent[];
      };
      const serializedConfig = {
        ...configDoc,
        id: configDoc._id.toString(),
        _id: configDoc._id.toString(),
        assignmentContent: (configDoc.assignmentContent || []).map((ac) => ({
          ...ac,
          scopeAndSequenceId:
            typeof ac.scopeAndSequenceId === "object" && ac.scopeAndSequenceId
              ? ac.scopeAndSequenceId.toString()
              : ac.scopeAndSequenceId,
          podsieActivities: ac.podsieActivities || [],
        })),
      };

      type LeanCalendar = Pick<
        SchoolCalendar,
        "schoolYear" | "startDate" | "endDate" | "events"
      > &
        LeanDocument;

      return {
        success: true,
        data: {
          config: serializedConfig as unknown as SectionConfig,
          students: students.map((s) => ({
            id: (s as unknown as LeanDocument)._id.toString(),
            studentID: (s as unknown as { studentID: number }).studentID,
            firstName: (s as unknown as { firstName: string }).firstName,
            lastName: (s as unknown as { lastName: string }).lastName,
            email: (s as unknown as { email: string }).email,
            active: (s as unknown as { active: boolean }).active,
          })),
          schoolCalendar: calendar
            ? {
                id: (calendar as unknown as LeanCalendar)._id.toString(),
                schoolYear: (calendar as unknown as LeanCalendar).schoolYear,
                startDate: (calendar as unknown as LeanCalendar).startDate,
                endDate: (calendar as unknown as LeanCalendar).endDate,
                events: (calendar as unknown as LeanCalendar).events || [],
              }
            : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section overview"),
      };
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
  endDate: string,
): Promise<
  | { success: true; data: DailyAttendanceStats[] }
  | { success: false; error: string }
> {
  return withDbConnection(async () => {
    try {
      const records = await Attendance313.find({
        section,
        date: { $gte: startDate, $lte: endDate },
      }).lean();

      // Group by date
      const byDate = new Map<
        string,
        { present: number; late: number; absent: number; total: number }
      >();

      for (const record of records) {
        const existing = byDate.get(record.date) || {
          present: 0,
          late: 0,
          absent: 0,
          total: 0,
        };

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
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch attendance data"),
      };
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
  | {
      success: true;
      data: Array<{
        school: string;
        sections: Array<{
          id: string;
          classSection: string;
          teacher?: string;
          gradeLevel: string;
          scopeSequenceTag?: string;
          specialPopulations?: string[];
        }>;
      }>;
    }
  | { success: false; error: string }
> {
  return withDbConnection(async () => {
    try {
      const configs = await SectionConfigModel.find({ active: true })
        .select(
          "school classSection teacher gradeLevel scopeSequenceTag specialPopulations",
        )
        .sort({ school: 1, classSection: 1 })
        .lean();

      // Group by school
      interface LeanSectionConfig {
        _id: { toString(): string };
        school: string;
        classSection: string;
        teacher?: string;
        gradeLevel: string;
        scopeSequenceTag?: string;
        specialPopulations?: string[];
      }

      const bySchool = new Map<
        string,
        Array<{
          id: string;
          classSection: string;
          teacher?: string;
          gradeLevel: string;
          scopeSequenceTag?: string;
          specialPopulations?: string[];
        }>
      >();

      for (const config of configs as unknown as LeanSectionConfig[]) {
        const school = config.school;
        if (!bySchool.has(school)) {
          bySchool.set(school, []);
        }
        bySchool.get(school)!.push({
          id: config._id.toString(),
          classSection: config.classSection,
          teacher: config.teacher,
          gradeLevel: config.gradeLevel,
          scopeSequenceTag: config.scopeSequenceTag,
          specialPopulations: config.specialPopulations,
        });
      }

      const grouped = Array.from(bySchool.entries()).map(
        ([school, sections]) => ({
          school,
          sections,
        }),
      );

      return { success: true, data: grouped };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section configs"),
      };
    }
  });
}
