"use server";

import { ZodType } from "zod";
import {
  UnitScheduleModel,
  SchoolCalendarModel,
} from "@mongoose-schema/calendar";
import { SectionConfigModel } from "@mongoose-schema/scm/podsie";
import {
  UnitScheduleZodSchema,
  UnitScheduleInputZodSchema,
  type UnitSchedule,
  type UnitScheduleInput,
  type UnitSection,
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
  sortFields: ["unitNumber", "createdAt", "updatedAt"],
  defaultSortField: "unitNumber",
  defaultSortOrder: "asc",
});

// Export the generated actions with connection handling
export async function fetchUnitSchedulesPaginated(params: QueryParams) {
  return withDbConnection(() => unitScheduleActions.fetch(params));
}

export async function createUnitSchedule(data: UnitScheduleInput) {
  return withDbConnection(() => unitScheduleActions.create(data));
}

export async function updateUnitSchedule(
  id: string,
  data: Partial<UnitScheduleInput>,
) {
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
        data: serialized as UnitSchedule[],
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to fetch unit schedules"),
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
  sectionData: Partial<UnitSection>,
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
        { new: true },
      ).lean();

      if (!schedule) {
        return { success: false, error: "Unit schedule or section not found" };
      }

      return { success: true, data: schedule as unknown as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update unit section"),
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
  daysOff: string[],
): Promise<number> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysOffSet = new Set(daysOff);

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split("T")[0];

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
    subsection?: number; // Part number for split sections
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
          unitNumber: data.unitNumber,
        },
        {
          $set: {
            unitName: data.unitName,
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            sections: data.sections.map((s) => ({
              sectionId: s.sectionId,
              subsection: s.subsection,
              name: s.name,
              startDate: s.startDate || "",
              endDate: s.endDate || "",
              plannedDays: s.lessonCount || 0,
            })),
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
            ownerIds: [],
          },
        },
        { upsert: true, new: true },
      ).lean();

      // Fully serialize for client (handles ObjectIds and other MongoDB types)
      const serialized = JSON.parse(JSON.stringify(schedule));

      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save unit schedule"),
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
  endDate: string,
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
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true },
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
        error: handleServerError(error, "Failed to update unit dates"),
      };
    }
  });
}

/**
 * Update section dates for a specific unit (by schoolYear + grade + unitNumber)
 * Supports subsection for split sections (Part 1, Part 2, etc.)
 */
export async function updateSectionDates(
  schoolYear: string,
  grade: string,
  unitNumber: number,
  sectionId: string,
  startDate: string,
  endDate: string,
  subsection?: number,
) {
  return withDbConnection(async () => {
    try {
      // Build query to find the right section using $elemMatch
      // This ensures both sectionId AND subsection conditions match the SAME array element
      // Without $elemMatch, separate array conditions could match different elements,
      // causing the positional $ operator to update the wrong section
      const query: Record<string, unknown> = {
        schoolYear,
        grade,
        unitNumber,
        sections: {
          $elemMatch: {
            sectionId: sectionId,
            subsection:
              subsection !== undefined
                ? subsection
                : { $in: [null, undefined] },
          },
        },
      };

      const schedule = await UnitScheduleModel.findOneAndUpdate(
        query,
        {
          $set: {
            "sections.$.startDate": startDate,
            "sections.$.endDate": endDate,
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true },
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
        error: handleServerError(error, "Failed to update section dates"),
      };
    }
  });
}

// =====================================
// SECTION-SPECIFIC UNIT SCHEDULE OPERATIONS
// =====================================

/**
 * Fetch unit schedules for a specific class section
 * Uses both scopeSequenceTag (curriculum) AND grade (content level) for unique identification
 * This handles cases like Grade 8 units appearing in both "Grade 8" and "Algebra 1" curricula
 */
export async function fetchSectionUnitSchedules(
  schoolYear: string,
  scopeSequenceTag: string,
  school: string,
  classSection: string,
) {
  return withDbConnection(async () => {
    try {
      const filter = {
        schoolYear,
        scopeSequenceTag,
        school,
        classSection,
      };

      // Sort by grade first (so Grade 8 prereqs come before Algebra 1), then by unitNumber
      const schedules = await UnitScheduleModel.find(filter)
        .sort({ grade: 1, unitNumber: 1 })
        .lean();

      const serialized = JSON.parse(JSON.stringify(schedules));
      return { success: true, data: serialized as UnitSchedule[] };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(
          error,
          "Failed to fetch section unit schedules",
        ),
      };
    }
  });
}

