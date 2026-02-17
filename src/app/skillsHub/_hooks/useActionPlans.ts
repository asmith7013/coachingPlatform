import { useQuery } from "@tanstack/react-query";
import { getActionPlans } from "../_actions/action-plan.actions";

export const actionPlanKeys = {
  all: ["action-plans"] as const,
  byTeacher: (id: string) => ["action-plans", id] as const,
};

export function useActionPlans(teacherStaffId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: actionPlanKeys.byTeacher(teacherStaffId),
    queryFn: async () => {
      const result = await getActionPlans(teacherStaffId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!teacherStaffId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    plans: data ?? [],
    loading: isLoading,
    error: error?.message || null,
  };
}
