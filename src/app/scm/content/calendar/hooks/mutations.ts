"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useOptimisticMutation } from "@query/client/hooks/mutations/useOptimisticMutation";
import {
  addSectionDayOff,
  deleteSectionDayOff,
} from "@/app/actions/calendar/school-calendar";
import {
  updateSectionDates,
  updateUnitDates,
  updateSectionUnitDates,
  updateSectionUnitLevelDates,
  upsertUnitSchedule,
  upsertSectionUnitSchedule,
  copySectionUnitSchedules,
  shiftSectionScheduleForward,
  shiftSectionScheduleBack,
  syncScheduleSubsections,
} from "@/app/actions/calendar/unit-schedule";
import { updateLessonSubsections } from "@/app/actions/scm/podsie/section-config";
import {
  calendarKeys,
  type SavedUnitSchedule,
  type SectionDayOffEvent,
} from "./queries";
import type { SectionConfigOption, SectionSchedule } from "../components/types";

// =====================================
// TYPES
// =====================================

interface UpdateSectionDatesInput {
  unitKey: string;
  grade: string;
  unitNumber: number;
  unitName: string;
  sectionId: string;
  subsection?: number; // Part number for split sections
  startDate: string;
  endDate: string;
  sections: SectionSchedule[];
  existingScheduleId?: string;
}

interface UpdateUnitDatesInput {
  unitKey: string;
  grade: string;
  unitNumber: number;
  unitName: string;
  startDate: string;
  endDate: string;
  sections: SectionSchedule[];
  existingScheduleId?: string;
}

interface AddDayOffInput {
  date: string;
  name: string;
  shiftSchedule: boolean;
  targetSections: Array<{ school: string; classSection: string }>;
  hasMathClass: boolean;
}

interface DeleteDayOffInput {
  date: string;
  shiftSchedule: boolean;
}

