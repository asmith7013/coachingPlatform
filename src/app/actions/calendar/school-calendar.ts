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
        events?: Array<{ date: string; name: string; type: string; description?: string }>;
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
        .lean() as { events?: Array<{ type: string; date: string }> } | null;

      if (!calendar) {
        return { success: true, data: [] };
      }

      // Filter to just school_closed and holiday events (days students aren't in school)
      const daysOff = (calendar.events ?? [])
        .filter((e) => ['holiday', 'school_closed', 'half_day'].includes(e.type))
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
