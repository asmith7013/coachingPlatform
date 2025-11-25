/**
 * Helper utilities for working with Podsie completion configs
 * Provides functions to join scope-and-sequence lessons with section-specific Podsie data
 */

import { ScopeAndSequence } from "@zod-schema/313/scope-and-sequence";
import { PodsieCompletion, ScopeAndSequenceWithPodsie } from "@zod-schema/313/podsie-completion";
import { fetchScopeAndSequence } from "@actions/313/scope-and-sequence";
import { fetchPodsieCompletionByQuery } from "@actions/313/podsie-completion";
import type { AllSectionsType } from "@schema/enum/313";

/**
 * Join a single scope-and-sequence lesson with its Podsie config for a specific section
 */
export function joinLessonWithPodsieConfig(
  lesson: ScopeAndSequence,
  podsieConfig: PodsieCompletion | null | undefined
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
    podsieConfig: podsieConfig ? {
      id: podsieConfig.id || '',
      school: String(podsieConfig.school),
      classSection: String(podsieConfig.classSection),
      podsieAssignmentId: podsieConfig.podsieAssignmentId,
      podsieQuestionMap: podsieConfig.podsieQuestionMap || [],
      totalQuestions: podsieConfig.totalQuestions,
      active: podsieConfig.active
    } : undefined
  };
}

/**
 * Join multiple scope-and-sequence lessons with their Podsie configs
 * @param lessons Array of scope-and-sequence lessons
 * @param podsieConfigs Array of Podsie completion configs
 * @returns Array of lessons with their Podsie configs attached
 */
export function joinLessonsWithPodsieConfigs(
  lessons: ScopeAndSequence[],
  podsieConfigs: PodsieCompletion[]
): ScopeAndSequenceWithPodsie[] {
  // Create a map for quick lookup
  const configMap = new Map<string, PodsieCompletion>();
  podsieConfigs.forEach(config => {
    configMap.set(config.unitLessonId, config);
  });

  // Join each lesson with its config
  return lessons.map(lesson => {
    const config = configMap.get(lesson.unitLessonId);
    return joinLessonWithPodsieConfig(lesson, config);
  });
}

/**
 * Fetch scope-and-sequence lessons with Podsie configs for a specific section
 * @param school School identifier
 * @param classSection Class section
 * @param filters Optional filters for scope-and-sequence query
 */
export async function fetchLessonsWithPodsieConfigs(
  school: "IS313" | "PS19" | "X644",
  classSection: AllSectionsType,
  filters?: {
    grade?: string;
    unitNumber?: number;
    scopeSequenceTag?: string;
  }
) {
  try {
    // Fetch lessons and configs in parallel
    const [lessonsResult, configsResult] = await Promise.all([
      fetchScopeAndSequence({
        page: 1,
        limit: 1000,
        sortBy: 'unitNumber',
        sortOrder: 'asc',
        filters: filters || {},
        search: '',
        searchFields: []
      }),
      fetchPodsieCompletionByQuery({ school, classSection, active: true })
    ]);

    if (!lessonsResult.success || !configsResult.success) {
      return {
        success: false,
        error: lessonsResult.error || configsResult.error || "Failed to fetch data"
      };
    }

    const lessons = (lessonsResult.items || []) as unknown as ScopeAndSequence[];
    const configs = (configsResult.data || []) as unknown as PodsieCompletion[];

    // Join them
    const joined = joinLessonsWithPodsieConfigs(lessons, configs);

    return {
      success: true,
      data: joined
    };
  } catch (error) {
    console.error('💥 Error fetching lessons with Podsie configs:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

/**
 * Get Podsie assignment ID for a specific lesson and section
 * Returns undefined if no config exists
 */
export function getPodsieAssignmentId(
  unitLessonId: string,
  podsieConfigs: PodsieCompletion[]
): string | undefined {
  const config = podsieConfigs.find(c => c.unitLessonId === unitLessonId && c.active);
  return config?.podsieAssignmentId;
}

/**
 * Get Podsie question map for a specific lesson and section
 * Returns empty array if no config exists
 */
export function getPodsieQuestionMap(
  unitLessonId: string,
  podsieConfigs: PodsieCompletion[]
): Array<{ questionNumber: number; questionId: string }> {
  const config = podsieConfigs.find(c => c.unitLessonId === unitLessonId && c.active);
  return config?.podsieQuestionMap || [];
}

/**
 * Check if a lesson has Podsie integration configured for a section
 */
export function hasPodsieConfig(
  unitLessonId: string,
  podsieConfigs: PodsieCompletion[]
): boolean {
  return podsieConfigs.some(c => c.unitLessonId === unitLessonId && c.active);
}

/**
 * Get all lessons that have Podsie configs for a section
 */
export function getLessonsWithPodsieConfigs(
  lessons: ScopeAndSequence[],
  podsieConfigs: PodsieCompletion[]
): ScopeAndSequenceWithPodsie[] {
  const joined = joinLessonsWithPodsieConfigs(lessons, podsieConfigs);
  return joined.filter(lesson => lesson.podsieConfig !== undefined);
}

/**
 * Get all lessons that DON'T have Podsie configs for a section
 */
export function getLessonsWithoutPodsieConfigs(
  lessons: ScopeAndSequence[],
  podsieConfigs: PodsieCompletion[]
): ScopeAndSequenceWithPodsie[] {
  const joined = joinLessonsWithPodsieConfigs(lessons, podsieConfigs);
  return joined.filter(lesson => lesson.podsieConfig === undefined);
}
