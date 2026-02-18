import { z } from "zod";

export const SkillStatusEnum = z.enum([
  "not_started",
  "active",
  "developing",
  "proficient",
]);
export type SkillStatus = z.infer<typeof SkillStatusEnum>;

export const TeacherSkillStatusInputSchema = z.object({
  skillId: z.string(),
  status: SkillStatusEnum,
});
export type TeacherSkillStatusInput = z.infer<
  typeof TeacherSkillStatusInputSchema
>;

export const TeacherSkillStatusDocumentSchema = z.object({
  _id: z.string(),
  teacherStaffId: z.string(),
  skillId: z.string(),
  status: SkillStatusEnum,
  updatedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TeacherSkillStatusDocument = z.infer<
  typeof TeacherSkillStatusDocumentSchema
>;
