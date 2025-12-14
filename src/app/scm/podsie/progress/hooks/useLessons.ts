import { useQuery } from "@tanstack/react-query";
import { fetchRampUpsByUnit } from "@/app/actions/313/scope-and-sequence";
import { SECTION_OPTIONS } from "@zod-schema/313/curriculum/scope-and-sequence";
import { AssignmentContent } from "@zod-schema/313/podsie/section-config";
import { LessonConfig } from "../types";

/**
 * Query keys for lessons data
 */
export const lessonsKeys = {
  all: ["lessons"] as const,
  byUnit: (scopeTag: string, section: string, unit: number) =>
    [...lessonsKeys.all, scopeTag, section, unit] as const,
  filtered: (
    scopeTag: string,
    section: string,
    unit: number,
    lessonSection: string,
    assignmentsHash: string
  ) => [...lessonsKeys.byUnit(scopeTag, section, unit), lessonSection, assignmentsHash] as const,
};

interface SectionOption {
  id: string;
  name: string;
  count: number;
  inStock: boolean;
}

interface LessonsData {
  lessons: LessonConfig[];
  sectionOptions: SectionOption[];
}

/**
 * Sort lessons by unitLessonId
 */
function sortLessonConfigs(lessonConfigs: LessonConfig[]): LessonConfig[] {
  return [...lessonConfigs].sort((a, b) => {
    const aId = a.unitLessonId;
    const bId = b.unitLessonId;

    const aMatch = aId.match(/\.(.+)$/);
    const bMatch = bId.match(/\.(.+)$/);

    if (!aMatch || !bMatch) return 0;

    const aPart = aMatch[1];
    const bPart = bMatch[1];

    // Handle ramp-ups (e.g., "RU1", "RU2", "RU3")
    if (aPart.startsWith("RU") && bPart.startsWith("RU")) {
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

    return aPart.localeCompare(bPart);
  });
}

/**
 * Hook for fetching and building lesson configs using React Query
 */
export function useLessons(
  scopeSequenceTag: string,
  selectedSection: string,
  selectedUnit: number | null,
  selectedLessonSection: string,
  sectionConfigAssignments: AssignmentContent[]
) {
  const enabled = Boolean(
    scopeSequenceTag &&
      selectedUnit !== null &&
      sectionConfigAssignments.length > 0
  );

  // Create a stable hash for assignments to use in query key
  const assignmentsHash = sectionConfigAssignments
    .map((a) => `${a.unitLessonId}-${a.lessonName}`)
    .join("|");

  const { data, isLoading, error } = useQuery({
    queryKey: lessonsKeys.filtered(
      scopeSequenceTag,
      selectedSection,
      selectedUnit || 0,
      selectedLessonSection,
      assignmentsHash
    ),
    queryFn: async (): Promise<LessonsData> => {
      // For section 802, always use "Algebra 1" scope tag
      const actualScopeTag = selectedSection === "802" ? "Algebra 1" : scopeSequenceTag;
      const result = await fetchRampUpsByUnit(actualScopeTag, selectedUnit!);

      if (!result.success) {
        throw new Error(result.error || "Failed to load lessons");
      }

      // Extract unique sections from all lessons that have assignments
      const lessonsWithAssignments = result.data.filter((lesson) =>
        sectionConfigAssignments.some(
          (a) =>
            a.unitLessonId === lesson.unitLessonId && a.lessonName === lesson.lessonName
        )
      );

      const uniqueSections = Array.from(
        new Set(lessonsWithAssignments.map((lesson) => lesson.section).filter(Boolean))
      ) as string[];

      // Sort sections according to the schema-defined order
      const sortedSections = uniqueSections.sort((a, b) => {
        const indexA = SECTION_OPTIONS.indexOf(a as (typeof SECTION_OPTIONS)[number]);
        const indexB = SECTION_OPTIONS.indexOf(b as (typeof SECTION_OPTIONS)[number]);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });

      // Helper function to get display name
      const getName = (sectionName: string) => {
        if (sectionName === "Ramp Ups" || sectionName === "Unit Assessment") {
          return sectionName;
        }
        return `Section ${sectionName}`;
      };

      // Create section options with counts
      const sectionOpts: SectionOption[] = sortedSections.map((section) => ({
        id: section,
        name: getName(section),
        count: lessonsWithAssignments.filter((l) => l.section === section).length,
        inStock: lessonsWithAssignments.filter((l) => l.section === section).length > 0,
      }));

      // Add "All" option at the end
      const totalLessonsCount = lessonsWithAssignments.length;
      sectionOpts.push({
        id: "all",
        name: "All",
        count: totalLessonsCount,
        inStock: totalLessonsCount > 0,
      });

      // Filter lessons by selected section if one is selected (but not "all")
      const filteredLessons =
        selectedLessonSection && selectedLessonSection !== "all"
          ? result.data.filter((lesson) => lesson.section === selectedLessonSection)
          : result.data;

      // Build LessonConfig from section-config assignments
      const lessonConfigs: LessonConfig[] = [];

      const relevantScopeAndSequenceIds = new Set(
        filteredLessons.map((l) => (l as { _id?: string })._id).filter(Boolean)
      );

      const relevantLessonKeys = new Set(
        filteredLessons.map((l) => `${l.unitLessonId}|${l.lessonName}`)
      );

      sectionConfigAssignments
        .filter((assignmentContent) => {
          const scopeAndSeqId = (
            assignmentContent as AssignmentContent & { scopeAndSequenceId?: string }
          ).scopeAndSequenceId;
          if (scopeAndSeqId && relevantScopeAndSequenceIds.has(scopeAndSeqId)) {
            return true;
          }

          const lessonKey = `${assignmentContent.unitLessonId}|${assignmentContent.lessonName}`;
          if (!relevantLessonKeys.has(lessonKey)) return false;

          const assignmentScopeTag = (
            assignmentContent as AssignmentContent & { scopeSequenceTag?: string }
          ).scopeSequenceTag;
          return assignmentScopeTag === actualScopeTag;
        })
        .forEach((assignmentContent) => {
          const matchingLesson = filteredLessons.find(
            (l) =>
              l.unitLessonId === assignmentContent.unitLessonId &&
              l.lessonName === assignmentContent.lessonName
          );

          assignmentContent.podsieActivities?.forEach((activity) => {
            lessonConfigs.push({
              scopeAndSequenceId: assignmentContent.scopeAndSequenceId,
              unitLessonId: assignmentContent.unitLessonId,
              lessonName: assignmentContent.lessonName,
              lessonType: matchingLesson?.lessonType as
                | "lesson"
                | "rampUp"
                | "assessment"
                | undefined,
              lessonTitle: matchingLesson?.lessonTitle,
              grade: scopeSequenceTag.replace("Grade ", "").replace("Algebra 1", "8"),
              podsieAssignmentId: activity.podsieAssignmentId,
              totalQuestions: activity.totalQuestions || 10,
              podsieQuestionMap: activity.podsieQuestionMap,
              variations: activity.variations ?? 3,
              q1HasVariations: activity.q1HasVariations ?? false,
              section: assignmentContent.section,
              unitNumber: selectedUnit!,
              activityType: activity.activityType || "mastery-check",
              hasZearnActivity: assignmentContent.zearnActivity?.active || false,
            });
          });
        });

      return {
        lessons: sortLessonConfigs(lessonConfigs),
        sectionOptions: sectionOpts,
      };
    },
    enabled,
    staleTime: 30_000, // Cache for 30 seconds
  });

  return {
    lessons: data?.lessons || [],
    sectionOptions: data?.sectionOptions || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
