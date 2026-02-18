import { useQuery } from "@tanstack/react-query";
import { getTeacherSkillStatuses } from "../core/skill-status.actions";

export const skillStatusKeys = {
  all: ["skill-statuses"] as const,
  byTeacher: (id: string) => ["skill-statuses", id] as const,
};

export function useTeacherSkillStatuses(teacherStaffId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: skillStatusKeys.byTeacher(teacherStaffId),
    queryFn: async () => {
      const result = await getTeacherSkillStatuses(teacherStaffId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!teacherStaffId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    statuses: data ?? [],
    loading: isLoading,
    error: error?.message || null,
  };
}
