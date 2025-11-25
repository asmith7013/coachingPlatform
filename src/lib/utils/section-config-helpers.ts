/**
 * Helper utilities for working with section configs
 * Provides functions to join scope-and-sequence lessons with section-specific Podsie data
 */

import { ScopeAndSequence } from "@zod-schema/313/scope-and-sequence";
import { SectionConfig, ScopeAndSequenceWithPodsie, PodsieAssignment } from "@zod-schema/313/section-config";
import { fetchScopeAndSequence } from "@actions/313/scope-and-sequence";
import { getSectionConfig } from "@actions/313/section-config";

/**
 * Join a single scope-and-sequence lesson with its Podsie assignment from a section config
 */
export function joinLessonWithPodsieAssignment(
  lesson: ScopeAndSequence,
  podsieAssignment: PodsieAssignment | null | undefined
): ScopeAndSequenceWithPodsie {
  return {
    id: lesson.id || '',
    unitLessonId: lesson.unitLessonId,
    lessonName: lesson.lessonName,
    grade: lesson.grade,
    unit: lesson.unit,
    section: lesson.section,
    roadmapSkills: lesson.roadmapSkills,
    targetSkills: lesson.targetSkills,
    podsieAssignment: podsieAssignment ? {
      podsieAssignmentId: podsieAssignment.podsieAssignmentId,
      assignmentType: podsieAssignment.assignmentType,
      podsieQuestionMap: podsieAssignment.podsieQuestionMap || [],
      totalQuestions: podsieAssignment.totalQuestions,
      active: podsieAssignment.active,
      notes: podsieAssignment.notes
    } : undefined
  };
}

/**
 * Join multiple scope-and-sequence lessons with their Podsie assignments from a section config
 * @param lessons Array of scope-and-sequence lessons
 * @param sectionConfig Section config containing podsieAssignments
 * @returns Array of lessons with their Podsie assignments attached
 */
export function joinLessonsWithSectionConfig(
  lessons: ScopeAndSequence[],
  sectionConfig: SectionConfig | null
): ScopeAndSequenceWithPodsie[] {
  if (!sectionConfig || !sectionConfig.podsieAssignments) {
    return lessons.map(lesson => joinLessonWithPodsieAssignment(lesson, null));
  }

  // Create a map for quick lookup
  const assignmentMap = new Map<string, PodsieAssignment>();
  sectionConfig.podsieAssignments.forEach(assignment => {
    assignmentMap.set(assignment.unitLessonId, assignment);
  });

  // Join each lesson with its assignment
  return lessons.map(lesson => {
    const assignment = assignmentMap.get(lesson.unitLessonId);
    return joinLessonWithPodsieAssignment(lesson, assignment);
  });
}

/**
 * Fetch scope-and-sequence lessons with Podsie assignments for a specific section
 * @param school School identifier
 * @param classSection Class section
 * @param filters Optional filters for scope-and-sequence query
 */
export async function fetchLessonsWithSectionConfig(
  school: "IS313" | "PS19" | "X644",
  classSection: string,
  filters?: {
    grade?: string;
    unitNumber?: number;
    scopeSequenceTag?: string;
  }
) {
  try {
    // Fetch lessons and section config in parallel
    const [lessonsResult, configResult] = await Promise.all([
      fetchScopeAndSequence({
        page: 1,
        limit: 1000,
        sortBy: 'unitNumber',
        sortOrder: 'asc',
        filters: filters || {},
        search: '',
        searchFields: []
      }),
      getSectionConfig(school, classSection)
    ]);

    if (!lessonsResult.success) {
      return {
        success: false,
        error: lessonsResult.error || "Failed to fetch lessons"
      };
    }

    const lessons = (lessonsResult.items || []) as unknown as ScopeAndSequence[];
    const config = configResult.success ? configResult.data : null;

    // Join them
    const joined = joinLessonsWithSectionConfig(lessons, config as SectionConfig | null);

    return {
      success: true,
      data: joined,
      sectionConfig: config
    };
  } catch (error) {
    console.error('💥 Error fetching lessons with section config:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

/**
 * Get Podsie assignment ID for a specific lesson in a section
 * Returns undefined if no assignment exists
 */
export function getPodsieAssignmentId(
  unitLessonId: string,
  sectionConfig: SectionConfig | null
): string | undefined {
  if (!sectionConfig || !sectionConfig.podsieAssignments) return undefined;
  const assignment = sectionConfig.podsieAssignments.find(
    a => a.unitLessonId === unitLessonId && a.active
  );
  return assignment?.podsieAssignmentId;
}

/**
 * Get Podsie question map for a specific lesson in a section
 * Returns empty array if no assignment exists
 */
export function getPodsieQuestionMap(
  unitLessonId: string,
  sectionConfig: SectionConfig | null
): Array<{ questionNumber: number; questionId: string }> {
  if (!sectionConfig || !sectionConfig.podsieAssignments) return [];
  const assignment = sectionConfig.podsieAssignments.find(
    a => a.unitLessonId === unitLessonId && a.active
  );
  return assignment?.podsieQuestionMap || [];
}

/**
 * Check if a lesson has Podsie assignment configured for a section
 */
export function hasPodsieAssignment(
  unitLessonId: string,
  sectionConfig: SectionConfig | null
): boolean {
  if (!sectionConfig || !sectionConfig.podsieAssignments) return false;
  return sectionConfig.podsieAssignments.some(
    a => a.unitLessonId === unitLessonId && a.active
  );
}

/**
 * Get all lessons that have Podsie assignments for a section
 */
export function getLessonsWithPodsieAssignments(
  lessons: ScopeAndSequence[],
  sectionConfig: SectionConfig | null
): ScopeAndSequenceWithPodsie[] {
  const joined = joinLessonsWithSectionConfig(lessons, sectionConfig);
  return joined.filter(lesson => lesson.podsieAssignment !== undefined);
}

/**
 * Get all lessons that DON'T have Podsie assignments for a section
 */
export function getLessonsWithoutPodsieAssignments(
  lessons: ScopeAndSequence[],
  sectionConfig: SectionConfig | null
): ScopeAndSequenceWithPodsie[] {
  const joined = joinLessonsWithSectionConfig(lessons, sectionConfig);
  return joined.filter(lesson => lesson.podsieAssignment === undefined);
}

/**
 * Get summary stats for a section config
 */
export function getSectionConfigStats(sectionConfig: SectionConfig | null) {
  if (!sectionConfig) {
    return {
      totalAssignments: 0,
      activeAssignments: 0,
      totalQuestions: 0,
      averageQuestionsPerAssignment: 0
    };
  }

  const assignments = sectionConfig.podsieAssignments || [];
  const activeAssignments = assignments.filter(a => a.active);
  const totalQuestions = activeAssignments.reduce(
    (sum, a) => sum + (a.totalQuestions || 0),
    0
  );

  return {
    totalAssignments: assignments.length,
    activeAssignments: activeAssignments.length,
    totalQuestions,
    averageQuestionsPerAssignment: activeAssignments.length > 0
      ? Math.round(totalQuestions / activeAssignments.length)
      : 0
  };
}
