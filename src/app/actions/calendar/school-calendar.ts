"use server";

import { ZodType } from "zod";
import { SchoolCalendarModel } from "@mongoose-schema/calendar";
import {
  SchoolCalendarZodSchema,
  SchoolCalendarInputZodSchema,
  type SchoolCalendar,
  type SchoolCalendarInput
} from "@zod-schema/calendar";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { QueryParams } from "@core-types/query";

// Create standard CRUD actions for SchoolCalendar
const schoolCalendarActions = createCrudActions({
  model: SchoolCalendarModel,
  schema: SchoolCalendarZodSchema as ZodType<SchoolCalendar>,
  inputSchema: SchoolCalendarInputZodSchema as ZodType<SchoolCalendarInput>,
  name: "SchoolCalendar",
  revalidationPaths: ["/calendar"],
  sortFields: ['schoolYear', 'createdAt', 'updatedAt'],
  defaultSortField: 'schoolYear',
  defaultSortOrder: 'desc'
});

// Export the generated actions with connection handling
export async function fetchSchoolCalendarsPaginated(params: QueryParams) {
  return withDbConnection(() => schoolCalendarActions.fetch(params));
}

export async function createSchoolCalendar(data: SchoolCalendarInput) {
  return withDbConnection(() => schoolCalendarActions.create(data));
}

export async function updateSchoolCalendar(id: string, data: Partial<SchoolCalendarInput>) {
  return withDbConnection(() => schoolCalendarActions.update(id, data));
}

export async function deleteSchoolCalendar(id: string) {
  return withDbConnection(() => schoolCalendarActions.delete(id));
}

export async function fetchSchoolCalendarById(id: string) {
  return withDbConnection(() => schoolCalendarActions.fetchById(id));
}

/**
 * Fetch school calendar by school year
 * Custom action for specific lookup not covered by generic CRUD
 */
export async function fetchSchoolCalendar(schoolYear: string, schoolId?: string) {
  return withDbConnection(async () => {
    try {
      const query: Record<string, string> = { schoolYear };
      if (schoolId) {
        query.schoolId = schoolId;
      }

      const calendar = await SchoolCalendarModel.findOne(query).lean() as {
        _id: { toString(): string };
        schoolYear: string;
        startDate: string;
        endDate: string;
        events?: Array<{ date: string; name: string; description?: string; hasMathClass?: boolean }>;
        notes?: string;
      } | null;

      if (!calendar) {
        return { success: true, data: null };
      }

      // Convert ObjectId to string for client serialization
      const serialized = {
        ...calendar,
        _id: calendar._id.toString(),
      };

      return { success: true, data: serialized as unknown as SchoolCalendar };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch school calendar")
      };
    }
  });
}

/**
 * Create or update school calendar (upsert)
 * Custom action for upsert behavior
 */
export async function upsertSchoolCalendar(input: SchoolCalendarInput) {
  return withDbConnection(async () => {
    try {
      const validated = SchoolCalendarInputZodSchema.parse(input);

      const calendar = await SchoolCalendarModel.findOneAndUpdate(
        {
          schoolYear: validated.schoolYear,
          ...(validated.schoolId ? { schoolId: validated.schoolId } : {})
        },
        validated,
        { new: true, upsert: true }
      ).lean();

      return { success: true, data: calendar as unknown as SchoolCalendar };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save school calendar")
      };
    }
  });
}

/**
 * Get all days off for a school year (convenience function)
 * Returns only global days off (events without school/classSection)
 */
