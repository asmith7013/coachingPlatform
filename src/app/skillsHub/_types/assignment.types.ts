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
  schoolId: z.string().nullable().optional(),
  assignedAt: z.string(),
  removedAt: z.string().nullable(),
});
export type CoachTeacherAssignmentDocument = z.infer<
  typeof CoachTeacherAssignmentDocumentSchema
>;

export interface PopulatedTeacher {
  _id: string;
  staffName: string;
  email?: string;
}

export interface PopulatedAssignment
  extends Omit<CoachTeacherAssignmentDocument, "teacherStaffId"> {
  teacherStaffId: PopulatedTeacher | string;
}
