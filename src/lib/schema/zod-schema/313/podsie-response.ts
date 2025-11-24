import { z } from "zod";

// =====================================
// PODSIE API RESPONSE SCHEMAS
// =====================================

/**
 * AI evaluation included in some response payloads
 */
export const PodsieAiEvaluationSchema = z.object({
  score: z.number(),
  reasoning: z.string(),
  isAccepted: z.boolean(),
});

/**
 * Response payload containing the student's answer
 */
export const PodsieResponsePayloadSchema = z.object({
  type: z.string(),
  answerJson: z.unknown(),
  aiEvaluation: PodsieAiEvaluationSchema.optional(),
});

/**
 * Individual response from the Podsie API
 * Represents a single student attempt on a question
 */
export const PodsieResponseSchema = z.object({
  assignmentQuestionResponseId: z.number(),
  responseId: z.number(),
  assignedAssignmentId: z.number(),
  assignment_name: z.string(),
  assignment_id: z.number(),
  group_name: z.string(),
  group_id: z.number(),
  is_correct: z.boolean(),
  createdAt: z.string(),
  response_payload: PodsieResponsePayloadSchema,
  question_id: z.number(),
});

/**
 * Full API response from Podsie assignments endpoint
 * POST https://www.podsie.org/api/assignments/{id}/responses
 * Body: { email: "student@email.com" }
 */
export const PodsieApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    responses: z.array(PodsieResponseSchema),
  }),
});

// =====================================
// TYPE EXPORTS
// =====================================

export type PodsieAiEvaluation = z.infer<typeof PodsieAiEvaluationSchema>;
export type PodsieResponsePayload = z.infer<typeof PodsieResponsePayloadSchema>;
export type PodsieResponse = z.infer<typeof PodsieResponseSchema>;
export type PodsieApiResponse = z.infer<typeof PodsieApiResponseSchema>;
