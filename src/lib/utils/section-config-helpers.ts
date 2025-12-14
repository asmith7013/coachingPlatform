/**
 * Helper utilities for working with section configs
 * Provides functions to join scope-and-sequence lessons with section-specific Podsie data
 */

import { ScopeAndSequence } from "@zod-schema/scm/curriculum/scope-and-sequence";
import { SectionConfig, ScopeAndSequenceWithAssignmentContent, AssignmentContent } from "@zod-schema/scm/podsie/section-config";
import { fetchScopeAndSequence } from "@actions/scm/scope-and-sequence";
import { getSectionConfig } from "@actions/scm/section-config";

/**
 * Join a single scope-and-sequence lesson with its assignment content from a section config
 */
export function joinLessonWithAssignmentContent(
  lesson: ScopeAndSequence,
  assignmentContent: AssignmentContent | null | undefined
): ScopeAndSequenceWithAssignmentContent {
  return {
    id: lesson.id || '',
    unitLessonId: lesson.unitLessonId,
    lessonName: lesson.lessonName,
    grade: lesson.grade,
    unit: lesson.unit,
    section: lesson.section,
    roadmapSkills: lesson.roadmapSkills,
    targetSkills: lesson.targetSkills,
    assignmentContent: assignmentContent ? {
      scopeAndSequenceId: assignmentContent.scopeAndSequenceId,
      podsieActivities: assignmentContent.podsieActivities || [],
      zearnActivity: assignmentContent.zearnActivity,
      active: assignmentContent.active,
      notes: assignmentContent.notes
    } : undefined
  };
}

/**
 * Join multiple scope-and-sequence lessons with their assignment content from a section config
 * @param lessons Array of scope-and-sequence lessons
 * @param sectionConfig Section config containing assignmentContent
 * @returns Array of lessons with their assignment content attached
 */
export function joinLessonsWithSectionConfig(
  lessons: ScopeAndSequence[],
  sectionConfig: SectionConfig | null
): ScopeAndSequenceWithAssignmentContent[] {
  if (!sectionConfig || !sectionConfig.assignmentContent) {
    return lessons.map(lesson => joinLessonWithAssignmentContent(lesson, null));
  }

  // Create a map for quick lookup
  const assignmentMap = new Map<string, AssignmentContent>();
  sectionConfig.assignmentContent.forEach(assignment => {
    assignmentMap.set(assignment.unitLessonId, assignment);
  });

  // Join each lesson with its assignment
  return lessons.map(lesson => {
    const assignment = assignmentMap.get(lesson.unitLessonId);
    return joinLessonWithAssignmentContent(lesson, assignment);
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
 * Get Podsie assignment IDs for a specific lesson in a section
 * Returns array of assignment IDs from all active podsieActivities
 */
export function getPodsieAssignmentIds(
  unitLessonId: string,
  sectionConfig: SectionConfig | null
): string[] {
  if (!sectionConfig || !sectionConfig.assignmentContent) return [];
  const assignment = sectionConfig.assignmentContent.find(
    a => a.unitLessonId === unitLessonId && a.active
  );
  return assignment?.podsieActivities?.map(activity => activity.podsieAssignmentId) || [];
}

/**
 * Get Podsie question maps for a specific lesson in a section
 * Returns array of question maps from all podsieActivities
 */
export function getPodsieQuestionMaps(
  unitLessonId: string,
  sectionConfig: SectionConfig | null
): Array<Array<{ questionNumber: number; questionId: string }>> {
  if (!sectionConfig || !sectionConfig.assignmentContent) return [];
  const assignment = sectionConfig.assignmentContent.find(
    a => a.unitLessonId === unitLessonId && a.active
  );
  return assignment?.podsieActivities?.map(activity => activity.podsieQuestionMap || []) || [];
}

/**
 * Check if a lesson has Podsie assignment configured for a section
 */
export function hasPodsieAssignment(
  unitLessonId: string,
  sectionConfig: SectionConfig | null
): boolean {
  if (!sectionConfig || !sectionConfig.assignmentContent) return false;
  return sectionConfig.assignmentContent.some(
    a => a.unitLessonId === unitLessonId && a.active && a.podsieActivities && a.podsieActivities.length > 0
  );
}

/**
 * Get all lessons that have assignment content for a section
 */
export function getLessonsWithAssignmentContent(
  lessons: ScopeAndSequence[],
  sectionConfig: SectionConfig | null
): ScopeAndSequenceWithAssignmentContent[] {
  const joined = joinLessonsWithSectionConfig(lessons, sectionConfig);
  return joined.filter(lesson => lesson.assignmentContent !== undefined);
}

/**
 * Get all lessons that DON'T have assignment content for a section
 */
export function getLessonsWithoutAssignmentContent(
  lessons: ScopeAndSequence[],
  sectionConfig: SectionConfig | null
): ScopeAndSequenceWithAssignmentContent[] {
  const joined = joinLessonsWithSectionConfig(lessons, sectionConfig);
  return joined.filter(lesson => lesson.assignmentContent === undefined);
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

  const assignments = sectionConfig.assignmentContent || [];
  const activeAssignments = assignments.filter(a => a.active);
  const totalQuestions = activeAssignments.reduce(
    (sum, a) => sum + (a.podsieActivities?.reduce((activitySum, activity) => activitySum + (activity.totalQuestions || 0), 0) || 0),
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
