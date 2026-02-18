import { useQuery } from "@tanstack/react-query";
import { getCoachTeachers } from "../admin/coaching-assignments/coaching-assignment.actions";
import type { PopulatedAssignment } from "../admin/coaching-assignments/coaching-assignment.types";

export const caseloadKeys = {
  all: ["coach-caseload"] as const,
  byCoach: (id: string) => ["coach-caseload", id] as const,
};

export function useCoachCaseload(coachStaffId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: caseloadKeys.byCoach(coachStaffId),
    queryFn: async () => {
      const result = await getCoachTeachers(coachStaffId);
      if (!result.success) throw new Error(result.error);
      return result.data as PopulatedAssignment[];
    },
    enabled: !!coachStaffId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    teachers: data ?? [],
    loading: isLoading,
    error: error?.message || null,
  };
}
