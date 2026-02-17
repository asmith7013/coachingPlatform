"use server";

import { CapWeeklyPlanModel } from "@mongoose-schema/cap/cap-weekly-plan.model";
import {
  CapWeeklyPlanZodSchema,
  CapWeeklyPlanInputZodSchema,
  type CapWeeklyPlan,
  type CapWeeklyPlanInput,
} from "@zod-schema/cap/cap-weekly-plan";
import { createCrudActions } from "@server/crud/crud-factory";
import { withDbConnection } from "@server/db/ensure-connection";
import { QueryParams, DEFAULT_QUERY_PARAMS } from "@core-types/query";
import { ZodType } from "zod";

// Create actions internally (not exported)
const capWeeklyPlanActions = createCrudActions({
  model: CapWeeklyPlanModel,
  schema: CapWeeklyPlanZodSchema as ZodType<CapWeeklyPlan>,
  inputSchema: CapWeeklyPlanInputZodSchema,
  name: "CAP Weekly Plan",
  revalidationPaths: ["/dashboard/coaching-action-plans"],
  sortFields: ["date", "cycleNumber", "visitNumber", "sortOrder", "createdAt"],
  defaultSortField: "visitNumber",
  defaultSortOrder: "asc",
});

// Export only async functions
export async function fetchCapWeeklyPlans(
  params: QueryParams = DEFAULT_QUERY_PARAMS,
) {
  return withDbConnection(() => capWeeklyPlanActions.fetch(params));
}

export async function fetchCapWeeklyPlansByCapId(capId: string) {
  return withDbConnection(() =>
    capWeeklyPlanActions.fetch({
      ...DEFAULT_QUERY_PARAMS,
      filters: { capId },
    }),
  );
}

export async function fetchCapWeeklyPlanById(id: string) {
  return withDbConnection(() => capWeeklyPlanActions.fetchById(id));
}

export async function createCapWeeklyPlan(data: CapWeeklyPlanInput) {
  return withDbConnection(() => capWeeklyPlanActions.create(data));
}

export async function updateCapWeeklyPlan(
  id: string,
  data: Partial<CapWeeklyPlanInput>,
) {
  return withDbConnection(() => capWeeklyPlanActions.update(id, data));
}

export async function deleteCapWeeklyPlan(id: string) {
  return withDbConnection(() => capWeeklyPlanActions.delete(id));
}