/**
 * Upsert a unit schedule for a specific class section
 * Uses scopeSequenceTag + grade + unitNumber for unique identification
 */
export async function upsertSectionUnitSchedule(data: {
  schoolYear: string;
  grade: string;
  scopeSequenceTag: string;
  school: string;
  classSection: string;
  unitNumber: number;
  unitName: string;
  startDate?: string;
  endDate?: string;
  sections: Array<{
    sectionId: string;
    subsection?: number; // Part number for split sections
    name: string;
    startDate?: string;
    endDate?: string;
    lessonCount?: number;
  }>;
}) {
  return withDbConnection(async () => {
    try {
      // Use scopeSequenceTag + grade + unitNumber to uniquely identify schedules
      // This handles Grade 8 units that appear in both "Grade 8" and "Algebra 1" curricula
      const filter = {
        schoolYear: data.schoolYear,
        scopeSequenceTag: data.scopeSequenceTag,
        grade: data.grade,
        school: data.school,
        classSection: data.classSection,
        unitNumber: data.unitNumber,
      };

      const schedule = await UnitScheduleModel.findOneAndUpdate(
        filter,
        {
          $set: {
            unitName: data.unitName,
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            sections: data.sections.map((s) => ({
              sectionId: s.sectionId,
              subsection: s.subsection,
              name: s.name,
              startDate: s.startDate || "",
              endDate: s.endDate || "",
              plannedDays: s.lessonCount || 0,
            })),
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
            ownerIds: [],
          },
        },
        { upsert: true, new: true },
      ).lean();

      const serialized = JSON.parse(JSON.stringify(schedule));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to save section unit schedule"),
      };
    }
  });
}

/**
 * Update section dates for a specific class section's unit
 * Uses scopeSequenceTag + grade to uniquely identify the schedule
 * Supports subsection for split sections (Part 1, Part 2, etc.)
 */
export async function updateSectionUnitDates(
  schoolYear: string,
  scopeSequenceTag: string,
  grade: string,
  school: string,
  classSection: string,
  unitNumber: number,
  sectionId: string,
  startDate: string,
  endDate: string,
  subsection?: number,
) {
  return withDbConnection(async () => {
    try {
      // Build query to find the right section using $elemMatch
      // This ensures both sectionId AND subsection conditions match the SAME array element
      // Without $elemMatch, separate array conditions could match different elements,
      // causing the positional $ operator to update the wrong section
      const query: Record<string, unknown> = {
        schoolYear,
        scopeSequenceTag,
        grade,
        school,
        classSection,
        unitNumber,
        sections: {
          $elemMatch: {
            sectionId: sectionId,
            subsection:
              subsection !== undefined
                ? subsection
                : { $in: [null, undefined] },
          },
        },
      };

      const schedule = await UnitScheduleModel.findOneAndUpdate(
        query,
        {
          $set: {
            "sections.$.startDate": startDate,
            "sections.$.endDate": endDate,
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true },
      ).lean();

      if (!schedule) {
        return { success: false, error: "Section unit schedule not found" };
      }

      const serialized = JSON.parse(JSON.stringify(schedule));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to update section unit dates"),
      };
    }
  });
}

/**
 * Update unit-level dates for a specific class section
 * Uses scopeSequenceTag + grade to uniquely identify the schedule
 */
