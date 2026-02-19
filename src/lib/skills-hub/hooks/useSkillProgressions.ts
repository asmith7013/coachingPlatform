import { useQuery } from "@tanstack/react-query";
import { getSkillProgressions } from "../coach/skill-progressions/skill-progression.actions";

export const skillProgressionKeys = {
  all: ["skill-progressions"] as const,
  byTeacher: (id: string) => ["skill-progressions", id] as const,
};

export function useSkillProgressions(teacherStaffId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: skillProgressionKeys.byTeacher(teacherStaffId),
    queryFn: async () => {
      const result = await getSkillProgressions(teacherStaffId);
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
