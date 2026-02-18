import { z } from "zod";

export const ActionPlanStatusEnum = z.enum(["open", "closed", "archived"]);
export type ActionPlanStatus = z.infer<typeof ActionPlanStatusEnum>;

export const ActionPlanInputSchema = z.object({
  teacherStaffId: z.string(),
  title: z.string().min(1, "Title is required"),
  skillIds: z.array(z.string()).default([]),
});
export type ActionPlanInput = z.infer<typeof ActionPlanInputSchema>;

export const ActionPlanDocumentSchema = z.object({
  _id: z.string(),
  teacherStaffId: z.string(),
  createdBy: z.string(),
  title: z.string(),
  skillIds: z.array(z.string()),
  status: ActionPlanStatusEnum,
  closedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ActionPlanDocument = z.infer<typeof ActionPlanDocumentSchema>;
