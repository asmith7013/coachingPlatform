import { useState, useEffect } from "react";
import { fetchRampUpsByUnit } from "@/app/actions/313/scope-and-sequence";
import { SECTION_OPTIONS } from "@zod-schema/313/scope-and-sequence";
import { PodsieAssignment } from "@zod-schema/313/section-config";
import { LessonConfig } from "../types";

export function useLessons(
  scopeSequenceTag: string,
  selectedSection: string,
  selectedUnit: number | null,
  selectedLessonSection: string,
  sectionConfigAssignments: PodsieAssignment[]
) {
  const [lessons, setLessons] = useState<LessonConfig[]>([]);
  const [sectionOptions, setSectionOptions] = useState<Array<{
    id: string;
    name: string;
    count: number;
    inStock: boolean;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const buildLessons = async () => {
      if (!scopeSequenceTag || selectedUnit === null || sectionConfigAssignments.length === 0) {
        setLessons([]);
        setSectionOptions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch ALL lessons from scope-and-sequence for this unit
        // For section 802, always use "Algebra 1" scope tag
        const actualScopeTag = selectedSection === "802" ? "Algebra 1" : scopeSequenceTag;
        const result = await fetchRampUpsByUnit(actualScopeTag, selectedUnit);
        if (!result.success) {
          setError(result.error || "Failed to load lessons");
          return;
        }

        // Extract unique sections from all lessons that have assignments
        const lessonsWithAssignments = result.data.filter(lesson =>
          sectionConfigAssignments.some(a =>
            a.unitLessonId === lesson.unitLessonId &&
            a.lessonName === lesson.lessonName
          )
        );
        const uniqueSections = Array.from(
          new Set(lessonsWithAssignments.map(lesson => lesson.section).filter(Boolean))
        ) as string[];

        // Sort sections according to the schema-defined order
        const sortedSections = uniqueSections.sort((a, b) => {
          const indexA = SECTION_OPTIONS.indexOf(a as typeof SECTION_OPTIONS[number]);
          const indexB = SECTION_OPTIONS.indexOf(b as typeof SECTION_OPTIONS[number]);

          // If both are in the order array, sort by their position
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
          }
          // If only one is in the order array, it comes first
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          // If neither is in the order array, maintain alphabetical order
          return a.localeCompare(b);
        });

        // Create section options with counts
        const sectionOpts = sortedSections.map(section => {
          const lessonCount = lessonsWithAssignments.filter(l => l.section === section).length;

          // Helper function to get display name
          const getName = (sectionName: string) => {
            if (sectionName === 'Ramp Ups' || sectionName === 'Unit Assessment') {
              return sectionName;
            }
            return `Section ${sectionName}`;
          };

          return {
            id: section,
            name: getName(section),
            count: lessonCount,
            inStock: lessonCount > 0,
          };
        });

        setSectionOptions(sectionOpts);

        // Filter lessons by selected section if one is selected
        const filteredLessons = selectedLessonSection
          ? result.data.filter(lesson => lesson.section === selectedLessonSection)
          : result.data;

        // Build LessonConfig from ALL section-config assignments that match this unit
        // We match by unitLessonId only, then create entries for each assignment type
        const lessonConfigs: LessonConfig[] = [];

        // Get all assignments for lessons in the filtered scope-and-sequence results
        const relevantUnitLessonIds = new Set(filteredLessons.map(l => l.unitLessonId));

        sectionConfigAssignments
          .filter(assignment => {
            // Match by unitLessonId
            if (!relevantUnitLessonIds.has(assignment.unitLessonId)) return false;

            // Also filter by scopeSequenceTag to ensure we only show assignments for the current scope
            const assignmentScopeTag = (assignment as PodsieAssignment & { scopeSequenceTag?: string }).scopeSequenceTag;
            return assignmentScopeTag === actualScopeTag;
          })
          .forEach(assignment => {
            // Find the corresponding scope-and-sequence lesson (just for section metadata)
            const scopeLesson = filteredLessons.find(l => l.unitLessonId === assignment.unitLessonId);

            lessonConfigs.push({
              unitLessonId: assignment.unitLessonId,
              lessonName: assignment.lessonName,
              grade: scopeSequenceTag.replace("Grade ", "").replace("Algebra 1", "8"),
              podsieAssignmentId: assignment.podsieAssignmentId,
              totalQuestions: assignment.totalQuestions || 10,
              section: scopeLesson?.section,
              unitNumber: selectedUnit,
              assignmentType: assignment.assignmentType || 'mastery-check',
              hasZearnLesson: assignment.hasZearnLesson || false
            });
          });

        setLessons(lessonConfigs);
      } catch (err) {
        console.error("Error building lessons:", err);
        setError("Failed to load lessons");
      } finally {
        setLoading(false);
      }
    };

    buildLessons();
  }, [scopeSequenceTag, selectedUnit, selectedLessonSection, sectionConfigAssignments, selectedSection]);

  return { lessons, sectionOptions, loading, error };
}
