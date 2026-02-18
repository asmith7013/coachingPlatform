"use server";

import mongoose from "mongoose";
import { clerkClient } from "@clerk/nextjs/server";
import { withDbConnection } from "@server/db/ensure-connection";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubCoachTeacherAssignment } from "@mongoose-schema/skills-hub/coach-teacher-assignment.model";
import { NYCPSStaffModel } from "@mongoose-schema/core/staff.model";
import {
  CoachTeacherAssignmentInputSchema,
  type CoachTeacherAssignmentDocument,
} from "../_types/assignment.types";

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export interface StaffOption {
  _id: string;
  staffName: string;
  email?: string;
  schoolIds?: string[];
}


export async function getCoaches(): Promise<{
  success: boolean;
  data?: StaffOption[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await NYCPSStaffModel.find({
        rolesNYCPS: "Coach",
      })
        .select("staffName email schoolIds")
        .sort({ staffName: 1 })
        .lean();
      const data = docs.map((d: Record<string, unknown>) =>
        JSON.parse(JSON.stringify(d)),
      ) as StaffOption[];
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
      const docs = await NYCPSStaffModel.find({
        rolesNYCPS: "Teacher",
      })
        .select("staffName email schoolIds")
        .sort({ staffName: 1 })
        .lean();
      const data = docs.map((d: Record<string, unknown>) =>
        JSON.parse(JSON.stringify(d)),
      ) as StaffOption[];
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
      const existing = await NYCPSStaffModel.findOne({ email: email.trim() });
      if (existing) {
        return {
          success: false,
          error: "A staff member with this email already exists",
        };
      }

      const doc = await NYCPSStaffModel.create({
        staffName: staffName.trim(),
        email: email.trim(),
        rolesNYCPS: [role],
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

      const staff: StaffOption = {
        _id: doc._id.toString(),
        staffName: doc.staffName,
        email: doc.email,
        schoolIds: doc.schoolIds?.map((id: mongoose.Types.ObjectId) =>
          id.toString(),
        ),
      };
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
