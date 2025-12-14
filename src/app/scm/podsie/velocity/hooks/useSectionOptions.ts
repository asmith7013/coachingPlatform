import { useQuery } from "@tanstack/react-query";
import { getAllSectionConfigs } from "@/app/actions/313/section-overview";
import { getSectionColors } from "../utils/colors";
import type { SectionOption } from "@/components/composed/section-visualization";

/**
 * Query keys for section options
 */
export const sectionOptionsKeys = {
  all: ["velocity-section-options"] as const,
};

interface SectionOptionsData {
  options: SectionOption[];
  colors: Map<string, string>;
}

/**
 * Hook for fetching section options with computed colors using React Query
 */
export function useSectionOptions() {
  const { data, isLoading, error } = useQuery({
    queryKey: sectionOptionsKeys.all,
    queryFn: async (): Promise<SectionOptionsData> => {
      const result = await getAllSectionConfigs();

      if (!result.success || !result.data) {
        throw new Error("Failed to load sections");
      }

      const options: (SectionOption & { specialPopulations?: string[] })[] = [];
      result.data.forEach((schoolGroup) => {
        schoolGroup.sections.forEach((section) => {
          options.push({
            id: section.id,
            school: schoolGroup.school,
            classSection: section.classSection,
            teacher: section.teacher,
            gradeLevel: section.gradeLevel,
            scopeSequenceTag: section.scopeSequenceTag,
            specialPopulations: section.specialPopulations,
            displayName: section.teacher
              ? `${section.classSection} (${section.teacher})`
              : section.classSection,
          });
        });
      });

      const colors = getSectionColors(options);

      return { options, colors };
    },
    staleTime: 5 * 60 * 1000, // Sections rarely change, cache for 5 minutes
  });

  return {
    sectionOptions: data?.options || [],
    sectionColors: data?.colors || new Map<string, string>(),
    loading: isLoading,
    error: error?.message || null,
  };
}
