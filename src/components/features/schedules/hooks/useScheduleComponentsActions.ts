import { useCallback } from "react";
import { useVisitSchedules } from "@/hooks/domain/schedules/useVisitSchedules";
import { ScheduleAssignmentType } from "@/lib/schema/enum/shared-enums";
import { VisitScheduleBlock } from "@zod-schema/schedules/schedule-events";
import { handleClientError } from "@error/handlers/client";
import { handleValidationError } from "@error/handlers/validation";
import {
  createScheduleComponentsErrorContext,
  createScheduleComponentsDataErrorContext,
} from "../utils";
import { ZodError } from "zod";
import type { BellSchedule } from "@zod-schema/schedules/schedule-documents";

interface UseScheduleComponentsActionsProps {
  schoolId: string;
  date: string;
  bellSchedule?: BellSchedule;
}

/**
 * Business logic hook for schedulesComponents
 * Extracted from VisitScheduleTestPage pattern
 */
export function useScheduleComponentsActions({
  schoolId,
  date,
  bellSchedule,
}: UseScheduleComponentsActionsProps) {
  const visitSchedules = useVisitSchedules.list({ filters: { schoolId } });
  const visitScheduleMutations = useVisitSchedules.mutations();

  // Use first available schedule or create new one
  const currentVisitSchedule = visitSchedules.items?.[0];

  const scheduleVisit = useCallback(
    async (
      teacherId: string,
      periodNumber: number,
      portion: ScheduleAssignmentType,
    ) => {
      console.log("🎯 scheduleVisit called:", {
        periodNumber,
        portion,
        teacherId,
        currentVisitScheduleId: currentVisitSchedule?._id,
      });

      if (!teacherId || !currentVisitSchedule || !bellSchedule) {
        const errorContext = createScheduleComponentsErrorContext(
          "scheduleVisit",
          {
            teacherId: !!teacherId,
            currentVisitSchedule: !!currentVisitSchedule,
            bellSchedule: !!bellSchedule,
          },
        );
        handleClientError(
          new Error("Missing required data for scheduling"),
          errorContext,
        );
        return {
          success: false,
          error: "Missing required data for scheduling",
        };
      }

      // Find the time slot for this period from bell schedule
      const timeSlot = bellSchedule.timeBlocks?.find(
        (slot) => slot.periodNumber === periodNumber,
      );
      if (!timeSlot) {
        const errorContext = createScheduleComponentsErrorContext(
          "findTimeSlot",
          { periodNumber },
        );
        handleClientError(
          new Error(`No time slot found for period ${periodNumber}`),
          errorContext,
        );
        return {
          success: false,
          error: `No time slot found for period ${periodNumber}`,
        };
      }

      // Create new visit schedule block
      const newTimeBlock: VisitScheduleBlock = {
        blockType: "visitScheduleBlock",
        periodNumber,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        orderIndex: 1,
        eventType: "Observation",
        staffIds: [teacherId],
        portion,
      };

      console.log("🎯 Creating time block:", newTimeBlock);

      try {
        if (!visitScheduleMutations.updateAsync) {
          const errorContext = createScheduleComponentsErrorContext(
            "mutationAccess",
            {
              availableMethods: Object.keys(visitScheduleMutations),
            },
          );
          handleClientError(
            new Error("updateAsync mutation not available"),
            errorContext,
          );
          return {
            success: false,
            error: "updateAsync mutation not available",
          };
        }

        // Update with new time block
        const updatedTimeBlocks = [
          ...(currentVisitSchedule.timeBlocks || []),
          newTimeBlock,
        ];
        console.log("🎯 Updating with blocks:", updatedTimeBlocks.length);

        const updateResult = await visitScheduleMutations.updateAsync(
          currentVisitSchedule._id,
          {
            timeBlocks: updatedTimeBlocks,
          },
        );

        console.log("✅ Update result:", updateResult);

        // Check for validation errors in response
        if (updateResult && !updateResult.success) {
          // Handle 422 validation errors specifically
          if (updateResult.error?.includes("[422]")) {
            const errorContext = createScheduleComponentsErrorContext(
              "validation",
              {
                timeBlock: newTimeBlock,
                periodNumber,
                portion,
                teacherId,
              },
            );
            const formattedError = handleValidationError(
              new ZodError([
                {
                  code: "custom",
                  message: updateResult.error || "Validation failed",
                  path: ["timeBlocks"],
                },
              ]),
              errorContext,
            );
            console.error("❌ Validation Error:", formattedError);
            return { success: false, error: formattedError };
          }

          // Handle other API errors
          const errorContext = createScheduleComponentsErrorContext(
            "updateSchedule",
            {
              updateResult,
              timeBlocksCount: updatedTimeBlocks.length,
            },
          );
          handleClientError(
            new Error(updateResult.error || "Update failed"),
            errorContext,
          );
          return {
            success: false,
            error: updateResult.error || "Update failed",
          };
        }

        // Refresh data
        console.log("🔄 Refetching visit schedules...");
        await visitSchedules.refetch();
        console.log("✅ Refetch complete");

        return { success: true };
      } catch (error) {
        const errorContext = createScheduleComponentsDataErrorContext(
          "scheduleVisit",
          schoolId,
          date,
          {
            periodNumber,
            portion,
            teacherId,
            timeBlockData: newTimeBlock,
          },
        );
        handleClientError(error, errorContext);
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Schedule operation failed",
        };
      }
    },
    [
      schoolId,
      date,
      bellSchedule,
      currentVisitSchedule,
      visitScheduleMutations,
      visitSchedules,
    ],
  );

  return {
    scheduleVisit,
    currentVisitSchedule,
    isLoading: visitScheduleMutations.isUpdating || visitSchedules.isLoading,
    error: visitScheduleMutations.updateError || visitSchedules.error,
  };
}
