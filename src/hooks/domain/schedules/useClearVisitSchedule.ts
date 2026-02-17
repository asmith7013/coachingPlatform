import { useVisitSchedules } from "./useVisitSchedules";

export function useClearVisitSchedule() {
  const visitSchedules = useVisitSchedules.manager();

  const clearSchedule = async (visitScheduleId: string) => {
    if (!visitSchedules.updateAsync) {
      throw new Error("Visit schedules manager not available");
    }

    return await visitSchedules.updateAsync(visitScheduleId, {
      timeBlocks: [], // Empties the timeBlocks array
    });
  };

  return {
    clearSchedule,
    isClearing: visitSchedules.isUpdating || false,
  };
}
