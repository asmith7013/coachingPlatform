import { useState, useEffect } from "react";
import { fetchAllUnitsByScopeTag } from "@/app/actions/313/scope-and-sequence";
import { getSectionConfig } from "@/app/actions/313/section-config";
import { AssignmentContent } from "@zod-schema/313/podsie/section-config";
import { UnitOption } from "../types";
import { getGradeForSection, getSchoolForSection } from "../utils/sectionHelpers";

export function useUnitsAndConfig(scopeSequenceTag: string, selectedSection: string) {
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [sectionConfigAssignments, setSectionConfigAssignments] = useState<AssignmentContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUnitsAndSectionConfig = async () => {
      if (!scopeSequenceTag || !selectedSection) {
        setUnits([]);
        setSectionConfigAssignments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Load units - for section 802, load both Grade 8 and Algebra 1 units
        const grade = getGradeForSection(selectedSection);

        if (selectedSection === "802") {
          // Section 802 shows Algebra 1 units with both grade "8" and grade "Algebra 1"
          const [alg1Grade8Result, alg1GradeAlg1Result] = await Promise.all([
            fetchAllUnitsByScopeTag("Algebra 1", "8"),
            fetchAllUnitsByScopeTag("Algebra 1") // No grade filter to get Algebra 1 grade units
          ]);

          const allUnits: UnitOption[] = [];
          if (alg1Grade8Result.success) {
            allUnits.push(...alg1Grade8Result.data.map(u => ({ ...u, scopeSequenceTag: "Algebra 1" })));
          }
          if (alg1GradeAlg1Result.success) {
            // Only add units that aren't already in the list (avoid duplicates)
            const existingUnitNumbers = new Set(allUnits.map(u => u.unitNumber));
            const newUnits = alg1GradeAlg1Result.data
              .filter(u => !existingUnitNumbers.has(u.unitNumber))
              .map(u => ({ ...u, scopeSequenceTag: "Algebra 1" }));
            allUnits.push(...newUnits);
          }

          setUnits(allUnits);
        } else {
          // For other sections, load units normally
          const unitsResult = await fetchAllUnitsByScopeTag(scopeSequenceTag, grade);
          if (unitsResult.success) {
            setUnits(unitsResult.data);
          } else {
            setError(unitsResult.error || "Failed to load units");
          }
        }

        // Load section config to get assignment content
        const school = getSchoolForSection(selectedSection);
        const configResult = await getSectionConfig(school, selectedSection);
        if (configResult.success && configResult.data) {
          // Add scopeSequenceTag to each assignment from the parent config
          const assignmentsWithScope = (configResult.data.assignmentContent || []).map((assignment: AssignmentContent) => ({
            ...assignment,
            scopeSequenceTag: configResult.data.scopeSequenceTag
          }));
          setSectionConfigAssignments(assignmentsWithScope);
        } else {
          setSectionConfigAssignments([]);
        }
      } catch (err) {
        console.error("Error loading units and section config:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadUnitsAndSectionConfig();
  }, [scopeSequenceTag, selectedSection]);

  return { units, sectionConfigAssignments, loading, error, setSectionConfigAssignments };
}
