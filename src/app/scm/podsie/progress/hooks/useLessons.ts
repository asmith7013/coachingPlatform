import { useQuery } from "@tanstack/react-query";
import { fetchRampUpsByUnit } from "@/app/actions/scm/scope-and-sequence/scope-and-sequence";
import { SECTION_OPTIONS } from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";
import { AssignmentContent } from "@zod-schema/scm/podsie/section-config";
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
  badge?: string; // Optional badge (e.g., "Part 1", "Part 2")
  count: number;
  inStock: boolean;
}

/**
 * Parse a section filter ID into section and subsection parts
 * Format: "A" (no subsection) or "A:1" (with subsection)
 */
function parseSectionFilterId(id: string): { section: string; subsection: number | undefined } {
  if (id === "all") {
    return { section: "all", subsection: undefined };
  }
  const parts = id.split(":");
  return {
    section: parts[0],
    subsection: parts[1] ? parseInt(parts[1], 10) : undefined,
  };
}

/**
 * Create a section filter ID from section and subsection
 */
function createSectionFilterId(section: string, subsection: number | undefined): string {
  if (subsection !== undefined) {
    return `${section}:${subsection}`;
  }
  return section;
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

      // Build a map of section -> subsections from the assignments
      // This tells us which sections have been split into subsections
      const sectionSubsectionMap = new Map<string, Set<number | undefined>>();
      sectionConfigAssignments.forEach((a) => {
        if (a.section) {
          if (!sectionSubsectionMap.has(a.section)) {
            sectionSubsectionMap.set(a.section, new Set());
          }
          sectionSubsectionMap.get(a.section)!.add(a.subsection);
        }
      });

      // Build unique section+subsection combinations
      const sectionSubsectionPairs: Array<{ section: string; subsection: number | undefined }> = [];
      const seenPairs = new Set<string>();

      lessonsWithAssignments.forEach((lesson) => {
        if (!lesson.section) return;

        // Find matching assignment to get subsection info
        const matchingAssignment = sectionConfigAssignments.find(
          (a) => a.unitLessonId === lesson.unitLessonId && a.lessonName === lesson.lessonName
        );
        const subsection = matchingAssignment?.subsection;
        const pairKey = createSectionFilterId(lesson.section, subsection);

        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          sectionSubsectionPairs.push({ section: lesson.section, subsection });
        }
      });

      // Sort sections according to the schema-defined order, then by subsection
      const sortedPairs = sectionSubsectionPairs.sort((a, b) => {
        const indexA = SECTION_OPTIONS.indexOf(a.section as (typeof SECTION_OPTIONS)[number]);
        const indexB = SECTION_OPTIONS.indexOf(b.section as (typeof SECTION_OPTIONS)[number]);

        // First sort by section order
        if (indexA !== indexB) {
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          const sectionCompare = a.section.localeCompare(b.section);
          if (sectionCompare !== 0) return sectionCompare;
        }

        // Then sort by subsection (undefined first, then by number)
        if (a.subsection === undefined && b.subsection === undefined) return 0;
        if (a.subsection === undefined) return -1;
        if (b.subsection === undefined) return 1;
        return a.subsection - b.subsection;
      });

      // Helper function to get display name (without subsection - that goes in badge)
      const getName = (sectionName: string) => {
        return sectionName === "Ramp Ups" || sectionName === "Unit Assessment"
          ? sectionName
          : `Section ${sectionName}`;
      };

      // Helper function to get badge (e.g., "Part 1")
      const getBadge = (subsection: number | undefined): string | undefined => {
        return subsection !== undefined ? `Part ${subsection}` : undefined;
      };

      // Count lessons for each section+subsection pair
      const countLessons = (section: string, subsection: number | undefined) => {
        return lessonsWithAssignments.filter((lesson) => {
          if (lesson.section !== section) return false;
          const matchingAssignment = sectionConfigAssignments.find(
            (a) => a.unitLessonId === lesson.unitLessonId && a.lessonName === lesson.lessonName
          );
          return matchingAssignment?.subsection === subsection;
        }).length;
      };

      // Create section options with counts (including subsections)
      const sectionOpts: SectionOption[] = sortedPairs.map((pair) => {
        const count = countLessons(pair.section, pair.subsection);
        return {
          id: createSectionFilterId(pair.section, pair.subsection),
          name: getName(pair.section),
          badge: getBadge(pair.subsection),
          count,
          inStock: count > 0,
        };
      });

      // Add "All" option at the end
      const totalLessonsCount = lessonsWithAssignments.length;
      sectionOpts.push({
        id: "all",
        name: "All",
        count: totalLessonsCount,
        inStock: totalLessonsCount > 0,
      });

      // Filter lessons by selected section+subsection if one is selected (but not "all")
      const { section: filterSection, subsection: filterSubsection } = parseSectionFilterId(selectedLessonSection || "all");
      const filteredLessons =
        selectedLessonSection && selectedLessonSection !== "all"
          ? result.data.filter((lesson) => {
              if (lesson.section !== filterSection) return false;
              // Find matching assignment to check subsection
              const matchingAssignment = sectionConfigAssignments.find(
                (a) => a.unitLessonId === lesson.unitLessonId && a.lessonName === lesson.lessonName
              );
              return matchingAssignment?.subsection === filterSubsection;
            })
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
              subsection: assignmentContent.subsection,
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
