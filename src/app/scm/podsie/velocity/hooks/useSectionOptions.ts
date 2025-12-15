import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllSectionConfigs } from "@/app/actions/scm/section-overview";
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

export interface SectionsBySchool {
  [school: string]: SectionOption[];
}

/**
 * Hook for fetching section options with computed colors using React Query.
 * This is the primary hook for section data - use this instead of useSections.
 *
 * Returns:
 * - sectionOptions: Full section objects with school, teacher, gradeLevel, etc.
 * - sections: Simple string array of class sections (e.g., ["802", "803"])
 * - sectionsBySchool: Sections grouped by school for dropdowns with headers
 * - sectionColors: Color map for visualizations
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

  // Memoize sectionOptions to prevent dependency issues
  const sectionOptions = useMemo(() => data?.options || [], [data?.options]);

  // Derive simple sections array
  const sections = useMemo(() => {
    return sectionOptions.map((s) => s.classSection).sort();
  }, [sectionOptions]);

  // Derive sections grouped by school
  const sectionsBySchool = useMemo(() => {
    const grouped: SectionsBySchool = {};
    for (const opt of sectionOptions) {
      if (!grouped[opt.school]) {
        grouped[opt.school] = [];
      }
      grouped[opt.school].push(opt);
    }
    // Sort sections within each school
    for (const school of Object.keys(grouped)) {
      grouped[school].sort((a, b) => a.classSection.localeCompare(b.classSection));
    }
    return grouped;
  }, [sectionOptions]);

  return {
    sectionOptions,
    sections,
    sectionsBySchool,
    sectionColors: data?.colors || new Map<string, string>(),
    loading: isLoading,
    error: error?.message || null,
  };
}
