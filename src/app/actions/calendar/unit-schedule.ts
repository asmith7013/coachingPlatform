"use server";

import { ZodType } from "zod";
import { UnitScheduleModel } from "@mongoose-schema/calendar";
import {
  UnitScheduleZodSchema,
  UnitScheduleInputZodSchema,
  type UnitSchedule,
  type UnitScheduleInput,
  type UnitSection
} from "@zod-schema/calendar";
import { createCrudActions } from "@server/crud";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { QueryParams } from "@core-types/query";

// Create standard CRUD actions for UnitSchedule
const unitScheduleActions = createCrudActions({
  model: UnitScheduleModel,
  schema: UnitScheduleZodSchema as ZodType<UnitSchedule>,
  inputSchema: UnitScheduleInputZodSchema as ZodType<UnitScheduleInput>,
  name: "UnitSchedule",
  revalidationPaths: ["/calendar"],
  sortFields: ['unitNumber', 'createdAt', 'updatedAt'],
  defaultSortField: 'unitNumber',
  defaultSortOrder: 'asc'
});

// Export the generated actions with connection handling
export async function fetchUnitSchedulesPaginated(params: QueryParams) {
  return withDbConnection(() => unitScheduleActions.fetch(params));
}

export async function createUnitSchedule(data: UnitScheduleInput) {
  return withDbConnection(() => unitScheduleActions.create(data));
}

export async function updateUnitSchedule(id: string, data: Partial<UnitScheduleInput>) {
  return withDbConnection(() => unitScheduleActions.update(id, data));
}

export async function deleteUnitSchedule(id: string) {
  return withDbConnection(() => unitScheduleActions.delete(id));
}

export async function fetchUnitScheduleById(id: string) {
  return withDbConnection(() => unitScheduleActions.fetchById(id));
}

/**
 * Fetch all unit schedules for a school year and grade
 * Custom action for specific filtering not covered by generic CRUD
 */
export async function fetchUnitSchedules(schoolYear: string, grade: string) {
  return withDbConnection(async () => {
    try {
      const schedules = await UnitScheduleModel.find({ schoolYear, grade })
        .sort({ unitNumber: 1 })
        .lean();

      // Fully serialize for client (handles ObjectIds and other MongoDB types)
      const serialized = JSON.parse(JSON.stringify(schedules));

      return {
        success: true,
        data: serialized as UnitSchedule[]
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch unit schedules")
      };
    }
  });
}

/**
 * Fetch a single unit schedule
 * @deprecated Use fetchUnitScheduleById instead
 */
export async function fetchUnitSchedule(id: string) {
  return fetchUnitScheduleById(id);
}

/**
 * Update a specific section within a unit schedule
 * Custom action for nested document updates
 */
export async function updateUnitSection(
  unitId: string,
  sectionId: string,
  sectionData: Partial<UnitSection>
) {
  return withDbConnection(async () => {
    try {
      // Build the update object dynamically to avoid setting undefined values
      const updateFields: Record<string, unknown> = {};

      if (sectionData.startDate !== undefined) {
        updateFields["sections.$.startDate"] = sectionData.startDate;
      }
      if (sectionData.endDate !== undefined) {
        updateFields["sections.$.endDate"] = sectionData.endDate;
      }
      if (sectionData.plannedDays !== undefined) {
        updateFields["sections.$.plannedDays"] = sectionData.plannedDays;
      }
      if (sectionData.actualDays !== undefined) {
        updateFields["sections.$.actualDays"] = sectionData.actualDays;
      }
      if (sectionData.notes !== undefined) {
        updateFields["sections.$.notes"] = sectionData.notes;
      }
      if (sectionData.color !== undefined) {
        updateFields["sections.$.color"] = sectionData.color;
      }

      const schedule = await UnitScheduleModel.findOneAndUpdate(
        { _id: unitId, "sections.sectionId": sectionId },
        { $set: updateFields },
        { new: true }
      ).lean();

      if (!schedule) {
        return { success: false, error: "Unit schedule or section not found" };
      }

      return { success: true, data: schedule as unknown as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update unit section")
      };
    }
  });
}