export async function getDaysOff(schoolYear: string, schoolId?: string) {
  return withDbConnection(async () => {
    try {
      const query: Record<string, string> = { schoolYear };
      if (schoolId) {
        query.schoolId = schoolId;
      }

      const calendar = await SchoolCalendarModel.findOne(query)
        .select('events')
        .lean() as { events?: Array<{ date: string; school?: string; classSection?: string; hasMathClass?: boolean }> } | null;

      if (!calendar) {
        return { success: true, data: [] };
      }

      // Filter to global events (no school/classSection) where math class doesn't happen
      const daysOff = (calendar.events ?? [])
        .filter((e) => !e.school && !e.classSection && !e.hasMathClass)
        .map((e) => e.date);

      return { success: true, data: daysOff };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch days off")
      };
    }
  });
}

/**
 * Get section-specific days off for a school year and section
 */
export async function getSectionDaysOff(
  schoolYear: string,
  school: string,
  classSection: string
) {
  return withDbConnection(async () => {
    try {
      const calendar = await SchoolCalendarModel.findOne({ schoolYear })
        .select('events')
        .lean() as { events?: Array<{ date: string; name: string; description?: string; school?: string; classSection?: string; hasMathClass?: boolean }> } | null;

      if (!calendar) {
        return { success: true, data: [] };
      }

      // Filter to events that match this specific section
      const sectionEvents = (calendar.events ?? [])
        .filter((e) => e.school === school && e.classSection === classSection);

      return { success: true, data: sectionEvents };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section days off")
      };
    }
  });
}

/**
 * Get all days off for a section (combines global + section-specific)
 */
export async function getAllDaysOffForSection(
  schoolYear: string,
  school: string,
  classSection: string
) {
  return withDbConnection(async () => {
    try {
      const calendar = await SchoolCalendarModel.findOne({ schoolYear })
        .select('events')
        .lean() as { events?: Array<{ date: string; school?: string; classSection?: string; hasMathClass?: boolean }> } | null;

      if (!calendar) {
        return { success: true, data: [] };
      }

      // Get dates that are either global days off (no math class) OR section-specific events (no math class)
      const daysOff = (calendar.events ?? [])
        .filter((e) => {
          const isGlobalDayOff = !e.school && !e.classSection && !e.hasMathClass;
          const isSectionDayOff = e.school === school && e.classSection === classSection && !e.hasMathClass;
          return isGlobalDayOff || isSectionDayOff;
        })
        .map((e) => e.date);

      return { success: true, data: daysOff };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch all days off for section")
      };
    }
  });
}

/**
 * Add a section-specific event
 */
export async function addSectionDayOff(
  schoolYear: string,
  event: {
    date: string;
    name: string;
    description?: string;
    school: string;
    classSection: string;
    hasMathClass?: boolean; // false = no math class (schedule shifts), true = math happens (no shift)
  }
) {
  return withDbConnection(async () => {
    try {
      const calendar = await SchoolCalendarModel.findOneAndUpdate(
        { schoolYear },
        {
          $push: {
            events: {
              date: event.date,
              name: event.name,
              description: event.description,
              school: event.school,
              classSection: event.classSection,
              hasMathClass: event.hasMathClass ?? false,
            }
          }
        },
        { new: true }
      ).lean();

      if (!calendar) {
        return { success: false, error: "School calendar not found for this year" };
      }

      // Serialize for client - convert ObjectId and Date fields
      const serialized = JSON.parse(JSON.stringify(calendar));

      return { success: true, data: serialized };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to add section event")
      };
    }
  });
}

/**
 * Delete a section-specific day off
 */
export async function deleteSectionDayOff(
  schoolYear: string,
  date: string,
  school: string,
  classSection: string
) {
  return withDbConnection(async () => {
    try {
      const calendar = await SchoolCalendarModel.findOneAndUpdate(
        { schoolYear },
        {
          $pull: {
            events: {
              date,
              school,
              classSection,
            }
          }
        },
        { new: true }
      ).lean();

      if (!calendar) {
        return { success: false, error: "School calendar not found for this year" };
      }

      // Serialize for client - convert ObjectId and Date fields
      const serialized = JSON.parse(JSON.stringify(calendar));

      return { success: true, data: serialized };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to delete section day off")
      };
    }
  });
}
