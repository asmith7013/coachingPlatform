"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { serialize, serializeMany } from "../../core/repository";
import { SkillsHubActionPlan } from "./skill-progression.model";
import { SkillsHubActionStep } from "./progression-step.model";
import {
  SkillProgressionInputSchema,
  type SkillProgressionInput,
  type SkillProgressionDocument,
} from "./skill-progression.types";
import type { ProgressionStepInput } from "./progression-step.types";

export async function getSkillProgressions(teacherStaffId: string): Promise<{
  success: boolean;
  data?: SkillProgressionDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubActionPlan.find({ teacherStaffId })
        .sort({ createdAt: -1 })
        .lean();
      const data = serializeMany<SkillProgressionDocument>(docs);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getSkillProgressions"),
      };
    }
  });
}

export async function getSkillProgressionById(planId: string): Promise<{
  success: boolean;
  data?: SkillProgressionDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const doc = await SkillsHubActionPlan.findById(planId).lean();
      if (!doc) {
        return { success: false, error: "Skill progression not found" };
      }
      const data = serialize<SkillProgressionDocument>(doc);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getSkillProgressionById"),
      };
    }
  });
}

export async function createSkillProgressionWithSteps(input: {
  plan: SkillProgressionInput;
  steps: ProgressionStepInput[];
}): Promise<{
  success: boolean;
  data?: SkillProgressionDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      const validatedPlan = SkillProgressionInputSchema.parse(input.plan);

      const plan = await SkillsHubActionPlan.create({
        ...validatedPlan,
        createdBy: authResult.data.metadata.staffId,
      });

      if (input.steps.length > 0) {
        const stepsToCreate = input.steps.map((step) => ({
          ...step,
          actionPlanId: plan._id,
        }));
        await SkillsHubActionStep.insertMany(stepsToCreate);
      }

      const data = serialize<SkillProgressionDocument>(plan.toObject());
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createSkillProgressionWithSteps"),
      };
    }
  });
}

export async function closeSkillProgression(
  planId: string,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubActionPlan.findByIdAndUpdate(planId, {
        $set: { status: "closed", closedAt: new Date() },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "closeSkillProgression"),
      };
    }
  });
}

export async function archiveSkillProgression(
  planId: string,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubActionPlan.findByIdAndUpdate(planId, {
        $set: { status: "archived" },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "archiveSkillProgression"),
      };
    }
  });
}
