"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@/lib/schema/mongoose-schema/313/student.model";
import { RampUpQuestion } from "@zod-schema/313/student";
import { calculateRampUpSummary } from "@zod-schema/313/ramp-up-progress";
import {
  PodsieApiResponseSchema,
  PodsieResponse,
} from "@zod-schema/313/podsie-response";
import { z } from "zod";

// =====================================
// FETCH FROM PODSIE API
// =====================================

/**
 * Schema for Podsie assignment questions endpoint response
 */
const PodsieAssignmentQuestionsSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    group_name: z.string(),
    assignment_name: z.string(),
    assignment_id: z.number(),
    assignment_questions: z.array(z.object({
      questions: z.object({
        id: z.number(),
        questionContent: z.object({
          questionText: z.string(),
        }).passthrough(),
      }),
    })),
  })),
});

/**
 * Fetch assignment question IDs from Podsie
 * These are the "base" question IDs that can be used for mapping
 */
export async function fetchPodsieAssignmentQuestions(
  assignmentId: string
): Promise<{ success: boolean; questionIds: number[]; error?: string }> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    return { success: false, questionIds: [], error: "PODSIE_API_TOKEN not configured" };
  }

  try {
    const response = await fetch(
      `https://www.podsie.org/api/assignments/${assignmentId}/questions`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        questionIds: [],
        error: `Podsie API error: ${response.status} ${response.statusText}`,
      };
    }

    const rawData = await response.json();
    const parseResult = PodsieAssignmentQuestionsSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Podsie questions response validation failed:", parseResult.error.issues);
      return {
        success: false,
        questionIds: [],
        error: `Invalid response format: ${parseResult.error.message}`,
      };
    }

    // Extract question IDs in order
    const data = parseResult.data;
    if (data.data.length === 0) {
      return { success: false, questionIds: [], error: "No assignment data found" };
    }

    const questionIds = data.data[0].assignment_questions.map(q => q.questions.id);

    return { success: true, questionIds };
  } catch (error) {
    console.error("Error fetching Podsie assignment questions:", error);
    return {
      success: false,
      questionIds: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch student responses from Podsie API for a given assignment
 */
async function fetchPodsieResponses(
  assignmentId: string,
  studentEmail: string
): Promise<PodsieResponse[]> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    throw new Error("PODSIE_API_TOKEN not configured");
  }

  const response = await fetch(
    `https://www.podsie.org/api/assignments/${assignmentId}/responses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: studentEmail }),
    }
  );

  if (!response.ok) {
    throw new Error(`Podsie API error: ${response.status} ${response.statusText}`);
  }

  const rawData = await response.json();

  // Validate response with Zod schema
  const parseResult = PodsieApiResponseSchema.safeParse(rawData);
  if (!parseResult.success) {
    console.error("Podsie API response validation failed:", parseResult.error.issues);
    throw new Error(`Invalid Podsie API response format: ${parseResult.error.message}`);
  }

  const data = parseResult.data;

  if (!data.success) {
    throw new Error("Podsie API returned unsuccessful response");
  }

  return data.data.responses;
}

// =====================================
// FETCH ASSIGNED ASSIGNMENTS FOR A STUDENT
// =====================================

/**
 * Schema for Podsie assigned-assignments endpoint response
 */
const PodsieAssignedAssignmentsSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    group_name: z.string(),
    assignment_name: z.string(),
    assignment_id: z.number(),
    module_name: z.string().optional(),
    assignment_url: z.string().optional(),
    assignment_questions: z.array(z.object({
      questions: z.object({
        id: z.number(),
        questionContent: z.object({
          questionText: z.string(),
        }).passthrough(),
      }),
    })),
  })),
});

export interface PodsieAssignmentInfo {
  assignmentId: number;
  assignmentName: string;
  groupName: string;
  moduleName?: string;
  totalQuestions: number;
  questionIds: number[];
}

/**
 * Fetch all assigned assignments for a student from Podsie
 * Returns assignment info including question counts and IDs
 */
export async function fetchAssignedAssignments(
  studentEmail: string
): Promise<{ success: boolean; assignments: PodsieAssignmentInfo[]; error?: string }> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    return { success: false, assignments: [], error: "PODSIE_API_TOKEN not configured" };
  }

  try {
    const response = await fetch(
      "https://www.podsie.org/api/assigned-assignments",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: studentEmail }),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        assignments: [],
        error: `Podsie API error: ${response.status} ${response.statusText}`,
      };
    }

    const rawData = await response.json();
    const parseResult = PodsieAssignedAssignmentsSchema.safeParse(rawData);

    if (!parseResult.success) {
      console.error("Podsie assigned-assignments validation failed:", parseResult.error.issues);
      return {
        success: false,
        assignments: [],
        error: `Invalid response format: ${parseResult.error.message}`,
      };
    }

    const data = parseResult.data;
    if (!data.success) {
      return { success: false, assignments: [], error: "Podsie returned unsuccessful response" };
    }

    // Transform to our format
    const assignments: PodsieAssignmentInfo[] = data.data.map(a => ({
      assignmentId: a.assignment_id,
      assignmentName: a.assignment_name,
      groupName: a.group_name,
      moduleName: a.module_name,
      totalQuestions: a.assignment_questions.length,
      questionIds: a.assignment_questions.map(q => q.questions.id),
    }));

    return { success: true, assignments };
  } catch (error) {
    console.error("Error fetching assigned assignments:", error);
    return {
      success: false,
      assignments: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get a sample student email from a section for fetching assignments
 */
export async function getSampleStudentEmailForSection(
  section: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const student = await withDbConnection(async () => {
      return StudentModel.findOne({
        section,
        active: true,
        email: { $exists: true, $ne: "" },
      })
        .select("email")
        .lean<{ email: string }>();
    });

    if (!student || !student.email) {
      return { success: false, error: "No student with email found in section" };
    }

    return { success: true, email: student.email };
  } catch (error) {
    console.error("Error getting sample student email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetch assignments available for a section (uses first student with email)
 */
export async function fetchAssignmentsForSection(
  section: string
): Promise<{ success: boolean; assignments: PodsieAssignmentInfo[]; error?: string }> {
  // Get a sample student email
  const emailResult = await getSampleStudentEmailForSection(section);
  if (!emailResult.success || !emailResult.email) {
    return { success: false, assignments: [], error: emailResult.error };
  }

  // Fetch assignments for that student
  return fetchAssignedAssignments(emailResult.email);
}

// =====================================
// PROCESS RESPONSES INTO PROGRESS
// =====================================

/**
 * Process Podsie responses into question completion status
 * A question is "completed" if ANY attempt was correct AND accepted
 *
 * @param responses - Array of Podsie responses
 * @param questionMapping - Optional mapping of logical positions to question_ids (including variations)
 *                          Format: [[id1, id2], [id3], ...] where index = logical question (0-indexed)
 * @param totalQuestions - Optional limit on number of questions
 * @param baseQuestionIds - Optional array of base question IDs from assignment (in order)
 * @returns Map of logical question numbers (1-indexed) to completion status
 */
function processResponsesToQuestions(
  responses: PodsieResponse[],
  questionMapping?: number[][],
  totalQuestions?: number,
  baseQuestionIds?: number[]
): {
  questions: Map<number, { completed: boolean; completedAt?: string }>;
  assignmentName: string;
} {
  let assignmentName = "";

  // Extract assignment name from first response
  for (const response of responses) {
    if (response.assignment_name) {
      assignmentName = response.assignment_name;
      break;
    }
  }

  // If we have a question mapping, use it to group variations
  if (questionMapping && questionMapping.length > 0) {
    return processWithMapping(responses, questionMapping, assignmentName);
  }

  // Fallback: Use baseQuestionIds or totalQuestions
  return processWithoutMapping(responses, assignmentName, totalQuestions, baseQuestionIds);
}

/**
 * Process responses using the question mapping to properly handle variations
 */
function processWithMapping(
  responses: PodsieResponse[],
  questionMapping: number[][],
  assignmentName: string
): {
  questions: Map<number, { completed: boolean; completedAt?: string }>;
  assignmentName: string;
} {
  // Create a reverse lookup: question_id -> logical question number (1-indexed)
  const idToLogicalQuestion = new Map<number, number>();
  questionMapping.forEach((ids, index) => {
    const logicalQuestionNum = index + 1; // 1-indexed
    for (const id of ids) {
      idToLogicalQuestion.set(id, logicalQuestionNum);
    }
  });

  // Track completion by logical question number
  const questionMap = new Map<number, { completed: boolean; completedAt?: string }>();

  // Initialize all mapped questions as not completed
  for (let i = 1; i <= questionMapping.length; i++) {
    questionMap.set(i, { completed: false });
  }

  // Process responses
  for (const response of responses) {
    const questionId = response.question_id;
    const logicalQuestion = idToLogicalQuestion.get(questionId);

    // Skip if this question_id isn't in our mapping
    if (!logicalQuestion) {
      continue;
    }

    const existing = questionMap.get(logicalQuestion);

    // If already marked as completed, keep it
    if (existing?.completed) {
      continue;
    }

    // Check both is_correct and aiEvaluation.isAccepted
    const isAccepted = response.response_payload?.aiEvaluation?.isAccepted ?? true;

    // If this response is correct AND accepted, mark as completed
    if (response.is_correct && isAccepted) {
      questionMap.set(logicalQuestion, {
        completed: true,
        completedAt: response.createdAt,
      });
    }
  }

  return { questions: questionMap, assignmentName };
}

/**
 * Fallback: Process responses without explicit mapping
 * Uses baseQuestionIds (from assignment) to determine which responses count
 * Only responses matching a base question ID are counted
 */
function processWithoutMapping(
  responses: PodsieResponse[],
  assignmentName: string,
  totalQuestions?: number,
  baseQuestionIds?: number[]
): {
  questions: Map<number, { completed: boolean; completedAt?: string }>;
  assignmentName: string;
} {
  // If we have base question IDs from the assignment, use them as the authoritative list
  if (baseQuestionIds && baseQuestionIds.length > 0) {
    // Track completion by logical question number (1-indexed)
    const questionMap = new Map<number, { completed: boolean; completedAt?: string }>();

    // Initialize all base questions as not completed
    baseQuestionIds.forEach((_, index) => {
      questionMap.set(index + 1, { completed: false });
    });

    // Create reverse lookup: base question_id -> logical position
    const idToPosition = new Map<number, number>();
    baseQuestionIds.forEach((id, index) => {
      idToPosition.set(id, index + 1);
    });

    // Process responses - only count those matching base question IDs
    for (const response of responses) {
      const questionId = response.question_id;
      const position = idToPosition.get(questionId);

      // Skip if not a base question
      if (!position) {
        continue;
      }

      const existing = questionMap.get(position);

      // If already marked as completed, keep it
      if (existing?.completed) {
        continue;
      }

      // Check both is_correct and aiEvaluation.isAccepted
      const isAccepted = response.response_payload?.aiEvaluation?.isAccepted ?? true;

      // If this response is correct AND accepted, mark as completed
      if (response.is_correct && isAccepted) {
        questionMap.set(position, {
          completed: true,
          completedAt: response.createdAt,
        });
      }
    }

    return { questions: questionMap, assignmentName };
  }

  // Legacy fallback: collect all unique question_ids from responses
  const rawQuestionMap = new Map<number, { completed: boolean; completedAt?: string }>();

  for (const response of responses) {
    const questionId = response.question_id;
    const existing = rawQuestionMap.get(questionId);

    // If already marked as completed, keep it
    if (existing?.completed) {
      continue;
    }

    // Check both is_correct and aiEvaluation.isAccepted
    const isAccepted = response.response_payload?.aiEvaluation?.isAccepted ?? true;

    // If this response is correct AND accepted, mark as completed
    if (response.is_correct && isAccepted) {
      rawQuestionMap.set(questionId, {
        completed: true,
        completedAt: response.createdAt,
      });
    } else if (!existing) {
      // First attempt, not correct yet
      rawQuestionMap.set(questionId, {
        completed: false,
      });
    }
  }

  // If we have a totalQuestions limit but no base IDs, limit by count
  if (totalQuestions && totalQuestions > 0) {
    const allIds = Array.from(rawQuestionMap.keys());
    const limitedIds = allIds.slice(0, totalQuestions);

    // Create new map with only the limited IDs, mapped to logical positions
    const questionMap = new Map<number, { completed: boolean; completedAt?: string }>();
    limitedIds.forEach((questionId, index) => {
      const status = rawQuestionMap.get(questionId);
      questionMap.set(index + 1, {
        completed: status?.completed ?? false,
        completedAt: status?.completedAt,
      });
    });

    return { questions: questionMap, assignmentName };
  }

  return { questions: rawQuestionMap, assignmentName };
}

// =====================================
// SYNC SINGLE STUDENT
// =====================================

export interface SyncResult {
  studentId: string;
  studentName: string;
  success: boolean;
  completedCount?: number;
  totalQuestions?: number;
  error?: string;
}

/**
 * Sync a single student's ramp-up progress from Podsie
 * Saves directly to student document's rampUpProgress array
 *
 * @param questionMapping - Optional mapping of logical positions to question_ids
 *                          Format: [[id1, id2], [id3], ...] where index = logical question (0-indexed)
 * @param baseQuestionIds - Optional array of base question IDs from assignment (in order)
 */
export async function syncStudentRampUpProgress(
  studentId: string,
  studentEmail: string,
  studentName: string,
  podsieAssignmentId: string,
  unitCode: string,
  rampUpId: string,
  totalQuestions: number,
  questionMapping?: number[][],
  baseQuestionIds?: number[]
): Promise<SyncResult> {
  try {
    // Fetch from Podsie
    const responses = await fetchPodsieResponses(podsieAssignmentId, studentEmail);

    // Process responses - use mapping if provided, or baseQuestionIds, or totalQuestions
    const { questions: questionMap, assignmentName } = processResponsesToQuestions(
      responses,
      questionMapping,
      totalQuestions,
      baseQuestionIds
    );

    // Convert map to array format
    const questions: RampUpQuestion[] = [];

    if (questionMapping && questionMapping.length > 0) {
      // With mapping: use logical question numbers directly
      for (let i = 1; i <= questionMapping.length; i++) {
        const status = questionMap.get(i);
        questions.push({
          questionNumber: i,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
        });
      }
    } else if (totalQuestions > 0) {
      // With totalQuestions: the map already has logical positions (1-indexed)
      for (let i = 1; i <= totalQuestions; i++) {
        const status = questionMap.get(i);
        questions.push({
          questionNumber: i,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
        });
      }
    } else {
      // Legacy fallback: use sorted question_ids as sequential numbers
      const questionIds = Array.from(questionMap.keys()).sort((a, b) => a - b);
      questionIds.forEach((questionId, index) => {
        const status = questionMap.get(questionId);
        questions.push({
          questionNumber: index + 1,
          completed: status?.completed ?? false,
          completedAt: status?.completedAt,
        });
      });

      // Pad with remaining questions if we know the total
      while (questions.length < totalQuestions) {
        questions.push({
          questionNumber: questions.length + 1,
          completed: false,
        });
      }
    }

    // Calculate summary
    const summary = calculateRampUpSummary(questions);

    // Update student document's rampUpProgress array
    await withDbConnection(async () => {
      // First, try to update existing entry in array
      // Use $elemMatch to ensure all three conditions match on the SAME array element
      // This prevents creating duplicates when multiple entries exist with same unitCode/rampUpId
      const updateResult = await StudentModel.updateOne(
        {
          _id: studentId,
          rampUpProgress: {
            $elemMatch: {
              unitCode: unitCode,
              rampUpId: rampUpId,
              podsieAssignmentId: podsieAssignmentId
            }
          }
        },
        {
          $set: {
            "rampUpProgress.$.rampUpName": assignmentName || `Unit ${unitCode} Ramp-Up`,
            "rampUpProgress.$.podsieAssignmentId": podsieAssignmentId,
            "rampUpProgress.$.questions": questions,
            "rampUpProgress.$.totalQuestions": Math.max(totalQuestions, questions.length),
            "rampUpProgress.$.completedCount": summary.completedCount,
            "rampUpProgress.$.percentComplete": summary.percentComplete,
            "rampUpProgress.$.isFullyComplete": summary.isFullyComplete,
            "rampUpProgress.$.lastSyncedAt": new Date().toISOString(),
          }
        }
      );

      // If no existing entry, push a new one
      if (updateResult.matchedCount === 0) {
        await StudentModel.updateOne(
          { _id: studentId },
          {
            $push: {
              rampUpProgress: {
                unitCode,
                rampUpId,
                rampUpName: assignmentName || `Unit ${unitCode} Ramp-Up`,
                podsieAssignmentId,
                questions,
                totalQuestions: Math.max(totalQuestions, questions.length),
                completedCount: summary.completedCount,
                percentComplete: summary.percentComplete,
                isFullyComplete: summary.isFullyComplete,
                lastSyncedAt: new Date().toISOString(),
              }
            }
          }
        );
      }
    });

    return {
      studentId,
      studentName,
      success: true,
      completedCount: summary.completedCount,
      totalQuestions: questions.length,
    };
  } catch (error) {
    console.error(`Error syncing student ${studentName}:`, error);
    return {
      studentId,
      studentName,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =====================================
// SYNC ALL STUDENTS IN SECTION
// =====================================

export interface SyncSectionResult {
  success: boolean;
  totalStudents: number;
  successfulSyncs: number;
  failedSyncs: number;
  results: SyncResult[];
  error?: string;
}

export interface SyncOptions {
  testMode?: boolean;  // If true, only sync first student with email
  testStudentId?: string;  // Specific student ID to test with
  questionMapping?: number[][];  // Mapping of logical positions to question_ids
  baseQuestionIds?: number[];  // Base question IDs from assignment (in order)
}

/**
 * Sync ramp-up progress for all students in a section (or single student in test mode)
 */
export async function syncSectionRampUpProgress(
  section: string,
  podsieAssignmentId: string,
  unitCode: string,
  rampUpId: string,
  totalQuestions: number,
  options: SyncOptions = {}
): Promise<SyncSectionResult> {
  try {
    // Fetch all active students in section
    const allStudents = await withDbConnection(async () => {
      const query: Record<string, unknown> = {
        section,
        active: true,
      };

      // If specific test student requested
      if (options.testStudentId) {
        query._id = options.testStudentId;
      }

      const docs = await StudentModel.find(query)
        .lean<Array<{ _id: unknown; firstName: string; lastName: string; email?: string }>>();

      return docs.map((doc) => ({
        _id: String(doc._id),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
      }));
    });

    // In test mode, only use first student with email
    const students = options.testMode && !options.testStudentId
      ? allStudents.filter(s => s.email).slice(0, 1)
      : allStudents;

    if (students.length === 0) {
      return {
        success: false,
        totalStudents: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        results: [],
        error: options.testMode
          ? "No students with email found in section for test mode"
          : "No students found in section",
      };
    }

    // Sync each student
    const results: SyncResult[] = [];

    for (const student of students) {
      if (!student.email) {
        results.push({
          studentId: student._id,
          studentName: `${student.lastName}, ${student.firstName}`,
          success: false,
          error: "No email address",
        });
        continue;
      }

      const result = await syncStudentRampUpProgress(
        student._id,
        student.email,
        `${student.lastName}, ${student.firstName}`,
        podsieAssignmentId,
        unitCode,
        rampUpId,
        totalQuestions,
        options.questionMapping,
        options.baseQuestionIds
      );

      results.push(result);

      // Small delay to avoid rate limiting (skip in test mode for speed)
      if (!options.testMode) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const successfulSyncs = results.filter((r) => r.success).length;
    const failedSyncs = results.filter((r) => !r.success).length;

    return {
      success: successfulSyncs > 0,
      totalStudents: students.length,
      successfulSyncs,
      failedSyncs,
      results,
    };
  } catch (error) {
    console.error("Error syncing section:", error);
    return {
      success: false,
      totalStudents: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      results: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =====================================
// FETCH PROGRESS FROM STUDENT DOCUMENTS
// =====================================

export interface StudentRampUpProgressData {
  studentId: string;
  studentName: string;
  unitCode: string;
  rampUpId: string;
  rampUpName?: string;
  podsieAssignmentId?: string;
  questions: RampUpQuestion[];
  totalQuestions: number;
  completedCount: number;
  percentComplete: number;
  isFullyComplete: boolean;
  lastSyncedAt?: string;
}

/**
 * Fetch ramp-up progress for all students in a section from student documents
 */
export async function fetchRampUpProgress(
  section: string,
  unitCode: string,
  rampUpId?: string,
  podsieAssignmentId?: string
): Promise<{
  success: boolean;
  data: StudentRampUpProgressData[];
  error?: string;
}> {
  try {
    interface StudentDoc {
      _id: unknown;
      firstName: string;
      lastName: string;
      rampUpProgress: Array<{
        unitCode: string;
        rampUpId: string;
        rampUpName?: string;
        podsieAssignmentId?: string;
        questions: RampUpQuestion[];
        totalQuestions: number;
        completedCount: number;
        percentComplete: number;
        isFullyComplete: boolean;
        lastSyncedAt?: string;
      }>;
    }

    const students = await withDbConnection(async () => {
      const docs = await StudentModel.find({
        section,
        active: true,
      })
        .select("_id firstName lastName rampUpProgress")
        .lean<StudentDoc[]>();

      return docs;
    });

    // Build result array
    const result: StudentRampUpProgressData[] = [];

    for (const student of students) {
      const studentId = String(student._id);
      const studentName = `${student.lastName}, ${student.firstName}`;

      // Find matching progress entry(ies)
      const progressEntries = (student.rampUpProgress || []).filter(p => {
        if (p.unitCode !== unitCode) return false;
        if (rampUpId && p.rampUpId !== rampUpId) return false;
        if (podsieAssignmentId && p.podsieAssignmentId !== podsieAssignmentId) return false;
        return true;
      });

      if (progressEntries.length > 0) {
        // Add each matching entry
        for (const p of progressEntries) {
          result.push({
            studentId,
            studentName,
            unitCode: p.unitCode,
            rampUpId: p.rampUpId,
            rampUpName: p.rampUpName,
            podsieAssignmentId: p.podsieAssignmentId,
            questions: p.questions || [],
            totalQuestions: p.totalQuestions || 0,
            completedCount: p.completedCount || 0,
            percentComplete: p.percentComplete || 0,
            isFullyComplete: p.isFullyComplete || false,
            lastSyncedAt: p.lastSyncedAt,
          });
        }
      } else {
        // No progress yet - return empty entry
        result.push({
          studentId,
          studentName,
          unitCode,
          rampUpId: rampUpId || "",
          questions: [],
          totalQuestions: 0,
          completedCount: 0,
          percentComplete: 0,
          isFullyComplete: false,
        });
      }
    }

    // Sort by student name
    result.sort((a, b) => a.studentName.localeCompare(b.studentName));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error fetching ramp-up progress:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
