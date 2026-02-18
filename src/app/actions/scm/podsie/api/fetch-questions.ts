"use server";

import { z } from "zod";

// =====================================
// SCHEMA
// =====================================

/**
 * Schema for Podsie assignment questions endpoint response
 * The API returns { questions: [...] } with question details
 */
const PodsieAssignmentQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.number(),
      assignmentId: z.number(),
      order: z.number(),
      questionId: z.number(),
      question: z
        .object({
          id: z.number(),
          questionContent: z
            .object({
              questionText: z.string(),
            })
            .passthrough(),
        })
        .passthrough(),
    }),
  ),
});

// =====================================
// FUNCTION
// =====================================

/**
 * Fetch assignment question IDs from Podsie
 * These are the "base" question IDs that can be used for mapping
 */
export async function fetchPodsieAssignmentQuestions(
  assignmentId: string,
): Promise<{ success: boolean; questionIds: number[]; error?: string }> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    return {
      success: false,
      questionIds: [],
      error: "PODSIE_API_TOKEN not configured",
    };
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
      },
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
      console.error(
        "Podsie questions response validation failed:",
        parseResult.error.issues,
      );
      return {
        success: false,
        questionIds: [],
        error: `Invalid response format: ${parseResult.error.message}`,
      };
    }

    // Extract question IDs in order (sorted by order field)
    const data = parseResult.data;
    if (data.questions.length === 0) {
      return {
        success: false,
        questionIds: [],
        error: "No questions found for this assignment",
      };
    }

    // Sort by order and extract the questionId (not the join table id)
    const sortedQuestions = [...data.questions].sort(
      (a, b) => a.order - b.order,
    );
    const questionIds = sortedQuestions.map((q) => q.questionId);

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
