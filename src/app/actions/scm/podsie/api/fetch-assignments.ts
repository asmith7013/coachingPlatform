"use server";

import { z } from "zod";
import { withDbConnection } from "@server/db/ensure-connection";
import { StudentModel } from "@mongoose-schema/scm/student/student.model";
import type { PodsieAssignmentInfo } from "../types";

// =====================================
// SCHEMA
// =====================================

/**
 * Schema for Podsie assigned-assignments endpoint response
 */
const PodsieAssignedAssignmentsSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      group_name: z.string(),
      assignment_name: z.string(),
      assignment_id: z.number(),
      module_name: z.string().nullish(),
      assignment_url: z.string().optional(),
      assignment_questions: z.array(
        z.object({
          questions: z.object({
            id: z.number(),
            questionContent: z
              .object({
                type: z.string(),
                questionText: z.string(),
              })
              .passthrough(),
          }),
        }),
      ),
    }),
  ),
});

// =====================================
// FUNCTIONS
// =====================================

/**
 * Fetch all assigned assignments for a student from Podsie
 * Returns assignment info including question counts and IDs
 */
export async function fetchAssignedAssignments(
  studentEmail: string,
  includeLessons?: boolean,
): Promise<{
  success: boolean;
  assignments: PodsieAssignmentInfo[];
  error?: string;
}> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    return {
      success: false,
      assignments: [],
      error: "PODSIE_API_TOKEN not configured",
    };
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
        body: JSON.stringify({
          email: studentEmail,
          ...(includeLessons !== undefined && { includeLessons }),
        }),
      },
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
      console.error(
        "Podsie assigned-assignments validation failed:",
        parseResult.error.issues,
      );
      return {
        success: false,
        assignments: [],
        error: `Invalid response format: ${parseResult.error.message}`,
      };
    }

    const data = parseResult.data;
    if (!data.success) {
      return {
        success: false,
        assignments: [],
        error: "Podsie returned unsuccessful response",
      };
    }

    // Transform to our format
    const assignments: PodsieAssignmentInfo[] = data.data.map((a) => ({
      assignmentId: a.assignment_id,
      assignmentName: a.assignment_name,
      groupName: a.group_name,
      moduleName: a.module_name,
      totalQuestions: a.assignment_questions.length,
      questionIds: a.assignment_questions.map((q) => q.questions.id),
      questions: a.assignment_questions.map((q) => q.questions), // Include full question data for variant analysis
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
  section: string,
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
      return {
        success: false,
        error: "No student with email found in section",
      };
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
  section: string,
  includeLessons?: boolean,
): Promise<{
  success: boolean;
  assignments: PodsieAssignmentInfo[];
  error?: string;
}> {
  // Get a sample student email
  const emailResult = await getSampleStudentEmailForSection(section);
  if (!emailResult.success || !emailResult.email) {
    return { success: false, assignments: [], error: emailResult.error };
  }

  // Fetch assignments for that student
  return fetchAssignedAssignments(emailResult.email, includeLessons);
}