export async function updateSectionUnitLevelDates(
  schoolYear: string,
  scopeSequenceTag: string,
  grade: string,
  school: string,
  classSection: string,
  unitNumber: number,
  startDate: string,
  endDate: string,
) {
  return withDbConnection(async () => {
    try {
      const schedule = await UnitScheduleModel.findOneAndUpdate(
        {
          schoolYear,
          scopeSequenceTag,
          grade,
          school,
          classSection,
          unitNumber,
        },
        {
          $set: {
            startDate,
            endDate,
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true },
      ).lean();

      if (!schedule) {
        return { success: false, error: "Section unit schedule not found" };
      }

      const serialized = JSON.parse(JSON.stringify(schedule));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(
          error,
          "Failed to update section unit level dates",
        ),
      };
    }
  });
}

/**
 * Copy unit schedules from one class section to another
 * Also copies subsection assignments from the source section's assignmentContent
 * @param unitNumbers - Optional array of unit numbers to copy. If not provided, copies all units.
 */
export async function copySectionUnitSchedules(
  schoolYear: string,
  scopeSequenceTag: string,
  fromSchool: string,
  fromClassSection: string,
  toSchool: string,
  toClassSection: string,
  unitNumbers?: number[],
) {
  return withDbConnection(async () => {
    try {
      // Build query - optionally filter by unit numbers
      const query: Record<string, unknown> = {
        schoolYear,
        scopeSequenceTag,
        school: fromSchool,
        classSection: fromClassSection,
      };

      if (unitNumbers && unitNumbers.length > 0) {
        query.unitNumber = { $in: unitNumbers };
      }

      // Fetch source schedules using scopeSequenceTag
      const sourceSchedules = await UnitScheduleModel.find(query).lean();

      if (sourceSchedules.length === 0) {
        return {
          success: false,
          error: "No schedules found in source section",
        };
      }

      // Copy each schedule to the target section
      const results = [];
      for (const source of sourceSchedules) {
        const copied = await UnitScheduleModel.findOneAndUpdate(
          {
            schoolYear,
            scopeSequenceTag,
            grade: source.grade,
            school: toSchool,
            classSection: toClassSection,
            unitNumber: source.unitNumber,
          },
          {
            $set: {
              unitName: source.unitName,
              startDate: source.startDate || "",
              endDate: source.endDate || "",
              sections: source.sections,
              color: source.color,
              notes: source.notes,
              updatedAt: new Date().toISOString(),
            },
            $setOnInsert: {
              createdAt: new Date().toISOString(),
              ownerIds: [],
            },
          },
          { upsert: true, new: true },
        ).lean();
        results.push(copied);
      }

      // Also copy subsection assignments from source section-config to target
      // This ensures lessons are properly mapped to subsections in the target
      const copiedUnitNumbers = results
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map((r) => (r as { unitNumber?: number }).unitNumber)
        .filter((n): n is number => typeof n === "number");
      if (copiedUnitNumbers.length > 0) {
        await copySubsectionAssignments(
          fromSchool,
          fromClassSection,
          toSchool,
          toClassSection,
          copiedUnitNumbers as number[],
        );
      }

      const serialized = JSON.parse(JSON.stringify(results));
      return {
        success: true,
        data: serialized as UnitSchedule[],
        message: `Copied ${results.length} unit schedules`,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(
          error,
          "Failed to copy section unit schedules",
        ),
      };
    }
  });
}

/**
 * Helper: Copy subsection assignments from one section-config to another
 * Only copies assignments for lessons in the specified units
 */