interface CopySchedulesInput {
  targetSections: Array<{ school: string; classSection: string }>;
  unitNumbers: number[];
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Mutation to update section dates (start/end for a section within a unit)
 * Handles both grade-level and section-specific schedules
 */
export function useUpdateSectionDatesMutation(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null
) {
  const queryClient = useQueryClient();
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  const queryKey = selectedSection
    ? calendarKeys.sectionSchedules(
        schoolYear,
        scopeTag,
        selectedSection.school,
        selectedSection.classSection
      )
    : calendarKeys.gradeSchedules(schoolYear, selectedGrade);

  return useOptimisticMutation<UpdateSectionDatesInput, SavedUnitSchedule, Error, { previousData: SavedUnitSchedule[] | undefined }>(
    async (input) => {
      // Check if the TARGET section being updated has a subsection
      // We only need upsert when updating a subsection row (Part 1, Part 2, etc.)
      // because the DB might not have the subsection structure yet
      const targetHasSubsection = input.subsection !== undefined;

      console.log("[mutations] updateSectionDates called:", {
        sectionId: input.sectionId,
        subsection: input.subsection,
        targetHasSubsection,
        existingScheduleId: input.existingScheduleId,
        startDate: input.startDate,
        endDate: input.endDate,
        willUseUpsert: !input.existingScheduleId || targetHasSubsection,
        sectionsCount: input.sections.length,
        sections: input.sections.map(s => ({ sectionId: s.sectionId, subsection: s.subsection, name: s.name })),
      });

      if (input.existingScheduleId && !targetHasSubsection) {
        // Update existing schedule using positional operator
        // This works for base sections (no subsection) regardless of whether other sections have subsections
        const result = selectedSection
          ? await updateSectionUnitDates(
              schoolYear,
              scopeTag,
              input.grade,
              selectedSection.school,
              selectedSection.classSection,
              input.unitNumber,
              input.sectionId,
              input.startDate,
              input.endDate,
              input.subsection
            )
          : await updateSectionDates(
              schoolYear,
              input.grade,
              input.unitNumber,
              input.sectionId,
              input.startDate,
              input.endDate,
              input.subsection
            );

        if (!result.success) {
          throw new Error(result.error || "Failed to update section dates");
        }
        return result.data as unknown as SavedUnitSchedule;
      } else {
        // Create/update schedule using upsert (replaces entire sections array)
        // This handles: new schedules, and updates to subsection rows (Part 1, Part 2, etc.)
        //
        // IMPORTANT: When upserting, we need to preserve existing dates for sections we're NOT updating.
        // The input.sections comes from UI state which may have empty dates for newly split sections.
        // We only update the target section's dates; others keep their UI state dates.
        const result = selectedSection
          ? await upsertSectionUnitSchedule({
              schoolYear,
              grade: input.grade,
              scopeSequenceTag: scopeTag,
              school: selectedSection.school,
              classSection: selectedSection.classSection,
              unitNumber: input.unitNumber,
              unitName: input.unitName,
              sections: input.sections.map((s) => ({
                sectionId: s.sectionId,
                subsection: s.subsection,
                name: s.name,
                startDate: s.sectionId === input.sectionId && s.subsection === input.subsection ? input.startDate : s.startDate,
                endDate: s.sectionId === input.sectionId && s.subsection === input.subsection ? input.endDate : s.endDate,
                lessonCount: s.lessonCount,
              })),
            })
          : await upsertUnitSchedule({
              schoolYear,
              grade: input.grade,
              unitNumber: input.unitNumber,
              unitName: input.unitName,
              sections: input.sections.map((s) => ({
                sectionId: s.sectionId,
                subsection: s.subsection,
                name: s.name,
                startDate: s.sectionId === input.sectionId && s.subsection === input.subsection ? input.startDate : s.startDate,
                endDate: s.sectionId === input.sectionId && s.subsection === input.subsection ? input.endDate : s.endDate,
                lessonCount: s.lessonCount,
              })),
            });

        console.log("[mutations] upsert result:", { success: result.success, error: result.error });
        if (!result.success) {
          throw new Error(result.error || "Failed to create schedule");
        }
        return result.data as unknown as SavedUnitSchedule;
      }
    },
    {
      invalidateQueries: [queryKey],
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<SavedUnitSchedule[]>(queryKey);

        // Optimistically update the cache
        queryClient.setQueryData<SavedUnitSchedule[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((schedule) => {
            if (schedule.grade === input.grade && schedule.unitNumber === input.unitNumber) {
              return {
                ...schedule,
                sections: schedule.sections.map((s: { sectionId: string; subsection?: number; name: string; startDate?: string; endDate?: string }) =>
                  s.sectionId === input.sectionId && s.subsection === input.subsection
                    ? { ...s, startDate: input.startDate, endDate: input.endDate }
                    : s
                ),
              };
            }
            return schedule;
          });
        });

        return { previousData };
      },
      onError: (_err, _input, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      },
      errorContext: "Update section dates",
    }
  );
}

/**
 * Mutation to update unit-level dates
 */