/**
 * Calculate actual school days between two dates, excluding days off
 */
export async function calculateActualDays(
  startDate: string,
  endDate: string,
  daysOff: string[]
): Promise<number> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysOffSet = new Set(daysOff);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    // Count if it's a weekday and not a day off
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !daysOffSet.has(dateStr)) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Upsert a unit schedule (create or update by schoolYear + grade + unitNumber)
 */
export async function upsertUnitSchedule(data: {
  schoolYear: string;
  grade: string;
  unitNumber: number;
  unitName: string;
  startDate?: string;
  endDate?: string;
  sections: Array<{
    sectionId: string;
    name: string;
    startDate?: string;
    endDate?: string;
    lessonCount?: number;
  }>;
}) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear: data.schoolYear,
          grade: data.grade,
          unitNumber: data.unitNumber
        },
        {
          $set: {
            unitName: data.unitName,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            sections: data.sections.map(s => ({
              sectionId: s.sectionId,
              name: s.name,
              startDate: s.startDate || '',
              endDate: s.endDate || '',
              plannedDays: s.lessonCount || 0,
            })),
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
            ownerIds: []
          }
        },
        { upsert: true, new: true }
      ).lean();

      // Fully serialize for client (handles ObjectIds and other MongoDB types)
      const serialized = JSON.parse(JSON.stringify(schedule));

      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save unit schedule")
      };
    }
  });
}

/**
 * Update unit-level dates (by schoolYear + grade + unitNumber)
 */
export async function updateUnitDates(
  schoolYear: string,
  grade: string,
  unitNumber: number,
  startDate: string,
  endDate: string
) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear,
          grade,
          unitNumber,
        },
        {
          $set: {
            startDate,
            endDate,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true }
      ).lean();

      if (!schedule) {
        return { success: false, error: "Unit schedule not found" };
      }

      // Fully serialize for client (handles ObjectIds and other MongoDB types)
      const serialized = JSON.parse(JSON.stringify(schedule));

      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update unit dates")
      };
    }
  });
}

/**
 * Update section dates for a specific unit (by schoolYear + grade + unitNumber)
 */
export async function updateSectionDates(
  schoolYear: string,
  grade: string,
  unitNumber: number,
  sectionId: string,
  startDate: string,
  endDate: string
) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear,
          grade,
          unitNumber,
          "sections.sectionId": sectionId
        },
        {
          $set: {
            "sections.$.startDate": startDate,
            "sections.$.endDate": endDate,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true }
      ).lean();

      if (!schedule) {
        return { success: false, error: "Unit schedule or section not found" };
      }

      // Fully serialize for client (handles ObjectIds and other MongoDB types)
      const serialized = JSON.parse(JSON.stringify(schedule));

      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update section dates")
      };
    }
  });
}

// =====================================
// SECTION-SPECIFIC UNIT SCHEDULE OPERATIONS
// =====================================

/**
 * Fetch unit schedules for a specific class section
 */
export async function fetchSectionUnitSchedules(
  schoolYear: string,
  grade: string,
  school: string,
  classSection: string
) {
  return withDbConnection(async () => {
    try {
      const schedules = await UnitScheduleModel.find({
        schoolYear,
        grade,
        school,
        classSection
      })
        .sort({ unitNumber: 1 })
        .lean();

      const serialized = JSON.parse(JSON.stringify(schedules));
      return { success: true, data: serialized as UnitSchedule[] };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch section unit schedules")
      };
    }
  });
}

/**
 * Upsert a unit schedule for a specific class section
 */
