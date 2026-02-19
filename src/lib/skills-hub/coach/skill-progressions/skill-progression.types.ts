import { z } from "zod";

export const SkillProgressionStatusEnum = z.enum([
  "open",
  "closed",
  "archived",
]);
export type SkillProgressionStatus = z.infer<typeof SkillProgressionStatusEnum>;

export const SkillProgressionInputSchema = z.object({
  teacherStaffId: z.string(),
  title: z.string().min(1, "Title is required"),
  skillIds: z.array(z.string()).default([]),
  why: z.string().optional(),
});
export type SkillProgressionInput = z.infer<typeof SkillProgressionInputSchema>;

export const SkillProgressionDocumentSchema = z.object({
  _id: z.string(),
  teacherStaffId: z.string(),
  createdBy: z.string(),
  title: z.string(),
  skillIds: z.array(z.string()),
  why: z.string().optional(),
  status: SkillProgressionStatusEnum,
  closedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SkillProgressionDocument = z.infer<
  typeof SkillProgressionDocumentSchema
>;
