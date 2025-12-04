import { useState, useEffect } from "react";
import { fetchRampUpsByUnit } from "@/app/actions/313/scope-and-sequence";
import { SECTION_OPTIONS } from "@zod-schema/313/scope-and-sequence";
import { AssignmentContent } from "@zod-schema/313/section-config";
import { LessonConfig } from "../types";

export function useLessons(
  scopeSequenceTag: string,
  selectedSection: string,
  selectedUnit: number | null,
  selectedLessonSection: string,
  sectionConfigAssignments: AssignmentContent[]
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

        // Add "All" option at the end
        const totalLessonsCount = lessonsWithAssignments.length;
        const allOption = {
          id: 'all',
          name: 'All',
          count: totalLessonsCount,
          inStock: totalLessonsCount > 0,
        };

        setSectionOptions([...sectionOpts, allOption]);

        // Filter lessons by selected section if one is selected (but not "all")
        const filteredLessons = selectedLessonSection && selectedLessonSection !== 'all'
          ? result.data.filter(lesson => lesson.section === selectedLessonSection)
          : result.data;

        // Build LessonConfig from ALL section-config assignments that match this unit
        // We match by scopeAndSequenceId (preferred) or unitLessonId+lessonName (fallback)
        const lessonConfigs: LessonConfig[] = [];

        // Create a Set of scopeAndSequenceIds from filtered lessons for exact matching
        const relevantScopeAndSequenceIds = new Set(
          filteredLessons.map(l => (l as { _id?: string })._id).filter(Boolean)
        );

        // Also create a map of unitLessonId+lessonName as fallback for assignments without scopeAndSequenceId
        const relevantLessonKeys = new Set(
          filteredLessons.map(l => `${l.unitLessonId}|${l.lessonName}`)
        );

        sectionConfigAssignments
          .filter(assignmentContent => {
            // First, try to match by scopeAndSequenceId (unambiguous, preferred)
            const scopeAndSeqId = (assignmentContent as AssignmentContent & { scopeAndSequenceId?: string }).scopeAndSequenceId;
            if (scopeAndSeqId && relevantScopeAndSequenceIds.has(scopeAndSeqId)) {
              return true;
            }

            // Fallback: Match by unitLessonId AND lessonName (to avoid matching wrong lessons with same ID)
            const lessonKey = `${assignmentContent.unitLessonId}|${assignmentContent.lessonName}`;
            if (!relevantLessonKeys.has(lessonKey)) return false;

            // Also filter by scopeSequenceTag to ensure we only show assignments for the current scope
            const assignmentScopeTag = (assignmentContent as AssignmentContent & { scopeSequenceTag?: string }).scopeSequenceTag;
            return assignmentScopeTag === actualScopeTag;
          })
          .forEach(assignmentContent => {
            // Find matching scope-and-sequence lesson to get lessonType and lessonTitle
            const matchingLesson = filteredLessons.find(l =>
              l.unitLessonId === assignmentContent.unitLessonId &&
              l.lessonName === assignmentContent.lessonName
            );

            // Each assignmentContent can have multiple podsieActivities
            // Create a LessonConfig for each activity
            assignmentContent.podsieActivities?.forEach(activity => {
              lessonConfigs.push({
                scopeAndSequenceId: assignmentContent.scopeAndSequenceId,
                unitLessonId: assignmentContent.unitLessonId,
                lessonName: assignmentContent.lessonName,
                lessonType: matchingLesson?.lessonType as 'lesson' | 'rampUp' | 'assessment' | undefined,
                lessonTitle: matchingLesson?.lessonTitle,
                grade: scopeSequenceTag.replace("Grade ", "").replace("Algebra 1", "8"),
                podsieAssignmentId: activity.podsieAssignmentId,
                totalQuestions: activity.totalQuestions || 10,
                podsieQuestionMap: activity.podsieQuestionMap,
                variations: activity.variations ?? 3,
                q1HasVariations: activity.q1HasVariations ?? false,
                section: assignmentContent.section,
                unitNumber: selectedUnit,
                activityType: activity.activityType || 'mastery-check',
                hasZearnActivity: assignmentContent.zearnActivity?.active || false
              });
            });
          });

        // Sort lessons by unitLessonId to ensure proper order
        // Extract numeric parts for proper sorting (e.g., "3.RU1" -> 1, "3.15" -> 15)
        lessonConfigs.sort((a, b) => {
          const aId = a.unitLessonId;
          const bId = b.unitLessonId;

          // Extract the numeric part after the dot
          const aMatch = aId.match(/\.(.+)$/);
          const bMatch = bId.match(/\.(.+)$/);

          if (!aMatch || !bMatch) return 0;

          const aPart = aMatch[1];
          const bPart = bMatch[1];

          // Handle ramp-ups (e.g., "RU1", "RU2", "RU3")
          if (aPart.startsWith('RU') && bPart.startsWith('RU')) {
            const aNum = parseInt(aPart.substring(2));
            const bNum = parseInt(bPart.substring(2));
            return aNum - bNum;
          }

          // Handle regular lessons (numeric)
          const aNum = parseFloat(aPart);
          const bNum = parseFloat(bPart);

          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }

          // Fallback to string comparison
          return aPart.localeCompare(bPart);
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
