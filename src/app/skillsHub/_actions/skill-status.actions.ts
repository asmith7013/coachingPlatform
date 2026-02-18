"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubTeacherSkillStatus } from "@mongoose-schema/skills-hub";
import {
  SkillStatusEnum,
  type SkillStatus,
  type TeacherSkillStatusDocument,
} from "../_types/skill-status.types";

export async function getTeacherSkillStatuses(teacherStaffId: string): Promise<{
  success: boolean;
  data?: TeacherSkillStatusDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubTeacherSkillStatus.find({
        teacherStaffId,
      }).lean();
      const data = docs.map((d) =>
        JSON.parse(JSON.stringify(d)),
      ) as TeacherSkillStatusDocument[];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getTeacherSkillStatuses"),
      };
    }
  });
}

export async function updateSkillStatus(
  teacherStaffId: string,
  skillId: string,
  status: SkillStatus,
): Promise<{
  success: boolean;
  data?: TeacherSkillStatusDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      const parsed = SkillStatusEnum.parse(status);

      const doc = await SkillsHubTeacherSkillStatus.findOneAndUpdate(
        { teacherStaffId, skillId },
        {
          $set: {
            status: parsed,
            updatedBy: authResult.data.metadata.staffId || null,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            teacherStaffId,
            skillId,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );

      const data = JSON.parse(
        JSON.stringify(doc.toObject()),
      ) as TeacherSkillStatusDocument;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "updateSkillStatus"),
      };
    }
  });
}

export async function bulkUpdateSkillStatuses(
  teacherStaffId: string,
  updates: { skillId: string; status: SkillStatus }[],
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      const ops = updates.map((u) => ({
        updateOne: {
          filter: { teacherStaffId, skillId: u.skillId },
          update: {
            $set: {
              status: SkillStatusEnum.parse(u.status),
              updatedBy: authResult.data.metadata.staffId || null,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              teacherStaffId,
              skillId: u.skillId,
            },
          },
          upsert: true,
        },
      }));

      await SkillsHubTeacherSkillStatus.bulkWrite(ops);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "bulkUpdateSkillStatuses"),
      };
    }
  });
}
