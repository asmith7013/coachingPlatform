"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@/lib/schema/mongoose-schema/313/student.model";
import { RampUpQuestion } from "@zod-schema/313/student";
import { calculateRampUpSummary } from "@zod-schema/313/ramp-up-progress";
import {
  PodsieApiResponseSchema,
  PodsieResponse,
} from "@zod-schema/313/podsie-response";

// =====================================
// FETCH FROM PODSIE API
// =====================================

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
// PROCESS RESPONSES INTO PROGRESS
// =====================================

/**
 * Process Podsie responses into question completion status
 * A question is "completed" if ANY attempt was correct
 */
function processResponsesToQuestions(responses: PodsieResponse[]): {
  questions: Map<number, { completed: boolean; completedAt?: string }>;
  assignmentName: string;
} {
  const questionMap = new Map<number, { completed: boolean; completedAt?: string }>();
  let assignmentName = "";

  for (const response of responses) {
    if (!assignmentName && response.assignment_name) {
      assignmentName = response.assignment_name;
    }

    const questionId = response.question_id;
    const existing = questionMap.get(questionId);

    // If already marked as completed, keep it
    if (existing?.completed) {
      continue;
    }

    // If this response is correct, mark as completed
    if (response.is_correct) {
      questionMap.set(questionId, {
        completed: true,
        completedAt: response.createdAt,
      });
    } else if (!existing) {
      // First attempt, not correct yet
      questionMap.set(questionId, {
        completed: false,
      });
    }
  }

  return { questions: questionMap, assignmentName };
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
 */
export async function syncStudentRampUpProgress(
  studentId: string,
  studentEmail: string,
  studentName: string,
  podsyAssignmentId: string,
  unitCode: string,
  rampUpId: string,
  totalQuestions: number
): Promise<SyncResult> {
  try {
    // Fetch from Podsie
    const responses = await fetchPodsieResponses(podsyAssignmentId, studentEmail);

    // Process responses
    const { questions: questionMap, assignmentName } = processResponsesToQuestions(responses);

    // Convert to array format, ensuring all questions are represented
    const questions: RampUpQuestion[] = [];
    const questionIds = Array.from(questionMap.keys()).sort((a, b) => a - b);

    // Map question_ids to sequential question numbers
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

    // Calculate summary
    const summary = calculateRampUpSummary(questions);

    // Update student document's rampUpProgress array
    await withDbConnection(async () => {
      // First, try to update existing entry in array
      const updateResult = await StudentModel.updateOne(
        {
          _id: studentId,
          "rampUpProgress.unitCode": unitCode,
          "rampUpProgress.rampUpId": rampUpId
        },
        {
          $set: {
            "rampUpProgress.$.rampUpName": assignmentName || `Unit ${unitCode} Ramp-Up`,
            "rampUpProgress.$.podsyAssignmentId": podsyAssignmentId,
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
                podsyAssignmentId,
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
}

/**
 * Sync ramp-up progress for all students in a section (or single student in test mode)
 */
export async function syncSectionRampUpProgress(
  section: string,
  podsyAssignmentId: string,
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
        podsyAssignmentId,
        unitCode,
        rampUpId,
        totalQuestions
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
  rampUpId?: string
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
