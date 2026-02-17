/**
 * Shared utility for grouping lessons with their matching mastery checks
 */

import {
  SECTION_OPTIONS,
  getSectionDisplayName,
} from "@zod-schema/scm/scope-and-sequence/scope-and-sequence";

interface Assignment {
  podsieAssignmentId: string;
  unitLessonId: string;
  activityType?: "sidekick" | "mastery-check" | "assessment";
  section?: string;
  subsection?: number;
}

export interface GroupedAssignment<T extends Assignment> {
  lesson: T;
  masteryCheck: T | null;
}

export interface GroupedBySection<T extends Assignment> {
  section: string;
  subsection?: number;
  sectionDisplayName: string;
  assignments: GroupedAssignment<T>[];
}

/**
 * Groups lessons with their matching mastery checks by unitLessonId.
 * Uses a three-pass approach to ensure proper pairing regardless of sort order:
 * 1. First pass: Process all sidekick lessons and find their matching mastery checks
 * 2. Second pass: Process any standalone mastery checks (those without a matching sidekick lesson)
 * 3. Third pass: Process assessments as standalone items (they display like sidekick lessons)
 *
 * @param assignments - Array of assignments to group
 * @returns Array of grouped assignments with lesson and optional masteryCheck
 */
export function groupAssignmentsByUnitLesson<T extends Assignment>(
  assignments: T[],
): GroupedAssignment<T>[] {
  const grouped: GroupedAssignment<T>[] = [];
  const processedIds = new Set<string>();

  // FIRST PASS: Process all sidekick lessons and find their matching mastery checks
  assignments.forEach((assignment) => {
    if (assignment.activityType !== "sidekick") return;

    // Find matching mastery check by unitLessonId
    const masteryCheck = assignments.find(
      (a) =>
        a.activityType === "mastery-check" &&
        a.unitLessonId === assignment.unitLessonId,
    );

    grouped.push({
      lesson: assignment,
      masteryCheck: masteryCheck || null,
    });

    processedIds.add(assignment.podsieAssignmentId);
    if (masteryCheck) {
      processedIds.add(masteryCheck.podsieAssignmentId);
    }
  });

  // SECOND PASS: Process any standalone mastery checks (those without a matching sidekick lesson)
  assignments.forEach((assignment) => {
    if (assignment.activityType !== "mastery-check") return;
    if (processedIds.has(assignment.podsieAssignmentId)) return;

    grouped.push({
      lesson: assignment,
      masteryCheck: null,
    });

    processedIds.add(assignment.podsieAssignmentId);
  });

  // THIRD PASS: Process assessments as standalone items (displayed like sidekick lessons)
  assignments.forEach((assignment) => {
    if (assignment.activityType !== "assessment") return;
    if (processedIds.has(assignment.podsieAssignmentId)) return;

    grouped.push({
      lesson: assignment,
      masteryCheck: null,
    });

    processedIds.add(assignment.podsieAssignmentId);
  });

  return grouped;
}

/**
 * Groups assignments by section (and subsection), then by lesson with mastery checks.
 * Sorts sections according to SECTION_OPTIONS order, then by subsection number.
 *
 * @param assignments - Array of assignments to group
 * @returns Array of sections with their grouped assignments
 */
export function groupAssignmentsBySection<T extends Assignment>(
  assignments: T[],
): GroupedBySection<T>[] {
  // First group by unitLessonId
  const groupedAssignments = groupAssignmentsByUnitLesson(assignments);

  // Then organize by section + subsection
  // Key format: "section" or "section:subsection" (e.g., "A" or "A:1")
  const sectionSubsectionMap = new Map<string, GroupedAssignment<T>[]>();

  groupedAssignments.forEach((group) => {
    const section = group.lesson.section || "Unknown";
    const subsection = group.lesson.subsection;
    // Create composite key: "A" or "A:1" or "A:2"
    const key = subsection !== undefined ? `${section}:${subsection}` : section;

    if (!sectionSubsectionMap.has(key)) {
      sectionSubsectionMap.set(key, []);
    }
    sectionSubsectionMap.get(key)!.push(group);
  });

  // Convert to array
  const sections = Array.from(sectionSubsectionMap.entries()).map(
    ([key, assignments]) => {
      // Parse the composite key
      const colonIndex = key.indexOf(":");
      let section: string;
      let subsection: number | undefined;

      if (colonIndex !== -1) {
        section = key.substring(0, colonIndex);
        subsection = parseInt(key.substring(colonIndex + 1), 10);
      } else {
        section = key;
        subsection = undefined;
      }

      return {
        section,
        subsection,
        sectionDisplayName: getSectionDisplayName(section, subsection),
        assignments,
      };
    },
  );

  // Sort by SECTION_OPTIONS order, then by subsection
  sections.sort((a, b) => {
    const indexA = SECTION_OPTIONS.indexOf(
      a.section as (typeof SECTION_OPTIONS)[number],
    );
    const indexB = SECTION_OPTIONS.indexOf(
      b.section as (typeof SECTION_OPTIONS)[number],
    );

    // First, sort by section order
    if (indexA !== indexB) {
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.section.localeCompare(b.section);
    }

    // Same section, sort by subsection (undefined first, then 1, 2, 3...)
    const subA = a.subsection ?? 0;
    const subB = b.subsection ?? 0;
    return subA - subB;
  });

  return sections;
}
