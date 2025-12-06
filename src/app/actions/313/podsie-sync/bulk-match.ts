"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { fetchAssignmentsForSection, PodsieAssignmentInfo } from "./index";
import { fetchScopeAndSequence } from "@/app/actions/313/scope-and-sequence";
import { getAssignmentContent, addAssignmentContent, getSectionConfig, upsertSectionConfig } from "@/app/actions/313/section-config";
import { findBestMatch } from "@/lib/utils/lesson-name-normalization";
import { getQuestionMapFromCurriculum } from "@/app/actions/313/curriculum-question-map";
import type { ScopeAndSequence } from "@zod-schema/313/curriculum/scope-and-sequence";

// =====================================
// TYPES
// =====================================

export interface AssignmentMatchResult {
  podsieAssignment: PodsieAssignmentInfo;
  matchedLesson: {
    id: string;
    unitLessonId: string;
    lessonName: string;
    lessonType?: string;
    section?: string;
    grade?: string;
  } | null;
  similarity: number;
  assignmentType: 'sidekick' | 'mastery-check' | 'assessment';
  alreadyExists: boolean;
  existingScopeSequenceId?: string;
}

export interface ConflictResult {
  podsieAssignment: PodsieAssignmentInfo;
  existingLesson: { id: string; name: string; unitLessonId: string };
  newMatchedLesson: { id: string; name: string; unitLessonId: string };
}

export interface AvailableLesson {
  id: string;
  unitLessonId: string;
  lessonName: string;
  lessonType?: string;
  section?: string;
  grade?: string;
}

export interface BulkMatchResult {
  school: string;
  classSection: string;
  gradeLevel: string;
  scopeTag: string;
  matches: AssignmentMatchResult[];
  unmatched: PodsieAssignmentInfo[];
  conflicts: ConflictResult[];
  existingCount: number;
  availableLessons: AvailableLesson[];
  error?: string;
}

// =====================================
// HELPER FUNCTIONS
// =====================================

/**
 * Determine grade level and scope tag from section code
 */
function getSectionGradeAndScope(classSection: string): { gradeLevel: string; scopeTag: string } {
  const gradeLevel = classSection.startsWith('6') ? '6' :
                    classSection.startsWith('7') ? '7' : '8';
  const scopeTag = classSection === '802' ? 'Algebra 1' : `Grade ${gradeLevel}`;
  return { gradeLevel, scopeTag };
}

/**
 * Determine assignment type based on module name and lesson type
 */
function determineAssignmentType(
  moduleName: string | undefined,
  lessonType?: string
): 'sidekick' | 'mastery-check' | 'assessment' {
  if (lessonType === 'assessment') {
    return 'assessment';
  }
  if (moduleName?.includes('LESSONS')) {
    return 'sidekick';
  }
  return 'mastery-check';
}

// =====================================
// BULK FETCH AND MATCH
// =====================================

/**
 * Fetch Podsie assignments for multiple sections and auto-match them
 * to scope-and-sequence entries
 */
