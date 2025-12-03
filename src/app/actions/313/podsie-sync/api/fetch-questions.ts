"use server";

import { z } from "zod";

// =====================================
// SCHEMA
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

// =====================================
// FUNCTION
// =====================================

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
