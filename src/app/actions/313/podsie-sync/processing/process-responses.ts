// =====================================
// RESPONSE PROCESSING
// =====================================
// NOTE: These are pure utility functions, not Server Actions
// They do NOT have "use server" directive

import type { PodsieResponse } from "@zod-schema/313/podsie-response";
import type { ProcessedQuestionData } from "../types";

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
export function processResponsesToQuestions(
  responses: PodsieResponse[],
  questionMapping?: number[][],
  totalQuestions?: number,
  baseQuestionIds?: number[]
): {
  questions: Map<number, ProcessedQuestionData>;
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
  questions: Map<number, ProcessedQuestionData>;
  assignmentName: string;
} {
  // Sort responses by timestamp (earliest first) to ensure we capture the earliest completion time
  const sortedResponses = [...responses].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Create a reverse lookup: question_id -> logical question number (1-indexed)
  const idToLogicalQuestion = new Map<number, number>();
  questionMapping.forEach((ids, index) => {
    const logicalQuestionNum = index + 1; // 1-indexed
    for (const id of ids) {
      idToLogicalQuestion.set(id, logicalQuestionNum);
    }
  });

  // Track completion by logical question number
  const questionMap = new Map<number, ProcessedQuestionData>();

  // Initialize all mapped questions as not completed
  for (let i = 1; i <= questionMapping.length; i++) {
    questionMap.set(i, { completed: false });
  }

  // Process responses in chronological order
  for (const response of sortedResponses) {
    const questionId = response.question_id;
    const logicalQuestion = idToLogicalQuestion.get(questionId);

    // Skip if this question_id isn't in our mapping
    if (!logicalQuestion) {
      continue;
    }

    const existing = questionMap.get(logicalQuestion);

    // If already marked as completed, keep the earlier timestamp (already sorted)
    if (existing?.completed) {
      continue;
    }

    // Check both is_correct and aiEvaluation.isAccepted
    const isAccepted = response.response_payload?.aiEvaluation?.isAccepted ?? true;

    // Extract AI analysis scores if available
    const aiAnalysis = response.response_payload?.aiAnalysis;
    const correctScore = aiAnalysis?.answersCorrect !== undefined ? (aiAnalysis.answersCorrect ? 1 : 0) : undefined;
    const explanationScore = aiAnalysis?.explanationGrading
      ? (aiAnalysis.explanationGrading === 'full' ? 3 : aiAnalysis.explanationGrading === 'partial' ? 2 : 1)
      : undefined;

    // If this response is correct AND accepted, mark as completed
    if (response.is_correct && isAccepted) {
      questionMap.set(logicalQuestion, {
        completed: true,
        completedAt: response.createdAt,
        correctScore,
        explanationScore,
      });
    } else if (!existing?.completed) {
      // Not correct yet - but still update AI scores if they exist
      questionMap.set(logicalQuestion, {
        completed: false,
        correctScore: correctScore ?? existing?.correctScore,
        explanationScore: explanationScore ?? existing?.explanationScore,
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
  questions: Map<number, ProcessedQuestionData>;
  assignmentName: string;
} {
  // Sort responses by timestamp (earliest first) to ensure we capture the earliest completion time
  const sortedResponses = [...responses].sort((a, b) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // If we have base question IDs from the assignment, use them as the authoritative list
  if (baseQuestionIds && baseQuestionIds.length > 0) {
    // Track completion by logical question number (1-indexed)
    const questionMap = new Map<number, ProcessedQuestionData>();

    // Initialize all base questions as not completed
    baseQuestionIds.forEach((_, index) => {
      questionMap.set(index + 1, { completed: false });
    });

    // Create reverse lookup: base question_id -> logical position
    const idToPosition = new Map<number, number>();
    baseQuestionIds.forEach((id, index) => {
      idToPosition.set(id, index + 1);
    });

    // Process responses in chronological order - only count those matching base question IDs
    for (const response of sortedResponses) {
      const questionId = response.question_id;
      const position = idToPosition.get(questionId);

      // Skip if not a base question
      if (!position) {
        continue;
      }

      const existing = questionMap.get(position);

      // If already marked as completed, keep the earlier timestamp (already sorted)
      if (existing?.completed) {
        continue;
      }

      // Check both is_correct and aiEvaluation.isAccepted
      const isAccepted = response.response_payload?.aiEvaluation?.isAccepted ?? true;

      // Extract AI analysis scores if available
      const aiAnalysis = response.response_payload?.aiAnalysis;
      const correctScore = aiAnalysis?.answersCorrect !== undefined ? (aiAnalysis.answersCorrect ? 1 : 0) : undefined;
      const explanationScore = aiAnalysis?.explanationGrading
        ? (aiAnalysis.explanationGrading === 'full' ? 3 : aiAnalysis.explanationGrading === 'partial' ? 2 : 1)
        : undefined;

      // If this response is correct AND accepted, mark as completed
      if (response.is_correct && isAccepted) {
        questionMap.set(position, {
          completed: true,
          completedAt: response.createdAt,
          correctScore,
          explanationScore,
        });
      } else if (!existing?.completed) {
        // Not correct yet - but still update AI scores if they exist
        questionMap.set(position, {
          completed: false,
          correctScore: correctScore ?? existing?.correctScore,
          explanationScore: explanationScore ?? existing?.explanationScore,
        });
      }
    }

    return { questions: questionMap, assignmentName };
  }

  // Legacy fallback: collect all unique question_ids from responses
  const rawQuestionMap = new Map<number, ProcessedQuestionData>();

  // Process responses in chronological order
  for (const response of sortedResponses) {
    const questionId = response.question_id;
    const existing = rawQuestionMap.get(questionId);

    // If already marked as completed, keep the earlier timestamp (already sorted)
    if (existing?.completed) {
      continue;
    }

    // Check both is_correct and aiEvaluation.isAccepted
    const isAccepted = response.response_payload?.aiEvaluation?.isAccepted ?? true;

    // Extract AI analysis scores if available
    const aiAnalysis = response.response_payload?.aiAnalysis;
    const correctScore = aiAnalysis?.answersCorrect !== undefined ? (aiAnalysis.answersCorrect ? 1 : 0) : undefined;
    const explanationScore = aiAnalysis?.explanationGrading
      ? (aiAnalysis.explanationGrading === 'full' ? 3 : aiAnalysis.explanationGrading === 'partial' ? 2 : 1)
      : undefined;

    // If this response is correct AND accepted, mark as completed
    if (response.is_correct && isAccepted) {
      rawQuestionMap.set(questionId, {
        completed: true,
        completedAt: response.createdAt,
        correctScore,
        explanationScore,
      });
    } else if (!existing) {
      // First attempt, not correct yet - but still save AI scores
      rawQuestionMap.set(questionId, {
        completed: false,
        correctScore,
        explanationScore,
      });
    }
  }

  // If we have a totalQuestions limit but no base IDs, limit by count
  if (totalQuestions && totalQuestions > 0) {
    const allIds = Array.from(rawQuestionMap.keys());
    const limitedIds = allIds.slice(0, totalQuestions);

    // Create new map with only the limited IDs, mapped to logical positions
    const questionMap = new Map<number, ProcessedQuestionData>();
    limitedIds.forEach((questionId, index) => {
      const status = rawQuestionMap.get(questionId);
      questionMap.set(index + 1, {
        completed: status?.completed ?? false,
        completedAt: status?.completedAt,
        correctScore: status?.correctScore,
        explanationScore: status?.explanationScore,
      });
    });

    return { questions: questionMap, assignmentName };
  }

  return { questions: rawQuestionMap, assignmentName };
}