async function copySubsectionAssignments(
  fromSchool: string,
  fromClassSection: string,
  toSchool: string,
  toClassSection: string,
  unitNumbers: number[],
) {
  // Type for assignmentContent entries
  type AssignmentContentEntry = {
    scopeAndSequenceId?: string;
    unitLessonId?: string;
    lessonName?: string;
    section?: string;
    subsection?: number;
    grade?: string;
    podsieActivities?: unknown[];
    active?: boolean;
  };

  // Fetch source section config
  const sourceConfig = (await SectionConfigModel.findOne({
    school: fromSchool,
    classSection: fromClassSection,
  }).lean()) as { assignmentContent?: AssignmentContentEntry[] } | null;

  if (!sourceConfig?.assignmentContent) {
    return; // No assignments to copy
  }

  // Filter assignments that have subsections and belong to the copied units
  // unitLessonId format is like "3.1", "3.2" - the first number is the unit
  const assignmentsWithSubsections = sourceConfig.assignmentContent.filter(
    (a) => {
      if (a.subsection === undefined) return false;
      if (!a.unitLessonId) return false;
      const unitNum = parseInt(a.unitLessonId.split(".")[0], 10);
      return unitNumbers.includes(unitNum);
    },
  );

  if (assignmentsWithSubsections.length === 0) {
    return; // No subsection assignments to copy
  }

  // Find or create target section config
  let targetConfig = await SectionConfigModel.findOne({
    school: toSchool,
    classSection: toClassSection,
  });

  if (!targetConfig) {
    // Create new config for target section
    targetConfig = new SectionConfigModel({
      school: toSchool,
      classSection: toClassSection,
      gradeLevel: sourceConfig.assignmentContent[0]?.grade || "6",
      active: true,
      assignmentContent: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Get existing assignment content array
  const existingContent = (targetConfig.assignmentContent ||
    []) as unknown as AssignmentContentEntry[];

  // Helper to normalize ObjectId/string to comparable string
  const normalizeId = (id: unknown): string => {
    if (!id) return "";
    if (typeof id === "object" && id !== null) {
      if ("$oid" in id) return String((id as { $oid: string }).$oid);
      if ("str" in id) return String((id as { str: string }).str);
    }
    return String(id);
  };

  // For each assignment with subsection from source, update the matching entry in target
  // Only update existing entries - don't create new ones without Podsie activities
  for (const sourceAssignment of assignmentsWithSubsections) {
    const sourceId = normalizeId(sourceAssignment.scopeAndSequenceId);

    // Find existing entry - prefer entries WITH Podsie activities
    let existingIndex = existingContent.findIndex(
      (a: AssignmentContentEntry) =>
        normalizeId(a.scopeAndSequenceId) === sourceId &&
        a.podsieActivities &&
        a.podsieActivities.length > 0,
    );

    // Fallback: try without Podsie constraint
    if (existingIndex < 0) {
      existingIndex = existingContent.findIndex(
        (a: AssignmentContentEntry) =>
          normalizeId(a.scopeAndSequenceId) === sourceId,
      );
    }

    // Second fallback: match by unitLessonId - prefer entries WITH Podsie activities
    if (existingIndex < 0) {
      existingIndex = existingContent.findIndex(
        (a: AssignmentContentEntry) =>
          a.unitLessonId === sourceAssignment.unitLessonId &&
          a.podsieActivities &&
          a.podsieActivities.length > 0,
      );
    }

    if (existingIndex >= 0) {
      // Update existing entry with subsection
      existingContent[existingIndex].subsection = sourceAssignment.subsection;
    }
    // Don't create new entries - subsections are only meaningful for lessons with Podsie activities
  }

  targetConfig.assignmentContent = existingContent as never;
  (targetConfig as unknown as Record<string, unknown>).updatedAt =
    new Date().toISOString();
  await targetConfig.save();
}

// =====================================
// SUBSECTION SYNC OPERATIONS
// =====================================

/**
 * Sync the unit-schedule sections array when subsections are changed via the SubsectionsModal.
 * This ensures the saved schedule reflects the current subsection structure for proper copying.
 *
 * When a section is split into subsections (Part 1, Part 2, etc.), this function:
 * 1. Removes the old single section entry
 * 2. Creates new entries for each subsection
 * 3. Tries to preserve dates from the original section for the first subsection
 */
export async function syncScheduleSubsections(data: {
  schoolYear: string;
  scopeSequenceTag: string;
  grade: string;
  school: string;
  classSection: string;
  unitNumber: number;
  sectionId: string;
  subsections: Array<{
    subsection: number | undefined;
    lessonCount: number;
    name: string;
  }>;
}) {
  return withDbConnection(async () => {
    try {
      // Define type for lean document to avoid 'any' warnings
      type LeanUnitSchedule = {
        _id: unknown;
        sections?: Array<{
          sectionId: string;
          subsection?: number;
          name?: string;
          startDate?: string;
          endDate?: string;
          plannedDays?: number;
        }>;
      };

      // Find the existing schedule
      const existingSchedule = await UnitScheduleModel.findOne({
        schoolYear: data.schoolYear,
        scopeSequenceTag: data.scopeSequenceTag,
        grade: data.grade,
        school: data.school,
        classSection: data.classSection,
        unitNumber: data.unitNumber,
      }).lean<LeanUnitSchedule>();

      if (!existingSchedule) {
        // No schedule exists yet - nothing to sync
        return {
          success: true,
          data: null,
          message: "No existing schedule to sync",
        };
      }

      // Get dates from the old section entry (if it exists)
      const oldSection = existingSchedule.sections?.find(
        (s) => s.sectionId === data.sectionId && s.subsection === undefined,
      );
      const preservedStartDate = oldSection?.startDate || "";
      const preservedEndDate = oldSection?.endDate || "";

      // Remove all existing entries for this sectionId (both the base and any subsections)
      const otherSections = (existingSchedule.sections || []).filter(
        (s) => s.sectionId !== data.sectionId,
      );

      // Create new section entries for each subsection
      const newSectionEntries = data.subsections.map((sub, index) => ({
        sectionId: data.sectionId,
        subsection: sub.subsection,
        name: sub.name,
        // First subsection inherits dates from the old single entry (if any)
        startDate: index === 0 ? preservedStartDate : "",
        endDate: index === 0 ? preservedEndDate : "",
        plannedDays: sub.lessonCount,
      }));

      // Rebuild sections array maintaining order:
      // The sections should be in order: Ramp Up, A, A:1, A:2, B, B:1, B:2, ..., Unit Test
      // Sort by sectionId, then by subsection (undefined first, then 1, 2, 3...)
      const allSections = [...otherSections, ...newSectionEntries].sort(
        (a, b) => {
          // First sort by sectionId
          const aIsRampUp =
            a.sectionId === "Ramp Up" || a.sectionId === "Ramp Ups";
          const bIsRampUp =
            b.sectionId === "Ramp Up" || b.sectionId === "Ramp Ups";
          const aIsUnitTest =
            a.sectionId === "Unit Test" || a.sectionId === "Unit Assessment";
          const bIsUnitTest =
            b.sectionId === "Unit Test" || b.sectionId === "Unit Assessment";

          // Ramp Up always first
          if (aIsRampUp && !bIsRampUp) return -1;
          if (!aIsRampUp && bIsRampUp) return 1;
          // Unit Test always last
          if (aIsUnitTest && !bIsUnitTest) return 1;
          if (!aIsUnitTest && bIsUnitTest) return -1;

          // Otherwise sort alphabetically by sectionId
          if (a.sectionId !== b.sectionId) {
            return a.sectionId.localeCompare(b.sectionId);
          }

          // Same sectionId - sort by subsection (undefined first)
          if (a.subsection === undefined && b.subsection !== undefined)
            return -1;
          if (a.subsection !== undefined && b.subsection === undefined)
            return 1;
          return (a.subsection || 0) - (b.subsection || 0);
        },
      );

      // Update the schedule
      const updated = await UnitScheduleModel.findByIdAndUpdate(
        existingSchedule._id,
        {
          $set: {
            sections: allSections,
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true },
      ).lean();

      const serialized = JSON.parse(JSON.stringify(updated));
      return { success: true, data: serialized as UnitSchedule };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to sync schedule subsections"),
      };
    }
  });
}

// =====================================
// SCHEDULE SHIFT OPERATIONS
// =====================================

/**
 * Helper: Get the next school day (skips weekends and days off)
 */
function getNextSchoolDay(dateStr: string, daysOffSet: Set<string>): string {
  const date = new Date(dateStr + "T12:00:00");
  date.setDate(date.getDate() + 1);

  while (true) {
    const dayOfWeek = date.getDay();
    const newDateStr = date.toISOString().split("T")[0];

    // Skip weekends and days off
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !daysOffSet.has(newDateStr)) {
      return newDateStr;
    }

    date.setDate(date.getDate() + 1);
  }
}

/**
 * Helper: Get the previous school day (skips weekends and days off)
 */
function getPreviousSchoolDay(
  dateStr: string,
  daysOffSet: Set<string>,
): string {
  const date = new Date(dateStr + "T12:00:00");
  date.setDate(date.getDate() - 1);

  while (true) {
    const dayOfWeek = date.getDay();
    const newDateStr = date.toISOString().split("T")[0];

    // Skip weekends and days off
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !daysOffSet.has(newDateStr)) {
      return newDateStr;
    }

    date.setDate(date.getDate() - 1);
  }
}

/**
 * Shift all section schedule dates forward by one school day after a given date
 * Used when adding a day off mid-schedule
 */
export async function shiftSectionScheduleForward(
  schoolYear: string,
  scopeSequenceTag: string,
  school: string,
  classSection: string,
  afterDate: string,
  globalDaysOff: string[],
) {
  return withDbConnection(async () => {
    try {
      const daysOffSet = new Set(globalDaysOff);

      // Fetch existing section events to skip over them when shifting
      const calendar = (await SchoolCalendarModel.findOne({ schoolYear })
        .select("events")
        .lean()) as {
        events?: Array<{
          date: string;
          school?: string;
          classSection?: string;
        }>;
      } | null;

      if (calendar?.events) {
        // Add section-specific event dates to the skip set
        for (const event of calendar.events) {
          if (event.school === school && event.classSection === classSection) {
            daysOffSet.add(event.date);
          }
        }
      }

      // Find all schedules for this section
      const schedules = await UnitScheduleModel.find({
        schoolYear,
        scopeSequenceTag,
        school,
        classSection,
      }).lean();

      if (schedules.length === 0) {
        return { success: true, data: [], message: "No schedules to shift" };
      }

      const results = [];

      for (const schedule of schedules) {
        let needsUpdate = false;
        const updatedSections = schedule.sections.map(
          (section: {
            sectionId: string;
            startDate?: string;
            endDate?: string;
          }) => {
            const updated = { ...section };

            // Shift start date if it's on or after the day off date
            if (updated.startDate && updated.startDate >= afterDate) {
              updated.startDate = getNextSchoolDay(
                updated.startDate,
                daysOffSet,
              );
              needsUpdate = true;
            }

            // Shift end date if it's on or after the day off date
            if (updated.endDate && updated.endDate >= afterDate) {
              updated.endDate = getNextSchoolDay(updated.endDate, daysOffSet);
              needsUpdate = true;
            }

            return updated;
          },
        );

        // Also shift unit-level dates if they exist and are on or after the day off date
        let updatedStartDate = schedule.startDate;
        let updatedEndDate = schedule.endDate;

        if (schedule.startDate && schedule.startDate >= afterDate) {
          updatedStartDate = getNextSchoolDay(schedule.startDate, daysOffSet);
          needsUpdate = true;
        }
        if (schedule.endDate && schedule.endDate >= afterDate) {
          updatedEndDate = getNextSchoolDay(schedule.endDate, daysOffSet);
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updated = await UnitScheduleModel.findByIdAndUpdate(
            schedule._id,
            {
              $set: {
                sections: updatedSections,
                startDate: updatedStartDate,
                endDate: updatedEndDate,
                updatedAt: new Date().toISOString(),
              },
            },
            { new: true },
          ).lean();
          results.push(updated);
        }
      }

      const serialized = JSON.parse(JSON.stringify(results));
      return {
        success: true,
        data: serialized as UnitSchedule[],
        message: `Shifted ${results.length} unit schedules forward`,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(
          error,
          "Failed to shift section schedules forward",
        ),
      };
    }
  });
}

/**
 * Shift all section schedule dates backward by one school day after a given date
 * Used when removing a day off mid-schedule
 */
export async function shiftSectionScheduleBack(
  schoolYear: string,
  scopeSequenceTag: string,
  school: string,
  classSection: string,
  afterDate: string,
  globalDaysOff: string[],
) {
  return withDbConnection(async () => {
    try {
      const daysOffSet = new Set(globalDaysOff);

      // Fetch existing section events to skip over them when shifting
      const calendar = (await SchoolCalendarModel.findOne({ schoolYear })
        .select("events")
        .lean()) as {
        events?: Array<{
          date: string;
          school?: string;
          classSection?: string;
        }>;
      } | null;

      if (calendar?.events) {
        // Add section-specific event dates to the skip set
        for (const event of calendar.events) {
          if (event.school === school && event.classSection === classSection) {
            daysOffSet.add(event.date);
          }
        }
      }

      // Find all schedules for this section
      const schedules = await UnitScheduleModel.find({
        schoolYear,
        scopeSequenceTag,
        school,
        classSection,
      }).lean();

      if (schedules.length === 0) {
        return { success: true, data: [], message: "No schedules to shift" };
      }

      const results = [];

      for (const schedule of schedules) {
        let needsUpdate = false;
        const updatedSections = schedule.sections.map(
          (section: {
            sectionId: string;
            startDate?: string;
            endDate?: string;
          }) => {
            const updated = { ...section };

            // Shift start date back if it's after the afterDate
            if (updated.startDate && updated.startDate > afterDate) {
              updated.startDate = getPreviousSchoolDay(
                updated.startDate,
                daysOffSet,
              );
              needsUpdate = true;
            }

            // Shift end date back if it's after the afterDate
            if (updated.endDate && updated.endDate > afterDate) {
              updated.endDate = getPreviousSchoolDay(
                updated.endDate,
                daysOffSet,
              );
              needsUpdate = true;
            }

            return updated;
          },
        );

        // Also shift unit-level dates if they exist and are after afterDate
        let updatedStartDate = schedule.startDate;
        let updatedEndDate = schedule.endDate;

        if (schedule.startDate && schedule.startDate > afterDate) {
          updatedStartDate = getPreviousSchoolDay(
            schedule.startDate,
            daysOffSet,
          );
          needsUpdate = true;
        }
        if (schedule.endDate && schedule.endDate > afterDate) {
          updatedEndDate = getPreviousSchoolDay(schedule.endDate, daysOffSet);
          needsUpdate = true;
        }

        if (needsUpdate) {
          const updated = await UnitScheduleModel.findByIdAndUpdate(
            schedule._id,
            {
              $set: {
                sections: updatedSections,
                startDate: updatedStartDate,
                endDate: updatedEndDate,
                updatedAt: new Date().toISOString(),
              },
            },
            { new: true },
          ).lean();
          results.push(updated);
        }
      }

      const serialized = JSON.parse(JSON.stringify(results));
      return {
        success: true,
        data: serialized as UnitSchedule[],
        message: `Shifted ${results.length} unit schedules backward`,
      };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(
          error,
          "Failed to shift section schedules backward",
        ),
      };
    }
  });
}
