"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubCoachTeacherAssignment } from "@mongoose-schema/skills-hub/coach-teacher-assignment.model";
import {
  CoachTeacherAssignmentInputSchema,
  type CoachTeacherAssignmentDocument,
} from "../_types/assignment.types";

export async function getCoachTeachers(coachStaffId: string): Promise<{
  success: boolean;
  data?: CoachTeacherAssignmentDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubCoachTeacherAssignment.find({
        coachStaffId,
        removedAt: null,
      })
        .populate("teacherStaffId", "staffName email")
        .populate("schoolId", "schoolName")
        .lean();
      const data = docs.map((d) =>
        JSON.parse(JSON.stringify(d)),
      ) as CoachTeacherAssignmentDocument[];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getCoachTeachers"),
      };
    }
  });
}

export async function getTeacherCoaches(teacherStaffId: string): Promise<{
  success: boolean;
  data?: CoachTeacherAssignmentDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubCoachTeacherAssignment.find({
        teacherStaffId,
        removedAt: null,
      })
        .populate("coachStaffId", "staffName email")
        .lean();
      const data = docs.map((d) =>
        JSON.parse(JSON.stringify(d)),
      ) as CoachTeacherAssignmentDocument[];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getTeacherCoaches"),
      };
    }
  });
}

export async function assignTeacher(
  coachStaffId: string,
  teacherStaffId: string,
  schoolId: string,
): Promise<{
  success: boolean;
  data?: CoachTeacherAssignmentDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const validated = CoachTeacherAssignmentInputSchema.parse({
        coachStaffId,
        teacherStaffId,
        schoolId,
      });

      // Check for existing active assignment
      const existing = await SkillsHubCoachTeacherAssignment.findOne({
        coachStaffId: validated.coachStaffId,
        teacherStaffId: validated.teacherStaffId,
        removedAt: null,
      });

      if (existing) {
        return {
          success: false,
          error: "This teacher is already assigned to this coach",
        };
      }

      const doc = await SkillsHubCoachTeacherAssignment.create(validated);
      const data = JSON.parse(
        JSON.stringify(doc.toObject()),
      ) as CoachTeacherAssignmentDocument;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "assignTeacher"),
      };
    }
  });
}

export async function removeAssignment(
  assignmentId: string,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubCoachTeacherAssignment.findByIdAndUpdate(assignmentId, {
        $set: { removedAt: new Date() },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "removeAssignment"),
      };
    }
  });
}
