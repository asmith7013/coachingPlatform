/**
 * Shared utility for grouping lessons with their matching mastery checks
 */

import { SECTION_OPTIONS } from "@zod-schema/313/curriculum/scope-and-sequence";

interface Assignment {
  podsieAssignmentId: string;
  unitLessonId: string;
  activityType?: 'sidekick' | 'mastery-check' | 'assessment';
  section?: string;
}

export interface GroupedAssignment<T extends Assignment> {
  lesson: T;
  masteryCheck: T | null;
}

export interface GroupedBySection<T extends Assignment> {
  section: string;
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
  assignments: T[]
): GroupedAssignment<T>[] {
  const grouped: GroupedAssignment<T>[] = [];
  const processedIds = new Set<string>();

  // FIRST PASS: Process all sidekick lessons and find their matching mastery checks
  assignments.forEach(assignment => {
    if (assignment.activityType !== 'sidekick') return;

    // Find matching mastery check by unitLessonId
    const masteryCheck = assignments.find(
      a => a.activityType === 'mastery-check' &&
           a.unitLessonId === assignment.unitLessonId
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
  assignments.forEach(assignment => {
    if (assignment.activityType !== 'mastery-check') return;
    if (processedIds.has(assignment.podsieAssignmentId)) return;

    grouped.push({
      lesson: assignment,
      masteryCheck: null,
    });

    processedIds.add(assignment.podsieAssignmentId);
  });

  // THIRD PASS: Process assessments as standalone items (displayed like sidekick lessons)
  assignments.forEach(assignment => {
    if (assignment.activityType !== 'assessment') return;
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
 * Groups assignments by section, then by lesson with mastery checks.
 * Sorts sections according to SECTION_OPTIONS order.
 *
 * @param assignments - Array of assignments to group
 * @returns Array of sections with their grouped assignments
 */
export function groupAssignmentsBySection<T extends Assignment>(
  assignments: T[]
): GroupedBySection<T>[] {
  // First group by unitLessonId
  const groupedAssignments = groupAssignmentsByUnitLesson(assignments);

  // Then organize by section
  const sectionMap = new Map<string, GroupedAssignment<T>[]>();

  groupedAssignments.forEach(group => {
    const section = group.lesson.section || 'Unknown';
    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }
    sectionMap.get(section)!.push(group);
  });

  // Convert to array and sort by section order
  const sections = Array.from(sectionMap.entries()).map(([section, assignments]) => {
    // Helper function to get display name
    const getSectionDisplayName = (sectionName: string) => {
      if (sectionName === 'Ramp Ups' || sectionName === 'Unit Assessment') {
        return sectionName;
      }
      return `Section ${sectionName}`;
    };

    return {
      section,
      sectionDisplayName: getSectionDisplayName(section),
      assignments,
    };
  });

  // Sort by SECTION_OPTIONS order
  sections.sort((a, b) => {
    const indexA = SECTION_OPTIONS.indexOf(a.section as typeof SECTION_OPTIONS[number]);
    const indexB = SECTION_OPTIONS.indexOf(b.section as typeof SECTION_OPTIONS[number]);

    // If both are in the order array, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the order array, it comes first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the order array, maintain alphabetical order
    return a.section.localeCompare(b.section);
  });

  return sections;
}