export async function bulkFetchAndMatch(
  sections: { school: string; classSection: string }[]
): Promise<{ success: boolean; results: BulkMatchResult[]; error?: string }> {
  return withDbConnection(async () => {
    try {
      const results: BulkMatchResult[] = [];

      // Process each section
      for (const section of sections) {
        try {
          const result = await fetchAndMatchSection(section.school, section.classSection);
          results.push(result);
        } catch (error) {
          console.error(`Error processing section ${section.classSection}:`, error);
          const { gradeLevel, scopeTag } = getSectionGradeAndScope(section.classSection);
          results.push({
            school: section.school,
            classSection: section.classSection,
            gradeLevel,
            scopeTag,
            matches: [],
            unmatched: [],
            conflicts: [],
            existingCount: 0,
            availableLessons: [],
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return { success: true, results };
    } catch (error) {
      console.error('Error in bulkFetchAndMatch:', error);
      return {
        success: false,
        results: [],
        error: handleServerError(error, 'Failed to bulk fetch and match')
      };
    }
  });
}

/**
 * Fetch and match assignments for a single section
 */
async function fetchAndMatchSection(
  school: string,
  classSection: string
): Promise<BulkMatchResult> {
  const { gradeLevel, scopeTag } = getSectionGradeAndScope(classSection);

  // 1. Fetch Podsie assignments
  const podsieResult = await fetchAssignmentsForSection(classSection, true);
  if (!podsieResult.success) {
    return {
      school,
      classSection,
      gradeLevel,
      scopeTag,
      matches: [],
      unmatched: [],
      conflicts: [],
      existingCount: 0,
      availableLessons: [],
      error: podsieResult.error || 'Failed to fetch Podsie assignments'
    };
  }

  const podsieAssignments = podsieResult.assignments;

  // 2. Fetch scope-and-sequence lessons for this grade/scope
  const lessonsResult = await fetchScopeAndSequence({
    page: 1,
    limit: 1000,
    sortBy: 'unitNumber',
    sortOrder: 'asc',
    filters: {
      grade: gradeLevel,
      scopeSequenceTag: scopeTag
    },
    search: '',
    searchFields: []
  });

  const lessons = (lessonsResult.success && lessonsResult.items)
    ? lessonsResult.items as ScopeAndSequence[]
    : [];

  // 3. Get existing assignment content
  const existingResult = await getAssignmentContent(school, classSection);
  const existingAssignments = existingResult.success && existingResult.data
    ? existingResult.data
    : [];

  // Build a map of podsieAssignmentId -> existing assignment info
  const existingMap = new Map<string, { scopeAndSequenceId: string; lessonName: string; unitLessonId: string }>();
  for (const existing of existingAssignments) {
    if (existing.podsieActivities) {
      for (const activity of existing.podsieActivities) {
        existingMap.set(activity.podsieAssignmentId, {
          scopeAndSequenceId: existing.scopeAndSequenceId || '',
          lessonName: existing.lessonName,
          unitLessonId: existing.unitLessonId
        });
      }
    }
  }

  // 4. Match each assignment
  const matches: AssignmentMatchResult[] = [];
  const unmatched: PodsieAssignmentInfo[] = [];
  const conflicts: ConflictResult[] = [];

  for (const assignment of podsieAssignments) {
    const assignmentIdStr = String(assignment.assignmentId);
    const existingInfo = existingMap.get(assignmentIdStr);
    const alreadyExists = !!existingInfo;

    // Try to find best match
    const matchResult = findBestMatch(assignment.assignmentName, lessons, 0.6);
    const matchedLesson = matchResult.match;

    if (matchedLesson) {
      const lessonId = matchedLesson.id || (matchedLesson as unknown as { _id: string })._id;
      const assignmentType = determineAssignmentType(
        assignment.moduleName,
        matchedLesson.lessonType
      );

      // Check for conflict: existing match has different scope-and-sequence ID
      if (alreadyExists && existingInfo && existingInfo.scopeAndSequenceId !== lessonId) {
        conflicts.push({
          podsieAssignment: assignment,
          existingLesson: {
            id: existingInfo.scopeAndSequenceId,
            name: existingInfo.lessonName,
            unitLessonId: existingInfo.unitLessonId
          },
          newMatchedLesson: {
            id: lessonId,
            name: matchedLesson.lessonName,
            unitLessonId: matchedLesson.unitLessonId
          }
        });
      } else {
        matches.push({
          podsieAssignment: assignment,
          matchedLesson: {
            id: lessonId,
            unitLessonId: matchedLesson.unitLessonId,
            lessonName: matchedLesson.lessonName,
            lessonType: matchedLesson.lessonType,
            section: matchedLesson.section,
            grade: matchedLesson.grade
          },
          similarity: matchResult.similarity,
          assignmentType,
          alreadyExists,
          existingScopeSequenceId: existingInfo?.scopeAndSequenceId
        });
      }
    } else {
      // No match found
      if (!alreadyExists) {
        unmatched.push(assignment);
      } else {
        // Already exists but no new match - include as a match with null lesson
        matches.push({
          podsieAssignment: assignment,
          matchedLesson: null,
          similarity: 0,
          assignmentType: 'mastery-check',
          alreadyExists: true,
          existingScopeSequenceId: existingInfo?.scopeAndSequenceId
        });
      }
    }
  }

  // Build available lessons list for manual matching
  const availableLessons: AvailableLesson[] = lessons.map(lesson => ({
    id: lesson.id || (lesson as unknown as { _id: string })._id,
    unitLessonId: lesson.unitLessonId,
    lessonName: lesson.lessonName,
    lessonType: lesson.lessonType,
    section: lesson.section,
    grade: lesson.grade
  }));

  return {
    school,
    classSection,
    gradeLevel,
    scopeTag,
    matches,
    unmatched,
    conflicts,
    existingCount: existingAssignments.length,
    availableLessons
  };
}

// =====================================
// BULK SAVE MATCHES
// =====================================

export interface SaveMatchInput {
  school: string;
  classSection: string;
  match: AssignmentMatchResult;
}

/**
 * Save a single match to section config
 */
export async function saveSingleMatch(
  input: SaveMatchInput
): Promise<{ success: boolean; error?: string; usedCurriculumMap?: boolean }> {
  return withDbConnection(async () => {
    try {
      const { school, classSection, match } = input;

      if (!match.matchedLesson) {
        return { success: false, error: 'No matched lesson provided' };
      }

      // Ensure section config exists
      const configResult = await getSectionConfig(school, classSection);
      if (!configResult.success || !configResult.data) {
        // Create section config
        const { gradeLevel, scopeTag } = getSectionGradeAndScope(classSection);
        const createResult = await upsertSectionConfig({
          school,
          classSection,
          gradeLevel,
          scopeSequenceTag: scopeTag,
          assignmentContent: [],
          active: true
        });
        if (!createResult.success) {
          return { success: false, error: createResult.error || 'Failed to create section config' };
        }
      }

      // Try to get question map from curriculum (includes root/variation structure)
      let questionMap: Array<{
        questionNumber: number;
        questionId: string;
        isRoot: boolean;
        rootQuestionId?: string;
        variantNumber?: number;
      }>;
      let usedCurriculumMap = false;

      const curriculumResult = await getQuestionMapFromCurriculum(
        match.podsieAssignment.assignmentName,
        match.podsieAssignment.questionIds
      );

      if (curriculumResult.success && curriculumResult.data) {
        // Use the curriculum-based question map with proper structure
        questionMap = curriculumResult.data.questionMap;
        usedCurriculumMap = true;
        console.log(
          `Using curriculum question map for "${match.podsieAssignment.assignmentName}" ` +
          `(${questionMap.length} questions from ${curriculumResult.data.curriculumMatch.assignment.path})`
        );
      } else {
        // Fallback: assume all questions are root questions
        console.warn(
          `No curriculum match for "${match.podsieAssignment.assignmentName}", ` +
          `using fallback (all root questions)`
        );
        questionMap = match.podsieAssignment.questionIds
          .slice(0, match.podsieAssignment.totalQuestions)
          .map((questionId, index) => ({
            questionNumber: index + 1,
            questionId: String(questionId),
            isRoot: true
          }));
      }

      // Save assignment content
      const result = await addAssignmentContent(school, classSection, {
        scopeAndSequenceId: match.matchedLesson.id,
        unitLessonId: match.matchedLesson.unitLessonId,
        lessonName: match.matchedLesson.lessonName,
        section: match.matchedLesson.section,
        grade: match.matchedLesson.grade,
        activityType: match.assignmentType,
        podsieAssignmentId: String(match.podsieAssignment.assignmentId),
        podsieQuestionMap: questionMap,
        totalQuestions: questionMap.length,
        hasZearnLesson: false,
        active: true
      });

      return { success: result.success, error: result.error, usedCurriculumMap };
    } catch (error) {
      console.error('Error saving match:', error);
      return {
        success: false,
        error: handleServerError(error, 'Failed to save match')
      };
    }
  });
}

/**
 * Save multiple matches for a section
 */
export async function bulkSaveMatches(
  school: string,
  classSection: string,
  matches: AssignmentMatchResult[]
): Promise<{ success: boolean; saved: number; failed: number; errors: string[] }> {
  return withDbConnection(async () => {
    const errors: string[] = [];
    let saved = 0;
    let failed = 0;

    // Filter to only matches with a matched lesson that don't already exist
    const toSave = matches.filter(m => m.matchedLesson && !m.alreadyExists);

    for (const match of toSave) {
      const result = await saveSingleMatch({ school, classSection, match });
      if (result.success) {
        saved++;
      } else {
        failed++;
        errors.push(`${match.podsieAssignment.assignmentName}: ${result.error}`);
      }
    }

    return {
      success: failed === 0,
      saved,
      failed,
      errors
    };
  });
}
