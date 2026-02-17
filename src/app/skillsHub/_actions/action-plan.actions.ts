"use server";

import { withDbConnection } from "@server/db/ensure-connection";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { handleServerError } from "@error/handlers/server";
import { SkillsHubActionPlan } from "@mongoose-schema/skills-hub/action-plan.model";
import { SkillsHubActionStep } from "@mongoose-schema/skills-hub/action-step.model";
import {
  ActionPlanInputSchema,
  type ActionPlanInput,
  type ActionPlanDocument,
} from "../_types/action-plan.types";
import type { ActionStepInput } from "../_types/action-step.types";

export async function getActionPlans(teacherStaffId: string): Promise<{
  success: boolean;
  data?: ActionPlanDocument[];
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const docs = await SkillsHubActionPlan.find({ teacherStaffId })
        .sort({ createdAt: -1 })
        .lean();
      const data = docs.map((d) =>
        JSON.parse(JSON.stringify(d)),
      ) as ActionPlanDocument[];
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getActionPlans"),
      };
    }
  });
}

export async function getActionPlanById(planId: string): Promise<{
  success: boolean;
  data?: ActionPlanDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const doc = await SkillsHubActionPlan.findById(planId).lean();
      if (!doc) {
        return { success: false, error: "Action plan not found" };
      }
      const data = JSON.parse(JSON.stringify(doc)) as ActionPlanDocument;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "getActionPlanById"),
      };
    }
  });
}

export async function createActionPlanWithSteps(input: {
  plan: ActionPlanInput;
  steps: ActionStepInput[];
}): Promise<{
  success: boolean;
  data?: ActionPlanDocument;
  error?: string;
}> {
  return withDbConnection(async () => {
    try {
      const authResult = await getAuthenticatedUser();
      if (!authResult.success) {
        return { success: false, error: "Unauthorized" };
      }

      const validatedPlan = ActionPlanInputSchema.parse(input.plan);

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

      const data = JSON.parse(
        JSON.stringify(plan.toObject()),
      ) as ActionPlanDocument;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: handleServerError(error, "createActionPlanWithSteps"),
      };
    }
  });
}

export async function closeActionPlan(
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
        error: handleServerError(error, "closeActionPlan"),
      };
    }
  });
}

export async function archiveActionPlan(
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
        error: handleServerError(error, "archiveActionPlan"),
      };
    }
  });
}