export function useUpdateUnitDatesMutation(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null
) {
  const queryClient = useQueryClient();
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  const queryKey = selectedSection
    ? calendarKeys.sectionSchedules(
        schoolYear,
        scopeTag,
        selectedSection.school,
        selectedSection.classSection
      )
    : calendarKeys.gradeSchedules(schoolYear, selectedGrade);

  return useOptimisticMutation<UpdateUnitDatesInput, SavedUnitSchedule, Error, { previousData: SavedUnitSchedule[] | undefined }>(
    async (input) => {
      if (input.existingScheduleId) {
        // Update existing schedule
        const result = selectedSection
          ? await updateSectionUnitLevelDates(
              schoolYear,
              scopeTag,
              input.grade,
              selectedSection.school,
              selectedSection.classSection,
              input.unitNumber,
              input.startDate,
              input.endDate
            )
          : await updateUnitDates(
              schoolYear,
              input.grade,
              input.unitNumber,
              input.startDate,
              input.endDate
            );

        if (!result.success) {
          throw new Error(result.error || "Failed to update unit dates");
        }
        return result.data as unknown as SavedUnitSchedule;
      } else {
        // Create new schedule
        const result = selectedSection
          ? await upsertSectionUnitSchedule({
              schoolYear,
              grade: input.grade,
              scopeSequenceTag: scopeTag,
              school: selectedSection.school,
              classSection: selectedSection.classSection,
              unitNumber: input.unitNumber,
              unitName: input.unitName,
              startDate: input.startDate,
              endDate: input.endDate,
              sections: input.sections.map((s) => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
                lessonCount: s.lessonCount,
              })),
            })
          : await upsertUnitSchedule({
              schoolYear,
              grade: input.grade,
              unitNumber: input.unitNumber,
              unitName: input.unitName,
              startDate: input.startDate,
              endDate: input.endDate,
              sections: input.sections.map((s) => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.startDate,
                endDate: s.endDate,
                lessonCount: s.lessonCount,
              })),
            });

        if (!result.success) {
          throw new Error(result.error || "Failed to create schedule");
        }
        return result.data as unknown as SavedUnitSchedule;
      }
    },
    {
      invalidateQueries: [queryKey],
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<SavedUnitSchedule[]>(queryKey);

        // Optimistically update the cache
        queryClient.setQueryData<SavedUnitSchedule[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((schedule) => {
            if (schedule.grade === input.grade && schedule.unitNumber === input.unitNumber) {
              return {
                ...schedule,
                startDate: input.startDate,
                endDate: input.endDate,
              };
            }
            return schedule;
          });
        });

        return { previousData };
      },
      onError: (_err, _input, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      },
      errorContext: "Update unit dates",
    }
  );
}

/**
 * Mutation to add a section day off
 */
export function useAddDayOffMutation(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null,
  globalDaysOff: string[]
) {
  const queryClient = useQueryClient();
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  return useOptimisticMutation<AddDayOffInput, void, Error, void>(
    async (input) => {
      if (!selectedSection) {
        throw new Error("No section selected");
      }

      // Add the event for each target section
      for (const target of input.targetSections) {
        await addSectionDayOff(schoolYear, {
          date: input.date,
          name: input.name,
          school: target.school,
          classSection: target.classSection,
          hasMathClass: input.hasMathClass,
        });

        // Shift schedule if requested
        if (input.shiftSchedule) {
          await shiftSectionScheduleForward(
            schoolYear,
            scopeTag,
            target.school,
            target.classSection,
            input.date,
            globalDaysOff
          );
        }
      }
    },
    {
      onSuccess: async () => {
        if (selectedSection) {
          // Invalidate section days off
          await queryClient.invalidateQueries({
            queryKey: calendarKeys.sectionDaysOff(
              schoolYear,
              selectedSection.school,
              selectedSection.classSection
            ),
          });
          // Invalidate schedules (in case they were shifted)
          await queryClient.invalidateQueries({
            queryKey: calendarKeys.sectionSchedules(
              schoolYear,
              scopeTag,
              selectedSection.school,
              selectedSection.classSection
            ),
          });
        }
      },
      errorContext: "Add day off",
    }
  );
}

/**
 * Mutation to delete a section day off
 */
export function useDeleteDayOffMutation(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null,
  globalDaysOff: string[]
) {
  const queryClient = useQueryClient();
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  return useOptimisticMutation<DeleteDayOffInput, void, Error, { previousDaysOff: SectionDayOffEvent[] | undefined }>(
    async (input) => {
      if (!selectedSection) {
        throw new Error("No section selected");
      }

      // Delete the day off
      await deleteSectionDayOff(
        schoolYear,
        input.date,
        selectedSection.school,
        selectedSection.classSection
      );

      // Shift schedule back if requested
      if (input.shiftSchedule) {
        await shiftSectionScheduleBack(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection,
          input.date,
          globalDaysOff
        );
      }
    },
    {
      onMutate: async (input) => {
        if (!selectedSection) return { previousDaysOff: undefined };

        const queryKey = calendarKeys.sectionDaysOff(
          schoolYear,
          selectedSection.school,
          selectedSection.classSection
        );
        await queryClient.cancelQueries({ queryKey });
        const previousDaysOff = queryClient.getQueryData<SectionDayOffEvent[]>(queryKey);

        // Optimistically remove the day off
        queryClient.setQueryData<SectionDayOffEvent[]>(queryKey, (old) => {
          if (!old) return old;
          return old.filter((d) => d.date !== input.date);
        });

        return { previousDaysOff };
      },
      onError: (_err, _input, context) => {
        if (context?.previousDaysOff && selectedSection) {
          queryClient.setQueryData(
            calendarKeys.sectionDaysOff(
              schoolYear,
              selectedSection.school,
              selectedSection.classSection
            ),
            context.previousDaysOff
          );
        }
      },
      onSuccess: async () => {
        if (selectedSection) {
          // Invalidate schedules (in case they were shifted)
          await queryClient.invalidateQueries({
            queryKey: calendarKeys.sectionSchedules(
              schoolYear,
              scopeTag,
              selectedSection.school,
              selectedSection.classSection
            ),
          });
        }
      },
      errorContext: "Delete day off",
    }
  );
}

