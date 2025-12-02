/**
 * Shared utility for grouping lessons with their matching mastery checks
 */

interface Assignment {
  podsieAssignmentId: string;
  unitLessonId: string;
  assignmentType?: 'lesson' | 'mastery-check';
}

export interface GroupedAssignment<T extends Assignment> {
  lesson: T;
  masteryCheck: T | null;
}

/**
 * Groups lessons with their matching mastery checks by unitLessonId.
 * Uses a two-pass approach to ensure proper pairing regardless of sort order:
 * 1. First pass: Process all lessons and find their matching mastery checks
 * 2. Second pass: Process any standalone mastery checks (those without a matching lesson)
 *
 * @param assignments - Array of assignments to group
 * @returns Array of grouped assignments with lesson and optional masteryCheck
 */
export function groupAssignmentsByUnitLesson<T extends Assignment>(
  assignments: T[]
): GroupedAssignment<T>[] {
  const grouped: GroupedAssignment<T>[] = [];
  const processedIds = new Set<string>();

  // FIRST PASS: Process all lessons and find their matching mastery checks
  assignments.forEach(assignment => {
    if (assignment.assignmentType !== 'lesson') return;

    // Find matching mastery check by unitLessonId
    const masteryCheck = assignments.find(
      a => a.assignmentType === 'mastery-check' &&
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

  // SECOND PASS: Process any standalone mastery checks (those without a matching lesson)
  assignments.forEach(assignment => {
    if (assignment.assignmentType !== 'mastery-check') return;
    if (processedIds.has(assignment.podsieAssignmentId)) return;

    grouped.push({
      lesson: assignment,
      masteryCheck: null,
    });

    processedIds.add(assignment.podsieAssignmentId);
  });

  return grouped;
}
