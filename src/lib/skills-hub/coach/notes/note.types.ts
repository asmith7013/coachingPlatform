import { z } from "zod";

export const SkillNoteInputSchema = z.object({
  teacherStaffId: z.string(),
  content: z.string().min(1, "Content is required"),
  imageUrls: z.array(z.string()).default([]),
  tags: z
    .object({
      skillIds: z.array(z.string()).default([]),
      actionPlanIds: z.array(z.string()).default([]),
      actionStepIds: z.array(z.string()).default([]),
    })
    .default(() => ({ skillIds: [], actionPlanIds: [], actionStepIds: [] })),
});
export type SkillNoteInput = z.infer<typeof SkillNoteInputSchema>;

export const SkillNoteDocumentSchema = z.object({
  _id: z.string(),
  authorId: z.string(),
  teacherStaffId: z.string(),
  content: z.string(),
  imageUrls: z.array(z.string()),
  tags: z.object({
    skillIds: z.array(z.string()),
    actionPlanIds: z.array(z.string()),
    actionStepIds: z.array(z.string()),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SkillNoteDocument = z.infer<typeof SkillNoteDocumentSchema>;
