"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubCoachTeacherAssignment } from "./coaching-assignment.model";
import { StaffModel } from "@mongoose-schema/core/staff.model";
import {
  serialize,
  serializeMany,
  isValidObjectId,
  findStaffByRole,
  type StaffOption,
} from "../../core/repository";
import {
  CoachTeacherAssignmentInputSchema,
  type CoachTeacherAssignmentDocument,
} from "./coaching-assignment.types";

export type { StaffOption };

export async function getCoaches(): Promise<{
  success: boolean;
  data?: StaffOption[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const data = await findStaffByRole("Coach");
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getCoaches"),
      };
    }
  });
}

export async function getTeachers(): Promise<{
  success: boolean;
  data?: StaffOption[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const data = await findStaffByRole("Teacher");
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getTeachers"),
      };
    }
  });
}

export async function getCoachTeachers(coachStaffId: string): Promise<{
  success: boolean;
  data?: CoachTeacherAssignmentDocument[];
  error?: string;
}> {
  if (!isValidObjectId(coachStaffId)) {
    return { success: true, data: [] };
  }

  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubCoachTeacherAssignment.find({
        coachStaffId,
        removedAt: null,
      })
        .populate("teacherStaffId", "staffName email")
        .lean();
      const data = serializeMany<CoachTeacherAssignmentDocument>(docs);
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
  if (!isValidObjectId(teacherStaffId)) {
    return { success: true, data: [] };
  }

  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubCoachTeacherAssignment.find({
        teacherStaffId,
        removedAt: null,
      })
        .populate("coachStaffId", "staffName email")
        .lean();
      const data = serializeMany<CoachTeacherAssignmentDocument>(docs);
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
      });

      // Auto-derive school from the teacher's record
      const teacher = (await StaffModel.findById(validated.teacherStaffId)
        .select("schoolIds")
        .lean()) as { schoolIds?: string[] } | null;
      const schoolId =
        teacher &&
        Array.isArray(teacher.schoolIds) &&
        teacher.schoolIds.length > 0
          ? String(teacher.schoolIds[0])
          : undefined;

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

      const doc = await SkillsHubCoachTeacherAssignment.create({
        ...validated,
        schoolId,
      });
      const data = serialize<CoachTeacherAssignmentDocument>(doc.toObject());
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "assignTeacher"),
      };
    }
  });
}

export async function createStaffMember(data: {
  staffName: string;
  email: string;
  role: "Teacher" | "Coach";
  schoolId?: string;
}): Promise<{ success: boolean; data?: StaffOption; error?: string }> {
  return withDbConnection(async () => {
    try {
      const { staffName, email, role, schoolId } = data;

      if (!staffName.trim() || !email.trim()) {
        return { success: false, error: "Name and email are required" };
      }

      // Check for duplicate email
      const existing = await StaffModel.findOne({ email: email.trim() });
      if (existing) {
        return {
          success: false,
          error: "A staff member with this email already exists",
        };
      }

      const doc = await StaffModel.create({
        staffName: staffName.trim(),
        email: email.trim(),
        roles: [role],
        schoolIds: schoolId ? [schoolId] : [],
        gradeLevelsSupported: [],
        subjects: [],
        specialGroups: [],
      });

      // Create Clerk user so they can sign in via magic link
      try {
        const nameParts = staffName.trim().split(" ");
        const clerk = await clerkClient();
        await clerk.users.createUser({
          emailAddress: [email.trim()],
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || undefined,
          skipPasswordRequirement: true,
          publicMetadata: {
            staffId: doc._id.toString(),
            staffType: "nycps",
            roles: [role],
            schoolIds: schoolId ? [schoolId] : [],
            onboardingCompleted: true,
          },
        });
      } catch (clerkError: unknown) {
        // Log but don't fail — the MongoDB record is still valid.
        // Common case: Clerk user already exists for this email.
        console.error(
          "[createStaffMember] Clerk user creation failed:",
          clerkError instanceof Error ? clerkError.message : clerkError,
        );
      }

      const staff = serialize<StaffOption>(doc.toObject());
      return { success: true, data: staff };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createStaffMember"),
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
