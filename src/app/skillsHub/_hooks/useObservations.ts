import { useQuery } from "@tanstack/react-query";
import { getObservations } from "../_actions/observation.actions";

export const observationKeys = {
  all: ["observations"] as const,
  byTeacher: (id: string) => ["observations", id] as const,
};

export function useObservations(teacherStaffId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: observationKeys.byTeacher(teacherStaffId),
    queryFn: async () => {
      const result = await getObservations(teacherStaffId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!teacherStaffId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    observations: data ?? [],
    loading: isLoading,
    error: error?.message || null,
  };
}
