import { z } from "zod";

export const CoachTeacherAssignmentInputSchema = z.object({
  coachStaffId: z.string(),
  teacherStaffId: z.string(),
});
export type CoachTeacherAssignmentInput = z.infer<
  typeof CoachTeacherAssignmentInputSchema
>;

export const CoachTeacherAssignmentDocumentSchema = z.object({
  _id: z.string(),
  coachStaffId: z.string(),
  teacherStaffId: z.string(),
  schoolId: z.string().optional(),
  assignedAt: z.string(),
  removedAt: z.string().nullable(),
});
export type CoachTeacherAssignmentDocument = z.infer<
  typeof CoachTeacherAssignmentDocumentSchema
>;
