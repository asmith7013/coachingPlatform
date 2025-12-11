"use server";

import * as fs from "fs";
import * as path from "path";
import * as yaml from "yaml";
import { normalizeLessonName } from "@/lib/utils/lesson-name-normalization";

// =====================================
// TYPES
// =====================================

interface QuestionYml {
  external_id: string;
  type: string;
  order?: number;
  knowledge_component_id?: string;
  root_question_id?: string;
}

interface AssignmentYml {
  external_id: string;
  title: string;
  mode?: string;
  maxAnswerAttempts?: number;
  isOptional?: boolean;
}

interface VariationInfo {
  order: number;
  external_id: string;
}

interface CurriculumQuestionEntry {
  questionNumber: number;
  external_id: string;
  isRoot: boolean;
  hasVariations: boolean;
  variationCount: number;
  variations?: VariationInfo[];
}

export interface CurriculumQuestionMap {
  assignment: {
    external_id: string;
    title: string;
    path: string;
    normalizedTitle: string;
  };
  questions: CurriculumQuestionEntry[];
  summary: {
    totalRootQuestions: number;
    totalVariations: number;
    totalQuestions: number;
    q1HasVariations: boolean;
    variationsPerQuestion: number;
  };
}

export interface AppliedQuestionMap {
  questionNumber: number;
  questionId: string; // Podsie numeric ID as string
  isRoot: boolean;
  rootQuestionId?: string;
  variantNumber?: number;
}

// =====================================
// CURRICULUM PATH
// =====================================

// Path to the podsie-curriculum repo (relative to user's home directory)
const CURRICULUM_BASE_PATH = path.join(
  process.env.HOME || "/Users/alexsmith",
  "Documents/GitHub/podsie-curriculum"
);

// =====================================
// UTILITY FUNCTIONS
// =====================================

function readYamlFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return yaml.parse(content) as T;
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}:`, error);
    return null;
  }
}

function getSubdirectories(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

function numericSort(a: string, b: string): number {
  const numA = parseInt(a, 10);
  const numB = parseInt(b, 10);
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  return a.localeCompare(b);
}

// =====================================
// PARSE VARIATIONS
// =====================================

function parseVariations(variationsDir: string, assignmentFolder: string, questionNumber: number): VariationInfo[] {
  if (!fs.existsSync(variationsDir)) {
    return [];
  }

  const variations: VariationInfo[] = [];
  const variationFolders = getSubdirectories(variationsDir).sort(numericSort);

  for (const folderName of variationFolders) {
    const questionYmlPath = path.join(variationsDir, folderName, "question.yml");
    const questionContentsPath = path.join(variationsDir, folderName, "question-contents.md");
    const questionData = readYamlFile<QuestionYml>(questionYmlPath);

    // Check if this folder has a question (either yml or contents.md)
    if (questionData || fs.existsSync(questionContentsPath)) {
      const variationOrder = parseInt(folderName, 10);
      // Use external_id from yml if available, otherwise generate from path
      const variationExternalId = questionData?.external_id ||
        `path:${assignmentFolder}:q${questionNumber}:v${variationOrder}`;

      variations.push({
        order: variationOrder,
        external_id: variationExternalId,
      });
    }
  }

  return variations;
}

// =====================================
// HELPER: Convert folder name to title
// =====================================

function folderNameToTitle(folderName: string): string {
  // Convert "Lesson-08-Solving-Rate-Problems" to "Lesson 8: Solving Rate Problems"
  // Convert "Ramp-Up-2" to "Ramp Up 2"

  // Replace hyphens with spaces
  let title = folderName.replace(/-/g, " ");

  // Handle lesson patterns: "Lesson 08" -> "Lesson 8:"
  title = title.replace(/^(Lesson)\s+0*(\d+)\s+/i, "$1 $2: ");

  // Handle ramp-up patterns: "Ramp Up 2" stays as is
  title = title.replace(/^(Ramp Up)\s+(\d+)\s*/i, "Ramp Up $2: ");

  // Remove leading zeros from any remaining numbers
  title = title.replace(/\b0+(\d+)/g, "$1");

  // Trim trailing colons if nothing follows
  title = title.replace(/:\s*$/, "");

  return title.trim();
}

// =====================================
// PARSE SINGLE ASSIGNMENT
// =====================================

function parseAssignment(assignmentPath: string): CurriculumQuestionMap | null {
  const normalizedPath = assignmentPath.replace(/\/$/, "");
  const assignmentYmlPath = path.join(normalizedPath, "assignment.yml");

  // Get questions directory - this is required
  const questionsDir = path.join(normalizedPath, "questions");
  if (!fs.existsSync(questionsDir)) {
    return null;
  }

  // Try to read assignment metadata from yml, but don't require it
  const assignmentData = readYamlFile<AssignmentYml>(assignmentYmlPath);

  // Derive title and external_id from folder if no yml
  const folderName = path.basename(normalizedPath);
  const title = assignmentData?.title || folderNameToTitle(folderName);
  const externalId = assignmentData?.external_id || `folder:${folderName}`;

  // Parse all root questions
  const questionFolders = getSubdirectories(questionsDir).sort(numericSort);
  const questions: CurriculumQuestionEntry[] = [];

  for (const qFolderName of questionFolders) {
    const questionDir = path.join(questionsDir, qFolderName);
    const questionYmlPath = path.join(questionDir, "question.yml");
    const questionContentsPath = path.join(questionDir, "question-contents.md");
    const questionData = readYamlFile<QuestionYml>(questionYmlPath);

    // Skip if neither question.yml nor question-contents.md exists
    if (!questionData && !fs.existsSync(questionContentsPath)) {
      continue;
    }

    const questionNumber = parseInt(qFolderName, 10);
    const variationsDir = path.join(questionDir, "variations");
    const variations = parseVariations(variationsDir, folderName, questionNumber);

    // If no question.yml, generate an external_id from the path
    // Format: path:<assignment-folder>:q<number>
    const questionExternalId = questionData?.external_id || `path:${folderName}:q${questionNumber}`;

    questions.push({
      questionNumber,
      external_id: questionExternalId,
      isRoot: true,
      hasVariations: variations.length > 0,
      variationCount: variations.length,
      ...(variations.length > 0 ? { variations } : {}),
    });
  }

  // Skip if no questions found
  if (questions.length === 0) {
    return null;
  }

  // Calculate summary
  const totalRootQuestions = questions.length;
  const totalVariations = questions.reduce((sum, q) => sum + q.variationCount, 0);
  const q1HasVariations = questions[0]?.hasVariations ?? false;

  const questionsWithVariations = questions.filter((q) => q.hasVariations);
  const variationsPerQuestion =
    questionsWithVariations.length > 0
      ? Math.round(
          questionsWithVariations.reduce((sum, q) => sum + q.variationCount, 0) /
            questionsWithVariations.length
        )
      : 0;

  // Build relative path
  const relativePath = normalizedPath.includes("courses/")
    ? normalizedPath.substring(normalizedPath.indexOf("courses/"))
    : normalizedPath;

  // Normalize title for matching
  const normalizedTitle = normalizeLessonName(title).normalized;

  return {
    assignment: {
      external_id: externalId,
      title,
      path: relativePath,
      normalizedTitle,
    },
    questions,
    summary: {
      totalRootQuestions,
      totalVariations,
      totalQuestions: totalRootQuestions + totalVariations,
      q1HasVariations,
      variationsPerQuestion,
    },
  };
}

// =====================================
// SCAN ALL ASSIGNMENTS
// =====================================

/**
 * Scan the podsie-curriculum repo and build a map of all assignments
 * Returns a lookup by normalized assignment name
 */
export async function scanCurriculumAssignments(): Promise<{
  success: boolean;
  data?: {
    assignments: CurriculumQuestionMap[];
    byNormalizedName: Record<string, CurriculumQuestionMap>;
    byExternalId: Record<string, CurriculumQuestionMap>;
  };
  error?: string;
}> {
  try {
    const coursesDir = path.join(CURRICULUM_BASE_PATH, "courses");

    if (!fs.existsSync(coursesDir)) {
      return {
        success: false,
        error: `Curriculum directory not found: ${coursesDir}`,
      };
    }

    const assignments: CurriculumQuestionMap[] = [];
    const byNormalizedName: Record<string, CurriculumQuestionMap> = {};
    const byExternalId: Record<string, CurriculumQuestionMap> = {};

    // Scan all courses
    const courses = getSubdirectories(coursesDir);

    for (const course of courses) {
      const modulesDir = path.join(coursesDir, course, "modules");
      if (!fs.existsSync(modulesDir)) continue;

      // Scan all modules (units)
      const moduleNames = getSubdirectories(modulesDir);

      for (const moduleName of moduleNames) {
        const assignmentsDir = path.join(modulesDir, moduleName, "assignments");
        if (!fs.existsSync(assignmentsDir)) continue;

        // Scan all assignments
        const assignmentFolders = getSubdirectories(assignmentsDir);

        for (const assignmentFolder of assignmentFolders) {
          const assignmentPath = path.join(assignmentsDir, assignmentFolder);
          const parsed = parseAssignment(assignmentPath);

          if (parsed) {
            assignments.push(parsed);
            byNormalizedName[parsed.assignment.normalizedTitle] = parsed;
            byExternalId[parsed.assignment.external_id] = parsed;
          }
        }
      }
    }

    return {
      success: true,
      data: {
        assignments,
        byNormalizedName,
        byExternalId,
      },
    };
  } catch (error) {
    console.error("Error scanning curriculum:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error scanning curriculum",
    };
  }
}

// =====================================
// FIND MATCHING CURRICULUM ASSIGNMENT
// =====================================

/**
 * Find a curriculum assignment that matches a Podsie assignment name
 */
export async function findCurriculumMatch(
  podsieAssignmentName: string
): Promise<{
  success: boolean;
  data?: CurriculumQuestionMap;
  error?: string;
}> {
  const scanResult = await scanCurriculumAssignments();

  if (!scanResult.success || !scanResult.data) {
    return { success: false, error: scanResult.error };
  }

  const normalizedTarget = normalizeLessonName(podsieAssignmentName).normalized;

  // Try exact normalized match first
  if (scanResult.data.byNormalizedName[normalizedTarget]) {
    return {
      success: true,
      data: scanResult.data.byNormalizedName[normalizedTarget],
    };
  }

  // Try fuzzy matching
  let bestMatch: CurriculumQuestionMap | null = null;
  let bestScore = 0;

  for (const assignment of scanResult.data.assignments) {
    // Calculate word overlap score
    const targetWords = normalizedTarget.split(/\s+/);
    const assignmentWords = assignment.assignment.normalizedTitle.split(/\s+/);

    const commonWords = targetWords.filter(w => assignmentWords.includes(w));
    const union = new Set([...targetWords, ...assignmentWords]);
    const score = commonWords.length / union.size;

    if (score > bestScore && score >= 0.6) {
      bestScore = score;
      bestMatch = assignment;
    }
  }

  if (bestMatch) {
    return { success: true, data: bestMatch };
  }

  return {
    success: false,
    error: `No matching curriculum assignment found for: ${podsieAssignmentName}`,
  };
}

// =====================================
// APPLY CURRICULUM STRUCTURE TO PODSIE IDS
// =====================================

/**
 * Apply the curriculum question structure to Podsie numeric question IDs
 *
 * The Podsie IDs are assigned sequentially in the same order as the curriculum:
 * - Q1 root → first ID
 * - Q1 var1 → second ID (if Q1 has variations)
 * - Q1 var2 → third ID (if Q1 has variations)
 * - Q2 root → next ID
 * - Q2 var1 → next ID
 * - etc.
 */
function applyQuestionStructure(
  curriculumMap: CurriculumQuestionMap,
  podsieQuestionIds: number[]
): AppliedQuestionMap[] {
  const result: AppliedQuestionMap[] = [];
  let podsieIndex = 0;

  for (const question of curriculumMap.questions) {
    // Add root question
    if (podsieIndex < podsieQuestionIds.length) {
      const rootId = String(podsieQuestionIds[podsieIndex]);
      result.push({
        questionNumber: question.questionNumber,
        questionId: rootId,
        isRoot: true,
      });
      podsieIndex++;

      // Add variations
      if (question.hasVariations && question.variations) {
        for (const variation of question.variations) {
          if (podsieIndex < podsieQuestionIds.length) {
            result.push({
              questionNumber: question.questionNumber,
              questionId: String(podsieQuestionIds[podsieIndex]),
              isRoot: false,
              rootQuestionId: rootId,
              variantNumber: variation.order,
            });
            podsieIndex++;
          }
        }
      }
    }
  }

  return result;
}

// =====================================
// GET QUESTION MAP FOR PODSIE ASSIGNMENT
// =====================================

/**
 * @deprecated Use `getQuestionMapByName` from `@/app/actions/313/podsie-question-map` instead.
 * This function reads from local filesystem which is not portable.
 * The database function reads from the `podsie-question-maps` MongoDB collection.
 *
 * Get a complete question map for a Podsie assignment by matching it
 * to the curriculum and applying the structure to the Podsie IDs
 */
export async function getQuestionMapFromCurriculum(
  podsieAssignmentName: string,
  podsieQuestionIds: number[]
): Promise<{
  success: boolean;
  data?: {
    questionMap: AppliedQuestionMap[];
    curriculumMatch: CurriculumQuestionMap;
    totalQuestions: number;
  };
  error?: string;
}> {
  console.warn(
    `[DEPRECATED] getQuestionMapFromCurriculum is deprecated. ` +
    `Use getQuestionMapByName from podsie-question-map instead.`
  );

  // Find matching curriculum assignment
  const matchResult = await findCurriculumMatch(podsieAssignmentName);

  if (!matchResult.success || !matchResult.data) {
    return { success: false, error: matchResult.error };
  }

  const curriculumMatch = matchResult.data;

  // Verify question count matches
  const expectedTotal = curriculumMatch.summary.totalQuestions;
  if (podsieQuestionIds.length !== expectedTotal) {
    console.warn(
      `Question count mismatch for "${podsieAssignmentName}": ` +
      `expected ${expectedTotal}, got ${podsieQuestionIds.length}`
    );
  }

  // Apply the structure
  const questionMap = applyQuestionStructure(curriculumMatch, podsieQuestionIds);

  return {
    success: true,
    data: {
      questionMap,
      curriculumMatch,
      totalQuestions: questionMap.length,
    },
  };
}

// =====================================
// BULK SYNC QUESTION MAPS
// =====================================

export interface BulkQuestionMapSyncResult {
  assignmentName: string;
  podsieAssignmentId: number;
  success: boolean;
  questionMapCount?: number;
  curriculumPath?: string;
  error?: string;
}

/**
 * Bulk sync question maps from curriculum for multiple Podsie assignments
 */
export async function bulkSyncQuestionMapsFromCurriculum(
  assignments: Array<{
    assignmentId: number;
    assignmentName: string;
    questionIds: number[];
  }>
): Promise<{
  success: boolean;
  results: BulkQuestionMapSyncResult[];
  matched: number;
  unmatched: number;
}> {
  const results: BulkQuestionMapSyncResult[] = [];
  let matched = 0;
  let unmatched = 0;

  for (const assignment of assignments) {
    const mapResult = await getQuestionMapFromCurriculum(
      assignment.assignmentName,
      assignment.questionIds
    );

    if (mapResult.success && mapResult.data) {
      results.push({
        assignmentName: assignment.assignmentName,
        podsieAssignmentId: assignment.assignmentId,
        success: true,
        questionMapCount: mapResult.data.totalQuestions,
        curriculumPath: mapResult.data.curriculumMatch.assignment.path,
      });
      matched++;
    } else {
      results.push({
        assignmentName: assignment.assignmentName,
        podsieAssignmentId: assignment.assignmentId,
        success: false,
        error: mapResult.error,
      });
      unmatched++;
    }
  }

  return {
    success: true,
    results,
    matched,
    unmatched,
  };
}

// =====================================
// CHECK CURRICULUM AVAILABILITY
// =====================================

export interface CurriculumMatchPreview {
  assignmentId: number;
  assignmentName: string;
  hasCurriculumMatch: boolean;
  curriculumPath?: string;
  totalQuestions?: number;
  rootQuestions?: number;
  variations?: number;
}

/**
 * Check which Podsie assignments have curriculum matches available
 * (without applying the question IDs - just for preview)
 */
export async function checkCurriculumMatches(
  assignments: Array<{
    assignmentId: number;
    assignmentName: string;
  }>
): Promise<{
  success: boolean;
  previews: CurriculumMatchPreview[];
  matchedCount: number;
  unmatchedCount: number;
}> {
  const scanResult = await scanCurriculumAssignments();

  if (!scanResult.success || !scanResult.data) {
    return {
      success: false,
      previews: assignments.map(a => ({
        assignmentId: a.assignmentId,
        assignmentName: a.assignmentName,
        hasCurriculumMatch: false,
      })),
      matchedCount: 0,
      unmatchedCount: assignments.length,
    };
  }

  const previews: CurriculumMatchPreview[] = [];
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const assignment of assignments) {
    const normalizedTarget = normalizeLessonName(assignment.assignmentName).normalized;

    // Try exact normalized match first
    let curriculumMatch = scanResult.data.byNormalizedName[normalizedTarget];

    // Try fuzzy matching if no exact match
    if (!curriculumMatch) {
      let bestScore = 0;
      for (const candidateMap of scanResult.data.assignments) {
        const targetWords = normalizedTarget.split(/\s+/);
        const assignmentWords = candidateMap.assignment.normalizedTitle.split(/\s+/);
        const commonWords = targetWords.filter(w => assignmentWords.includes(w));
        const union = new Set([...targetWords, ...assignmentWords]);
        const score = commonWords.length / union.size;

        if (score > bestScore && score >= 0.6) {
          bestScore = score;
          curriculumMatch = candidateMap;
        }
      }
    }

    if (curriculumMatch) {
      previews.push({
        assignmentId: assignment.assignmentId,
        assignmentName: assignment.assignmentName,
        hasCurriculumMatch: true,
        curriculumPath: curriculumMatch.assignment.path,
        totalQuestions: curriculumMatch.summary.totalQuestions,
        rootQuestions: curriculumMatch.summary.totalRootQuestions,
        variations: curriculumMatch.summary.totalVariations,
      });
      matchedCount++;
    } else {
      previews.push({
        assignmentId: assignment.assignmentId,
        assignmentName: assignment.assignmentName,
        hasCurriculumMatch: false,
      });
      unmatchedCount++;
    }
  }

  return {
    success: true,
    previews,
    matchedCount,
    unmatchedCount,
  };
}

// =====================================
// GET ALL CURRICULUM ASSIGNMENTS FOR DISPLAY
// =====================================

export interface CurriculumAssignmentSummary {
  externalId: string;
  title: string;
  path: string;
  course: string;
  unit: string;
  totalRootQuestions: number;
  totalVariations: number;
  totalQuestions: number;
  q1HasVariations: boolean;
  variationsPerQuestion: number;
}

/**
 * Get all curriculum assignments for display in the UI
 * This scans the local podsie-curriculum repo and returns summaries
 */
export async function getAllCurriculumAssignments(): Promise<{
  success: boolean;
  data?: {
    assignments: CurriculumAssignmentSummary[];
    totalAssignments: number;
    curriculumPath: string;
  };
  error?: string;
}> {
  const scanResult = await scanCurriculumAssignments();

  if (!scanResult.success || !scanResult.data) {
    return {
      success: false,
      error: scanResult.error || "Failed to scan curriculum",
    };
  }

  const assignments: CurriculumAssignmentSummary[] = scanResult.data.assignments.map(
    (assignment) => {
      // Extract course and unit from path
      // e.g., "courses/IM-8th-Grade/modules/Unit-3/assignments/Ramp-Up-2"
      const pathParts = assignment.assignment.path.split("/");
      const course = pathParts[1] || "Unknown";
      const unit = pathParts[3] || "Unknown";

      return {
        externalId: assignment.assignment.external_id,
        title: assignment.assignment.title,
        path: assignment.assignment.path,
        course,
        unit,
        totalRootQuestions: assignment.summary.totalRootQuestions,
        totalVariations: assignment.summary.totalVariations,
        totalQuestions: assignment.summary.totalQuestions,
        q1HasVariations: assignment.summary.q1HasVariations,
        variationsPerQuestion: assignment.summary.variationsPerQuestion,
      };
    }
  );

  // Sort by course, then unit, then title
  assignments.sort((a, b) => {
    if (a.course !== b.course) return a.course.localeCompare(b.course);
    if (a.unit !== b.unit) return a.unit.localeCompare(b.unit);
    return a.title.localeCompare(b.title);
  });

  return {
    success: true,
    data: {
      assignments,
      totalAssignments: assignments.length,
      curriculumPath: CURRICULUM_BASE_PATH,
    },
  };
}

// =====================================
// EXPORT QUESTION MAP TO DATABASE
// =====================================

export interface ExportQuestionMapResult {
  externalId: string;
  title: string;
  success: boolean;
  totalQuestions?: number;
  error?: string;
}

/**
 * Export a single curriculum assignment's question map to the database
 * This stores the structure (root/variations) using external_ids as questionIds
 * Later, when matching to Podsie, the numeric IDs will be applied
 */
export async function exportCurriculumQuestionMapToDb(
  curriculumPath: string
): Promise<{
  success: boolean;
  data?: ExportQuestionMapResult;
  error?: string;
}> {
  try {
    const scanResult = await scanCurriculumAssignments();

    if (!scanResult.success || !scanResult.data) {
      return { success: false, error: scanResult.error };
    }

    // Find the assignment by path
    const assignment = scanResult.data.assignments.find(
      (a) => a.assignment.path === curriculumPath
    );

    if (!assignment) {
      return {
        success: false,
        error: `Assignment not found at path: ${curriculumPath}`,
      };
    }

    // Build question map using external_ids
    const questionMap: AppliedQuestionMap[] = [];
    for (const question of assignment.questions) {
      // Add root question
      questionMap.push({
        questionNumber: question.questionNumber,
        questionId: question.external_id,
        isRoot: true,
      });

      // Add variations
      if (question.hasVariations && question.variations) {
        for (const variation of question.variations) {
          questionMap.push({
            questionNumber: question.questionNumber,
            questionId: variation.external_id,
            isRoot: false,
            rootQuestionId: question.external_id,
            variantNumber: variation.order,
          });
        }
      }
    }

    // Import the save function dynamically to avoid circular deps
    const { saveQuestionMap } = await import("@/app/actions/313/podsie-question-map");

    // Save to database using the title as the assignment identifier
    // We use "curriculum:" prefix to distinguish from Podsie numeric IDs
    const result = await saveQuestionMap({
      assignmentId: `curriculum:${assignment.assignment.external_id}`,
      assignmentName: assignment.assignment.title,
      questionMap,
      totalQuestions: questionMap.length,
      createdBy: "curriculum-export",
      notes: `Exported from ${assignment.assignment.path}`,
    });

    if (result.success) {
      return {
        success: true,
        data: {
          externalId: assignment.assignment.external_id,
          title: assignment.assignment.title,
          success: true,
          totalQuestions: questionMap.length,
        },
      };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Export all curriculum assignments to the database
 */
export async function exportAllCurriculumQuestionMapsToDb(): Promise<{
  success: boolean;
  results: ExportQuestionMapResult[];
  exported: number;
  failed: number;
  error?: string;
}> {
  const scanResult = await scanCurriculumAssignments();

  if (!scanResult.success || !scanResult.data) {
    return {
      success: false,
      results: [],
      exported: 0,
      failed: 0,
      error: scanResult.error,
    };
  }

  const results: ExportQuestionMapResult[] = [];
  let exported = 0;
  let failed = 0;

  for (const assignment of scanResult.data.assignments) {
    const exportResult = await exportCurriculumQuestionMapToDb(
      assignment.assignment.path
    );

    if (exportResult.success && exportResult.data) {
      results.push(exportResult.data);
      exported++;
    } else {
      results.push({
        externalId: assignment.assignment.external_id,
        title: assignment.assignment.title,
        success: false,
        error: exportResult.error,
      });
      failed++;
    }
  }

  return {
    success: failed === 0,
    results,
    exported,
    failed,
  };
}
