"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubActionStep } from "./action-step.model";
import {
  ActionStepInputSchema,
  type ActionStepInput,
  type ActionStepDocument,
} from "./action-step.types";

export async function getActionSteps(actionPlanId: string): Promise<{
  success: boolean;
  data?: ActionStepDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubActionStep.find({ actionPlanId })
        .sort({ createdAt: 1 })
        .lean();
      const data = docs.map((d) =>
        JSON.parse(JSON.stringify(d)),
      ) as ActionStepDocument[];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getActionSteps"),
      };
    }
  });
}

export async function createActionStep(input: ActionStepInput): Promise<{
  success: boolean;
  data?: ActionStepDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const validated = ActionStepInputSchema.parse(input);
      const doc = await SkillsHubActionStep.create(validated);
      const data = JSON.parse(
        JSON.stringify(doc.toObject()),
      ) as ActionStepDocument;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createActionStep"),
      };
    }
  });
}

export async function completeActionStep(
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
        error: handleServerError(error, "completeActionStep"),
      };
    }
  });
}

export async function updateActionStep(
  stepId: string,
  input: Partial<ActionStepInput>,
): Promise<{ success: boolean; error?: string }> {
  return withDbConnection(async () => {
    try {
      await SkillsHubActionStep.findByIdAndUpdate(stepId, { $set: input });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "updateActionStep"),
      };
    }
  });
}