/**
 * Mutation to copy schedules to other sections
 */
export function useCopySchedulesMutation(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null
) {
  const queryClient = useQueryClient();
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  return useOptimisticMutation<CopySchedulesInput, void, Error, void>(
    async (input) => {
      if (!selectedSection) {
        throw new Error("No source section selected");
      }

      // Copy to each target section
      for (const target of input.targetSections) {
        await copySectionUnitSchedules(
          schoolYear,
          scopeTag,
          selectedSection.school,
          selectedSection.classSection,
          target.school,
          target.classSection,
          input.unitNumbers
        );
      }
    },
    {
      onSuccess: async () => {
        // Invalidate all section schedules for this scope
        await queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              key[0] === "calendar" &&
              key[1] === "section-schedules" &&
              key[2] === schoolYear &&
              key[3] === scopeTag
            );
          },
        });
      },
      errorContext: "Copy schedules",
    }
  );
}

/**
 * Mutation to clear section dates
 */
export function useClearSectionDatesMutation(
  schoolYear: string,
  selectedGrade: string,
  selectedSection: SectionConfigOption | null
) {
  const queryClient = useQueryClient();
  const scopeTag = selectedSection?.scopeSequenceTag ||
    (selectedGrade === "Algebra 1" ? "Algebra 1" : `Grade ${selectedGrade}`);

  const queryKey = selectedSection
    ? calendarKeys.sectionSchedules(
        schoolYear,
        scopeTag,
        selectedSection.school,
        selectedSection.classSection
      )
    : calendarKeys.gradeSchedules(schoolYear, selectedGrade);

  return useOptimisticMutation<{ unitKey: string; grade: string; unitNumber: number; sectionId: string; subsection?: number }, SavedUnitSchedule, Error, { previousData: SavedUnitSchedule[] | undefined }>(
    async (input) => {
      const result = selectedSection
        ? await updateSectionUnitDates(
            schoolYear,
            scopeTag,
            input.grade,
            selectedSection.school,
            selectedSection.classSection,
            input.unitNumber,
            input.sectionId,
            "",
            "",
            input.subsection
          )
        : await updateSectionDates(
            schoolYear,
            input.grade,
            input.unitNumber,
            input.sectionId,
            "",
            "",
            input.subsection
          );

      if (!result.success) {
        throw new Error(result.error || "Failed to clear section dates");
      }
      return result.data as unknown as SavedUnitSchedule;
    },
    {
      invalidateQueries: [queryKey],
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<SavedUnitSchedule[]>(queryKey);

        // Optimistically clear the dates
        queryClient.setQueryData<SavedUnitSchedule[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((schedule) => {
            if (schedule.grade === input.grade && schedule.unitNumber === input.unitNumber) {
              return {
                ...schedule,
                sections: schedule.sections.map((s: { sectionId: string; subsection?: number; name: string; startDate?: string; endDate?: string }) =>
                  s.sectionId === input.sectionId && s.subsection === input.subsection
                    ? { ...s, startDate: "", endDate: "" }
                    : s
                ),
              };
            }
            return schedule;
          });
        });

        return { previousData };
      },
      onError: (_err, _input, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      },
      errorContext: "Clear section dates",
    }
  );
}

