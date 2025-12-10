"use server";

import { UnitScheduleModel } from "@mongoose-schema/calendar";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";

/**
 * Result type for current unit lookup
 */
export interface CurrentUnitInfo {
  school: string;
  classSection: string;
  scopeSequenceTag: string;
  currentUnit: number | null;
  currentUnitName: string | null;
  currentSection: string | null; // The section within the unit (e.g., "A", "B", "Ramp Up")
  currentSectionName: string | null;
}

/**
 * Get current unit for all class sections based on today's date
 * Returns which unit each section is currently on based on unit schedule dates
 */
export async function getCurrentUnitsForAllSections(schoolYear: string) {
  return withDbConnection(async () => {
    try {
      // Fetch all unit schedules for the school year that have classSection defined
      const schedules = await UnitScheduleModel.find({
        schoolYear,
        classSection: { $exists: true, $ne: null }
      })
        .sort({ school: 1, classSection: 1, unitNumber: 1 })
        .lean();

      const today = new Date().toISOString().split("T")[0];

      // Group schedules by school + classSection
      const sectionSchedules = new Map<string, typeof schedules>();
      for (const schedule of schedules) {
        const key = `${schedule.school}|${schedule.classSection}`;
        if (!sectionSchedules.has(key)) {
          sectionSchedules.set(key, []);
        }
        sectionSchedules.get(key)!.push(schedule);
      }

      const results: CurrentUnitInfo[] = [];

      // For each section, find which unit they're currently on
      for (const [key, sectionScheds] of sectionSchedules) {
        const [school, classSection] = key.split("|");
        const firstSched = sectionScheds[0];

        let currentUnit: number | null = null;
        let currentUnitName: string | null = null;
        let currentSection: string | null = null;
        let currentSectionName: string | null = null;

        // Look through all unit schedules for this section
        for (const schedule of sectionScheds) {
          // Check if today falls within any section of this unit
          if (schedule.sections && Array.isArray(schedule.sections)) {
            for (const section of schedule.sections) {
              if (section.startDate && section.endDate) {
                if (today >= section.startDate && today <= section.endDate) {
                  currentUnit = schedule.unitNumber;
                  currentUnitName = schedule.unitName;
                  currentSection = section.sectionId;
                  currentSectionName = section.name;
                  break;
                }
              }
            }
          }

          // Also check unit-level dates as fallback
          if (!currentUnit && schedule.startDate && schedule.endDate) {
            if (today >= schedule.startDate && today <= schedule.endDate) {
              currentUnit = schedule.unitNumber;
              currentUnitName = schedule.unitName;
            }
          }

          if (currentUnit !== null) break;
        }

        // If no current unit found, check if we're past the last scheduled unit
        if (currentUnit === null && sectionScheds.length > 0) {
          // Sort by unit number descending to get the last unit
          const sortedByUnit = [...sectionScheds].sort((a, b) => b.unitNumber - a.unitNumber);
          const lastUnit = sortedByUnit[0];

          // Check if today is after the last section's end date
          if (lastUnit.sections && lastUnit.sections.length > 0) {
            const lastSection = lastUnit.sections[lastUnit.sections.length - 1];
            if (lastSection.endDate && today > lastSection.endDate) {
              // Past the schedule - show the last unit
              currentUnit = lastUnit.unitNumber;
              currentUnitName = lastUnit.unitName;
              currentSection = lastSection.sectionId;
              currentSectionName = lastSection.name;
            }
          } else if (lastUnit.endDate && today > lastUnit.endDate) {
            currentUnit = lastUnit.unitNumber;
            currentUnitName = lastUnit.unitName;
          }
        }

        // Note: scopeSequenceTag is optional in the Mongoose schema and not in the lean() type
        const schedWithTag = firstSched as typeof firstSched & { scopeSequenceTag?: string };
        results.push({
          school: school || "",
          classSection: classSection || "",
          scopeSequenceTag: schedWithTag.scopeSequenceTag || "",
          currentUnit,
          currentUnitName,
          currentSection,
          currentSectionName
        });
      }

      // Sort results by school, then classSection
      results.sort((a, b) => {
        if (a.school !== b.school) return a.school.localeCompare(b.school);
        return a.classSection.localeCompare(b.classSection);
      });

      return { success: true, data: results };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "Failed to get current units for sections")
      };
    }
  });
}
