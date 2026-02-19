import { z } from "zod";

export const ProgressionStepInputSchema = z.object({
  actionPlanId: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().nullable().optional(),
  evidenceOfCompletion: z.string().nullable().optional(),
  skillIds: z.array(z.string()).min(1, "At least one skill is required"),
});
export type ProgressionStepInput = z.infer<typeof ProgressionStepInputSchema>;

export const ProgressionStepDocumentSchema = z.object({
  _id: z.string(),
  actionPlanId: z.string(),
  description: z.string(),
  dueDate: z.string().nullable(),
  evidenceOfCompletion: z.string().nullable(),
  skillIds: z.array(z.string()),
  completed: z.boolean(),
  completedAt: z.string().nullable(),
  completedBy: z.string().nullable(),
  createdAt: z.string(),
});
export type ProgressionStepDocument = z.infer<
  typeof ProgressionStepDocumentSchema
>;
