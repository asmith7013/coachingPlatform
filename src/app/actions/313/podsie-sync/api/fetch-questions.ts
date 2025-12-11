"use server";

import { z } from "zod";

// =====================================
// SCHEMA
// =====================================

/**
 * Schema for knowledge component data
 * Used to identify root questions vs variants
 */
const KnowledgeComponentSchema = z.object({
  id: z.number(),
  originalQuestionId: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
});

/**
 * Schema for Podsie assignment questions endpoint response
 * The API returns { questions: [...] } with question details including knowledgeComponent
 */
const PodsieAssignmentQuestionsSchema = z.object({
  questions: z.array(z.object({
    id: z.number(),
    assignmentId: z.number(),
    order: z.number(),
    questionId: z.number(),
    question: z.object({
      id: z.number(),
      questionContent: z.object({
        questionText: z.string(),
      }).passthrough(),
      knowledgeComponent: KnowledgeComponentSchema.nullable().optional(),
    }).passthrough(),
  })),
});

// =====================================
// TYPES
// =====================================

export interface PodsieQuestionMapEntry {
  questionNumber: number;
  questionId: string;
  isRoot: boolean;
  rootQuestionId?: string;
  variantNumber?: number;
}

// =====================================
// FUNCTION
// =====================================

export interface FetchQuestionsResult {
  success: boolean;
  questionIds: number[];
  questionMap: PodsieQuestionMapEntry[];
  hasKnowledgeComponents: boolean;
  error?: string;
}

/**
 * Fetch assignment questions from Podsie and build question map
 * Uses knowledgeComponent data to identify root vs variant questions:
 * - Root question: question.id === question.knowledgeComponent.originalQuestionId
 * - Variant: question.id !== question.knowledgeComponent.originalQuestionId
 * - No KC: treated as root (legacy questions)
 */
export async function fetchPodsieAssignmentQuestions(
  assignmentId: string
): Promise<FetchQuestionsResult> {
  const token = process.env.PODSIE_API_TOKEN;

  if (!token) {
    return {
      success: false,
      questionIds: [],
      questionMap: [],
      hasKnowledgeComponents: false,
      error: "PODSIE_API_TOKEN not configured"
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
      }
    );

    if (!response.ok) {
      return {
        success: false,
        questionIds: [],
        questionMap: [],
        hasKnowledgeComponents: false,
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
        questionMap: [],
        hasKnowledgeComponents: false,
        error: `Invalid response format: ${parseResult.error.message}`,
      };
    }

    const data = parseResult.data;
    if (data.questions.length === 0) {
      return {
        success: false,
        questionIds: [],
        questionMap: [],
        hasKnowledgeComponents: false,
        error: "No questions found for this assignment"
      };
    }

    // Sort by order
    const sortedQuestions = [...data.questions].sort((a, b) => a.order - b.order);
    const questionIds = sortedQuestions.map(q => q.questionId);

    // Check if any questions have knowledge components
    const hasKnowledgeComponents = sortedQuestions.some(
      q => q.question.knowledgeComponent != null
    );

    // Build question map using knowledgeComponent data
    // Group questions by their root (originalQuestionId from KC)
    const questionMap = buildQuestionMap(sortedQuestions);

    return {
      success: true,
      questionIds,
      questionMap,
      hasKnowledgeComponents,
    };
  } catch (error) {
    console.error("Error fetching Podsie assignment questions:", error);
    return {
      success: false,
      questionIds: [],
      questionMap: [],
      hasKnowledgeComponents: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Build question map from API response using knowledgeComponent
 * Groups questions by their root question and tracks variants
 */
function buildQuestionMap(
  sortedQuestions: Array<{
    questionId: number;
    question: {
      id: number;
      knowledgeComponent?: { originalQuestionId: number } | null;
    };
  }>
): PodsieQuestionMapEntry[] {
  const questionMap: PodsieQuestionMapEntry[] = [];

  // Track which root questions we've seen and their question numbers
  const rootQuestionIdToNumber = new Map<number, number>();
  // Track variant counts per root question
  const variantCounts = new Map<number, number>();

  let currentQuestionNumber = 0;

  for (const q of sortedQuestions) {
    const questionId = q.questionId;
    const kc = q.question.knowledgeComponent;

    // Determine if this is a root question
    // Root if: no KC, or question.id === KC.originalQuestionId
    const isRoot = !kc || q.question.id === kc.originalQuestionId;
    const rootId = kc?.originalQuestionId ?? q.question.id;

    if (isRoot) {
      // This is a root question - assign new question number
      currentQuestionNumber++;
      rootQuestionIdToNumber.set(rootId, currentQuestionNumber);
      variantCounts.set(rootId, 0);

      questionMap.push({
        questionNumber: currentQuestionNumber,
        questionId: String(questionId),
        isRoot: true,
      });
    } else {
      // This is a variant - find its root's question number
      let questionNumber = rootQuestionIdToNumber.get(rootId);

      if (questionNumber === undefined) {
        // Root hasn't been seen yet (shouldn't happen if data is ordered correctly)
        // Treat as a new root question
        currentQuestionNumber++;
        questionNumber = currentQuestionNumber;
        rootQuestionIdToNumber.set(rootId, questionNumber);
        variantCounts.set(rootId, 0);
      }

      // Increment variant count for this root
      const variantNumber = (variantCounts.get(rootId) ?? 0) + 1;
      variantCounts.set(rootId, variantNumber);

      questionMap.push({
        questionNumber,
        questionId: String(questionId),
        isRoot: false,
        rootQuestionId: String(rootId),
        variantNumber,
      });
    }
  }

  return questionMap;
}
