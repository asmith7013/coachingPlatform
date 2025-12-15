import { useQuery } from "@tanstack/react-query";
import { getGradeUnitPairsByTag } from "@/app/actions/scm/scope-and-sequence/scope-and-sequence";

export const gradeUnitPairsKeys = {
  all: ["grade-unit-pairs"] as const,
  byTag: (scopeSequenceTag: string) =>
    [...gradeUnitPairsKeys.all, scopeSequenceTag] as const,
};

interface GradeUnitPair {
  grade: string;
  unitNumber: number;
}

export function useGradeUnitPairs(scopeSequenceTag: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: gradeUnitPairsKeys.byTag(scopeSequenceTag),
    queryFn: async () => {
      const result = await getGradeUnitPairsByTag(scopeSequenceTag);
      if (!result.success) {
        throw new Error(result.error || "Failed to load grade/unit pairs");
      }
      return result.data as GradeUnitPair[];
    },
    enabled: !!scopeSequenceTag,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    gradeUnitPairs: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
