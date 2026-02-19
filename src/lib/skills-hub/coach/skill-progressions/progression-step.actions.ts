"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubActionStep } from "./progression-step.model";
import {
  ProgressionStepInputSchema,
  type ProgressionStepInput,
  type ProgressionStepDocument,
} from "./progression-step.types";

export async function getProgressionSteps(actionPlanId: string): Promise<{
  success: boolean;
  data?: ProgressionStepDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubActionStep.find({ actionPlanId })
        .sort({ createdAt: 1 })
        .lean();
      const data = docs.map((d) =>
        JSON.parse(JSON.stringify(d)),
      ) as ProgressionStepDocument[];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getProgressionSteps"),
      };
    }
  });
}

export async function createProgressionStep(
  input: ProgressionStepInput,
): Promise<{
  success: boolean;
  data?: ProgressionStepDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const validated = ProgressionStepInputSchema.parse(input);
      const doc = await SkillsHubActionStep.create(validated);
      const data = JSON.parse(
        JSON.stringify(doc.toObject()),
      ) as ProgressionStepDocument;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createProgressionStep"),
      };
    }
  });
}

export async function completeProgressionStep(
  stepId: string,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      await SkillsHubActionStep.findByIdAndUpdate(stepId, {
        $set: {
          completed: true,
          completedAt: new Date(),
          completedBy: authResult.data.metadata.staffId,
        },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "completeProgressionStep"),
      };
    }
  });
}

export async function updateProgressionStep(
  stepId: string,
  input: Partial<ProgressionStepInput>,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubActionStep.findByIdAndUpdate(stepId, { $set: input });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "updateProgressionStep"),
      };
    }
  });
}