// =====================================
// SUBSECTION MUTATIONS
// =====================================

interface UpdateSubsectionsInput {
  updates: Array<{
    scopeAndSequenceId: string;
    unitLessonId: string;
    lessonName: string;
    section: string;
    subsection: number | null;
    grade: string;
  }>;
  // Info needed to sync the unit-schedule document
  scheduleSync?: {
    schoolYear: string;
    unitNumber: number;
    sectionId: string;
  };
}

/**
 * Mutation to update lesson subsections in section-config
 * Also syncs the unit-schedule document to keep sections in sync for proper copying
 */
export function useUpdateSubsectionsMutation(
  selectedSection: SectionConfigOption | null
) {
  const queryClient = useQueryClient();

  return useOptimisticMutation<UpdateSubsectionsInput, void, Error, void>(
    async (input) => {
      if (!selectedSection) {
        throw new Error("No section selected");
      }

      // First, update the section-config assignmentContent
      const result = await updateLessonSubsections(
        selectedSection.school,
        selectedSection.classSection,
        input.updates
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update subsections");
      }

      // Then, sync the unit-schedule document if scheduleSync info provided
      if (input.scheduleSync && selectedSection.scopeSequenceTag) {
        // Group lessons by their subsection assignment
        const subsectionGroups = new Map<number | undefined, Array<{ subsection: number | undefined; name: string }>>();
        for (const update of input.updates) {
          const sub = update.subsection ?? undefined;
          if (!subsectionGroups.has(sub)) {
            subsectionGroups.set(sub, []);
          }
          subsectionGroups.get(sub)!.push({ subsection: sub, name: update.lessonName });
        }

        // Build subsections array for the sync
        const subsections = Array.from(subsectionGroups.entries())
          .sort((a, b) => {
            if (a[0] === undefined && b[0] !== undefined) return -1;
            if (a[0] !== undefined && b[0] === undefined) return 1;
            return (a[0] || 0) - (b[0] || 0);
          })
          .map(([sub, lessons]) => ({
            subsection: sub,
            lessonCount: lessons.length,
            name: sub !== undefined
              ? `Section ${input.scheduleSync!.sectionId} (Part ${sub})`
              : `Section ${input.scheduleSync!.sectionId} (Unassigned)`,
          }));

        // If there's only one group with no subsection, don't create Unassigned
        // Instead, create a single entry without subsection
        const allUnassigned = subsections.length === 1 && subsections[0].subsection === undefined;
        const normalizedSubsections = allUnassigned
          ? [{
              subsection: undefined,
              lessonCount: subsections[0].lessonCount,
              name: `Section ${input.scheduleSync!.sectionId}`,
            }]
          : subsections;

        await syncScheduleSubsections({
          schoolYear: input.scheduleSync.schoolYear,
          scopeSequenceTag: selectedSection.scopeSequenceTag,
          grade: input.updates[0]?.grade || "6",
          school: selectedSection.school,
          classSection: selectedSection.classSection,
          unitNumber: input.scheduleSync.unitNumber,
          sectionId: input.scheduleSync.sectionId,
          subsections: normalizedSubsections,
        });
      }
    },
    {
      onSuccess: async () => {
        if (selectedSection) {
          // Invalidate assignment content cache
          await queryClient.invalidateQueries({
            queryKey: calendarKeys.assignmentContent(
              selectedSection.school,
              selectedSection.classSection
            ),
          });
          // Also invalidate schedules cache since we might have synced them
          const scopeTag = selectedSection.scopeSequenceTag || `Grade ${selectedSection.gradeLevel}`;
          await queryClient.invalidateQueries({
            predicate: (query) => {
              const key = query.queryKey;
              return (
                key[0] === "calendar" &&
                key[1] === "section-schedules" &&
                key[3] === scopeTag &&
                key[4] === selectedSection.school &&
                key[5] === selectedSection.classSection
              );
            },
          });
        }
      },
      errorContext: "Update subsections",
    }
  );
}
