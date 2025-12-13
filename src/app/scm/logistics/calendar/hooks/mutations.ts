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
} from "@/app/actions/calendar/unit-schedule";
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
      if (input.existingScheduleId) {
        // Update existing schedule
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
              input.endDate
            )
          : await updateSectionDates(
              schoolYear,
              input.grade,
              input.unitNumber,
              input.sectionId,
              input.startDate,
              input.endDate
            );

        if (!result.success) {
          throw new Error(result.error || "Failed to update section dates");
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
              sections: input.sections.map((s) => ({
                sectionId: s.sectionId,
                name: s.name,
                startDate: s.sectionId === input.sectionId ? input.startDate : s.startDate,
                endDate: s.sectionId === input.sectionId ? input.endDate : s.endDate,
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
                name: s.name,
                startDate: s.sectionId === input.sectionId ? input.startDate : s.startDate,
                endDate: s.sectionId === input.sectionId ? input.endDate : s.endDate,
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
                sections: schedule.sections.map((s) =>
                  s.sectionId === input.sectionId
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

  return useOptimisticMutation<{ unitKey: string; grade: string; unitNumber: number; sectionId: string }, SavedUnitSchedule, Error, { previousData: SavedUnitSchedule[] | undefined }>(
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
            ""
          )
        : await updateSectionDates(
            schoolYear,
            input.grade,
            input.unitNumber,
            input.sectionId,
            "",
            ""
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
                sections: schedule.sections.map((s) =>
                  s.sectionId === input.sectionId
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