export async function upsertSectionUnitSchedule(data: {
  schoolYear: string;
  grade: string;
  school: string;
  classSection: string;
  unitNumber: number;
  unitName: string;
  startDate?: string;
  endDate?: string;
  sections: Array<{
    sectionId: string;
    name: string;
    startDate?: string;
    endDate?: string;
    lessonCount?: number;
  }>;
}) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear: data.schoolYear,
          grade: data.grade,
          school: data.school,
          classSection: data.classSection,
          unitNumber: data.unitNumber
        },
        {
          $set: {
            unitName: data.unitName,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            sections: data.sections.map(s => ({
              sectionId: s.sectionId,
              name: s.name,
              startDate: s.startDate || '',
              endDate: s.endDate || '',
              plannedDays: s.lessonCount || 0,
            })),
            updatedAt: new Date().toISOString()
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
            ownerIds: []
          }
        },
        { upsert: true, new: true }
      ).lean();

      const serialized = JSON.parse(JSON.stringify(schedule));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save section unit schedule")
      };
    }
  });
}

/**
 * Update section dates for a specific class section's unit
 */
export async function updateSectionUnitDates(
  schoolYear: string,
  grade: string,
  school: string,
  classSection: string,
  unitNumber: number,
  sectionId: string,
  startDate: string,
  endDate: string
) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear,
          grade,
          school,
          classSection,
          unitNumber,
          "sections.sectionId": sectionId
        },
        {
          $set: {
            "sections.$.startDate": startDate,
            "sections.$.endDate": endDate,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true }
      ).lean();

      if (!schedule) {
        return { success: false, error: "Section unit schedule not found" };
      }

      const serialized = JSON.parse(JSON.stringify(schedule));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update section unit dates")
      };
    }
  });
}

/**
 * Update unit-level dates for a specific class section
 */
export async function updateSectionUnitLevelDates(
  schoolYear: string,
  grade: string,
  school: string,
  classSection: string,
  unitNumber: number,
  startDate: string,
  endDate: string
) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear,
          grade,
          school,
          classSection,
          unitNumber
        },
        {
          $set: {
            startDate,
            endDate,
            updatedAt: new Date().toISOString()
          }
        },
        { new: true }
      ).lean();

      if (!schedule) {
        return { success: false, error: "Section unit schedule not found" };
      }

      const serialized = JSON.parse(JSON.stringify(schedule));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update section unit level dates")
      };
    }
  });
}

/**
 * Copy unit schedules from one class section to another
 */
export async function copySectionUnitSchedules(
  schoolYear: string,
  grade: string,
  fromSchool: string,
  fromClassSection: string,
  toSchool: string,
  toClassSection: string
) {
  return withDbConnection(async () => {
    try {
      // Fetch source schedules
      const sourceSchedules = await UnitScheduleModel.find({
        schoolYear,
        grade,
        school: fromSchool,
        classSection: fromClassSection
      }).lean();

      if (sourceSchedules.length === 0) {
        return { success: false, error: "No schedules found in source section" };
      }

      // Copy each schedule to the target section
      const results = [];
      for (const source of sourceSchedules) {
        const copied = await UnitScheduleModel.findOneAndUpdate(
          {
            schoolYear,
            grade,
            school: toSchool,
            classSection: toClassSection,
            unitNumber: source.unitNumber
          },
          {
            $set: {
              unitName: source.unitName,
              startDate: source.startDate || '',
              endDate: source.endDate || '',
              sections: source.sections,
              color: source.color,
              notes: source.notes,
              updatedAt: new Date().toISOString()
            },
            $setOnInsert: {
              createdAt: new Date().toISOString(),
              ownerIds: []
            }
          },
          { upsert: true, new: true }
        ).lean();
        results.push(copied);
      }

      const serialized = JSON.parse(JSON.stringify(results));
      return {
        success: true,
        data: serialized as UnitSchedule[],
        message: `Copied ${results.length} unit schedules`
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to copy section unit schedules")
      };
    }
  });
}
