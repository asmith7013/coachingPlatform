import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchAllUnitsByScopeTag } from "@/app/actions/scm/scope-and-sequence/scope-and-sequence";
import { getSectionConfig } from "@/app/actions/scm/podsie/section-config";
import { AssignmentContent } from "@zod-schema/scm/podsie/section-config";
import { UnitOption } from "../types";
import { getGradeForSection, getSchoolForSection } from "../utils/sectionHelpers";

/**
 * Query keys for units and section config
 */
export const unitsConfigKeys = {
  all: ["units-config"] as const,
  units: (scopeTag: string, section: string) =>
    [...unitsConfigKeys.all, "units", scopeTag, section] as const,
  sectionConfig: (section: string) =>
    [...unitsConfigKeys.all, "section-config", section] as const,
};

interface SectionConfigData {
  assignments: AssignmentContent[];
  groupId: string | null;
}

/**
 * Hook for fetching units and section config using React Query
 */
export function useUnitsAndConfig(scopeSequenceTag: string, selectedSection: string) {
  const queryClient = useQueryClient();

  const enabled = Boolean(scopeSequenceTag && selectedSection);
  const grade = getGradeForSection(selectedSection);

  // Query for units
  const unitsQuery = useQuery({
    queryKey: unitsConfigKeys.units(scopeSequenceTag, selectedSection),
    queryFn: async (): Promise<UnitOption[]> => {
      if (selectedSection === "802") {
        // Section 802 shows Algebra 1 units with both grade "8" and grade "Algebra 1"
        const [alg1Grade8Result, alg1GradeAlg1Result] = await Promise.all([
          fetchAllUnitsByScopeTag("Algebra 1", "8"),
          fetchAllUnitsByScopeTag("Algebra 1"), // No grade filter to get Algebra 1 grade units
        ]);

        const allUnits: UnitOption[] = [];
        if (alg1Grade8Result.success) {
          allUnits.push(
            ...alg1Grade8Result.data.map((u) => ({ ...u, scopeSequenceTag: "Algebra 1" }))
          );
        }
        if (alg1GradeAlg1Result.success) {
          // Only add units that aren't already in the list (avoid duplicates)
          const existingUnitNumbers = new Set(allUnits.map((u) => u.unitNumber));
          const newUnits = alg1GradeAlg1Result.data
            .filter((u) => !existingUnitNumbers.has(u.unitNumber))
            .map((u) => ({ ...u, scopeSequenceTag: "Algebra 1" }));
          allUnits.push(...newUnits);
        }
        return allUnits;
      }

      // For other sections, load units normally
      const unitsResult = await fetchAllUnitsByScopeTag(scopeSequenceTag, grade);
      if (unitsResult.success) {
        return unitsResult.data;
      }
      throw new Error(unitsResult.error || "Failed to load units");
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Units rarely change, cache for 5 minutes
  });

  // Query for section config
  const configQuery = useQuery({
    queryKey: unitsConfigKeys.sectionConfig(selectedSection),
    queryFn: async (): Promise<SectionConfigData> => {
      const school = getSchoolForSection(selectedSection);
      const configResult = await getSectionConfig(school, selectedSection);

      if (configResult.success && configResult.data) {
        // Add scopeSequenceTag to each assignment from the parent config
        const assignmentsWithScope = (configResult.data.assignmentContent || []).map(
          (assignment: AssignmentContent) => ({
            ...assignment,
            scopeSequenceTag: configResult.data.scopeSequenceTag,
          })
        );
        return {
          assignments: assignmentsWithScope,
          groupId: configResult.data.groupId || null,
        };
      }
      return { assignments: [], groupId: null };
    },
    enabled: Boolean(selectedSection),
    staleTime: 60_000, // Cache for 1 minute
  });

  /**
   * Update section config assignments in the cache
   */
  const setSectionConfigAssignments = useCallback(
    (newAssignments: AssignmentContent[]) => {
      queryClient.setQueryData<SectionConfigData>(
        unitsConfigKeys.sectionConfig(selectedSection),
        (prev) => ({
          assignments: newAssignments,
          groupId: prev?.groupId || null,
        })
      );
    },
    [queryClient, selectedSection]
  );

  // Combine loading and error states
  const loading = unitsQuery.isLoading || configQuery.isLoading;
  const error =
    unitsQuery.error?.message || configQuery.error?.message || null;

  return {
    units: unitsQuery.data || [],
    sectionConfigAssignments: configQuery.data?.assignments || [],
    groupId: configQuery.data?.groupId || null,
    loading,
    error,
    setSectionConfigAssignments,
  };
}
