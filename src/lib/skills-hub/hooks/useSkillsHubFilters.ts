import { useCallback } from "react";
import { useLocalStorage } from "@/hooks/ui/useLocalStorage";

export function useSkillsHubFilters() {
  const [selectedCoachId, setSelectedCoachId] = useLocalStorage<string | null>(
    "skillshub-filter-coach-id",
    null,
  );
  const [selectedTeacherId, setSelectedTeacherId] = useLocalStorage<
    string | null
  >("skillshub-filter-teacher-id", null);

  const handleCoachChange = useCallback(
    (coachId: string | null) => {
      setSelectedCoachId(coachId);
      setSelectedTeacherId(null);
    },
    [setSelectedCoachId, setSelectedTeacherId],
  );

  const handleTeacherChange = useCallback(
    (teacherId: string | null) => {
      setSelectedTeacherId(teacherId);
    },
    [setSelectedTeacherId],
  );

  return {
    selectedCoachId,
    selectedTeacherId,
    setSelectedCoachId: handleCoachChange,
    setSelectedTeacherId: handleTeacherChange,
  };
}
